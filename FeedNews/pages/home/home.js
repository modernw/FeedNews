(function () {
    "use strict";
    var settings = Windows.Storage.ApplicationData.current.localSettings;
    var ITEM_NAMESPACE = {
        provider: "provider",
        channel: "channel",
        category: "category"
    };
    var StatusNotice = new (function StatusNotice() {
        if (this._instance) return this._instance;
        else this._instance = this;
        this.Const = {
            IconMode: {
                none: 0,
                icon: 1,
                loading: 2
            }
        };
        this._node = null;
        // 0 none; 1 icon; 2 loading
        this._iconmode = this.Const.IconMode.none;
        this._icon = "";
        // delay == 0 means always show
        this._delay = 0;
        this._text = "";
        this._timer = null;
        this._timer2 = null;
        this._timer3 = null;
        function getElements(node) {
            return {
                progress: node.querySelector("progress"),
                icon: node.querySelector(".icon"),
                text: node.querySelector(".text"),
            };
        }
        this.show = function () {
            if (!this._node) {
                this._node = document.createElement("div");
                this._node.classList.add("statustips");
                var progress = document.createElement("progress");
                this._node.appendChild(progress);
                progress.style.opacity = 1;
                var icon = document.createElement("span");
                icon.style.opacity = 1;
                icon.classList.add("icon");
                this._node.appendChild(icon);
                var text = document.createElement("span");
                text.classList.add("text");
                this._node.appendChild(text);
                this._node.style.top = "10px";
                document.body.appendChild(this._node);
            }
            var elements = getElements(this._node);
            elements.icon.textContent = "";
            switch (this._iconmode) {
                case this.Const.IconMode.icon: {
                    elements.icon.textContent = "";
                    elements.icon.style.opacity = 1;
                    elements.icon.style.display = "";
                    elements.progress.style.opacity = 0;
                    elements.progress.style.display = "none";
                } break;
                case this.Const.IconMode.loading: {
                    elements.progress.style.opacity = 1;
                    elements.progress.style.display = "";
                    elements.icon.style.opacity = 0;
                    elements.icon.style.display = "none";
                } break;
                case this.Const.IconMode.none:
                default: {
                    elements.progress.style.opacity = 0;
                    elements.icon.style.opacity = 0;
                    setTimeout(function () {
                        elements.progress.style.display = "none";
                        elements.progress.style.display = "none";
                    }, 500);
                } break;
            }
            elements.text.textContent = this._text;
            elements.icon.innerHTML = window.toStaticHTML(this._icon);
            this._node.style.opacity = 1;
            this._node.style.animation = generateAnimeString([AnimationKeyFrames.Flyout.fromBottom, AnimationKeyFrames.Opacity.visible], 500);
            this._node.style.display = "";
            if (this._delay) {
                if (this._timer) { clearTimeout(this._timer); this._timer = null; }
                if (this.timer2) { clearTimeout(this._timer2); this._timer2 = null; }
                if (this._delay) {
                    this._timer = setTimeout(function (node) {
                        node.style.opacity = 0;
                        this._timer2 = setTimeout(function (node) {
                            node.style.display = "none";
                        }, 500, node);
                        this._timer3 = setTimeout(function (node) {
                            node.style.animation = "";
                        }, 500, node);
                    }, this._delay, this._node);
                } else {
                    this._timer = null;
                    this._timer3 = setTimeout(function (node) {
                        node.style.animation = "";
                    }, 500, this._node);
                }
            }
            if (this._timer3) { clearTimeout(this._timer3); this._timer3 = null; }
        };
        this.hide = function () {
            if (this._timer) clearTimeout(this._timer);
            if (this._timer2) clearTimeout(this._timer);
            if (this._node) {
                this._node.style.opacity = 0;
                this._timer2 = setTimeout(function (node) {
                    node.style.display = "none";
                }, 500, this._node);
            }
        };
        Object.defineProperty(this, "iconmode", {
            get: function () { return this._iconmode; },
            set: function (uIconMode) {
                var elements = null;
                if (this._node) {
                    elements = getElements(this._node);
                    elements.icon.textContent = "";
                }
                switch (uIconMode) {
                    case this.Const.IconMode.none:
                    case this.Const.IconMode.icon:
                    case this.Const.IconMode.loading: {
                        if (this._node) {
                            switch (uIconMode) {
                                case this.Const.IconMode.icon: {
                                    elements.icon.textContent = "";
                                    elements.icon.style.opacity = 1;
                                    elements.icon.style.display = "";
                                    elements.progress.style.opacity = 0;
                                    elements.progress.style.display = "none";
                                } break;
                                case this.Const.IconMode.loading: {
                                    elements.progress.style.opacity = 1;
                                    elements.progress.style.display = "";
                                    elements.icon.style.opacity = 0;
                                    elements.icon.style.display = "none";
                                } break;
                                case this.Const.IconMode.none:
                                default: {
                                    elements.progress.style.opacity = 0;
                                    elements.icon.style.opacity = 0;
                                    setTimeout(function () {
                                        elements.progress.style.display = "none";
                                        elements.progress.style.display = "none";
                                    }, 500);
                                } break;
                            }
                        }
                    } break;
                    default: {
                        throw "错误：非法的 Icon Mode";
                    }
                }
                if (this._node) { this._iconmode = uIconMode; elements.icon.innerHTML = this._icon; }
            }
        });
        Object.defineProperty(this, "icon", {
            get: function () { return this._icon; },
            set: function (swValue) {
                this._icon = swValue;
                if (this._node) {
                    var elements = getElements(this._node);
                    elements.icon.innerHTML = "";
                    elements.icon.innerHTML = this._icon;
                }
            }
        });
        Object.defineProperty(this, "text", {
            get: function () { return this._text; },
            set: function (swValue) {
                this._text = swValue;
                if (this._node) {
                    var elements = getElements(this._node);
                    elements.text.textContent = this._text;
                }
            }
        });
        Object.defineProperty(this, "delay", {
            get: function () { return this._delay; },
            set: function (uMillisecond) {
                if (uMillisecond < 0) throw "错误：延时的毫秒数不能为负数";
                if (parseInt("" + uMillisecond, 10) != uMillisecond) throw "错误：延时的毫秒数必须为整数";
                this._delay = parseInt("" + uMillisecond);
                if (this._timer) { clearTimeout(this._timer); this._timer = null; }
                if (this._timer2) { clearTimeout(this._timer2); this._timer2 = null; }
                if (this._node) {
                    if (this._delay) {
                        if (this._timer) { clearTimeout(this._timer); this._timer = null; }
                        if (this._timer2) { clearTimeout(this._timer2); this._timer2 = null; }
                        if (this._delay) {
                            this._timer = setTimeout(function (node) {
                                node.style.opacity = 0;
                                this._timer2 = setTimeout(function (node) {
                                    node.style.display = "none";
                                }, 500, node);
                            }, this._delay, this._node);
                        } else {
                            if (this._timer) { clearTimeout(this._timer); this._timer = null; }
                            if (this._timer2) { clearTimeout(this._timer2); this._timer2 = null; }
                        }
                    }
                };
            }
        });
        // delay 为 0 时表示一直显示
        this.output = function (swIcon, uIconMode, uDelayMS, swText) {
            this.icon = swIcon;
            this.iconmode = uIconMode;
            this.delay = uDelayMS;
            this.text = swText;
            this.show();
        }
    })();
    function FeedItem(cArticle, cChannel) {
        function generatePlaceholderUrl(strText, intWidth, intHeight, clrBg, clrFg, strFontName) {
            intWidth = intWidth || 500;
            intHeight = intHeight || 500;
            function getRandomColor() {
                var intR = Math.floor(Math.random() * 256);
                var intG = Math.floor(Math.random() * 256);
                var intB = Math.floor(Math.random() * 256);
                return rgbToHex(intR, intG, intB);
            }
            function rgbToHex(r, g, b) {
                return "#" + [r, g, b].map(function (x) {
                    var hex = x.toString(16);
                    return hex.length === 1 ? "0" + hex : hex;
                }).join("");
            }
            function getRelativeLuminance(hexColor) {
                if (typeof hexColor !== "string") {
                    throw new TypeError("hexColor must be a string like '#RRGGBB' or '#RGB'");
                }
                if (/^#([0-9a-f]{3})$/i.test(hexColor)) {
                    hexColor = hexColor.replace(/^#([0-9a-f])([0-9a-f])([0-9a-f])$/i, function (m, r, g, b) {
                        return "#" + r + r + g + g + b + b;
                    });
                }
                if (!/^#[0-9a-f]{6}$/i.test(hexColor)) {
                    throw new TypeError("hexColor must be in the form '#RRGGBB' or '#RGB'");
                }
                var intR = parseInt(hexColor.substr(1, 2), 16) / 255;
                var intG = parseInt(hexColor.substr(3, 2), 16) / 255;
                var intB = parseInt(hexColor.substr(5, 2), 16) / 255;
                var rgb = [intR, intG, intB];
                for (var i = 0; i < rgb.length; i++) {
                    var c = rgb[i];
                    if (c <= 0.03928) {
                        rgb[i] = c / 12.92;
                    } else {
                        rgb[i] = Math.pow((c + 0.055) / 1.055, 2.4);
                    }
                }
                intR = rgb[0];
                intG = rgb[1];
                intB = rgb[2];
                return 0.2126 * intR + 0.7152 * intG + 0.0722 * intB;
            }
            function getContrastRatio(clr1, clr2) {
                var lum1 = getRelativeLuminance(clr1);
                var lum2 = getRelativeLuminance(clr2);
                var brightest = Math.max(lum1, lum2);
                var darkest = Math.min(lum1, lum2);
                return (brightest + 0.05) / (darkest + 0.05);
            }
            function getAutoTextColor(clrBg) {
                var ratioWithBlack = getContrastRatio(clrBg, "#000000");
                var ratioWithWhite = getContrastRatio(clrBg, "#FFFFFF");
                return (ratioWithBlack >= ratioWithWhite) ? "#000000" : "#FFFFFF";
            }
            if (!clrBg && !clrFg) {
                clrBg = getRandomColor();
                clrFg = getAutoTextColor(clrBg);
            }
            else if (clrBg && !clrFg) {
                clrFg = getAutoTextColor(clrBg);
            }
            else if (!clrBg && clrFg) {
                var boolOk = false;
                while (!boolOk) {
                    clrBg = getRandomColor();
                    if (getContrastRatio(clrBg, clrFg) >= 4.5) {
                        boolOk = true;
                    }
                }
            }
            if (!strText) strText = "";
            if (!strFontName) strFontName = "Microsoft YaHei Light";
            var strUrl = "https://placeholder.vn/placeholder/" + intWidth + "x" + intHeight +
                 "?bg=" + clrBg.replace("#", "") + "&color=" + clrFg.replace("#", "");
            strUrl += "&text=" + encodeURIComponent(strText);
            if (strFontName && strFontName.length > 0) {
                strUrl += "&font=" + encodeURIComponent(strFontName);
            }
            return strUrl;
        }
        this.title = cArticle.title || "";
        this.author = cArticle.author || "";
        this.channel = cChannel.title || "";
        this.pubdate = cArticle.pubdate || null;
        this.cover = cArticle.cover;
        if (NString.empty(this.cover)) {
            if (typeof cArticle.getFirstPic === "function") {
                this.cover = this.cover || cArticle.getFirstPic() || "";
            }
        }
        // if (NString.empty(this.cover)) { this.cover = this.cover || cChannel.image.url; }
        this.cover = this.cover || generatePlaceholderUrl(cChannel.title, 180, 180) || "";
        this.url = cArticle.link || cArticle.guid || "";
        var DateTimeFormatter = Windows.Globalization.DateTimeFormatting.DateTimeFormatter;
        this.getdata = function () {
            return {
                title: this.title,
                author: this.author,
                channel: this.channel,
                pubdate: this.pubdate ? new Date(this.pubdate).toLocaleString() : "",
                cover: "url('" + this.cover + "')",
                url: this.url
            };
        };
    }
    var listViewEl = null;
    var data = new WinJS.Binding.List([]);
    var lastBlock = {
        provider: "",
        channel: "",
        category: ""
    };
    var isFirstNavigated = false;
    function getDeltaMS(cDateLeft, cDateRight) {
        function getDate(value) {
            if (value instanceof Date) { return value; }
            else if (typeof value === "string") { return new Date(value); }
            else {
                try {
                    return new Date(value);
                } catch (e) { return null; }
            }
        };
        function getTime(cDate) {
            var date = getDate(cDate);
            if (date === null || date === undefined) return 0;
            else return date.getTime();
        }
        try { return getTime(cDateLeft) - getTime(cDateRight); } catch (e) { return 0; }
    }
    function fabs(value) {
        return value >= 0 ? value : -value;
    }
    function getCache(swProvider, swChannel, swCategory) {
        var TIME_STAME_LIMIT = 3 * 60 * 1000;
        var CACHE_FOLDER_PATH = "Cache";
        StatusNotice.output("&#57623;", StatusNotice.Const.IconMode.loading, 0, "正在读取缓存...");
        var jsonfile = new JSONFile();
        return jsonfile.open(CACHE_FOLDER_PATH, NString.normalize(swProvider) + "-" + NString.normalize(swChannel) + "-" + NString.normalize(swCategory) + ".json")
        .then(function (complete) {
            StatusNotice.output("&#57623;", StatusNotice.Const.IconMode.loading, 0, "正在检查缓存...");
            var jdata = complete.getData();
            var tst = jdata.timestamp;
            var delta = getDeltaMS(tst, new Date());
            if (isNaN(delta)) delta = TIME_STAME_LIMIT + 1;
            if (fabs(delta) >= TIME_STAME_LIMIT) {
                jdata.data = null;
                return jsonfile.save().then(function () {
                    return null;
                });
            } else {
                return jsonfile.save().then(function () { return jdata.data; });
            }
        }, function (error) {
            return null;
        });
    }
    function setCache(swProvider, swChannel, swCategory, cFeed) {
        var CACHE_FOLDER_PATH = "Cache";
        StatusNotice.output("&#57623;", StatusNotice.Const.IconMode.loading, 0, "正在缓存...");
        var jsonfile = new JSONFile();
        return jsonfile.open(CACHE_FOLDER_PATH, NString.normalize(swProvider) + "-" + NString.normalize(swChannel) + "-" + NString.normalize(swCategory) + ".json")
        .then(function (complete) {
            var jdata = complete.getData();
            jdata["timestamp"] = new Date();
            jdata["data"] = cFeed;
            return jsonfile.save();
        }, function (error) {
            return null;
        });
    }
    function fetchFeed(swProvider, swChannel, swCategory) {
        StatusNotice.output("&#57623;", StatusNotice.Const.IconMode.loading, 0, "正在读取 Feeds 储存列表...");
        return FeedManager.load().then(function (complete) {
            var category = FeedManager.getCategory(swProvider, swChannel, swCategory);
            if (!category) {
                StatusNotice.output("&#128546;", StatusNotice.Const.IconMode.icon, 5000, "无效的更新。");
                return;
            }
            var urls = FeedManager.getCategoryUrls(category);
            StatusNotice.output("&#57623;", StatusNotice.Const.IconMode.loading, 0, "正在获取 Feeds...");
            return Feed.update(urls, category.updateStrategy);
        });
    }
    function updateFeeds(swProvider, swChannel, swCategory) {
        function isChange() {
            var nowdata = {
                provider: settings.values["nowProvider"],
                channel: settings.values["nowChannel"],
                category: settings.values["nowCategory"]
            };
            var ret = !(NString.equals(lastBlock.provider, nowdata.provider) &&
                NString.equals(lastBlock.channel, nowdata.channel) &&
                NString.equals(lastBlock.category, nowdata.category));
            if (!ret) ret = data.length == 0;
            lastBlock = nowdata;
            return ret;
        }
        if (!isChange()) {
            return; // 没变化直接退出
        }
        Feed.cancel();
        var nowdata = {
            provider: settings.values["nowProvider"],
            channel: settings.values["nowChannel"],
            category: settings.values["nowCategory"]
        };
        if (data.length) data.splice(0, data.length);
        return FeedManager.load().done(function (complete) {
            var category = FeedManager.getCategory(nowdata.provider, nowdata.channel, nowdata.category);
            if (!category) {
                StatusNotice.output("&#128546;", StatusNotice.Const.IconMode.icon, 5000, "无效的更新。");
                return;
            }
            StatusNotice.output("&#57623;", StatusNotice.Const.IconMode.loading, 0, "正在检查缓存...");
            var fetchtask = function () {
                fetchFeed(nowdata.provider, nowdata.channel, nowdata.category).done(
                        function (result) {
                            if (result) {
                                if (result.isok) {
                                    var len = result.result.articles.length;
                                    for (var i = 0; i < len; i++) {
                                        var item = new FeedItem(result.result.articles[i], result.result.channel);
                                        data.push(item.getdata());
                                    }
                                    setCache(nowdata.provider, nowdata.channel, nowdata.category, result.toJson().result).done(function () {
                                        StatusNotice.output("&#57611;", StatusNotice.Const.IconMode.icon, 5000, "更新完成！已更新 " + len + " 条文章。");
                                    }, function () {
                                        StatusNotice.output("&#57611;", StatusNotice.Const.IconMode.icon, 5000, "更新完成！已更新 " + len + " 条文章。");
                                    });
                                } else {
                                    StatusNotice.output("&#128546;", StatusNotice.Const.IconMode.icon, 5000, "更新失败。状态：" + (result ? result.status : "未知") + "，原因：" + (result ? result.error : "未知"));
                                }
                            }
                        },
                        function (error) {
                            StatusNotice.output("&#128546;", StatusNotice.Const.IconMode.icon, 5000, "更新失败。原因：" + (error.message || error || "未知"));
                        }
                    );
            };
            getCache(nowdata.provider, nowdata.channel, nowdata.category).done(function (cachedData) {
                if (cachedData) {
                    for (var i = 0; i < cachedData.articles.length; i++) {
                        var item = new FeedItem(cachedData.articles[i], cachedData.channel);
                        var jsdata = item.getdata();
                        data.push(jsdata);
                    }
                    StatusNotice.output("&#57611;", StatusNotice.Const.IconMode.icon, 3000, "已从缓存加载 " + cachedData.articles.length + " 条文章。");
                } else {
                    fetchtask();
                }
            }, function (error) {
                StatusNotice.output("&#128546;", StatusNotice.Const.IconMode.icon, 5000, "读取缓存失败：" + (error.message || error));
            });
        });
    }
    function createItem(swId, swDisplayName, swNameSpace) {
        var node = document.createElement("div");
        node.tabIndex = 0;
        var span = document.createElement("span");
        span.style.pointerEvents = "none";
        node.id = NString.normalize(swNameSpace) + NString.normalize(swId);
        node.dataset.id = NString.normalize(swId);
        node.dataset.ns = NString.normalize(swNameSpace);
        node.classList.add("item");
        node.appendChild(span);
        span.textContent = swDisplayName;
        return node;
    }
    function initFeedList() {
        var provider = document.getElementById("providerlist");
        var channel = document.getElementById("channellist");
        var category = document.getElementById("categorylist");
        provider.innerHTML = "";
        channel.innerHTML = "";
        category.innerHTML = "";
        if (!FeedManager) { return; }
        FeedManager.load().done(function (complete) {
            var nowdata = {
                provider: settings.values["nowProvider"],
                channel: settings.values["nowChannel"],
                category: settings.values["nowCategory"]
            };
            var datas = FeedManager.datas();
            function initCategoryItems() {
                category.innerHTML = "";
                var nowdata = {
                    provider: settings.values["nowProvider"],
                    channel: settings.values["nowChannel"],
                    category: settings.values["nowCategory"]
                };
                var categories = FeedManager.getChannel(settings.values["nowProvider"], settings.values["nowChannel"]).categories;
                var nowCategory = settings.values["nowCategory"];
                for (var i = 0; i < categories.length; i++) {
                    var sc = categories[i];
                    var cnode = createItem(sc.id, sc.displayName, ITEM_NAMESPACE.category);
                    cnode.classList.add("light");
                    category.appendChild(cnode);
                    WinJS.UI.Animation.createAddToListAnimation(cnode, category).execute();
                    cnode.addEventListener("click", function (event) {
                        var isselected = this.classList.contains("selected");
                        if (!isselected) {
                            if (data.length) data.splice(0, data.length);
                            var categoryitems = category.querySelectorAll(".item");
                            for (var j = 0; j < categoryitems.length; j++) {
                                categoryitems[j].classList.remove("selected");
                            }
                            this.classList.add("selected");
                            settings.values["nowCategory"] = this.dataset.id;
                            updateFeeds(nowdata.provider, nowdata.channel, nowdata.category);
                        }
                        if (this.disabled === true) {
                            this.classList.remove("selected");
                        }
                    });
                    if (NString.equals(nowCategory, sc.id)) {
                        cnode.click();
                    }
                }
                var nowSelected = category.querySelector(".selected");
                if (!nowSelected) {
                    var firstNode = category.querySelector(".item");
                    if (firstNode) firstNode.click();
                }
            }
            function initChannelItems() {
                channel.innerHTML = "";
                var channels = FeedManager.getProvider(settings.values["nowProvider"]).channels;
                var nowChannel = settings.values["nowChannel"];
                for (var i = 0; i < channels.length; i++) {
                    var sp = channels[i];
                    var cnode = createItem(sp.id, sp.displayName, ITEM_NAMESPACE.channel);
                    channel.appendChild(cnode);
                    WinJS.UI.Animation.createAddToListAnimation(cnode, channel).execute();
                    cnode.addEventListener("click", function (event) {
                        var isselected = this.classList.contains("selected");
                        if (!isselected) {
                            category.innerHTML = "";
                            if (data.length) data.splice(0, data.length);
                            var channelitems = channel.querySelectorAll(".item");
                            for (var j = 0; j < channelitems.length; j++) {
                                channelitems[j].classList.remove("selected");
                            }
                            this.classList.add("selected");
                            settings.values["nowChannel"] = this.dataset.id;
                            initCategoryItems();
                        }
                        if (this.disabled === true) {
                            this.classList.remove("selected");
                        }
                    });
                    if (NString.equals(nowChannel, sp.id)) {
                        cnode.click();
                    }
                }
                var nowSelected = channel.querySelector(".selected");
                if (!nowSelected) {
                    var firstNode = channel.querySelector(".item");
                    if (firstNode) firstNode.click();
                }
            }
            try {
                if (datas.providers !== null && datas.providers !== undefined && datas.providers) {
                    var nowProvider = settings.values["nowProvider"];
                    for (var i = 0; i < datas.providers.length; i++) {
                        var sp = datas.providers[i];
                        var pnode = createItem(sp.id, sp.displayName, ITEM_NAMESPACE.provider);
                        provider.appendChild(pnode);
                        WinJS.UI.Animation.createAddToListAnimation(pnode, provider).execute();
                        pnode.addEventListener("click", function (event) {
                            var isselected = this.classList.contains("selected");
                            if (!isselected) {
                                channel.innerHTML = "";
                                category.innerHTML = "";
                                if (data.length) data.splice(0, data.length);
                                var provideritems = provider.querySelectorAll(".item");
                                for (var j = 0; j < provideritems.length; j++) {
                                    provideritems[j].classList.remove("selected");
                                }
                                this.classList.add("selected");
                                settings.values["nowProvider"] = this.dataset.id;
                                initChannelItems();
                            }
                            if (this.disabled === true) {
                                this.classList.remove("selected");
                            }
                        });
                        if (NString.equals(nowProvider, sp.id)) {
                            pnode.click();
                        }
                    }
                    var nowSelected = provider.querySelector(".selected");
                    if (!nowSelected) {
                        var firstNode = provider.querySelector(".item");
                        if (firstNode) firstNode.click();
                    }
                }
            } catch (e) { }
        });
    }
    function initExampleData() {
        var providers = {
            ithome: {
                display: "IT 之家",
                channels: {
                    aoffical: {
                        display: "主页",
                        categorys: {
                            news: {
                                display: "最新",
                                showintile: true,
                                updatemode: FeedUpdateStrategy.PrimaryFallback,
                                sources: [
                                    "https://www.ithome.com/rss/"
                                ]
                            }
                        }
                    },
                    ranking: {
                        display: "热榜",
                        categorys: {
                            hours24: {
                                display: "24 小时阅读榜",
                                showintile: true,
                                updatemode: FeedUpdateStrategy.PrimaryFallback,
                                sources: [
                                    "https://rsshub.rssforever.com/ithome/ranking/24h",
                                    "https://rsshub.app/ithome/ranking/24h"
                                ]
                            },
                            days7: {
                                display: "7 天最热",
                                showintile: true,
                                updatemode: FeedUpdateStrategy.PrimaryFallback,
                                sources: [
                                    "https://rsshub.rssforever.com/ithome/ranking/7days",
                                    "https://rsshub.app/ithome/ranking/7days"
                                ]
                            },
                            monthly: {
                                display: "月榜",
                                showintile: true,
                                updatemode: FeedUpdateStrategy.PrimaryFallback,
                                sources: [
                                    "https://rsshub.rssforever.com/ithome/ranking/monthly",
                                    "https://rsshub.app/ithome/ranking/monthly"
                                ]
                            }
                        },
                    },
                    it: {
                        display: "IT 资讯",
                        categorys: {
                            newer: {
                                display: "最新",
                                showintile: true,
                                updatemode: FeedUpdateStrategy.PrimaryFallback,
                                sources: [
                                    "https://rsshub.rssforever.com/ithome/it",
                                    "https://rsshub.app/ithome/it"
                                ]
                            }
                        }
                    },
                    soft: {
                        display: "软件之家",
                        categorys: {
                            newer: {
                                display: "最新",
                                showintile: true,
                                updatemode: FeedUpdateStrategy.PrimaryFallback,
                                sources: [
                                    "https://rsshub.rssforever.com/ithome/soft",
                                    "https://rsshub.app/ithome/soft"
                                ]
                            }
                        }
                    },
                    win10: {
                        display: "Win10 之家",
                        categorys: {
                            newer: {
                                display: "最新",
                                showintile: true,
                                updatemode: FeedUpdateStrategy.PrimaryFallback,
                                sources: [
                                    "https://rsshub.rssforever.com/ithome/win10",
                                    "https://rsshub.app/ithome/win10"
                                ]
                            }
                        }
                    },
                    win11: {
                        display: "Win11 之家",
                        categorys: {
                            newer: {
                                display: "最新",
                                showintile: true,
                                updatemode: FeedUpdateStrategy.PrimaryFallback,
                                sources: [
                                    "https://rsshub.rssforever.com/ithome/win11",
                                    "https://rsshub.app/ithome/win11"
                                ]
                            }
                        }
                    },
                    iphone: {
                        display: "iPhone 之家",
                        categorys: {
                            newer: {
                                display: "最新",
                                showintile: true,
                                updatemode: FeedUpdateStrategy.PrimaryFallback,
                                sources: [
                                    "https://rsshub.rssforever.com/ithome/iphone",
                                    "https://rsshub.app/ithome/iphone"
                                ]
                            }
                        }
                    },
                    ipad: {
                        display: "iPad 之家",
                        categorys: {
                            newer: {
                                display: "最新",
                                showintile: true,
                                updatemode: FeedUpdateStrategy.PrimaryFallback,
                                sources: [
                                    "https://rsshub.rssforever.com/ithome/ipad",
                                    "https://rsshub.app/ithome/ipad"
                                ]
                            }
                        }
                    },
                    android: {
                        display: "Android 之家",
                        categorys: {
                            newer: {
                                display: "最新",
                                showintile: true,
                                updatemode: FeedUpdateStrategy.PrimaryFallback,
                                sources: [
                                    "https://rsshub.rssforever.com/ithome/android",
                                    "https://rsshub.app/ithome/android"
                                ]
                            }
                        }
                    },
                    digi: {
                        display: "数码之家",
                        categorys: {
                            newer: {
                                display: "最新",
                                showintile: true,
                                updatemode: FeedUpdateStrategy.PrimaryFallback,
                                sources: [
                                    "https://rsshub.rssforever.com/ithome/digi",
                                    "https://rsshub.app/ithome/digi"
                                ]
                            }
                        }
                    },
                    next: {
                        display: "智能时代",
                        categorys: {
                            newer: {
                                display: "最新",
                                showintile: true,
                                updatemode: FeedUpdateStrategy.PrimaryFallback,
                                sources: [
                                    "https://rsshub.rssforever.com/ithome/next",
                                    "https://rsshub.app/ithome/next"
                                ]
                            }
                        }
                    }
                }
            },
            people: {
                display: "人民网",
                channels: {
                    headlines: {
                        display: "首页头条",
                        categorys: {
                            newer: {
                                display: "最新",
                                showintile: true,
                                updatemode: FeedUpdateStrategy.PrimaryFallback,
                                sources: [
                        "https://rsshub.rssforever.com/people",
                        "https://rsshub.app/people"
                                ]
                            },
                            offical: {
                                display: "要问快讯（官方）",
                                showintile: true,
                                updatemode: FeedUpdateStrategy.PrimaryFallback,
                                sources: [
                                    "http://www.people.com.cn/rss/ywkx.xml"
                                ]
                            }
                        }
                    },
                    politics: {
                        display: "时政频道",
                        categorys: {
                            newer: {
                                display: "最新",
                                showintile: true,
                                updatemode: FeedUpdateStrategy.PrimaryFallback,
                                sources: ["http://www.people.com.cn/rss/politics.xml"]
                            }
                        }
                    },
                    world: {
                        display: "国际频道",
                        categorys: {
                            newer: {
                                display: "最新",
                                showintile: true,
                                updatemode: FeedUpdateStrategy.PrimaryFallback,
                                sources: ["http://www.people.com.cn/rss/world.xml"]
                            }
                        }
                    },
                    finance: {
                        display: "财政频道",
                        categorys: {
                            newer: {
                                display: "最新",
                                showintile: true,
                                updatemode: FeedUpdateStrategy.PrimaryFallback,
                                sources: ["http://www.people.com.cn/rss/finance.xml"]
                            }
                        }
                    },
                    money: {
                        display: "金融频道",
                        categorys: {
                            newer: {
                                display: "最新",
                                showintile: true,
                                updatemode: FeedUpdateStrategy.PrimaryFallback,
                                sources: ["http://www.people.com.cn/rss/money.xml"]
                            }
                        }
                    },
                    energy: {
                        display: "能源频道",
                        categorys: {
                            newer: {
                                display: "最新",
                                showintile: true,
                                updatemode: FeedUpdateStrategy.PrimaryFallback,
                                sources: ["http://www.people.com.cn/rss/energy.xml"]
                            }
                        }
                    },
                    ccnews: {
                        display: "央企频道",
                        categorys: {
                            newer: {
                                display: "最新",
                                showintile: true,
                                updatemode: FeedUpdateStrategy.PrimaryFallback,
                                sources: ["http://www.people.com.cn/rss/ccnews.xml"]
                            }
                        }
                    },
                    sports: {
                        display: "体育频道",
                        categorys: {
                            newer: {
                                display: "最新",
                                showintile: true,
                                updatemode: FeedUpdateStrategy.PrimaryFallback,
                                sources: ["http://www.people.com.cn/rss/sports.xml"]
                            }
                        }
                    },
                    legal: {
                        display: "法制频道",
                        categorys: {
                            newer: {
                                display: "最新",
                                showintile: true,
                                updatemode: FeedUpdateStrategy.PrimaryFallback,
                                sources: ["http://www.people.com.cn/rss/legal.xml"]
                            }
                        }
                    },
                    edu: {
                        display: "教育频道",
                        categorys: {
                            newer: {
                                display: "最新",
                                showintile: true,
                                updatemode: FeedUpdateStrategy.PrimaryFallback,
                                sources: ["http://www.people.com.cn/rss/edu.xml"]
                            }
                        }
                    },
                    culture: {
                        display: "文化频道",
                        categorys: {
                            newer: {
                                display: "最新",
                                showintile: true,
                                updatemode: FeedUpdateStrategy.PrimaryFallback,
                                sources: ["http://www.people.com.cn/rss/culture.xml"]
                            }
                        }
                    },
                    society: {
                        display: "社会频道",
                        categorys: {
                            newer: {
                                display: "最新",
                                showintile: true,
                                updatemode: FeedUpdateStrategy.PrimaryFallback,
                                sources: ["http://www.people.com.cn/rss/society.xml"]
                            }
                        }
                    },
                    media: {
                        display: "传媒频道",
                        categorys: {
                            newer: {
                                display: "最新",
                                showintile: true,
                                updatemode: FeedUpdateStrategy.PrimaryFallback,
                                sources: ["http://www.people.com.cn/rss/media.xml"]
                            }
                        }
                    },
                    theory: {
                        display: "理论频道",
                        categorys: {
                            newer: {
                                display: "最新",
                                showintile: true,
                                updatemode: FeedUpdateStrategy.PrimaryFallback,
                                sources: ["http://www.people.com.cn/rss/theory.xml"]
                            }
                        }
                    },
                    ent: {
                        display: "娱乐频道",
                        categorys: {
                            newer: {
                                display: "最新",
                                showintile: true,
                                updatemode: FeedUpdateStrategy.PrimaryFallback,
                                sources: ["http://www.people.com.cn/rss/ent.xml"]
                            }
                        }
                    },
                    opinion: {
                        display: "观点频道",
                        categorys: {
                            newer: {
                                display: "最新",
                                showintile: true,
                                updatemode: FeedUpdateStrategy.PrimaryFallback,
                                sources: ["http://www.people.com.cn/rss/opinion.xml"]
                            }
                        }
                    },
                    auto: {
                        display: "汽车频道",
                        categorys: {
                            newer: {
                                display: "最新",
                                showintile: true,
                                updatemode: FeedUpdateStrategy.PrimaryFallback,
                                sources: ["http://www.people.com.cn/rss/auto.xml"]
                            }
                        }
                    },
                    haixia: {
                        display: "海峡两岸",
                        categorys: {
                            newer: {
                                display: "最新",
                                showintile: true,
                                updatemode: FeedUpdateStrategy.PrimaryFallback,
                                sources: ["http://www.people.com.cn/rss/haixia.xml"]
                            }
                        }
                    },
                    it: {
                        display: "IT 频道",
                        categorys: {
                            newer: {
                                display: "最新",
                                showintile: true,
                                updatemode: FeedUpdateStrategy.PrimaryFallback,
                                sources: ["http://www.people.com.cn/rss/it.xml"]
                            }
                        }
                    },
                    env: {
                        display: "环保频道",
                        categorys: {
                            newer: {
                                display: "最新",
                                showintile: true,
                                updatemode: FeedUpdateStrategy.PrimaryFallback,
                                sources: ["http://www.people.com.cn/rss/env.xml"]
                            }
                        }
                    },
                    gongyi: {
                        display: "公益频道",
                        categorys: {
                            newer: {
                                display: "最新",
                                showintile: true,
                                updatemode: FeedUpdateStrategy.PrimaryFallback,
                                sources: ["http://www.people.com.cn/rss/gongyi.xml"]
                            }
                        }
                    },
                    caipiao: {
                        display: "彩票频道",
                        categorys: {
                            newer: {
                                display: "最新",
                                showintile: true,
                                updatemode: FeedUpdateStrategy.PrimaryFallback,
                                sources: ["http://www.people.com.cn/rss/caipiao.xml"]
                            }
                        }
                    },
                    scitech: {
                        display: "科技频道",
                        categorys: {
                            newer: {
                                display: "最新",
                                showintile: true,
                                updatemode: FeedUpdateStrategy.PrimaryFallback,
                                sources: ["http://www.people.com.cn/rss/scitech.xml"]
                            }
                        }
                    },
                    history: {
                        display: "文史频道",
                        categorys: {
                            newer: {
                                display: "最新",
                                showintile: true,
                                updatemode: FeedUpdateStrategy.PrimaryFallback,
                                sources: ["http://www.people.com.cn/rss/history.xml"]
                            }
                        }
                    },
                    art: {
                        display: "收藏频道",
                        categorys: {
                            newer: {
                                display: "最新",
                                showintile: true,
                                updatemode: FeedUpdateStrategy.PrimaryFallback,
                                sources: ["http://www.people.com.cn/rss/art.xml"]
                            }
                        }
                    },
                    book: {
                        display: "读书频道",
                        categorys: {
                            newer: {
                                display: "最新",
                                showintile: true,
                                updatemode: FeedUpdateStrategy.PrimaryFallback,
                                sources: ["http://www.people.com.cn/rss/book.xml"]
                            }
                        }
                    },
                    shipin: {
                        display: "食品频道",
                        categorys: {
                            newer: {
                                display: "最新",
                                showintile: true,
                                updatemode: FeedUpdateStrategy.PrimaryFallback,
                                sources: ["http://www.people.com.cn/rss/shipin.xml"]
                            }
                        }
                    },
                    game: {
                        display: "游戏频道",
                        categorys: {
                            newer: {
                                display: "最新",
                                showintile: true,
                                updatemode: FeedUpdateStrategy.PrimaryFallback,
                                sources: ["http://www.people.com.cn/rss/game.xml"]
                            }
                        }
                    },
                    homea: {
                        display: "家电频道",
                        categorys: {
                            newer: {
                                display: "最新",
                                showintile: true,
                                updatemode: FeedUpdateStrategy.PrimaryFallback,
                                sources: ["http://www.people.com.cn/rss/homea.xml"]
                            }
                        }
                    },
                    house: {
                        display: "房产频道",
                        categorys: {
                            newer: {
                                display: "最新",
                                showintile: true,
                                updatemode: FeedUpdateStrategy.PrimaryFallback,
                                sources: ["http://www.people.com.cn/rss/house.xml"]
                            }
                        }
                    },
                    health: {
                        display: "健康频道",
                        categorys: {
                            newer: {
                                display: "最新",
                                showintile: true,
                                updatemode: FeedUpdateStrategy.PrimaryFallback,
                                sources: ["http://www.people.com.cn/rss/health.xml"]
                            }
                        }
                    },
                    ip: {
                        display: "知识产权",
                        categorys: {
                            newer: {
                                display: "最新",
                                showintile: true,
                                updatemode: FeedUpdateStrategy.PrimaryFallback,
                                sources: ["http://www.people.com.cn/rss/ip.xml"]
                            }
                        }
                    },
                    cpc: {
                        display: "共产党新闻网",
                        categorys: {
                            newer: {
                                display: "最新",
                                showintile: true,
                                updatemode: FeedUpdateStrategy.PrimaryFallback,
                                sources: ["http://www.people.com.cn/rss/cpc.xml"]
                            }
                        }
                    },
                    dangjian: {
                        display: "党建",
                        categorys: {
                            newer: {
                                display: "最新",
                                showintile: true,
                                updatemode: FeedUpdateStrategy.PrimaryFallback,
                                sources: ["http://www.people.com.cn/rss/dangjian.xml"]
                            }
                        }
                    },
                    dangshi: {
                        display: "党史",
                        categorys: {
                            newer: {
                                display: "最新",
                                showintile: true,
                                updatemode: FeedUpdateStrategy.PrimaryFallback,
                                sources: ["http://www.people.com.cn/rss/dangshi.xml"]
                            }
                        }
                    },
                    npc: {
                        display: "中国人大新闻",
                        categorys: {
                            newer: {
                                display: "最新",
                                showintile: true,
                                updatemode: FeedUpdateStrategy.PrimaryFallback,
                                sources: ["http://www.people.com.cn/rss/npc.xml"]
                            }
                        }
                    },
                    cppcc: {
                        display: "中国政协新闻",
                        categorys: {
                            newer: {
                                display: "最新",
                                showintile: true,
                                updatemode: FeedUpdateStrategy.PrimaryFallback,
                                sources: ["http://www.people.com.cn/rss/cppcc.xml"]
                            }
                        }
                    },
                    military: {
                        display: "军事频道",
                        categorys: {
                            newer: {
                                display: "最新",
                                showintile: true,
                                updatemode: FeedUpdateStrategy.PrimaryFallback,
                                sources: ["http://www.people.com.cn/rss/military.xml"]
                            }
                        }
                    },
                    tv: {
                        display: "人民电视",
                        categorys: {
                            newer: {
                                display: "最新",
                                showintile: true,
                                updatemode: FeedUpdateStrategy.PrimaryFallback,
                                sources: ["http://www.people.com.cn/rss/tv.xml"]
                            }
                        }
                    },
                    unn: {
                        display: "地方频道",
                        categorys: {
                            newer: {
                                display: "最新",
                                showintile: true,
                                updatemode: FeedUpdateStrategy.PrimaryFallback,
                                sources: ["http://www.people.com.cn/rss/unn.xml"]
                            }
                        }
                    },
                    travel: {
                        display: "旅游频道",
                        categorys: {
                            newer: {
                                display: "最新",
                                showintile: true,
                                updatemode: FeedUpdateStrategy.PrimaryFallback,
                                sources: ["http://www.people.com.cn/rss/travel.xml"]
                            }
                        }
                    },
                    renshi: {
                        display: "人事频道",
                        categorys: {
                            newer: {
                                display: "最新",
                                showintile: true,
                                updatemode: FeedUpdateStrategy.PrimaryFallback,
                                sources: ["http://www.people.com.cn/rss/renshi.xml"]
                            }
                        }
                    },
                    leaders: {
                        display: "领导频道",
                        categorys: {
                            newer: {
                                display: "最新",
                                showintile: true,
                                updatemode: FeedUpdateStrategy.PrimaryFallback,
                                sources: ["http://www.people.com.cn/rss/leaders.xml"]
                            }
                        }
                    },
                    pic: {
                        display: "图片频道",
                        categorys: {
                            newer: {
                                display: "最新",
                                showintile: true,
                                updatemode: FeedUpdateStrategy.PrimaryFallback,
                                sources: ["http://www.people.com.cn/rss/pic.xml"]
                            }
                        }
                    },
                    yuqing: {
                        display: "舆情频道",
                        categorys: {
                            newer: {
                                display: "最新",
                                showintile: true,
                                updatemode: FeedUpdateStrategy.PrimaryFallback,
                                sources: ["http://www.people.com.cn/rss/yuqing.xml"]
                            }
                        }
                    },
                    hm: {
                        display: "港澳频道",
                        categorys: {
                            newer: {
                                display: "最新",
                                showintile: true,
                                updatemode: FeedUpdateStrategy.PrimaryFallback,
                                sources: ["http://www.people.com.cn/rss/hm.xml"]
                            }
                        }
                    },
                    tc: {
                        display: "通信频道",
                        categorys: {
                            newer: {
                                display: "最新",
                                showintile: true,
                                updatemode: FeedUpdateStrategy.PrimaryFallback,
                                sources: ["http://www.people.com.cn/rss/tc.xml"]
                            }
                        }
                    },
                    lady: {
                        display: "时尚频道",
                        categorys: {
                            newer: {
                                display: "最新",
                                showintile: true,
                                updatemode: FeedUpdateStrategy.PrimaryFallback,
                                sources: ["http://www.people.com.cn/rss/lady.xml"]
                            }
                        }
                    },
                    hongmu: {
                        display: "红木频道",
                        categorys: {
                            newer: {
                                display: "最新",
                                showintile: true,
                                updatemode: FeedUpdateStrategy.PrimaryFallback,
                                sources: ["http://www.people.com.cn/rss/hongmu.xml"]
                            }
                        }
                    },
                    ru: {
                        display: "俄罗斯频道",
                        categorys: {
                            newer: {
                                display: "最新",
                                showintile: true,
                                updatemode: FeedUpdateStrategy.PrimaryFallback,
                                sources: ["http://www.people.com.cn/rss/ru.xml"]
                            }
                        }
                    },
                    japan: {
                        display: "日本频道",
                        categorys: {
                            newer: {
                                display: "最新",
                                showintile: true,
                                updatemode: FeedUpdateStrategy.PrimaryFallback,
                                sources: ["http://www.people.com.cn/rss/japan.xml"]
                            }
                        }
                    },
                    uk: {
                        display: "英国频道",
                        categorys: {
                            newer: {
                                display: "最新",
                                showintile: true,
                                updatemode: FeedUpdateStrategy.PrimaryFallback,
                                sources: ["http://www.people.com.cn/rss/uk.xml"]
                            }
                        }
                    },
                    usa: {
                        display: "美国频道",
                        categorys: {
                            newer: {
                                display: "最新",
                                showintile: true,
                                updatemode: FeedUpdateStrategy.PrimaryFallback,
                                sources: ["http://www.people.com.cn/rss/usa.xml"]
                            }
                        }
                    },
                    korea: {
                        display: "韩国频道",
                        categorys: {
                            newer: {
                                display: "最新",
                                showintile: true,
                                updatemode: FeedUpdateStrategy.PrimaryFallback,
                                sources: ["http://www.people.com.cn/rss/korea.xml"]
                            }
                        }
                    },
                    sh: {
                        display: "上海频道",
                        categorys: {
                            newer: {
                                display: "最新",
                                showintile: true,
                                updatemode: FeedUpdateStrategy.PrimaryFallback,
                                sources: ["http://www.people.com.cn/rss/sh.xml"]
                            }
                        }
                    },
                    phb: {
                        display: "热点新闻",
                        categorys: {
                            newer: {
                                display: "最新",
                                showintile: true,
                                updatemode: FeedUpdateStrategy.PrimaryFallback,
                                sources: ["http://www.people.com.cn/rss/phb.xml"]
                            }
                        }
                    },
                    liuyan: {
                        display: "地方领导留言板",
                        categorys: {
                            newer: {
                                display: "最新",
                                showintile: true,
                                updatemode: FeedUpdateStrategy.PrimaryFallback,
                                sources: ["http://www.people.com.cn/rss/liuyan.xml"]
                            }
                        }
                    },
                    chinapic: {
                        display: "图说中国",
                        categorys: {
                            newer: {
                                display: "最新",
                                showintile: true,
                                updatemode: FeedUpdateStrategy.PrimaryFallback,
                                sources: ["http://www.people.com.cn/rss/chinapic.xml"]
                            }
                        }
                    },
                    bbs: {
                        display: "强国社区",
                        categorys: {
                            newer: {
                                display: "最新",
                                showintile: true,
                                updatemode: FeedUpdateStrategy.PrimaryFallback,
                                sources: ["http://www.people.com.cn/rss/bbs.xml"]
                            }
                        }
                    },
                }
            },
            mihoyo: {
                display: "米游社",
                channels: {
                    genshin: {
                        display: "原神",
                        categorys: {
                            home: {
                                display: "主页",
                                showintile: true,
                                updatemode: FeedUpdateStrategy.PrimaryFallback,
                                sources: [
                                    "https://rsshub.rssforever.com/mihoyo/ys",
                                    "https://rsshub.app/mihoyo/ys"
                                ]
                            },
                            latest: {
                                display: "最新",
                                showintile: true,
                                updatemode: FeedUpdateStrategy.PrimaryFallback,
                                sources: [
                                    "https://rsshub.rssforever.com/mihoyo/ys/latest",
                                    "https://rsshub.app/mihoyo/ys/latest"
                                ]
                            },
                            notice: {
                                display: "公告",
                                showintile: true,
                                updatemode: FeedUpdateStrategy.PrimaryFallback,
                                sources: [
                                    "https://rsshub.rssforever.com/mihoyo/ys/notice",
                                    "https://rsshub.app/mihoyo/ys/notice"
                                ]
                            },
                            activity: {
                                display: "活动",
                                showintile: true,
                                updatemode: FeedUpdateStrategy.PrimaryFallback,
                                sources: [
                                    "https://rsshub.rssforever.com/mihoyo/ys/activity",
                                    "https://rsshub.app/mihoyo/ys/activity"
                                ]
                            },
                        }
                    },
                    honkaistarrail: {
                        display: "崩坏：星穹铁道",
                        categorys: {
                            home: {
                                display: "主页",
                                showintile: true,
                                updatemode: FeedUpdateStrategy.PrimaryFallback,
                                sources: [
                                    "https://rsshub.rssforever.com/mihoyo/sr",
                                    "https://rsshub.app/mihoyo/sr"
                                ]
                            },
                            news_all: {
                                display: "最新",
                                showintile: true,
                                updatemode: FeedUpdateStrategy.PrimaryFallback,
                                sources: [
                                    "https://rsshub.rssforever.com/mihoyo/sr/news-all",
                                    "https://rsshub.app/mihoyo/sr/news-all"
                                ]
                            },
                            news: {
                                display: "新闻",
                                showintile: true,
                                updatemode: FeedUpdateStrategy.PrimaryFallback,
                                sources: [
                                    "https://rsshub.rssforever.com/mihoyo/ys/news",
                                    "https://rsshub.app/mihoyo/ys/news"
                                ]
                            },
                            notice: {
                                display: "公告",
                                showintile: true,
                                updatemode: FeedUpdateStrategy.PrimaryFallback,
                                sources: [
                                    "https://rsshub.rssforever.com/mihoyo/ys/notice",
                                    "https://rsshub.app/mihoyo/ys/notice"
                                ]
                            },
                            activity: {
                                display: "活动",
                                showintile: true,
                                updatemode: FeedUpdateStrategy.PrimaryFallback,
                                sources: [
                                    "https://rsshub.rssforever.com/mihoyo/ys/activity",
                                    "https://rsshub.app/mihoyo/ys/activity"
                                ]
                            },
                        }
                    },
                    honkaiimpact3rd: {
                        display: "崩坏 3",
                        categorys: {
                            announcement: {
                                display: "公告",
                                showintile: true,
                                updatemode: FeedUpdateStrategy.PrimaryFallback,
                                sources: [
                                    "https://rsshub.rssforever.com/mihoyo/bbs/official/1/1/",
                                    "https://rsshub.app/mihoyo/bbs/official/1/1/"
                                ]
                            },
                            event: {
                                display: "活动",
                                showintile: true,
                                updatemode: FeedUpdateStrategy.PrimaryFallback,
                                sources: [
                                    "https://rsshub.rssforever.com/mihoyo/bbs/official/1/2/",
                                    "https://rsshub.app/mihoyo/bbs/official/1/2/"
                                ]
                            },
                            information: {
                                display: "活动",
                                showintile: true,
                                updatemode: FeedUpdateStrategy.PrimaryFallback,
                                sources: [
                                    "https://rsshub.rssforever.com/mihoyo/bbs/official/1/3/",
                                    "https://rsshub.app/mihoyo/bbs/official/1/3/"
                                ]
                            },
                        }
                    },
                    honkaigakuen2: {
                        display: "崩坏学园 3",
                        categorys: {
                            announcement: {
                                display: "公告",
                                showintile: true,
                                updatemode: FeedUpdateStrategy.PrimaryFallback,
                                sources: [
                                    "https://rsshub.rssforever.com/mihoyo/bbs/official/3/1/",
                                    "https://rsshub.app/mihoyo/bbs/official/3/1/"
                                ]
                            },
                            event: {
                                display: "活动",
                                showintile: true,
                                updatemode: FeedUpdateStrategy.PrimaryFallback,
                                sources: [
                                    "https://rsshub.rssforever.com/mihoyo/bbs/official/3/2/",
                                    "https://rsshub.app/mihoyo/bbs/official/3/2/"
                                ]
                            },
                            information: {
                                display: "活动",
                                showintile: true,
                                updatemode: FeedUpdateStrategy.PrimaryFallback,
                                sources: [
                                    "https://rsshub.rssforever.com/mihoyo/bbs/official/3/3/",
                                    "https://rsshub.app/mihoyo/bbs/official/3/3/"
                                ]
                            },
                        }
                    },
                    tearsofthemis: {
                        display: "未定事件簿",
                        categorys: {
                            announcement: {
                                display: "公告",
                                showintile: true,
                                updatemode: FeedUpdateStrategy.PrimaryFallback,
                                sources: [
                                    "https://rsshub.rssforever.com/mihoyo/bbs/official/4/1/",
                                    "https://rsshub.app/mihoyo/bbs/official/4/1/"
                                ]
                            },
                            event: {
                                display: "活动",
                                showintile: true,
                                updatemode: FeedUpdateStrategy.PrimaryFallback,
                                sources: [
                                    "https://rsshub.rssforever.com/mihoyo/bbs/official/4/2/",
                                    "https://rsshub.app/mihoyo/bbs/official/4/2/"
                                ]
                            },
                            information: {
                                display: "活动",
                                showintile: true,
                                updatemode: FeedUpdateStrategy.PrimaryFallback,
                                sources: [
                                    "https://rsshub.rssforever.com/mihoyo/bbs/official/4/3/",
                                    "https://rsshub.app/mihoyo/bbs/official/4/3/"
                                ]
                            },
                        }
                    },
                    zenlesszonezero: {
                        display: "绝区零",
                        categorys: {
                            announcement: {
                                display: "公告",
                                showintile: true,
                                updatemode: FeedUpdateStrategy.PrimaryFallback,
                                sources: [
                                    "https://rsshub.rssforever.com/mihoyo/bbs/official/8/1/",
                                    "https://rsshub.app/mihoyo/bbs/official/8/1/"
                                ]
                            },
                            event: {
                                display: "活动",
                                showintile: true,
                                updatemode: FeedUpdateStrategy.PrimaryFallback,
                                sources: [
                                    "https://rsshub.rssforever.com/mihoyo/bbs/official/8/2/",
                                    "https://rsshub.app/mihoyo/bbs/official/8/2/"
                                ]
                            },
                            information: {
                                display: "活动",
                                showintile: true,
                                updatemode: FeedUpdateStrategy.PrimaryFallback,
                                sources: [
                                    "https://rsshub.rssforever.com/mihoyo/bbs/official/8/3/",
                                    "https://rsshub.app/mihoyo/bbs/official/8/3/"
                                ]
                            },
                        }
                    },
                }
            },
            broadcast: {
                display: "播客",
                channels: {
                    xiangsheng: {
                        display: "相声",
                        categorys: {
                            newer: {
                                display: "助眠",
                                showintile: true,
                                updatemode: FeedUpdateStrategy.PrimaryFallback,
                                sources: [
                                    "https://feed.firstory.me/rss/user/ckotfh6eqeyzq0831l6nk9y9w"
                                ]
                            },
                        }
                    },
                    bandari: {
                        display: "班得瑞 Bandari",
                        categorys: {
                            newer: {
                                display: "疗愈 | 精选",
                                showintile: true,
                                updatemode: FeedUpdateStrategy.PrimaryFallback,
                                sources: [
                                    "http://www.ximalaya.com/album/36240973.xml"
                                ]
                            },
                        }
                    },
                }
            },
        };
        var pkeys = Object.keys(providers);
        for (var i = 0; i < pkeys.length; i++) {
            var provide = pkeys[i];
            FeedManager.addProvider(pkeys[i], providers[provide].display);
            var ckeys = Object.keys(providers[provide].channels);
            for (var j = 0; j < ckeys.length; j++) {
                var channel = ckeys[j];
                FeedManager.addChannel(provide, channel, providers[provide].channels[channel].display);
                var cakeys = Object.keys(providers[provide].channels[channel].categorys);
                for (var k = 0; k < cakeys.length; k++) {
                    var category = cakeys[k];
                    FeedManager.addCategory(
                        provide,
                        channel,
                        category,
                        providers[provide].channels[channel].categorys[category].display,
                        providers[provide].channels[channel].categorys[category].updatemode,
                        providers[provide].channels[channel].categorys[category].showintile
                    );
                    for (var l = 0; l < providers[provide].channels[channel].categorys[category].sources.length; l++) {
                        FeedManager.addSource(provide, channel, category, providers[provide].channels[channel].categorys[category].sources[l]);
                        switch (provide) {
                            case "ithome": {
                                FeedManager.setSourceEvalCode(provide, channel, category, providers[provide].channels[channel].categorys[category].sources[l],
                                    "this.desturl = this.srcurl + '/resize,m_fill,w_' + this.width + ',h_' + this.height;");
                            } break;
                            case "people": {
                                FeedManager.setSourceEvalCode(provide, channel, category, providers[provide].channels[channel].categorys[category].sources[l],
                                    "function generateWeservUrl(srcurl,width,height){if(!srcurl)return'';var urlWithoutProtocol=srcurl.replace(/^https?:\\/\\//i,'');var encodedUrl=encodeURIComponent(urlWithoutProtocol);var desturl='https://images.weserv.nl/?url='+encodedUrl+'&w='+width+'&h='+height+'&fit=cover';return desturl}this.desturl=generateWeservUrl(this.srcurl,this.width,this.height);");
                            } break;
                            case "mihoyo": {
                                FeedManager.setSourceEvalCode(provide, channel, category, providers[provide].channels[channel].categorys[category].sources[l],
                                    "function randomFrame(){var sec=Math.floor(Math.random()*(60-6+1))+6;return sec*1000}var url=new Link.Url(this.srcurl);var elder=url.params['x-oss-process']||'';if(NString.find(elder,'video/snapshot')!=-1){url.params['x-oss-process']='video/snapshot,t_'+randomFrame()+',f_jpg,w_'+this.width}else{if(NString.empty(elder)||NString.extension(url.extension||'','.mp4')){url.params['x-oss-process']='image/resize,m_fill,w_'+this.width+',h_'+this.height+'/quality,q_100/auto-orient,0/interlace,1/format,jpg'}else{url.params['x-oss-process']+='/resize,m_fill,w_'+this.width+',h_'+this.height+'/quality,q_100/auto-orient,0/interlace,1/format,jpg'}}this.desturl=url.url;");
                            }
                        }
                    }
                }
            }
        }
    }
    function initWhenFirst() {
        listViewEl = document.getElementById("listviewbox");
        var listView = listViewEl.winControl;
        listView.itemDataSource = data.dataSource;
        listView.addEventListener("iteminvoked", function (e) {
            e.detail.itemPromise.done(function (invokedItem) {
                var data = invokedItem.data;
                WinJS.Navigation.navigate("/pages/article/article.html", {
                    key: {
                        provider: settings.values["nowProvider"],
                        channel: settings.values["nowChannel"],
                        category: settings.values["nowCategory"],
                        articleurl: data.url
                    }
                });
            });
        });
        initFeedList();
    }
    function initFeedListWhenBack() {
        var provider = document.getElementById("providerlist");
        var channel = document.getElementById("channellist");
        var category = document.getElementById("categorylist");
        provider.innerHTML = "";
        channel.innerHTML = "";
        category.innerHTML = "";
        if (!FeedManager) { return; }
        FeedManager.load().done(function (complete) {
            var nowdata = {
                provider: settings.values["nowProvider"],
                channel: settings.values["nowChannel"],
                category: settings.values["nowCategory"]
            };
            var datas = FeedManager.datas();
            function initCategoryItems() {
                category.innerHTML = "";
                var nowdata = {
                    provider: settings.values["nowProvider"],
                    channel: settings.values["nowChannel"],
                    category: settings.values["nowCategory"]
                };
                var categories = FeedManager.getChannel(settings.values["nowProvider"], settings.values["nowChannel"]).categories;
                var nowCategory = settings.values["nowCategory"];
                for (var i = 0; i < categories.length; i++) {
                    var sc = categories[i];
                    var cnode = createItem(sc.id, sc.displayName, ITEM_NAMESPACE.category);
                    cnode.classList.add("light");
                    category.appendChild(cnode);
                    WinJS.UI.Animation.createAddToListAnimation(cnode, category).execute();
                    cnode.addEventListener("click", function (event) {
                        var isselected = this.classList.contains("selected");
                        if (!isselected) {
                            if (data.length) data.splice(0, data.length);
                            var categoryitems = category.querySelectorAll(".item");
                            for (var j = 0; j < categoryitems.length; j++) {
                                categoryitems[j].classList.remove("selected");
                            }
                            this.classList.add("selected");
                            settings.values["nowCategory"] = this.dataset.id;
                            updateFeeds(nowdata.provider, nowdata.channel, nowdata.category);
                        }
                        if (this.disabled === true) {
                            this.classList.remove("selected");
                        }
                    });
                    if (NString.equals(nowCategory, sc.id)) {
                        if (!data.length) cnode.click();
                        cnode.classList.add("selected");
                    }
                }
                var nowSelected = category.querySelector(".selected");
                if (!nowSelected) {
                    var firstNode = category.querySelector(".item");
                    if (firstNode) firstNode.click();
                }
            }
            function initChannelItems() {
                channel.innerHTML = "";
                var channels = FeedManager.getProvider(settings.values["nowProvider"]).channels;
                var nowChannel = settings.values["nowChannel"];
                for (var i = 0; i < channels.length; i++) {
                    var sp = channels[i];
                    var cnode = createItem(sp.id, sp.displayName, ITEM_NAMESPACE.channel);
                    channel.appendChild(cnode);
                    WinJS.UI.Animation.createAddToListAnimation(cnode, channel).execute();
                    cnode.addEventListener("click", function (event) {
                        var isselected = this.classList.contains("selected");
                        if (!isselected) {
                            category.innerHTML = "";
                            if (data.length) data.splice(0, data.length);
                            var channelitems = channel.querySelectorAll(".item");
                            for (var j = 0; j < channelitems.length; j++) {
                                channelitems[j].classList.remove("selected");
                            }
                            this.classList.add("selected");
                            settings.values["nowChannel"] = this.dataset.id;
                            initCategoryItems();
                        }
                        if (this.disabled === true) {
                            this.classList.remove("selected");
                        }
                    });
                    if (NString.equals(nowChannel, sp.id)) {
                        cnode.classList.add("selected");
                        initCategoryItems();
                    }
                }
                var nowSelected = channel.querySelector(".selected");
                if (!nowSelected) {
                    var firstNode = channel.querySelector(".item");
                    if (firstNode) firstNode.click();
                }
            }
            try {
                if (datas.providers !== null && datas.providers !== undefined && datas.providers) {
                    var nowProvider = settings.values["nowProvider"];
                    for (var i = 0; i < datas.providers.length; i++) {
                        var sp = datas.providers[i];
                        var pnode = createItem(sp.id, sp.displayName, ITEM_NAMESPACE.provider);
                        provider.appendChild(pnode);
                        WinJS.UI.Animation.createAddToListAnimation(pnode, provider).execute();
                        pnode.addEventListener("click", function (event) {
                            var isselected = this.classList.contains("selected");
                            if (!isselected) {
                                channel.innerHTML = "";
                                category.innerHTML = "";
                                if (data.length) data.splice(0, data.length);
                                var provideritems = provider.querySelectorAll(".item");
                                for (var j = 0; j < provideritems.length; j++) {
                                    provideritems[j].classList.remove("selected");
                                }
                                this.classList.add("selected");
                                settings.values["nowProvider"] = this.dataset.id;
                                initChannelItems();
                            }
                            if (this.disabled === true) {
                                this.classList.remove("selected");
                            }
                        });
                        if (NString.equals(nowProvider, sp.id)) {
                            pnode.classList.add("selected");
                            initChannelItems();
                        }
                    }
                    var nowSelected = provider.querySelector(".selected");
                    if (!nowSelected) {
                        var firstNode = provider.querySelector(".item");
                        if (firstNode) firstNode.click();
                    }
                }
            } catch (e) {
                initFeedList();
            }
        });
    }
    function initWhenBack() {
        listViewEl = document.getElementById("listviewbox");
        var listView = listViewEl.winControl;
        listView.itemDataSource = data.dataSource;
        listView.addEventListener("iteminvoked", function (e) {
            e.detail.itemPromise.done(function (invokedItem) {
                var data = invokedItem.data;
                WinJS.Navigation.navigate("/pages/article/article.html", {
                    key: {
                        provider: settings.values["nowProvider"],
                        channel: settings.values["nowChannel"],
                        category: settings.values["nowCategory"],
                        articleurl: data.url
                    }
                });
            });
        });
        initFeedListWhenBack();
    }
    var isBack = false;
    function init() {
        if (!isBack) {
            isBack = true;
            initWhenFirst();
        } else {
            initWhenBack();
        }
    }
    WinJS.UI.Pages.define("/pages/home/home.html", {
        // 每当用户导航至该页面时都要调用此函数。它
        // 使用应用程序的数据填充页面元素。
        ready: function (element, options) {
            WinJS.UI.processAll().then(function () {
                var provider = document.getElementById("providerlist");
                var channel = document.getElementById("channellist");
                var category = document.getElementById("categorylist");
                (function () {
                    var delay = 500;
                    var dedelay = 100;
                    var animation = [
                        AnimationKeyFrames.Flyout.fromLeft,
                        AnimationKeyFrames.Opacity.visible
                    ];
                    provider.style.animation = generateAnimeString(animation, delay);
                    channel.style.display = "none";
                    setTimeout(function () {
                        channel.style.display = "";
                        channel.style.animation = generateAnimeString(animation, delay);
                        setTimeout(function () {
                            channel.style.animation = "";
                        }, delay);
                    }, dedelay);
                    setTimeout(function () {
                        provider.style.animation = "";
                    }, delay);
                })();
                if (FeedManager) {
                    FeedManager.load().done(function (complete) {
                        var datas = FeedManager.datas();
                        if (datas.providers === undefined || datas.providers === null || !datas.providers || datas.providers.length === 0) {
                            initExampleData();
                            FeedManager.save().done(
                                function () { init(); },
                                function () { init(); }
                            );
                        } else {
                            init();
                        }
                    });
                }

            }).then(function () {
                WinJS.Resources.processAll();
            });
        }
    });
})();
