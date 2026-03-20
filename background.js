chrome.downloads.onDeterminingFilename.addListener(onDetermine);

// A registry of IDs that we have intentionally canceled
const canceledDownloads = new Set();

let toggleSwitch = false;
let titleLength = 100;
// Store the timestamp when the background script/service worker starts
// This is needed to prevent download onCreated from running for older downloads
const sessionStartTime = Date.now();

// Wrapper function for changeFileName, so we can safely add or remove listeners to it
// Send message to get current tab artist name for specific sites
function onDetermine(downloadItem, suggest) {
  // If the ID is in our cancel list, bail out immediately
  if (canceledDownloads.has(downloadItem.id)) {
    suggest();
    canceledDownloads.delete(downloadItem.id);
    return;
  }

  // Fetch toggle switch from local storage
  // this will decide whether the extension gets triggered or not
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
        console.log("response", response);
        console.log("suggest", suggest);

        // Check if the content script replied
        if (chrome.runtime.lastError || response == null) {
          console.log("An error occurred");
          changeFileName(downloadItem, suggest, currentTab);
        } else {
          if (response.text == "default") {
            console.log("Default call");

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
  // suggestedResponse is the fetched author name meanwhile safeTitle is currentTab title
  if (suggestedResponse == "default" || suggestedResponse.text == "default") {
    suggest({
      filename: `NamedDownloads/${safeTitle}${extension}`,
    });
  } else {
    suggest({
      filename: `NamedDownloads/${suggestedResponse.text}-${suggestedResponse.randomSalt}${extension}`,
    });
  }
  return true;
}

// If download is from twitter and it is small compressed version, retrigger download with original version
chrome.downloads.onCreated.addListener(async (downloadItem) => {
  // If toggle is off, then there is no need to check time, name or quality or anything else
  // Doing so will only hinder ordinary downloads, preventing file location selection
  const result = await chrome.storage.local.get("toggleSwitch");
  toggleSwitch = result.toggleSwitch ?? false;
  if (!toggleSwitch) {
    return;
  }

  const itemDate = new Date(downloadItem.startTime).getTime();

  // If the download started before this extension session, ignore it immediately
  // When the download awakens the listener, the sessionStartTime might fall behind, so a grace period is added
  if (itemDate < sessionStartTime - 5000) {
    return;
  }

  // check if its a Twitter image and NOT already the 'orig' version
  if (
    downloadItem.url.includes("pbs.twimg.com") &&
    !downloadItem.url.includes("name=orig")
  ) {
    // Mark this ID as "to be ignored"
    canceledDownloads.add(downloadItem.id);

    // cancel the low-res download immediately
    chrome.downloads.cancel(downloadItem.id, () => {
      if (chrome.runtime.lastError) {
        console.error("Cancel failed:", chrome.runtime.lastError.message);
        return;
      }

      // Erase removes it from the downloads shelf and history
      // if not erased, other listeners will try to interact with it
      chrome.downloads.erase({ id: downloadItem.id }, (erasedID) => {
        if (chrome.runtime.lastError) {
          console.error("Erase failed:", chrome.runtime.lastError.message);
        }
      });
    });

    // modify the URL to request the original quality
    // this regex replaces any name=... value with name=orig
    const origQualityUrl = downloadItem.url.replace(/name=[^&]+/, "name=orig");

    // start the new download, filename is not important since we will change it
    chrome.downloads.download({
      url: origQualityUrl,
      filename: "temp_filename",
      conflictAction: "uniquify",
    });
  }
});

// Allow the changing of download location
// For some reason, in incognito mode, the bug happens

// Download videos
// download location does not show on twitter

// The bug is happening specifically in some websites, it seems like suggest is being called without a download starting

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
