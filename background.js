// Wrapper function for changeFileName, so we can safely add or remove listeners to it
function onDetermine(downloadItem, suggest) {
  changeFileName(downloadItem, suggest);
  return true;
}

chrome.runtime.onStartup.addListener(() => {
  checkToggle();
});

// A manual check, in case the browser crashes and needs to load extensions again
// this will make sure that the toggleSwitch is properly set up
checkToggle();

chrome.storage.local.onChanged.addListener((changes) => {
  if (changes.toggleSwitch) {
    checkToggle();
  }
});

// After fetching toggleSwitch, add or remove listener based on its boolean value
function checkToggle() {
  let toggleSwitch;
  chrome.storage.local.get("toggleSwitch", (result) => {
    toggleSwitch = result.toggleSwitch ?? false;

    if (toggleSwitch) {
      chrome.downloads.onDeterminingFilename.addListener(onDetermine);
    } else {
      chrome.downloads.onDeterminingFilename.removeListener(onDetermine);
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
