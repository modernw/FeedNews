(function () {
    "use strict";
    (function () {
        "use strict";
        function FileManager() {
            this.localFolder = Windows.Storage.ApplicationData.current.localFolder;
        }

        FileManager.prototype = {
            createFile: function (fileName, content, collisionOption) {
                var self = this;
                if (!collisionOption) collisionOption = Windows.Storage.CreationCollisionOption.replaceExisting;

                return self.localFolder.createFileAsync(fileName, collisionOption).then(function (file) {
                    return Windows.Storage.FileIO.writeTextAsync(file, content).then(function () {
                        return file;
                    });
                });
            },
            readFile: function (fileName) {
                var self = this;
                return self.localFolder.getFileAsync(fileName).then(function (file) {
                    return Windows.Storage.FileIO.readTextAsync(file);
                });
            },
            writeFile: function (fileName, content) {
                var self = this;
                return self.localFolder.getFileAsync(fileName).then(function (file) {
                    return Windows.Storage.FileIO.writeTextAsync(file, content).then(function () {
                        return file;
                    });
                });
            },
            deleteFile: function (fileName) {
                var self = this;
                return self.localFolder.getFileAsync(fileName).then(function (file) {
                    return file.deleteAsync();
                });
            },
            fileExists: function (fileName) {
                var self = this;
                return self.localFolder.getFileAsync(fileName).then(function () {
                    return true;
                }, function (error) {
                    if (error.number === -2147024894) { // HRESULT: 文件不存在
                        return false;
                    }
                    return WinJS.Promise.wrapError(error);
                });
            },
            listFiles: function () {
                var self = this;
                return self.localFolder.getFilesAsync();
            }
        };
        extern({ FileManager: FileManager });
    })();
    (function () {
        "use strict";

        function XmlFile(fileName) {
            this.fileName = fileName;
            this.file = null;       // Windows.Storage.StorageFile 对象
            this.xmlDoc = null;     // Windows.Data.Xml.Dom.XmlDocument 对象
        }

        XmlFile.prototype = {
            // 打开文件，如果不存在则创建，并加载 XML
            open: function () {
                var self = this;
                var localFolder = Windows.Storage.ApplicationData.current.localFolder;

                return localFolder.getFileAsync(self.fileName).then(null, function (error) {
                    if (error.number === -2147024894) { // 文件不存在，创建
                        return localFolder.createFileAsync(self.fileName, Windows.Storage.CreationCollisionOption.replaceExisting);
                    }
                    return WinJS.Promise.wrapError(error);
                }).then(function (file) {
                    self.file = file;
                    var xmlDoc = new Windows.Data.Xml.Dom.XmlDocument();
                    return xmlDoc.loadFromFileAsync(file);
                }).then(function (loadedXmlDoc) {
                    self.xmlDoc = loadedXmlDoc;
                    return self;
                });
            },

            // 保存文件
            save: function () {
                var self = this;
                if (!self.file || !self.xmlDoc) {
                    return WinJS.Promise.wrapError("文件未打开或 XML 未加载");
                }
                var xmlText = self.xmlDoc.getXml();
                return Windows.Storage.FileIO.writeTextAsync(self.file, xmlText);
            },

            // 获取根节点
            getRoot: function () {
                return this.xmlDoc ? this.xmlDoc.documentElement : null;
            },

            // 根据标签名获取节点列表
            getElementsByTagName: function (tagName) {
                if (!this.xmlDoc) return null;
                return this.xmlDoc.getElementsByTagName(tagName);
            },

            // 创建新节点
            createElement: function (tagName) {
                if (!this.xmlDoc) return null;
                return this.xmlDoc.createElement(tagName);
            },

            // 添加子节点
            appendChild: function (parent, child) {
                if (!parent || !child) return;
                parent.appendChild(child);
            },

            // 设置节点文本
            setNodeText: function (node, text) {
                if (!node) return;
                node.innerText = text;
            },

            // 获取节点文本
            getNodeText: function (node) {
                return node ? node.innerText : "";
            }
        };

        extern({ XmlFile: XmlFile });
    })();
    (function () {
        "use strict";

        var storage = Windows.Storage;
        var fileIO = Windows.Storage.FileIO;
        var creationCollisionOption = storage.CreationCollisionOption;

        function JSONFile(file) {
            this.file = file;       // StorageFile
            this.data = {};         // 内存中的 JSON 对象
        }

        JSONFile.prototype = {
            // 打开文件（异步），folder 可以是 StorageFolder 或 string
            open: function (folder, filename) {
                var that = this;
                var folderPromise;

                if (typeof folder === "string") {
                    // 在 localFolder 下创建或获取子文件夹
                    folderPromise = storage.ApplicationData.current.localFolder
                        .createFolderAsync(folder, creationCollisionOption.openIfExists);
                } else {
                    // 已经是 StorageFolder
                    folderPromise = WinJS.Promise.as(folder);
                }

                return folderPromise
                    .then(function (realFolder) {
                        return realFolder.createFileAsync(filename, creationCollisionOption.openIfExists);
                    })
                    .then(function (file) {
                        that.file = file;
                        return fileIO.readTextAsync(file);
                    })
                    .then(function (text) {
                        if (text && text.trim().length > 0) {
                            try {
                                that.data = JSON.parse(text);
                            } catch (e) {
                                console.warn("JSON 解析失败，使用空对象:", e);
                                that.data = {};
                            }
                        } else {
                            that.data = {};
                        }
                        return that;
                    });
            },

            // 获取 JSON 对象
            getData: function () {
                return this.data;
            },

            // 设置 JSON 对象
            setData: function (obj) {
                this.data = obj;
            },

            // 保存文件（异步）
            save: function () {
                var jsonText = JSON.stringify(this.data, null, 2); // 格式化输出
                return fileIO.writeTextAsync(this.file, jsonText);
            }
        };

        // 工厂方法，方便直接创建实例
        JSONFile.create = function (folder, filename) {
            var jf = new JSONFile(null);
            return jf.open(folder, filename);
        };

        extern({ JSONFile: JSONFile });
    })();

})();