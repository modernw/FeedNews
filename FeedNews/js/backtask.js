(function () {
    "use strict";
    importScripts(
        "//Microsoft.WinJS.2.0/js/base.js",
        "/js/public.js",
        "/js/screen.js",
        "/js/tiletemplate.js",
        "/js/fetch.js",
        "/js/feed.js",
        "/js/feedmgr.js",
        "/js/file.js",
        "/js/uri.js",
        "/js/environment.js",
        "/js/tile.js"
    );
    backgroundTaskInstance = Windows.UI.WebUI.WebUIBackgroundTaskInstance.current;
    
})();