const mainElement = document.querySelector("main");

const siteParsers = {
  "gelbooru.com": () => fetchGelbooruArtistName(),
  "x.com": () => fetchTwitterArtistName(),
};

function getSiteData() {
  const host = window.location.hostname.replace("www.", "");
  const scraper = siteParsers[host];
  if (scraper) {
    return scraper();
  } else {
    return "default";
  }
}

chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.action === "GET_PAGE_DATA") {
    const artistName = getSiteData();
    console.log("artistName", artistName);

    try {
      if (artistName === "default") {
        sendResponse({ text: "default" });
      } else {
        sendResponse({
          text: artistName,
          randomSalt: randomizeTitleGenerator(),
        });
      }
    } catch (error) {
      console.error("Scraping failed:", error);
    }
  }
  // Keeps the message channel open for the response
  return true;
});
