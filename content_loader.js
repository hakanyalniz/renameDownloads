const siteParsers = {
  "gelbooru.com": () => fetchGelbooruArtistName(),
  "x.com": () => fetchTwitterArtistName(),
};

function getSiteData() {
  const host = window.location.hostname.replace("www.", "");
  const scraper = siteParsers[host];
  return scraper();
}

chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  console.log("message");

  if (request.action === "GET_PAGE_DATA") {
    const artistName = getSiteData();
    console.log("artistName", artistName);

    try {
      sendResponse({ text: artistName.innerText });
    } catch (error) {
      // Send default so we can use the default title in case an error occured
      sendResponse({ text: "default" });
      console.error("Scraping failed:", error);
    }
  }
  // Keeps the message channel open for the response
  return true;
});
