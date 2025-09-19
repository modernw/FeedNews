(function () {
    "use strict";

    var elderevent = window.onresize;
    var nodemap = []; 
    function resizeHookEvent(hEvent) {
        for (var i = 0; i < nodemap.length; i++) {
            var item = nodemap[i];
            if (item && item.node && item.callback) {
                (function (callback, args1, args2) {
                    setTimeout(function () {
                        var pnode = args2.parentNode;
                        var parent = null;
                        try {
                            parent = {
                                client: {
                                    width: pnode.clientWidth,
                                    height: pnode.clientHeight
                                },
                                offset: {
                                    width: pnode.offsetWidth,
                                    height: pnode.offsetHeight
                                },
                                scroll: {
                                    width: pnode.scrollWidth,
                                    height: pnode.scrollHeight
                                },
                                rect: pnode.getBoundingClientRect()
                            };
                        } catch (e) { }
                        if (callback) callback(args1, parent, args2);
                    }, 0);
                })(item.callback, hEvent, item.node);
            } else {
                nodemap.splice(i, 1);
                i--;
            }
        }
        if (elderevent) return elderevent(hEvent);
    }
    window.onresize = resizeHookEvent;
    function observeResizeE(hNode, pfCallback) {
        var entry = { node: hNode, callback: pfCallback };
        nodemap.push(entry);
        return {
            unregister: function () {
                for (var i = 0; i < nodemap.length; i++) {
                    if (nodemap[i] && nodemap[i].node === hNode) {
                        nodemap.splice(i, 1);
                        break;
                    }
                }
            }
        };
    }
    function observeChildChangeE(hNode, pfCallback) {
        if (!hNode || typeof pfCallback !== "function") {
            return { unregister: function () { } };
        }

        var observer = null;
        var handlerInsert = null;
        var handlerRemove = null;

        if (window.MutationObserver) {
            observer = new MutationObserver(function (mutations) {
                for (var i = 0; i < mutations.length; i++) {
                    var m = mutations[i];
                    if (m.type === "childList") {
                        pfCallback(m);
                    }
                }
            });
            observer.observe(hNode, { childList: true, subtree: false });
        } else {
            // IE10 fallback: DOMNodeInserted / DOMNodeRemoved
            handlerInsert = function (e) { pfCallback({ type: "childList", addedNodes: [e.target], removedNodes: [] }); };
            handlerRemove = function (e) { pfCallback({ type: "childList", addedNodes: [], removedNodes: [e.target] }); };

            hNode.addEventListener("DOMNodeInserted", handlerInsert, false);
            hNode.addEventListener("DOMNodeRemoved", handlerRemove, false);
        }

        return {
            unregister: function () {
                if (observer) {
                    observer.disconnect();
                } else {
                    if (handlerInsert) hNode.removeEventListener("DOMNodeInserted", handlerInsert, false);
                    if (handlerRemove) hNode.removeEventListener("DOMNodeRemoved", handlerRemove, false);
                }
            }
        };
    }
    extern({
        registerSizeChangeEvent: function (hNode, pfCallback) {
            if (!hNode || typeof pfCallback !== "function") {
                return function () { };
            }
            return observeResizeE(hNode, pfCallback);
        },
        registerChildChangeEvent: function (hNode, pfCallback) {
            return observeChildChangeE(hNode, pfCallback);
        }
    });
})();
