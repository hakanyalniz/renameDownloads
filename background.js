async function getCurrentTab() {
  let queryOptions = { active: true, lastFocusedWindow: true };
  // `tab` will either be a `tabs.Tab` instance or `undefined`.
  let [tab] = await chrome.tabs.query(queryOptions);
  return tab;
}

chrome.runtime.onMessage.addListener((message, _sender, _sendResponse) => {
  // Turn the extension on or off by switch
  // if off, then use default name
  if (message.type === "enable") {
    chrome.downloads.onDeterminingFilename.addListener(changeFileName);
  } else if (message.type === "disable") {
    chrome.downloads.onDeterminingFilename.removeListener(changeFileName);
  }
});

function changeFileName(downloadItem, suggest) {
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
}

// Make title more customizable

// The problem: A lot of lag when first used among others.

// Finals thoughts: The problem occurs when a switch happens between inactive and active, it would make sense for this to happen,
// though it would be puzzling still, if the download listener was on. But that is seemingly not so, it seems a second problem is that,
// there is a mismatch between when the listener is active or not. Another problem entirely is that, even when the listener is on,
// and the extension turns active, at times, the file name still does not change.
