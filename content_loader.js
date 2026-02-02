const siteParsers = {
  "gelbooru.com": () => fetchGelbooruArtistName(),
};

function getSiteData() {
  const host = window.location.hostname.replace("www.", "");
  const scraper = siteParsers[host];
  return scraper();
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "GET_PAGE_DATA") {
    const artistName = getSiteData();
    console.log(artistName);

    sendResponse({ text: artistName });
  }
  // Keeps the message channel open for the response
  return true;
});
