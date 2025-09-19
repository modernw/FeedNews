(function () {
    "use strict";
    /**
     * Uri 类
     * 解析和生成通用 URI
     * @class
     * @param {string} [uriStr] 初始 URI 字符串
     */
    function Uri(uriStr) {
        uriStr = uriStr || "";
        // 内部存储
        var _scheme = "",
            _authority = "",
            _path = "",
            _fragment = "";
        /** @type {Object.<string,string>} 存储 query 参数 */
        this.params = {};
        /**
         * 私有方法：解析 URI 字符串
         * @param {string} uri
         */
        function parseURI(uri) {
            if (!uri || typeof uri !== "string") return;
            var m = uri.match(/^([a-z]+):(?:\/\/([^\/?#]*))?([^?#]*)(?:\?([^#]*))?(?:#(.*))?$/i);
            if (m) {
                _scheme = m[1] || "";
                _authority = m[2] || "";
                _path = m[3] || "";
                _fragment = m[5] || "";
                this.params = {};
                if (m[4]) {
                    var pairs = m[4].split("&");
                    for (var i = 0; i < pairs.length; i++) {
                        var kv = pairs[i].split("=");
                        var k = decodeURIComponent(kv[0] || "");
                        var v = decodeURIComponent(kv[1] || "");
                        this.params[k] = v;
                    }
                }
            } else {
                _scheme = _authority = _path = _fragment = "";
                this.params = {};
            }
        }
        /**
         * 私有方法：生成 URI 字符串
         * @returns {string} 完整 URI
         */
        function buildURI() {
            var uri = "";
            if (_scheme) uri += _scheme + ":";
            if (_authority) uri += "//" + _authority;
            if (_path) uri += _path;
            var qs = [];
            for (var k in this.params) {
                if (this.params.hasOwnProperty(k)) {
                    qs.push(encodeURIComponent(k) + "=" + encodeURIComponent(this.params[k]));
                }
            }
            if (qs.length) uri += "?" + qs.join("&");
            if (_fragment) uri += "#" + _fragment;
            return uri;
        }
        // 构造函数初始化
        if (uriStr) parseURI.call(this, uriStr);
        // 属性 getter/setter
        Object.defineProperty(this, "url", {
            /** @type {string} 获取或设置完整 URI */
            get: function () { return buildURI.call(this); },
            set: function (value) { parseURI.call(this, value); }
        });
        Object.defineProperty(this, "scheme", { get: function () { return _scheme; }, set: function (v) { _scheme = v; } });
        Object.defineProperty(this, "authority", { get: function () { return _authority; }, set: function (v) { _authority = v; } });
        Object.defineProperty(this, "path", { get: function () { return _path; }, set: function (v) { _path = v; } });
        Object.defineProperty(this, "fragment", { get: function () { return _fragment; }, set: function (v) { _fragment = v; } });
        // 重载方法
        this.toString = function () { return buildURI.call(this); };
        this.valueOf = function () { return buildURI.call(this); };
    }
    /**
     * 静态方法：拼接 base URI 和 relative URI
     * @param {string} base
     * @param {string} relative
     * @returns {string} 拼接后的 URI
     */
    Uri.join = function (base, relative) {
        if (!base) return relative || "";
        if (!relative) return base || "";
        try {
            if (base.charAt(base.length - 1) !== "/" && relative.charAt(0) !== "/") base += "/";
        } catch (e) { }
        return base + relative;
    };
    /**
     * Url 类
     * @class
     * @extends Uri
     * @param {string} [urlStr] 初始 URL
     */
    function Url(urlStr) {
        Uri.call(this, urlStr);
        /** @type {string} 主机名 */
        this.host = "";
        /** @type {string} 端口号 */
        this.port = "";
        /** @type {string} 用户信息 */
        this.userinfo = "";
        function parseURL(url) {
            var authority = this.authority || "";
            var m = authority.match(/^(?:([^@]+)@)?([^:]+)(?::(\d+))?$/);
            if (m) {
                this.userinfo = m[1] || "";
                this.host = m[2] || "";
                this.port = m[3] || "";
            }
        }
        parseURL.call(this, urlStr);
        /**
         * 生成 URL 字符串
         * @returns {string} URL 字符串
         */
        this.toString = function () {
            var uri = "";
            if (this.scheme) uri += this.scheme + ":";
            if (this.host) {
                uri += "//";
                if (this.userinfo) uri += this.userinfo + "@";
                uri += this.host;
                if (this.port) uri += ":" + this.port;
            }
            if (this.path) uri += this.path;
            var qs = [];
            for (var k in this.params) {
                if (this.params.hasOwnProperty(k)) {
                    qs.push(encodeURIComponent(k) + "=" + encodeURIComponent(this.params[k]));
                }
            }
            if (qs.length) uri += "?" + qs.join("&");
            if (this.fragment) uri += "#" + this.fragment;
            return uri;
        };
        Object.defineProperty(this, "extension", {
            /** @type {string} 文件扩展名，包含 "."，如 ".jpg"；没有则返回 "" */
            get: function () {
                var p = this.path || "";
                if (!p) return "";
                var lastSlash = p.lastIndexOf("/");
                var filename = (lastSlash >= 0) ? p.substring(lastSlash + 1) : p;
                if (!filename || filename.indexOf(".") < 0) return "";
                var lastDot = filename.lastIndexOf(".");
                if (lastDot < 0 || lastDot === filename.length - 1) return "";
                return filename.substring(lastDot);
            }
        });
    }
    Url.prototype = Object.create(Uri.prototype);
    Url.prototype.constructor = Url;
    /**
     * 静态方法：拼接 URL
     * @param {string} base
     * @param {string} relative
     * @returns {string} 拼接后的 URL
     */
    Url.join = function (base, relative) {
        return Uri.join(base, relative);
    };
    /**
     * Urn 类
     * @class
     * @extends Uri
     * @param {string} [urnStr] 初始 URN
     */
    function Urn(urnStr) {
        Uri.call(this, urnStr);
        Object.defineProperty(this, "nid", {
            /** @type {string} 命名空间标识符 */
            get: function () {
                var arr = (this.path || "").split(":");
                return arr[0] || "";
            }
        });
        Object.defineProperty(this, "nss", {
            /** @type {string} 命名空间特定字符串 */
            get: function () {
                var arr = (this.path || "").split(":");
                arr.shift();
                return arr.join(":");
            }
        });
    }
    Urn.prototype = Object.create(Uri.prototype);
    Urn.prototype.constructor = Urn;
    /**
     * 静态方法：对参数对象进行 URL 编码
     * @param {Object.<string,string>} params
     * @returns {string} 编码后的 query 字符串
     */
    Uri.encodeParams = function (params) {
        if (!params || typeof params !== "object") return "";
        var arr = [];
        for (var k in params) {
            if (params.hasOwnProperty(k)) {
                var key = encodeURIComponent(k || "");
                var value = encodeURIComponent(params[k] || "");
                arr.push(key + "=" + value);
            }
        }
        return arr.join("&");
    };
    /**
     * ParamText 类
     * 用于处理类似阿里云 OSS 的非正式参数文本
     * 支持解析、修改、生成参数字符串
     * @class
     * @param {string} [text] 初始参数文本
     * @param {Object} [options] 配置项
     * @param {string} [options.levelSep='/'] 层级分隔符
     * @param {string} [options.paramSep=','] 参数分隔符
     * @param {string} [options.keyValueSep='_'] key/value 分隔符，默认 '_'，阿里云 OSS 常用 ',' 或 '='
     */
    function ParamText(text, options) {
        options = options || {};
        /** @type {string} 层级分隔符 */
        this.levelSep = options.levelSep || "/";
        /** @type {string} 参数分隔符 */
        this.paramSep = options.paramSep || ",";
        /** @type {string} key/value 分隔符 */
        this.keyValueSep = options.keyValueSep || ",";
        /** @type {Array} 层级数组，每个元素是 {name: string, params: Object.<string,string>} */
        this.levels = [];
        /**
         * 解析参数文本
         * @param {string} txt
         */
        this.parse = function(txt){
            if(!txt || typeof txt !== "string") return;
            var lv = txt.split(this.levelSep);
            this.levels = [];
            for(var i=0;i<lv.length;i++){
                var part = lv[i];
                if(!part) continue;
                var firstSep = part.indexOf(this.paramSep);
                var name, paramStr;
                if(firstSep >= 0){
                    name = part.substring(0,firstSep);
                    paramStr = part.substring(firstSep+1);
                }else{
                    name = part;
                    paramStr = "";
                }
                var params = {};
                if(paramStr){
                    var kvPairs = paramStr.split(this.paramSep);
                    for(var j=0;j<kvPairs.length;j++){
                        var kv = kvPairs[j];
                        if(!kv) continue;
                        var kvSplit = kv.split(this.keyValueSep);
                        var k = kvSplit[0] || "";
                        var v = kvSplit[1] || "";
                        params[k] = v;
                    }
                }
                this.levels.push({name:name, params: params});
            }
        };
        /**
         * 设置某个层级的参数
         * @param {number} levelIndex 层级索引，从0开始
         * @param {string} key 参数名
         * @param {string} value 参数值
         */
        this.setParam = function(levelIndex, key, value){
            if(this.levels[levelIndex]){
                this.levels[levelIndex].params[key] = value;
            }
        };
        /**
         * 获取某个层级的参数
         * @param {number} levelIndex 层级索引
         * @param {string} key 参数名
         * @returns {string} 参数值
         */
        this.getParam = function(levelIndex, key){
            if(this.levels[levelIndex] && this.levels[levelIndex].params.hasOwnProperty(key)){
                return this.levels[levelIndex].params[key];
            }
            return "";
        };
        /**
         * 生成参数文本
         * @returns {string}
         */
        this.toString = function(){
            var arr = [];
            for(var i=0;i<this.levels.length;i++){
                var l = this.levels[i];
                var paramsArr = [];
                for(var k in l.params){
                    if(l.params.hasOwnProperty(k)){
                        paramsArr.push(k + this.keyValueSep + l.params[k]);
                    }
                }
                if(paramsArr.length){
                    arr.push(l.name + this.paramSep + paramsArr.join(this.paramSep));
                }else{
                    arr.push(l.name);
                }
            }
            return arr.join(this.levelSep);
        };
        /**
         * 添加新的层级
         * @param {string} name 层级名称
         * @param {Object.<string,string>} [params] 参数对象
         */
        this.addLevel = function(name, params){
            params = params || {};
            this.levels.push({name: name, params: params});
        };
        // 初始化
        if(text) this.parse(text);
    }
    /**
     * UrlParams 类
     * 用于解析、修改、生成 URL query 参数
     * @class
     * @param {string|Object.<string,string>} [query] 初始 query 字符串或对象
     */
    function UrlParams(query) {
        /** @type {Object.<string,string>} 存储参数 */
        this.params = {};
        /**
         * 解析 query 字符串
         * @param {string} qs query 字符串，如 "a=1&b=2"
         */
        this.parse = function (qs) {
            this.params = {};
            if (!qs || typeof qs !== "string") return;
            if (qs.charAt(0) === "?") qs = qs.substr(1);
            var pairs = qs.split("&");
            for (var i = 0; i < pairs.length; i++) {
                var kv = pairs[i];
                if (!kv) continue;
                var idx = kv.indexOf("=");
                if (idx >= 0) {
                    var k = decodeURIComponent(kv.substr(0, idx));
                    var v = decodeURIComponent(kv.substr(idx + 1));
                    this.params[k] = v;
                } else {
                    this.params[decodeURIComponent(kv)] = "";
                }
            }
        };
        /**
         * 设置参数
         * @param {string} key
         * @param {string} value
         */
        this.set = function (key, value) {
            if (!key) return;
            this.params[key] = value;
        };
        /**
         * 获取参数值
         * @param {string} key
         * @returns {string}
         */
        this.get = function (key) {
            return this.params.hasOwnProperty(key) ? this.params[key] : "";
        };
        /**
         * 删除参数
         * @param {string} key
         */
        this.remove = function (key) {
            if (this.params.hasOwnProperty(key)) delete this.params[key];
        };
        /**
         * 清空所有参数
         */
        this.clear = function () {
            this.params = {};
        };
        /**
         * 生成 query 字符串
         * @returns {string} 生成的 query，如 "a=1&b=2"
         */
        this.toString = function () {
            var arr = [];
            for (var k in this.params) {
                if (this.params.hasOwnProperty(k)) {
                    arr.push(encodeURIComponent(k) + "=" + encodeURIComponent(this.params[k]));
                }
            }
            return arr.join("&");
        };
        // 构造函数初始化
        if (typeof query === "string") this.parse(query);
        else if (typeof query === "object" && query !== null) {
            for (var k in query) {
                if (query.hasOwnProperty(k)) this.params[k] = query[k];
            }
        }
    }
    extern({
        Link: {
            Url: Url,
            Urn: Urn,
            Uri: Uri,
            Params: {
                General: ParamText,
                UriParams: UrlParams
            }
        }
    });
})();