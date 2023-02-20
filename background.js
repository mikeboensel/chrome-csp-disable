/* global chrome */

//TODO: Expose this in a UI element
var desired_domains = ['http://localhost:*'];

/*CSP comes across as a String looking like:
*   default-src 'self'; script-src 'report-sample' 'self' www.google-analytics.com/analytics.js assets.codepen.io production-assets.codepen.io 'sha256-GA8+DpFnqAM/vwERTpb5zyLUaN5KnOhctfTsqWfhaUA=' 'sha256-uogddBLIKmJa413dyT0iPejBg3VFcO+4x6B+vw3jng0='; script-src-elem 'report-sample' 'self' www.google-analytics.com/analytics.js assets.codepen.io production-assets.codepen.io 'sha256-GA8+DpFnqAM/vwERTpb5zyLUaN5KnOhctfTsqWfhaUA=' 'sha256-uogddBLIKmJa413dyT0iPejBg3VFcO+4x6B+vw3jng0='; style-src 'report-sample' 'self' 'unsafe-inline'; object-src 'none'; base-uri 'self'; connect-src 'self' updates.developer.allizom.org updates.developer.mozilla.org www.google-analytics.com stats.g.doubleclick.net; font-src 'self'; frame-src 'self' interactive-examples.mdn.mozilla.net interactive-examples.prod.mdn.mozilla.net interactive-examples.stage.mdn.mozilla.net mdn.github.io yari-demos.prod.mdn.mozit.cloud mdn.mozillademos.org yari-demos.stage.mdn.mozit.cloud jsfiddle.net www.youtube-nocookie.com codepen.io survey.alchemer.com; img-src 'self' *.githubusercontent.com *.googleusercontent.com *.gravatar.com mozillausercontent.com firefoxusercontent.com profile.stage.mozaws.net profile.accounts.firefox.com mdn.mozillademos.org media.prod.mdn.mozit.cloud media.stage.mdn.mozit.cloud interactive-examples.mdn.mozilla.net interactive-examples.prod.mdn.mozilla.net interactive-examples.stage.mdn.mozilla.net wikipedia.org www.google-analytics.com www.gstatic.com; manifest-src 'self'; media-src 'self' archive.org videos.cdn.mozilla.net; child-src 'self'; worker-src 'self';
* Split on ";", append our desired domains to each restriction group, re-assemble the string
*/
function re_write_csp(val){
  var split = val.split(";"); 
        
  split = split.map(x => x + " " + desired_domains.join(" "));
  return split.join(";")
}

var onHeadersReceived = function (details) {
  for (var i = 0; i < details.responseHeaders.length; i++) {
    var header = details.responseHeaders[i];
    if (header.name.toLowerCase() === 'content-security-policy') {
      var val = header.value.trim();
      if (val){
        header.value = re_write_csp(val);
        console.log(`Rewrote to ${header.value}`);
        // header.value = ""; // Prior implementation or just clearing it out.
      }
    }
  }

  return {
    responseHeaders: details.responseHeaders
  };
};

var init = function () {
  // When Chrome recieves some headers
  var onHeaderFilter = { urls: ['*://*/*'], types: ['main_frame', 'sub_frame'] };
  chrome.webRequest.onHeadersReceived.addListener(
    onHeadersReceived, onHeaderFilter, ['blocking', 'responseHeaders']
  );

  // onAttached
};

init();
