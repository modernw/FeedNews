(function () {
    "use strict";
    function Image() {
        this.title = "";
        this.link = "";
        this.url = "";
    }
    function Channel() {
        this.title = "";
        this.language = "";
        this.pubdate = null;
        this.generator = "";
        this.description = "";
        this.link = "";
        this.id = "";
        this.image = new Image();
        // 获取标题
        this.getTitle = function () {
            return this.title || "";
        };
        // 格式化日期
        // 支持占位符：
        // yyyy = 四位年
        // MM   = 两位月
        // dd   = 两位日
        // HH   = 两位小时 (00-23)
        // mm   = 两位分钟
        // ss   = 两位秒
        this.getPubDateFormat = function (swFormat) {
            if (!(this.pubdate instanceof Date) || isNaN(this.pubdate)) {
                return "";
            }
            var dt = this.pubdate;
            var pad2 = function (num) {
                return num < 10 ? "0" + num : "" + num;
            };
            if (!swFormat) swFormat = "yyy-MM-dd HH:mm:ss";
            var swOut = swFormat;
            swOut = swOut.replace(/yyyy/g, dt.getFullYear());
            swOut = swOut.replace(/MM/g, pad2(dt.getMonth() + 1));
            swOut = swOut.replace(/dd/g, pad2(dt.getDate()));
            swOut = swOut.replace(/HH/g, pad2(dt.getHours()));
            swOut = swOut.replace(/mm/g, pad2(dt.getMinutes()));
            swOut = swOut.replace(/ss/g, pad2(dt.getSeconds()));
            return swOut;
        };
        this.toJson = function () {
            return {
                title: this.title,
                language: this.language,
                pubdate: this.pubdate,
                generator: this.generator,
                description: this.description,
                link: this.link,
                id: this.id,
                image: {
                    title: this.image.title,
                    link: this.image.link,
                    url: this.image.url
                }
            };
        };
    }
    function Enclosure() {
        this.source = "";
        this.length = 0;
        this.type = "";
        this.toJson = function () {
            return {
                source: this.source,
                length: this.length,
                type: this.type
            };
        };
    }
    function Article() {
        this.title = "";
        this.description = "";
        this.link = "";
        this.guid = "";
        this.isGuidPerma = true;
        // 如果为 atom，则为 issued
        this.pubdate = null;
        this.enclosure = new Enclosure();
        this.about = "";
        this.id = "";
        this.author = "";
        // 获取文章标题
        this.getTitle = function () {
            return this.title || "";
        };
        // 获取纯文本描述（去掉 HTML 标签和转义符）
        this.getPureDesp = function () {
            var swHtml = this.description || "";
            // 去掉 HTML 标签
            var swText = swHtml.replace(/<[^>]+>/g, "");
            // 处理 HTML 转义符（常见的几种）
            swText = swText
                .replace(/&nbsp;/gi, " ")
                .replace(/&lt;/gi, "<")
                .replace(/&gt;/gi, ">")
                .replace(/&amp;/gi, "&")
                .replace(/&quot;/gi, "\"")
                .replace(/&#39;/gi, "'");
            return NString.trim(swText);
        };
        // 获取第一张图片（img.src / video.poster / div background-image）
        this.getFirstPic = function () {
            var swHtml = this.description || "";
            var swMatch;
            // 辅助函数：补全URL
            function completeUrl(url, baseUrl) {
                // 如果已经是绝对URL或data URL，直接返回
                if (/^(https?:|data:)/i.test(url)) {
                    return url;
                }
                // 如果baseUrl无效，返回原URL
                if (!baseUrl || typeof baseUrl !== 'string') {
                    return url;
                }
                // 解析baseUrl获取协议和域名
                var parser = document.createElement('a');
                parser.href = baseUrl;
                var base = parser.protocol + "//" + parser.host;
                // 补全相对URL
                if (url.charAt(0) === '/') {
                    return base + url;
                } else {
                    // 处理非根路径的相对URL
                    var basePath = baseUrl.substring(0, baseUrl.lastIndexOf('/') + 1);
                    return basePath + url;
                }
            }
            swHtml = swHtml.replace(/\r?\n/g, " ");
            // img src
            swMatch = /<img[\s\S]+?src=["']([^"']+)["']/i.exec(swHtml);
            if (swMatch && swMatch[1]) {
                return completeUrl(swMatch[1], this.link);
            }
            // video poster
            swMatch = /<video[\s\S]+?poster=["']([^"']+)["']/i.exec(swHtml);
            if (swMatch && swMatch[1]) {
                return completeUrl(swMatch[1], this.link);
            }
            // div style background-image
            swMatch = /<div[\s\S]+?style=["'][^"']*background-image\s*:\s*url\((['"]?)([^'")]+)\1\)/i.exec(swHtml);
            if (swMatch && swMatch[2]) {
                return completeUrl(swMatch[2], this.link);
            }
            return "";
        };
        this.getPubDateFormat = function (swFormat) {
            if (!(this.pubdate instanceof Date) || isNaN(this.pubdate)) {
                return "";
            }
            var dt = this.pubdate;
            var pad2 = function (num) {
                return num < 10 ? "0" + num : "" + num;
            };
            if (!swFormat) swFormat = "yyy-MM-dd HH:mm:ss";
            var swOut = swFormat;
            swOut = swOut.replace(/yyyy/g, dt.getFullYear());
            swOut = swOut.replace(/MM/g, pad2(dt.getMonth() + 1));
            swOut = swOut.replace(/dd/g, pad2(dt.getDate()));
            swOut = swOut.replace(/HH/g, pad2(dt.getHours()));
            swOut = swOut.replace(/mm/g, pad2(dt.getMinutes()));
            swOut = swOut.replace(/ss/g, pad2(dt.getSeconds()));
            return swOut;
        };
        this.cover = this.getFirstPic();
        this.toJson = function () {
            return {
                title: this.title,
                description: this.description,
                link: this.link,
                guid: this.guid,
                isGuidPerma: this.isGuidPerma,
                pubdate: this.pubdate,
                enclosure: this.enclosure.toJson (),
                about: this.about,
                id: this.id,
                author: this.author,
                cover: this.cover || this.getFirstPic () || ""
            };
        };
        this.tileImage = {
            medium: "",
            wide: "",
            large: ""
        };
    }
    function FeedResult() {
        this.isok = false;
        this.status = 200;
        this.error = "";
        this.result = {
            channel: new Channel(),
            articles: [],
            xhrresp: null,
            xmldoc: null
        };
        this.toJson = function () {
            var articlesarr = [];
            for (var i = 0; i < this.result.articles.length; i ++) {
                articlesarr.push (this.result.articles[i].toJson ());
            }
            return {
                isok: this.isok,
                status: this.status,
                error: this.error,
                result: {
                    channel: this.result.channel.toJson(),
                    articles: articlesarr
                }
            };
        };
    }
    function parseXml(cXhrResult) {
        var ret = new FeedResult();
        ret.isok = false;
        ret.status = cXhrResult.status;
        ret.error = cXhrResult.statusText;
        ret.result.xhrresp = cXhrResult;
        var xmlDoc = cXhrResult.responseXML;
        if (!xmlDoc) return ret;
        try {
            var iCount, iCount2, iCount3;
            // 判断是 RSS 还是 Atom
            var swRootName = xmlDoc.documentElement.nodeName.toLowerCase();
            var swChannelName = "";
            if (swRootName === "rss") {
                // RSS 2.0
                swChannelName = "channel";
            } else if (swRootName === "rdf:rdf") {
                // RSS 1.0
                swChannelName = "channel";
            } else if (swRootName === "feed") {
                // Atom
                swChannelName = "feed";
            } else {
                ret.error = "未知 Feed 类型";
                return ret;
            }
            var cChannel = xmlDoc.getElementsByTagName(swChannelName)[0];
            if (!cChannel) cChannel = xmlDoc.getElementsByTagName("channel")[0] || xmlDoc.getElementsByTagName("feed")[0];
            var cFeed = ret.result.channel;
            // ===== Channel 信息解析 =====
            cFeed.title = cChannel.getElementsByTagName("title")[0] ? cChannel.getElementsByTagName("title")[0].textContent : "";
            cFeed.link = cChannel.getElementsByTagName("link")[0] ? cChannel.getElementsByTagName("link")[0].textContent : "";
            cFeed.description = cChannel.getElementsByTagName("description")[0] ? cChannel.getElementsByTagName("description")[0].textContent : "";
            cFeed.language = cChannel.getElementsByTagName("language")[0] ? cChannel.getElementsByTagName("language")[0].textContent : "";
            cFeed.generator = cChannel.getElementsByTagName("generator")[0] ? cChannel.getElementsByTagName("generator")[0].textContent : "";
            var swPubDate = cChannel.getElementsByTagName("pubDate")[0] ? cChannel.getElementsByTagName("pubDate")[0].textContent : "";
            cFeed.pubdate = swPubDate ? new Date(swPubDate) : null;
            cFeed.id = cChannel.getElementsByTagName("id")[0] ? cChannel.getElementsByTagName("id")[0].textContent : "";
            try {
                var img = cChannel.getElementsByTagName("image")[0];
                cFeed.image.title = img.getElementsByTagName("title")[0] ? img.getElementsByTagName("title")[0].textContent : "";
                cFeed.image.link = img.getElementsByTagName("link")[0] ? img.getElementsByTagName("link")[0].textContent : "";
                cFeed.image.url = img.getElementsByTagName("url")[0] ? img.getElementsByTagName("url")[0].textContent : "";
            } catch (e) {}
            // ===== Item / Entry 解析 =====
            var cItems = xmlDoc.getElementsByTagName("item");
            if (!cItems || cItems.length === 0) cItems = xmlDoc.getElementsByTagName("entry");
            for (iCount = 0; iCount < cItems.length; iCount++) {
                var cItem = cItems[iCount];
                var cArticle = new Article();
                cArticle.title = cItem.getElementsByTagName("title")[0] ? cItem.getElementsByTagName("title")[0].textContent : "";
                cArticle.link = cItem.getElementsByTagName("link")[0] ? cItem.getElementsByTagName("link")[0].textContent :
                    (cItem.getAttribute("href") || "");
                cArticle.guid = cItem.getElementsByTagName("guid")[0] ? cItem.getElementsByTagName("guid")[0].textContent : "";
                cArticle.isGuidPerma = cItem.getElementsByTagName("guid")[0] ? (cItem.getElementsByTagName("guid")[0].getAttribute("isPermaLink") !== "false") : true;
                cArticle.description = cItem.getElementsByTagName("description")[0] ? cItem.getElementsByTagName("description")[0].textContent :
                    (cItem.getElementsByTagName("summary")[0] ? cItem.getElementsByTagName("summary")[0].textContent : "");
                var swPub = cItem.getElementsByTagName("pubDate")[0] ? cItem.getElementsByTagName("pubDate")[0].textContent :
                    (cItem.getElementsByTagName("issued")[0] ? cItem.getElementsByTagName("issued")[0].textContent : "");
                cArticle.pubdate = swPub ? new Date(swPub) : null;
                cArticle.author = cItem.getElementsByTagName("author")[0] ? cItem.getElementsByTagName("author")[0].textContent : "";
                // enclosure
                var cEnc = cItem.getElementsByTagName("enclosure")[0];
                if (cEnc) {
                    cArticle.enclosure.source = cEnc.getAttribute("url") || "";
                    cArticle.enclosure.length = parseInt(cEnc.getAttribute("length") || 0, 10);
                    cArticle.enclosure.type = cEnc.getAttribute("type") || "";
                }
                // Atom 特有
                cArticle.about = cItem.getAttribute("about") || "";
                cArticle.id = cItem.getElementsByTagName("id")[0] ? cItem.getElementsByTagName("id")[0].textContent : "";
                cArticle.cover = cArticle.getFirstPic();
                ret.result.articles.push(cArticle);
            }
            ret.isok = true;
        } catch (ex) {
            ret.isok = false;
            ret.error = ex.message || "解析异常";
        }
        return ret;
    }
    function parseJson(cXhrResult) {
        var ret = new FeedResult();
        ret.isok = false;
        ret.status = cXhrResult.status;
        ret.error = cXhrResult.statusText;
        ret.result.xhrresp = cXhrResult;
        try {
            var cJson = typeof cXhrResult.responseText === "string" ? JSON.parse(cXhrResult.responseText) : cXhrResult.responseText;
            if (!cJson) return ret;
            var cFeed = ret.result.channel;
            cFeed.title = cJson.title || "";
            cFeed.link = cJson.home_page_url || "";
            cFeed.description = cJson.description || "";
            cFeed.pubdate = cJson.date_modified ? new Date(cJson.date_modified) : null;
            cFeed.id = cJson.id || "";
            var iCount;
            if (cJson.items && cJson.items.length > 0) {
                for (iCount = 0; iCount < cJson.items.length; iCount++) {
                    var cJsonItem = cJson.items[iCount];
                    var cArticle = new FeedResult().result.articles[0];
                    cArticle.title = cJsonItem.title || "";
                    cArticle.link = cJsonItem.url || "";
                    cArticle.guid = cJsonItem.id || "";
                    cArticle.description = cJsonItem.content_text || cJsonItem.summary || "";
                    cArticle.pubdate = cJsonItem.date_published ? new Date(cJsonItem.date_published) : null;
                    // enclosure
                    if (cJsonItem.attachments && cJsonItem.attachments.length > 0) {
                        var cAtt = cJsonItem.attachments[0];
                        cArticle.enclosure.source = cAtt.url || "";
                        cArticle.enclosure.length = parseInt(cAtt.size_in_bytes || 0, 10);
                        cArticle.enclosure.type = cAtt.mime_type || "";
                    }
                    ret.result.articles.push(cArticle);
                }
            }
            ret.isok = true;
        } catch (ex) {
            ret.isok = false;
            ret.error = ex.message || "JSON解析异常";
        }
        return ret;
    }
    function parseToFeed(cXhrResult) {
        var swResp = cXhrResult.getResponseHeader ? cXhrResult.getResponseHeader("Content-Type") : "";
        if (swResp && swResp.indexOf("application/json") >= 0) {
            return parseJson(cXhrResult);
        } else if (cXhrResult.responseXML) {
            return parseXml(cXhrResult);
        } else if (cXhrResult.responseText && cXhrResult.responseText[0] === "{") {
            return parseJson(cXhrResult);
        } else {
            return parseXml(cXhrResult);
        }
    }
    function fetchToGetFeed(swUri) {
        if (!swUri || typeof swUri !== "string") throw new TypeError("swUri 必须为字符串");
        return fetch(swUri, "document").then(function (cXhr) {
            return parseToFeed(cXhr);
        }, function (cXhr) {
            var ret = new FeedResult();
            ret.isok = false;
            ret.status = cXhr.status || 500;
            ret.error = cXhr.statusText || "请求失败";
            ret.result.xhrresp = cXhr;
            return ret;
        });
    }

    var UpdateMode = {
        PrimaryFallback: "PrimaryFallback",      // 逐一尝试源
        MergeByTitle: "MergeByTitle",            // 按标题去重
        MergeByLink: "MergeByLink",              // 按 link 去重
        MergeByGUID: "MergeByGUID",              // 按 guid/id 去重
        MergeByContentHash: "MergeByContentHash",// 按内容哈希去重
        WeightedMerge: "WeightedMerge",          // 按权重优先级
        FullMergeWithTagging: "FullMergeWithTagging" // 保留全部，标记来源
    };
    var updateState = {
        currentPromise: null,
        waitingTask: null,
        timer: null,
        cancelCurrent: null
    };
    function scheduleUpdate(aswUrl, swUpdateMode) {
        return new WinJS.Promise(function (complete, error) {
            var task = { aswUrl: aswUrl, swUpdateMode: swUpdateMode, complete: complete, error: error };

            // 如果有任务正在执行
            if (updateState.currentPromise) {
                // 覆盖等待任务
                updateState.waitingTask = task;
                // 重置 3 秒定时器
                if (updateState.timer) clearTimeout(updateState.timer);
                updateState.timer = setTimeout(function () {
                    if (updateState.cancelCurrent) {
                        updateState.cancelCurrent(); // 中止当前
                    }
                }, 3000);
            } else {
                // 启动新任务
                runTask(task);
            }
        });
    }
    function runTask(task) {
        updateState.waitingTask = null;
        var aborted = false;
        updateState.cancelCurrent = function () {
            aborted = true;
        };

        var p = realUpdateFeed(task.aswUrl, task.swUpdateMode).then(function (result) {
            if (!aborted) {
                task.complete(result);
            }
            if (updateState.waitingTask) {
                var next = updateState.waitingTask;
                updateState.waitingTask = null;
                runTask(next);
            } else {
                updateState.currentPromise = null;
            }
        }, function (err) {
            if (!aborted) {
                task.error(err);
            }
            if (updateState.waitingTask) {
                var next2 = updateState.waitingTask;
                updateState.waitingTask = null;
                runTask(next2);
            } else {
                updateState.currentPromise = null;
            }
        });

        updateState.currentPromise = p;
    }
    function realUpdateFeed(aswUrl, swUpdateMode) {
        if (!aswUrl || !aswUrl.length) {
            return WinJS.Promise.wrapError(new TypeError("aswUrl 必须为非空数组"));
        }
        if (!swUpdateMode) swUpdateMode = UpdateMode.PrimaryFallback;
        function uniqueArticles(arArticles, swKey) {
            var map = {};
            var res = [];
            for (var i = 0; i < arArticles.length; i++) {
                var cA = arArticles[i];
                var key = "";
                switch (swKey) {
                    case "title": key = cA.title; break;
                    case "link": key = cA.link; break;
                    case "guid": key = cA.guid || cA.id; break;
                    case "hash": key = (cA.title + "|" + cA.description).toLowerCase(); break;
                    default: key = JSON.stringify(cA);
                }
                if (!map[key]) {
                    map[key] = true;
                    res.push(cA);
                }
            }
            return res;
        }
        function tagArticles(arArticles, swSourceUrl) {
            for (var i = 0; i < arArticles.length; i++) {
                arArticles[i].about = swSourceUrl;
            }
        }
        if (swUpdateMode === UpdateMode.PrimaryFallback) {
            var iIndex = 0;
            function tryNext() {
                if (iIndex >= aswUrl.length) {
                    var ret = new FeedResult();
                    ret.isok = false;
                    ret.error = "全部源都失败";
                    return WinJS.Promise.wrap(ret);
                }
                var swUrl = aswUrl[iIndex++];
                return fetchToGetFeed(swUrl).then(function (cFeed) {
                    if (cFeed.isok) {
                        tagArticles(cFeed.result.articles, swUrl);
                        return cFeed;
                    } else {
                        return tryNext();
                    }
                }, function () {
                    return tryNext();
                });
            }
            return tryNext();
        }
        var arPromise = [];
        for (var i = 0; i < aswUrl.length; i++) {
            (function (swU) {
                arPromise.push(fetchToGetFeed(swU).then(function (cFeed) {
                    if (cFeed.isok) {
                        tagArticles(cFeed.result.articles, swU);
                    }
                    return cFeed;
                }));
            })(aswUrl[i]);
        }
        return WinJS.Promise.join(arPromise).then(function (arFeedResults) {
            var ret = new FeedResult();
            ret.isok = true;
            var arArticlesAll = [];
            var cMainChannel = ret.result.channel;
            switch (swUpdateMode) {
                case UpdateMode.MergeByTitle:
                    for (var i = 0; i < arFeedResults.length; i++) {
                        if (arFeedResults[i].isok) {
                            arArticlesAll = arArticlesAll.concat(arFeedResults[i].result.articles);
                            if (!cMainChannel.title) cMainChannel = arFeedResults[i].result.channel;
                        }
                    }
                    ret.result.channel = cMainChannel;
                    ret.result.articles = uniqueArticles(arArticlesAll, "title");
                    return ret;
                case UpdateMode.MergeByLink:
                    for (var i = 0; i < arFeedResults.length; i++) {
                        if (arFeedResults[i].isok) {
                            arArticlesAll = arArticlesAll.concat(arFeedResults[i].result.articles);
                            if (!cMainChannel.title) cMainChannel = arFeedResults[i].result.channel;
                        }
                    }
                    ret.result.channel = cMainChannel;
                    ret.result.articles = uniqueArticles(arArticlesAll, "link");
                    return ret;
                case UpdateMode.MergeByGUID:
                    for (var i = 0; i < arFeedResults.length; i++) {
                        if (arFeedResults[i].isok) {
                            arArticlesAll = arArticlesAll.concat(arFeedResults[i].result.articles);
                            if (!cMainChannel.title) cMainChannel = arFeedResults[i].result.channel;
                        }
                    }
                    ret.result.channel = cMainChannel;
                    ret.result.articles = uniqueArticles(arArticlesAll, "guid");
                    return ret;
                case UpdateMode.MergeByContentHash:
                    for (var i = 0; i < arFeedResults.length; i++) {
                        if (arFeedResults[i].isok) {
                            arArticlesAll = arArticlesAll.concat(arFeedResults[i].result.articles);
                            if (!cMainChannel.title) cMainChannel = arFeedResults[i].result.channel;
                        }
                    }
                    ret.result.channel = cMainChannel;
                    ret.result.articles = uniqueArticles(arArticlesAll, "hash");
                    return ret;
                case UpdateMode.WeightedMerge:
                    for (var i = 0; i < arFeedResults.length; i++) {
                        if (arFeedResults[i].isok) {
                            var arTmp = arFeedResults[i].result.articles;
                            for (var j = 0; j < arTmp.length; j++) {
                                var cA = arTmp[j];
                                var dup = false;
                                for (var k = 0; k < arArticlesAll.length; k++) {
                                    if (arArticlesAll[k].guid && arArticlesAll[k].guid === cA.guid) {
                                        dup = true;
                                        break;
                                    }
                                }
                                if (!dup) arArticlesAll.push(cA);
                            }
                            if (!cMainChannel.title) cMainChannel = arFeedResults[i].result.channel;
                        }
                    }
                    ret.result.channel = cMainChannel;
                    ret.result.articles = arArticlesAll;
                    return ret;
                case UpdateMode.FullMergeWithTagging:
                    for (var i = 0; i < arFeedResults.length; i++) {
                        if (arFeedResults[i].isok) {
                            arArticlesAll = arArticlesAll.concat(arFeedResults[i].result.articles);
                            if (!cMainChannel.title) cMainChannel = arFeedResults[i].result.channel;
                        }
                    }
                    ret.result.channel = cMainChannel;
                    ret.result.articles = arArticlesAll;
                    return ret;
                default:
                    ret.isok = false;
                    ret.error = "未知更新模式: " + swUpdateMode;
                    return ret;
            }
        });
    }
    function updateFeed(aswUrl, swUpdateMode) {
        return scheduleUpdate(aswUrl, swUpdateMode);
    }
    function cancelAllTasks() {
        updateState.waitingTask = null;
        if (updateState.timer) {
            clearTimeout(updateState.timer);
            updateState.timer = null;
        }
        if (updateState.cancelCurrent) {
            try {
                updateState.cancelCurrent(); 
            } catch (e) {
                console.error(e.message || e || "");
            }
            updateState.cancelCurrent = null;
        }
        updateState.currentPromise = null;
    }
    extern({
        Feed: {
            get: fetchToGetFeed,
            update: updateFeed,
            cancel: cancelAllTasks,
            object: {
                Article: Article,
                Channel: Channel,
                Enclosure: Enclosure,
                FeedResult: FeedResult
            }
        }
    });
})();