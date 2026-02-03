let twitterProfileName;
// an event listener that checks user profile names, that only works on twitter
if (
  window.location.hostname === "x.com" ||
  window.location.hostname === "twitter.com"
) {
  document.addEventListener("contextmenu", (e) => {
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
