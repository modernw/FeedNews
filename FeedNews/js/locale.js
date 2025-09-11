(function () {
    "use strict";
    function getLocaleStringFromResId(uResId) {
        var resstring = "MessageBox.";
        switch (uResId) {
            case 800: resstring += "OK"; break;
            case 801: resstring += "Cancel"; break;
            case 802: resstring += "Abort"; break;
            case 803: resstring += "Retry"; break;
            case 804: resstring += "Ignore"; break;
            case 805: resstring += "Yes"; break;
            case 806: resstring += "No"; break;
            case 807: resstring += "Close"; break;
            case 808: resstring += "Help"; break;
            case 809: resstring += "TryAgain"; break;
            case 810: resstring += "Continue"; break;
        }
        try {
            var str = WinJS.Resources.getString(resstring);
            str = str ? str.value : "";
            return str;
        } catch (e) { }
        return "";
    }
    function getStringFromResource(swResourceId) {
        try {
            var str = WinJS.Resources.getString(swResourceId);
            str = str ? str.value : "";
            return str;
        } catch (e) { } return "";
    }
    extern({
        GetLocaleStringFromResId: getLocaleStringFromResId,
        rcString: getStringFromResource
    });
})();