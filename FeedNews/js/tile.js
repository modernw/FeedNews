(function () {
    "use strict";
    function TileForFeed() {
        this.title = "";
        this.text = "";
        this.image = "";
        this.pubdate = new Date(0);
        this.link = "";
        this.tileImage = {
            medium: "",
            wide: "",
            large: ""
        };
    }
    /**
     * 数组去重
     * @param {Array} array - 输入数组
     * @param {Function} [pfEquals] - 自定义比较函数 function(vLeft, vRight) { return true/false; }
     * @returns {Array} 去重后的新数组
     */
    function arrayUnique(array, pfEquals) {
        if (!array || !array.length) return [];
        var result = [];
        if (typeof pfEquals !== "function") {
            for (var i = 0; i < array.length; i++) {
                var v = array[i];
                if (result.indexOf(v) === -1) {
                    result.push(v);
                }
            }
        } else {
            outer: for (var i = 0; i < array.length; i++) {
                var v = array[i];
                for (var j = 0; j < result.length; j++) {
                    if (pfEquals(v, result[j])) {
                        continue outer;
                    }
                }
                result.push(v);
            }
        }
        return result;
    }
    // 计算文本相似度（0-1之间）
    function textSimilarity(str1, str2) {
        function levenshteinDistance(str1, str2) {
            var len1 = str1.length;
            var len2 = str2.length;
            var matrix = new Array(len1 + 1);
            for (var i = 0; i <= len1; i++) {
                matrix[i] = new Array(len2 + 1);
                matrix[i][0] = i;
            }
            for (var j = 0; j <= len2; j++) {
                matrix[0][j] = j;
            }
            for (var i = 1; i <= len1; i++) {
                for (var j = 1; j <= len2; j++) {
                    if (str1.charAt(i - 1) === str2.charAt(j - 1)) {
                        matrix[i][j] = matrix[i - 1][j - 1];
                    } else {
                        matrix[i][j] = Math.min(
                            matrix[i - 1][j - 1] + 1, // 替换
                            matrix[i][j - 1] + 1,     // 插入
                            matrix[i - 1][j] + 1      // 删除
                        );
                    }
                }
            }
            return matrix[len1][len2];
        }
        if (typeof str1 !== 'string' || typeof str2 !== 'string') {
            return 0;
        }
        if (str1.length === 0 && str2.length === 0) {
            return 1;
        }
        if (str1.length === 0 || str2.length === 0) {
            return 0;
        }
        if (str1 === str2) {
            return 1;
        }
        var maxLength = Math.max(str1.length, str2.length);
        var editDistance = levenshteinDistance(str1, str2);
        return 1 - editDistance / maxLength;
    }
    function getSupportedCategorys() {
        return FeedManager.load().then(function (complete) {
            var datas = FeedManager.datas();
            var cates = [];
            for (var i = 0; datas.providers && i < datas.providers.length; i++) {
                var provider = datas.providers[i];
                for (var j = 0; provider.channels && j < provider.channels.length; j++) {
                    var channel = provider.channels[j];
                    for (var k = 0; channel.categories && k < channel.categories.length; k++) {
                        var category = channel.categories[k];
                        if (category.showInTile) cates.push(category);
                    }
                }
            }
            return cates;
        });
    }
    function fetchFeeds(swUrl, cImageRule, swJsCode) {
        return Feed.get(swUrl).then(function (result) {
            if (!result || !result.isok || !cImageRule) return result;
            var articles = result.result.articles;
            if (!result || !articles || !articles.length) return result;
            function getProcessedUrl(swUrl, swJsCode, eTileSize) {
                var env = new Environment({
                    blocked: [
                        "alert", "confirm", "prompt", "open", "close", "focus", "print",
                        "setTimeout", "setInterval", "clearTimeout", "clearInterval", "setImmediate",
                        "fetch", "XMLHttpRequest", "ActiveXObject", "WebSocket", "EventSource",
                        "FileReader", "File", "Blob", "Image", "Audio", "Video", "CanvasRenderingContext2D",
                        "Worker", "SharedWorker"
                    ],
                    customBlock: {
                        document: true, 
                        console: {
                            log: true, error: true, warn: true, info: true, debug: true
                        }
                    }
                });
                env.unblock("Document", (window.Windows && window.Windows.Data && window.Windows.Data.Xml && window.Windows.Data.Xml.Dom)
                    ? window.Windows.Data.Xml.Dom.XmlDocument
                    : void 0
                );
                var locals = {
                    srcurl: swUrl,
                    width: eTileSize.scaledWidth || eTileSize.width || 150,
                    height: eTileSize.scaledHeight || eTileSize.height || 150,
                    desturl: void 0,
                    type: eTileSize.type || "medium",
                    result: ""
                };
                try {
                    locals.result = env.run(swJsCode || "", locals);
                } catch (e) {}
                return locals.desturl || locals.result || locals.desturl || swUrl || "";
            }
            var mapkey = [
                Tile.Const.Size.Medium,
                Tile.Const.Size.Wide,
                Tile.Const.Size.Large
            ];
            for (var i = 0; i < articles.length; i++) {
                var article = articles[i];
                var imgurl = article.getFirstPic() || "";
                if (!NString.empty(imgurl)) {
                    for (var j = 0; j < mapkey.length; j++) {
                        var key = mapkey[j];
                        var reped = getProcessedUrl(imgurl, swJsCode || "", key);
                        result.result.articles[i].tileImage[key.type] = reped || imgurl || "";
                    }
                }
            }
            return result;
        });
    }
    function getFeedTiles(category) {
        if (!category) return [];
        switch (category.updateStrategy) {
            case FeedUpdateStrategy.PrimaryFallback: {
                var cnt = 0;
                var len = category.sources.length;
                function next() {
                    cnt++;
                    if (cnt >= 0 && cnt < len) return true;
                    else return false;
                }
                function tryfetch() {
                    return fetchFeeds(category.sources[cnt].url,
                        (category.sources[cnt].imageRules && category.sources[cnt].imageRules.length ? category.sources[cnt].imageRules[0] : null),
                        category.sources[cnt].urlJsCode || ""
                    );
                }
                var trytask = function () {
                    return tryfetch().then(function (complete) {
                        var result = complete;
                        if (!result || !result.isok || !result.result.articles || !result.result.articles.length) {
                            if (next()) return tryfetch();
                            else return null;
                        }
                        var articles = result.result.articles;
                        var tilefeeds = [];
                        for (var i = 0; i < articles.length; i++) {
                            var article = articles[i];
                            var tilefeed = new TileForFeed();
                            tilefeed.title = article.getTitle() || "";
                            tilefeed.text = article.getPureDesp() || "";
                            tilefeed.image = article.getFirstPic() || "";
                            tilefeed.link = article.link || article.guid || "";
                            tilefeed.tileImage.medium = article.tileImage.medium;
                            tilefeed.tileImage.wide = article.tileImage.wide;
                            tilefeed.tileImage.large = article.tileImage.large;
                            tilefeeds.push(tilefeed);
                        }
                        return tilefeeds;
                    }, function (error) {
                        if (next()) return tryfetch();
                    });
                };
                return trytask();
            } break;
            case FeedUpdateStrategy.FullMergeWithTagging:
            case FeedUpdateStrategy.MergeByContentHash:
            case FeedUpdateStrategy.MergeByGUID:
            case FeedUpdateStrategy.MergeByLink:
            case FeedUpdateStrategy.MergeByTitle:
            case FeedUpdateStrategy.WeightedMerge: {
                var promises = [];
                for (var i = 0; i < category.sources.length; i++) {
                    (function (swU, cIR) {
                        promises.push(
                            fetchFeeds(swU, cIR).then(function (cFeed) {
                                if (cFeed.isok) {
                                    var arts = cFeed.result.articles;
                                    for (var j = 0; j < arts.length; j++) {
                                        arts[j].about = swU;
                                    }
                                }
                                return cFeed;
                            }));
                    })(
                        category.sources[i].url,
                        (category.sources[i].imageRules && category.sources[i].imageRules.length ? category.sources[i].imageRules[0] : null)
                    );
                }
                return WinJS.Promise.join(promises).then(function (results) {
                    var allArticles = [];
                    for (var i = 0; i < results.length; i++) {
                        if (results[i].isok && results[i].result.articles) {
                            allArticles = allArticles.concat(results[i].result.articles);
                        }
                    }
                    function uniqueArticles(arArticles, swKey) {
                        var map = Object.create(null);
                        var res = [];
                        for (var i = 0; i < arArticles.length; i++) {
                            var cA = arArticles[i];
                            var key = "";
                            switch (swKey) {
                                case "title": key = (cA.title || "").trim().toLowerCase(); break;
                                case "link": key = (cA.link || "").trim().toLowerCase(); break;
                                case "guid": key = (cA.guid || cA.id || "").trim().toLowerCase(); break;
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
                    var merged = [];
                    switch (category.updateStrategy) {
                        case FeedUpdateStrategy.MergeByTitle:
                            merged = uniqueArticles(allArticles, "title");
                            break;
                        case FeedUpdateStrategy.MergeByLink:
                            merged = uniqueArticles(allArticles, "link");
                            break;
                        case FeedUpdateStrategy.MergeByGUID:
                            merged = uniqueArticles(allArticles, "guid");
                            break;
                        case FeedUpdateStrategy.MergeByContentHash:
                            merged = uniqueArticles(allArticles, "hash");
                            break;
                        case FeedUpdateStrategy.WeightedMerge:
                            var tmp = [];
                            for (var i = 0; i < allArticles.length; i++) {
                                var a = allArticles[i];
                                var dup = false;
                                for (var k = 0; k < tmp.length; k++) {
                                    if (tmp[k].guid && tmp[k].guid === a.guid) {
                                        dup = true; break;
                                    }
                                }
                                if (!dup) tmp.push(a);
                            }
                            merged = tmp;
                            break;
                        case FeedUpdateStrategy.FullMergeWithTagging:
                            merged = allArticles;
                            break;
                    }
                    var tilefeeds = [];
                    for (var m = 0; m < merged.length; m++) {
                        var article = merged[m];
                        var tilefeed = new TileForFeed();
                        tilefeed.title = article.getTitle();
                        tilefeed.text = article.getPureDesp();
                        tilefeed.image = article.getFirstPic();
                        tilefeed.pubdate = article.pubdate || new Date(0);
                        tilefeed.link = article.link || article.guid || "";
                        tilefeed.tileImage.medium = article.tileImage.medium;
                        tilefeed.tileImage.wide = article.tileImage.wide;
                        tilefeed.tileImage.large = article.tileImage.large;
                        //if (category.updateStrategy === FeedUpdateStrategy.FullMergeWithTagging) {
                        //    if (article.about) {
                        //        tilefeed.title = "[" + article.about + "] " + tilefeed.title;
                        //    }
                        //}
                        tilefeeds.push(tilefeed);
                    }
                    tilefeeds.sort(function (a, b) {
                        var at = a.pubdate instanceof Date ? a.pubdate.getTime() : 0;
                        var bt = b.pubdate instanceof Date ? b.pubdate.getTime() : 0;
                        return bt - at;
                    });
                    return tilefeeds;
                });
            } break;
        }
    }
    function getArticlesToTileContent() {
        return getSupportedCategorys().then(function (complete) {
            var promises = [];
            for (var i = 0; i < complete.length; i++) {
                promises.push(getFeedTiles(complete[i]));
            }
            return WinJS.Promise.join(promises).then(function (complete) {
                //var uniqued = (function (arr2d) {
                //    var tilescontent = [];
                //    var all_len = 0;
                //    for (var i = 0; arr2d && i < arr2d.length; i++) {
                //        (function (arr) {
                //            for (var j = 0; arr && j < arr.length; j++) {
                //                arr[j].text = arr[j].text.substr(0, 350);
                //                tilescontent.push(arr[j]);
                //            }
                //        })(arr2d[i]);
                //    }
                //    return arrayUnique(tilescontent, function (left, right) {
                //        var stitle = textSimilarity(left.title, right.title);
                //        var stext = textSimilarity(left.text, right.text);
                //        return stitle > 0.95 && stext > 0.8;
                //    });
                //})(complete);
                //uniqued = uniqued.sort(function (a, b) {
                //    var at = a.pubdate instanceof Date ? a.pubdate.getTime() : 0;
                //    var bt = b.pubdate instanceof Date ? b.pubdate.getTime() : 0;
                //    return bt - at;
                //});
                function processTiles(arr2d) {
                    if (!arr2d || !arr2d.length) return [];
                    var all_len = 0;
                    for (var i = 0; i < arr2d.length; i++) {
                        if (arr2d[i] && arr2d[i].length) {
                            all_len += arr2d[i].length;
                        }
                    }
                    var MAX_LEN = 3072;
                    var MIN_LEN = 90;
                    var THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
                    var nowTime = Date.now();
                    var mainTiles = [];
                    var elderDatas = [];
                    function isDuplicate(v, list, pfEquals) {
                        for (var i = 0; i < list.length; i++) {
                            if (pfEquals(v, list[i])) return true;
                        }
                        return false;
                    }
                    var equalsFn = function (left, right) {
                        var stitle = textSimilarity(left.title, right.title);
                        var stext = textSimilarity(left.text, right.text);
                        return stitle > 0.95 && stext > 0.8;
                    };
                    for (var i = 0; i < arr2d.length; i++) {
                        var arr = arr2d[i];
                        if (!arr) continue;
                        for (var j = 0; j < arr.length; j++) {
                            var tile = arr[j];
                            if (!tile) continue;
                            tile.text = tile.text ? tile.text.substr(0, 350) : "";
                            var pubTime = tile.pubdate instanceof Date ? tile.pubdate.getTime() : 0;
                            var isOld = nowTime - pubTime > THIRTY_DAYS;
                            if (all_len > MAX_LEN && isOld) {
                                elderDatas.push(tile);
                                continue;
                            }
                            if (!isDuplicate(tile, mainTiles, equalsFn)) {
                                mainTiles.push(tile);
                            }
                        }
                    }
                    mainTiles.sort(function (a, b) {
                        var at = a.pubdate instanceof Date ? a.pubdate.getTime() : 0;
                        var bt = b.pubdate instanceof Date ? b.pubdate.getTime() : 0;
                        return bt - at;
                    });
                    if (mainTiles.length < MIN_LEN && elderDatas.length) {
                        elderDatas.sort(function (a, b) {
                            var at = a.pubdate instanceof Date ? a.pubdate.getTime() : 0;
                            var bt = b.pubdate instanceof Date ? b.pubdate.getTime() : 0;
                            return bt - at;
                        });
                        for (var k = 0; k < elderDatas.length && mainTiles.length < MIN_LEN; k++) {
                            var tile = elderDatas[k];
                            if (!isDuplicate(tile, mainTiles, equalsFn)) {
                                mainTiles.push(tile);
                            }
                        }
                    }
                    return mainTiles;
                }
                return processTiles(complete);
            });
        });
    }
    function tilesToTileXml(aTiles) {
        if (!aTiles || !aTiles.length) return [];
        var tileXmls = [];
        for (var i = 0; i < aTiles.length && i < 2048; i++) {
            var tilecontent = aTiles[i];
            var tiletemplate = {
                medium: (function (tc) {
                    var tt = new TileTemplate();
                    if (NString.empty(tc.image)) {
                        tt.create("TileSquare150x150Text04");
                        tt.texts[0] = tc.title;
                    } else {
                        tt.create("TileSquare150x150PeekImageAndText04");
                        tt.images[0] = tc.tileImage.medium;
                        tt.texts[0] = tc.title;
                    }
                    return tt;
                })(tilecontent),
                wide: (function (tc) {
                    var tt = new TileTemplate();
                    if (NString.empty(tc.image)) {
                        if (!NString.empty(tc.text)) {
                            tt.create("TileWide310x150Text09");
                            tt.texts[0] = tc.title;
                            tt.texts[1] = tc.text;
                        } else {
                            tt.create("TileWide310x150Text04");
                            tt.texts[0] = tc.title;
                        }
                    } else {
                        tt.create("TileWide310x150ImageAndText01");
                        tt.images[0] = tc.tileImage.wide;
                        tt.texts[0] = tc.title;
                    }
                    return tt;
                })(tilecontent),
                large: (function (tc) {
                    var tt = new TileTemplate();
                    if (NString.empty(tc.image)) {
                        tt.create("TileSquare310x310ImageAndTextOverlay02");
                        tt.images[0] = "ms-appx:///images/default/defaultBackgroundLarge.png";
                        tt.texts[0] = tc.title;
                        tt.texts[1] = tc.text;
                    } else {
                        tt.create("TileSquare310x310ImageAndTextOverlay02");
                        tt.images[0] = tc.tileImage.large;
                        tt.texts[0] = tc.title;
                        tt.texts[1] = tc.text;
                    }
                    return tt;
                })(tilecontent)
            };
            if (i % 3 == 0 && i + 2 < aTiles.length) {
                var tc1 = aTiles[i],
                    tc2 = aTiles[i + 1],
                    tc3 = aTiles[i + 2];
                if (
                    NString.empty(tc1.image) && NString.empty(tc2.image) && NString.empty(tc3.image)
                ) {
                    if (!NString.empty(tc1.text) && !NString.empty(tc2.text) && !NString.empty(tc3.text)) {
                        tiletemplate.large = new TileTemplate();
                        tiletemplate.large.create("TileSquare310x310TextList03");
                        tiletemplate.large.texts[0] = tc1.title;
                        tiletemplate.large.texts[1] = tc1.text;
                        tiletemplate.large.texts[2] = tc2.title;
                        tiletemplate.large.texts[3] = tc2.text;
                        tiletemplate.large.texts[4] = tc3.title;
                        tiletemplate.large.texts[5] = tc3.text;
                    } else {
                        tiletemplate.large = new TileTemplate();
                        tiletemplate.large.create("TileSquare310x310TextList02");
                        tiletemplate.large.texts[0] = tc1.title;
                        tiletemplate.large.texts[1] = tc2.title;
                        tiletemplate.large.texts[2] = tc3.title;
                    }
                } else {
                    tiletemplate.large = new TileTemplate();
                    tiletemplate.large.create("TileSquare310x310SmallImagesAndTextList02");
                    tiletemplate.large.texts[0] = tc1.title;
                    tiletemplate.large.texts[1] = tc2.title;
                    tiletemplate.large.texts[2] = tc3.title;
                    if (!NString.empty(tc1.tileImage.medium)) tiletemplate.large.images[0] = tc1.tileImage.medium;
                    if (!NString.empty(tc2.tileImage.medium)) tiletemplate.large.images[1] = tc2.tileImage.medium;
                    if (!NString.empty(tc3.tileImage.medium)) tiletemplate.large.images[2] = tc3.tileImage.medium;
                }
            }
            var tilegroup = new TileGroup();
            var keys = Object.keys(tiletemplate);
            for (var j = 0; j < keys.length; j++) {
                tilegroup.tiles.push(tiletemplate[keys[j]]);
            }
            tileXmls.push(tilegroup.getXml());
        }
        return tileXmls || [];
    }
    function getArticlesToTileXmls() {
        return getArticlesToTileContent().then(function (result) {
            return tilesToTileXml(result) || [];
        });
    }
    function updateTile() {
        var notifications = Windows.UI.Notifications;
        var tileUpdater = notifications.TileUpdateManager.createTileUpdaterForApplication();
        return getArticlesToTileXmls().then(function (result) {
            var xmls = result;
            if (xmls.length > 0) {
                tileUpdater.clear();
                var scheduled = tileUpdater.getScheduledTileNotifications();
                for (var i = 0; i < scheduled.length; i++) {
                    tileUpdater.removeFromSchedule(scheduled[i]);
                }
                var divideTime = 10 * 1000;
                for (var i = 0; i < xmls.length; i++) {
                    var now = new Date().getTime();
                    var dueTime = new Date(now + divideTime * (i + 1));
                    var scheduledTile = new notifications.ScheduledTileNotification(xmls[i], dueTime);
                    scheduledTile.id = "tile_" + (i + 1);
                    tileUpdater.addToSchedule(scheduledTile);
                }
            }
        });
    }
    function Size(uWidth, uHeight) {
        this.width = uWidth || 0;
        this.height = uHeight || 0;
        Object.defineProperty(this, "scaledWidth", {
            get: function () {
                return this.width * DPI.fscale;
            },
            set: function (value) {
                if (typeof value !== "number") throw "Error: require number type.";
                return this.width = value / DPI.fscale;
            }
        });
        Object.defineProperty(this, "scaledHeight", {
            get: function () { return this.height * DPI.fscale; },
            set: function (value) {
                if (typeof value !== "number") throw "Error: require number type.";
                return this.height = value / DPI.fscale;
            }
        });
        this.equals = function (another) {
            if (!another) return false;
            return this.width === another.width && this.height === another.height;
        }
        this.valueOf = function () {
            return this.width + "|" + this.height;
        }
        this.toString = function () {
            return "width: " + this.width + ", height: " + this.height;
        }
    }
    function TileSize(uWidth, uHeight, swSizeType) {
        this._size = new Size();
        this._size.width = uWidth;
        this._size.height = uHeight;
        this._type = NString.trim(NString.tolower(swSizeType));
        if (NString.empty(this._type)) throw "Error: type name error.";
        Object.defineProperty(this, "size", {
            get: function () { return this._size; }
        });
        Object.defineProperty(this, "width", {
            get: function () { return this._size.width; }
        });
        Object.defineProperty(this, "height", {
            get: function () { return this._size.height; }
        });
        Object.defineProperty(this, "scaledWidth", {
            get: function () { return this._size.scaledWidth; }
        });
        Object.defineProperty(this, "scaledHeight", {
            get: function () { return this._size.scaledHeight; }
        });
        Object.defineProperty(this, "type", {
            get: function () { return NString.trim(NString.tolower(this._type)); }
        });
        this.toString = function () { return this.type; }
        this.equals = function (another) {
            if (!another) return false;
            return this.width === another.width && this.height === another.height;
        }
        this.valueOf = function () {
            return this.type;
        }
    }
    extern({
        Tile: {
            update: updateTile,
            Const: {
                Size: {
                    Small: new TileSize(70, 70, "small"),
                    Medium: new TileSize(150, 150, "medium"),
                    Wide: new TileSize(310, 150, "wide"),
                    Large: new TileSize(310, 310, "large")
                }
            }
        }
    });
    Object.freeze(Tile.Const.Size);
})();