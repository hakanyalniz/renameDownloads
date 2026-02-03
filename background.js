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
    changeFileName(downloadItem, suggest);
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

function changeFileName(downloadItem, suggest) {
  getCurrentTab().then(async (currentTab) => {
    // If the tab cannot be found or title is not found
    // or if it is undefined or title length is not enough, use default name
    console.log(currentTab);

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
    suggest({
      filename: safeTitle + extension,
    });
  });
  return true;
}

// Make titles more customizable

// function onDetermine(downloadItem, suggest) {
//   getCurrentTab().then((currentTab) => {
//     chrome.tabs.sendMessage(
//       currentTab.id,
//       { action: "GET_PAGE_DATA" },
//       (response) => {
//         // Check if the content script replied
//         if (chrome.runtime.lastError || !response) {
//           console.log("An error occured");
//         } else {
//           if (response == "default") {
//             changeFileName(downloadItem, suggest, currentTab);
//           } else {
//             changeFileName(downloadItem, suggest, currentTab, response.text);
//           }
//         }
//       },
//     );
//   });
//   return true;
// }

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
