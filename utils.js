function fetchGelbooruArtistName() {
  const artistName = document.querySelector(
    "#tag-list > li.tag-type-artist > a",
  );
  return artistName;
}

function fetchTwitterArtistName() {
  let artistName = document.querySelector(
    ".css-1jxf684.r-bcqeeo.r-1ttztb7.r-qvutc0.r-poiln3",
  );
  if (artistName) {
    return artistName;
  }
  artistName = document.querySelector(
    "#id__qxc58u9rpai > div.css-175oi2r.r-18u37iz.r-1wbh5a2.r-1ez5h0i > div > div.css-175oi2r.r-1wbh5a2.r-dnmrzs > a > div > span",
  );
  if (artistName) {
    return artistName;
  }
  artistName = document.querySelector(
    "#id__lvv7w8fxpe > div:nth-child(2) > div > div > a > div > span",
  );
  if (artistName) {
    return artistName;
  } else {
    return null;
  }
}

// class
// css-1jxf684 r-bcqeeo r-1ttztb7 r-qvutc0 r-poiln3
// homepage path
// document.querySelector("#id__qxc58u9rpai > div.css-175oi2r.r-18u37iz.r-1wbh5a2.r-1ez5h0i > div > div.css-175oi2r.r-1wbh5a2.r-dnmrzs > a > div > span")
// profile path
// document.querySelector("#id__lvv7w8fxpe > div:nth-child(2) > div > div > a > div > span")
