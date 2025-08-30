(function () {
    "use strict";

    // ---------------------- 辅助函数 ----------------------
    function addEvent(element, type, handler) {
        if (!element) return;
        if (element.addEventListener) {
            element.addEventListener(type, handler, false);
        } else if (element.attachEvent) {
            element.attachEvent("on" + type, handler);
        } else {
            element["on" + type] = handler;
        }
    }

    // ---------------------- Size类 ----------------------
    function Size(uWidth, uHeight) {
        this.width = uWidth || 0;
        this.height = uHeight || 0;
        this.square = function () { return this.width * this.height; };
        this.aspectRatio = function () { return this.height !== 0 ? this.width / this.height : 0; };
    }

    // ---------------------- ImageMoveScale类 ----------------------
    function ImageMoveScale(imgNode) {
        this._node = imgNode;
        if (!this._node) throw "错误：初始化必须需要有效节点";

        // 图片状态属性
        this.imgOrigSize = new Size();
        this.imgCurrSize = new Size();
        this.imgPosition = { left: 0, top: 0 };
        this.scale = 1;
        this.minScale = 1;
        this.maxScale = 10; // 最大缩放限制

        // 交互状态
        this.dragging = false;
        this.lastX = 0;
        this.lastY = 0;

        // 初始化
        this._initialize();
    }

    // 父元素属性
    Object.defineProperty(ImageMoveScale.prototype, "parentNode", {
        get: function () { return this._node ? this._node.parentNode : null; }
    });

    // ---------------------- 初始化 ----------------------
    ImageMoveScale.prototype._initialize = function () {
        var self = this;

        this._node.style.position = "absolute";
        this._node.style.left = "0px";
        this._node.style.top = "0px";
        this._node.style.cursor = "grab";

        var imgObj = new Image();
        imgObj.src = this._node.src;
        imgObj.onload = function () {
            self.imgOrigSize = new Size(imgObj.width, imgObj.height);
            self._resetImage();
            self._setupEvents();
        };
    };

    // ---------------------- 获取父元素尺寸 ----------------------
    ImageMoveScale.prototype._getParentSize = function () {
        if (this.parentNode) {
            return new Size(this.parentNode.clientWidth, this.parentNode.clientHeight);
        }
        return new Size(0, 0);
    };

    // ---------------------- 更新图片位置和尺寸 ----------------------
    ImageMoveScale.prototype._updateImagePosition = function () {
        this._node.style.width = this.imgCurrSize.width + "px";
        this._node.style.height = this.imgCurrSize.height + "px";
        this._node.style.left = this.imgPosition.left + "px";
        this._node.style.top = this.imgPosition.top + "px";
    };

    // ---------------------- 限制图片位置 ----------------------
    ImageMoveScale.prototype._limitImagePosition = function () {
        var parentSize = this._getParentSize();

        if (this.imgCurrSize.width <= parentSize.width) {
            this.imgPosition.left = (parentSize.width - this.imgCurrSize.width) / 2;
        } else {
            if (this.imgPosition.left > 0) this.imgPosition.left = 0;
            if (this.imgPosition.left + this.imgCurrSize.width < parentSize.width) {
                this.imgPosition.left = parentSize.width - this.imgCurrSize.width;
            }
        }

        if (this.imgCurrSize.height <= parentSize.height) {
            this.imgPosition.top = (parentSize.height - this.imgCurrSize.height) / 2;
        } else {
            if (this.imgPosition.top > 0) this.imgPosition.top = 0;
            if (this.imgPosition.top + this.imgCurrSize.height < parentSize.height) {
                this.imgPosition.top = parentSize.height - this.imgCurrSize.height;
            }
        }
    };

    // ---------------------- 缩放 ----------------------
    ImageMoveScale.prototype.zoom = function (delta, x, y) {
        if (!this._node || !this.parentNode) return;

        var parentSize = this._getParentSize();
        var oldScale = this.scale;
        var zoomStep = 0.1;

        if (delta > 0) this.scale = Math.min(this.scale * (1 + zoomStep), this.maxScale);
        else if (delta < 0) this.scale = Math.max(this.scale * (1 - zoomStep), this.minScale);

        var scaleRatio = this.scale / oldScale;

        // 调整图片尺寸
        this.imgCurrSize.width = this.imgOrigSize.width * this.scale;
        this.imgCurrSize.height = this.imgOrigSize.height * this.scale;

        // 缩放中心位置调整
        var offsetX = x - this.imgPosition.left;
        var offsetY = y - this.imgPosition.top;
        this.imgPosition.left = x - offsetX * scaleRatio;
        this.imgPosition.top = y - offsetY * scaleRatio;

        this._limitImagePosition();
        this._updateImagePosition();
    };

    // ---------------------- 移动 ----------------------
    ImageMoveScale.prototype.move = function (dx, dy) {
        var parentSize = this._getParentSize();

        if (this.imgCurrSize.width > parentSize.width) {
            this.imgPosition.left += dx;
            if (this.imgPosition.left > 0) this.imgPosition.left = 0;
            if (this.imgPosition.left + this.imgCurrSize.width < parentSize.width) {
                this.imgPosition.left = parentSize.width - this.imgCurrSize.width;
            }
        } else {
            this.imgPosition.left = (parentSize.width - this.imgCurrSize.width) / 2;
        }

        if (this.imgCurrSize.height > parentSize.height) {
            this.imgPosition.top += dy;
            if (this.imgPosition.top > 0) this.imgPosition.top = 0;
            if (this.imgPosition.top + this.imgCurrSize.height < parentSize.height) {
                this.imgPosition.top = parentSize.height - this.imgCurrSize.height;
            }
        } else {
            this.imgPosition.top = (parentSize.height - this.imgCurrSize.height) / 2;
        }

        this._updateImagePosition();
    };

    // ---------------------- 重置 ----------------------
    ImageMoveScale.prototype.reset = function () {
        this._resetImage();
    };

    ImageMoveScale.prototype._resetImage = function () {
        var parentSize = this._getParentSize();
        var scaleX = parentSize.width / this.imgOrigSize.width;
        var scaleY = parentSize.height / this.imgOrigSize.height;

        // 保证图片完整显示
        this.minScale = Math.min(scaleX, scaleY);
        this.scale = this.minScale;

        this.imgCurrSize.width = this.imgOrigSize.width * this.scale;
        this.imgCurrSize.height = this.imgOrigSize.height * this.scale;

        this.imgPosition.left = (parentSize.width - this.imgCurrSize.width) / 2;
        this.imgPosition.top = (parentSize.height - this.imgCurrSize.height) / 2;

        this._updateImagePosition();
    };

    // ---------------------- 鼠标事件 ----------------------
    ImageMoveScale.prototype._onMouseDown = function (e) {
        if ((e.button || e.which) === 1) {
            this.dragging = true;
            this.lastX = typeof e.pageX === "number" ? e.pageX : e.clientX;
            this.lastY = typeof e.pageY === "number" ? e.pageY : e.clientY;

            if (typeof document.body.setCapture === "function") {
                document.body.setCapture();
            }

            this._node.style.cursor = "grabbing";
            if (e.preventDefault) e.preventDefault();
            e.returnValue = false;
            return false;
        }
    };

    ImageMoveScale.prototype._onMouseUp = function (e) {
        this.dragging = false;
        if (typeof document.body.releaseCapture === "function") {
            document.body.releaseCapture();
        }
        this._node.style.cursor = "grab";
    };

    ImageMoveScale.prototype._onMouseMove = function (e) {
        if (!this.dragging) return;
        var x = typeof e.pageX === "number" ? e.pageX : e.clientX;
        var y = typeof e.pageY === "number" ? e.pageY : e.clientY;
        var dx = x - this.lastX;
        var dy = y - this.lastY;
        this.move(dx, dy);
        this.lastX = x;
        this.lastY = y;
    };

    // ---------------------- 滚轮事件 ----------------------
    ImageMoveScale.prototype._onWheel = function (e) {
        if (!e.ctrlKey) return;

        if (e.preventDefault) e.preventDefault();
        else e.returnValue = false;

        var delta = 0;
        if (e.wheelDelta) delta = e.wheelDelta / 120;
        else if (e.detail) delta = -e.detail / 3;

        var rect = this.parentNode.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;

        this.zoom(delta, x, y);
    };

    // ---------------------- 触摸事件 ----------------------
    ImageMoveScale.prototype._onTouchStart = function (e) {
        if (e.touches.length === 1) {
            this.dragging = true;
            this.lastX = e.touches[0].clientX;
            this.lastY = e.touches[0].clientY;
            this._node.style.cursor = "grabbing";
            if (e.preventDefault) e.preventDefault();
            e.returnValue = false;
            return false;
        }
    };

    ImageMoveScale.prototype._onTouchEnd = function (e) {
        this.dragging = false;
        this._node.style.cursor = "grab";
    };

    ImageMoveScale.prototype._onTouchMove = function (e) {
        if (!this.dragging || e.touches.length !== 1) return;
        var x = e.touches[0].clientX;
        var y = e.touches[0].clientY;
        var dx = x - this.lastX;
        var dy = y - this.lastY;
        this.move(dx, dy);
        this.lastX = x;
        this.lastY = y;
        if (e.preventDefault) e.preventDefault();
        e.returnValue = false;
        return false;
    };

    // ---------------------- 设置事件监听 ----------------------
    ImageMoveScale.prototype._setupEvents = function () {
        var self = this;

        addEvent(this._node, "mousedown", function (e) { self._onMouseDown(e); });
        addEvent(document, "mouseup", function (e) { self._onMouseUp(e); });
        addEvent(document, "mousemove", function (e) { self._onMouseMove(e); });

        if ("onwheel" in this._node) {
            addEvent(this._node, "wheel", function (e) { self._onWheel(e); });
        } else if ("onmousewheel" in this._node) {
            addEvent(this._node, "mousewheel", function (e) { self._onWheel(e); });
        } else {
            addEvent(this._node, "DOMMouseScroll", function (e) { self._onWheel(e); });
        }

        addEvent(this._node, "touchstart", function (e) { self._onTouchStart(e); });
        addEvent(document, "touchend", function (e) { self._onTouchEnd(e); });
        addEvent(document, "touchmove", function (e) { self._onTouchMove(e); });
    };

    // ---------------------- 导出 ----------------------
    extern({ ImageMoveScale: ImageMoveScale });
})();
