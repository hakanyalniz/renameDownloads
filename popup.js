document.addEventListener("DOMContentLoaded", async () => {
  const switchButton = document.getElementById("switch-button");
  const indicatorBox = document.getElementById("switch-indicator");

  // Get the switch from local storage to update to current state
  const toggleSwitch = localStorage.getItem("toggleSwitch") === "true";

  sendChromeMessage(switchButton, indicatorBox);
  updateIndicator(indicatorBox, toggleSwitch);
});

function sendChromeMessage(switchButton, indicatorBox) {
  switchButton.addEventListener("click", async () => {
    const toggleSwitch = localStorage.getItem("toggleSwitch") === "true";

    // Send the message, enabling or disabling according to toggle
    chrome.runtime.sendMessage({ type: !toggleSwitch ? "enable" : "disable" });

    // Update local storage
    localStorage.setItem("toggleSwitch", String(!toggleSwitch));
    // it is inverted, because we just clicked the switch
    updateIndicator(indicatorBox, !toggleSwitch);
  });
}

function updateIndicator(indicatorBox, toggleSwitch) {
  // Switch the color of the indicator when toggled
  indicatorBox.style.backgroundColor = toggleSwitch ? "green" : "red";
}
