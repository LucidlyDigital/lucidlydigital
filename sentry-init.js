/* Error reporting in the browser (Sentry).

   Sentry's Loader Script is a tiny file from its CDN that catches errors
   straight away and fetches the full SDK only when there is something to
   send. This file sets the configuration first, then adds the loader.

   Nothing loads on a local copy of the site. Staging and the Vercel previews
   do report, under their own environment, so they never mix with production
   issues. */

(function () {
  var PUBLIC_KEY = "88fb8449705fa82dbc294dee2edd2dd2";

  var host = location.hostname;
  if (host === "localhost" || host === "127.0.0.1" || host === "[::1]") return;

  var environment =
    host === "lucidlydigital.com" || host === "www.lucidlydigital.com" ? "production" :
    host === "staging.lucidlydigital.com" ? "staging" : "preview";

  // "/contact?ref=x" -> "/contact": no query string ever leaves the page.
  function pathOnly(url) {
    return typeof url === "string" ? url.split("?")[0].split("#")[0] : url;
  }

  // Read by the loader before it initialises the SDK.
  window.sentryOnLoad = function () {
    window.Sentry.init({
      environment: environment,
      ignoreErrors: [
        /^ResizeObserver loop/,
        /^AbortError/,
        /^Script error\.?$/,
        /^Non-Error promise rejection captured/
      ],
      denyUrls: [
        /^chrome-extension:\/\//,
        /^moz-extension:\/\//,
        /^safari-(web-)?extension:\/\//
      ],
      beforeSend: function (event) {
        if (event.request && event.request.url) event.request.url = pathOnly(event.request.url);
        var crumbs = event.breadcrumbs || [];
        for (var i = 0; i < crumbs.length; i++) {
          var d = crumbs[i].data;
          if (!d) continue;
          if (typeof d.url === "string") d.url = pathOnly(d.url);
          if (typeof d.to === "string") d.to = pathOnly(d.to);
          if (typeof d.from === "string") d.from = pathOnly(d.from);
        }
        return event;
      }
    });
  };

  var s = document.createElement("script");
  s.src = "https://js.sentry-cdn.com/" + PUBLIC_KEY + ".min.js";
  s.crossOrigin = "anonymous";
  document.head.appendChild(s);
})();
