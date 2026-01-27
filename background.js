chrome.downloads.onDeterminingFilename.addListener((downloadItem, suggest) => {
  const tabId = downloadItem.tabId;

  // if the tabId cannot be fetched or found, use default name
  if (tabId === undefined || tabId < 0) {
    suggest();
    return;
  }

  chrome.tabs.get(tabId, (tab) => {
    // If the tab cannot be found or title is not found, use default name
    if (!tab || !tab.title) {
      suggest();
      return;
    }

    // Trim the title to be useable as a file name
    const safeTitle = tab.title.replace(/[<>:"/\\|?*]+/g, "").trim();

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
      conflictAction: "uniquify",
    });
  });

  return true;
});
