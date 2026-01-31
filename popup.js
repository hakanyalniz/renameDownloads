const button = document.getElementById("sendLength");
button.addEventListener("click", () => {
  lengthInputField();
});

document.addEventListener("DOMContentLoaded", async () => {
  const switchButton = document.getElementById("switch-button");
  const indicatorBox = document.getElementById("switch-indicator");

  // Get the switch from local storage to update the current state
  const { toggleSwitch } = await chrome.storage.local.get({
    toggleSwitch: false,
  });

  // This is for when we just clicked the popup, update the color to current toggleSwitch
  sendChromeMessage(switchButton, indicatorBox);
  updateIndicator(indicatorBox, toggleSwitch);
});

// This is for when we clicked the button, and changed the toggle indicator and the local storage
function sendChromeMessage(switchButton, indicatorBox) {
  switchButton.addEventListener("click", async () => {
    const { toggleSwitch } = await chrome.storage.local.get("toggleSwitch");

    // Update local storage
    await chrome.storage.local.set({ toggleSwitch: !toggleSwitch });

    // it is inverted, because we just clicked the switch
    updateIndicator(indicatorBox, !toggleSwitch);
  });
}

function updateIndicator(indicatorBox, toggleSwitch) {
  indicatorBox.style.backgroundColor = toggleSwitch ? "green" : "red";
}

// This is for when we use the input field for selecting rename length
function lengthInputField() {
  const input = document.getElementById("length");

  console.log(input.value, button);
  return true;
}
