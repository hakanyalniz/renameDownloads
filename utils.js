let twitterProfileName;
// an event listener that checks user profile names, that only works on twitter
if (
  window.location.hostname === "x.com" ||
  window.location.hostname === "twitter.com"
) {
  document.addEventListener("contextmenu", (e) => {
    // find the entire tweet container first
    const tweetCell = e.target.closest('[data-testid="cellInnerDiv"]');

    if (!tweetCell) return; // Click was outside a tweet

    // jump to the User-Name landmark, which all tweets contain
    const userNameContainer = tweetCell.querySelector(
      '[data-testid="User-Name"]',
    );

    if (userNameContainer) {
      // get the second child div, which contains the name and timestamp
      // then grab the first div of that divs child, which contains just the name
      const secondChildDiv = userNameContainer.children[1];
      const profileChildDiv = secondChildDiv.firstElementChild;

      if (profileChildDiv) {
        // look for the span within this second div, which is where the name is written
        const targetSpan = profileChildDiv.querySelector("span");

        if (targetSpan) {
          // This contains the "@handle" or the "·" separator

          twitterProfileName = targetSpan;
        }
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
