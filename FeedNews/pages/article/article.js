// 有关“页面控制”模板的简介，请参阅以下文档:
// http://go.microsoft.com/fwlink/?LinkId=232511
(function () {
    "use strict";
    /**
     * 通过文章 URL 获取网站根域名
     * @param {string} articleUrl 文章 URL
     * @returns {string} 网站根域名（例如 https://www.example.com）
     */
    function getWebsiteFromUrl(articleUrl) {
        if (!articleUrl) return '';
        var link = document.createElement('a');
        link.href = articleUrl;
        return link.protocol + '//' + link.hostname;
    }
    /**
     * 处理 RSS description HTML，将相对 img/src 补全为绝对 URL
     * @param {string} htmlContent RSS description HTML
     * @param {string} articleUrl 文章 URL，用于获取 base
     * @returns {HTMLElement} 处理后的 DOM 元素
     */
    function fixRssImages(htmlContent, articleUrl) {
        var container = document.createElement('div');
        container.innerHTML = htmlContent;
        var a = document.createElement('a');
        a.href = articleUrl;
        var baseUrl = a.protocol + '//' + a.hostname;
        var imgs = container.getElementsByTagName('img');
        for (var i = 0; i < imgs.length; i++) {
            var img = imgs[i];
            var src = img.getAttribute('src');
            if (src && src.indexOf('/') === 0) {
                img.src = baseUrl + src; 
            }
        }
        return container;
    }

    function getCache(swProvider, swChannel, swCategory, swUrl) {
        var CACHE_FOLDER_PATH = "Cache";
        var jsonfile = new JSONFile();
        return jsonfile.open(CACHE_FOLDER_PATH, NString.normalize(swProvider) + "-" + NString.normalize(swChannel) + "-" + NString.normalize(swCategory) + ".json")
        .then(function (complete) {
            var jdata = complete.getData().data;
            for (var i = 0; i < jdata.articles.length; i++) {
                var article = jdata.articles[i];
                if (NString.equals(article.link, swUrl) || NString.equals(article.guid, swUrl)) {
                    return { channel: jdata.channel, article: article };
                }
            }
            return null;
        }, function (error) {
            return null;
        });
    }
    WinJS.UI.Pages.define("/pages/article/article.html", {
        // 每当用户导航至该页面时都要调用此函数。它
        // 使用应用程序的数据填充页面元素。
        ready: function (element, options) {
            WinJS.UI.processAll().then(function () {
                getCache(options.key.provider, options.key.channel, options.key.category, options.key.articleurl).done(function (result) {
                    var title = document.getElementById("article-title");
                    title.textContent = result.article.title;
                    var content = document.getElementById("article-display");
                    content.innerHTML = window.toStaticHTML(fixRssImages(result.article.description, options.key.articleurl).innerHTML);
                    WinJS.UI.Animation.enterPage(content, 100);
                    (function () {
                        var table = document.createElement("table");
                        var datestr = new Date(result.article.pubdate).toLocaleString() || "";
                        var data = [
                            ["标题", result.article.title],
                            ["作者", result.article.author || result.channel.title || ""],
                            ["发布时间", datestr],
                        ]
                        for (var i = 0; i < data.length; i++) {
                            var tr = document.createElement("tr");
                            for (var j = 0; j < data[i].length; j++) {
                                var td = document.createElement("td");
                                td.textContent = data[i][j];
                                tr.appendChild(td);
                            }
                            table.appendChild(tr);
                        }
                        var tr = document.createElement("tr");
                        var td = document.createElement("td");
                        td.textContent = "频道";
                        tr.appendChild(td);
                        td = document.createElement("td");
                        var link = document.createElement("a");
                        link.href = result.channel.link;
                        link.textContent = result.channel.title;
                        td.appendChild(link);
                        table.appendChild(tr);

                        tr.appendChild(td);
                        tr = document.createElement("tr");
                        td = document.createElement("td");
                        link = document.createElement("a");
                        link.textContent = link.href = options.key.articleurl;
                        td.appendChild(link);
                        td.colSpan = 2;
                        tr.appendChild(td);
                        table.appendChild(tr);
                        content.insertBefore(table, content.firstChild);
                    })();
                    var webbutton = document.createElement("button");
                    webbutton.textContent = "在这里浏览网页";
                    webbutton.style.float = "right";
                    webbutton.addEventListener("click", function () {
                        if (!NString.empty(options.key.articleurl)) {
                            WinJS.Navigation.navigate("/pages/webview/webview.html", {
                                key: {
                                    url: options.key.articleurl
                                }
                            });
                        }
                    });
                    {
                        var ens = result.article.enclosure;
                        if (ens && ens.source) {
                            var strong = document.createElement("strong");
                            strong.textContent = "内嵌资源"
                            content.appendChild(document.createElement("br"));
                            content.appendChild(strong);
                            function getEnNode(en) {
                                var node = null;
                                if (NString.find(en.type, "audio") != -1) {
                                    var audioe = document.createElement("audio");
                                    audioe.src = en.source;
                                    audioe.controls = true;
                                    audioe.preload = "metadata";
                                    node = audioe;
                                } else if (NString.find(en.type, "video") != -1) {
                                    var videoe = document.createElement("video");
                                    videoe.src = en.source;
                                    videoe.controls = true;
                                    videoe.preload = "metadata";
                                    node = videoe;
                                } else if (NString.find(en.type, "image") != -1) {
                                    var imagee = document.createElement("img");
                                    imagee.src = en.source;
                                    node = imagee;
                                } else {
                                    node = document.createElement("object");
                                    node.data = en.source;
                                    node.type = en.type;
                                    tip = document.createElement("a");
                                    tip.textContent = "这里暂时不支持浏览，请点击链接查看：" + en.source;
                                    tip.href = en.source;
                                    node.appendChild(tip);
                                }
                                return node;
                            }
                            if (ens instanceof Array) {
                                for (var i = 0; i < ens.length; i++) {
                                    var en = ens[i];
                                    var node = getEnNode(en);
                                    if (node) {
                                        content.appendChild(node);
                                    }
                                }
                            } else {
                                if (ens && ens.source && ens.type) {
                                    var node = getEnNode(ens);
                                    if (node) {
                                        content.appendChild(node);
                                    }
                                }
                            }
                        }
                        content.appendChild(webbutton);
                    }
                    var flipshl = document.getElementById("media-viewer");
                    var flipviewe = document.getElementById("media-flip-container");
                    var hideflip = document.getElementById("media-hide-button");
                    hideflip.addEventListener ("click", function () {
                        WinJS.UI.Animation.fadeOut(flipshl).done(function () {
                            flipshl.style.display = "none";
                        });
                    });
                    var flipv = flipviewe.winControl;
                    var displayEle = content.querySelectorAll("img, audio, video");
                    var MediaType = {
                        image: "img",
                        video: "video",
                        audio: "audio"
                    };
                    function MediaData() {
                        this.type = "";
                        this.src = "";
                        this.innerHTML = "";
                    };
                    var datas = new WinJS.Binding.List();
                    flipv.itemDataSource = datas.dataSource;
                    flipv.itemTemplate = function (itemPromise) {
                        return itemPromise.then(function (item) {
                            var element = document.createElement("div");
                            element.className = "media-viewer-displaytemplate";
                            element.innerHTML = item.data.innerHTML;
                            element.addEventListener("click", function () {
                                console.log("你点了", item.data);
                            });
                            return element;
                        });
                    };
                    for (var i = 0; i < displayEle.length; i++) {
                        var imge = displayEle[i];
                        var md = new MediaData();
                        md.src = imge.src || "";
                        md.innerHTML = toStaticHTML(imge.outerHTML);
                        if (NString.equals(imge.tagName, "img")) {
                            md.type = MediaType.image;
                        } else if (NString.equals(imge.tagName, "video")) {
                            md.type = MediaType.video;
                        } else if (NString.equals(imge.tagName, "audio")) {
                            md.type = MediaType.audio;
                        }
                        datas.push(md);
                    }
                    var imgs = content.querySelectorAll("img");
                    for (var i = 0; i < imgs.length; i++) {
                        var imge = imgs[i];
                        imge.addEventListener("click", function () {
                            flipshl.style.display = "";
                            WinJS.UI.Animation.fadeIn(flipshl);
                            for (var k = 0; k < datas.length; k++) {
                                var data = datas.getAt(k);
                                if (NString.equals (data.innerHTML, toStaticHTML(this.outerHTML))) {
                                    flipv.currentPage = k;
                                    break;
                                }
                            }
                        });
                    }
                });
            });
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

