// 有关“页面控制”模板的简介，请参阅以下文档:
// http://go.microsoft.com/fwlink/?LinkId=232511
(function () {
    "use strict";

    WinJS.UI.Pages.define("/pages/webview/webview.html", {
        // 每当用户导航至该页面时都要调用此函数。它
        // 使用应用程序的数据填充页面元素。
        ready: function (element, options) {
            var webview = document.getElementById("webview-feedviewer");
            if (webview && options.key.url) {
                webview.src = options.key.url;
            } else {
                WinJS.Navigation.back();
            }
            // TODO: 在此处初始化页面。
        },

        unload: function () {
            // TODO: 响应导航到其他页。
        },

        updateLayout: function (element) {
            /// <param name="element" domElement="true" />

            // TODO: 响应布局的更改。
        }
    });
})();
