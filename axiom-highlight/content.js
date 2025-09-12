function isValidContractSearch(href) {
  try {
    const url = new URL(href);
    const q = url.searchParams.get("q") || "";
    // Accept only long alphanumeric strings (30+ chars)
    return /^[a-z0-9]{30,}$/i.test(q);
  } catch {
    return false;
  }
}

function highlightCoins() {
  const cards = document.querySelectorAll("div.w-full.flex.flex-col");

  cards.forEach(card => {
    try {
      // 1. Dev age
      const devAgeEl = card.querySelector("span.text-textSecondary");
      if (!devAgeEl) return;
      const devAgeText = devAgeEl.innerText.trim();

      let devAgeMonths = 0;
      if (devAgeText.endsWith("y")) {
        devAgeMonths = parseInt(devAgeText) * 12;
      } else if (devAgeText.endsWith("mo")) {
        devAgeMonths = parseInt(devAgeText);
      }

      // 2. Collect all possible link-like values
      const nodes = [...card.querySelectorAll("a, div, span, button")];
      const links = nodes
        .map(el => el.href || el.dataset?.href || el.getAttribute?.("href") || el.innerText || "")
        .map(x => x.toLowerCase());

      console.log("Card:", card.innerText.slice(0, 30), "Links:", links);

      // 3. Only allow contract search-style links
      const xSearchLinks = links.filter(l => l.includes("x.com/search?q=") && isValidContractSearch(l));

      // 4. Reject if ANY other socials
      const invalidSocial = links.some(l => {
        if (isValidContractSearch(l)) return false; // valid CA-style search allowed
        if (l.includes("x.com")) return true;      // any other X/Twitter link is invalid
        if (l.includes("twitter.com")) return true;
        if (l.includes("instagram.com")) return true;
        if (l.includes("tiktok.com")) return true;
        return false;
      });

      // 5. Highlight rule
      if (!invalidSocial && xSearchLinks.length > 0 && devAgeMonths >= 6) {
        if (!card.classList.contains("coin-highlight")) {
          card.classList.add("coin-highlight");
          console.log("✅ Highlighted:", card.innerText.slice(0, 60));
        }
      } else {
        card.classList.remove("coin-highlight");
        console.log("❌ Skipped:", card.innerText.slice(0, 30));
      }
    } catch (e) {
      console.error("Error processing card:", e);
    }
  });
}

// Run on load + every 5s
window.addEventListener("load", () => {
  highlightCoins();
  setInterval(highlightCoins, 5000);
});
