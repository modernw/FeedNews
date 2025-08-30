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
    function copyNodeContentToClipboard(element) {
        if (!element) return;

        var content = "";
        var dataPackage = new Windows.ApplicationModel.DataTransfer.DataPackage();

        if (NString.equals(element.tagName, "OBJECT")) {
            content = element.data || "";
            dataPackage.setText(content);

        } else if (NString.equals(element.tagName, "VIDEO") || NString.equals(element.tagName, "AUDIO")) {
            content = element.src || "";
            dataPackage.setText(content);

        } else if (NString.equals(element.tagName, "IMG")) {
            try {
                var canvas = document.createElement("canvas");
                canvas.width = element.naturalWidth;
                canvas.height = element.naturalHeight;
                var ctx = canvas.getContext("2d");
                ctx.drawImage(element, 0, 0);

                canvas.toBlob(function (blob) {
                    if (!blob) {
                        console.error("无法获取图片 Blob，改为复制 URL");
                        dataPackage.setText(element.src || "");
                        Windows.ApplicationModel.DataTransfer.Clipboard.setContent(dataPackage);
                        return;
                    }

                    // 保存文件到临时目录
                    var fileName = "ClipboardImage_" + Date.now() + ".png";
                    Windows.Storage.ApplicationData.current.temporaryFolder.createFileAsync(fileName,
                        Windows.Storage.CreationCollisionOption.replaceExisting
                    ).then(function (file) {
                        return Windows.Storage.FileIO.writeBufferAsync(file, blob.msDetachStream());
                    }).then(function () {
                        return Windows.Storage.ApplicationData.current.temporaryFolder.getFileAsync(fileName);
                    }).then(function (file) {
                        dataPackage.setStorageItems([file]);
                        Windows.ApplicationModel.DataTransfer.Clipboard.setContent(dataPackage);
                        console.log("图片已保存并复制到剪贴板:", file.name);
                    }).catch(function (err) {
                        console.error("保存图片失败:", err);
                        dataPackage.setText(element.src || "");
                        Windows.ApplicationModel.DataTransfer.Clipboard.setContent(dataPackage);
                    });
                }, "image/png");

                return; // 异步路径这里直接 return

            } catch (e) {
                console.error("复制图片失败:", e);
                content = element.src || "";
                dataPackage.setText(content);
            }

        } else {
            content = element.innerText || element.textContent || "";
            dataPackage.setText(content);
        }

        try {
            Windows.ApplicationModel.DataTransfer.Clipboard.setContent(dataPackage);
            console.log("已复制到剪贴板:", content);
        } catch (e) {
            console.error("设置剪贴板失败:", e);
        }
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
                    flipshl.style.pointEvent = "none";
                    setTimeout(function () {
                        flipshl.style.pointEvent = "";
                        flipshl.style.display = "none";
                        flipshl.style.opacity = "";
                    }, 500);
                    var flipviewe = document.getElementById("media-flip-container");
                    var hideflip = document.getElementById("media-hide-button");
                    hideflip.addEventListener("click", function () {
                        WinJS.UI.Animation.fadeOut(flipshl).done(function () {
                            flipshl.style.display = "none";
                            if (currentE) {
                                if (NString.equals(currentE.tagName, "video") || NString.equals(currentE.tagName, "audio")) {
                                    currentE.pause();
                                }
                            }
                        });
                    });
                    var flipv = flipviewe.winControl;
                    var currentE = null;
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
                    var clone = flipviewe.cloneNode(true);
                    clone.style.display = "";
                    clone.style.opacity = 1;
                    content.appendChild(clone);
                    flipv.itemDataSource = datas.dataSource;
                    var myTemplate = new WinJS.Binding.Template(document.querySelector(".media-viewer-displaytemplate"));
                    var menuElement = document.getElementById("v_a_viewmenu");
                    var menu = menuElement.winControl;
                    flipv.itemTemplate = function (itemPromise) {
                        return itemPromise.then(function (item) {
                            return myTemplate.render(item.data).then(function (element) {
                                var element = document.createElement("div");
                                element.className = "media-viewer-displaytemplate";
                                element.innerHTML = item.data.innerHTML;
                                currentE = element.querySelector("img, video, audio");
                                try {
                                    currentE.width = "";
                                    currentE.height = "";
                                } catch (e) { }
                                var sizeChangeEvent = function (hWindow, hParent, node) {
                                    var sw = 0,
                                        sh = 0;
                                    if (hParent) {
                                        sw = hParent.offset.width || hParent.rect.width || hParent.client.width;
                                        sh = hParent.offset.height || hParent.rect.height || hParent.client.height;
                                    } else {
                                        try {
                                            try {
                                                try {
                                                    var rect = element.getBoundingClientRect();
                                                    sw = rect.width;
                                                    sh = rect.height;
                                                } catch (e) {
                                                    sw = element.offsetWidth;
                                                    sh = element.offsetHeight;
                                                }
                                            } catch (e) {
                                                sw = element.clientWidth;
                                                sh = element.clientHeight;
                                            }
                                        } catch (e) {
                                            currentE.style.width = "";
                                            currentE.style.height = "";
                                            currentE.style.top = "50%";
                                            currentE.style.left = "50%";
                                            currentE.style.transform = "translate(-50%, -50%)";
                                        }
                                    }
                                    if (!sw || !sh) return;
                                    var iw = 800, ih = 600;
                                    var sra = sw / sh, ira = iw / ih;
                                    if (NString.equals(currentE.tagName, "img")) {
                                        iw = currentE.naturalWidth, ih = currentE.naturalHeight;
                                        ira = iw / ih;
                                    } else if (NString.equals(currentE.tagName, "video")) {
                                        iw = currentE.videoWidth, ih = currentE.videoHeight;
                                        ira = iw / ih;
                                    } else {
                                        currentE.style.left = "50%";
                                        currentE.style.top = "50%";
                                        currentE.style.transform = "translate(-50%, -50%)";
                                    }
                                    if (NString.equals(currentE.tagName, "img") || NString.equals(currentE.tagName, "video")) {
                                        var nw = 0, nh = 0, nt = 0, nl = 0;
                                        if (sra > ira) {
                                            nh = sh;
                                            nw = iw / ih * nh;
                                        } else if (sra < ira) {
                                            nw = sw;
                                            nh = ih / iw * nw;
                                        } else if (sra = ira) {
                                            nw = sw;
                                            nh = sh;
                                        } else {
                                            nh = sh;
                                            nw = iw / ih * nh;
                                        }
                                        if (ira / sra > 3) {
                                            // 认定过宽
                                            if (ih > sh) nh = sh;
                                            else nh = ih;
                                            nw = iw / ih * nh;
                                            nt = (sh - nh) * 0.5;
                                            nl = 0;
                                        }
                                        if (sra / ira > 3) {
                                            // 认定过长
                                            if (iw > sw) nw = sw;
                                            else nw = iw;
                                            nh = ih / iw * nw;
                                            nt = 0;
                                            nl = (sw - nw) * 0.5;
                                        }
                                        nt = (sh - nh) * 0.5;
                                        nl = (sw - nw) * 0.5;
                                        if (nl < 0) nl = 0;
                                        if (nt < 0) nt = 0;
                                        currentE.style.left = (nl || 0) + "px" || "";
                                        currentE.style.top = (nt || 0) + "px" || "";
                                        currentE.style.width = nw + "px" || "";
                                        currentE.style.height = nh + "px" || "";
                                        try {
                                            currentE.width = nw;
                                            currentE.height = nh;
                                        } catch (e) { }
                                    }
                                    if (NString.equals(currentE.tagName, "video")) {
                                        currentE.style.left = 0;
                                        currentE.style.top = 0;
                                        currentE.style.width = "100%";
                                        currentE.style.height = "100%";
                                    }
                                };
                                registerSizeChangeEvent(currentE.parentNode, function (arg1, arg2, arg3)
                                { sizeChangeEvent(arg1, arg2, arg3); });
                                currentE.addEventListener("click", function () {
                                    sizeChangeEvent();
                                });
                                currentE.addEventListener("contextmenu", function (e) {
                                    e.preventDefault();
                                    var cmdView = document.body.querySelector("#v_a_viewmenu #menucmd-view");
                                    var cmdDownload = document.body.querySelector("#v_a_viewmenu #menucmd-download");
                                    cmdView.style.display = "none";
                                    cmdView.disabled = true;
                                    var aDownload = document.getElementById("v_a_viewmenu_download");
                                    aDownload.href = this.src;
                                    cmdDownload.onclick = function () {
                                        aDownload.click();
                                    }
                                    var cmdCopy = document.body.querySelector("#v_a_viewmenu #menucmd-copy");
                                    cmdCopy.onclick = function () {
                                        copyNodeContentToClipboard(currentE);
                                    }
                                    menu.show(this, "right");
                                });
                                element.style.width = "50%";
                                element.style.height = "50%";
                                setTimeout(function (hNode) {
                                    if (hNode) {
                                        hNode.style.width = "";
                                        hNode.style.height = "";
                                    }
                                    sizeChangeEvent();
                                }, 0, element);
                                element.onload = sizeChangeEvent();
                                currentE.addEventListener("load", function () {
                                    sizeChangeEvent();
                                });
                                return element;
                            });
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
                        imge.addEventListener("contextmenu", function (e) {
                            e.preventDefault();
                            var cmdView = document.body.querySelector("#v_a_viewmenu #menucmd-view");
                            var cmdDownload = document.body.querySelector("#v_a_viewmenu #menucmd-download");
                            var cmdCopy = document.body.querySelector("#v_a_viewmenu #menucmd-copy");
                            cmdView.style.display = "";
                            cmdView.disabled = false;
                                cmdCopy.onclick = function () {
                                    copyNodeContentToClipboard(imge);
                                }
                            var aDownload = document.getElementById("v_a_viewmenu_download");
                            aDownload.href = this.src;
                            cmdDownload.onclick = function () {
                                aDownload.click();
                            }
                            cmdView.onclick = function () {
                                flipshl.style.display = "";
                                WinJS.UI.Animation.fadeIn(flipshl);
                                for (var k = 0; k < datas.length; k++) {
                                    var data = datas.getAt(k);
                                    if (NString.equals(data.innerHTML, toStaticHTML(this.outerHTML))) {
                                        flipv.currentPage = k;
                                        break;
                                    }
                                }
                            }
                            menu.show(this, "right");
                        });
                    }
                    var imgs = content.querySelectorAll("img");
                    for (var i = 0; i < imgs.length; i++) {
                        var imge = imgs[i];
                        imge.addEventListener("click", function () {
                            flipshl.style.display = "";
                            WinJS.UI.Animation.fadeIn(flipshl);
                            for (var k = 0; k < datas.length; k++) {
                                var data = datas.getAt(k);
                                if (NString.equals(data.innerHTML, toStaticHTML(this.outerHTML))) {
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

