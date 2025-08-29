(function () {
    "use strict";

    function extern(cPFuncs, cDirection) {
        if (!cDirection) { cDirection = window; }
        if (typeof cPFuncs == "function") {
            cDirection[cPFuncs.name] = cPFuncs;
        } else if (cPFuncs instanceof Array) {
            for (var i = 0; i < cPFuncs.length; i++) {
                cDirection[cPFuncs[i].name] = cPFuncs[i];
            }
        } else {
            var keys = Object.keys(cPFuncs);
            for (var i = 0; i < keys.length; i++) {
                cDirection[keys[i]] = cPFuncs[keys[i]];
            }
        }
    }

    extern({
        extern: extern
    });
})();