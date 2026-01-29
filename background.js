// Wrapper function for changeFileName, so we can safely add or remove listeners to it
function onDetermine(downloadItem, suggest) {
  changeFileName(downloadItem, suggest);
  return true;
}

// When the browser is first opened, check if toggleSwitch is on or off, and add listener based on that
chrome.runtime.onStartup.addListener(() => {
  checkToggle();
});

// Catches the message from popup for the toggle change
chrome.runtime.onMessage.addListener((message, _sender, _sendResponse) => {
  if (message.type === "TOGGLE_CHANGED") {
    checkToggle();
    return true;
  }
});

// After fetching toggleSwitch, add or remove listener based on its boolean value
// Also make sure there is no listener or there is a listener before removing or adding them
function checkToggle() {
  chrome.storage.local.get("toggleSwitch").then(({ toggleSwitch }) => {
    if (toggleSwitch) {
      if (!chrome.downloads.onDeterminingFilename.hasListener(onDetermine)) {
        chrome.downloads.onDeterminingFilename.removeListener(onDetermine);
        chrome.downloads.onDeterminingFilename.addListener(onDetermine);
      }
    } else {
      if (chrome.downloads.onDeterminingFilename.hasListener(onDetermine)) {
        chrome.downloads.onDeterminingFilename.removeListener(onDetermine);
      }
    }
  });
}

function getCurrentTab() {
  let queryOptions = { active: true, lastFocusedWindow: true };
  // `tab` will either be a `tabs.Tab` instance or `undefined`.
  return chrome.tabs.query(queryOptions).then((result) => {
    let [tab] = result;
    return tab;
  });
}

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
