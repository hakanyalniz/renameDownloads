function fetchGelbooruArtistName() {
  const artistName = document.querySelector(
    "#tag-list > li.tag-type-artist > a",
  );
  return artistName;
}

function fetchTwitterArtistName() {
  let xpath = `//*[starts-with(@id, 'id__')]/div[2]/div/div/a/div/span`;
  let xpathResult = document.evaluate(
    xpath,
    document,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null,
  ).singleNodeValue;

  if (xpathResult) {
    return xpathResult;
  }

  xpath = `//*[starts-with(@id, 'id__')]/div[2]/div/div[1]/a/div/span`;
  xpathResult = document.evaluate(
    xpath,
    document,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null,
  ).singleNodeValue;

  if (xpathResult) {
    return xpathResult;
  } else {
    return null;
  }
}
