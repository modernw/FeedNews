(function () {
    var NString = {};
    (function () {
        if (window.NString) { return; }
        /**
         * 删除首尾空白字符
         * @param {string} swString 输入字符串
         * @returns {string} 去除首尾空白的结果
         */
        function stringTrim(swString) {
            if (!swString) return "";
            var iStart = 0, iEnd = swString.length - 1;
            while (iStart <= iEnd && isWhiteSpace(swString.charAt(iStart))) {
                iStart++;
            }
            while (iEnd >= iStart && isWhiteSpace(swString.charAt(iEnd))) {
                iEnd--;
            }
            return swString.substring(iStart, iEnd + 1);
        }
        function isWhiteSpace(ch) {
            return (ch === " " || ch === "\t" || ch === "\n" || ch === "\r");
        }
        /**
         * 转为大写
         */
        function stringToUpper(swString) {
            if (!swString) return "";
            return swString.replace(/[a-z]/g, function (match) {
                return String.fromCharCode(match.charCodeAt(0) & ~32);
            });
        }
        /**
         * 转为小写
         */
        function stringToLower(swString) {
            if (!swString) return "";
            return swString.replace(/[A-Z]/g, function (match) {
                return String.fromCharCode(match.charCodeAt(0) | 32);
            });
        }
        /**
         * 比较两个字符串（忽略大小写和首尾空白）
         * @returns {number} 0 相等，<0 swStr1 < swStr2，>0 swStr1 > swStr2
         */
        function nStringCompare(swStr1, swStr2) {
            if (!swStr1) swStr1 = "";
            if (!swStr2) swStr2 = "";
            var i1 = 0, i2 = 0;
            var len1 = swStr1.length, len2 = swStr2.length;
            while (i1 < len1 && isWhiteSpace(swStr1.charAt(i1))) i1++;
            while (i2 < len2 && isWhiteSpace(swStr2.charAt(i2))) i2++;
            while (i1 < len1 && i2 < len2) {
                var c1 = swStr1.charAt(i1);
                var c2 = swStr2.charAt(i2);
                if (isWhiteSpace(c1) && i1 >= len1 - 1) break;
                if (isWhiteSpace(c2) && i2 >= len2 - 1) break;
                var u1 = c1.toLowerCase();
                var u2 = c2.toLowerCase();
                if (u1 < u2) return -1;
                if (u1 > u2) return 1;
                i1++;
                i2++;
            }
            while (i1 < len1 && isWhiteSpace(swStr1.charAt(i1))) i1++;
            while (i2 < len2 && isWhiteSpace(swStr2.charAt(i2))) i2++;
            if (i1 >= len1 && i2 >= len2) return 0;
            return (i1 >= len1) ? -1 : 1;
        }
        /**
         * 判断两个字符串是否相等（忽略大小写和首尾空白）
         */
        function nStringEquals(swStr1, swStr2) {
            return nStringCompare(swStr1, swStr2) === 0;
        }
        function nStringEmpty(swString) {
            if (!swString) { return true; }
            return nStringEquals(swString, "");
        }
        /**
         * 查找子串（不使用 includes/indexOf），返回位置，未找到返回 -1
         * @param {string} swString 原始字符串
         * @param {string} swSub 要查找的子串
         * @returns {number} 位置索引，未找到返回 -1
         */
        function nStringFind(swString, swSub) {
            if (!swString || !swSub) { return -1; }
            var len1 = swString.length;
            var len2 = swSub.length;
            if (len2 > len1) { return -1; }
            for (var i = 0; i <= len1 - len2; i++) {
                var match = true;
                for (var j = 0; j < len2; j++) {
                    if (swString.charAt(i + j) !== swSub.charAt(j)) {
                        match = false;
                        break;
                    }
                }
                if (match) { return i; }
            }
            return -1;
        }
        extern({
            trim: stringTrim,
            toupper: stringToUpper,
            tolower: stringToLower,
            compare: nStringCompare,
            equals: nStringEquals,
            empty: nStringEmpty,
            normalize: function (swString) { return NString.tolower(NString.trim(swString)); },
            find: nStringFind
        }, NString);
        extern({ NString: NString });
    })();
    var blankImageRootDir = "ms-appx:///images/blank";
    function getBlankImageUri(uWidth, uHeight) {
        if (uWidth === uHeight || (parseInt(uWidth) > 0 && (uHeight == undefined))) {
            return blankImageRootDir + "/imagePlacehold" + uWidth + ".png";
        } else {
            return blankImageRootDir + "/imagePlacehold" + uWidth + "x" + uHeight + ".png";
        }
    }
    var TILE_TEMPLATE_LIST = {
        "TileSquareBlock": {
            texts: ["Text Field 1 (block text)", "Text Field 2"],
            version: 1,
        },
        "TileSquare150x150Block": {
            fallback: "TileSquareBlock",
            texts: ["Text Field 1 (block text)", "Text Field 2"],
            version: 2,
        },
        "TileSquareText01": {
            texts: ["Text Field 1 (larger text)", "Text Field 2", "Text Field 3", "Text Field 4"],
            version: 1,
        },
        "TileSquare150x150Text01": {
            fallback: "TileSquareText01",
            texts: ["Text Field 1 (larger text)", "Text Field 2", "Text Field 3", "Text Field 4"],
            version: 2,
        },
        "TileSquareText02": {
            texts: ["Text Field 1 (larger text)", "Text Field 2"],
            version: 1,
        },
        "TileSquare150x150Text02": {
            fallback: "TileSquareText02",
            texts: ["Text Field 1 (larger text)", "Text Field 2"],
            version: 2,
        },
        "TileSquareText03": {
            texts: ["Text Field 1", "Text Field 2", "Text Field 3", "Text Field 4"],
            version: 1,
        },
        "TileSquare150x150Text03": {
            fallback: "TileSquareText03",
            texts: ["Text Field 1", "Text Field 2", "Text Field 3", "Text Field 4"],
            version: 2,
        },
        "TileSquareText04": {
            texts: ["Text Field 1"],
            version: 1,
        },
        "TileSquare150x150Text04": {
            fallback: "TileSquareText04",
            texts: ["Text Field 1"],
            version: 2,
        },
        "TileSquareImage": {
            images: [getBlankImageUri(150, 150)],
            alts: ["Tile Image Square 150 * 150"],
            version: 1,
        },
        "TileSquare150x150Image": {
            fallback: "TileSquareImage",
            images: [getBlankImageUri(150, 150)],
            alts: ["Tile Image Square 150 * 150"],
            version: 2,
        },
        "TileSquarePeekImageAndText01": {
            images: [getBlankImageUri(150, 150)],
            alts: ["Tile Image Square 150 * 150"],
            texts: ["Text Field 1 (larger text)", "Text Field 2", "Text Field 3", "Text Field 4"],
            version: 1,
        },
        "TileSquare150x150PeekImageAndText01": {
            fallback: "TileSquarePeekImageAndText01",
            images: [getBlankImageUri(150, 150)],
            alts: ["Tile Image Square 150 * 150"],
            texts: ["Text Field 1 (larger text)", "Text Field 2", "Text Field 3", "Text Field 4"],
            version: 2,
        },
        "TileSquarePeekImageAndText02": {
            images: [getBlankImageUri(150, 150)],
            alts: ["Tile Image Square 150 * 150"],
            texts: ["Text Field 1 (larger text)", "Text Field 2"],
            version: 1,
        },
        "TileSquare150x150PeekImageAndText02": {
            fallback: "TileSquarePeekImageAndText02",
            images: [getBlankImageUri(150, 150)],
            alts: ["Tile Image Square 150 * 150"],
        },
        "TileSquarePeekImageAndText03": {
            images: [getBlankImageUri(150, 150)],
            alts: ["Tile Image Square 150 * 150"],
            texts: ["Text Field 1", "Text Field 2", "Text Field 3", "Text Field 4"],
            version: 1,
        },
        "TileSquare150x150PeekImageAndText03": {
            fallback: "TileSquarePeekImageAndText03",
            images: [getBlankImageUri(150, 150)],
            alts: ["Tile Image Square 150 * 150"],
            texts: ["Text Field 1", "Text Field 2", "Text Field 3", "Text Field 4"],
            version: 2,
        },
        "TileSquarePeekImageAndText04": {
            images: [getBlankImageUri(150, 150)],
            alts: ["Tile Image Square 150 * 150"],
            texts: ["Text Field 1"],
            version: 1,
        },
        "TileSquare150x150PeekImageAndText04": {
            fallback: "TileSquarePeekImageAndText04",
            images: [getBlankImageUri(150, 150)],
            alts: ["Tile Image Square 150 * 150"],
            texts: ["Text Field 1"],
            version: 2,
        },
        "TileWideText01": {
            texts: ["Text Field 1 (larger text)", "Text Field 2", "Text Field 3", "Text Field 4", "Text Field 5"],
            version: 1,
        },
        "TileWide310x150Text01": {
            fallback: "TileWideText01",
            texts: ["Text Field 1 (larger text)", "Text Field 2", "Text Field 3", "Text Field 4", "Text Field 5"],
            version: 2,
        },
        "TileWideText02": {
            texts: [
                "Text Field 1 (larger text)",
                "Text Field 2, row 1, column 1",
                "Text Field 3, row 1, column 2",
                "Text Field 4, row 1, column 3",
                "Text Field 4, row 2, column 1",
                "Text Field 5, row 2, column 2",
                "Text Field 6, row 2, column 3",
                "Text Field 7, row 3, column 1",
                "Text Field 8, row 3, column 2",
                "Text Field 9, row 3, column 3",
            ],
            version: 1,
        },
        "TileWide310x150Text02": {
            fallback: "TileWideText02",
            texts: [
                "Text Field 1 (larger text)",
                "Text Field 2, row 1, column 1",
                "Text Field 3, row 1, column 2",
                "Text Field 4, row 1, column 3",
                "Text Field 4, row 2, column 1",
                "Text Field 5, row 2, column 2",
                "Text Field 6, row 2, column 3",
                "Text Field 7, row 3, column 1",
                "Text Field 8, row 3, column 2",
                "Text Field 9, row 3, column 3",
            ],
            version: 2,
        },
        "TileWideText03": {
            texts: ["Text Field 1"],
            version: 1,
        },
        "TileWide310x150Text03": {
            fallback: "TileWideText03",
            texts: ["Text Field 1"],
            version: 2,
        },
        "TileWideText04": {
            texts: ["Text Field 1"],
            version: 1,
        },
        "TileWide310x150Text04": {
            fallback: "TileWideText04",
            texts: ["Text Field 1"],
            version: 2,
        },
        "TileWideText05": {
            texts: [
                "Text Field 1",
                "Text Field 2",
                "Text Field 3",
                "Text Field 4",
                "Text Field 5"
            ],
            version: 1,
        },
        "TileWide310x150Text05": {
            fallback: "TileWideText05",
            texts: [
                "Text Field 1",
                "Text Field 2",
                "Text Field 3",
                "Text Field 4",
                "Text Field 5"
            ],
            version: 2,
        },
        "TileWideText06": {
            texts: [
                "Text Field 1, row 1, column 1",
                "Text Field 2, row 1, column 2",
                "Text Field 3, row 2, column 1",
                "Text Field 4, row 2, column 2",
                "Text Field 5, row 3, column 1",
                "Text Field 6, row 3, column 2",
                "Text Field 7, row 4, column 1",
                "Text Field 8, row 4, column 2",
                "Text Field 9, row 5, column 1",
                "Text Field 10, row 5, column 2",
            ],
            version: 1,
        },
        "TileWide310x150Text06": {
            fallback: "TileWideText06",
            texts: [
                "Text Field 1, row 1, column 1",
                "Text Field 2, row 1, column 2",
                "Text Field 3, row 2, column 1",
                "Text Field 4, row 2, column 2",
                "Text Field 5, row 3, column 1",
                "Text Field 6, row 3, column 2",
                "Text Field 7, row 4, column 1",
                "Text Field 8, row 4, column 2",
                "Text Field 9, row 5, column 1",
                "Text Field 10, row 5, column 2",
            ],
            version: 2,
        },
        "TileWideText07": {
            texts: [
                "Text Field 1 (larger text)",
                "Text Field 2, row 1, column 1",
                "Text Field 3, row 1, column 2",
                "Text Field 4, row 2, column 1",
                "Text Field 5, row 2, column 2",
                "Text Field 6, row 3, column 1",
                "Text Field 7, row 3, column 2",
                "Text Field 8, row 4, column 1",
                "Text Field 9, row 4, column 2"
            ],
            version: 1
        },
        "TileWide310x150Text07": {
            fallback: "TileWideText07",
            texts: [
                "Text Field 1 (larger text)",
                "Text Field 2, row 1, column 1",
                "Text Field 3, row 1, column 2",
                "Text Field 4, row 2, column 1",
                "Text Field 5, row 2, column 2",
                "Text Field 6, row 3, column 1",
                "Text Field 7, row 3, column 2",
                "Text Field 8, row 4, column 1",
                "Text Field 9, row 4, column 2"
            ],
            version: 2
        },
        "TileWideText07": {
            texts: [
                "Text Field 1 (larger text)",
                "Text Field 2, row 1, column 1",
                "Text Field 3, row 1, column 2",
                "Text Field 4, row 2, column 1",
                "Text Field 5, row 2, column 2",
                "Text Field 6, row 3, column 1",
                "Text Field 7, row 3, column 2",
                "Text Field 8, row 4, column 1",
                "Text Field 9, row 4, column 2"
            ],
            version: 1
        },
        "TileWide310x150Text07": {
            fallback: "TileWideText07",
            texts: [
                "Text Field 1 (larger text)",
                "Text Field 2, row 1, column 1",
                "Text Field 3, row 1, column 2",
                "Text Field 4, row 2, column 1",
                "Text Field 5, row 2, column 2",
                "Text Field 6, row 3, column 1",
                "Text Field 7, row 3, column 2",
                "Text Field 8, row 4, column 1",
                "Text Field 9, row 4, column 2"
            ],
            version: 2
        },
        "TileWideText08": {
            texts: [
                "Text Field 1, row 1, column 1",
                "Text Field 2, row 1, column 2",
                "Text Field 3, row 2, column 1",
                "Text Field 4, row 2, column 2",
                "Text Field 5, row 3, column 1",
                "Text Field 6, row 3, column 2",
                "Text Field 7, row 4, column 1",
                "Text Field 8, row 4, column 2",
                "Text Field 9, row 5, column 1",
                "Text Field 10, row 5, column 2"
            ],
            version: 1
        },
        "TileWide310x150Text08": {
            fallback: "TileWideText08",
            texts: [
                "Text Field 1, row 1, column 1",
                "Text Field 2, row 1, column 2",
                "Text Field 3, row 2, column 1",
                "Text Field 4, row 2, column 2",
                "Text Field 5, row 3, column 1",
                "Text Field 6, row 3, column 2",
                "Text Field 7, row 4, column 1",
                "Text Field 8, row 4, column 2",
                "Text Field 9, row 5, column 1",
                "Text Field 10, row 5, column 2"
            ],
            version: 2
        },
        "TileWideText09": {
            texts: [
                "Text Field 1 (larger text)",
                "Text Field 2"
            ],
            version: 1
        },
        "TileWide310x150Text09": {
            fallback: "TileWideText09",
            texts: [
                "Text Field 1 (larger text)",
                "Text Field 2"
            ],
            version: 2
        },
        "TileWideText10": {
            version: 1,
            texts: [
                "Text Field 1 (larger text)",
                "Text Field 2, row 1, column 1",
                "Text Field 3, row 1, column 2",
                "Text Field 4, row 2, column 1",
                "Text Field 5, row 2, column 2",
                "Text Field 6, row 3, column 1",
                "Text Field 7, row 3, column 2",
                "Text Field 8, row 4, column 1",
                "Text Field 9, row 4, column 2"
            ]
        },
        "TileWide310x150Text10": {
            version: 2,
            fallback: "TileWideText10",
            texts: [
                "Text Field 1 (larger text)",
                "Text Field 2, row 1, column 1",
                "Text Field 3, row 1, column 2",
                "Text Field 4, row 2, column 1",
                "Text Field 5, row 2, column 2",
                "Text Field 6, row 3, column 1",
                "Text Field 7, row 3, column 2",
                "Text Field 8, row 4, column 1",
                "Text Field 9, row 4, column 2"
            ]
        },
        "TileWideBlockAndText01": {
            version: 1,
            texts: [
                "Text Field 1",
                "Text Field 2",
                "Text Field 3",
                "Text Field 4",
                "Text Field 5 (block text)",
                "Text Field 6 (under block text)"
            ]
        },
        "TileWide310x150BlockAndText01": {
            version: 2,
            fallback: "TileWideBlockAndText01",
            texts: [
                "Text Field 1",
                "Text Field 2",
                "Text Field 3",
                "Text Field 4",
                "Text Field 5 (block text)",
                "Text Field 6 (under block text)"
            ]
        },
        "TileWideBlockAndText02": {
            version: 1,
            texts: [
                "Text Field 1",
                "Text Field 2 (block text)",
                "Text Field 3 (under block text)"
            ]
        },
        "TileWide310x150BlockAndText02": {
            version: 2,
            fallback: "TileWideBlockAndText02",
            texts: [
                "Text Field 1",
                "Text Field 2 (block text)",
                "Text Field 3 (under block text)"
            ]
        },
        "TileWideImage": {
            images: [getBlankImageUri(310, 150)],
            alts: ["Tile Image Square 310 * 150"],
            version: 1
        },
        "TileWide310x150Image": {
            fallback: "TileWideImage",
            images: [getBlankImageUri(310, 150)],
            alts: ["Tile Image Square 310 * 150"],
            version: 2
        },
        "TileWideImageCollection": {
            images: [
                getBlankImageUri(160, 150),
                getBlankImageUri(75, 75),
                getBlankImageUri(75, 75),
                getBlankImageUri(75, 75),
                getBlankImageUri(75, 75)
            ],
            alts: [
                "larger image",
                "small image, row 1, column 1",
                "small image, row 1, column 2",
                "small image, row 2, column 1",
                "small image, row 2, column 2"
            ],
            version: 1
        },
        "TileWide310x150ImageCollection": {
            fallback: "TileWideImageCollection",
            images: [
                getBlankImageUri(160, 150),
                getBlankImageUri(75, 75),
                getBlankImageUri(75, 75),
                getBlankImageUri(75, 75),
                getBlankImageUri(75, 75)
            ],
            alts: [
                "larger image",
                "small image, row 1, column 1",
                "small image, row 1, column 2",
                "small image, row 2, column 1",
                "small image, row 2, column 2"
            ],
            version: 2
        },
        "TileWideImageAndText01": {
            images: [getBlankImageUri(310, 100)],
            alts: ["alt text"],
            texts: ["Text Field 1"],
            version: 1
        },
        "TileWide310x150ImageAndText01": {
            fallback: "TileWideImageAndText01",
            images: [getBlankImageUri(310, 100)],
            alts: ["alt text"],
            texts: ["Text Field 1"],
            version: 2
        },
        "TileWideImageAndText02": {
            images: [getBlankImageUri(310, 100)],
            alts: ["alt text"],
            texts: ["Text Field 1", "Text Field 2"],
            version: 1
        },
        "TileWide310x150ImageAndText02": {
            fallback: "TileWideImageAndText02",
            images: [getBlankImageUri(310, 100)],
            alts: ["alt text"],
            texts: ["Text Field 1", "Text Field 2"],
            version: 2
        },
        "TileWideSmallImageAndText01": {
            images: [getBlankImageUri(80, 80)],
            alts: ["alt text"],
            texts: ["Text Field 1"],
            version: 1
        },
        "TileWide310x150SmallImageAndText01": {
            fallback: "TileWideSmallImageAndText01",
            images: [getBlankImageUri(80, 80)],
            alts: ["alt text"],
            texts: ["Text Field 1"],
            version: 2
        },
        "TileWideSmallImageAndText02": {
            images: [getBlankImageUri(80, 80)],
            alts: ["alt text"],
            texts: [
                "Text Field 1 (larger text)",
                "Text Field 2",
                "Text Field 3",
                "Text Field 4",
                "Text Field 5"
            ],
            version: 1
        },
        "TileWide310x150SmallImageAndText02": {
            fallback: "TileWideSmallImageAndText02",
            images: [getBlankImageUri(80, 80)],
            alts: ["alt text"],
            texts: [
                "Text Field 1 (larger text)",
                "Text Field 2",
                "Text Field 3",
                "Text Field 4",
                "Text Field 5"
            ],
            version: 2
        },
        "TileWideSmallImageAndText03": {
            images: [getBlankImageUri(80, 80)],
            alts: ["alt text"],
            texts: ["Text Field 1"],
            version: 1
        },
        "TileWide310x150SmallImageAndText03": {
            fallback: "TileWideSmallImageAndText03",
            images: [getBlankImageUri(80, 80)],
            alts: ["alt text"],
            texts: ["Text Field 1"],
            version: 2
        },
        "TileWideSmallImageAndText04": {
            images: [getBlankImageUri(80, 80)],
            alts: ["alt text"],
            texts: ["Text Field 1 (larger text)", "Text Field 2"],
            version: 1
        },
        "TileWide310x150SmallImageAndText04": {
            fallback: "TileWideSmallImageAndText04",
            images: [getBlankImageUri(80, 80)],
            alts: ["alt text"],
            texts: ["Text Field 1 (larger text)", "Text Field 2"],
            version: 2
        },
        "TileWideSmallImageAndText05": {
            images: [getBlankImageUri(45, 65)],
            alts: ["alt text"],
            texts: ["Text Field 1 (larger text)", "Text Field 2"],
            version: 1
        },
        "TileWide310x150SmallImageAndText05": {
            fallback: "TileWideSmallImageAndText05",
            images: [getBlankImageUri(45, 65)],
            alts: ["alt text"],
            texts: ["Text Field 1 (larger text)", "Text Field 2"],
            version: 2
        },
        "TileWidePeekImageCollection01": {
            images: [
                getBlankImageUri(160, 150),
                getBlankImageUri(75, 75),
                getBlankImageUri(75, 75),
                getBlankImageUri(75, 75),
                getBlankImageUri(75, 75),
            ],
            alts: [
                "larger image",
                "small image, row 1, column 1",
                "small image, row 1, column 2",
                "small image, row 2, column 1",
                "small image, row 2, column 2"
            ],
            texts: [
                "Text Field 1 (larger text)",
                "Text Field 2"
            ],
            version: 1
        },
        "TileWide310x150PeekImageCollection01": {
            fallback: "TileWidePeekImageCollection01",
            images: [
                getBlankImageUri(160, 150),
                getBlankImageUri(75, 75),
                getBlankImageUri(75, 75),
                getBlankImageUri(75, 75),
                getBlankImageUri(75, 75),
            ],
            alts: [
                "larger image",
                "small image, row 1, column 1",
                "small image, row 1, column 2",
                "small image, row 2, column 1",
                "small image, row 2, column 2"
            ],
            texts: [
                "Text Field 1 (larger text)",
                "Text Field 2"
            ],
            version: 2
        },
        "TileWidePeekImageCollection02": {
            images: [
                getBlankImageUri(160, 150),
                getBlankImageUri(75, 75),
                getBlankImageUri(75, 75),
                getBlankImageUri(75, 75),
                getBlankImageUri(75, 75),
            ],
            alts: [
                "larger image",
                "small image, row 1, column 1",
                "small image, row 1, column 2",
                "small image, row 2, column 1",
                "small image, row 2, column 2"
            ],
            texts: [
                "Text Field 1 (larger text)",
                "Text Field 2",
                "Text Field 3",
                "Text Field 4",
                "Text Field 5"
            ],
            version: 1
        },
        "TileWide310x150PeekImageCollection02": {
            fallback: "TileWidePeekImageCollection02",
            images: [
                getBlankImageUri(160, 150),
                getBlankImageUri(75, 75),
                getBlankImageUri(75, 75),
                getBlankImageUri(75, 75),
                getBlankImageUri(75, 75),
            ],
            alts: [
                "larger image",
                "small image, row 1, column 1",
                "small image, row 1, column 2",
                "small image, row 2, column 1",
                "small image, row 2, column 2"
            ],
            texts: [
                "Text Field 1 (larger text)",
                "Text Field 2",
                "Text Field 3",
                "Text Field 4",
                "Text Field 5"
            ],
            version: 2
        },
        "TileWidePeekImageCollection03": {
            images: [
                getBlankImageUri(160, 150),
                getBlankImageUri(75, 75),
                getBlankImageUri(75, 75),
                getBlankImageUri(75, 75),
                getBlankImageUri(75, 75),
            ],
            alts: [
                "larger image",
                "small image, row 1, column 1",
                "small image, row 1, column 2",
                "small image, row 2, column 1",
                "small image, row 2, column 2"
            ],
            texts: [
                "Text Field 1"
            ],
            version: 1
        },
        "TileWide310x150PeekImageCollection03": {
            fallback: "TileWidePeekImageCollection03",
            images: [
                getBlankImageUri(160, 150),
                getBlankImageUri(75, 75),
                getBlankImageUri(75, 75),
                getBlankImageUri(75, 75),
                getBlankImageUri(75, 75),
            ],
            alts: [
                "larger image",
                "small image, row 1, column 1",
                "small image, row 1, column 2",
                "small image, row 2, column 1",
                "small image, row 2, column 2"
            ],
            texts: [
                "Text Field 1"
            ],
            version: 2
        },
        "TileWidePeekImageCollection04": {
            images: [
                getBlankImageUri(160, 150),
                getBlankImageUri(75, 75),
                getBlankImageUri(75, 75),
                getBlankImageUri(75, 75),
                getBlankImageUri(75, 75),
            ],
            alts: [
                "larger image",
                "small image, row 1, column 1",
                "small image, row 1, column 2",
                "small image, row 2, column 1",
                "small image, row 2, column 2"
            ],
            texts: [
                "Text Field 1"
            ],
            version: 1
        },
        "TileWide310x150PeekImageCollection04": {
            fallback: "TileWidePeekImageCollection04",
            images: [
                getBlankImageUri(160, 150),
                getBlankImageUri(75, 75),
                getBlankImageUri(75, 75),
                getBlankImageUri(75, 75),
                getBlankImageUri(75, 75),
            ],
            alts: [
                "larger image",
                "small image, row 1, column 1",
                "small image, row 1, column 2",
                "small image, row 2, column 1",
                "small image, row 2, column 2"
            ],
            texts: [
                "Text Field 1"
            ],
            version: 2
        },
        "TileWidePeekImageCollection05": {
            images: [
                getBlankImageUri(160, 150),
                getBlankImageUri(75, 75),
                getBlankImageUri(75, 75),
                getBlankImageUri(75, 75),
                getBlankImageUri(75, 75),
                getBlankImageUri(80, 80)
            ],
            alts: [
                "larger image",
                "small image, row 1, column 1",
                "small image, row 1, column 2",
                "small image, row 2, column 1",
                "small image, row 2, column 2",
                "image next to text"
            ],
            texts: [
                "Text Field 1 (larger text)",
                "Text Field 2"
            ],
            version: 1
        },
        "TileWide310x150PeekImageCollection05": {
            fallback: "TileWidePeekImageCollection05",
            images: [
                getBlankImageUri(160, 150),
                getBlankImageUri(75, 75),
                getBlankImageUri(75, 75),
                getBlankImageUri(75, 75),
                getBlankImageUri(75, 75),
                getBlankImageUri(80, 80)
            ],
            alts: [
                "larger image",
                "small image, row 1, column 1",
                "small image, row 1, column 2",
                "small image, row 2, column 1",
                "small image, row 2, column 2",
                "image next to text"
            ],
            texts: [
                "Text Field 1 (larger text)",
                "Text Field 2"
            ],
            version: 2
        },
        "TileWidePeekImageCollection06": {
            alts: [
                "larger image",
                "small image, row 1, column 1",
                "small image, row 1, column 2",
                "small image, row 2, column 1",
                "small image, row 2, column 2",
                "image next to text"
            ],
            images: [
                getBlankImageUri(160, 150),
                getBlankImageUri(75, 75),
                getBlankImageUri(75, 75),
                getBlankImageUri(75, 75),
                getBlankImageUri(75, 75),
                getBlankImageUri(80, 80)
            ],
            texts: [
                "Text Field 1"
            ],
            version: 1
        },
        "TileWide310x150PeekImageCollection06": {
            alts: [
                "larger image",
                "small image, row 1, column 1",
                "small image, row 1, column 2",
                "small image, row 2, column 1",
                "small image, row 2, column 2",
                "image next to text"
            ],
            fallback: "TileWidePeekImageCollection06",
            images: [
                getBlankImageUri(160, 150),
                getBlankImageUri(75, 75),
                getBlankImageUri(75, 75),
                getBlankImageUri(75, 75),
                getBlankImageUri(75, 75),
                getBlankImageUri(80, 80)
            ],
            texts: [
                "Text Field 1"
            ],
            version: 2
        },
        "TileWidePeekImageAndText01": {
            alts: [
                "alt text"
            ],
            images: [
                getBlankImageUri(310, 100)
            ],
            texts: [
                "Text Field 1"
            ],
            version: 1
        },
        "TileWide310x150PeekImageAndText01": {
            alts: [
                "alt text"
            ],
            fallback: "TileWidePeekImageAndText01",
            images: [
                getBlankImageUri(310, 100)
            ],
            texts: [
                "Text Field 1"
            ],
            version: 2
        },
        "TileWidePeekImageAndText02": {
            alts: [
                "alt text"
            ],
            images: [
                getBlankImageUri(310, 100)
            ],
            texts: [
                "Text Field 1",
                "Text Field 2",
                "Text Field 3",
                "Text Field 4",
                "Text Field 5"
            ],
            version: 1,
        },

        "TileWide310x150PeekImageAndText02": {
            alts: [
                "alt text"
            ],
            fallback: "TileWidePeekImageAndText02",
            images: [
                getBlankImageUri(310, 100)
            ],
            texts: [
                "Text Field 1",
                "Text Field 2",
                "Text Field 3",
                "Text Field 4",
                "Text Field 5"
            ],
            version: 2
        },
        "TileWidePeekImage01": {
            alts: [
                "alt text"
            ],
            images: [
                "image1"
            ],
            texts: [
                "Text Field 1 (larger text)",
                "Text Field 2"
            ],
            version: 1
        },
        "TileWide310x150PeekImage01": {
            alts: [
                "alt text"
            ],
            fallback: "TileWidePeekImage01",
            images: [
                getBlankImageUri(310, 150)
            ],
            texts: [
                "Text Field 1 (larger text)",
                "Text Field 2"
            ],
            version: 2
        },
        "TileWidePeekImage02": {
            alts: [
                "alt text"
            ],
            images: [
                getBlankImageUri(310, 150)
            ],
            texts: [
                "Text Field 1 (larger text)",
                "Text Field 2",
                "Text Field 3",
                "Text Field 4",
                "Text Field 5"
            ],
            version: 1
        },
        "TileWide310x150PeekImage02": {
            alts: [
                "alt text"
            ],
            fallback: "TileWidePeekImage02",
            images: [
                getBlankImageUri(310, 150)
            ],
            texts: [
                "Text Field 1 (larger text)",
                "Text Field 2",
                "Text Field 3",
                "Text Field 4",
                "Text Field 5"
            ],
            version: 2
        },
        "TileWidePeekImage03": {
            alts: [
                "alt text"
            ],
            images: [
                getBlankImageUri(310, 150)
            ],
            texts: [
                "Text Field 1"
            ],
            version: 1
        },
        "TileWide310x150PeekImage03": {
            alts: [
                "alt text"
            ],
            fallback: "TileWidePeekImage03",
            images: [
                getBlankImageUri(310, 150)
            ],
            texts: [
                "Text Field 1"
            ],
            version: 2
        },
        "TileWidePeekImage04": {
            alts: [
                "alt text"
            ],
            images: [
                getBlankImageUri(310, 150)
            ],
            texts: [
                "Text Field 1"
            ],
            version: 1
        },
        "TileWide310x150PeekImage04": {
            alts: [
                "alt text"
            ],
            fallback: "TileWidePeekImage04",
            images: [
                getBlankImageUri(310, 150)
            ],
            texts: [
                "Text Field 1"
            ],
            version: 2
        },
        "TileWidePeekImage05": {
            alts: [
                "main image",
                "smaller image next to text"
            ],
            images: [
                getBlankImageUri(310, 150),
                getBlankImageUri(80, 80),
            ],
            texts: [
                "Text Field 1 (larger text)",
                "Text Field 2"
            ],
            version: 1
        },
        "TileWide310x150PeekImage05": {
            alts: [
                "main image",
                "smaller image next to text"
            ],
            fallback: "TileWidePeekImage05",
            images: [
                getBlankImageUri(310, 150),
                getBlankImageUri(80, 80),
            ],
            texts: [
                "Text Field 1 (larger text)",
                "Text Field 2"
            ],
            version: 2
        },
        "TileWidePeekImage06": {
            alts: [
                "main image",
                "smaller image next to text"
            ],
            images: [
                getBlankImageUri(310, 150),
                getBlankImageUri(80, 80),
            ],
            texts: [
                "Text Field 1"
            ],
            version: 1
        },
        "TileWide310x150PeekImage06": {
            alts: [
                "main image",
                "smaller image next to text"
            ],
            fallback: "TileWidePeekImage06",
            images: [
                getBlankImageUri(310, 150),
                getBlankImageUri(80, 80),
            ],
            texts: [
                "Text Field 1"
            ],
            version: 2
        },
        "TileSquare310x310Text01": {
            texts: [
                "Text Field 1 (larger text)",
                "Text Field 2",
                "Text Field 3",
                "Text Field 4",
                "Text Field 5",
                "Text Field 6",
                "Text Field 7",
                "Text Field 8",
                "Text Field 9",
                "Text Field 10"
            ],
            version: 2
        },
        "TileSquare310x310Text02": {
            texts: [
                "Text Field 1 (larger text)",
                "Text Field 2, row 1, column 1",
                "Text Field 3, row 1, column 2",
                "Text Field 4, row 2, column 1",
                "Text Field 5, row 2, column 2",
                "Text Field 6, row 3, column 1",
                "Text Field 7, row 3, column 2",
                "Text Field 8, row 4, column 1",
                "Text Field 9, row 4, column 2",
                "Text Field 10, row 5, column 1",
                "Text Field 11, row 5, column 2",
                "Text Field 12, row 6, column 1",
                "Text Field 13, row 6, column 2",
                "Text Field 14, row 7, column 1",
                "Text Field 15, row 7, column 2",
                "Text Field 16, row 8, column 1",
                "Text Field 17, row 8, column 2",
                "Text Field 18, row 9, column 1",
                "Text Field 19, row 9, column 2"
            ],
            version: 2
        },
        "TileSquare310x310Text03": {
            texts: [
                "Text Field 1",
                "Text Field 2",
                "Text Field 3",
                "Text Field 4",
                "Text Field 5",
                "Text Field 6",
                "Text Field 7",
                "Text Field 8",
                "Text Field 9",
                "Text Field 10",
                "Text Field 11"
            ],
            version: 2
        },
        "TileSquare310x310Text04": {
            texts: [
                "Text Field 1, row 1, column 1",
                "Text Field 2, row 1, column 2",
                "Text Field 3, row 2, column 1",
                "Text Field 4, row 2, column 2",
                "Text Field 5, row 3, column 1",
                "Text Field 6, row 3, column 2",
                "Text Field 7, row 4, column 1",
                "Text Field 8, row 4, column 2",
                "Text Field 9, row 5, column 1",
                "Text Field 10, row 5, column 2",
                "Text Field 11, row 6, column 1",
                "Text Field 12, row 6, column 2",
                "Text Field 13, row 7, column 1",
                "Text Field 14, row 7, column 2",
                "Text Field 15, row 8, column 1",
                "Text Field 16, row 8, column 2",
                "Text Field 17, row 9, column 1",
                "Text Field 18, row 9, column 2",
                "Text Field 19, row 10, column 1",
                "Text Field 20, row 10, column 2",
                "Text Field 21, row 11, column 1",
                "Text Field 22, row 11, column 2"
            ],
            version: 2
        },
        "TileSquare310x310Text05": {
            texts: [
                "Text Field 1 (larger text)",
                "Text Field 2, row 1, column 1",
                "Text Field 3, row 1, column 2",
                "Text Field 4, row 2, column 1",
                "Text Field 5, row 2, column 2",
                "Text Field 6, row 3, column 1",
                "Text Field 7, row 3, column 2",
                "Text Field 8, row 4, column 1",
                "Text Field 9, row 4, column 2",
                "Text Field 10, row 5, column 1",
                "Text Field 11, row 5, column 2",
                "Text Field 12, row 6, column 1",
                "Text Field 13, row 6, column 2",
                "Text Field 14, row 7, column 1",
                "Text Field 15, row 7, column 2",
                "Text Field 16, row 8, column 1",
                "Text Field 17, row 8, column 2",
                "Text Field 18, row 9, column 1",
                "Text Field 19, row 9, column 2"
            ],
            version: 2
        },
        "TileSquare310x310Text06": {
            texts: [
                "Text Field 1, row 1, column 1",
                "Text Field 2, row 1, column 2",
                "Text Field 3, row 2, column 1",
                "Text Field 4, row 2, column 2",
                "Text Field 5, row 3, column 1",
                "Text Field 6, row 3, column 2",
                "Text Field 7, row 4, column 1",
                "Text Field 8, row 4, column 2",
                "Text Field 9, row 5, column 1",
                "Text Field 10, row 5, column 2",
                "Text Field 11, row 6, column 1",
                "Text Field 12, row 6, column 2",
                "Text Field 13, row 7, column 1",
                "Text Field 14, row 7, column 2",
                "Text Field 15, row 8, column 1",
                "Text Field 16, row 8, column 2",
                "Text Field 17, row 9, column 1",
                "Text Field 18, row 9, column 2",
                "Text Field 19, row 10, column 1",
                "Text Field 20, row 10, column 2",
                "Text Field 21, row 11, column 1",
                "Text Field 22, row 11, column 2"
            ],
            version: 2
        },
        "TileSquare310x310Text07": {
            texts: [
                "Text Field 1 (larger text)",
                "Text Field 2, row 1, column 1",
                "Text Field 3, row 1, column 2",
                "Text Field 4, row 2, column 1",
                "Text Field 5, row 2, column 2",
                "Text Field 6, row 3, column 1",
                "Text Field 7, row 3, column 2",
                "Text Field 8, row 4, column 1",
                "Text Field 9, row 4, column 2",
                "Text Field 10, row 5, column 1",
                "Text Field 11, row 5, column 2",
                "Text Field 12, row 6, column 1",
                "Text Field 13, row 6, column 2",
                "Text Field 14, row 7, column 1",
                "Text Field 15, row 7, column 2",
                "Text Field 16, row 8, column 1",
                "Text Field 17, row 8, column 2",
                "Text Field 18, row 9, column 1",
                "Text Field 19, row 9, column 2"
            ],
            version: 2
        },
        "TileSquare310x310Text08": {
            texts: [
                "Text Field 1, row 1, column 1",
                "Text Field 2, row 1, column 2",
                "Text Field 3, row 2, column 1",
                "Text Field 4, row 2, column 2",
                "Text Field 5, row 3, column 1",
                "Text Field 6, row 3, column 2",
                "Text Field 7, row 4, column 1",
                "Text Field 8, row 4, column 2",
                "Text Field 9, row 5, column 1",
                "Text Field 10, row 5, column 2",
                "Text Field 11, row 6, column 1",
                "Text Field 12, row 6, column 2",
                "Text Field 13, row 7, column 1",
                "Text Field 14, row 7, column 2",
                "Text Field 15, row 8, column 1",
                "Text Field 16, row 8, column 2",
                "Text Field 17, row 9, column 1",
                "Text Field 18, row 9, column 2",
                "Text Field 19, row 10, column 1",
                "Text Field 20, row 10, column 2",
                "Text Field 21, row 11, column 1",
                "Text Field 22, row 11, column 2"
            ],
            version: 2
        },
        "TileSquare310x310Text09": {
            texts: [
                "Text Field 1 (larger text)",
                "Text Field 2 (larger text)",
                "Text Field 3 (larger text)",
                "Text Field 4",
                "Text Field 5"
            ],
            version: 2
        },
        "TileSquare310x310TextList01": {
            texts: [
                "Text Field 1 (larger text)",
                "Text Field 2",
                "Text Field 3",
                "Text Field 4 (larger text)",
                "Text Field 5",
                "Text Field 6",
                "Text Field 7 (larger text)",
                "Text Field 8",
                "Text Field 9"
            ],
            version: 2
        },
        "TileSquare310x310TextList02": {
            texts: [
                "Text Field 1",
                "Text Field 2",
                "Text Field 3"
            ],
            version: 2
        },
        "TileSquare310x310TextList03": {
            texts: [
                "Text Field 1 (larger text)",
                "Text Field 2",
                "Text Field 3 (larger text)",
                "Text Field 4",
                "Text Field 5 (larger text)",
                "Text Field 6"
            ],
            version: 2
        },
        "TileSquare310x310BlockAndText01": {
            texts: [
                "Text Field 1 (large text)",
                "Text Field 2",
                "Text Field 3",
                "Text Field 4",
                "Text Field 5",
                "Text Field 6",
                "Text Field 7",
                "Text Field 8 (block text)",
                "Text Field 9"
            ],
            version: 2
        },
        "TileSquare310x310Image": {
            alts: [
                "alt text"
            ],
            images: [
                getBlankImageUri(310, 310),
            ],
            version: 2
        },
        "TileSquare310x310ImageCollection": {
            alts: [
                "main image",
                "small image 1 (left)",
                "small image 2 (left center)",
                "small image 3 (right center)",
                "small image 4 (right)"
            ],
            images: [
                getBlankImageUri(310, 235),
                getBlankImageUri(80, 75),
                getBlankImageUri(75, 75),
                getBlankImageUri(75, 75),
                getBlankImageUri(80, 75),
            ],
            version: 2
        },
        "TileSquare310x310BlockAndText02": {
            alts: [
                "alt text"
            ],
            images: [
                getBlankImageUri(310, 310),
            ],
            texts: [
                "Text Field 1 (block text)",
                "Text Field 2 (larger text)",
                "Text Field 3 (larger text)",
                "Text Field 4",
                "Text Field 5",
                "Text Field 6",
                "Text Field 7"
            ],
            version: 2
        },
        "TileSquare310x310ImageAndText01": {
            alts: [
                "alt text"
            ],
            images: [
                getBlankImageUri(310, 250),
            ],
            texts: [
                "Text Field 1"
            ],
            version: 2
        },
        "TileSquare310x310ImageAndText02": {
            alts: [
                "alt text"
            ],
            images: [
                getBlankImageUri(310, 250),
            ],
            texts: [
                "Text Field 1",
                "Text Field 2"
            ],
            version: 2
        },
        "TileSquare310x310ImageAndTextOverlay01": {
            alts: [
                "alt text"
            ],
            images: [
                getBlankImageUri(310, 310),
            ],
            texts: [
                "Text Field 1"
            ],
            version: 2
        },
        "TileSquare310x310ImageAndTextOverlay02": {
            alts: [
                "alt text"
            ],
            images: [
                getBlankImageUri(310, 310),
            ],
            texts: [
                "Text Field 1 (larger text)",
                "Text Field 2"
            ],
            version: 2
        },
        "TileSquare310x310ImageAndTextOverlay03": {
            alts: [
                "alt text"
            ],
            images: [
                getBlankImageUri(310, 310),
            ],
            texts: [
                "Text Field 1 (larger text)",
                "Text Field 2",
                "Text Field 3",
                "Text Field 4"
            ],
            version: 2
        },
        "TileSquare310x310ImageCollectionAndText01": {
            alts: [
                "main image",
                "small image 1 (left)",
                "small image 2 (left center)",
                "small image 3 (right center)",
                "small image 4 (right)"
            ],
            images: [
                getBlankImageUri(310, 185),
                getBlankImageUri(80, 75),
                getBlankImageUri(75, 75),
                getBlankImageUri(75, 75),
                getBlankImageUri(80, 75),
            ],
            texts: [
                "Text Field 1"
            ],
            version: 2
        },
        "TileSquare310x310ImageCollectionAndText02": {
            alts: [
                "main image",
                "small image 1 (left)",
                "small image 2 (left center)",
                "small image 3 (right center)",
                "small image 4 (right)"
            ],
            images: [
                getBlankImageUri(310, 185),
                getBlankImageUri(80, 75),
                getBlankImageUri(75, 75),
                getBlankImageUri(75, 75),
                getBlankImageUri(80, 75),
            ],
            texts: [
                "Text Field 1",
                "Text Field 2"
            ],
            version: 2
        },
        "TileSquare310x310SmallImagesAndTextList01": {
            alts: [
                "alt text",
                "alt text",
                "alt text"
            ],
            images: [
                getBlankImageUri(60, 60),
                getBlankImageUri(60, 60),
                getBlankImageUri(60, 60),
            ],
            texts: [
                "Text Field 1 (larger text)",
                "Text Field 2",
                "Text Field 3",
                "Text Field 4 (larger text)",
                "Text Field 5",
                "Text Field 6",
                "Text Field 7 (larger text)",
                "Text Field 8",
                "Text Field 9"
            ],
            version: 2
        },
        "TileSquare310x310SmallImagesAndTextList02": {
            alts: [
                "alt text",
                "alt text",
                "alt text"
            ],
            images: [
                getBlankImageUri(60, 60),
                getBlankImageUri(60, 60),
                getBlankImageUri(60, 60),
            ],
            texts: [
                "Text Field 1",
                "Text Field 2",
                "Text Field 3"
            ],
            version: 2
        },
        "TileSquare310x310SmallImagesAndTextList03": {
            alts: [
                "alt text",
                "alt text",
                "alt text"
            ],
            images: [
                getBlankImageUri(60, 60),
                getBlankImageUri(60, 60),
                getBlankImageUri(60, 60),
            ],
            texts: [
                "Text Field 1 (larger text)",
                "Text Field 2",
                "Text Field 3 (larger text)",
                "Text Field 4",
                "Text Field 5 (larger text)",
                "Text Field 6"
            ],
            version: 2
        },
        "TileSquare310x310SmallImagesAndTextList04": {
            alts: [
                "alt text",
                "alt text",
                "alt text"
            ],
            images: [
                getBlankImageUri(45, 65),
                getBlankImageUri(45, 65),
                getBlankImageUri(45, 65),
            ],
            texts: [
                "Text Field 1 (larger text)",
                "Text Field 2",
                "Text Field 3 (larger text)",
                "Text Field 4",
                "Text Field 5 (larger text)",
                "Text Field 6"
            ],
            version: 2
        },
        "TileSquare310x310SmallImagesAndTextList05": {
            alts: [
                "alt text",
                "alt text",
                "alt text"
            ],
            images: [
                getBlankImageUri(60, 60),
                getBlankImageUri(60, 60),
                getBlankImageUri(60, 60),
            ],
            texts: [
                "Text Field 1 (larger text)",
                "Text Field 2",
                "Text Field 3",
                "Text Field 4",
                "Text Field 5",
                "Text Field 6",
                "Text Field 7"
            ],
            version: 2
        },
        "TileSquare310x310SmallImageAndText01": {
            alts: [
                "alt text"
            ],
            images: [
                getBlankImageUri(80, 80),
            ],
            texts: [
                "Text Field 1 (larger text)",
                "Text Field 2",
                "Text Field 3"
            ],
            version: 2
        },
        "TileSquare71x71Image": {
            alts: [
                "alt text"
            ],
            images: [
                getBlankImageUri(71, 71),
            ],
            version: 3
        },
        "TileSquare71x71IconWithBadge": {
            alts: [
                "alt text"
            ],
            images: [
                "image1"
            ],
            version: 3
        },
        "TileSquare150x150IconWithBadge": {
            alts: [
                "alt text"
            ],
            images: [
                "image1"
            ],
            version: 3
        },
        "TileWide310x150IconWithBadgeAndText": {
            alts: [
                "alt text"
            ],
            images: [
                "image1"
            ],
            texts: [
                "Text Field 1 (larger text)",
                "Text Field 2",
                "Text Field 3"
            ],
            version: 3
        },
    };
    var tileTemplateList = TILE_TEMPLATE_LIST;
    var BADGE_TEMPLATE_LIST = {
        "TileSquare71x71IconWithBadge": {
            version: 1,
            value: 0,
        },
        "TileSquare150x150IconWithBadge": {
            version: 1,
            value: 0,
        },
        "TileWide310x150IconWithBadgeAndText": {
            version: 1,
            value: 0,
        }
    };
    var badgeTemplateList = BADGE_TEMPLATE_LIST;
    if (Object.freeze) {
        Object.freeze(TILE_TEMPLATE_LIST);
        Object.freeze(BADGE_TEMPLATE_LIST);
    }
    var toLabel = NString.normalize;
    var labelCompare = NString.compare;
    var labelEquals = NString.equals;
    var labelEmpty = NString.empty
    function deepClone(value) {
        // 判断是否能用 JSON 深拷贝（快速路径）
        try {
            // typeof 函数/DOM 会抛异常或不支持 JSON
            if (typeof value !== "function" &&
                typeof value !== "undefined" &&
                typeof value !== "symbol") {
                return JSON.parse(JSON.stringify(value));
            }
        } catch (ex) {
            // 忽略异常，继续深克隆
        }
        // 自定义递归克隆
        if (value === null || typeof value !== "object") {
            return value; // 基本类型
        }
        if (Object.prototype.toString.call(value) === "[object Date]") {
            return new Date(value.getTime()); // 克隆日期
        }
        if (Array.isArray(value)) {
            var result = [];
            for (var i = 0; i < value.length; i++) {
                result[i] = deepClone(value[i]);
            }
            return result;
        }
        // 普通对象
        var result = {};
        for (var key in value) {
            if (Object.prototype.hasOwnProperty.call(value, key)) {
                result[key] = deepClone(value[key]);
            }
        }
        return result;
    }
    function TileTemplate() {
        this.template = "";
        this.fallback = "";
        this.version = 1;
        this.images = [];
        this.texts = [];
        this.alts = [];
        /**
         * 创建一个磁贴模板
         * @param {string} templateName  模板名称 
         * @param {string} fallback 失败时的模板名称
         * @returns {TileTemplate} 返回一个磁贴模板
         */
        this.create = function (templateName, fallback) {
            if (templateName == null || templateName == undefined || templateName.trim() == "") {
                return null;
            }
            var templateNameList = Object.keys(tileTemplateList);
            for (var i = 0; i < templateNameList.length; i++) {
                if (labelEquals(templateName, templateNameList[i])) {
                    var ttemp = tileTemplateList[templateNameList[i]];
                    this.template = templateNameList[i];
                    this.version = ttemp.version;
                    if (ttemp.images) {
                        this.images = deepClone(ttemp.images);
                    } else {
                        this.images = [];
                    }
                    if (ttemp.texts) {
                        this.texts = deepClone(ttemp.texts);
                    } else {
                        this.texts = [];
                    }
                    if (ttemp.alts) {
                        this.alts = deepClone(ttemp.alts);
                    } else {
                        this.alts = "";
                    }
                    if (fallback != null && fallback != undefined && fallback.trim() != "") {
                        this.fallback = fallback;
                    } else if (ttemp.fallback) {
                        this.fallback = ttemp.fallback;
                    } else {
                        this.fallback = "";
                    }
                    return this;
                }
            }
            this.template = "";
            this.fallback = "";
            this.version = 1;
            this.images = [];
            this.texts = [];
            this.alts = [];
            return null;
        }
    }
    function TileGroup() {
        this.tiles = [];
        this.getXml = function () {
            // 统一使用 Windows.Data.Xml.Dom.XmlDocument
            var doc = new Windows.Data.Xml.Dom.XmlDocument();
            doc.loadXml("<tile><visual/></tile>");
            var root = doc.documentElement;
            var visual = root.selectSingleNode("visual");
            for (var i = 0; i < this.tiles.length; i++) {
                var tile = this.tiles[i];
                var binding = doc.createElement("binding");
                binding.setAttribute("template", tile.template);
                if (!labelEmpty(tile.fallback)) {
                    binding.setAttribute("fallback", tile.fallback);
                }
                // 用 getAttribute 判断属性是否存在
                var visualVersion = visual.getAttribute("version");
                if (
                    tile.version &&
                    parseInt(tile.version) > 1 &&
                    (visualVersion == null || visualVersion < tile.version)
                ) {
                    visual.setAttribute("version", tile.version);
                }

                // 处理 images
                if (tile.images !== null && tile.images !== undefined) {
                    var cnt = 0;
                    if (tile.images instanceof Array) {
                        cnt = tile.images.length;
                    } else if (tile.images instanceof Object) {
                        cnt = Object.keys(tile.images).length;
                    }
                    for (var j = 0; j < cnt; j++) {
                        var image = doc.createElement("image");
                        image.setAttribute("src", tile.images[j]);
                        if (
                            tile.alts != null &&
                            tile.alts.length > 0 &&
                            tile.alts !== undefined &&
                            tile.alts !== "" &&
                            j < tile.alts.length
                        ) {
                            image.setAttribute("alt", tile.alts[j]);
                        }
                        binding.appendChild(image);
                        image.setAttribute("id", (j + 1));
                    }
                }

                // 处理 texts
                if (tile.texts !== null && tile.texts !== undefined) {
                    var cnt = 0;
                    if (tile.texts instanceof Array) {
                        cnt = tile.texts.length;
                    } else if (tile.texts instanceof Object) {
                        cnt = Object.keys(tile.texts).length;
                    }
                    for (var j = 0; j < cnt; j++) {
                        var text = doc.createElement("text");
                        text.setAttribute("id", (j + 1));
                        text.innerText = tile.texts[j]; // UWP XML DOM用innerText
                        binding.appendChild(text);
                    }
                }

                visual.appendChild(binding);
            }
            return doc;
        }
        this.getXmlString = function () {
            var doc = this.getXml();
            return doc.getXml(); // Windows.Data.Xml.Dom.XmlDocument
        }
    }
    extern({
        TileTemplate: TileTemplate,
        TileGroup: TileGroup,
        getBlankImageUri: getBlankImageUri
    });
})();