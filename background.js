const extensionSwitch = true;

async function getCurrentTab() {
  let queryOptions = { active: true, lastFocusedWindow: true };
  // `tab` will either be a `tabs.Tab` instance or `undefined`.
  let [tab] = await chrome.tabs.query(queryOptions);
  return tab;
}

chrome.downloads.onDeterminingFilename.addListener((downloadItem, suggest) => {
  getCurrentTab().then((currentTab) => {
    // If the tab cannot be found or title is not found
    // or if it is undefined or title length is not enough, use default name
    if (
      !currentTab ||
      !currentTab.title ||
      currentTab === undefined ||
      currentTab.title.length <= 0
    ) {
      suggest();
      return;
    }

    // Trim the title to be useable as a file name
    // Also slice it to keep it short
    const safeTitle = currentTab.title
      .replace(/[<>:"/\\|?*]+/g, "")
      .trim()
      .slice(0, 100);

    // If safeTitle does not exist, use default name
    if (!safeTitle) {
      suggest();
      return;
    }

    // Fetches the file extension (like jpeg or png)
    const originalFilename = downloadItem.filename;
    const extension = originalFilename.includes(".")
      ? "." + originalFilename.split(".").pop()
      : "";

    // Finally suggest new file name
    suggest({
      filename: safeTitle + extension,
    });
  });

  return true;
});
