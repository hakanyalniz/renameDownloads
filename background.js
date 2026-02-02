let titleLength = 100;

// Wrapper function for changeFileName, so we can safely add or remove listeners to it
function onDetermine(downloadItem, suggest) {
  testingSpecifiSite();
  changeFileName(downloadItem, suggest);
  return true;
}

chrome.runtime.onStartup.addListener(() => {
  checkToggle();
});

// A manual check, in case the browser crashes and needs to load extensions again
// this will make sure that the toggleSwitch is properly set up
checkToggle();

// When changes are made to either toggle or title length, call their respective functions
// that will handle the process of change
chrome.storage.local.onChanged.addListener((changes) => {
  if (changes.toggleSwitch) {
    checkToggle();
  } else if (changes.titleLength) {
    getInputLength();
  }
});

// After fetching toggleSwitch, add or remove listener based on its boolean value
function checkToggle() {
  let toggleSwitch;
  chrome.storage.local.get("toggleSwitch", (result) => {
    console.log(result.toggleSwitch);

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

function getInputLength() {
  chrome.storage.local.get("titleLength").then((result) => {
    if (!result) {
      titleLength = 100;
    } else {
      titleLength = result.titleLength;
    }
  });
}

function testingSpecifiSite() {
  getCurrentTab().then((currentTab) => {
    chrome.tabs.sendMessage(
      currentTab.id,
      { action: "GET_PAGE_DATA" },
      (response) => {
        console.log(response);

        // Check if the content script replied
        if (chrome.runtime.lastError || !response) {
          console.log(
            "Could not reach content script. Fallback to tab title:",
            currentTab.title,
          );
        } else {
          console.log("Extracted Text:", response.text);
        }
      },
    );
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
      .slice(0, titleLength);

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

// Bug, if extension is reset and it is toggled on, the listener doesnt get attached for some reason
