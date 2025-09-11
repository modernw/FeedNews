(function () {
    "use strict";

    // ===== 常量定义 =====
    var FeedUpdateStrategy = {
        PrimaryFallback: "PrimaryFallback",      // 逐一尝试源
        MergeByTitle: "MergeByTitle",            // 按标题去重
        MergeByLink: "MergeByLink",              // 按 link 去重
        MergeByGUID: "MergeByGUID",              // 按 guid/id 去重
        MergeByContentHash: "MergeByContentHash",// 按内容哈希去重
        WeightedMerge: "WeightedMerge",          // 按权重优先级
        FullMergeWithTagging: "FullMergeWithTagging" // 保留全部，标记来源
    };
    var FEEDMGR_STORAGE_FILEPATH = "feeds.json";

    // ===== 数据模型 =====
    function ImageReplaceRule(swPattern, swReplaceWide, swReplaceMedium, swReplaceLarge) {
        this.pattern = swPattern || "";
        this.replaceWide = swReplaceWide || "";
        this.replaceMedium = swReplaceMedium || "";
        this.replaceLarge = swReplaceLarge || "";
    }

    function Source(swUrl) {
        this.url = NString.trim (swUrl || "");
        this.imageRules = []; // ImageReplaceRule[]
    }

    function Category(swId, swName) {
        this.id = NString.trim (NString.tolower (swId || ""));
        this.displayName = NString.trim (swName || "");
        this.updateStrategy = FeedUpdateStrategy.PrimaryFallback;
        this.sources = []; // Source[]
        this.showInTile = true;
    }

    Category.prototype.getUrlList = function (bGetForTile) {
        if (bGetForTile === null || bGetForTile === undefined) { bGetForTile = false; }
        var list = [];
        for (var i = 0; this.sources && i < this.sources.length; i++) {
            if (!NString.empty(this.sources[i].url)) {
                if (bGetForTile) {
                    if (this.sources[i].showInTile) list.push(this.sources[i].url);
                } else list.push(this.sources[i].url);
            }
        }
        return list;
    };

    function Channel(swId, swName) {
        this.id = NString.trim (NString.tolower (swId || ""));
        this.displayName = NString.trim (swName || "");
        this.categories = []; // Category[]
    }

    function Provider(swId, swName) {
        this.id = NString.trim (NString.tolower (swId || ""));
        this.displayName = NString.trim (swName || "");
        this.channels = []; // Channel[]
    }

    // ===== FeedManager 单例 =====
    function FeedManager() {
        if (FeedManager._instance) return FeedManager._instance;
        this.providers = []; // Provider[]
        FeedManager._instance = this;
    }

    // ===== 工具函数 =====
    function _findById(aList, swId) {
        for (var i = 0; i < aList.length; i++) {
            if (NString.equals (aList[i].id, swId)) return aList[i];
        }
        return null;
    }

    function _moveItem(aList, swIdOrUrl, iOffset, isSource) {
        for (var i = 0; i < aList.length; i++) {
            var id = isSource ? aList[i].url : aList[i].id;
            if (NString.equals(id, swIdOrUrl)) {
                var iNew = i + iOffset;
                if (iNew >= 0 && iNew < aList.length) {
                    var temp = aList[i];
                    aList.splice(i, 1);
                    aList.splice(iNew, 0, temp);
                }
                break;
            }
        }
    }

    // ===== API：Provider 操作 =====
    FeedManager.prototype.addProvider = function (swId, swName) {
        for (var i = 0; this.providers && i < this.providers.length; i++) {
            if (NString.equals(swId, this.providers[i].id)) {
                throw "错误：Provider 的 ID 已存在，不可出现重复项目";
                break;
            }
        }
        if (NString.empty(swName)) throw "错误：Provider 的显示名不能为空";
        var oProvider = new Provider(swId, swName);
        this.providers.push(oProvider);
        return oProvider;
    };

    FeedManager.prototype.removeProvider = function (swId) {
        for (var i = 0; i < this.providers.length; i++) {
            if (this.providers[i].id === swId) {
                this.providers.splice(i, 1);
                break;
            }
        }
    };

    FeedManager.prototype.getProvider = function (swId) {
        return _findById(this.providers, swId);
    };

    FeedManager.prototype.moveProviderUp = function (swId) {
        _moveItem(this.providers, swId, -1, false);
    };

    FeedManager.prototype.moveProviderDown = function (swId) {
        _moveItem(this.providers, swId, 1, false);
    };

    FeedManager.prototype.setProviderDisplayName = function (swId, swDisplayName) {
        if (NString.empty(swDisplayName)) throw "错误：Provider 的显示名不能为空";
        _findById(this.providers, swId).displayName = NString.trim(swDisplayName);
    }

    // ===== API：Channel 操作 =====
    FeedManager.prototype.addChannel = function (swProviderId, swId, swName) {
        var oProvider = this.getProvider(swProviderId);
        if (!oProvider) return null;
        for (var i = 0; oProvider && i < oProvider.channels.length; i++) {
            if (NString.equals(swId, oProvider.channels[i].id)) {
                throw "错误：Channel 的 ID 在当前 Provider 已存在，所以无法添加重复项。";
                break;
            }
        }
        if (NString.empty(swName)) throw "错误：Provider 的显示名不能为空";
        var oChannel = new Channel(swId, swName);
        oProvider.channels.push(oChannel);
        return oChannel;
    };

    FeedManager.prototype.removeChannel = function (swProviderId, swId) {
        var oProvider = this.getProvider(swProviderId);
        if (!oProvider) return;
        for (var i = 0; i < oProvider.channels.length; i++) {
            if (oProvider.channels[i].id === swId) {
                oProvider.channels.splice(i, 1);
                break;
            }
        }
    };

    FeedManager.prototype.getChannel = function (swProviderId, swId) {
        var oProvider = this.getProvider(swProviderId);
        if (!oProvider) return null;
        return _findById(oProvider.channels, swId);
    };

    FeedManager.prototype.setChannelDisplayName = function (swProviderId, swId, swDisplayName) {
        var oProvider = this.getProvider(swProviderId);
        if (!oProvider) return null;
        if (NString.empty(swDisplayName)) throw "错误：Provider 的显示名不能为空";
        _findById(oProvider.channels, swId).displayName = NString.trim (swDisplayName);
    }

    FeedManager.prototype.moveChannelUp = function (swProviderId, swId) {
        var oProvider = this.getProvider(swProviderId);
        if (oProvider) _moveItem(oProvider.channels, swId, -1, false);
    };

    FeedManager.prototype.moveChannelDown = function (swProviderId, swId) {
        var oProvider = this.getProvider(swProviderId);
        if (oProvider) _moveItem(oProvider.channels, swId, 1, false);
    };

    // ===== API：Category 操作 =====
    FeedManager.prototype.addCategory = function (swProviderId, swChannelId, swId, swName, swUpdateMode, bShowInTile) {
        var oChannel = this.getChannel(swProviderId, swChannelId);
        if (!oChannel) return null;
        var oCategory = new Category(swId, swName);
        if (!swUpdateMode) {
            swUpdateMode = FeedUpdateStrategy.PrimaryFallback;
        }
        if (bShowInTile === null || bShowInTile === undefined) { bShowInTile = true; }
        switch (swUpdateMode) {
            case FeedUpdateStrategy.FullMergeWithTagging:
            case FeedUpdateStrategy.MergeByContentHash:
            case FeedUpdateStrategy.MergeByGUID:
            case FeedUpdateStrategy.MergeByLink:
            case FeedUpdateStrategy.MergeByTitle:
            case FeedUpdateStrategy.PrimaryFallback:
            case FeedUpdateStrategy.WeightedMerge:
                break;
            default: throw "错误：错误的更新类型"; break;
        }
        oCategory.updateStrategy = swUpdateMode;
        oCategory.showInTile = bShowInTile;
        oChannel.categories.push(oCategory);
        return oCategory;
    };

    FeedManager.prototype.removeCategory = function (swProviderId, swChannelId, swId) {
        var oChannel = this.getChannel(swProviderId, swChannelId);
        if (!oChannel) return;
        for (var i = 0; i < oChannel.categories.length; i++) {
            if (oChannel.categories[i].id === swId) {
                oChannel.categories.splice(i, 1);
                break;
            }
        }
    };

    FeedManager.prototype.getCategory = function (swProviderId, swChannelId, swId) {
        var oChannel = this.getChannel(swProviderId, swChannelId);
        if (!oChannel) return null;
        return _findById(oChannel.categories, swId);
    };

    FeedManager.prototype.getCategoryUrls = function (cCategory, bGetForTile) {
        if (bGetForTile === null || bGetForTile === undefined) { bGetForTile = false; }
        var list = [];
        for (var i = 0; cCategory.sources && i < cCategory.sources.length; i++) {
            if (!NString.empty(cCategory.sources[i].url)) {
                if (bGetForTile) {
                    if (cCategory.sources[i].showInTile) list.push(cCategory.sources[i].url);
                } else list.push(cCategory.sources[i].url);
            }
        }
        return list;
    };

    FeedManager.prototype.getSources = function (swProviderId, swChannelId, swId) {
        var oChannel = this.getChannel(swProviderId, swChannelId);
        if (!oChannel) return null;
        return _findById(oChannel.categories, swId).sources;
    };

    FeedManager.prototype.setCategoryDisplayName = function (swProviderId, swChannelId, swId, swDisplayName) {
        var oChannel = this.getChannel(swProviderId, swChannelId);
        if (!oChannel) return null;
        if (NString.empty(swDisplayName)) throw "错误：Provider 的显示名不能为空";
        _findById(oChannel.categories, swId).displayName = NString.trim (swDisplayName);
    };

    FeedManager.prototype.setCategoryUpdateMode = function (swProviderId, swChannelId, swId, swUpdateMode) {
        var oChannel = this.getChannel(swProviderId, swChannelId);
        if (!oChannel) return null;
        switch (swUpdateMode) {
            case FeedUpdateStrategy.FullMergeWithTagging:
            case FeedUpdateStrategy.MergeByContentHash:
            case FeedUpdateStrategy.MergeByGUID:
            case FeedUpdateStrategy.MergeByLink:
            case FeedUpdateStrategy.MergeByTitle:
            case FeedUpdateStrategy.PrimaryFallback:
            case FeedUpdateStrategy.WeightedMerge:
                break;
            default: throw "错误：错误的更新类型"; break;
        }
        _findById(oChannel.categories, swId).updateStrategy = swUpdateMode;
    };

    FeedManager.prototype.setCategoryShowInTile = function (swProviderId, swChannelId, swId, bIsShowInTile) {
        var oChannel = this.getChannel(swProviderId, swChannelId);
        if (!oChannel) return null;
        if (bIsShowInTile === null || bIsShowInTile === undefined) throw "错误：必须要设置 true 或 false 这样的逻辑值。";
        _findById(oChannel.categories, swId).showInTile = bIsShowInTile;
    };

    FeedManager.prototype.moveCategoryUp = function (swProviderId, swChannelId, swId) {
        var oChannel = this.getChannel(swProviderId, swChannelId);
        if (oChannel) _moveItem(oChannel.categories, swId, -1, false);
    };

    FeedManager.prototype.moveCategoryDown = function (swProviderId, swChannelId, swId) {
        var oChannel = this.getChannel(swProviderId, swChannelId);
        if (oChannel) _moveItem(oChannel.categories, swId, 1, false);
    };

    // ===== API：Source 操作 =====
    FeedManager.prototype.addSource = function (swProviderId, swChannelId, swCategoryId, swUrl) {
        var oCategory = this.getCategory(swProviderId, swChannelId, swCategoryId);
        if (NString.empty (swUrl) || NString.trim (swUrl).length < 2) throw "错误：Url 不能小于最短长度";
        if (!oCategory) return null;
        var oSource = new Source(NString.trim (swUrl));
        oCategory.sources.push(oSource);
        return oSource;
    };

    FeedManager.prototype.removeSource = function (swProviderId, swChannelId, swCategoryId, swUrl) {
        var oCategory = this.getCategory(swProviderId, swChannelId, swCategoryId);
        if (!oCategory) return;
        for (var i = 0; i < oCategory.sources.length; i++) {
            if (oCategory.sources[i].url === swUrl) {
                oCategory.sources.splice(i, 1);
                break;
            }
        }
    };

    FeedManager.prototype.getSource = function (swProviderId, swChannelId, swCategoryId, swUrl) {
        var oCategory = this.getCategory(swProviderId, swChannelId, swCategoryId);
        if (!oCategory) return null;
        for (var i = 0; i < oCategory.sources.length; i++) {
            if (oCategory.sources[i].url === swUrl) return oCategory.sources[i];
        }
        return null;
    };

    FeedManager.prototype.moveSourceUp = function (swProviderId, swChannelId, swCategoryId, swUrl) {
        var oCategory = this.getCategory(swProviderId, swChannelId, swCategoryId);
        if (oCategory) _moveItem(oCategory.sources, swUrl, -1, true);
    };

    FeedManager.prototype.moveSourceDown = function (swProviderId, swChannelId, swCategoryId, swUrl) {
        var oCategory = this.getCategory(swProviderId, swChannelId, swCategoryId);
        if (oCategory) _moveItem(oCategory.sources, swUrl, 1, true);
    };

    // ===== API：ImageReplaceRule 操作 =====
    FeedManager.prototype.addImageRule = function (swProviderId, swChannelId, swCategoryId, swUrl, swPattern, swWide, swMedium, swLarge) {
        var oSource = this.getSource(swProviderId, swChannelId, swCategoryId, swUrl);
        if (!oSource) return null;
        var oRule = new ImageReplaceRule(swPattern, swWide, swMedium, swLarge);
        oSource.imageRules.push(oRule);
        return oRule;
    };

    FeedManager.prototype.removeImageRule = function (swProviderId, swChannelId, swCategoryId, swUrl, swPattern) {
        var oSource = this.getSource(swProviderId, swChannelId, swCategoryId, swUrl);
        if (!oSource) return;
        for (var i = 0; i < oSource.imageRules.length; i++) {
            if (oSource.imageRules[i].pattern === swPattern) {
                oSource.imageRules.splice(i, 1);
                break;
            }
        }
    };

    // ===== API：获取所有数据 =====
    // providers 和 channels 和 categories 和 sources
    FeedManager.prototype.datas = function () {
        return { providers: this.providers };
    };

    // ===== API：持久化 =====
    FeedManager.prototype.save = function (swFileName) {
        if (!swFileName) swFileName = FEEDMGR_STORAGE_FILEPATH;
        var localFolder = Windows.Storage.ApplicationData.current.localFolder;
        var self = this;
        return localFolder.createFileAsync(swFileName,
            Windows.Storage.CreationCollisionOption.replaceExisting)
            .then(function (file) {
                var swJson = JSON.stringify({ providers: self.providers });
                return Windows.Storage.FileIO.writeTextAsync(file, swJson);
            });
    };

    FeedManager.prototype.load = function (swFileName) {
        if (!swFileName) swFileName = FEEDMGR_STORAGE_FILEPATH;
        var localFolder = Windows.Storage.ApplicationData.current.localFolder;
        var self = this;
        return localFolder.getFileAsync(swFileName)
            .then(function (file) {
                return Windows.Storage.FileIO.readTextAsync(file);
            }).then(function (swJson) {
                if (NString.empty (swJson) || NString.trim (swJson).length < 2) {
                    self.providers = [];
                    return;
                }
                var obj = JSON.parse(swJson);
                self.providers = obj.providers || [];
            }, function () {
                self.providers = [];
            });
    };

    FeedManager.prototype.update = function (swFileName) {
        if (!swFileName) swFileName = FEEDMGR_STORAGE_FILEPATH;
        return this.save(swFileName).then(function () {
            this.load(swFileName);
        });
    };

    // ===== 暴露全局单例 =====
    extern({
        FeedManager: new FeedManager(),
        FeedUpdateStrategy: FeedUpdateStrategy
    });

})();
