(function () {
    "use strict";
    function getDpiScale() {
        var displayInfo = Windows.Graphics.Display.DisplayInformation.getForCurrentView();
        switch (displayInfo.resolutionScale) {
            case Windows.Graphics.Display.ResolutionScale.scale100Percent: return 100;
            case Windows.Graphics.Display.ResolutionScale.scale120Percent: return 120;
            case Windows.Graphics.Display.ResolutionScale.scale140Percent: return 140;
            case Windows.Graphics.Display.ResolutionScale.scale150Percent: return 150;
            case Windows.Graphics.Display.ResolutionScale.scale160Percent: return 160;
            case Windows.Graphics.Display.ResolutionScale.scale180Percent: return 180;
            case Windows.Graphics.Display.ResolutionScale.scale225Percent: return 225;
            case Windows.Graphics.Display.ResolutionScale.invalid:
            default:
        }
        return 100;
    }
    extern({
        DPI: new function () {
            if (this._instance) return this._instance;
            else this._instance = this;
            // 100 ~
            Object.defineProperty(this, "scale", {
                get: getDpiScale
            });
            // 1 ~
            Object.defineProperty(this, "fscale", {
                get: function () {
                    return getDpiScale() / 100;
                }
            });
            // ~ 96 ~
            Object.defineProperty(this, "dpi", {
                get: function () {
                    return Windows.Graphics.Display.DisplayInformation.getForCurrentView().logicalDpi;
                }
            })
            return this;
        }
    });
})();