(function () {
    "use strict";

    function fetch(swUri, swRespType) {
        var resp = {
            url: swUri
        };
        if (swRespType && typeof swRespType === 'string' && swRespType.length > 0) {
            resp["responseType"] = swRespType;
        }
        return WinJS.xhr(resp);
    }

    extern({ fetch: fetch });
})();