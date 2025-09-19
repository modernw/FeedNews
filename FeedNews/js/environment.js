(function () {
    "use strict";
    /**
     * Environment 类
     * 用于在简单隔离环境中运行 eval，同时保留局部变量
     * @class
     * @param {Object} [options] 可选参数
     * @param {Array.<string>} [options.blocked] 默认屏蔽的全局变量/方法
     * @param {Object} [options.customBlock] 精准屏蔽，如 {document:{body:true}}
     */
    function Environment(options) {
        options = options || {};
        var blankFunction = function () { };
        // 默认屏蔽的全局函数和对象
        var defaultBlocked = [
            "alert", "confirm", "prompt", "open", "close", "focus", "print",
            "setTimeout", "setInterval", "clearTimeout", "clearInterval", "setImmediate",
            "fetch", "XMLHttpRequest", "ActiveXObject", "WebSocket", "EventSource",
            "FileReader", "File", "Blob", "Image", "Audio", "Video", "CanvasRenderingContext2D",
            "Worker", "SharedWorker"
        ];
        var customBlock = options.customBlock || {};
        /** @type {Object} 当前环境对象 */
        this.env = {};
        // 屏蔽普通 key
        function blockKeys(targetObj, keys) {
            if (!targetObj) return;
            for (var i = 0; i < keys.length; i++) {
                var k = keys[i];
                targetObj[k] = blankFunction;
            }
        }
        // 递归精准屏蔽
        function blockRecursive(obj, rules) {
            if (!obj || !rules) return;
            for (var k in rules) {
                if (!rules.hasOwnProperty(k)) continue;
                if (rules[k] === true) obj[k] = blankFunction;
                else if (typeof rules[k] === "object") {
                    if (!obj[k]) obj[k] = {};
                    blockRecursive(obj[k], rules[k]);
                }
            }
        }
        /**
         * 初始化环境
         */
        this.init = function () {
            blockKeys(this.env, defaultBlocked.concat(options.blocked || []));
            // 常见全局对象
            this.env.window = {};
            this.env.document = {};
            this.env.navigator = {};
            this.env.location = {};
            this.env.history = {};
            this.env.screen = {};
            this.env.localStorage = {};
            this.env.sessionStorage = {};
            this.env.console = {
                log: blankFunction, error: blankFunction, warn: blankFunction,
                info: blankFunction, debug: blankFunction
            };
            // 自定义精准屏蔽
            blockRecursive(this.env, customBlock);
        };
        /**
         * 添加屏蔽
         * @param {string} key
         * @param {*} value
         */
        this.block = function (key, value) {
            if (!key) return;
            this.env[key] = (value === true || typeof value === "undefined") ? blankFunction : value;
        };
        /**
         * 取消屏蔽
         * @param {string} key
         * @param {*} value
         */
        this.unblock = function (key, value) {
            if (!key) return;
            if (typeof value === "undefined") value = void 0;
            this.env[key] = value;
        };
        /**
         * 在沙箱环境中执行 eval
         * @param {string} code JavaScript 代码
         * @param {Object} [locals] 外部局部变量对象，可同步修改
         * @returns {*} eval 执行结果
         */
        this.run = function (code, locals) {
            locals = locals || {};
            try {
                var env = this.env;
                // 创建一个新的对象，将 env 和 locals 属性注入 eval 作用域
                return (function () {
                    "use strict";
                    for (var k in env) if (env.hasOwnProperty(k)) this[k] = env[k];
                    for (var k2 in locals) if (locals.hasOwnProperty(k2)) this[k2] = locals[k2];
                    return eval(code);
                }).call({});
            } catch (e) {
                throw e;
            }
        };
        this.init();
    }
    extern({
        Environment: Environment
    });
})();