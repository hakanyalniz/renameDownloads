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
  return artistName;
}

function fetchTwitterArtistName() {
  if (twitterProfileName) {
    return twitterProfileName;
  } else {
    return null;
  }
}
