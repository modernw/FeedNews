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
        this.author = cArticle.author || cChannel.title || "";
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
                pubdate: this.pubdate ? new Date (this.pubdate).toLocaleString() : "",
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
    function fabs (value) {
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
        var radio = document.createElement("input");
        radio.type = "radio";
        radio.name = swNameSpace;
        node.id = NString.normalize(swNameSpace) + NString.normalize(swId);
        node.dataset.id = NString.normalize(swId);
        node.dataset.ns = NString.normalize(swNameSpace);
        node.classList.add("item");
        node.appendChild(span);
        span.textContent = swDisplayName;
        node.appendChild(radio);
        radio.style.display = "none";
        node.addEventListener("click", function () {
            var down = document.createEvent("MouseEvent");
            down.initMouseEvent("mousedown", true, true, window, 1, 0, 0, 0, 0,
                false, false, false, false, 0, null);
            radio.dispatchEvent(down);
            var up = document.createEvent("MouseEvent");
            up.initMouseEvent("mouseup", true, true, window, 1, 0, 0, 0, 0,
                false, false, false, false, 0, null);
            radio.dispatchEvent(up);
            var click = document.createEvent("MouseEvent");
            click.initMouseEvent("click", true, true, window, 1, 0, 0, 0, 0,
                false, false, false, false, 0, null);
            radio.dispatchEvent(click);
        });
        radio.addEventListener("change", function () {
            if (this.checked === true) {
                if (!node.classList.contains("selected")) { node.classList.add("selected"); }
                var nowdata = {
                    provider: settings.values["nowProvider"],
                    channel: settings.values["nowChannel"],
                    category: settings.values["nowCategory"]
                };
                switch (node.dataset.ns) {
                    case ITEM_NAMESPACE.provider: {
                        settings.values["nowProvider"] = node.dataset.id;
                        if (nowdata.provider && nowdata.channel && nowdata.category)
                            updateFeeds(nowdata.provider, nowdata.channel, nowdata.category);
                    } break;
                    case ITEM_NAMESPACE.channel: {
                        settings.values["nowChannel"] = node.dataset.id;
                        if (nowdata.provider && nowdata.channel && nowdata.category)
                            updateFeeds(nowdata.provider, nowdata.channel, nowdata.category);
                    } break;
                    case ITEM_NAMESPACE.category: {
                        settings.values["nowCategory"] = node.dataset.id;
                        if (nowdata.provider && nowdata.channel && nowdata.category)
                            updateFeeds(nowdata.provider, nowdata.channel, nowdata.category);
                    } break;
                }
            } else {
                if (node.classList.contains("selected")) { node.classList.remove("selected"); }
            }
        });
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
            var itemChannelChangeFunction = function (swId) {
                FeedManager.load().done(function (complete) {
                    channel.innerHTML = "";
                    var nowdata = {
                        provider: settings.values["nowProvider"],
                        channel: settings.values["nowChannel"],
                        category: settings.values["nowCategory"]
                    };
                    var datas = FeedManager.datas();
                    for (var i = 0; datas.providers && i < datas.providers.length; i++) {
                        var p = datas.providers[i];
                        if (NString.equals(swId, p.id)) {
                            var cs = p.channels;
                            for (var j = 0; cs && j < cs.length; j++) {
                                var c = cs[j];
                                var itemNode = createItem(c.id, c.displayName, ITEM_NAMESPACE.channel);
                                itemNode.addEventListener("click", function () {
                                    var nodes = channel.querySelectorAll(".item");
                                    for (var cnt = 0; cnt < nodes.length; cnt++) {
                                        var node = nodes[cnt];
                                        settings.values["nowChannel"] = this.dataset.id;
                                        var radio = node.querySelector("input");
                                        if (radio.checked) {
                                            if (!node.classList.contains("selected")) {
                                                node.classList.add("selected");
                                            }
                                            itemCategoryChangeFunction(p.id, c.id);
                                        } else {
                                            if (node.classList.contains("selected")) { node.classList.remove("selected"); }
                                        }
                                    }
                                });
                                channel.appendChild(itemNode);
                                WinJS.UI.Animation.createAddToListAnimation(itemNode, channel).execute();
                                if (NString.equals(c.id, nowdata.channel)) { itemNode.click(); }
                            }
                            if (!channel.querySelectorAll(".selected").length) {
                                var items = channel.querySelector(".item");
                                if (items) items.click();
                            }
                            break;
                        }
                    }
                });
            }
            var itemCategoryChangeFunction = function (swPid, swCid) {
                FeedManager.load().done(function (complete) {
                    category.innerHTML = "";
                    var nowdata = {
                        provider: settings.values["nowProvider"],
                        channel: settings.values["nowChannel"],
                        category: settings.values["nowCategory"]
                    };
                    var datas = FeedManager.datas();
                    for (var i = 0; datas.providers && i < datas.providers.length; i++) {
                        var p = datas.providers[i];
                        if (NString.equals(swPid, p.id)) {
                            var cs = p.channels;
                            for (var j = 0; cs && j < cs.length; j++) {
                                var c = cs[j];
                                if (NString.equals(swCid, c.id)) {
                                    var cas = c.categories;
                                    for (var k = 0; cas && k < cas.length; k++) {
                                        var ca = cas[k];
                                        var itemNode = createItem(ca.id, ca.displayName, ITEM_NAMESPACE.category);
                                        itemNode.classList.add("light");
                                        itemNode.addEventListener("click", function () {
                                            var nodes = category.querySelectorAll(".item");
                                            settings.values["nowCategory"] = this.dataset.id;
                                            for (var cnt = 0; cnt < nodes.length; cnt++) {
                                                var node = nodes[cnt];
                                                var radio = node.querySelector("input");
                                                if (radio.checked) {
                                                    if (!node.classList.contains("selected")) { node.classList.add("selected"); }
                                                } else {
                                                    if (node.classList.contains("selected")) { node.classList.remove("selected"); }
                                                }
                                            }
                                        });
                                        category.appendChild(itemNode);
                                        WinJS.UI.Animation.createAddToListAnimation(itemNode, category).execute();
                                        if (NString.equals(ca.id, nowdata.category)) { itemNode.click(); }
                                    }
                                    if (!category.querySelectorAll(".selected").length) {
                                        var items = category.querySelector(".item");
                                        if (items) items.click();
                                    }
                                    break;
                                }
                            }
                        }
                    }
                });
            };
            try {
                if (datas.providers !== null && datas.providers !== undefined && datas.providers) {
                    for (var i = 0; datas.providers && i < datas.providers.length; i++) {
                        var p = datas.providers[i];
                        var itemNode = createItem(p.id, p.displayName, ITEM_NAMESPACE.provider);
                        itemNode.addEventListener("click", function () {
                            var nodes = provider.querySelectorAll(".item");
                            settings.values["nowProvider"] = this.dataset.id;
                            for (var cnt = 0; cnt < nodes.length; cnt++) {
                                var node = nodes[cnt];
                                var radio = node.querySelector("input");
                                if (radio.checked) {
                                    if (!node.classList.contains("selected")) { node.classList.add("selected"); }
                                    itemChannelChangeFunction(this.dataset.id);
                                } else {
                                    if (node.classList.contains("selected")) { node.classList.remove("selected"); }
                                }
                            }
                        });
                        provider.appendChild(itemNode);
                        WinJS.UI.Animation.createAddToListAnimation(itemNode, provider).execute();
                        if (NString.equals(p.id, nowdata.provider)) { itemNode.click(); }
                    }
                    if (!provider.querySelectorAll(".selected").length) {
                        var items = provider.querySelector(".item");
                        if (items) items.click();
                    }
                }
            } catch (e) {  }
        });
    }
    WinJS.UI.Pages.define("/pages/home/home.html", {
        // 每当用户导航至该页面时都要调用此函数。它
        // 使用应用程序的数据填充页面元素。
        ready: function (element, options) {
            var provider = document.getElementById("providerlist");
            var channel = document.getElementById("channellist");
            var category = document.getElementById("categorylist");
            // TODO: 在此处初始化页面。
            provider.innerHTML = "";
            channel.innerHTML = "";
            category.innerHTML = "";
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
            function init() {

                WinJS.UI.processAll().then(function () {
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
                });
            }
            if (FeedManager) {
                FeedManager.load().done(function (complete) {
                    var datas = FeedManager.datas();
                    if (datas.providers === undefined || datas.providers === null || !datas.providers || datas.providers.length === 0) {
                        {
                            FeedManager.addProvider("ithome", "IT 之家");
                            FeedManager.addChannel("ithome", "home", "主页");
                            FeedManager.addCategory("ithome", "home", "new", "最新", FeedUpdateStrategy.PrimaryFallback);
                            FeedManager.addSource("ithome", "home", "new", "https://www.ithome.com/rss/", true);
                            FeedManager.addProvider("people", "人民网");
                            FeedManager.addChannel("people", "it", "IT 频道");
                            FeedManager.addCategory("people", "it", "new", "最新", FeedUpdateStrategy.PrimaryFallback);
                            FeedManager.addSource("people", "it", "new", "http://www.people.com.cn/rss/it.xml", true);
                            FeedManager.addChannel("people", "politics", "时政频道");
                            FeedManager.addCategory("people", "politics", "new", "最新", FeedUpdateStrategy.PrimaryFallback);
                            FeedManager.addSource("people", "politics", "new", "http://www.people.com.cn/rss/politics.xml", true);
                            FeedManager.addChannel("people", "world", "国际频道");
                            FeedManager.addCategory("people", "world", "new", "最新", FeedUpdateStrategy.PrimaryFallback);
                            FeedManager.addSource("people", "world", "new", "http://www.people.com.cn/rss/world.xml", true);
                            FeedManager.addProvider("mihoyo", "米游社");
                            FeedManager.addChannel("mihoyo", "genshin", "原神");
                            FeedManager.addCategory("mihoyo", "genshin", "new", "最新", FeedUpdateStrategy.PrimaryFallback);
                            FeedManager.addSource("mihoyo", "genshin", "new", "https://rsshub.rssforever.com/mihoyo/ys", true);
                            FeedManager.addCategory("mihoyo", "genshin", "Announcement", "公告", FeedUpdateStrategy.PrimaryFallback);
                            FeedManager.addSource("mihoyo", "genshin", "Announcement", " https://rsshub.rssforever.com/mihoyo/bbs/official/2/1", true);
                            FeedManager.addCategory("mihoyo", "genshin", "Event", "活动", FeedUpdateStrategy.PrimaryFallback);
                            FeedManager.addSource("mihoyo", "genshin", "Event", "https://rsshub.rssforever.com/mihoyo/bbs/official/2/2", true);
                            FeedManager.addCategory("mihoyo", "genshin", "Information", "资讯", FeedUpdateStrategy.PrimaryFallback);
                            FeedManager.addSource("mihoyo", "genshin", "Information", "https://rsshub.rssforever.com/mihoyo/bbs/official/2/3", true);
                            FeedManager.addProvider("xiangsheng", "相声");
                            FeedManager.addChannel("xiangsheng", "sleep", "助眠");
                            FeedManager.addCategory("xiangsheng", "sleep", "new", "最新", FeedUpdateStrategy.PrimaryFallback);
                            FeedManager.addSource("xiangsheng", "sleep", "new", "https://feed.firstory.me/rss/user/ckotfh6eqeyzq0831l6nk9y9w", true);
                        }
                        FeedManager.save().done(
                            function () { init(); },
                            function () { init(); }
                        );
                    } else {
                        init();
                    }
                });
            }
            /*
            var csslinks = document.head.querySelectorAll("link");
            for (var i = 0; i < csslinks.length; i++) {
                var cssnode = csslinks[i];
                if (NString.find (cssnode.href, "article.css") != -1) cssnode.removeNode(true);
            }
            */
        }
    });
})();
