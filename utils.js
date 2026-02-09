let twitterProfileName;
// an event listener that checks user profile names, that only works on twitter
if (
  window.location.hostname === "x.com" ||
  window.location.hostname === "twitter.com"
) {
  document.addEventListener("mousedown", (e) => {
    // find the top-level modal container
    const modal = e.target.closest('[role="dialog"]');

    if (modal) {
      // search down for the User-Name anywhere inside the modal
      const userNameContainer = modal.querySelector(
        '[data-testid="User-Name"]',
      );

      if (userNameContainer) {
        const handleSpan =
          userNameContainer.children[1]?.firstElementChild?.querySelector(
            "span",
          );

        if (handleSpan) {
          twitterProfileName = handleSpan;
          return; // Exit so we don't trigger the timeline logic
        }
      }
    }

    // if not, then fallback for Timeline clicks (standard article check)
    const timelineTweet = e.target.closest('[data-testid="tweet"]');
    if (timelineTweet) {
      // the below looks confusing, but it just navigating the divs to lookup UserName from the tweet
      // element, then find the span, which contains the username
      const handleSpan = timelineTweet
        .querySelector('[data-testid="User-Name"]')
        ?.children[1]?.firstElementChild?.querySelector("span");

      if (handleSpan) {
        twitterProfileName = handleSpan;
      }
    }
  });
}

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}
// Randomly generate some string with variable length to put after file names
function randomizeTitleGenerator() {
  const letters = Array.from({ length: 26 }, (_, i) =>
    String.fromCharCode(97 + i),
  ); // a-z
  const caps = Array.from({ length: 26 }, (_, i) =>
    String.fromCharCode(65 + i),
  ); // A-Z
  const numbers = Array.from({ length: 10 }, (_, i) => i.toString()); // 0-9

  const titlePool = [...letters, ...caps, ...numbers];
  let randomlyGeneratedTitle = "";

  for (let i = 0; i < 30; i++) {
    randomlyGeneratedTitle = randomlyGeneratedTitle.concat(
      "",
      titlePool[getRandomInt(62)],
    );
  }
  return randomlyGeneratedTitle;
}

function fetchGelbooruArtistName() {
  const artistName = document.querySelector(
    "#tag-list > li.tag-type-artist > a",
  );
  return artistName.innerText;
}

function fetchTwitterArtistName() {
  if (twitterProfileName) {
    // Checking for object here to verify if variable contains HTML tag and therefore innerText
    // If variable is already string, then there is no need to assign innerText
    // Also, if there is an album and a second download triggers, the twitter event listener would
    // only run once and twitterProfileName would stay same as the previous profile name, without @
    // so there is also no need to remove that
    if (
      typeof twitterProfileName == "object" &&
      twitterProfileName.innerText.slice(0, 1) == "@"
    ) {
      twitterProfileName = twitterProfileName.innerText.slice(1);
    }

    return twitterProfileName;
  } else {
    return null;
  }
}
