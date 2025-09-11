// 有关“页面控制”模板的简介，请参阅以下文档:
// http://go.microsoft.com/fwlink/?LinkId=232511
(function () {
    "use strict";
    var ItemType = {
        provider: "provider",
        channel: "channel",
        category: "category",
        source: "source"
    };
    var ScrollLast = {
        Left: {},
        Top: {}
    };
    var providerClickEvent = null,
       channelClickEvent = null,
       categoryClickEvent = null,
       sourceClickEvent = null;
    function getTemplate(swElementId) {
        var clone = document.getElementById(swElementId).cloneNode(true);
        clone.style.display = "none";
        return clone;
    }
    function createItem(swId, swDisplayName, swType) {
        var node = document.createElement("div");
        node.classList.add("item");
        var span = document.createElement("span");
        span.textContent = (swDisplayName || "");
        if (!NString.equals(swType, ItemType.source)) {
            var strong = document.createElement("strong");
            strong.style.fontSize = "9pt";
            strong.textContent = " (" + (swId || "") + ")";
            span.appendChild(strong);
        }
        if (NString.empty(swDisplayName)) throw "错误：名称不可为空";
        node.appendChild(span);
        node.dataset.id = swId;
        if (NString.empty(swId)) throw "错误：ID 不可能为空";
        node.dataset.type = swType;
        node.dataset.displayName = swDisplayName;
        switch (swType) {
            case ItemType.provider:
            case ItemType.channel:
            case ItemType.category:
            case ItemType.source:
                break;
            default:
                throw "错误：类型不符合";
        }
        return node;
    }
    function initMgrControls() {
        function moveUp(hNode) {
            if (!hNode || !hNode.parentNode) return false;
            var oParent = hNode.parentNode;
            var oPrev = hNode.previousElementSibling; // 前一个兄弟节点
            if (oPrev) {
                oParent.insertBefore(hNode, oPrev); // 把当前节点插到前一个兄弟前面
                return true;
            }
            return false; // 已经是第一个，不能再上移
        }
        function moveDown(hNode) {
            if (!hNode || !hNode.parentNode) return false;
            var oParent = hNode.parentNode;
            var oNext = hNode.nextElementSibling; // 后一个兄弟节点
            if (oNext) {
                oParent.insertBefore(oNext, hNode); // 把后一个插到当前节点前面 → 相当于交换
                return true;
            }
            return false; // 已经是最后一个，不能再下移
        }
        var updatemodeselect = document.getElementById("category-updatemode");
        var templateupdatemodeselect = document.getElementById("category_create_edit").querySelector("#update-mode-input");
        var keys = Object.keys(FeedUpdateStrategy);
        for (var i = 0; keys && i < keys.length; i++) {
            var option = document.createElement("option");
            option.dataset.id = FeedUpdateStrategy[keys[i]];
            option.value = FeedUpdateStrategy[keys[i]];
            var resname = "FeedManager.UpdateMode." + FeedUpdateStrategy[keys[i]];
            option.textContent = rcString(resname);
            updatemodeselect.appendChild(option);
            templateupdatemodeselect.appendChild(option.cloneNode(true));
        }
        var container = document.getElementById("feedmgr-html-blockcontainer");
        var blocks = container.querySelectorAll(".manager-block");
        var providerlistnode = null;
        var channellistnode = null;
        var categorylistnode = null;
        var sourcelistnode = null;
        for (var i = 0; i < blocks.length; i++) {
            var block = blocks[i];
            var list = block.querySelector(".manager-list");
            var ctrl = block.querySelector(".manager-command");
            var ctrlbtn = {
                add: ctrl.querySelector(".add"),
                edit: ctrl.querySelector(".edit"),
                del: ctrl.querySelector(".delete"),
                moveup: ctrl.querySelector(".moveup"),
                movedown: ctrl.querySelector(".movedown"),
            };
            switch (block.dataset.type) {
                case ItemType.provider: {
                    providerlistnode = list;
                    ctrlbtn.add.addEventListener("click", function (e) {
                        var panel = getTemplate("provider_channel_create_edit");
                        panel.style.display = "";
                        panel.style.whiteSpace = "normal";
                        panel.querySelector("#description").textContent = rcString("FeedManager.Provider.Add");
                        var title = rcString("FeedManager.Add.Title");
                        title = title.replace("{0}", rcString("FeedManager.Provider.Title"));
                        var msgboxfunc = function () {
                            MsgBox.Async(
                                panel,
                                title,
                                MsgBox.Const.MBFLAGS.MB_OKCANCEL
                            ).done(function (result) {
                                if (MsgBox.Const.MBRET.IDOK === result) {
                                    try {
                                        var inputid = panel.querySelector("#id-input");
                                        var inputdisplay = panel.querySelector("#display-name-input");
                                        FeedManager.addProvider(inputid.value, inputdisplay.value);
                                        var providerobj = FeedManager.getProvider(inputid.value);
                                        var node = createItem(providerobj.id, providerobj.displayName, ItemType.provider);
                                        providerlistnode.appendChild(node);
                                        node.addEventListener("click", providerClickEvent);
                                        WinJS.UI.Animation.createAddToListAnimation(node, providerlistnode).execute();
                                        FeedManager.save().done(function () {
                                            node.click();
                                        });
                                    } catch (e) {
                                        var msg = new Windows.UI.Popups.MessageDialog(
                                               e.message || e || "",
                                               WinJS.Resources.getString("/resources/FeedManager.Error").value
                                           );
                                        msg.showAsync().done(function (result) {
                                            msgboxfunc();
                                        });
                                    }
                                }
                            });
                        };
                        msgboxfunc();
                    });
                    ctrlbtn.edit.addEventListener("click", function (e) {
                        var panel = getTemplate("provider_channel_create_edit");
                        panel.style.display = "";
                        panel.style.whiteSpace = "normal";
                        panel.querySelector("#description").textContent = rcString("FeedManager.Provider.Edit");
                        var inputid = panel.querySelector("#id-input");
                        inputid.disabled = true;
                        var inputdisplay = panel.querySelector("#display-name-input");
                        var selectednode = providerlistnode.querySelector(".selected");
                        if (!selectednode) return;
                        inputid.dataset.id = selectednode.dataset.id;
                        inputid.value = selectednode.dataset.id;
                        inputdisplay.value = selectednode.dataset.displayName;
                        var title = rcString("FeedManager.Edit.Title");
                        title = title.replace("{0}", rcString("FeedManager.Provider.Title"));
                        var msgboxfunc = function () {
                            MsgBox.Async(
                                panel,
                                title,
                                MsgBox.Const.MBFLAGS.MB_OKCANCEL
                            ).done(function (result) {
                                if (MsgBox.Const.MBRET.IDOK === result) {
                                    try {
                                        var inputid = panel.querySelector("#id-input");
                                        var inputdisplay = panel.querySelector("#display-name-input");
                                        FeedManager.setProviderDisplayName(inputid.value, inputdisplay.value);
                                        var providerobj = FeedManager.getProvider(inputid.value);
                                        var node = createItem(providerobj.id, providerobj.displayName, ItemType.provider);
                                        providerlistnode.replaceChild(node, selectednode);
                                        node.addEventListener("click", providerClickEvent);
                                        WinJS.UI.Animation.createAddToListAnimation(node, providerlistnode).execute();
                                        FeedManager.save().done(function () {
                                            node.click();
                                        });
                                    } catch (e) {
                                        var msg = new Windows.UI.Popups.MessageDialog(
                                               e.message || e || "",
                                               WinJS.Resources.getString("/resources/FeedManager.Error").value
                                           );
                                        msg.showAsync().done(function (result) {
                                            msgboxfunc();
                                        });
                                    }
                                }
                            });
                        };
                        msgboxfunc();
                    });
                    ctrlbtn.del.addEventListener("click", function (e) {
                        var selectednode = providerlistnode.querySelector(".selected");
                        if (!selectednode) return;
                        var parentnode = selectednode.parentNode;
                        var text = rcString("FeedManager.Delete.Title").replace("{0}", selectednode.textContent);
                        var msgboxfunc = function () {
                            MsgBox.Async(
                                null,
                                text,
                                MsgBox.Const.MBFLAGS.MB_OKCANCEL
                            ).done(function (result) {
                                if (MsgBox.Const.MBRET.IDOK === result) {
                                    try {
                                        FeedManager.removeProvider(selectednode.dataset.id);
                                        selectednode.removeNode(true);
                                        FeedManager.save().done(function () {
                                            var firstnode = parentnode.querySelector(".item");
                                            if (firstnode) firstnode.click();
                                        });
                                    } catch (e) {
                                        var msg = new Windows.UI.Popups.MessageDialog(
                                               e.message || e || "",
                                               WinJS.Resources.getString("/resources/FeedManager.Error").value
                                           );
                                        msg.showAsync().done(function (result) {
                                            msgboxfunc();
                                        });
                                    }
                                }
                            });
                        };
                        msgboxfunc();
                    });
                    ctrlbtn.moveup.addEventListener("click", function (e) {
                        var selectednode = providerlistnode.querySelector(".selected");
                        if (!selectednode) return;
                        FeedManager.moveProviderUp(selectednode.dataset.id);
                        FeedManager.save();
                        moveUp(selectednode);
                    });
                    ctrlbtn.movedown.addEventListener("click", function (e) {
                        var selectednode = providerlistnode.querySelector(".selected");
                        if (!selectednode) return;
                        FeedManager.moveProviderDown(selectednode.dataset.id);
                        FeedManager.save();
                        moveDown(selectednode);
                    });
                } break;
                case ItemType.channel: {
                    channellistnode = list;
                    ctrlbtn.add.addEventListener("click", function (e) {
                        var providerselected = providerlistnode.querySelector(".selected");
                        if (!providerselected) return;
                        var panel = getTemplate("provider_channel_create_edit");
                        panel.style.display = "";
                        panel.style.whiteSpace = "normal";
                        panel.querySelector("#description").textContent = rcString("FeedManager.Channel.Add");
                        var title = rcString("FeedManager.Add.Title");
                        title = title.replace("{0}", rcString("FeedManager.Channel.Title"));
                        var msgboxfunc = function () {
                            MsgBox.Async(
                                panel,
                                title,
                                MsgBox.Const.MBFLAGS.MB_OKCANCEL
                            ).done(function (result) {
                                if (MsgBox.Const.MBRET.IDOK === result) {
                                    try {
                                        var inputid = panel.querySelector("#id-input");
                                        var inputdisplay = panel.querySelector("#display-name-input");
                                        FeedManager.addChannel(providerselected.dataset.id, inputid.value, inputdisplay.value);
                                        var providerobj = FeedManager.getChannel(providerselected.dataset.id, inputid.value);
                                        var node = createItem(providerobj.id, providerobj.displayName, ItemType.channel);
                                        channellistnode.appendChild(node);
                                        node.addEventListener("click", channelClickEvent);
                                        WinJS.UI.Animation.createAddToListAnimation(node, channellistnode).execute();
                                        FeedManager.save().done(function () {
                                            node.click();
                                        });
                                    } catch (e) {
                                        var msg = new Windows.UI.Popups.MessageDialog(
                                               e.message || e || "",
                                               WinJS.Resources.getString("/resources/FeedManager.Error").value
                                           );
                                        msg.showAsync().done(function (result) {
                                            msgboxfunc();
                                        });
                                    }
                                }
                            });
                        };
                        msgboxfunc();
                    });
                    ctrlbtn.edit.addEventListener("click", function (e) {
                        var providerselected = providerlistnode.querySelector(".selected");
                        if (!providerselected) return;
                        var panel = getTemplate("provider_channel_create_edit");
                        panel.style.display = "";
                        panel.style.whiteSpace = "normal";
                        panel.querySelector("#description").textContent = rcString("FeedManager.Channel.Edit");
                        var inputid = panel.querySelector("#id-input");
                        inputid.disabled = true;
                        var inputdisplay = panel.querySelector("#display-name-input");
                        var selectednode = channellistnode.querySelector(".selected");
                        if (!selectednode) return;
                        inputid.dataset.id = selectednode.dataset.id;
                        inputid.value = selectednode.dataset.id;
                        inputdisplay.value = selectednode.dataset.displayName;
                        var title = rcString("FeedManager.Edit.Title");
                        title = title.replace("{0}", rcString("FeedManager.Channel.Title"));
                        var msgboxfunc = function () {
                            MsgBox.Async(
                                panel,
                                title,
                                MsgBox.Const.MBFLAGS.MB_OKCANCEL
                            ).done(function (result) {
                                if (MsgBox.Const.MBRET.IDOK === result) {
                                    try {
                                        var inputid = panel.querySelector("#id-input");
                                        var inputdisplay = panel.querySelector("#display-name-input");
                                        FeedManager.setChannelDisplayName(providerselected.dataset.id, inputid.value, inputdisplay.value);
                                        var providerobj = FeedManager.getChannel(providerselected.dataset.id, inputid.value);
                                        var node = createItem(providerobj.id, providerobj.displayName, ItemType.channel);
                                        channellistnode.replaceChild(node, selectednode);
                                        node.addEventListener("click", channelClickEvent);
                                        WinJS.UI.Animation.createAddToListAnimation(node, channellistnode).execute();
                                        FeedManager.save().done(function () {
                                            node.click();
                                        });
                                    } catch (e) {
                                        var msg = new Windows.UI.Popups.MessageDialog(
                                               e.message || e || "",
                                               WinJS.Resources.getString("/resources/FeedManager.Error").value
                                           );
                                        msg.showAsync().done(function (result) {
                                            msgboxfunc();
                                        });
                                    }
                                }
                            });
                        };
                        msgboxfunc();
                    });
                    ctrlbtn.del.addEventListener("click", function (e) {
                        var providerselected = providerlistnode.querySelector(".selected");
                        if (!providerselected) return;
                        var selectednode = channellistnode.querySelector(".selected");
                        if (!selectednode) return;
                        var parentnode = selectednode.parentNode;
                        var text = rcString("FeedManager.Delete.Title").replace("{0}", selectednode.textContent);
                        var msgboxfunc = function () {
                            MsgBox.Async(
                                null,
                                text,
                                MsgBox.Const.MBFLAGS.MB_OKCANCEL
                            ).done(function (result) {
                                if (MsgBox.Const.MBRET.IDOK === result) {
                                    try {
                                        FeedManager.removeChannel(providerselected.dataset.id, selectednode.dataset.id);
                                        selectednode.removeNode(true);
                                        FeedManager.save().done(function () {
                                            var firstnode = parentnode.querySelector(".item");
                                            if (firstnode) firstnode.click();
                                        });
                                    } catch (e) {
                                        var msg = new Windows.UI.Popups.MessageDialog(
                                               e.message || e || "",
                                               WinJS.Resources.getString("/resources/FeedManager.Error").value
                                           );
                                        msg.showAsync().done(function (result) {
                                            msgboxfunc();
                                        });
                                    }
                                }
                            });
                        };
                        msgboxfunc();
                    });
                    ctrlbtn.moveup.addEventListener("click", function (e) {
                        var providerselected = providerlistnode.querySelector(".selected");
                        if (!providerselected) return;
                        var selectednode = channellistnode.querySelector(".selected");
                        if (!selectednode) return;
                        FeedManager.moveChannelUp(providerselected.dataset.id, selectednode.dataset.id);
                        FeedManager.save();
                        moveUp(selectednode);
                    });
                    ctrlbtn.movedown.addEventListener("click", function (e) {
                        var providerselected = providerlistnode.querySelector(".selected");
                        if (!providerselected) return;
                        var selectednode = channellistnode.querySelector(".selected");
                        if (!selectednode) return;
                        FeedManager.moveChannelDown(providerselected.dataset.id, selectednode.dataset.id);
                        FeedManager.save();
                        moveDown(selectednode);
                    });
                } break;
                case ItemType.category: {
                    categorylistnode = list;
                    ctrlbtn.add.addEventListener("click", function (e) {
                        var providerselected = providerlistnode.querySelector(".selected");
                        if (!providerselected) return;
                        var channelselected = channellistnode.querySelector(".selected");
                        if (!channelselected) return;
                        var panel = getTemplate("category_create_edit");
                        panel.style.display = "";
                        panel.style.whiteSpace = "normal";
                        panel.querySelector("#description").textContent = rcString("FeedManager.Category.Add");
                        var inputshowintile = panel.querySelector("#show-in-tile-input");
                        var winctrlsit = new WinJS.UI.ToggleSwitch(inputshowintile, { title: rcString ('/resources/FeedManager.Item.ShowInTile'), checked: true });
                        var title = rcString("FeedManager.Add.Title");
                        title = title.replace("{0}", rcString("FeedManager.Category.Title"));
                        var msgboxfunc = function () {
                            MsgBox.Async(
                                panel,
                                title,
                                MsgBox.Const.MBFLAGS.MB_OKCANCEL
                            ).done(function (result) {
                                if (MsgBox.Const.MBRET.IDOK === result) {
                                    try {
                                        var inputid = panel.querySelector("#id-input");
                                        var inputdisplay = panel.querySelector("#display-name-input");
                                        var selectupdatemode = panel.querySelector("#update-mode-input");
                                        var showintile = panel.querySelector("#show-in-tile-input").winControl;
                                        FeedManager.addCategory(providerselected.dataset.id, channelselected.dataset.id, inputid.value, inputdisplay.value, selectupdatemode.value, showintile.checked);
                                        var providerobj = FeedManager.getCategory(providerselected.dataset.id, channelselected.dataset.id, inputid.value);
                                        var node = createItem(providerobj.id, providerobj.displayName, ItemType.category);
                                        node.dataset.updatemode = providerobj.updateStrategy;
                                        node.dataset.showintile = providerobj.showInTile;
                                        categorylistnode.appendChild(node);
                                        node.addEventListener("click", categoryClickEvent);
                                        WinJS.UI.Animation.createAddToListAnimation(node, categorylistnode).execute();
                                        FeedManager.save().done(function () {
                                            node.click();
                                        });
                                    } catch (e) {
                                        var msg = new Windows.UI.Popups.MessageDialog(
                                               e.message || e || "",
                                               WinJS.Resources.getString("/resources/FeedManager.Error").value
                                           );
                                        msg.showAsync().done(function (result) {
                                            msgboxfunc();
                                        });
                                    }
                                }
                            });
                        };
                        msgboxfunc();
                    });
                    ctrlbtn.edit.addEventListener("click", function (e) {
                        var providerselected = providerlistnode.querySelector(".selected");
                        if (!providerselected) return;
                        var channelselected = channellistnode.querySelector(".selected");
                        if (!channelselected) return;
                        var panel = getTemplate("category_create_edit");
                        panel.style.display = "";
                        panel.style.whiteSpace = "normal";
                        panel.querySelector("#description").textContent = rcString("FeedManager.Channel.Edit");
                        var inputid = panel.querySelector("#id-input");
                        inputid.disabled = true;
                        var inputdisplay = panel.querySelector("#display-name-input");
                        var selectednode = categorylistnode.querySelector(".selected");
                        if (!selectednode) return;
                        inputid.dataset.id = selectednode.dataset.id;
                        inputid.value = selectednode.dataset.id;
                        inputdisplay.value = selectednode.dataset.displayName;
                        var title = rcString("FeedManager.Edit.Title");
                        title = title.replace("{0}", rcString("FeedManager.Channel.Title"));
                        var inputshowintile = panel.querySelector("#show-in-tile-input");
                        var winctrlsit = new WinJS.UI.ToggleSwitch(inputshowintile, { title: rcString('/resources/FeedManager.Item.ShowInTile'), checked: true });
                        winctrlsit.checked = NString.equals(selectednode.dataset.showintile, "true");
                        var selectupdatemode = panel.querySelector("#update-mode-input");
                        selectupdatemode.value = selectednode.dataset.updatemode;
                        var msgboxfunc = function () {
                            MsgBox.Async(
                                panel,
                                title,
                                MsgBox.Const.MBFLAGS.MB_OKCANCEL
                            ).done(function (result) {
                                if (MsgBox.Const.MBRET.IDOK === result) {
                                    try {
                                        var inputid = panel.querySelector("#id-input");
                                        var inputdisplay = panel.querySelector("#display-name-input");
                                        var selectupdatemode = panel.querySelector("#update-mode-input");
                                        var inputshowintilewinctrl = panel.querySelector("#show-in-tile-input").winControl;
                                        FeedManager.setCategoryDisplayName(providerselected.dataset.id, channelselected.dataset.id, inputid.value, inputdisplay.value);
                                        FeedManager.setCategoryUpdateMode(providerselected.dataset.id, channelselected.dataset.id, inputid.value, selectupdatemode.value);
                                        FeedManager.setCategoryShowInTile(providerselected.dataset.id, channelselected.dataset.id, inputid.value, inputshowintilewinctrl.checked);
                                        var providerobj = FeedManager.getCategory(providerselected.dataset.id, channelselected.dataset.id, inputid.value);
                                        var node = createItem(providerobj.id, providerobj.displayName, ItemType.category);
                                        node.dataset.updatemode = providerobj.updateStrategy;
                                        node.dataset.showintile = providerobj.showInTile;
                                        categorylistnode.replaceChild(node, selectednode);
                                        node.addEventListener("click", categoryClickEvent);
                                        WinJS.UI.Animation.createAddToListAnimation(node, categorylistnode).execute();
                                        FeedManager.save().done(function () {
                                            node.click();
                                        });
                                    } catch (e) {
                                        var msg = new Windows.UI.Popups.MessageDialog(
                                               e.message || e || "",
                                               WinJS.Resources.getString("/resources/FeedManager.Error").value
                                           );
                                        msg.showAsync().done(function (result) {
                                            msgboxfunc();
                                        });
                                    }
                                }
                            });
                        };
                        msgboxfunc();
                    });
                    ctrlbtn.del.addEventListener("click", function (e) {
                        var providerselected = providerlistnode.querySelector(".selected");
                        if (!providerselected) return;
                        var channelselected = channellistnode.querySelector(".selected");
                        if (!channelselected) return;
                        var selectednode = categorylistnode.querySelector(".selected");
                        if (!selectednode) return;
                        var parentnode = selectednode.parentNode;
                        var text = rcString("FeedManager.Delete.Title").replace("{0}", selectednode.textContent);
                        var msgboxfunc = function () {
                            MsgBox.Async(
                                null,
                                text,
                                MsgBox.Const.MBFLAGS.MB_OKCANCEL
                            ).done(function (result) {
                                if (MsgBox.Const.MBRET.IDOK === result) {
                                    try {
                                        FeedManager.removeCategory(providerselected.dataset.id, channelselected.dataset.id, selectednode.dataset.id);
                                        selectednode.removeNode(true);
                                        FeedManager.save().done(function () {
                                            var firstnode = parentnode.querySelector(".item");
                                            if (firstnode) firstnode.click();
                                        });
                                    } catch (e) {
                                        var msg = new Windows.UI.Popups.MessageDialog(
                                               e.message || e || "",
                                               WinJS.Resources.getString("/resources/FeedManager.Error").value
                                           );
                                        msg.showAsync().done(function (result) {
                                            msgboxfunc();
                                        });
                                    }
                                }
                            });
                        };
                        msgboxfunc();
                    });
                    ctrlbtn.moveup.addEventListener("click", function (e) {
                        var providerselected = providerlistnode.querySelector(".selected");
                        if (!providerselected) return;
                        var channelselected = channellistnode.querySelector(".selected");
                        if (!channelselected) return;
                        var selectednode = categorylistnode.querySelector(".selected");
                        if (!selectednode) return;
                        FeedManager.moveCategoryUp(providerselected.dataset.id, channelselected.dataset.id, selectednode.dataset.id);
                        FeedManager.save();
                        moveUp(selectednode);
                    });
                    ctrlbtn.movedown.addEventListener("click", function (e) {
                        var providerselected = providerlistnode.querySelector(".selected");
                        if (!providerselected) return;
                        var channelselected = channellistnode.querySelector(".selected");
                        if (!channelselected) return;
                        var selectednode = categorylistnode.querySelector(".selected");
                        if (!selectednode) return;
                        FeedManager.moveCategoryDown(providerselected.dataset.id, channelselected.dataset.id, selectednode.dataset.id);
                        FeedManager.save();
                        moveDown(selectednode);
                    });
                    var supdatem = document.getElementById("category-updatemode");
                    supdatem.addEventListener("change", function (e) {
                        console.log(e);
                    });
                } break;
                case ItemType.source: {
                    function getSourcePanel() {
                        var panel = getTemplate("source_create_edit");
                        var inputurl = panel.querySelector("#url-input");
                        var testbtn = panel.querySelector("#test-command");
                        var inputregex = {
                            src: panel.querySelector("#image-src-input"),
                            rep: {
                                medium: panel.querySelector("#image-rep-medium-input"),
                                wide: panel.querySelector("#image-rep-wide-input"),
                                large: panel.querySelector("#image-rep-large-input"),
                            }
                        };
                        var resultregex = {
                            src: panel.querySelector("#url-src"),
                            url: {
                                medium: panel.querySelector("#rep-medium"),
                                wide: panel.querySelector("#rep-wide"),
                                large: panel.querySelector("#rep-large"),
                            },
                            img: {
                                medium: panel.querySelector("#rep-medium").parentNode.querySelector("img"),
                                wide: panel.querySelector("#rep-wide").parentNode.querySelector("img"),
                                large: panel.querySelector("#rep-large").parentNode.querySelector("img"),
                            }
                        };
                        var inputsrc = panel.querySelector("#image-src-input");
                        var outputstatus = panel.querySelector("#status-result");
                        testbtn.addEventListener("click", function (e) {
                            this.disabled = true;
                            inputregex.src.disabled = true;
                            inputregex.rep.wide.disabled = true;
                            inputregex.rep.medium.disabled = true;
                            inputregex.rep.large.disabled = true;
                            var testbutton = this;
                            function restone() {
                                testbutton.disabled = false;
                                inputregex.src.disabled = false;
                                inputregex.rep.wide.disabled = false;
                                inputregex.rep.medium.disabled = false;
                                inputregex.rep.large.disabled = false;
                            }
                            try {
                                Feed.get(inputurl.value).done(function (complete) {
                                    var result = complete;
                                    if (result && result.isok && result.result) {
                                        var articles = result.result.articles;
                                        var imgurl = "";
                                        for (var i = 0; i < articles.length; i++) {
                                            var article = articles[i];
                                            imgurl = article.getFirstPic();
                                            if (!NString.empty(imgurl)) break;
                                        }
                                        if (NString.empty(imgurl)) {
                                            outputstatus.textContent = "Error: cannot get the image url from articles";
                                            return;
                                        }
                                        var regexp = {
                                            src: new RegExp(inputregex.src.value),
                                            medium: (inputregex.rep.medium.value) || "",
                                            wide: (inputregex.rep.wide.value) || "",
                                            large: (inputregex.rep.large.value) || "",
                                        };
                                        resultregex.src.textContent = imgurl;
                                        var mapkey = ["medium", "wide", "large"];
                                        for (var i = 0; i < mapkey.length; i++) {
                                            var key = mapkey[i];
                                            var reped = imgurl.replace(regexp.src, regexp[key]);
                                            resultregex.url[key].textContent = resultregex.img[key].src = reped;
                                        }
                                        outputstatus.textContent = "Succeeded!";
                                    } else {
                                        outputstatus.textContent = "Error code: " + result.status + ", Reason: " + result.error;
                                    }
                                    restone();
                                }, function (error) {
                                    outputstatus.textContent = error.message || error || "Unknown Error";
                                    restone();
                                });
                            } catch (e) {
                                outputstatus.textContent = e.message || e || "Unknown Error";
                                restone();
                            }
                        });
                        return panel;
                    }
                    sourcelistnode = list;
                    ctrlbtn.add.addEventListener("click", function (e) {
                        var providerselected = providerlistnode.querySelector(".selected");
                        var channelselected = channellistnode.querySelector(".selected");
                        var categoryselected = categorylistnode.querySelector(".selected");
                        var selectednode = sourcelistnode.querySelector(".selected");
                        if (!(providerselected && channelselected && categoryselected && selectednode)) return;
                        var panel = getSourcePanel();
                        panel.style.display = "";
                        panel.style.whiteSpace = "normal";
                        panel.querySelector("#description").textContent = rcString("FeedManager.Source.Add");
                        var title = rcString("FeedManager.Add.Title");
                        title = title.replace("{0}", rcString("FeedManager.Category.Title"));
                        var msgboxfunc = function () {
                            MsgBox.Async(
                                panel,
                                title,
                                MsgBox.Const.MBFLAGS.MB_OKCANCEL
                            ).done(function (result) {
                                if (MsgBox.Const.MBRET.IDOK === result) {
                                    try {
                                        var inputid = panel.querySelector("#id-input");
                                        var inputdisplay = panel.querySelector("#display-name-input");
                                        var selectupdatemode = panel.querySelector("#update-mode-input");
                                        var showintile = panel.querySelector("#show-in-tile-input").winControl;
                                        FeedManager.addCategory(providerselected.dataset.id, channelselected.dataset.id, inputid.value, inputdisplay.value, selectupdatemode.value, showintile.checked);
                                        var providerobj = FeedManager.getCategory(providerselected.dataset.id, channelselected.dataset.id, inputid.value);
                                        var node = createItem(providerobj.id, providerobj.displayName, ItemType.category);
                                        node.dataset.updatemode = providerobj.updateStrategy;
                                        node.dataset.showintile = providerobj.showInTile;
                                        categorylistnode.appendChild(node);
                                        node.addEventListener("click", categoryClickEvent);
                                        WinJS.UI.Animation.createAddToListAnimation(node, categorylistnode).execute();
                                        FeedManager.save().done(function () {
                                            node.click();
                                        });
                                    } catch (e) {
                                        var msg = new Windows.UI.Popups.MessageDialog(
                                               e.message || e || "",
                                               WinJS.Resources.getString("/resources/FeedManager.Error").value
                                           );
                                        msg.showAsync().done(function (result) {
                                            msgboxfunc();
                                        });
                                    }
                                }
                            });
                        };
                        msgboxfunc();
                    });
                } break;
            }
        }

    }
    function initMgrList() {
        FeedManager.load().then(function () {
            var container = document.getElementById("feedmgr-html-blockcontainer");
            var blocks = container.querySelectorAll(".manager-block");
            var providerlistnode = null;
            var channellistnode = null;
            var categorylistnode = null;
            var sourcelistnode = null;
            sourceClickEvent = function (e) {
                if (this.classList.contains("selected")) {
                    return;
                } else {
                    var nodes = this.parentNode.querySelectorAll(".item");
                    for (var k = 0; k < nodes.length; k++) {
                        nodes[k].classList.remove("selected");
                    }
                    this.classList.add("selected");
                    var inputtext = (function () {
                        var strs = ["medium", "wide", "large"];
                        var obj = {};
                        obj["src"] = document.getElementById("source-irr-src");
                        for (var i = 0; i < strs.length; i++) {
                            var strl = strs[i];
                            obj[strl] = document.getElementById("source-irr-" + strl + "-rep")
                        }
                        return obj;
                    })();
                    var selectdisplay = this.parentNode.parentNode.querySelector("p > span");
                    selectdisplay.textContent = this.textContent;
                    var rules = [];
                    try {
                        rules = JSON.parse(node.dataset.imageRule) || [];
                    } catch (e) { }
                    if (rules && rules.length) {
                        inputtext.src = rules[0].pattern;
                        inputtext.medium = rules[0].replaceMedium;
                        inputtext.wide = rules[0].replaceWide;
                        inputtext.large = rules[0].replaceLarge;
                    }
                }
            };
            categoryClickEvent = function (e) {
                if (this.classList.contains("selected")) {
                    return;
                } else {
                    var nodes = this.parentNode.querySelectorAll(".item");
                    for (var k = 0; k < nodes.length; k++) {
                        nodes[k].classList.remove("selected");
                    }
                    this.classList.add("selected");
                    var updatemodenode = document.getElementById("category-updatemode");
                    var showintilenode = document.getElementById("category-showintile");
                    updatemodenode.value = this.dataset.updatemode;
                    var winctrlsitn = showintilenode.winControl;
                    winctrlsitn.checked = NString.equals(this.dataset.showintile, "true");
                    var selectdisplay = this.parentNode.parentNode.querySelector("p > span");
                    selectdisplay.textContent = this.textContent;
                    initSourceList(providerlistnode.querySelector(".item.selected").dataset.id, channellistnode.querySelector(".item.selected").dataset.id, this.dataset.id);
                }
            };
            channelClickEvent = function (e) {
                if (this.classList.contains("selected")) {
                    return;
                } else {
                    var nodes = this.parentNode.querySelectorAll(".item");
                    for (var k = 0; k < nodes.length; k++) {
                        nodes[k].classList.remove("selected");
                    }
                    this.classList.add("selected");
                    var selectdisplay = this.parentNode.parentNode.querySelector("p > span");
                    selectdisplay.textContent = this.textContent;
                    initCategoryList(providerlistnode.querySelector(".item.selected").dataset.id, this.dataset.id);
                }
            };
            providerClickEvent = function (e) {
                if (this.classList.contains("selected")) {
                    return;
                } else {
                    var nodes = this.parentNode.querySelectorAll(".item");
                    for (var k = 0; k < nodes.length; k++) {
                        nodes[k].classList.remove("selected");
                    }
                    this.classList.add("selected");
                    var selectdisplay = this.parentNode.parentNode.querySelector("p > span");
                    selectdisplay.textContent = this.textContent;
                    initChannelList(this.dataset.id);
                }
            };
            function initSourceList(swProviderId, swChannelId, swCategoryId) {
                sourcelistnode.innerHTML = "";
                var sourceobj = FeedManager.getCategory(swProviderId, swChannelId, swCategoryId);
                var sourcelist = sourceobj ? sourceobj.sources : [];
                for (var i = 0; sourcelist && i < sourcelist.length; i++) {
                    var s = sourcelist[i];
                    var node = createItem(s.url, s.url, ItemType.source);
                    node.dataset.url = s.url;
                    node.dataset.imageRule = JSON.stringify(s.imageRule);
                    WinJS.UI.Animation.createAddToListAnimation(node, sourcelistnode).execute();
                    sourcelistnode.appendChild(node);
                    node.addEventListener("click", sourceClickEvent);
                }
                var selectednode = sourcelistnode.querySelector(".selected");
                if (!selectednode) {
                    var firstnode = sourcelistnode.querySelector(".item");
                    if (firstnode) setTimeout(function (node) {
                        node.click();
                    }, 0, firstnode);
                }
            }
            function initCategoryList(swProviderId, swChannelId) {
                categorylistnode.innerHTML = "";
                var channelobj = FeedManager.getChannel(swProviderId, swChannelId);
                var categorylist = channelobj ? channelobj.categories : [];
                for (var i = 0; categorylist && i < categorylist.length; i++) {
                    var c = categorylist[i];
                    var node = createItem(c.id, c.displayName, ItemType.category);
                    node.dataset.updatemode = c.updateStrategy;
                    node.dataset.showintile = c.showInTile; 
                    WinJS.UI.Animation.createAddToListAnimation(node, categorylistnode).execute();
                    categorylistnode.appendChild(node);
                    node.addEventListener("click", categoryClickEvent);
                }
                var selectednode = categorylistnode.querySelector(".selected");
                if (!selectednode) {
                    var firstnode = categorylistnode.querySelector(".item");
                    if (firstnode) setTimeout(function (node) {
                        node.click();
                    }, 0, firstnode);
                }
            }
            function initChannelList(swProviderId) {
                channellistnode.innerHTML = "";
                var channellist = FeedManager.getProvider(swProviderId).channels || [];
                for (var i = 0; channellist && i < channellist.length; i++) {
                    var c = channellist[i];
                    var node = createItem(c.id, c.displayName, ItemType.channel);
                    WinJS.UI.Animation.createAddToListAnimation(node, channellistnode).execute();
                    channellistnode.appendChild(node);
                    node.addEventListener("click", channelClickEvent);
                }
                var selectednode = channellistnode.querySelector(".selected");
                if (!selectednode) {
                    var firstnode = channellistnode.querySelector(".item");
                    if (firstnode) setTimeout(function (node) {
                        node.click();
                    }, 0, firstnode);
                }
            }
            for (var i = 0; i < blocks.length; i++) {
                var block = blocks[i];
                var list = block.querySelector(".manager-list");
                switch (block.dataset.type) {
                    case ItemType.provider: {
                        providerlistnode = list;
                    } break;
                    case ItemType.channel: {
                        channellistnode = list;
                    } break;
                    case ItemType.category: {
                        categorylistnode = list;
                    } break;
                    case ItemType.source: {
                        sourcelistnode = list;
                    } break;
                }
            }
            for (var i = 0; i < blocks.length; i++) {
                var block = blocks[i];
                var list = block.querySelector(".manager-list");
                list.innerHTML = "";
                switch (block.dataset.type) {
                    case ItemType.provider: {
                        var providerlist = FeedManager.datas().providers || null;
                        for (var j = 0; providerlist && j < providerlist.length; j++) {
                            var p = providerlist[j];
                            var node = createItem(p.id, p.displayName, ItemType.provider);
                            WinJS.UI.Animation.createAddToListAnimation(node, list).execute();
                            list.appendChild(node);
                            node.addEventListener("click", providerClickEvent);
                        }
                        var selectednode = list.querySelector(".selected");
                        if (!selectednode) {
                            var firstnode = list.querySelector(".item");
                            if (firstnode) setTimeout(function (node) {
                                firstnode.click();
                            }, 0, firstnode);
                        }
                    } break;
                    case ItemType.channel: {
                        channellistnode = list;
                    } break;
                    case ItemType.category: {
                        categorylistnode = list;
                    } break;
                    case ItemType.source: {
                        sourcelistnode = list;
                    } break;
                }
            }
        });
    }
    WinJS.UI.Pages.define("/pages/feedmgr/feedmgr.html", {
        // 每当用户导航至该页面时都要调用此函数。它
        // 使用应用程序的数据填充页面元素。
        ready: function (element, options) {
            WinJS.UI.processAll().then(function () {
                return WinJS.Resources.processAll();
            }).done(function () {
                initMgrControls();
                initMgrList();

            });
            // TODO: 在此处初始化页面。
        },

        unload: function () {
            // TODO: 响应导航到其他页。
        },

        updateLayout: function (element) {
            /// <param name="element" domElement="true" />

            // TODO: 响应布局的更改。
        }
    });
})();
