chrome.downloads.onDeterminingFilename.addListener(onDetermine);

let toggleSwitch = false;
let titleLength = 100;

// Wrapper function for changeFileName, so we can safely add or remove listeners to it
// Send message to get current tab artist name for specific sites
function onDetermine(downloadItem, suggest) {
  chrome.storage.local.get("toggleSwitch", (result) => {
    toggleSwitch = result.toggleSwitch ?? false;

    if (!toggleSwitch) {
      suggest();
      return false;
    }
    sendChangeAccordingToSite(downloadItem, suggest);
  });
  return true;
}

// Send message to content script, which will fetch the downloaded images profile name
// we use that as a suggestion and add salt it to create new title
function sendChangeAccordingToSite(downloadItem, suggest) {
  getCurrentTab().then((currentTab) => {
    chrome.tabs.sendMessage(
      currentTab.id,
      { action: "GET_PAGE_DATA" },
      (response) => {
        // Check if the content script replied
        if (chrome.runtime.lastError || !response) {
          console.log("An error occurred");
          changeFileName(downloadItem, suggest, currentTab);
        } else {
          if (response == "default") {
            changeFileName(downloadItem, suggest, currentTab);
          } else {
            changeFileName(downloadItem, suggest, currentTab, response);
          }
        }
      },
    );
  });
  return true;
}

// When changes are made to either toggle or title length, call their respective functions
// that will handle the process of change
chrome.storage.local.onChanged.addListener((changes) => {
  if (changes.titleLength) {
    getInputLength();
  }
});

function getCurrentTab() {
  let queryOptions = { active: true, lastFocusedWindow: true };
  // `tab` will either be a `tabs.Tab` instance or `undefined`.
  return chrome.tabs.query(queryOptions).then((result) => {
    let [tab] = result;
    return tab;
  });
}

function getInputLength() {
  return chrome.storage.local.get("titleLength").then((result) => {
    if (!result) {
      return (titleLength = 100);
    } else {
      return (titleLength = result.titleLength);
    }
  });
}

async function changeFileName(
  downloadItem,
  suggest,
  currentTab,
  suggestedResponse = "default",
) {
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
    .slice(0, await getInputLength());

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
  if (suggestedResponse == "default" || suggestedResponse.text == "default") {
    suggest({
      filename: safeTitle + extension,
    });
  } else {
    suggest({
      filename: `${suggestedResponse.text}-${suggestedResponse.randomSalt}${extension}`,
    });
  }
  return true;
}

// If download is from twitter and it is small compressed version, retrigger download with original version
chrome.downloads.onCreated.addListener((downloadItem) => {
  // check if its a Twitter image and NOT already the 'orig' version
  if (
    downloadItem.url.includes("pbs.twimg.com") &&
    !downloadItem.url.includes("name=orig")
  ) {
    // cancel the low-res download immediately
    chrome.downloads.cancel(downloadItem.id, () => {
      // modify the URL to request the original quality
      // this regex replaces any name=... value with name=orig
      const originalUrl = downloadItem.url.replace(/name=[^&]+/, "name=orig");

      // Erase removes it from the downloads shelf and history
      // if not erased, other listeners will try to interact with it
      chrome.downloads.erase({ id: downloadItem.id });

      // start the new download, filename is not important since we will change it
      chrome.downloads.download({
        url: originalUrl,
        filename: "temp_filename",
        conflictAction: "uniquify",
      });
    });
  }
});

// Allow the changing of download location

// Look into conditionals
// function enableRenaming() {
//   if (!chrome.downloads.onDeterminingFilename.hasListener(toggle)) {
//     chrome.downloads.onDeterminingFilename.addListener(toggle);
//   }
// }

// // Function to disable the feature
// function disableRenaming() {
//   chrome.downloads.onDeterminingFilename.removeListener(toggle);
// }
