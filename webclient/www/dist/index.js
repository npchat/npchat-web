var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
var __require = /* @__PURE__ */ ((x2) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x2, {
  get: (a2, b2) => (typeof require !== "undefined" ? require : a2)[b2]
}) : x2)(function(x2) {
  if (typeof require !== "undefined")
    return require.apply(this, arguments);
  throw new Error('Dynamic require of "' + x2 + '" is not supported');
});
var __commonJS = (cb, mod) => function __require2() {
  return mod || (0, cb[Object.keys(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __reExport = (target, module, desc) => {
  if (module && typeof module === "object" || typeof module === "function") {
    for (let key of __getOwnPropNames(module))
      if (!__hasOwnProp.call(target, key) && key !== "default")
        __defProp(target, key, { get: () => module[key], enumerable: !(desc = __getOwnPropDesc(module, key)) || desc.enumerable });
  }
  return target;
};
var __toModule = (module) => {
  return __reExport(__markAsModule(__defProp(module != null ? __create(__getProtoOf(module)) : {}, "default", module && module.__esModule && "default" in module ? { get: () => module.default, enumerable: true } : { value: module, enumerable: true })), module);
};
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};

// node_modules/qrcode/build/qrcode.js
var require_qrcode = __commonJS({
  "node_modules/qrcode/build/qrcode.js"(exports, module) {
    (function(f2) {
      if (typeof exports === "object" && typeof module !== "undefined") {
        module.exports = f2();
      } else if (typeof define === "function" && define.amd) {
        define([], f2);
      } else {
        var g2;
        if (typeof window !== "undefined") {
          g2 = window;
        } else if (typeof global !== "undefined") {
          g2 = global;
        } else if (typeof self !== "undefined") {
          g2 = self;
        } else {
          g2 = this;
        }
        g2.QRCode = f2();
      }
    })(function() {
      var define2, module2, exports2;
      return function() {
        function r4(e4, n5, t3) {
          function o5(i4, f2) {
            if (!n5[i4]) {
              if (!e4[i4]) {
                var c2 = typeof __require == "function" && __require;
                if (!f2 && c2)
                  return c2(i4, true);
                if (u2)
                  return u2(i4, true);
                var a2 = new Error("Cannot find module '" + i4 + "'");
                throw a2.code = "MODULE_NOT_FOUND", a2;
              }
              var p2 = n5[i4] = { exports: {} };
              e4[i4][0].call(p2.exports, function(r5) {
                var n6 = e4[i4][1][r5];
                return o5(n6 || r5);
              }, p2, p2.exports, r4, e4, n5, t3);
            }
            return n5[i4].exports;
          }
          for (var u2 = typeof __require == "function" && __require, i3 = 0; i3 < t3.length; i3++)
            o5(t3[i3]);
          return o5;
        }
        return r4;
      }()({ 1: [function(require2, module3, exports3) {
        module3.exports = function() {
          return typeof Promise === "function" && Promise.prototype && Promise.prototype.then;
        };
      }, {}], 2: [function(require2, module3, exports3) {
        var getSymbolSize = require2("./utils").getSymbolSize;
        exports3.getRowColCoords = function getRowColCoords(version) {
          if (version === 1)
            return [];
          var posCount = Math.floor(version / 7) + 2;
          var size = getSymbolSize(version);
          var intervals = size === 145 ? 26 : Math.ceil((size - 13) / (2 * posCount - 2)) * 2;
          var positions = [size - 7];
          for (var i3 = 1; i3 < posCount - 1; i3++) {
            positions[i3] = positions[i3 - 1] - intervals;
          }
          positions.push(6);
          return positions.reverse();
        };
        exports3.getPositions = function getPositions(version) {
          var coords = [];
          var pos = exports3.getRowColCoords(version);
          var posLength = pos.length;
          for (var i3 = 0; i3 < posLength; i3++) {
            for (var j = 0; j < posLength; j++) {
              if (i3 === 0 && j === 0 || i3 === 0 && j === posLength - 1 || i3 === posLength - 1 && j === 0) {
                continue;
              }
              coords.push([pos[i3], pos[j]]);
            }
          }
          return coords;
        };
      }, { "./utils": 21 }], 3: [function(require2, module3, exports3) {
        var Mode = require2("./mode");
        var ALPHA_NUM_CHARS = [
          "0",
          "1",
          "2",
          "3",
          "4",
          "5",
          "6",
          "7",
          "8",
          "9",
          "A",
          "B",
          "C",
          "D",
          "E",
          "F",
          "G",
          "H",
          "I",
          "J",
          "K",
          "L",
          "M",
          "N",
          "O",
          "P",
          "Q",
          "R",
          "S",
          "T",
          "U",
          "V",
          "W",
          "X",
          "Y",
          "Z",
          " ",
          "$",
          "%",
          "*",
          "+",
          "-",
          ".",
          "/",
          ":"
        ];
        function AlphanumericData(data) {
          this.mode = Mode.ALPHANUMERIC;
          this.data = data;
        }
        AlphanumericData.getBitsLength = function getBitsLength(length) {
          return 11 * Math.floor(length / 2) + 6 * (length % 2);
        };
        AlphanumericData.prototype.getLength = function getLength() {
          return this.data.length;
        };
        AlphanumericData.prototype.getBitsLength = function getBitsLength() {
          return AlphanumericData.getBitsLength(this.data.length);
        };
        AlphanumericData.prototype.write = function write(bitBuffer) {
          var i3;
          for (i3 = 0; i3 + 2 <= this.data.length; i3 += 2) {
            var value = ALPHA_NUM_CHARS.indexOf(this.data[i3]) * 45;
            value += ALPHA_NUM_CHARS.indexOf(this.data[i3 + 1]);
            bitBuffer.put(value, 11);
          }
          if (this.data.length % 2) {
            bitBuffer.put(ALPHA_NUM_CHARS.indexOf(this.data[i3]), 6);
          }
        };
        module3.exports = AlphanumericData;
      }, { "./mode": 14 }], 4: [function(require2, module3, exports3) {
        function BitBuffer() {
          this.buffer = [];
          this.length = 0;
        }
        BitBuffer.prototype = {
          get: function(index) {
            var bufIndex = Math.floor(index / 8);
            return (this.buffer[bufIndex] >>> 7 - index % 8 & 1) === 1;
          },
          put: function(num, length) {
            for (var i3 = 0; i3 < length; i3++) {
              this.putBit((num >>> length - i3 - 1 & 1) === 1);
            }
          },
          getLengthInBits: function() {
            return this.length;
          },
          putBit: function(bit) {
            var bufIndex = Math.floor(this.length / 8);
            if (this.buffer.length <= bufIndex) {
              this.buffer.push(0);
            }
            if (bit) {
              this.buffer[bufIndex] |= 128 >>> this.length % 8;
            }
            this.length++;
          }
        };
        module3.exports = BitBuffer;
      }, {}], 5: [function(require2, module3, exports3) {
        var BufferUtil = require2("../utils/buffer");
        function BitMatrix(size) {
          if (!size || size < 1) {
            throw new Error("BitMatrix size must be defined and greater than 0");
          }
          this.size = size;
          this.data = BufferUtil.alloc(size * size);
          this.reservedBit = BufferUtil.alloc(size * size);
        }
        BitMatrix.prototype.set = function(row, col, value, reserved) {
          var index = row * this.size + col;
          this.data[index] = value;
          if (reserved)
            this.reservedBit[index] = true;
        };
        BitMatrix.prototype.get = function(row, col) {
          return this.data[row * this.size + col];
        };
        BitMatrix.prototype.xor = function(row, col, value) {
          this.data[row * this.size + col] ^= value;
        };
        BitMatrix.prototype.isReserved = function(row, col) {
          return this.reservedBit[row * this.size + col];
        };
        module3.exports = BitMatrix;
      }, { "../utils/buffer": 28 }], 6: [function(require2, module3, exports3) {
        var BufferUtil = require2("../utils/buffer");
        var Mode = require2("./mode");
        function ByteData(data) {
          this.mode = Mode.BYTE;
          this.data = BufferUtil.from(data);
        }
        ByteData.getBitsLength = function getBitsLength(length) {
          return length * 8;
        };
        ByteData.prototype.getLength = function getLength() {
          return this.data.length;
        };
        ByteData.prototype.getBitsLength = function getBitsLength() {
          return ByteData.getBitsLength(this.data.length);
        };
        ByteData.prototype.write = function(bitBuffer) {
          for (var i3 = 0, l3 = this.data.length; i3 < l3; i3++) {
            bitBuffer.put(this.data[i3], 8);
          }
        };
        module3.exports = ByteData;
      }, { "../utils/buffer": 28, "./mode": 14 }], 7: [function(require2, module3, exports3) {
        var ECLevel = require2("./error-correction-level");
        var EC_BLOCKS_TABLE = [
          1,
          1,
          1,
          1,
          1,
          1,
          1,
          1,
          1,
          1,
          2,
          2,
          1,
          2,
          2,
          4,
          1,
          2,
          4,
          4,
          2,
          4,
          4,
          4,
          2,
          4,
          6,
          5,
          2,
          4,
          6,
          6,
          2,
          5,
          8,
          8,
          4,
          5,
          8,
          8,
          4,
          5,
          8,
          11,
          4,
          8,
          10,
          11,
          4,
          9,
          12,
          16,
          4,
          9,
          16,
          16,
          6,
          10,
          12,
          18,
          6,
          10,
          17,
          16,
          6,
          11,
          16,
          19,
          6,
          13,
          18,
          21,
          7,
          14,
          21,
          25,
          8,
          16,
          20,
          25,
          8,
          17,
          23,
          25,
          9,
          17,
          23,
          34,
          9,
          18,
          25,
          30,
          10,
          20,
          27,
          32,
          12,
          21,
          29,
          35,
          12,
          23,
          34,
          37,
          12,
          25,
          34,
          40,
          13,
          26,
          35,
          42,
          14,
          28,
          38,
          45,
          15,
          29,
          40,
          48,
          16,
          31,
          43,
          51,
          17,
          33,
          45,
          54,
          18,
          35,
          48,
          57,
          19,
          37,
          51,
          60,
          19,
          38,
          53,
          63,
          20,
          40,
          56,
          66,
          21,
          43,
          59,
          70,
          22,
          45,
          62,
          74,
          24,
          47,
          65,
          77,
          25,
          49,
          68,
          81
        ];
        var EC_CODEWORDS_TABLE = [
          7,
          10,
          13,
          17,
          10,
          16,
          22,
          28,
          15,
          26,
          36,
          44,
          20,
          36,
          52,
          64,
          26,
          48,
          72,
          88,
          36,
          64,
          96,
          112,
          40,
          72,
          108,
          130,
          48,
          88,
          132,
          156,
          60,
          110,
          160,
          192,
          72,
          130,
          192,
          224,
          80,
          150,
          224,
          264,
          96,
          176,
          260,
          308,
          104,
          198,
          288,
          352,
          120,
          216,
          320,
          384,
          132,
          240,
          360,
          432,
          144,
          280,
          408,
          480,
          168,
          308,
          448,
          532,
          180,
          338,
          504,
          588,
          196,
          364,
          546,
          650,
          224,
          416,
          600,
          700,
          224,
          442,
          644,
          750,
          252,
          476,
          690,
          816,
          270,
          504,
          750,
          900,
          300,
          560,
          810,
          960,
          312,
          588,
          870,
          1050,
          336,
          644,
          952,
          1110,
          360,
          700,
          1020,
          1200,
          390,
          728,
          1050,
          1260,
          420,
          784,
          1140,
          1350,
          450,
          812,
          1200,
          1440,
          480,
          868,
          1290,
          1530,
          510,
          924,
          1350,
          1620,
          540,
          980,
          1440,
          1710,
          570,
          1036,
          1530,
          1800,
          570,
          1064,
          1590,
          1890,
          600,
          1120,
          1680,
          1980,
          630,
          1204,
          1770,
          2100,
          660,
          1260,
          1860,
          2220,
          720,
          1316,
          1950,
          2310,
          750,
          1372,
          2040,
          2430
        ];
        exports3.getBlocksCount = function getBlocksCount(version, errorCorrectionLevel) {
          switch (errorCorrectionLevel) {
            case ECLevel.L:
              return EC_BLOCKS_TABLE[(version - 1) * 4 + 0];
            case ECLevel.M:
              return EC_BLOCKS_TABLE[(version - 1) * 4 + 1];
            case ECLevel.Q:
              return EC_BLOCKS_TABLE[(version - 1) * 4 + 2];
            case ECLevel.H:
              return EC_BLOCKS_TABLE[(version - 1) * 4 + 3];
            default:
              return void 0;
          }
        };
        exports3.getTotalCodewordsCount = function getTotalCodewordsCount(version, errorCorrectionLevel) {
          switch (errorCorrectionLevel) {
            case ECLevel.L:
              return EC_CODEWORDS_TABLE[(version - 1) * 4 + 0];
            case ECLevel.M:
              return EC_CODEWORDS_TABLE[(version - 1) * 4 + 1];
            case ECLevel.Q:
              return EC_CODEWORDS_TABLE[(version - 1) * 4 + 2];
            case ECLevel.H:
              return EC_CODEWORDS_TABLE[(version - 1) * 4 + 3];
            default:
              return void 0;
          }
        };
      }, { "./error-correction-level": 8 }], 8: [function(require2, module3, exports3) {
        exports3.L = { bit: 1 };
        exports3.M = { bit: 0 };
        exports3.Q = { bit: 3 };
        exports3.H = { bit: 2 };
        function fromString(string) {
          if (typeof string !== "string") {
            throw new Error("Param is not a string");
          }
          var lcStr = string.toLowerCase();
          switch (lcStr) {
            case "l":
            case "low":
              return exports3.L;
            case "m":
            case "medium":
              return exports3.M;
            case "q":
            case "quartile":
              return exports3.Q;
            case "h":
            case "high":
              return exports3.H;
            default:
              throw new Error("Unknown EC Level: " + string);
          }
        }
        exports3.isValid = function isValid(level) {
          return level && typeof level.bit !== "undefined" && level.bit >= 0 && level.bit < 4;
        };
        exports3.from = function from(value, defaultValue) {
          if (exports3.isValid(value)) {
            return value;
          }
          try {
            return fromString(value);
          } catch (e4) {
            return defaultValue;
          }
        };
      }, {}], 9: [function(require2, module3, exports3) {
        var getSymbolSize = require2("./utils").getSymbolSize;
        var FINDER_PATTERN_SIZE = 7;
        exports3.getPositions = function getPositions(version) {
          var size = getSymbolSize(version);
          return [
            [0, 0],
            [size - FINDER_PATTERN_SIZE, 0],
            [0, size - FINDER_PATTERN_SIZE]
          ];
        };
      }, { "./utils": 21 }], 10: [function(require2, module3, exports3) {
        var Utils = require2("./utils");
        var G15 = 1 << 10 | 1 << 8 | 1 << 5 | 1 << 4 | 1 << 2 | 1 << 1 | 1 << 0;
        var G15_MASK = 1 << 14 | 1 << 12 | 1 << 10 | 1 << 4 | 1 << 1;
        var G15_BCH = Utils.getBCHDigit(G15);
        exports3.getEncodedBits = function getEncodedBits(errorCorrectionLevel, mask) {
          var data = errorCorrectionLevel.bit << 3 | mask;
          var d2 = data << 10;
          while (Utils.getBCHDigit(d2) - G15_BCH >= 0) {
            d2 ^= G15 << Utils.getBCHDigit(d2) - G15_BCH;
          }
          return (data << 10 | d2) ^ G15_MASK;
        };
      }, { "./utils": 21 }], 11: [function(require2, module3, exports3) {
        var BufferUtil = require2("../utils/buffer");
        var EXP_TABLE = BufferUtil.alloc(512);
        var LOG_TABLE = BufferUtil.alloc(256);
        (function initTables() {
          var x2 = 1;
          for (var i3 = 0; i3 < 255; i3++) {
            EXP_TABLE[i3] = x2;
            LOG_TABLE[x2] = i3;
            x2 <<= 1;
            if (x2 & 256) {
              x2 ^= 285;
            }
          }
          for (i3 = 255; i3 < 512; i3++) {
            EXP_TABLE[i3] = EXP_TABLE[i3 - 255];
          }
        })();
        exports3.log = function log(n5) {
          if (n5 < 1)
            throw new Error("log(" + n5 + ")");
          return LOG_TABLE[n5];
        };
        exports3.exp = function exp(n5) {
          return EXP_TABLE[n5];
        };
        exports3.mul = function mul(x2, y2) {
          if (x2 === 0 || y2 === 0)
            return 0;
          return EXP_TABLE[LOG_TABLE[x2] + LOG_TABLE[y2]];
        };
      }, { "../utils/buffer": 28 }], 12: [function(require2, module3, exports3) {
        var Mode = require2("./mode");
        var Utils = require2("./utils");
        function KanjiData(data) {
          this.mode = Mode.KANJI;
          this.data = data;
        }
        KanjiData.getBitsLength = function getBitsLength(length) {
          return length * 13;
        };
        KanjiData.prototype.getLength = function getLength() {
          return this.data.length;
        };
        KanjiData.prototype.getBitsLength = function getBitsLength() {
          return KanjiData.getBitsLength(this.data.length);
        };
        KanjiData.prototype.write = function(bitBuffer) {
          var i3;
          for (i3 = 0; i3 < this.data.length; i3++) {
            var value = Utils.toSJIS(this.data[i3]);
            if (value >= 33088 && value <= 40956) {
              value -= 33088;
            } else if (value >= 57408 && value <= 60351) {
              value -= 49472;
            } else {
              throw new Error("Invalid SJIS character: " + this.data[i3] + "\nMake sure your charset is UTF-8");
            }
            value = (value >>> 8 & 255) * 192 + (value & 255);
            bitBuffer.put(value, 13);
          }
        };
        module3.exports = KanjiData;
      }, { "./mode": 14, "./utils": 21 }], 13: [function(require2, module3, exports3) {
        exports3.Patterns = {
          PATTERN000: 0,
          PATTERN001: 1,
          PATTERN010: 2,
          PATTERN011: 3,
          PATTERN100: 4,
          PATTERN101: 5,
          PATTERN110: 6,
          PATTERN111: 7
        };
        var PenaltyScores = {
          N1: 3,
          N2: 3,
          N3: 40,
          N4: 10
        };
        exports3.isValid = function isValid(mask) {
          return mask != null && mask !== "" && !isNaN(mask) && mask >= 0 && mask <= 7;
        };
        exports3.from = function from(value) {
          return exports3.isValid(value) ? parseInt(value, 10) : void 0;
        };
        exports3.getPenaltyN1 = function getPenaltyN1(data) {
          var size = data.size;
          var points = 0;
          var sameCountCol = 0;
          var sameCountRow = 0;
          var lastCol = null;
          var lastRow = null;
          for (var row = 0; row < size; row++) {
            sameCountCol = sameCountRow = 0;
            lastCol = lastRow = null;
            for (var col = 0; col < size; col++) {
              var module4 = data.get(row, col);
              if (module4 === lastCol) {
                sameCountCol++;
              } else {
                if (sameCountCol >= 5)
                  points += PenaltyScores.N1 + (sameCountCol - 5);
                lastCol = module4;
                sameCountCol = 1;
              }
              module4 = data.get(col, row);
              if (module4 === lastRow) {
                sameCountRow++;
              } else {
                if (sameCountRow >= 5)
                  points += PenaltyScores.N1 + (sameCountRow - 5);
                lastRow = module4;
                sameCountRow = 1;
              }
            }
            if (sameCountCol >= 5)
              points += PenaltyScores.N1 + (sameCountCol - 5);
            if (sameCountRow >= 5)
              points += PenaltyScores.N1 + (sameCountRow - 5);
          }
          return points;
        };
        exports3.getPenaltyN2 = function getPenaltyN2(data) {
          var size = data.size;
          var points = 0;
          for (var row = 0; row < size - 1; row++) {
            for (var col = 0; col < size - 1; col++) {
              var last = data.get(row, col) + data.get(row, col + 1) + data.get(row + 1, col) + data.get(row + 1, col + 1);
              if (last === 4 || last === 0)
                points++;
            }
          }
          return points * PenaltyScores.N2;
        };
        exports3.getPenaltyN3 = function getPenaltyN3(data) {
          var size = data.size;
          var points = 0;
          var bitsCol = 0;
          var bitsRow = 0;
          for (var row = 0; row < size; row++) {
            bitsCol = bitsRow = 0;
            for (var col = 0; col < size; col++) {
              bitsCol = bitsCol << 1 & 2047 | data.get(row, col);
              if (col >= 10 && (bitsCol === 1488 || bitsCol === 93))
                points++;
              bitsRow = bitsRow << 1 & 2047 | data.get(col, row);
              if (col >= 10 && (bitsRow === 1488 || bitsRow === 93))
                points++;
            }
          }
          return points * PenaltyScores.N3;
        };
        exports3.getPenaltyN4 = function getPenaltyN4(data) {
          var darkCount = 0;
          var modulesCount = data.data.length;
          for (var i3 = 0; i3 < modulesCount; i3++)
            darkCount += data.data[i3];
          var k2 = Math.abs(Math.ceil(darkCount * 100 / modulesCount / 5) - 10);
          return k2 * PenaltyScores.N4;
        };
        function getMaskAt(maskPattern, i3, j) {
          switch (maskPattern) {
            case exports3.Patterns.PATTERN000:
              return (i3 + j) % 2 === 0;
            case exports3.Patterns.PATTERN001:
              return i3 % 2 === 0;
            case exports3.Patterns.PATTERN010:
              return j % 3 === 0;
            case exports3.Patterns.PATTERN011:
              return (i3 + j) % 3 === 0;
            case exports3.Patterns.PATTERN100:
              return (Math.floor(i3 / 2) + Math.floor(j / 3)) % 2 === 0;
            case exports3.Patterns.PATTERN101:
              return i3 * j % 2 + i3 * j % 3 === 0;
            case exports3.Patterns.PATTERN110:
              return (i3 * j % 2 + i3 * j % 3) % 2 === 0;
            case exports3.Patterns.PATTERN111:
              return (i3 * j % 3 + (i3 + j) % 2) % 2 === 0;
            default:
              throw new Error("bad maskPattern:" + maskPattern);
          }
        }
        exports3.applyMask = function applyMask(pattern, data) {
          var size = data.size;
          for (var col = 0; col < size; col++) {
            for (var row = 0; row < size; row++) {
              if (data.isReserved(row, col))
                continue;
              data.xor(row, col, getMaskAt(pattern, row, col));
            }
          }
        };
        exports3.getBestMask = function getBestMask(data, setupFormatFunc) {
          var numPatterns = Object.keys(exports3.Patterns).length;
          var bestPattern = 0;
          var lowerPenalty = Infinity;
          for (var p2 = 0; p2 < numPatterns; p2++) {
            setupFormatFunc(p2);
            exports3.applyMask(p2, data);
            var penalty = exports3.getPenaltyN1(data) + exports3.getPenaltyN2(data) + exports3.getPenaltyN3(data) + exports3.getPenaltyN4(data);
            exports3.applyMask(p2, data);
            if (penalty < lowerPenalty) {
              lowerPenalty = penalty;
              bestPattern = p2;
            }
          }
          return bestPattern;
        };
      }, {}], 14: [function(require2, module3, exports3) {
        var VersionCheck = require2("./version-check");
        var Regex = require2("./regex");
        exports3.NUMERIC = {
          id: "Numeric",
          bit: 1 << 0,
          ccBits: [10, 12, 14]
        };
        exports3.ALPHANUMERIC = {
          id: "Alphanumeric",
          bit: 1 << 1,
          ccBits: [9, 11, 13]
        };
        exports3.BYTE = {
          id: "Byte",
          bit: 1 << 2,
          ccBits: [8, 16, 16]
        };
        exports3.KANJI = {
          id: "Kanji",
          bit: 1 << 3,
          ccBits: [8, 10, 12]
        };
        exports3.MIXED = {
          bit: -1
        };
        exports3.getCharCountIndicator = function getCharCountIndicator(mode, version) {
          if (!mode.ccBits)
            throw new Error("Invalid mode: " + mode);
          if (!VersionCheck.isValid(version)) {
            throw new Error("Invalid version: " + version);
          }
          if (version >= 1 && version < 10)
            return mode.ccBits[0];
          else if (version < 27)
            return mode.ccBits[1];
          return mode.ccBits[2];
        };
        exports3.getBestModeForData = function getBestModeForData(dataStr) {
          if (Regex.testNumeric(dataStr))
            return exports3.NUMERIC;
          else if (Regex.testAlphanumeric(dataStr))
            return exports3.ALPHANUMERIC;
          else if (Regex.testKanji(dataStr))
            return exports3.KANJI;
          else
            return exports3.BYTE;
        };
        exports3.toString = function toString(mode) {
          if (mode && mode.id)
            return mode.id;
          throw new Error("Invalid mode");
        };
        exports3.isValid = function isValid(mode) {
          return mode && mode.bit && mode.ccBits;
        };
        function fromString(string) {
          if (typeof string !== "string") {
            throw new Error("Param is not a string");
          }
          var lcStr = string.toLowerCase();
          switch (lcStr) {
            case "numeric":
              return exports3.NUMERIC;
            case "alphanumeric":
              return exports3.ALPHANUMERIC;
            case "kanji":
              return exports3.KANJI;
            case "byte":
              return exports3.BYTE;
            default:
              throw new Error("Unknown mode: " + string);
          }
        }
        exports3.from = function from(value, defaultValue) {
          if (exports3.isValid(value)) {
            return value;
          }
          try {
            return fromString(value);
          } catch (e4) {
            return defaultValue;
          }
        };
      }, { "./regex": 19, "./version-check": 22 }], 15: [function(require2, module3, exports3) {
        var Mode = require2("./mode");
        function NumericData(data) {
          this.mode = Mode.NUMERIC;
          this.data = data.toString();
        }
        NumericData.getBitsLength = function getBitsLength(length) {
          return 10 * Math.floor(length / 3) + (length % 3 ? length % 3 * 3 + 1 : 0);
        };
        NumericData.prototype.getLength = function getLength() {
          return this.data.length;
        };
        NumericData.prototype.getBitsLength = function getBitsLength() {
          return NumericData.getBitsLength(this.data.length);
        };
        NumericData.prototype.write = function write(bitBuffer) {
          var i3, group, value;
          for (i3 = 0; i3 + 3 <= this.data.length; i3 += 3) {
            group = this.data.substr(i3, 3);
            value = parseInt(group, 10);
            bitBuffer.put(value, 10);
          }
          var remainingNum = this.data.length - i3;
          if (remainingNum > 0) {
            group = this.data.substr(i3);
            value = parseInt(group, 10);
            bitBuffer.put(value, remainingNum * 3 + 1);
          }
        };
        module3.exports = NumericData;
      }, { "./mode": 14 }], 16: [function(require2, module3, exports3) {
        var BufferUtil = require2("../utils/buffer");
        var GF = require2("./galois-field");
        exports3.mul = function mul(p1, p2) {
          var coeff = BufferUtil.alloc(p1.length + p2.length - 1);
          for (var i3 = 0; i3 < p1.length; i3++) {
            for (var j = 0; j < p2.length; j++) {
              coeff[i3 + j] ^= GF.mul(p1[i3], p2[j]);
            }
          }
          return coeff;
        };
        exports3.mod = function mod(divident, divisor) {
          var result = BufferUtil.from(divident);
          while (result.length - divisor.length >= 0) {
            var coeff = result[0];
            for (var i3 = 0; i3 < divisor.length; i3++) {
              result[i3] ^= GF.mul(divisor[i3], coeff);
            }
            var offset = 0;
            while (offset < result.length && result[offset] === 0)
              offset++;
            result = result.slice(offset);
          }
          return result;
        };
        exports3.generateECPolynomial = function generateECPolynomial(degree) {
          var poly = BufferUtil.from([1]);
          for (var i3 = 0; i3 < degree; i3++) {
            poly = exports3.mul(poly, [1, GF.exp(i3)]);
          }
          return poly;
        };
      }, { "../utils/buffer": 28, "./galois-field": 11 }], 17: [function(require2, module3, exports3) {
        var BufferUtil = require2("../utils/buffer");
        var Utils = require2("./utils");
        var ECLevel = require2("./error-correction-level");
        var BitBuffer = require2("./bit-buffer");
        var BitMatrix = require2("./bit-matrix");
        var AlignmentPattern = require2("./alignment-pattern");
        var FinderPattern = require2("./finder-pattern");
        var MaskPattern = require2("./mask-pattern");
        var ECCode = require2("./error-correction-code");
        var ReedSolomonEncoder = require2("./reed-solomon-encoder");
        var Version = require2("./version");
        var FormatInfo = require2("./format-info");
        var Mode = require2("./mode");
        var Segments = require2("./segments");
        var isArray = require2("isarray");
        function setupFinderPattern(matrix, version) {
          var size = matrix.size;
          var pos = FinderPattern.getPositions(version);
          for (var i3 = 0; i3 < pos.length; i3++) {
            var row = pos[i3][0];
            var col = pos[i3][1];
            for (var r4 = -1; r4 <= 7; r4++) {
              if (row + r4 <= -1 || size <= row + r4)
                continue;
              for (var c2 = -1; c2 <= 7; c2++) {
                if (col + c2 <= -1 || size <= col + c2)
                  continue;
                if (r4 >= 0 && r4 <= 6 && (c2 === 0 || c2 === 6) || c2 >= 0 && c2 <= 6 && (r4 === 0 || r4 === 6) || r4 >= 2 && r4 <= 4 && c2 >= 2 && c2 <= 4) {
                  matrix.set(row + r4, col + c2, true, true);
                } else {
                  matrix.set(row + r4, col + c2, false, true);
                }
              }
            }
          }
        }
        function setupTimingPattern(matrix) {
          var size = matrix.size;
          for (var r4 = 8; r4 < size - 8; r4++) {
            var value = r4 % 2 === 0;
            matrix.set(r4, 6, value, true);
            matrix.set(6, r4, value, true);
          }
        }
        function setupAlignmentPattern(matrix, version) {
          var pos = AlignmentPattern.getPositions(version);
          for (var i3 = 0; i3 < pos.length; i3++) {
            var row = pos[i3][0];
            var col = pos[i3][1];
            for (var r4 = -2; r4 <= 2; r4++) {
              for (var c2 = -2; c2 <= 2; c2++) {
                if (r4 === -2 || r4 === 2 || c2 === -2 || c2 === 2 || r4 === 0 && c2 === 0) {
                  matrix.set(row + r4, col + c2, true, true);
                } else {
                  matrix.set(row + r4, col + c2, false, true);
                }
              }
            }
          }
        }
        function setupVersionInfo(matrix, version) {
          var size = matrix.size;
          var bits = Version.getEncodedBits(version);
          var row, col, mod;
          for (var i3 = 0; i3 < 18; i3++) {
            row = Math.floor(i3 / 3);
            col = i3 % 3 + size - 8 - 3;
            mod = (bits >> i3 & 1) === 1;
            matrix.set(row, col, mod, true);
            matrix.set(col, row, mod, true);
          }
        }
        function setupFormatInfo(matrix, errorCorrectionLevel, maskPattern) {
          var size = matrix.size;
          var bits = FormatInfo.getEncodedBits(errorCorrectionLevel, maskPattern);
          var i3, mod;
          for (i3 = 0; i3 < 15; i3++) {
            mod = (bits >> i3 & 1) === 1;
            if (i3 < 6) {
              matrix.set(i3, 8, mod, true);
            } else if (i3 < 8) {
              matrix.set(i3 + 1, 8, mod, true);
            } else {
              matrix.set(size - 15 + i3, 8, mod, true);
            }
            if (i3 < 8) {
              matrix.set(8, size - i3 - 1, mod, true);
            } else if (i3 < 9) {
              matrix.set(8, 15 - i3 - 1 + 1, mod, true);
            } else {
              matrix.set(8, 15 - i3 - 1, mod, true);
            }
          }
          matrix.set(size - 8, 8, 1, true);
        }
        function setupData(matrix, data) {
          var size = matrix.size;
          var inc = -1;
          var row = size - 1;
          var bitIndex = 7;
          var byteIndex = 0;
          for (var col = size - 1; col > 0; col -= 2) {
            if (col === 6)
              col--;
            while (true) {
              for (var c2 = 0; c2 < 2; c2++) {
                if (!matrix.isReserved(row, col - c2)) {
                  var dark = false;
                  if (byteIndex < data.length) {
                    dark = (data[byteIndex] >>> bitIndex & 1) === 1;
                  }
                  matrix.set(row, col - c2, dark);
                  bitIndex--;
                  if (bitIndex === -1) {
                    byteIndex++;
                    bitIndex = 7;
                  }
                }
              }
              row += inc;
              if (row < 0 || size <= row) {
                row -= inc;
                inc = -inc;
                break;
              }
            }
          }
        }
        function createData(version, errorCorrectionLevel, segments) {
          var buffer = new BitBuffer();
          segments.forEach(function(data) {
            buffer.put(data.mode.bit, 4);
            buffer.put(data.getLength(), Mode.getCharCountIndicator(data.mode, version));
            data.write(buffer);
          });
          var totalCodewords = Utils.getSymbolTotalCodewords(version);
          var ecTotalCodewords = ECCode.getTotalCodewordsCount(version, errorCorrectionLevel);
          var dataTotalCodewordsBits = (totalCodewords - ecTotalCodewords) * 8;
          if (buffer.getLengthInBits() + 4 <= dataTotalCodewordsBits) {
            buffer.put(0, 4);
          }
          while (buffer.getLengthInBits() % 8 !== 0) {
            buffer.putBit(0);
          }
          var remainingByte = (dataTotalCodewordsBits - buffer.getLengthInBits()) / 8;
          for (var i3 = 0; i3 < remainingByte; i3++) {
            buffer.put(i3 % 2 ? 17 : 236, 8);
          }
          return createCodewords(buffer, version, errorCorrectionLevel);
        }
        function createCodewords(bitBuffer, version, errorCorrectionLevel) {
          var totalCodewords = Utils.getSymbolTotalCodewords(version);
          var ecTotalCodewords = ECCode.getTotalCodewordsCount(version, errorCorrectionLevel);
          var dataTotalCodewords = totalCodewords - ecTotalCodewords;
          var ecTotalBlocks = ECCode.getBlocksCount(version, errorCorrectionLevel);
          var blocksInGroup2 = totalCodewords % ecTotalBlocks;
          var blocksInGroup1 = ecTotalBlocks - blocksInGroup2;
          var totalCodewordsInGroup1 = Math.floor(totalCodewords / ecTotalBlocks);
          var dataCodewordsInGroup1 = Math.floor(dataTotalCodewords / ecTotalBlocks);
          var dataCodewordsInGroup2 = dataCodewordsInGroup1 + 1;
          var ecCount = totalCodewordsInGroup1 - dataCodewordsInGroup1;
          var rs = new ReedSolomonEncoder(ecCount);
          var offset = 0;
          var dcData = new Array(ecTotalBlocks);
          var ecData = new Array(ecTotalBlocks);
          var maxDataSize = 0;
          var buffer = BufferUtil.from(bitBuffer.buffer);
          for (var b2 = 0; b2 < ecTotalBlocks; b2++) {
            var dataSize = b2 < blocksInGroup1 ? dataCodewordsInGroup1 : dataCodewordsInGroup2;
            dcData[b2] = buffer.slice(offset, offset + dataSize);
            ecData[b2] = rs.encode(dcData[b2]);
            offset += dataSize;
            maxDataSize = Math.max(maxDataSize, dataSize);
          }
          var data = BufferUtil.alloc(totalCodewords);
          var index = 0;
          var i3, r4;
          for (i3 = 0; i3 < maxDataSize; i3++) {
            for (r4 = 0; r4 < ecTotalBlocks; r4++) {
              if (i3 < dcData[r4].length) {
                data[index++] = dcData[r4][i3];
              }
            }
          }
          for (i3 = 0; i3 < ecCount; i3++) {
            for (r4 = 0; r4 < ecTotalBlocks; r4++) {
              data[index++] = ecData[r4][i3];
            }
          }
          return data;
        }
        function createSymbol(data, version, errorCorrectionLevel, maskPattern) {
          var segments;
          if (isArray(data)) {
            segments = Segments.fromArray(data);
          } else if (typeof data === "string") {
            var estimatedVersion = version;
            if (!estimatedVersion) {
              var rawSegments = Segments.rawSplit(data);
              estimatedVersion = Version.getBestVersionForData(rawSegments, errorCorrectionLevel);
            }
            segments = Segments.fromString(data, estimatedVersion || 40);
          } else {
            throw new Error("Invalid data");
          }
          var bestVersion = Version.getBestVersionForData(segments, errorCorrectionLevel);
          if (!bestVersion) {
            throw new Error("The amount of data is too big to be stored in a QR Code");
          }
          if (!version) {
            version = bestVersion;
          } else if (version < bestVersion) {
            throw new Error("\nThe chosen QR Code version cannot contain this amount of data.\nMinimum version required to store current data is: " + bestVersion + ".\n");
          }
          var dataBits = createData(version, errorCorrectionLevel, segments);
          var moduleCount = Utils.getSymbolSize(version);
          var modules = new BitMatrix(moduleCount);
          setupFinderPattern(modules, version);
          setupTimingPattern(modules);
          setupAlignmentPattern(modules, version);
          setupFormatInfo(modules, errorCorrectionLevel, 0);
          if (version >= 7) {
            setupVersionInfo(modules, version);
          }
          setupData(modules, dataBits);
          if (isNaN(maskPattern)) {
            maskPattern = MaskPattern.getBestMask(modules, setupFormatInfo.bind(null, modules, errorCorrectionLevel));
          }
          MaskPattern.applyMask(maskPattern, modules);
          setupFormatInfo(modules, errorCorrectionLevel, maskPattern);
          return {
            modules,
            version,
            errorCorrectionLevel,
            maskPattern,
            segments
          };
        }
        exports3.create = function create(data, options) {
          if (typeof data === "undefined" || data === "") {
            throw new Error("No input text");
          }
          var errorCorrectionLevel = ECLevel.M;
          var version;
          var mask;
          if (typeof options !== "undefined") {
            errorCorrectionLevel = ECLevel.from(options.errorCorrectionLevel, ECLevel.M);
            version = Version.from(options.version);
            mask = MaskPattern.from(options.maskPattern);
            if (options.toSJISFunc) {
              Utils.setToSJISFunction(options.toSJISFunc);
            }
          }
          return createSymbol(data, version, errorCorrectionLevel, mask);
        };
      }, { "../utils/buffer": 28, "./alignment-pattern": 2, "./bit-buffer": 4, "./bit-matrix": 5, "./error-correction-code": 7, "./error-correction-level": 8, "./finder-pattern": 9, "./format-info": 10, "./mask-pattern": 13, "./mode": 14, "./reed-solomon-encoder": 18, "./segments": 20, "./utils": 21, "./version": 23, "isarray": 33 }], 18: [function(require2, module3, exports3) {
        var BufferUtil = require2("../utils/buffer");
        var Polynomial = require2("./polynomial");
        var Buffer2 = require2("buffer").Buffer;
        function ReedSolomonEncoder(degree) {
          this.genPoly = void 0;
          this.degree = degree;
          if (this.degree)
            this.initialize(this.degree);
        }
        ReedSolomonEncoder.prototype.initialize = function initialize(degree) {
          this.degree = degree;
          this.genPoly = Polynomial.generateECPolynomial(this.degree);
        };
        ReedSolomonEncoder.prototype.encode = function encode(data) {
          if (!this.genPoly) {
            throw new Error("Encoder not initialized");
          }
          var pad = BufferUtil.alloc(this.degree);
          var paddedData = Buffer2.concat([data, pad], data.length + this.degree);
          var remainder = Polynomial.mod(paddedData, this.genPoly);
          var start = this.degree - remainder.length;
          if (start > 0) {
            var buff = BufferUtil.alloc(this.degree);
            remainder.copy(buff, start);
            return buff;
          }
          return remainder;
        };
        module3.exports = ReedSolomonEncoder;
      }, { "../utils/buffer": 28, "./polynomial": 16, "buffer": 30 }], 19: [function(require2, module3, exports3) {
        var numeric = "[0-9]+";
        var alphanumeric = "[A-Z $%*+\\-./:]+";
        var kanji = "(?:[u3000-u303F]|[u3040-u309F]|[u30A0-u30FF]|[uFF00-uFFEF]|[u4E00-u9FAF]|[u2605-u2606]|[u2190-u2195]|u203B|[u2010u2015u2018u2019u2025u2026u201Cu201Du2225u2260]|[u0391-u0451]|[u00A7u00A8u00B1u00B4u00D7u00F7])+";
        kanji = kanji.replace(/u/g, "\\u");
        var byte = "(?:(?![A-Z0-9 $%*+\\-./:]|" + kanji + ")(?:.|[\r\n]))+";
        exports3.KANJI = new RegExp(kanji, "g");
        exports3.BYTE_KANJI = new RegExp("[^A-Z0-9 $%*+\\-./:]+", "g");
        exports3.BYTE = new RegExp(byte, "g");
        exports3.NUMERIC = new RegExp(numeric, "g");
        exports3.ALPHANUMERIC = new RegExp(alphanumeric, "g");
        var TEST_KANJI = new RegExp("^" + kanji + "$");
        var TEST_NUMERIC = new RegExp("^" + numeric + "$");
        var TEST_ALPHANUMERIC = new RegExp("^[A-Z0-9 $%*+\\-./:]+$");
        exports3.testKanji = function testKanji(str) {
          return TEST_KANJI.test(str);
        };
        exports3.testNumeric = function testNumeric(str) {
          return TEST_NUMERIC.test(str);
        };
        exports3.testAlphanumeric = function testAlphanumeric(str) {
          return TEST_ALPHANUMERIC.test(str);
        };
      }, {}], 20: [function(require2, module3, exports3) {
        var Mode = require2("./mode");
        var NumericData = require2("./numeric-data");
        var AlphanumericData = require2("./alphanumeric-data");
        var ByteData = require2("./byte-data");
        var KanjiData = require2("./kanji-data");
        var Regex = require2("./regex");
        var Utils = require2("./utils");
        var dijkstra = require2("dijkstrajs");
        function getStringByteLength(str) {
          return unescape(encodeURIComponent(str)).length;
        }
        function getSegments(regex, mode, str) {
          var segments = [];
          var result;
          while ((result = regex.exec(str)) !== null) {
            segments.push({
              data: result[0],
              index: result.index,
              mode,
              length: result[0].length
            });
          }
          return segments;
        }
        function getSegmentsFromString(dataStr) {
          var numSegs = getSegments(Regex.NUMERIC, Mode.NUMERIC, dataStr);
          var alphaNumSegs = getSegments(Regex.ALPHANUMERIC, Mode.ALPHANUMERIC, dataStr);
          var byteSegs;
          var kanjiSegs;
          if (Utils.isKanjiModeEnabled()) {
            byteSegs = getSegments(Regex.BYTE, Mode.BYTE, dataStr);
            kanjiSegs = getSegments(Regex.KANJI, Mode.KANJI, dataStr);
          } else {
            byteSegs = getSegments(Regex.BYTE_KANJI, Mode.BYTE, dataStr);
            kanjiSegs = [];
          }
          var segs = numSegs.concat(alphaNumSegs, byteSegs, kanjiSegs);
          return segs.sort(function(s1, s22) {
            return s1.index - s22.index;
          }).map(function(obj) {
            return {
              data: obj.data,
              mode: obj.mode,
              length: obj.length
            };
          });
        }
        function getSegmentBitsLength(length, mode) {
          switch (mode) {
            case Mode.NUMERIC:
              return NumericData.getBitsLength(length);
            case Mode.ALPHANUMERIC:
              return AlphanumericData.getBitsLength(length);
            case Mode.KANJI:
              return KanjiData.getBitsLength(length);
            case Mode.BYTE:
              return ByteData.getBitsLength(length);
          }
        }
        function mergeSegments(segs) {
          return segs.reduce(function(acc, curr) {
            var prevSeg = acc.length - 1 >= 0 ? acc[acc.length - 1] : null;
            if (prevSeg && prevSeg.mode === curr.mode) {
              acc[acc.length - 1].data += curr.data;
              return acc;
            }
            acc.push(curr);
            return acc;
          }, []);
        }
        function buildNodes(segs) {
          var nodes = [];
          for (var i3 = 0; i3 < segs.length; i3++) {
            var seg = segs[i3];
            switch (seg.mode) {
              case Mode.NUMERIC:
                nodes.push([
                  seg,
                  { data: seg.data, mode: Mode.ALPHANUMERIC, length: seg.length },
                  { data: seg.data, mode: Mode.BYTE, length: seg.length }
                ]);
                break;
              case Mode.ALPHANUMERIC:
                nodes.push([
                  seg,
                  { data: seg.data, mode: Mode.BYTE, length: seg.length }
                ]);
                break;
              case Mode.KANJI:
                nodes.push([
                  seg,
                  { data: seg.data, mode: Mode.BYTE, length: getStringByteLength(seg.data) }
                ]);
                break;
              case Mode.BYTE:
                nodes.push([
                  { data: seg.data, mode: Mode.BYTE, length: getStringByteLength(seg.data) }
                ]);
            }
          }
          return nodes;
        }
        function buildGraph(nodes, version) {
          var table = {};
          var graph = { "start": {} };
          var prevNodeIds = ["start"];
          for (var i3 = 0; i3 < nodes.length; i3++) {
            var nodeGroup = nodes[i3];
            var currentNodeIds = [];
            for (var j = 0; j < nodeGroup.length; j++) {
              var node = nodeGroup[j];
              var key = "" + i3 + j;
              currentNodeIds.push(key);
              table[key] = { node, lastCount: 0 };
              graph[key] = {};
              for (var n5 = 0; n5 < prevNodeIds.length; n5++) {
                var prevNodeId = prevNodeIds[n5];
                if (table[prevNodeId] && table[prevNodeId].node.mode === node.mode) {
                  graph[prevNodeId][key] = getSegmentBitsLength(table[prevNodeId].lastCount + node.length, node.mode) - getSegmentBitsLength(table[prevNodeId].lastCount, node.mode);
                  table[prevNodeId].lastCount += node.length;
                } else {
                  if (table[prevNodeId])
                    table[prevNodeId].lastCount = node.length;
                  graph[prevNodeId][key] = getSegmentBitsLength(node.length, node.mode) + 4 + Mode.getCharCountIndicator(node.mode, version);
                }
              }
            }
            prevNodeIds = currentNodeIds;
          }
          for (n5 = 0; n5 < prevNodeIds.length; n5++) {
            graph[prevNodeIds[n5]]["end"] = 0;
          }
          return { map: graph, table };
        }
        function buildSingleSegment(data, modesHint) {
          var mode;
          var bestMode = Mode.getBestModeForData(data);
          mode = Mode.from(modesHint, bestMode);
          if (mode !== Mode.BYTE && mode.bit < bestMode.bit) {
            throw new Error('"' + data + '" cannot be encoded with mode ' + Mode.toString(mode) + ".\n Suggested mode is: " + Mode.toString(bestMode));
          }
          if (mode === Mode.KANJI && !Utils.isKanjiModeEnabled()) {
            mode = Mode.BYTE;
          }
          switch (mode) {
            case Mode.NUMERIC:
              return new NumericData(data);
            case Mode.ALPHANUMERIC:
              return new AlphanumericData(data);
            case Mode.KANJI:
              return new KanjiData(data);
            case Mode.BYTE:
              return new ByteData(data);
          }
        }
        exports3.fromArray = function fromArray(array) {
          return array.reduce(function(acc, seg) {
            if (typeof seg === "string") {
              acc.push(buildSingleSegment(seg, null));
            } else if (seg.data) {
              acc.push(buildSingleSegment(seg.data, seg.mode));
            }
            return acc;
          }, []);
        };
        exports3.fromString = function fromString(data, version) {
          var segs = getSegmentsFromString(data, Utils.isKanjiModeEnabled());
          var nodes = buildNodes(segs);
          var graph = buildGraph(nodes, version);
          var path = dijkstra.find_path(graph.map, "start", "end");
          var optimizedSegs = [];
          for (var i3 = 1; i3 < path.length - 1; i3++) {
            optimizedSegs.push(graph.table[path[i3]].node);
          }
          return exports3.fromArray(mergeSegments(optimizedSegs));
        };
        exports3.rawSplit = function rawSplit(data) {
          return exports3.fromArray(getSegmentsFromString(data, Utils.isKanjiModeEnabled()));
        };
      }, { "./alphanumeric-data": 3, "./byte-data": 6, "./kanji-data": 12, "./mode": 14, "./numeric-data": 15, "./regex": 19, "./utils": 21, "dijkstrajs": 31 }], 21: [function(require2, module3, exports3) {
        var toSJISFunction;
        var CODEWORDS_COUNT = [
          0,
          26,
          44,
          70,
          100,
          134,
          172,
          196,
          242,
          292,
          346,
          404,
          466,
          532,
          581,
          655,
          733,
          815,
          901,
          991,
          1085,
          1156,
          1258,
          1364,
          1474,
          1588,
          1706,
          1828,
          1921,
          2051,
          2185,
          2323,
          2465,
          2611,
          2761,
          2876,
          3034,
          3196,
          3362,
          3532,
          3706
        ];
        exports3.getSymbolSize = function getSymbolSize(version) {
          if (!version)
            throw new Error('"version" cannot be null or undefined');
          if (version < 1 || version > 40)
            throw new Error('"version" should be in range from 1 to 40');
          return version * 4 + 17;
        };
        exports3.getSymbolTotalCodewords = function getSymbolTotalCodewords(version) {
          return CODEWORDS_COUNT[version];
        };
        exports3.getBCHDigit = function(data) {
          var digit = 0;
          while (data !== 0) {
            digit++;
            data >>>= 1;
          }
          return digit;
        };
        exports3.setToSJISFunction = function setToSJISFunction(f2) {
          if (typeof f2 !== "function") {
            throw new Error('"toSJISFunc" is not a valid function.');
          }
          toSJISFunction = f2;
        };
        exports3.isKanjiModeEnabled = function() {
          return typeof toSJISFunction !== "undefined";
        };
        exports3.toSJIS = function toSJIS(kanji) {
          return toSJISFunction(kanji);
        };
      }, {}], 22: [function(require2, module3, exports3) {
        exports3.isValid = function isValid(version) {
          return !isNaN(version) && version >= 1 && version <= 40;
        };
      }, {}], 23: [function(require2, module3, exports3) {
        var Utils = require2("./utils");
        var ECCode = require2("./error-correction-code");
        var ECLevel = require2("./error-correction-level");
        var Mode = require2("./mode");
        var VersionCheck = require2("./version-check");
        var isArray = require2("isarray");
        var G18 = 1 << 12 | 1 << 11 | 1 << 10 | 1 << 9 | 1 << 8 | 1 << 5 | 1 << 2 | 1 << 0;
        var G18_BCH = Utils.getBCHDigit(G18);
        function getBestVersionForDataLength(mode, length, errorCorrectionLevel) {
          for (var currentVersion = 1; currentVersion <= 40; currentVersion++) {
            if (length <= exports3.getCapacity(currentVersion, errorCorrectionLevel, mode)) {
              return currentVersion;
            }
          }
          return void 0;
        }
        function getReservedBitsCount(mode, version) {
          return Mode.getCharCountIndicator(mode, version) + 4;
        }
        function getTotalBitsFromDataArray(segments, version) {
          var totalBits = 0;
          segments.forEach(function(data) {
            var reservedBits = getReservedBitsCount(data.mode, version);
            totalBits += reservedBits + data.getBitsLength();
          });
          return totalBits;
        }
        function getBestVersionForMixedData(segments, errorCorrectionLevel) {
          for (var currentVersion = 1; currentVersion <= 40; currentVersion++) {
            var length = getTotalBitsFromDataArray(segments, currentVersion);
            if (length <= exports3.getCapacity(currentVersion, errorCorrectionLevel, Mode.MIXED)) {
              return currentVersion;
            }
          }
          return void 0;
        }
        exports3.from = function from(value, defaultValue) {
          if (VersionCheck.isValid(value)) {
            return parseInt(value, 10);
          }
          return defaultValue;
        };
        exports3.getCapacity = function getCapacity(version, errorCorrectionLevel, mode) {
          if (!VersionCheck.isValid(version)) {
            throw new Error("Invalid QR Code version");
          }
          if (typeof mode === "undefined")
            mode = Mode.BYTE;
          var totalCodewords = Utils.getSymbolTotalCodewords(version);
          var ecTotalCodewords = ECCode.getTotalCodewordsCount(version, errorCorrectionLevel);
          var dataTotalCodewordsBits = (totalCodewords - ecTotalCodewords) * 8;
          if (mode === Mode.MIXED)
            return dataTotalCodewordsBits;
          var usableBits = dataTotalCodewordsBits - getReservedBitsCount(mode, version);
          switch (mode) {
            case Mode.NUMERIC:
              return Math.floor(usableBits / 10 * 3);
            case Mode.ALPHANUMERIC:
              return Math.floor(usableBits / 11 * 2);
            case Mode.KANJI:
              return Math.floor(usableBits / 13);
            case Mode.BYTE:
            default:
              return Math.floor(usableBits / 8);
          }
        };
        exports3.getBestVersionForData = function getBestVersionForData(data, errorCorrectionLevel) {
          var seg;
          var ecl = ECLevel.from(errorCorrectionLevel, ECLevel.M);
          if (isArray(data)) {
            if (data.length > 1) {
              return getBestVersionForMixedData(data, ecl);
            }
            if (data.length === 0) {
              return 1;
            }
            seg = data[0];
          } else {
            seg = data;
          }
          return getBestVersionForDataLength(seg.mode, seg.getLength(), ecl);
        };
        exports3.getEncodedBits = function getEncodedBits(version) {
          if (!VersionCheck.isValid(version) || version < 7) {
            throw new Error("Invalid QR Code version");
          }
          var d2 = version << 12;
          while (Utils.getBCHDigit(d2) - G18_BCH >= 0) {
            d2 ^= G18 << Utils.getBCHDigit(d2) - G18_BCH;
          }
          return version << 12 | d2;
        };
      }, { "./error-correction-code": 7, "./error-correction-level": 8, "./mode": 14, "./utils": 21, "./version-check": 22, "isarray": 33 }], 24: [function(require2, module3, exports3) {
        var canPromise = require2("./can-promise");
        var QRCode2 = require2("./core/qrcode");
        var CanvasRenderer = require2("./renderer/canvas");
        var SvgRenderer = require2("./renderer/svg-tag.js");
        function renderCanvas(renderFunc, canvas, text, opts, cb) {
          var args = [].slice.call(arguments, 1);
          var argsNum = args.length;
          var isLastArgCb = typeof args[argsNum - 1] === "function";
          if (!isLastArgCb && !canPromise()) {
            throw new Error("Callback required as last argument");
          }
          if (isLastArgCb) {
            if (argsNum < 2) {
              throw new Error("Too few arguments provided");
            }
            if (argsNum === 2) {
              cb = text;
              text = canvas;
              canvas = opts = void 0;
            } else if (argsNum === 3) {
              if (canvas.getContext && typeof cb === "undefined") {
                cb = opts;
                opts = void 0;
              } else {
                cb = opts;
                opts = text;
                text = canvas;
                canvas = void 0;
              }
            }
          } else {
            if (argsNum < 1) {
              throw new Error("Too few arguments provided");
            }
            if (argsNum === 1) {
              text = canvas;
              canvas = opts = void 0;
            } else if (argsNum === 2 && !canvas.getContext) {
              opts = text;
              text = canvas;
              canvas = void 0;
            }
            return new Promise(function(resolve, reject) {
              try {
                var data2 = QRCode2.create(text, opts);
                resolve(renderFunc(data2, canvas, opts));
              } catch (e4) {
                reject(e4);
              }
            });
          }
          try {
            var data = QRCode2.create(text, opts);
            cb(null, renderFunc(data, canvas, opts));
          } catch (e4) {
            cb(e4);
          }
        }
        exports3.create = QRCode2.create;
        exports3.toCanvas = renderCanvas.bind(null, CanvasRenderer.render);
        exports3.toDataURL = renderCanvas.bind(null, CanvasRenderer.renderToDataURL);
        exports3.toString = renderCanvas.bind(null, function(data, _2, opts) {
          return SvgRenderer.render(data, opts);
        });
      }, { "./can-promise": 1, "./core/qrcode": 17, "./renderer/canvas": 25, "./renderer/svg-tag.js": 26 }], 25: [function(require2, module3, exports3) {
        var Utils = require2("./utils");
        function clearCanvas(ctx, canvas, size) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          if (!canvas.style)
            canvas.style = {};
          canvas.height = size;
          canvas.width = size;
          canvas.style.height = size + "px";
          canvas.style.width = size + "px";
        }
        function getCanvasElement() {
          try {
            return document.createElement("canvas");
          } catch (e4) {
            throw new Error("You need to specify a canvas element");
          }
        }
        exports3.render = function render(qrData, canvas, options) {
          var opts = options;
          var canvasEl = canvas;
          if (typeof opts === "undefined" && (!canvas || !canvas.getContext)) {
            opts = canvas;
            canvas = void 0;
          }
          if (!canvas) {
            canvasEl = getCanvasElement();
          }
          opts = Utils.getOptions(opts);
          var size = Utils.getImageWidth(qrData.modules.size, opts);
          var ctx = canvasEl.getContext("2d");
          var image = ctx.createImageData(size, size);
          Utils.qrToImageData(image.data, qrData, opts);
          clearCanvas(ctx, canvasEl, size);
          ctx.putImageData(image, 0, 0);
          return canvasEl;
        };
        exports3.renderToDataURL = function renderToDataURL(qrData, canvas, options) {
          var opts = options;
          if (typeof opts === "undefined" && (!canvas || !canvas.getContext)) {
            opts = canvas;
            canvas = void 0;
          }
          if (!opts)
            opts = {};
          var canvasEl = exports3.render(qrData, canvas, opts);
          var type = opts.type || "image/png";
          var rendererOpts = opts.rendererOpts || {};
          return canvasEl.toDataURL(type, rendererOpts.quality);
        };
      }, { "./utils": 27 }], 26: [function(require2, module3, exports3) {
        var Utils = require2("./utils");
        function getColorAttrib(color, attrib) {
          var alpha = color.a / 255;
          var str = attrib + '="' + color.hex + '"';
          return alpha < 1 ? str + " " + attrib + '-opacity="' + alpha.toFixed(2).slice(1) + '"' : str;
        }
        function svgCmd(cmd, x2, y2) {
          var str = cmd + x2;
          if (typeof y2 !== "undefined")
            str += " " + y2;
          return str;
        }
        function qrToPath(data, size, margin) {
          var path = "";
          var moveBy = 0;
          var newRow = false;
          var lineLength = 0;
          for (var i3 = 0; i3 < data.length; i3++) {
            var col = Math.floor(i3 % size);
            var row = Math.floor(i3 / size);
            if (!col && !newRow)
              newRow = true;
            if (data[i3]) {
              lineLength++;
              if (!(i3 > 0 && col > 0 && data[i3 - 1])) {
                path += newRow ? svgCmd("M", col + margin, 0.5 + row + margin) : svgCmd("m", moveBy, 0);
                moveBy = 0;
                newRow = false;
              }
              if (!(col + 1 < size && data[i3 + 1])) {
                path += svgCmd("h", lineLength);
                lineLength = 0;
              }
            } else {
              moveBy++;
            }
          }
          return path;
        }
        exports3.render = function render(qrData, options, cb) {
          var opts = Utils.getOptions(options);
          var size = qrData.modules.size;
          var data = qrData.modules.data;
          var qrcodesize = size + opts.margin * 2;
          var bg = !opts.color.light.a ? "" : "<path " + getColorAttrib(opts.color.light, "fill") + ' d="M0 0h' + qrcodesize + "v" + qrcodesize + 'H0z"/>';
          var path = "<path " + getColorAttrib(opts.color.dark, "stroke") + ' d="' + qrToPath(data, size, opts.margin) + '"/>';
          var viewBox = 'viewBox="0 0 ' + qrcodesize + " " + qrcodesize + '"';
          var width = !opts.width ? "" : 'width="' + opts.width + '" height="' + opts.width + '" ';
          var svgTag = '<svg xmlns="http://www.w3.org/2000/svg" ' + width + viewBox + ' shape-rendering="crispEdges">' + bg + path + "</svg>\n";
          if (typeof cb === "function") {
            cb(null, svgTag);
          }
          return svgTag;
        };
      }, { "./utils": 27 }], 27: [function(require2, module3, exports3) {
        function hex2rgba(hex) {
          if (typeof hex === "number") {
            hex = hex.toString();
          }
          if (typeof hex !== "string") {
            throw new Error("Color should be defined as hex string");
          }
          var hexCode = hex.slice().replace("#", "").split("");
          if (hexCode.length < 3 || hexCode.length === 5 || hexCode.length > 8) {
            throw new Error("Invalid hex color: " + hex);
          }
          if (hexCode.length === 3 || hexCode.length === 4) {
            hexCode = Array.prototype.concat.apply([], hexCode.map(function(c2) {
              return [c2, c2];
            }));
          }
          if (hexCode.length === 6)
            hexCode.push("F", "F");
          var hexValue = parseInt(hexCode.join(""), 16);
          return {
            r: hexValue >> 24 & 255,
            g: hexValue >> 16 & 255,
            b: hexValue >> 8 & 255,
            a: hexValue & 255,
            hex: "#" + hexCode.slice(0, 6).join("")
          };
        }
        exports3.getOptions = function getOptions(options) {
          if (!options)
            options = {};
          if (!options.color)
            options.color = {};
          var margin = typeof options.margin === "undefined" || options.margin === null || options.margin < 0 ? 4 : options.margin;
          var width = options.width && options.width >= 21 ? options.width : void 0;
          var scale = options.scale || 4;
          return {
            width,
            scale: width ? 4 : scale,
            margin,
            color: {
              dark: hex2rgba(options.color.dark || "#000000ff"),
              light: hex2rgba(options.color.light || "#ffffffff")
            },
            type: options.type,
            rendererOpts: options.rendererOpts || {}
          };
        };
        exports3.getScale = function getScale(qrSize, opts) {
          return opts.width && opts.width >= qrSize + opts.margin * 2 ? opts.width / (qrSize + opts.margin * 2) : opts.scale;
        };
        exports3.getImageWidth = function getImageWidth(qrSize, opts) {
          var scale = exports3.getScale(qrSize, opts);
          return Math.floor((qrSize + opts.margin * 2) * scale);
        };
        exports3.qrToImageData = function qrToImageData(imgData, qr, opts) {
          var size = qr.modules.size;
          var data = qr.modules.data;
          var scale = exports3.getScale(size, opts);
          var symbolSize = Math.floor((size + opts.margin * 2) * scale);
          var scaledMargin = opts.margin * scale;
          var palette = [opts.color.light, opts.color.dark];
          for (var i3 = 0; i3 < symbolSize; i3++) {
            for (var j = 0; j < symbolSize; j++) {
              var posDst = (i3 * symbolSize + j) * 4;
              var pxColor = opts.color.light;
              if (i3 >= scaledMargin && j >= scaledMargin && i3 < symbolSize - scaledMargin && j < symbolSize - scaledMargin) {
                var iSrc = Math.floor((i3 - scaledMargin) / scale);
                var jSrc = Math.floor((j - scaledMargin) / scale);
                pxColor = palette[data[iSrc * size + jSrc] ? 1 : 0];
              }
              imgData[posDst++] = pxColor.r;
              imgData[posDst++] = pxColor.g;
              imgData[posDst++] = pxColor.b;
              imgData[posDst] = pxColor.a;
            }
          }
        };
      }, {}], 28: [function(require2, module3, exports3) {
        "use strict";
        var isArray = require2("isarray");
        function typedArraySupport() {
          try {
            var arr = new Uint8Array(1);
            arr.__proto__ = { __proto__: Uint8Array.prototype, foo: function() {
              return 42;
            } };
            return arr.foo() === 42;
          } catch (e4) {
            return false;
          }
        }
        Buffer2.TYPED_ARRAY_SUPPORT = typedArraySupport();
        var K_MAX_LENGTH = Buffer2.TYPED_ARRAY_SUPPORT ? 2147483647 : 1073741823;
        function Buffer2(arg, offset, length) {
          if (!Buffer2.TYPED_ARRAY_SUPPORT && !(this instanceof Buffer2)) {
            return new Buffer2(arg, offset, length);
          }
          if (typeof arg === "number") {
            return allocUnsafe(this, arg);
          }
          return from(this, arg, offset, length);
        }
        if (Buffer2.TYPED_ARRAY_SUPPORT) {
          Buffer2.prototype.__proto__ = Uint8Array.prototype;
          Buffer2.__proto__ = Uint8Array;
          if (typeof Symbol !== "undefined" && Symbol.species && Buffer2[Symbol.species] === Buffer2) {
            Object.defineProperty(Buffer2, Symbol.species, {
              value: null,
              configurable: true,
              enumerable: false,
              writable: false
            });
          }
        }
        function checked(length) {
          if (length >= K_MAX_LENGTH) {
            throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x" + K_MAX_LENGTH.toString(16) + " bytes");
          }
          return length | 0;
        }
        function isnan(val) {
          return val !== val;
        }
        function createBuffer(that, length) {
          var buf;
          if (Buffer2.TYPED_ARRAY_SUPPORT) {
            buf = new Uint8Array(length);
            buf.__proto__ = Buffer2.prototype;
          } else {
            buf = that;
            if (buf === null) {
              buf = new Buffer2(length);
            }
            buf.length = length;
          }
          return buf;
        }
        function allocUnsafe(that, size) {
          var buf = createBuffer(that, size < 0 ? 0 : checked(size) | 0);
          if (!Buffer2.TYPED_ARRAY_SUPPORT) {
            for (var i3 = 0; i3 < size; ++i3) {
              buf[i3] = 0;
            }
          }
          return buf;
        }
        function fromString(that, string) {
          var length = byteLength(string) | 0;
          var buf = createBuffer(that, length);
          var actual = buf.write(string);
          if (actual !== length) {
            buf = buf.slice(0, actual);
          }
          return buf;
        }
        function fromArrayLike(that, array) {
          var length = array.length < 0 ? 0 : checked(array.length) | 0;
          var buf = createBuffer(that, length);
          for (var i3 = 0; i3 < length; i3 += 1) {
            buf[i3] = array[i3] & 255;
          }
          return buf;
        }
        function fromArrayBuffer(that, array, byteOffset, length) {
          if (byteOffset < 0 || array.byteLength < byteOffset) {
            throw new RangeError("'offset' is out of bounds");
          }
          if (array.byteLength < byteOffset + (length || 0)) {
            throw new RangeError("'length' is out of bounds");
          }
          var buf;
          if (byteOffset === void 0 && length === void 0) {
            buf = new Uint8Array(array);
          } else if (length === void 0) {
            buf = new Uint8Array(array, byteOffset);
          } else {
            buf = new Uint8Array(array, byteOffset, length);
          }
          if (Buffer2.TYPED_ARRAY_SUPPORT) {
            buf.__proto__ = Buffer2.prototype;
          } else {
            buf = fromArrayLike(that, buf);
          }
          return buf;
        }
        function fromObject(that, obj) {
          if (Buffer2.isBuffer(obj)) {
            var len = checked(obj.length) | 0;
            var buf = createBuffer(that, len);
            if (buf.length === 0) {
              return buf;
            }
            obj.copy(buf, 0, 0, len);
            return buf;
          }
          if (obj) {
            if (typeof ArrayBuffer !== "undefined" && obj.buffer instanceof ArrayBuffer || "length" in obj) {
              if (typeof obj.length !== "number" || isnan(obj.length)) {
                return createBuffer(that, 0);
              }
              return fromArrayLike(that, obj);
            }
            if (obj.type === "Buffer" && Array.isArray(obj.data)) {
              return fromArrayLike(that, obj.data);
            }
          }
          throw new TypeError("First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.");
        }
        function utf8ToBytes(string, units) {
          units = units || Infinity;
          var codePoint;
          var length = string.length;
          var leadSurrogate = null;
          var bytes = [];
          for (var i3 = 0; i3 < length; ++i3) {
            codePoint = string.charCodeAt(i3);
            if (codePoint > 55295 && codePoint < 57344) {
              if (!leadSurrogate) {
                if (codePoint > 56319) {
                  if ((units -= 3) > -1)
                    bytes.push(239, 191, 189);
                  continue;
                } else if (i3 + 1 === length) {
                  if ((units -= 3) > -1)
                    bytes.push(239, 191, 189);
                  continue;
                }
                leadSurrogate = codePoint;
                continue;
              }
              if (codePoint < 56320) {
                if ((units -= 3) > -1)
                  bytes.push(239, 191, 189);
                leadSurrogate = codePoint;
                continue;
              }
              codePoint = (leadSurrogate - 55296 << 10 | codePoint - 56320) + 65536;
            } else if (leadSurrogate) {
              if ((units -= 3) > -1)
                bytes.push(239, 191, 189);
            }
            leadSurrogate = null;
            if (codePoint < 128) {
              if ((units -= 1) < 0)
                break;
              bytes.push(codePoint);
            } else if (codePoint < 2048) {
              if ((units -= 2) < 0)
                break;
              bytes.push(codePoint >> 6 | 192, codePoint & 63 | 128);
            } else if (codePoint < 65536) {
              if ((units -= 3) < 0)
                break;
              bytes.push(codePoint >> 12 | 224, codePoint >> 6 & 63 | 128, codePoint & 63 | 128);
            } else if (codePoint < 1114112) {
              if ((units -= 4) < 0)
                break;
              bytes.push(codePoint >> 18 | 240, codePoint >> 12 & 63 | 128, codePoint >> 6 & 63 | 128, codePoint & 63 | 128);
            } else {
              throw new Error("Invalid code point");
            }
          }
          return bytes;
        }
        function byteLength(string) {
          if (Buffer2.isBuffer(string)) {
            return string.length;
          }
          if (typeof ArrayBuffer !== "undefined" && typeof ArrayBuffer.isView === "function" && (ArrayBuffer.isView(string) || string instanceof ArrayBuffer)) {
            return string.byteLength;
          }
          if (typeof string !== "string") {
            string = "" + string;
          }
          var len = string.length;
          if (len === 0)
            return 0;
          return utf8ToBytes(string).length;
        }
        function blitBuffer(src, dst, offset, length) {
          for (var i3 = 0; i3 < length; ++i3) {
            if (i3 + offset >= dst.length || i3 >= src.length)
              break;
            dst[i3 + offset] = src[i3];
          }
          return i3;
        }
        function utf8Write(buf, string, offset, length) {
          return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length);
        }
        function from(that, value, offset, length) {
          if (typeof value === "number") {
            throw new TypeError('"value" argument must not be a number');
          }
          if (typeof ArrayBuffer !== "undefined" && value instanceof ArrayBuffer) {
            return fromArrayBuffer(that, value, offset, length);
          }
          if (typeof value === "string") {
            return fromString(that, value, offset);
          }
          return fromObject(that, value);
        }
        Buffer2.prototype.write = function write(string, offset, length) {
          if (offset === void 0) {
            length = this.length;
            offset = 0;
          } else if (length === void 0 && typeof offset === "string") {
            length = this.length;
            offset = 0;
          } else if (isFinite(offset)) {
            offset = offset | 0;
            if (isFinite(length)) {
              length = length | 0;
            } else {
              length = void 0;
            }
          }
          var remaining = this.length - offset;
          if (length === void 0 || length > remaining)
            length = remaining;
          if (string.length > 0 && (length < 0 || offset < 0) || offset > this.length) {
            throw new RangeError("Attempt to write outside buffer bounds");
          }
          return utf8Write(this, string, offset, length);
        };
        Buffer2.prototype.slice = function slice(start, end) {
          var len = this.length;
          start = ~~start;
          end = end === void 0 ? len : ~~end;
          if (start < 0) {
            start += len;
            if (start < 0)
              start = 0;
          } else if (start > len) {
            start = len;
          }
          if (end < 0) {
            end += len;
            if (end < 0)
              end = 0;
          } else if (end > len) {
            end = len;
          }
          if (end < start)
            end = start;
          var newBuf;
          if (Buffer2.TYPED_ARRAY_SUPPORT) {
            newBuf = this.subarray(start, end);
            newBuf.__proto__ = Buffer2.prototype;
          } else {
            var sliceLen = end - start;
            newBuf = new Buffer2(sliceLen, void 0);
            for (var i3 = 0; i3 < sliceLen; ++i3) {
              newBuf[i3] = this[i3 + start];
            }
          }
          return newBuf;
        };
        Buffer2.prototype.copy = function copy(target, targetStart, start, end) {
          if (!start)
            start = 0;
          if (!end && end !== 0)
            end = this.length;
          if (targetStart >= target.length)
            targetStart = target.length;
          if (!targetStart)
            targetStart = 0;
          if (end > 0 && end < start)
            end = start;
          if (end === start)
            return 0;
          if (target.length === 0 || this.length === 0)
            return 0;
          if (targetStart < 0) {
            throw new RangeError("targetStart out of bounds");
          }
          if (start < 0 || start >= this.length)
            throw new RangeError("sourceStart out of bounds");
          if (end < 0)
            throw new RangeError("sourceEnd out of bounds");
          if (end > this.length)
            end = this.length;
          if (target.length - targetStart < end - start) {
            end = target.length - targetStart + start;
          }
          var len = end - start;
          var i3;
          if (this === target && start < targetStart && targetStart < end) {
            for (i3 = len - 1; i3 >= 0; --i3) {
              target[i3 + targetStart] = this[i3 + start];
            }
          } else if (len < 1e3 || !Buffer2.TYPED_ARRAY_SUPPORT) {
            for (i3 = 0; i3 < len; ++i3) {
              target[i3 + targetStart] = this[i3 + start];
            }
          } else {
            Uint8Array.prototype.set.call(target, this.subarray(start, start + len), targetStart);
          }
          return len;
        };
        Buffer2.prototype.fill = function fill(val, start, end) {
          if (typeof val === "string") {
            if (typeof start === "string") {
              start = 0;
              end = this.length;
            } else if (typeof end === "string") {
              end = this.length;
            }
            if (val.length === 1) {
              var code = val.charCodeAt(0);
              if (code < 256) {
                val = code;
              }
            }
          } else if (typeof val === "number") {
            val = val & 255;
          }
          if (start < 0 || this.length < start || this.length < end) {
            throw new RangeError("Out of range index");
          }
          if (end <= start) {
            return this;
          }
          start = start >>> 0;
          end = end === void 0 ? this.length : end >>> 0;
          if (!val)
            val = 0;
          var i3;
          if (typeof val === "number") {
            for (i3 = start; i3 < end; ++i3) {
              this[i3] = val;
            }
          } else {
            var bytes = Buffer2.isBuffer(val) ? val : new Buffer2(val);
            var len = bytes.length;
            for (i3 = 0; i3 < end - start; ++i3) {
              this[i3 + start] = bytes[i3 % len];
            }
          }
          return this;
        };
        Buffer2.concat = function concat(list, length) {
          if (!isArray(list)) {
            throw new TypeError('"list" argument must be an Array of Buffers');
          }
          if (list.length === 0) {
            return createBuffer(null, 0);
          }
          var i3;
          if (length === void 0) {
            length = 0;
            for (i3 = 0; i3 < list.length; ++i3) {
              length += list[i3].length;
            }
          }
          var buffer = allocUnsafe(null, length);
          var pos = 0;
          for (i3 = 0; i3 < list.length; ++i3) {
            var buf = list[i3];
            if (!Buffer2.isBuffer(buf)) {
              throw new TypeError('"list" argument must be an Array of Buffers');
            }
            buf.copy(buffer, pos);
            pos += buf.length;
          }
          return buffer;
        };
        Buffer2.byteLength = byteLength;
        Buffer2.prototype._isBuffer = true;
        Buffer2.isBuffer = function isBuffer(b2) {
          return !!(b2 != null && b2._isBuffer);
        };
        module3.exports.alloc = function(size) {
          var buffer = new Buffer2(size);
          buffer.fill(0);
          return buffer;
        };
        module3.exports.from = function(data) {
          return new Buffer2(data);
        };
      }, { "isarray": 33 }], 29: [function(require2, module3, exports3) {
        "use strict";
        exports3.byteLength = byteLength;
        exports3.toByteArray = toByteArray;
        exports3.fromByteArray = fromByteArray;
        var lookup = [];
        var revLookup = [];
        var Arr = typeof Uint8Array !== "undefined" ? Uint8Array : Array;
        var code = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
        for (var i3 = 0, len = code.length; i3 < len; ++i3) {
          lookup[i3] = code[i3];
          revLookup[code.charCodeAt(i3)] = i3;
        }
        revLookup["-".charCodeAt(0)] = 62;
        revLookup["_".charCodeAt(0)] = 63;
        function getLens(b64) {
          var len2 = b64.length;
          if (len2 % 4 > 0) {
            throw new Error("Invalid string. Length must be a multiple of 4");
          }
          var validLen = b64.indexOf("=");
          if (validLen === -1)
            validLen = len2;
          var placeHoldersLen = validLen === len2 ? 0 : 4 - validLen % 4;
          return [validLen, placeHoldersLen];
        }
        function byteLength(b64) {
          var lens = getLens(b64);
          var validLen = lens[0];
          var placeHoldersLen = lens[1];
          return (validLen + placeHoldersLen) * 3 / 4 - placeHoldersLen;
        }
        function _byteLength(b64, validLen, placeHoldersLen) {
          return (validLen + placeHoldersLen) * 3 / 4 - placeHoldersLen;
        }
        function toByteArray(b64) {
          var tmp;
          var lens = getLens(b64);
          var validLen = lens[0];
          var placeHoldersLen = lens[1];
          var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen));
          var curByte = 0;
          var len2 = placeHoldersLen > 0 ? validLen - 4 : validLen;
          var i4;
          for (i4 = 0; i4 < len2; i4 += 4) {
            tmp = revLookup[b64.charCodeAt(i4)] << 18 | revLookup[b64.charCodeAt(i4 + 1)] << 12 | revLookup[b64.charCodeAt(i4 + 2)] << 6 | revLookup[b64.charCodeAt(i4 + 3)];
            arr[curByte++] = tmp >> 16 & 255;
            arr[curByte++] = tmp >> 8 & 255;
            arr[curByte++] = tmp & 255;
          }
          if (placeHoldersLen === 2) {
            tmp = revLookup[b64.charCodeAt(i4)] << 2 | revLookup[b64.charCodeAt(i4 + 1)] >> 4;
            arr[curByte++] = tmp & 255;
          }
          if (placeHoldersLen === 1) {
            tmp = revLookup[b64.charCodeAt(i4)] << 10 | revLookup[b64.charCodeAt(i4 + 1)] << 4 | revLookup[b64.charCodeAt(i4 + 2)] >> 2;
            arr[curByte++] = tmp >> 8 & 255;
            arr[curByte++] = tmp & 255;
          }
          return arr;
        }
        function tripletToBase64(num) {
          return lookup[num >> 18 & 63] + lookup[num >> 12 & 63] + lookup[num >> 6 & 63] + lookup[num & 63];
        }
        function encodeChunk(uint8, start, end) {
          var tmp;
          var output = [];
          for (var i4 = start; i4 < end; i4 += 3) {
            tmp = (uint8[i4] << 16 & 16711680) + (uint8[i4 + 1] << 8 & 65280) + (uint8[i4 + 2] & 255);
            output.push(tripletToBase64(tmp));
          }
          return output.join("");
        }
        function fromByteArray(uint8) {
          var tmp;
          var len2 = uint8.length;
          var extraBytes = len2 % 3;
          var parts = [];
          var maxChunkLength = 16383;
          for (var i4 = 0, len22 = len2 - extraBytes; i4 < len22; i4 += maxChunkLength) {
            parts.push(encodeChunk(uint8, i4, i4 + maxChunkLength > len22 ? len22 : i4 + maxChunkLength));
          }
          if (extraBytes === 1) {
            tmp = uint8[len2 - 1];
            parts.push(lookup[tmp >> 2] + lookup[tmp << 4 & 63] + "==");
          } else if (extraBytes === 2) {
            tmp = (uint8[len2 - 2] << 8) + uint8[len2 - 1];
            parts.push(lookup[tmp >> 10] + lookup[tmp >> 4 & 63] + lookup[tmp << 2 & 63] + "=");
          }
          return parts.join("");
        }
      }, {}], 30: [function(require2, module3, exports3) {
        "use strict";
        var base64 = require2("base64-js");
        var ieee754 = require2("ieee754");
        var customInspectSymbol = typeof Symbol === "function" && typeof Symbol.for === "function" ? Symbol.for("nodejs.util.inspect.custom") : null;
        exports3.Buffer = Buffer2;
        exports3.SlowBuffer = SlowBuffer;
        exports3.INSPECT_MAX_BYTES = 50;
        var K_MAX_LENGTH = 2147483647;
        exports3.kMaxLength = K_MAX_LENGTH;
        Buffer2.TYPED_ARRAY_SUPPORT = typedArraySupport();
        if (!Buffer2.TYPED_ARRAY_SUPPORT && typeof console !== "undefined" && typeof console.error === "function") {
          console.error("This browser lacks typed array (Uint8Array) support which is required by `buffer` v5.x. Use `buffer` v4.x if you require old browser support.");
        }
        function typedArraySupport() {
          try {
            var arr = new Uint8Array(1);
            var proto = { foo: function() {
              return 42;
            } };
            Object.setPrototypeOf(proto, Uint8Array.prototype);
            Object.setPrototypeOf(arr, proto);
            return arr.foo() === 42;
          } catch (e4) {
            return false;
          }
        }
        Object.defineProperty(Buffer2.prototype, "parent", {
          enumerable: true,
          get: function() {
            if (!Buffer2.isBuffer(this))
              return void 0;
            return this.buffer;
          }
        });
        Object.defineProperty(Buffer2.prototype, "offset", {
          enumerable: true,
          get: function() {
            if (!Buffer2.isBuffer(this))
              return void 0;
            return this.byteOffset;
          }
        });
        function createBuffer(length) {
          if (length > K_MAX_LENGTH) {
            throw new RangeError('The value "' + length + '" is invalid for option "size"');
          }
          var buf = new Uint8Array(length);
          Object.setPrototypeOf(buf, Buffer2.prototype);
          return buf;
        }
        function Buffer2(arg, encodingOrOffset, length) {
          if (typeof arg === "number") {
            if (typeof encodingOrOffset === "string") {
              throw new TypeError('The "string" argument must be of type string. Received type number');
            }
            return allocUnsafe(arg);
          }
          return from(arg, encodingOrOffset, length);
        }
        if (typeof Symbol !== "undefined" && Symbol.species != null && Buffer2[Symbol.species] === Buffer2) {
          Object.defineProperty(Buffer2, Symbol.species, {
            value: null,
            configurable: true,
            enumerable: false,
            writable: false
          });
        }
        Buffer2.poolSize = 8192;
        function from(value, encodingOrOffset, length) {
          if (typeof value === "string") {
            return fromString(value, encodingOrOffset);
          }
          if (ArrayBuffer.isView(value)) {
            return fromArrayLike(value);
          }
          if (value == null) {
            throw new TypeError("The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " + typeof value);
          }
          if (isInstance(value, ArrayBuffer) || value && isInstance(value.buffer, ArrayBuffer)) {
            return fromArrayBuffer(value, encodingOrOffset, length);
          }
          if (typeof value === "number") {
            throw new TypeError('The "value" argument must not be of type number. Received type number');
          }
          var valueOf = value.valueOf && value.valueOf();
          if (valueOf != null && valueOf !== value) {
            return Buffer2.from(valueOf, encodingOrOffset, length);
          }
          var b2 = fromObject(value);
          if (b2)
            return b2;
          if (typeof Symbol !== "undefined" && Symbol.toPrimitive != null && typeof value[Symbol.toPrimitive] === "function") {
            return Buffer2.from(value[Symbol.toPrimitive]("string"), encodingOrOffset, length);
          }
          throw new TypeError("The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " + typeof value);
        }
        Buffer2.from = function(value, encodingOrOffset, length) {
          return from(value, encodingOrOffset, length);
        };
        Object.setPrototypeOf(Buffer2.prototype, Uint8Array.prototype);
        Object.setPrototypeOf(Buffer2, Uint8Array);
        function assertSize(size) {
          if (typeof size !== "number") {
            throw new TypeError('"size" argument must be of type number');
          } else if (size < 0) {
            throw new RangeError('The value "' + size + '" is invalid for option "size"');
          }
        }
        function alloc(size, fill, encoding) {
          assertSize(size);
          if (size <= 0) {
            return createBuffer(size);
          }
          if (fill !== void 0) {
            return typeof encoding === "string" ? createBuffer(size).fill(fill, encoding) : createBuffer(size).fill(fill);
          }
          return createBuffer(size);
        }
        Buffer2.alloc = function(size, fill, encoding) {
          return alloc(size, fill, encoding);
        };
        function allocUnsafe(size) {
          assertSize(size);
          return createBuffer(size < 0 ? 0 : checked(size) | 0);
        }
        Buffer2.allocUnsafe = function(size) {
          return allocUnsafe(size);
        };
        Buffer2.allocUnsafeSlow = function(size) {
          return allocUnsafe(size);
        };
        function fromString(string, encoding) {
          if (typeof encoding !== "string" || encoding === "") {
            encoding = "utf8";
          }
          if (!Buffer2.isEncoding(encoding)) {
            throw new TypeError("Unknown encoding: " + encoding);
          }
          var length = byteLength(string, encoding) | 0;
          var buf = createBuffer(length);
          var actual = buf.write(string, encoding);
          if (actual !== length) {
            buf = buf.slice(0, actual);
          }
          return buf;
        }
        function fromArrayLike(array) {
          var length = array.length < 0 ? 0 : checked(array.length) | 0;
          var buf = createBuffer(length);
          for (var i3 = 0; i3 < length; i3 += 1) {
            buf[i3] = array[i3] & 255;
          }
          return buf;
        }
        function fromArrayBuffer(array, byteOffset, length) {
          if (byteOffset < 0 || array.byteLength < byteOffset) {
            throw new RangeError('"offset" is outside of buffer bounds');
          }
          if (array.byteLength < byteOffset + (length || 0)) {
            throw new RangeError('"length" is outside of buffer bounds');
          }
          var buf;
          if (byteOffset === void 0 && length === void 0) {
            buf = new Uint8Array(array);
          } else if (length === void 0) {
            buf = new Uint8Array(array, byteOffset);
          } else {
            buf = new Uint8Array(array, byteOffset, length);
          }
          Object.setPrototypeOf(buf, Buffer2.prototype);
          return buf;
        }
        function fromObject(obj) {
          if (Buffer2.isBuffer(obj)) {
            var len = checked(obj.length) | 0;
            var buf = createBuffer(len);
            if (buf.length === 0) {
              return buf;
            }
            obj.copy(buf, 0, 0, len);
            return buf;
          }
          if (obj.length !== void 0) {
            if (typeof obj.length !== "number" || numberIsNaN(obj.length)) {
              return createBuffer(0);
            }
            return fromArrayLike(obj);
          }
          if (obj.type === "Buffer" && Array.isArray(obj.data)) {
            return fromArrayLike(obj.data);
          }
        }
        function checked(length) {
          if (length >= K_MAX_LENGTH) {
            throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x" + K_MAX_LENGTH.toString(16) + " bytes");
          }
          return length | 0;
        }
        function SlowBuffer(length) {
          if (+length != length) {
            length = 0;
          }
          return Buffer2.alloc(+length);
        }
        Buffer2.isBuffer = function isBuffer(b2) {
          return b2 != null && b2._isBuffer === true && b2 !== Buffer2.prototype;
        };
        Buffer2.compare = function compare(a2, b2) {
          if (isInstance(a2, Uint8Array))
            a2 = Buffer2.from(a2, a2.offset, a2.byteLength);
          if (isInstance(b2, Uint8Array))
            b2 = Buffer2.from(b2, b2.offset, b2.byteLength);
          if (!Buffer2.isBuffer(a2) || !Buffer2.isBuffer(b2)) {
            throw new TypeError('The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array');
          }
          if (a2 === b2)
            return 0;
          var x2 = a2.length;
          var y2 = b2.length;
          for (var i3 = 0, len = Math.min(x2, y2); i3 < len; ++i3) {
            if (a2[i3] !== b2[i3]) {
              x2 = a2[i3];
              y2 = b2[i3];
              break;
            }
          }
          if (x2 < y2)
            return -1;
          if (y2 < x2)
            return 1;
          return 0;
        };
        Buffer2.isEncoding = function isEncoding(encoding) {
          switch (String(encoding).toLowerCase()) {
            case "hex":
            case "utf8":
            case "utf-8":
            case "ascii":
            case "latin1":
            case "binary":
            case "base64":
            case "ucs2":
            case "ucs-2":
            case "utf16le":
            case "utf-16le":
              return true;
            default:
              return false;
          }
        };
        Buffer2.concat = function concat(list, length) {
          if (!Array.isArray(list)) {
            throw new TypeError('"list" argument must be an Array of Buffers');
          }
          if (list.length === 0) {
            return Buffer2.alloc(0);
          }
          var i3;
          if (length === void 0) {
            length = 0;
            for (i3 = 0; i3 < list.length; ++i3) {
              length += list[i3].length;
            }
          }
          var buffer = Buffer2.allocUnsafe(length);
          var pos = 0;
          for (i3 = 0; i3 < list.length; ++i3) {
            var buf = list[i3];
            if (isInstance(buf, Uint8Array)) {
              buf = Buffer2.from(buf);
            }
            if (!Buffer2.isBuffer(buf)) {
              throw new TypeError('"list" argument must be an Array of Buffers');
            }
            buf.copy(buffer, pos);
            pos += buf.length;
          }
          return buffer;
        };
        function byteLength(string, encoding) {
          if (Buffer2.isBuffer(string)) {
            return string.length;
          }
          if (ArrayBuffer.isView(string) || isInstance(string, ArrayBuffer)) {
            return string.byteLength;
          }
          if (typeof string !== "string") {
            throw new TypeError('The "string" argument must be one of type string, Buffer, or ArrayBuffer. Received type ' + typeof string);
          }
          var len = string.length;
          var mustMatch = arguments.length > 2 && arguments[2] === true;
          if (!mustMatch && len === 0)
            return 0;
          var loweredCase = false;
          for (; ; ) {
            switch (encoding) {
              case "ascii":
              case "latin1":
              case "binary":
                return len;
              case "utf8":
              case "utf-8":
                return utf8ToBytes(string).length;
              case "ucs2":
              case "ucs-2":
              case "utf16le":
              case "utf-16le":
                return len * 2;
              case "hex":
                return len >>> 1;
              case "base64":
                return base64ToBytes(string).length;
              default:
                if (loweredCase) {
                  return mustMatch ? -1 : utf8ToBytes(string).length;
                }
                encoding = ("" + encoding).toLowerCase();
                loweredCase = true;
            }
          }
        }
        Buffer2.byteLength = byteLength;
        function slowToString(encoding, start, end) {
          var loweredCase = false;
          if (start === void 0 || start < 0) {
            start = 0;
          }
          if (start > this.length) {
            return "";
          }
          if (end === void 0 || end > this.length) {
            end = this.length;
          }
          if (end <= 0) {
            return "";
          }
          end >>>= 0;
          start >>>= 0;
          if (end <= start) {
            return "";
          }
          if (!encoding)
            encoding = "utf8";
          while (true) {
            switch (encoding) {
              case "hex":
                return hexSlice(this, start, end);
              case "utf8":
              case "utf-8":
                return utf8Slice(this, start, end);
              case "ascii":
                return asciiSlice(this, start, end);
              case "latin1":
              case "binary":
                return latin1Slice(this, start, end);
              case "base64":
                return base64Slice(this, start, end);
              case "ucs2":
              case "ucs-2":
              case "utf16le":
              case "utf-16le":
                return utf16leSlice(this, start, end);
              default:
                if (loweredCase)
                  throw new TypeError("Unknown encoding: " + encoding);
                encoding = (encoding + "").toLowerCase();
                loweredCase = true;
            }
          }
        }
        Buffer2.prototype._isBuffer = true;
        function swap(b2, n5, m2) {
          var i3 = b2[n5];
          b2[n5] = b2[m2];
          b2[m2] = i3;
        }
        Buffer2.prototype.swap16 = function swap16() {
          var len = this.length;
          if (len % 2 !== 0) {
            throw new RangeError("Buffer size must be a multiple of 16-bits");
          }
          for (var i3 = 0; i3 < len; i3 += 2) {
            swap(this, i3, i3 + 1);
          }
          return this;
        };
        Buffer2.prototype.swap32 = function swap32() {
          var len = this.length;
          if (len % 4 !== 0) {
            throw new RangeError("Buffer size must be a multiple of 32-bits");
          }
          for (var i3 = 0; i3 < len; i3 += 4) {
            swap(this, i3, i3 + 3);
            swap(this, i3 + 1, i3 + 2);
          }
          return this;
        };
        Buffer2.prototype.swap64 = function swap64() {
          var len = this.length;
          if (len % 8 !== 0) {
            throw new RangeError("Buffer size must be a multiple of 64-bits");
          }
          for (var i3 = 0; i3 < len; i3 += 8) {
            swap(this, i3, i3 + 7);
            swap(this, i3 + 1, i3 + 6);
            swap(this, i3 + 2, i3 + 5);
            swap(this, i3 + 3, i3 + 4);
          }
          return this;
        };
        Buffer2.prototype.toString = function toString() {
          var length = this.length;
          if (length === 0)
            return "";
          if (arguments.length === 0)
            return utf8Slice(this, 0, length);
          return slowToString.apply(this, arguments);
        };
        Buffer2.prototype.toLocaleString = Buffer2.prototype.toString;
        Buffer2.prototype.equals = function equals(b2) {
          if (!Buffer2.isBuffer(b2))
            throw new TypeError("Argument must be a Buffer");
          if (this === b2)
            return true;
          return Buffer2.compare(this, b2) === 0;
        };
        Buffer2.prototype.inspect = function inspect() {
          var str = "";
          var max = exports3.INSPECT_MAX_BYTES;
          str = this.toString("hex", 0, max).replace(/(.{2})/g, "$1 ").trim();
          if (this.length > max)
            str += " ... ";
          return "<Buffer " + str + ">";
        };
        if (customInspectSymbol) {
          Buffer2.prototype[customInspectSymbol] = Buffer2.prototype.inspect;
        }
        Buffer2.prototype.compare = function compare(target, start, end, thisStart, thisEnd) {
          if (isInstance(target, Uint8Array)) {
            target = Buffer2.from(target, target.offset, target.byteLength);
          }
          if (!Buffer2.isBuffer(target)) {
            throw new TypeError('The "target" argument must be one of type Buffer or Uint8Array. Received type ' + typeof target);
          }
          if (start === void 0) {
            start = 0;
          }
          if (end === void 0) {
            end = target ? target.length : 0;
          }
          if (thisStart === void 0) {
            thisStart = 0;
          }
          if (thisEnd === void 0) {
            thisEnd = this.length;
          }
          if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
            throw new RangeError("out of range index");
          }
          if (thisStart >= thisEnd && start >= end) {
            return 0;
          }
          if (thisStart >= thisEnd) {
            return -1;
          }
          if (start >= end) {
            return 1;
          }
          start >>>= 0;
          end >>>= 0;
          thisStart >>>= 0;
          thisEnd >>>= 0;
          if (this === target)
            return 0;
          var x2 = thisEnd - thisStart;
          var y2 = end - start;
          var len = Math.min(x2, y2);
          var thisCopy = this.slice(thisStart, thisEnd);
          var targetCopy = target.slice(start, end);
          for (var i3 = 0; i3 < len; ++i3) {
            if (thisCopy[i3] !== targetCopy[i3]) {
              x2 = thisCopy[i3];
              y2 = targetCopy[i3];
              break;
            }
          }
          if (x2 < y2)
            return -1;
          if (y2 < x2)
            return 1;
          return 0;
        };
        function bidirectionalIndexOf(buffer, val, byteOffset, encoding, dir) {
          if (buffer.length === 0)
            return -1;
          if (typeof byteOffset === "string") {
            encoding = byteOffset;
            byteOffset = 0;
          } else if (byteOffset > 2147483647) {
            byteOffset = 2147483647;
          } else if (byteOffset < -2147483648) {
            byteOffset = -2147483648;
          }
          byteOffset = +byteOffset;
          if (numberIsNaN(byteOffset)) {
            byteOffset = dir ? 0 : buffer.length - 1;
          }
          if (byteOffset < 0)
            byteOffset = buffer.length + byteOffset;
          if (byteOffset >= buffer.length) {
            if (dir)
              return -1;
            else
              byteOffset = buffer.length - 1;
          } else if (byteOffset < 0) {
            if (dir)
              byteOffset = 0;
            else
              return -1;
          }
          if (typeof val === "string") {
            val = Buffer2.from(val, encoding);
          }
          if (Buffer2.isBuffer(val)) {
            if (val.length === 0) {
              return -1;
            }
            return arrayIndexOf(buffer, val, byteOffset, encoding, dir);
          } else if (typeof val === "number") {
            val = val & 255;
            if (typeof Uint8Array.prototype.indexOf === "function") {
              if (dir) {
                return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset);
              } else {
                return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset);
              }
            }
            return arrayIndexOf(buffer, [val], byteOffset, encoding, dir);
          }
          throw new TypeError("val must be string, number or Buffer");
        }
        function arrayIndexOf(arr, val, byteOffset, encoding, dir) {
          var indexSize = 1;
          var arrLength = arr.length;
          var valLength = val.length;
          if (encoding !== void 0) {
            encoding = String(encoding).toLowerCase();
            if (encoding === "ucs2" || encoding === "ucs-2" || encoding === "utf16le" || encoding === "utf-16le") {
              if (arr.length < 2 || val.length < 2) {
                return -1;
              }
              indexSize = 2;
              arrLength /= 2;
              valLength /= 2;
              byteOffset /= 2;
            }
          }
          function read(buf, i4) {
            if (indexSize === 1) {
              return buf[i4];
            } else {
              return buf.readUInt16BE(i4 * indexSize);
            }
          }
          var i3;
          if (dir) {
            var foundIndex = -1;
            for (i3 = byteOffset; i3 < arrLength; i3++) {
              if (read(arr, i3) === read(val, foundIndex === -1 ? 0 : i3 - foundIndex)) {
                if (foundIndex === -1)
                  foundIndex = i3;
                if (i3 - foundIndex + 1 === valLength)
                  return foundIndex * indexSize;
              } else {
                if (foundIndex !== -1)
                  i3 -= i3 - foundIndex;
                foundIndex = -1;
              }
            }
          } else {
            if (byteOffset + valLength > arrLength)
              byteOffset = arrLength - valLength;
            for (i3 = byteOffset; i3 >= 0; i3--) {
              var found = true;
              for (var j = 0; j < valLength; j++) {
                if (read(arr, i3 + j) !== read(val, j)) {
                  found = false;
                  break;
                }
              }
              if (found)
                return i3;
            }
          }
          return -1;
        }
        Buffer2.prototype.includes = function includes(val, byteOffset, encoding) {
          return this.indexOf(val, byteOffset, encoding) !== -1;
        };
        Buffer2.prototype.indexOf = function indexOf(val, byteOffset, encoding) {
          return bidirectionalIndexOf(this, val, byteOffset, encoding, true);
        };
        Buffer2.prototype.lastIndexOf = function lastIndexOf(val, byteOffset, encoding) {
          return bidirectionalIndexOf(this, val, byteOffset, encoding, false);
        };
        function hexWrite(buf, string, offset, length) {
          offset = Number(offset) || 0;
          var remaining = buf.length - offset;
          if (!length) {
            length = remaining;
          } else {
            length = Number(length);
            if (length > remaining) {
              length = remaining;
            }
          }
          var strLen = string.length;
          if (length > strLen / 2) {
            length = strLen / 2;
          }
          for (var i3 = 0; i3 < length; ++i3) {
            var parsed = parseInt(string.substr(i3 * 2, 2), 16);
            if (numberIsNaN(parsed))
              return i3;
            buf[offset + i3] = parsed;
          }
          return i3;
        }
        function utf8Write(buf, string, offset, length) {
          return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length);
        }
        function asciiWrite(buf, string, offset, length) {
          return blitBuffer(asciiToBytes(string), buf, offset, length);
        }
        function latin1Write(buf, string, offset, length) {
          return asciiWrite(buf, string, offset, length);
        }
        function base64Write(buf, string, offset, length) {
          return blitBuffer(base64ToBytes(string), buf, offset, length);
        }
        function ucs2Write(buf, string, offset, length) {
          return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length);
        }
        Buffer2.prototype.write = function write(string, offset, length, encoding) {
          if (offset === void 0) {
            encoding = "utf8";
            length = this.length;
            offset = 0;
          } else if (length === void 0 && typeof offset === "string") {
            encoding = offset;
            length = this.length;
            offset = 0;
          } else if (isFinite(offset)) {
            offset = offset >>> 0;
            if (isFinite(length)) {
              length = length >>> 0;
              if (encoding === void 0)
                encoding = "utf8";
            } else {
              encoding = length;
              length = void 0;
            }
          } else {
            throw new Error("Buffer.write(string, encoding, offset[, length]) is no longer supported");
          }
          var remaining = this.length - offset;
          if (length === void 0 || length > remaining)
            length = remaining;
          if (string.length > 0 && (length < 0 || offset < 0) || offset > this.length) {
            throw new RangeError("Attempt to write outside buffer bounds");
          }
          if (!encoding)
            encoding = "utf8";
          var loweredCase = false;
          for (; ; ) {
            switch (encoding) {
              case "hex":
                return hexWrite(this, string, offset, length);
              case "utf8":
              case "utf-8":
                return utf8Write(this, string, offset, length);
              case "ascii":
                return asciiWrite(this, string, offset, length);
              case "latin1":
              case "binary":
                return latin1Write(this, string, offset, length);
              case "base64":
                return base64Write(this, string, offset, length);
              case "ucs2":
              case "ucs-2":
              case "utf16le":
              case "utf-16le":
                return ucs2Write(this, string, offset, length);
              default:
                if (loweredCase)
                  throw new TypeError("Unknown encoding: " + encoding);
                encoding = ("" + encoding).toLowerCase();
                loweredCase = true;
            }
          }
        };
        Buffer2.prototype.toJSON = function toJSON() {
          return {
            type: "Buffer",
            data: Array.prototype.slice.call(this._arr || this, 0)
          };
        };
        function base64Slice(buf, start, end) {
          if (start === 0 && end === buf.length) {
            return base64.fromByteArray(buf);
          } else {
            return base64.fromByteArray(buf.slice(start, end));
          }
        }
        function utf8Slice(buf, start, end) {
          end = Math.min(buf.length, end);
          var res = [];
          var i3 = start;
          while (i3 < end) {
            var firstByte = buf[i3];
            var codePoint = null;
            var bytesPerSequence = firstByte > 239 ? 4 : firstByte > 223 ? 3 : firstByte > 191 ? 2 : 1;
            if (i3 + bytesPerSequence <= end) {
              var secondByte, thirdByte, fourthByte, tempCodePoint;
              switch (bytesPerSequence) {
                case 1:
                  if (firstByte < 128) {
                    codePoint = firstByte;
                  }
                  break;
                case 2:
                  secondByte = buf[i3 + 1];
                  if ((secondByte & 192) === 128) {
                    tempCodePoint = (firstByte & 31) << 6 | secondByte & 63;
                    if (tempCodePoint > 127) {
                      codePoint = tempCodePoint;
                    }
                  }
                  break;
                case 3:
                  secondByte = buf[i3 + 1];
                  thirdByte = buf[i3 + 2];
                  if ((secondByte & 192) === 128 && (thirdByte & 192) === 128) {
                    tempCodePoint = (firstByte & 15) << 12 | (secondByte & 63) << 6 | thirdByte & 63;
                    if (tempCodePoint > 2047 && (tempCodePoint < 55296 || tempCodePoint > 57343)) {
                      codePoint = tempCodePoint;
                    }
                  }
                  break;
                case 4:
                  secondByte = buf[i3 + 1];
                  thirdByte = buf[i3 + 2];
                  fourthByte = buf[i3 + 3];
                  if ((secondByte & 192) === 128 && (thirdByte & 192) === 128 && (fourthByte & 192) === 128) {
                    tempCodePoint = (firstByte & 15) << 18 | (secondByte & 63) << 12 | (thirdByte & 63) << 6 | fourthByte & 63;
                    if (tempCodePoint > 65535 && tempCodePoint < 1114112) {
                      codePoint = tempCodePoint;
                    }
                  }
              }
            }
            if (codePoint === null) {
              codePoint = 65533;
              bytesPerSequence = 1;
            } else if (codePoint > 65535) {
              codePoint -= 65536;
              res.push(codePoint >>> 10 & 1023 | 55296);
              codePoint = 56320 | codePoint & 1023;
            }
            res.push(codePoint);
            i3 += bytesPerSequence;
          }
          return decodeCodePointsArray(res);
        }
        var MAX_ARGUMENTS_LENGTH = 4096;
        function decodeCodePointsArray(codePoints) {
          var len = codePoints.length;
          if (len <= MAX_ARGUMENTS_LENGTH) {
            return String.fromCharCode.apply(String, codePoints);
          }
          var res = "";
          var i3 = 0;
          while (i3 < len) {
            res += String.fromCharCode.apply(String, codePoints.slice(i3, i3 += MAX_ARGUMENTS_LENGTH));
          }
          return res;
        }
        function asciiSlice(buf, start, end) {
          var ret = "";
          end = Math.min(buf.length, end);
          for (var i3 = start; i3 < end; ++i3) {
            ret += String.fromCharCode(buf[i3] & 127);
          }
          return ret;
        }
        function latin1Slice(buf, start, end) {
          var ret = "";
          end = Math.min(buf.length, end);
          for (var i3 = start; i3 < end; ++i3) {
            ret += String.fromCharCode(buf[i3]);
          }
          return ret;
        }
        function hexSlice(buf, start, end) {
          var len = buf.length;
          if (!start || start < 0)
            start = 0;
          if (!end || end < 0 || end > len)
            end = len;
          var out = "";
          for (var i3 = start; i3 < end; ++i3) {
            out += hexSliceLookupTable[buf[i3]];
          }
          return out;
        }
        function utf16leSlice(buf, start, end) {
          var bytes = buf.slice(start, end);
          var res = "";
          for (var i3 = 0; i3 < bytes.length; i3 += 2) {
            res += String.fromCharCode(bytes[i3] + bytes[i3 + 1] * 256);
          }
          return res;
        }
        Buffer2.prototype.slice = function slice(start, end) {
          var len = this.length;
          start = ~~start;
          end = end === void 0 ? len : ~~end;
          if (start < 0) {
            start += len;
            if (start < 0)
              start = 0;
          } else if (start > len) {
            start = len;
          }
          if (end < 0) {
            end += len;
            if (end < 0)
              end = 0;
          } else if (end > len) {
            end = len;
          }
          if (end < start)
            end = start;
          var newBuf = this.subarray(start, end);
          Object.setPrototypeOf(newBuf, Buffer2.prototype);
          return newBuf;
        };
        function checkOffset(offset, ext, length) {
          if (offset % 1 !== 0 || offset < 0)
            throw new RangeError("offset is not uint");
          if (offset + ext > length)
            throw new RangeError("Trying to access beyond buffer length");
        }
        Buffer2.prototype.readUIntLE = function readUIntLE(offset, byteLength2, noAssert) {
          offset = offset >>> 0;
          byteLength2 = byteLength2 >>> 0;
          if (!noAssert)
            checkOffset(offset, byteLength2, this.length);
          var val = this[offset];
          var mul = 1;
          var i3 = 0;
          while (++i3 < byteLength2 && (mul *= 256)) {
            val += this[offset + i3] * mul;
          }
          return val;
        };
        Buffer2.prototype.readUIntBE = function readUIntBE(offset, byteLength2, noAssert) {
          offset = offset >>> 0;
          byteLength2 = byteLength2 >>> 0;
          if (!noAssert) {
            checkOffset(offset, byteLength2, this.length);
          }
          var val = this[offset + --byteLength2];
          var mul = 1;
          while (byteLength2 > 0 && (mul *= 256)) {
            val += this[offset + --byteLength2] * mul;
          }
          return val;
        };
        Buffer2.prototype.readUInt8 = function readUInt8(offset, noAssert) {
          offset = offset >>> 0;
          if (!noAssert)
            checkOffset(offset, 1, this.length);
          return this[offset];
        };
        Buffer2.prototype.readUInt16LE = function readUInt16LE(offset, noAssert) {
          offset = offset >>> 0;
          if (!noAssert)
            checkOffset(offset, 2, this.length);
          return this[offset] | this[offset + 1] << 8;
        };
        Buffer2.prototype.readUInt16BE = function readUInt16BE(offset, noAssert) {
          offset = offset >>> 0;
          if (!noAssert)
            checkOffset(offset, 2, this.length);
          return this[offset] << 8 | this[offset + 1];
        };
        Buffer2.prototype.readUInt32LE = function readUInt32LE(offset, noAssert) {
          offset = offset >>> 0;
          if (!noAssert)
            checkOffset(offset, 4, this.length);
          return (this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16) + this[offset + 3] * 16777216;
        };
        Buffer2.prototype.readUInt32BE = function readUInt32BE(offset, noAssert) {
          offset = offset >>> 0;
          if (!noAssert)
            checkOffset(offset, 4, this.length);
          return this[offset] * 16777216 + (this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3]);
        };
        Buffer2.prototype.readIntLE = function readIntLE(offset, byteLength2, noAssert) {
          offset = offset >>> 0;
          byteLength2 = byteLength2 >>> 0;
          if (!noAssert)
            checkOffset(offset, byteLength2, this.length);
          var val = this[offset];
          var mul = 1;
          var i3 = 0;
          while (++i3 < byteLength2 && (mul *= 256)) {
            val += this[offset + i3] * mul;
          }
          mul *= 128;
          if (val >= mul)
            val -= Math.pow(2, 8 * byteLength2);
          return val;
        };
        Buffer2.prototype.readIntBE = function readIntBE(offset, byteLength2, noAssert) {
          offset = offset >>> 0;
          byteLength2 = byteLength2 >>> 0;
          if (!noAssert)
            checkOffset(offset, byteLength2, this.length);
          var i3 = byteLength2;
          var mul = 1;
          var val = this[offset + --i3];
          while (i3 > 0 && (mul *= 256)) {
            val += this[offset + --i3] * mul;
          }
          mul *= 128;
          if (val >= mul)
            val -= Math.pow(2, 8 * byteLength2);
          return val;
        };
        Buffer2.prototype.readInt8 = function readInt8(offset, noAssert) {
          offset = offset >>> 0;
          if (!noAssert)
            checkOffset(offset, 1, this.length);
          if (!(this[offset] & 128))
            return this[offset];
          return (255 - this[offset] + 1) * -1;
        };
        Buffer2.prototype.readInt16LE = function readInt16LE(offset, noAssert) {
          offset = offset >>> 0;
          if (!noAssert)
            checkOffset(offset, 2, this.length);
          var val = this[offset] | this[offset + 1] << 8;
          return val & 32768 ? val | 4294901760 : val;
        };
        Buffer2.prototype.readInt16BE = function readInt16BE(offset, noAssert) {
          offset = offset >>> 0;
          if (!noAssert)
            checkOffset(offset, 2, this.length);
          var val = this[offset + 1] | this[offset] << 8;
          return val & 32768 ? val | 4294901760 : val;
        };
        Buffer2.prototype.readInt32LE = function readInt32LE(offset, noAssert) {
          offset = offset >>> 0;
          if (!noAssert)
            checkOffset(offset, 4, this.length);
          return this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16 | this[offset + 3] << 24;
        };
        Buffer2.prototype.readInt32BE = function readInt32BE(offset, noAssert) {
          offset = offset >>> 0;
          if (!noAssert)
            checkOffset(offset, 4, this.length);
          return this[offset] << 24 | this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3];
        };
        Buffer2.prototype.readFloatLE = function readFloatLE(offset, noAssert) {
          offset = offset >>> 0;
          if (!noAssert)
            checkOffset(offset, 4, this.length);
          return ieee754.read(this, offset, true, 23, 4);
        };
        Buffer2.prototype.readFloatBE = function readFloatBE(offset, noAssert) {
          offset = offset >>> 0;
          if (!noAssert)
            checkOffset(offset, 4, this.length);
          return ieee754.read(this, offset, false, 23, 4);
        };
        Buffer2.prototype.readDoubleLE = function readDoubleLE(offset, noAssert) {
          offset = offset >>> 0;
          if (!noAssert)
            checkOffset(offset, 8, this.length);
          return ieee754.read(this, offset, true, 52, 8);
        };
        Buffer2.prototype.readDoubleBE = function readDoubleBE(offset, noAssert) {
          offset = offset >>> 0;
          if (!noAssert)
            checkOffset(offset, 8, this.length);
          return ieee754.read(this, offset, false, 52, 8);
        };
        function checkInt(buf, value, offset, ext, max, min) {
          if (!Buffer2.isBuffer(buf))
            throw new TypeError('"buffer" argument must be a Buffer instance');
          if (value > max || value < min)
            throw new RangeError('"value" argument is out of bounds');
          if (offset + ext > buf.length)
            throw new RangeError("Index out of range");
        }
        Buffer2.prototype.writeUIntLE = function writeUIntLE(value, offset, byteLength2, noAssert) {
          value = +value;
          offset = offset >>> 0;
          byteLength2 = byteLength2 >>> 0;
          if (!noAssert) {
            var maxBytes = Math.pow(2, 8 * byteLength2) - 1;
            checkInt(this, value, offset, byteLength2, maxBytes, 0);
          }
          var mul = 1;
          var i3 = 0;
          this[offset] = value & 255;
          while (++i3 < byteLength2 && (mul *= 256)) {
            this[offset + i3] = value / mul & 255;
          }
          return offset + byteLength2;
        };
        Buffer2.prototype.writeUIntBE = function writeUIntBE(value, offset, byteLength2, noAssert) {
          value = +value;
          offset = offset >>> 0;
          byteLength2 = byteLength2 >>> 0;
          if (!noAssert) {
            var maxBytes = Math.pow(2, 8 * byteLength2) - 1;
            checkInt(this, value, offset, byteLength2, maxBytes, 0);
          }
          var i3 = byteLength2 - 1;
          var mul = 1;
          this[offset + i3] = value & 255;
          while (--i3 >= 0 && (mul *= 256)) {
            this[offset + i3] = value / mul & 255;
          }
          return offset + byteLength2;
        };
        Buffer2.prototype.writeUInt8 = function writeUInt8(value, offset, noAssert) {
          value = +value;
          offset = offset >>> 0;
          if (!noAssert)
            checkInt(this, value, offset, 1, 255, 0);
          this[offset] = value & 255;
          return offset + 1;
        };
        Buffer2.prototype.writeUInt16LE = function writeUInt16LE(value, offset, noAssert) {
          value = +value;
          offset = offset >>> 0;
          if (!noAssert)
            checkInt(this, value, offset, 2, 65535, 0);
          this[offset] = value & 255;
          this[offset + 1] = value >>> 8;
          return offset + 2;
        };
        Buffer2.prototype.writeUInt16BE = function writeUInt16BE(value, offset, noAssert) {
          value = +value;
          offset = offset >>> 0;
          if (!noAssert)
            checkInt(this, value, offset, 2, 65535, 0);
          this[offset] = value >>> 8;
          this[offset + 1] = value & 255;
          return offset + 2;
        };
        Buffer2.prototype.writeUInt32LE = function writeUInt32LE(value, offset, noAssert) {
          value = +value;
          offset = offset >>> 0;
          if (!noAssert)
            checkInt(this, value, offset, 4, 4294967295, 0);
          this[offset + 3] = value >>> 24;
          this[offset + 2] = value >>> 16;
          this[offset + 1] = value >>> 8;
          this[offset] = value & 255;
          return offset + 4;
        };
        Buffer2.prototype.writeUInt32BE = function writeUInt32BE(value, offset, noAssert) {
          value = +value;
          offset = offset >>> 0;
          if (!noAssert)
            checkInt(this, value, offset, 4, 4294967295, 0);
          this[offset] = value >>> 24;
          this[offset + 1] = value >>> 16;
          this[offset + 2] = value >>> 8;
          this[offset + 3] = value & 255;
          return offset + 4;
        };
        Buffer2.prototype.writeIntLE = function writeIntLE(value, offset, byteLength2, noAssert) {
          value = +value;
          offset = offset >>> 0;
          if (!noAssert) {
            var limit = Math.pow(2, 8 * byteLength2 - 1);
            checkInt(this, value, offset, byteLength2, limit - 1, -limit);
          }
          var i3 = 0;
          var mul = 1;
          var sub = 0;
          this[offset] = value & 255;
          while (++i3 < byteLength2 && (mul *= 256)) {
            if (value < 0 && sub === 0 && this[offset + i3 - 1] !== 0) {
              sub = 1;
            }
            this[offset + i3] = (value / mul >> 0) - sub & 255;
          }
          return offset + byteLength2;
        };
        Buffer2.prototype.writeIntBE = function writeIntBE(value, offset, byteLength2, noAssert) {
          value = +value;
          offset = offset >>> 0;
          if (!noAssert) {
            var limit = Math.pow(2, 8 * byteLength2 - 1);
            checkInt(this, value, offset, byteLength2, limit - 1, -limit);
          }
          var i3 = byteLength2 - 1;
          var mul = 1;
          var sub = 0;
          this[offset + i3] = value & 255;
          while (--i3 >= 0 && (mul *= 256)) {
            if (value < 0 && sub === 0 && this[offset + i3 + 1] !== 0) {
              sub = 1;
            }
            this[offset + i3] = (value / mul >> 0) - sub & 255;
          }
          return offset + byteLength2;
        };
        Buffer2.prototype.writeInt8 = function writeInt8(value, offset, noAssert) {
          value = +value;
          offset = offset >>> 0;
          if (!noAssert)
            checkInt(this, value, offset, 1, 127, -128);
          if (value < 0)
            value = 255 + value + 1;
          this[offset] = value & 255;
          return offset + 1;
        };
        Buffer2.prototype.writeInt16LE = function writeInt16LE(value, offset, noAssert) {
          value = +value;
          offset = offset >>> 0;
          if (!noAssert)
            checkInt(this, value, offset, 2, 32767, -32768);
          this[offset] = value & 255;
          this[offset + 1] = value >>> 8;
          return offset + 2;
        };
        Buffer2.prototype.writeInt16BE = function writeInt16BE(value, offset, noAssert) {
          value = +value;
          offset = offset >>> 0;
          if (!noAssert)
            checkInt(this, value, offset, 2, 32767, -32768);
          this[offset] = value >>> 8;
          this[offset + 1] = value & 255;
          return offset + 2;
        };
        Buffer2.prototype.writeInt32LE = function writeInt32LE(value, offset, noAssert) {
          value = +value;
          offset = offset >>> 0;
          if (!noAssert)
            checkInt(this, value, offset, 4, 2147483647, -2147483648);
          this[offset] = value & 255;
          this[offset + 1] = value >>> 8;
          this[offset + 2] = value >>> 16;
          this[offset + 3] = value >>> 24;
          return offset + 4;
        };
        Buffer2.prototype.writeInt32BE = function writeInt32BE(value, offset, noAssert) {
          value = +value;
          offset = offset >>> 0;
          if (!noAssert)
            checkInt(this, value, offset, 4, 2147483647, -2147483648);
          if (value < 0)
            value = 4294967295 + value + 1;
          this[offset] = value >>> 24;
          this[offset + 1] = value >>> 16;
          this[offset + 2] = value >>> 8;
          this[offset + 3] = value & 255;
          return offset + 4;
        };
        function checkIEEE754(buf, value, offset, ext, max, min) {
          if (offset + ext > buf.length)
            throw new RangeError("Index out of range");
          if (offset < 0)
            throw new RangeError("Index out of range");
        }
        function writeFloat(buf, value, offset, littleEndian, noAssert) {
          value = +value;
          offset = offset >>> 0;
          if (!noAssert) {
            checkIEEE754(buf, value, offset, 4, 34028234663852886e22, -34028234663852886e22);
          }
          ieee754.write(buf, value, offset, littleEndian, 23, 4);
          return offset + 4;
        }
        Buffer2.prototype.writeFloatLE = function writeFloatLE(value, offset, noAssert) {
          return writeFloat(this, value, offset, true, noAssert);
        };
        Buffer2.prototype.writeFloatBE = function writeFloatBE(value, offset, noAssert) {
          return writeFloat(this, value, offset, false, noAssert);
        };
        function writeDouble(buf, value, offset, littleEndian, noAssert) {
          value = +value;
          offset = offset >>> 0;
          if (!noAssert) {
            checkIEEE754(buf, value, offset, 8, 17976931348623157e292, -17976931348623157e292);
          }
          ieee754.write(buf, value, offset, littleEndian, 52, 8);
          return offset + 8;
        }
        Buffer2.prototype.writeDoubleLE = function writeDoubleLE(value, offset, noAssert) {
          return writeDouble(this, value, offset, true, noAssert);
        };
        Buffer2.prototype.writeDoubleBE = function writeDoubleBE(value, offset, noAssert) {
          return writeDouble(this, value, offset, false, noAssert);
        };
        Buffer2.prototype.copy = function copy(target, targetStart, start, end) {
          if (!Buffer2.isBuffer(target))
            throw new TypeError("argument should be a Buffer");
          if (!start)
            start = 0;
          if (!end && end !== 0)
            end = this.length;
          if (targetStart >= target.length)
            targetStart = target.length;
          if (!targetStart)
            targetStart = 0;
          if (end > 0 && end < start)
            end = start;
          if (end === start)
            return 0;
          if (target.length === 0 || this.length === 0)
            return 0;
          if (targetStart < 0) {
            throw new RangeError("targetStart out of bounds");
          }
          if (start < 0 || start >= this.length)
            throw new RangeError("Index out of range");
          if (end < 0)
            throw new RangeError("sourceEnd out of bounds");
          if (end > this.length)
            end = this.length;
          if (target.length - targetStart < end - start) {
            end = target.length - targetStart + start;
          }
          var len = end - start;
          if (this === target && typeof Uint8Array.prototype.copyWithin === "function") {
            this.copyWithin(targetStart, start, end);
          } else if (this === target && start < targetStart && targetStart < end) {
            for (var i3 = len - 1; i3 >= 0; --i3) {
              target[i3 + targetStart] = this[i3 + start];
            }
          } else {
            Uint8Array.prototype.set.call(target, this.subarray(start, end), targetStart);
          }
          return len;
        };
        Buffer2.prototype.fill = function fill(val, start, end, encoding) {
          if (typeof val === "string") {
            if (typeof start === "string") {
              encoding = start;
              start = 0;
              end = this.length;
            } else if (typeof end === "string") {
              encoding = end;
              end = this.length;
            }
            if (encoding !== void 0 && typeof encoding !== "string") {
              throw new TypeError("encoding must be a string");
            }
            if (typeof encoding === "string" && !Buffer2.isEncoding(encoding)) {
              throw new TypeError("Unknown encoding: " + encoding);
            }
            if (val.length === 1) {
              var code = val.charCodeAt(0);
              if (encoding === "utf8" && code < 128 || encoding === "latin1") {
                val = code;
              }
            }
          } else if (typeof val === "number") {
            val = val & 255;
          } else if (typeof val === "boolean") {
            val = Number(val);
          }
          if (start < 0 || this.length < start || this.length < end) {
            throw new RangeError("Out of range index");
          }
          if (end <= start) {
            return this;
          }
          start = start >>> 0;
          end = end === void 0 ? this.length : end >>> 0;
          if (!val)
            val = 0;
          var i3;
          if (typeof val === "number") {
            for (i3 = start; i3 < end; ++i3) {
              this[i3] = val;
            }
          } else {
            var bytes = Buffer2.isBuffer(val) ? val : Buffer2.from(val, encoding);
            var len = bytes.length;
            if (len === 0) {
              throw new TypeError('The value "' + val + '" is invalid for argument "value"');
            }
            for (i3 = 0; i3 < end - start; ++i3) {
              this[i3 + start] = bytes[i3 % len];
            }
          }
          return this;
        };
        var INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g;
        function base64clean(str) {
          str = str.split("=")[0];
          str = str.trim().replace(INVALID_BASE64_RE, "");
          if (str.length < 2)
            return "";
          while (str.length % 4 !== 0) {
            str = str + "=";
          }
          return str;
        }
        function utf8ToBytes(string, units) {
          units = units || Infinity;
          var codePoint;
          var length = string.length;
          var leadSurrogate = null;
          var bytes = [];
          for (var i3 = 0; i3 < length; ++i3) {
            codePoint = string.charCodeAt(i3);
            if (codePoint > 55295 && codePoint < 57344) {
              if (!leadSurrogate) {
                if (codePoint > 56319) {
                  if ((units -= 3) > -1)
                    bytes.push(239, 191, 189);
                  continue;
                } else if (i3 + 1 === length) {
                  if ((units -= 3) > -1)
                    bytes.push(239, 191, 189);
                  continue;
                }
                leadSurrogate = codePoint;
                continue;
              }
              if (codePoint < 56320) {
                if ((units -= 3) > -1)
                  bytes.push(239, 191, 189);
                leadSurrogate = codePoint;
                continue;
              }
              codePoint = (leadSurrogate - 55296 << 10 | codePoint - 56320) + 65536;
            } else if (leadSurrogate) {
              if ((units -= 3) > -1)
                bytes.push(239, 191, 189);
            }
            leadSurrogate = null;
            if (codePoint < 128) {
              if ((units -= 1) < 0)
                break;
              bytes.push(codePoint);
            } else if (codePoint < 2048) {
              if ((units -= 2) < 0)
                break;
              bytes.push(codePoint >> 6 | 192, codePoint & 63 | 128);
            } else if (codePoint < 65536) {
              if ((units -= 3) < 0)
                break;
              bytes.push(codePoint >> 12 | 224, codePoint >> 6 & 63 | 128, codePoint & 63 | 128);
            } else if (codePoint < 1114112) {
              if ((units -= 4) < 0)
                break;
              bytes.push(codePoint >> 18 | 240, codePoint >> 12 & 63 | 128, codePoint >> 6 & 63 | 128, codePoint & 63 | 128);
            } else {
              throw new Error("Invalid code point");
            }
          }
          return bytes;
        }
        function asciiToBytes(str) {
          var byteArray = [];
          for (var i3 = 0; i3 < str.length; ++i3) {
            byteArray.push(str.charCodeAt(i3) & 255);
          }
          return byteArray;
        }
        function utf16leToBytes(str, units) {
          var c2, hi, lo;
          var byteArray = [];
          for (var i3 = 0; i3 < str.length; ++i3) {
            if ((units -= 2) < 0)
              break;
            c2 = str.charCodeAt(i3);
            hi = c2 >> 8;
            lo = c2 % 256;
            byteArray.push(lo);
            byteArray.push(hi);
          }
          return byteArray;
        }
        function base64ToBytes(str) {
          return base64.toByteArray(base64clean(str));
        }
        function blitBuffer(src, dst, offset, length) {
          for (var i3 = 0; i3 < length; ++i3) {
            if (i3 + offset >= dst.length || i3 >= src.length)
              break;
            dst[i3 + offset] = src[i3];
          }
          return i3;
        }
        function isInstance(obj, type) {
          return obj instanceof type || obj != null && obj.constructor != null && obj.constructor.name != null && obj.constructor.name === type.name;
        }
        function numberIsNaN(obj) {
          return obj !== obj;
        }
        var hexSliceLookupTable = function() {
          var alphabet = "0123456789abcdef";
          var table = new Array(256);
          for (var i3 = 0; i3 < 16; ++i3) {
            var i16 = i3 * 16;
            for (var j = 0; j < 16; ++j) {
              table[i16 + j] = alphabet[i3] + alphabet[j];
            }
          }
          return table;
        }();
      }, { "base64-js": 29, "ieee754": 32 }], 31: [function(require2, module3, exports3) {
        "use strict";
        var dijkstra = {
          single_source_shortest_paths: function(graph, s5, d2) {
            var predecessors = {};
            var costs = {};
            costs[s5] = 0;
            var open = dijkstra.PriorityQueue.make();
            open.push(s5, 0);
            var closest, u2, v2, cost_of_s_to_u, adjacent_nodes, cost_of_e, cost_of_s_to_u_plus_cost_of_e, cost_of_s_to_v, first_visit;
            while (!open.empty()) {
              closest = open.pop();
              u2 = closest.value;
              cost_of_s_to_u = closest.cost;
              adjacent_nodes = graph[u2] || {};
              for (v2 in adjacent_nodes) {
                if (adjacent_nodes.hasOwnProperty(v2)) {
                  cost_of_e = adjacent_nodes[v2];
                  cost_of_s_to_u_plus_cost_of_e = cost_of_s_to_u + cost_of_e;
                  cost_of_s_to_v = costs[v2];
                  first_visit = typeof costs[v2] === "undefined";
                  if (first_visit || cost_of_s_to_v > cost_of_s_to_u_plus_cost_of_e) {
                    costs[v2] = cost_of_s_to_u_plus_cost_of_e;
                    open.push(v2, cost_of_s_to_u_plus_cost_of_e);
                    predecessors[v2] = u2;
                  }
                }
              }
            }
            if (typeof d2 !== "undefined" && typeof costs[d2] === "undefined") {
              var msg = ["Could not find a path from ", s5, " to ", d2, "."].join("");
              throw new Error(msg);
            }
            return predecessors;
          },
          extract_shortest_path_from_predecessor_list: function(predecessors, d2) {
            var nodes = [];
            var u2 = d2;
            var predecessor;
            while (u2) {
              nodes.push(u2);
              predecessor = predecessors[u2];
              u2 = predecessors[u2];
            }
            nodes.reverse();
            return nodes;
          },
          find_path: function(graph, s5, d2) {
            var predecessors = dijkstra.single_source_shortest_paths(graph, s5, d2);
            return dijkstra.extract_shortest_path_from_predecessor_list(predecessors, d2);
          },
          PriorityQueue: {
            make: function(opts) {
              var T2 = dijkstra.PriorityQueue, t3 = {}, key;
              opts = opts || {};
              for (key in T2) {
                if (T2.hasOwnProperty(key)) {
                  t3[key] = T2[key];
                }
              }
              t3.queue = [];
              t3.sorter = opts.sorter || T2.default_sorter;
              return t3;
            },
            default_sorter: function(a2, b2) {
              return a2.cost - b2.cost;
            },
            push: function(value, cost) {
              var item = { value, cost };
              this.queue.push(item);
              this.queue.sort(this.sorter);
            },
            pop: function() {
              return this.queue.shift();
            },
            empty: function() {
              return this.queue.length === 0;
            }
          }
        };
        if (typeof module3 !== "undefined") {
          module3.exports = dijkstra;
        }
      }, {}], 32: [function(require2, module3, exports3) {
        exports3.read = function(buffer, offset, isLE, mLen, nBytes) {
          var e4, m2;
          var eLen = nBytes * 8 - mLen - 1;
          var eMax = (1 << eLen) - 1;
          var eBias = eMax >> 1;
          var nBits = -7;
          var i3 = isLE ? nBytes - 1 : 0;
          var d2 = isLE ? -1 : 1;
          var s5 = buffer[offset + i3];
          i3 += d2;
          e4 = s5 & (1 << -nBits) - 1;
          s5 >>= -nBits;
          nBits += eLen;
          for (; nBits > 0; e4 = e4 * 256 + buffer[offset + i3], i3 += d2, nBits -= 8) {
          }
          m2 = e4 & (1 << -nBits) - 1;
          e4 >>= -nBits;
          nBits += mLen;
          for (; nBits > 0; m2 = m2 * 256 + buffer[offset + i3], i3 += d2, nBits -= 8) {
          }
          if (e4 === 0) {
            e4 = 1 - eBias;
          } else if (e4 === eMax) {
            return m2 ? NaN : (s5 ? -1 : 1) * Infinity;
          } else {
            m2 = m2 + Math.pow(2, mLen);
            e4 = e4 - eBias;
          }
          return (s5 ? -1 : 1) * m2 * Math.pow(2, e4 - mLen);
        };
        exports3.write = function(buffer, value, offset, isLE, mLen, nBytes) {
          var e4, m2, c2;
          var eLen = nBytes * 8 - mLen - 1;
          var eMax = (1 << eLen) - 1;
          var eBias = eMax >> 1;
          var rt = mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0;
          var i3 = isLE ? 0 : nBytes - 1;
          var d2 = isLE ? 1 : -1;
          var s5 = value < 0 || value === 0 && 1 / value < 0 ? 1 : 0;
          value = Math.abs(value);
          if (isNaN(value) || value === Infinity) {
            m2 = isNaN(value) ? 1 : 0;
            e4 = eMax;
          } else {
            e4 = Math.floor(Math.log(value) / Math.LN2);
            if (value * (c2 = Math.pow(2, -e4)) < 1) {
              e4--;
              c2 *= 2;
            }
            if (e4 + eBias >= 1) {
              value += rt / c2;
            } else {
              value += rt * Math.pow(2, 1 - eBias);
            }
            if (value * c2 >= 2) {
              e4++;
              c2 /= 2;
            }
            if (e4 + eBias >= eMax) {
              m2 = 0;
              e4 = eMax;
            } else if (e4 + eBias >= 1) {
              m2 = (value * c2 - 1) * Math.pow(2, mLen);
              e4 = e4 + eBias;
            } else {
              m2 = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
              e4 = 0;
            }
          }
          for (; mLen >= 8; buffer[offset + i3] = m2 & 255, i3 += d2, m2 /= 256, mLen -= 8) {
          }
          e4 = e4 << mLen | m2;
          eLen += mLen;
          for (; eLen > 0; buffer[offset + i3] = e4 & 255, i3 += d2, e4 /= 256, eLen -= 8) {
          }
          buffer[offset + i3 - d2] |= s5 * 128;
        };
      }, {}], 33: [function(require2, module3, exports3) {
        var toString = {}.toString;
        module3.exports = Array.isArray || function(arr) {
          return toString.call(arr) == "[object Array]";
        };
      }, {}] }, {}, [24])(24);
    });
  }
});

// node_modules/@lit/reactive-element/css-tag.js
var t = window.ShadowRoot && (window.ShadyCSS === void 0 || window.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype;
var e = Symbol();
var n = new Map();
var s = class {
  constructor(t3, n5) {
    if (this._$cssResult$ = true, n5 !== e)
      throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t3;
  }
  get styleSheet() {
    let e4 = n.get(this.cssText);
    return t && e4 === void 0 && (n.set(this.cssText, e4 = new CSSStyleSheet()), e4.replaceSync(this.cssText)), e4;
  }
  toString() {
    return this.cssText;
  }
};
var o = (t3) => new s(typeof t3 == "string" ? t3 : t3 + "", e);
var r = (t3, ...n5) => {
  const o5 = t3.length === 1 ? t3[0] : n5.reduce((e4, n6, s5) => e4 + ((t4) => {
    if (t4._$cssResult$ === true)
      return t4.cssText;
    if (typeof t4 == "number")
      return t4;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + t4 + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(n6) + t3[s5 + 1], t3[0]);
  return new s(o5, e);
};
var i = (e4, n5) => {
  t ? e4.adoptedStyleSheets = n5.map((t3) => t3 instanceof CSSStyleSheet ? t3 : t3.styleSheet) : n5.forEach((t3) => {
    const n6 = document.createElement("style"), s5 = window.litNonce;
    s5 !== void 0 && n6.setAttribute("nonce", s5), n6.textContent = t3.cssText, e4.appendChild(n6);
  });
};
var S = t ? (t3) => t3 : (t3) => t3 instanceof CSSStyleSheet ? ((t4) => {
  let e4 = "";
  for (const n5 of t4.cssRules)
    e4 += n5.cssText;
  return o(e4);
})(t3) : t3;

// node_modules/@lit/reactive-element/reactive-element.js
var s2;
var e2 = window.reactiveElementPolyfillSupport;
var r2 = { toAttribute(t3, i3) {
  switch (i3) {
    case Boolean:
      t3 = t3 ? "" : null;
      break;
    case Object:
    case Array:
      t3 = t3 == null ? t3 : JSON.stringify(t3);
  }
  return t3;
}, fromAttribute(t3, i3) {
  let s5 = t3;
  switch (i3) {
    case Boolean:
      s5 = t3 !== null;
      break;
    case Number:
      s5 = t3 === null ? null : Number(t3);
      break;
    case Object:
    case Array:
      try {
        s5 = JSON.parse(t3);
      } catch (t4) {
        s5 = null;
      }
  }
  return s5;
} };
var h = (t3, i3) => i3 !== t3 && (i3 == i3 || t3 == t3);
var o2 = { attribute: true, type: String, converter: r2, reflect: false, hasChanged: h };
var n2 = class extends HTMLElement {
  constructor() {
    super(), this._$Et = new Map(), this.isUpdatePending = false, this.hasUpdated = false, this._$Ei = null, this.o();
  }
  static addInitializer(t3) {
    var i3;
    (i3 = this.l) !== null && i3 !== void 0 || (this.l = []), this.l.push(t3);
  }
  static get observedAttributes() {
    this.finalize();
    const t3 = [];
    return this.elementProperties.forEach((i3, s5) => {
      const e4 = this._$Eh(s5, i3);
      e4 !== void 0 && (this._$Eu.set(e4, s5), t3.push(e4));
    }), t3;
  }
  static createProperty(t3, i3 = o2) {
    if (i3.state && (i3.attribute = false), this.finalize(), this.elementProperties.set(t3, i3), !i3.noAccessor && !this.prototype.hasOwnProperty(t3)) {
      const s5 = typeof t3 == "symbol" ? Symbol() : "__" + t3, e4 = this.getPropertyDescriptor(t3, s5, i3);
      e4 !== void 0 && Object.defineProperty(this.prototype, t3, e4);
    }
  }
  static getPropertyDescriptor(t3, i3, s5) {
    return { get() {
      return this[i3];
    }, set(e4) {
      const r4 = this[t3];
      this[i3] = e4, this.requestUpdate(t3, r4, s5);
    }, configurable: true, enumerable: true };
  }
  static getPropertyOptions(t3) {
    return this.elementProperties.get(t3) || o2;
  }
  static finalize() {
    if (this.hasOwnProperty("finalized"))
      return false;
    this.finalized = true;
    const t3 = Object.getPrototypeOf(this);
    if (t3.finalize(), this.elementProperties = new Map(t3.elementProperties), this._$Eu = new Map(), this.hasOwnProperty("properties")) {
      const t4 = this.properties, i3 = [...Object.getOwnPropertyNames(t4), ...Object.getOwnPropertySymbols(t4)];
      for (const s5 of i3)
        this.createProperty(s5, t4[s5]);
    }
    return this.elementStyles = this.finalizeStyles(this.styles), true;
  }
  static finalizeStyles(i3) {
    const s5 = [];
    if (Array.isArray(i3)) {
      const e4 = new Set(i3.flat(1 / 0).reverse());
      for (const i4 of e4)
        s5.unshift(S(i4));
    } else
      i3 !== void 0 && s5.push(S(i3));
    return s5;
  }
  static _$Eh(t3, i3) {
    const s5 = i3.attribute;
    return s5 === false ? void 0 : typeof s5 == "string" ? s5 : typeof t3 == "string" ? t3.toLowerCase() : void 0;
  }
  o() {
    var t3;
    this._$Ev = new Promise((t4) => this.enableUpdating = t4), this._$AL = new Map(), this._$Ep(), this.requestUpdate(), (t3 = this.constructor.l) === null || t3 === void 0 || t3.forEach((t4) => t4(this));
  }
  addController(t3) {
    var i3, s5;
    ((i3 = this._$Em) !== null && i3 !== void 0 ? i3 : this._$Em = []).push(t3), this.renderRoot !== void 0 && this.isConnected && ((s5 = t3.hostConnected) === null || s5 === void 0 || s5.call(t3));
  }
  removeController(t3) {
    var i3;
    (i3 = this._$Em) === null || i3 === void 0 || i3.splice(this._$Em.indexOf(t3) >>> 0, 1);
  }
  _$Ep() {
    this.constructor.elementProperties.forEach((t3, i3) => {
      this.hasOwnProperty(i3) && (this._$Et.set(i3, this[i3]), delete this[i3]);
    });
  }
  createRenderRoot() {
    var t3;
    const s5 = (t3 = this.shadowRoot) !== null && t3 !== void 0 ? t3 : this.attachShadow(this.constructor.shadowRootOptions);
    return i(s5, this.constructor.elementStyles), s5;
  }
  connectedCallback() {
    var t3;
    this.renderRoot === void 0 && (this.renderRoot = this.createRenderRoot()), this.enableUpdating(true), (t3 = this._$Em) === null || t3 === void 0 || t3.forEach((t4) => {
      var i3;
      return (i3 = t4.hostConnected) === null || i3 === void 0 ? void 0 : i3.call(t4);
    });
  }
  enableUpdating(t3) {
  }
  disconnectedCallback() {
    var t3;
    (t3 = this._$Em) === null || t3 === void 0 || t3.forEach((t4) => {
      var i3;
      return (i3 = t4.hostDisconnected) === null || i3 === void 0 ? void 0 : i3.call(t4);
    });
  }
  attributeChangedCallback(t3, i3, s5) {
    this._$AK(t3, s5);
  }
  _$Eg(t3, i3, s5 = o2) {
    var e4, h3;
    const n5 = this.constructor._$Eh(t3, s5);
    if (n5 !== void 0 && s5.reflect === true) {
      const o5 = ((h3 = (e4 = s5.converter) === null || e4 === void 0 ? void 0 : e4.toAttribute) !== null && h3 !== void 0 ? h3 : r2.toAttribute)(i3, s5.type);
      this._$Ei = t3, o5 == null ? this.removeAttribute(n5) : this.setAttribute(n5, o5), this._$Ei = null;
    }
  }
  _$AK(t3, i3) {
    var s5, e4, h3;
    const o5 = this.constructor, n5 = o5._$Eu.get(t3);
    if (n5 !== void 0 && this._$Ei !== n5) {
      const t4 = o5.getPropertyOptions(n5), l3 = t4.converter, a2 = (h3 = (e4 = (s5 = l3) === null || s5 === void 0 ? void 0 : s5.fromAttribute) !== null && e4 !== void 0 ? e4 : typeof l3 == "function" ? l3 : null) !== null && h3 !== void 0 ? h3 : r2.fromAttribute;
      this._$Ei = n5, this[n5] = a2(i3, t4.type), this._$Ei = null;
    }
  }
  requestUpdate(t3, i3, s5) {
    let e4 = true;
    t3 !== void 0 && (((s5 = s5 || this.constructor.getPropertyOptions(t3)).hasChanged || h)(this[t3], i3) ? (this._$AL.has(t3) || this._$AL.set(t3, i3), s5.reflect === true && this._$Ei !== t3 && (this._$ES === void 0 && (this._$ES = new Map()), this._$ES.set(t3, s5))) : e4 = false), !this.isUpdatePending && e4 && (this._$Ev = this._$EC());
  }
  async _$EC() {
    this.isUpdatePending = true;
    try {
      await this._$Ev;
    } catch (t4) {
      Promise.reject(t4);
    }
    const t3 = this.scheduleUpdate();
    return t3 != null && await t3, !this.isUpdatePending;
  }
  scheduleUpdate() {
    return this.performUpdate();
  }
  performUpdate() {
    var t3;
    if (!this.isUpdatePending)
      return;
    this.hasUpdated, this._$Et && (this._$Et.forEach((t4, i4) => this[i4] = t4), this._$Et = void 0);
    let i3 = false;
    const s5 = this._$AL;
    try {
      i3 = this.shouldUpdate(s5), i3 ? (this.willUpdate(s5), (t3 = this._$Em) === null || t3 === void 0 || t3.forEach((t4) => {
        var i4;
        return (i4 = t4.hostUpdate) === null || i4 === void 0 ? void 0 : i4.call(t4);
      }), this.update(s5)) : this._$EU();
    } catch (t4) {
      throw i3 = false, this._$EU(), t4;
    }
    i3 && this._$AE(s5);
  }
  willUpdate(t3) {
  }
  _$AE(t3) {
    var i3;
    (i3 = this._$Em) === null || i3 === void 0 || i3.forEach((t4) => {
      var i4;
      return (i4 = t4.hostUpdated) === null || i4 === void 0 ? void 0 : i4.call(t4);
    }), this.hasUpdated || (this.hasUpdated = true, this.firstUpdated(t3)), this.updated(t3);
  }
  _$EU() {
    this._$AL = new Map(), this.isUpdatePending = false;
  }
  get updateComplete() {
    return this.getUpdateComplete();
  }
  getUpdateComplete() {
    return this._$Ev;
  }
  shouldUpdate(t3) {
    return true;
  }
  update(t3) {
    this._$ES !== void 0 && (this._$ES.forEach((t4, i3) => this._$Eg(i3, this[i3], t4)), this._$ES = void 0), this._$EU();
  }
  updated(t3) {
  }
  firstUpdated(t3) {
  }
};
n2.finalized = true, n2.elementProperties = new Map(), n2.elementStyles = [], n2.shadowRootOptions = { mode: "open" }, e2 == null || e2({ ReactiveElement: n2 }), ((s2 = globalThis.reactiveElementVersions) !== null && s2 !== void 0 ? s2 : globalThis.reactiveElementVersions = []).push("1.0.1");

// node_modules/lit-html/lit-html.js
var t2;
var i2 = globalThis.trustedTypes;
var s3 = i2 ? i2.createPolicy("lit-html", { createHTML: (t3) => t3 }) : void 0;
var e3 = `lit$${(Math.random() + "").slice(9)}$`;
var o3 = "?" + e3;
var n3 = `<${o3}>`;
var l = document;
var h2 = (t3 = "") => l.createComment(t3);
var r3 = (t3) => t3 === null || typeof t3 != "object" && typeof t3 != "function";
var d = Array.isArray;
var u = (t3) => {
  var i3;
  return d(t3) || typeof ((i3 = t3) === null || i3 === void 0 ? void 0 : i3[Symbol.iterator]) == "function";
};
var c = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g;
var v = /-->/g;
var a = />/g;
var f = />|[ 	\n\r](?:([^\s"'>=/]+)([ 	\n\r]*=[ 	\n\r]*(?:[^ 	\n\r"'`<>=]|("|')|))|$)/g;
var _ = /'/g;
var m = /"/g;
var g = /^(?:script|style|textarea)$/i;
var $ = (t3) => (i3, ...s5) => ({ _$litType$: t3, strings: i3, values: s5 });
var p = $(1);
var y = $(2);
var b = Symbol.for("lit-noChange");
var T = Symbol.for("lit-nothing");
var x = new WeakMap();
var w = (t3, i3, s5) => {
  var e4, o5;
  const n5 = (e4 = s5 == null ? void 0 : s5.renderBefore) !== null && e4 !== void 0 ? e4 : i3;
  let l3 = n5._$litPart$;
  if (l3 === void 0) {
    const t4 = (o5 = s5 == null ? void 0 : s5.renderBefore) !== null && o5 !== void 0 ? o5 : null;
    n5._$litPart$ = l3 = new N(i3.insertBefore(h2(), t4), t4, void 0, s5 != null ? s5 : {});
  }
  return l3._$AI(t3), l3;
};
var A = l.createTreeWalker(l, 129, null, false);
var C = (t3, i3) => {
  const o5 = t3.length - 1, l3 = [];
  let h3, r4 = i3 === 2 ? "<svg>" : "", d2 = c;
  for (let i4 = 0; i4 < o5; i4++) {
    const s5 = t3[i4];
    let o6, u3, $2 = -1, p2 = 0;
    for (; p2 < s5.length && (d2.lastIndex = p2, u3 = d2.exec(s5), u3 !== null); )
      p2 = d2.lastIndex, d2 === c ? u3[1] === "!--" ? d2 = v : u3[1] !== void 0 ? d2 = a : u3[2] !== void 0 ? (g.test(u3[2]) && (h3 = RegExp("</" + u3[2], "g")), d2 = f) : u3[3] !== void 0 && (d2 = f) : d2 === f ? u3[0] === ">" ? (d2 = h3 != null ? h3 : c, $2 = -1) : u3[1] === void 0 ? $2 = -2 : ($2 = d2.lastIndex - u3[2].length, o6 = u3[1], d2 = u3[3] === void 0 ? f : u3[3] === '"' ? m : _) : d2 === m || d2 === _ ? d2 = f : d2 === v || d2 === a ? d2 = c : (d2 = f, h3 = void 0);
    const y2 = d2 === f && t3[i4 + 1].startsWith("/>") ? " " : "";
    r4 += d2 === c ? s5 + n3 : $2 >= 0 ? (l3.push(o6), s5.slice(0, $2) + "$lit$" + s5.slice($2) + e3 + y2) : s5 + e3 + ($2 === -2 ? (l3.push(void 0), i4) : y2);
  }
  const u2 = r4 + (t3[o5] || "<?>") + (i3 === 2 ? "</svg>" : "");
  return [s3 !== void 0 ? s3.createHTML(u2) : u2, l3];
};
var P = class {
  constructor({ strings: t3, _$litType$: s5 }, n5) {
    let l3;
    this.parts = [];
    let r4 = 0, d2 = 0;
    const u2 = t3.length - 1, c2 = this.parts, [v2, a2] = C(t3, s5);
    if (this.el = P.createElement(v2, n5), A.currentNode = this.el.content, s5 === 2) {
      const t4 = this.el.content, i3 = t4.firstChild;
      i3.remove(), t4.append(...i3.childNodes);
    }
    for (; (l3 = A.nextNode()) !== null && c2.length < u2; ) {
      if (l3.nodeType === 1) {
        if (l3.hasAttributes()) {
          const t4 = [];
          for (const i3 of l3.getAttributeNames())
            if (i3.endsWith("$lit$") || i3.startsWith(e3)) {
              const s6 = a2[d2++];
              if (t4.push(i3), s6 !== void 0) {
                const t5 = l3.getAttribute(s6.toLowerCase() + "$lit$").split(e3), i4 = /([.?@])?(.*)/.exec(s6);
                c2.push({ type: 1, index: r4, name: i4[2], strings: t5, ctor: i4[1] === "." ? M : i4[1] === "?" ? k : i4[1] === "@" ? H : S2 });
              } else
                c2.push({ type: 6, index: r4 });
            }
          for (const i3 of t4)
            l3.removeAttribute(i3);
        }
        if (g.test(l3.tagName)) {
          const t4 = l3.textContent.split(e3), s6 = t4.length - 1;
          if (s6 > 0) {
            l3.textContent = i2 ? i2.emptyScript : "";
            for (let i3 = 0; i3 < s6; i3++)
              l3.append(t4[i3], h2()), A.nextNode(), c2.push({ type: 2, index: ++r4 });
            l3.append(t4[s6], h2());
          }
        }
      } else if (l3.nodeType === 8)
        if (l3.data === o3)
          c2.push({ type: 2, index: r4 });
        else {
          let t4 = -1;
          for (; (t4 = l3.data.indexOf(e3, t4 + 1)) !== -1; )
            c2.push({ type: 7, index: r4 }), t4 += e3.length - 1;
        }
      r4++;
    }
  }
  static createElement(t3, i3) {
    const s5 = l.createElement("template");
    return s5.innerHTML = t3, s5;
  }
};
function V(t3, i3, s5 = t3, e4) {
  var o5, n5, l3, h3;
  if (i3 === b)
    return i3;
  let d2 = e4 !== void 0 ? (o5 = s5._$Cl) === null || o5 === void 0 ? void 0 : o5[e4] : s5._$Cu;
  const u2 = r3(i3) ? void 0 : i3._$litDirective$;
  return (d2 == null ? void 0 : d2.constructor) !== u2 && ((n5 = d2 == null ? void 0 : d2._$AO) === null || n5 === void 0 || n5.call(d2, false), u2 === void 0 ? d2 = void 0 : (d2 = new u2(t3), d2._$AT(t3, s5, e4)), e4 !== void 0 ? ((l3 = (h3 = s5)._$Cl) !== null && l3 !== void 0 ? l3 : h3._$Cl = [])[e4] = d2 : s5._$Cu = d2), d2 !== void 0 && (i3 = V(t3, d2._$AS(t3, i3.values), d2, e4)), i3;
}
var E = class {
  constructor(t3, i3) {
    this.v = [], this._$AN = void 0, this._$AD = t3, this._$AM = i3;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  p(t3) {
    var i3;
    const { el: { content: s5 }, parts: e4 } = this._$AD, o5 = ((i3 = t3 == null ? void 0 : t3.creationScope) !== null && i3 !== void 0 ? i3 : l).importNode(s5, true);
    A.currentNode = o5;
    let n5 = A.nextNode(), h3 = 0, r4 = 0, d2 = e4[0];
    for (; d2 !== void 0; ) {
      if (h3 === d2.index) {
        let i4;
        d2.type === 2 ? i4 = new N(n5, n5.nextSibling, this, t3) : d2.type === 1 ? i4 = new d2.ctor(n5, d2.name, d2.strings, this, t3) : d2.type === 6 && (i4 = new I(n5, this, t3)), this.v.push(i4), d2 = e4[++r4];
      }
      h3 !== (d2 == null ? void 0 : d2.index) && (n5 = A.nextNode(), h3++);
    }
    return o5;
  }
  m(t3) {
    let i3 = 0;
    for (const s5 of this.v)
      s5 !== void 0 && (s5.strings !== void 0 ? (s5._$AI(t3, s5, i3), i3 += s5.strings.length - 2) : s5._$AI(t3[i3])), i3++;
  }
};
var N = class {
  constructor(t3, i3, s5, e4) {
    var o5;
    this.type = 2, this._$AH = T, this._$AN = void 0, this._$AA = t3, this._$AB = i3, this._$AM = s5, this.options = e4, this._$Cg = (o5 = e4 == null ? void 0 : e4.isConnected) === null || o5 === void 0 || o5;
  }
  get _$AU() {
    var t3, i3;
    return (i3 = (t3 = this._$AM) === null || t3 === void 0 ? void 0 : t3._$AU) !== null && i3 !== void 0 ? i3 : this._$Cg;
  }
  get parentNode() {
    let t3 = this._$AA.parentNode;
    const i3 = this._$AM;
    return i3 !== void 0 && t3.nodeType === 11 && (t3 = i3.parentNode), t3;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(t3, i3 = this) {
    t3 = V(this, t3, i3), r3(t3) ? t3 === T || t3 == null || t3 === "" ? (this._$AH !== T && this._$AR(), this._$AH = T) : t3 !== this._$AH && t3 !== b && this.$(t3) : t3._$litType$ !== void 0 ? this.T(t3) : t3.nodeType !== void 0 ? this.S(t3) : u(t3) ? this.M(t3) : this.$(t3);
  }
  A(t3, i3 = this._$AB) {
    return this._$AA.parentNode.insertBefore(t3, i3);
  }
  S(t3) {
    this._$AH !== t3 && (this._$AR(), this._$AH = this.A(t3));
  }
  $(t3) {
    this._$AH !== T && r3(this._$AH) ? this._$AA.nextSibling.data = t3 : this.S(l.createTextNode(t3)), this._$AH = t3;
  }
  T(t3) {
    var i3;
    const { values: s5, _$litType$: e4 } = t3, o5 = typeof e4 == "number" ? this._$AC(t3) : (e4.el === void 0 && (e4.el = P.createElement(e4.h, this.options)), e4);
    if (((i3 = this._$AH) === null || i3 === void 0 ? void 0 : i3._$AD) === o5)
      this._$AH.m(s5);
    else {
      const t4 = new E(o5, this), i4 = t4.p(this.options);
      t4.m(s5), this.S(i4), this._$AH = t4;
    }
  }
  _$AC(t3) {
    let i3 = x.get(t3.strings);
    return i3 === void 0 && x.set(t3.strings, i3 = new P(t3)), i3;
  }
  M(t3) {
    d(this._$AH) || (this._$AH = [], this._$AR());
    const i3 = this._$AH;
    let s5, e4 = 0;
    for (const o5 of t3)
      e4 === i3.length ? i3.push(s5 = new N(this.A(h2()), this.A(h2()), this, this.options)) : s5 = i3[e4], s5._$AI(o5), e4++;
    e4 < i3.length && (this._$AR(s5 && s5._$AB.nextSibling, e4), i3.length = e4);
  }
  _$AR(t3 = this._$AA.nextSibling, i3) {
    var s5;
    for ((s5 = this._$AP) === null || s5 === void 0 || s5.call(this, false, true, i3); t3 && t3 !== this._$AB; ) {
      const i4 = t3.nextSibling;
      t3.remove(), t3 = i4;
    }
  }
  setConnected(t3) {
    var i3;
    this._$AM === void 0 && (this._$Cg = t3, (i3 = this._$AP) === null || i3 === void 0 || i3.call(this, t3));
  }
};
var S2 = class {
  constructor(t3, i3, s5, e4, o5) {
    this.type = 1, this._$AH = T, this._$AN = void 0, this.element = t3, this.name = i3, this._$AM = e4, this.options = o5, s5.length > 2 || s5[0] !== "" || s5[1] !== "" ? (this._$AH = Array(s5.length - 1).fill(new String()), this.strings = s5) : this._$AH = T;
  }
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t3, i3 = this, s5, e4) {
    const o5 = this.strings;
    let n5 = false;
    if (o5 === void 0)
      t3 = V(this, t3, i3, 0), n5 = !r3(t3) || t3 !== this._$AH && t3 !== b, n5 && (this._$AH = t3);
    else {
      const e5 = t3;
      let l3, h3;
      for (t3 = o5[0], l3 = 0; l3 < o5.length - 1; l3++)
        h3 = V(this, e5[s5 + l3], i3, l3), h3 === b && (h3 = this._$AH[l3]), n5 || (n5 = !r3(h3) || h3 !== this._$AH[l3]), h3 === T ? t3 = T : t3 !== T && (t3 += (h3 != null ? h3 : "") + o5[l3 + 1]), this._$AH[l3] = h3;
    }
    n5 && !e4 && this.k(t3);
  }
  k(t3) {
    t3 === T ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t3 != null ? t3 : "");
  }
};
var M = class extends S2 {
  constructor() {
    super(...arguments), this.type = 3;
  }
  k(t3) {
    this.element[this.name] = t3 === T ? void 0 : t3;
  }
};
var k = class extends S2 {
  constructor() {
    super(...arguments), this.type = 4;
  }
  k(t3) {
    t3 && t3 !== T ? this.element.setAttribute(this.name, "") : this.element.removeAttribute(this.name);
  }
};
var H = class extends S2 {
  constructor(t3, i3, s5, e4, o5) {
    super(t3, i3, s5, e4, o5), this.type = 5;
  }
  _$AI(t3, i3 = this) {
    var s5;
    if ((t3 = (s5 = V(this, t3, i3, 0)) !== null && s5 !== void 0 ? s5 : T) === b)
      return;
    const e4 = this._$AH, o5 = t3 === T && e4 !== T || t3.capture !== e4.capture || t3.once !== e4.once || t3.passive !== e4.passive, n5 = t3 !== T && (e4 === T || o5);
    o5 && this.element.removeEventListener(this.name, this, e4), n5 && this.element.addEventListener(this.name, this, t3), this._$AH = t3;
  }
  handleEvent(t3) {
    var i3, s5;
    typeof this._$AH == "function" ? this._$AH.call((s5 = (i3 = this.options) === null || i3 === void 0 ? void 0 : i3.host) !== null && s5 !== void 0 ? s5 : this.element, t3) : this._$AH.handleEvent(t3);
  }
};
var I = class {
  constructor(t3, i3, s5) {
    this.element = t3, this.type = 6, this._$AN = void 0, this._$AM = i3, this.options = s5;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t3) {
    V(this, t3);
  }
};
var R = window.litHtmlPolyfillSupport;
R == null || R(P, N), ((t2 = globalThis.litHtmlVersions) !== null && t2 !== void 0 ? t2 : globalThis.litHtmlVersions = []).push("2.0.1");

// node_modules/lit-element/lit-element.js
var l2;
var o4;
var s4 = class extends n2 {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Dt = void 0;
  }
  createRenderRoot() {
    var t3, e4;
    const i3 = super.createRenderRoot();
    return (t3 = (e4 = this.renderOptions).renderBefore) !== null && t3 !== void 0 || (e4.renderBefore = i3.firstChild), i3;
  }
  update(t3) {
    const i3 = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t3), this._$Dt = w(i3, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    var t3;
    super.connectedCallback(), (t3 = this._$Dt) === null || t3 === void 0 || t3.setConnected(true);
  }
  disconnectedCallback() {
    var t3;
    super.disconnectedCallback(), (t3 = this._$Dt) === null || t3 === void 0 || t3.setConnected(false);
  }
  render() {
    return b;
  }
};
s4.finalized = true, s4._$litElement$ = true, (l2 = globalThis.litElementHydrateSupport) === null || l2 === void 0 || l2.call(globalThis, { LitElement: s4 });
var n4 = globalThis.litElementPolyfillSupport;
n4 == null || n4({ LitElement: s4 });
((o4 = globalThis.litElementVersions) !== null && o4 !== void 0 ? o4 : globalThis.litElementVersions = []).push("3.0.1");

// ../util/base58.js
function base58() {
  const result = {};
  const ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  const ALPHABET_MAP = {};
  let i3 = 0;
  while (i3 < ALPHABET.length) {
    ALPHABET_MAP[ALPHABET.charAt(i3)] = i3;
    i3++;
  }
  result.encode = (buffer) => {
    let carry, digits, j;
    if (buffer.length === 0) {
      return "";
    }
    i3 = void 0;
    j = void 0;
    digits = [0];
    i3 = 0;
    while (i3 < buffer.length) {
      j = 0;
      while (j < digits.length) {
        digits[j] <<= 8;
        j++;
      }
      digits[0] += buffer[i3];
      carry = 0;
      j = 0;
      while (j < digits.length) {
        digits[j] += carry;
        carry = digits[j] / 58 | 0;
        digits[j] %= 58;
        ++j;
      }
      while (carry) {
        digits.push(carry % 58);
        carry = carry / 58 | 0;
      }
      i3++;
    }
    i3 = 0;
    while (buffer[i3] === 0 && i3 < buffer.length - 1) {
      digits.push(0);
      i3++;
    }
    return digits.reverse().map(function(digit) {
      return ALPHABET[digit];
    }).join("");
  };
  result.decode = (string) => {
    let bytes, c2, carry, j;
    if (string.length === 0) {
      return new Uint8Array(0);
    }
    i3 = void 0;
    j = void 0;
    bytes = [0];
    i3 = 0;
    while (i3 < string.length) {
      c2 = string[i3];
      if (!(c2 in ALPHABET_MAP)) {
        throw "Base58.decode received unacceptable input. Character '" + c2 + "' is not in the Base58 alphabet.";
      }
      j = 0;
      while (j < bytes.length) {
        bytes[j] *= 58;
        j++;
      }
      bytes[0] += ALPHABET_MAP[c2];
      carry = 0;
      j = 0;
      while (j < bytes.length) {
        bytes[j] += carry;
        carry = bytes[j] >> 8;
        bytes[j] &= 255;
        ++j;
      }
      while (carry) {
        bytes.push(carry & 255);
        carry >>= 8;
      }
      i3++;
    }
    i3 = 0;
    while (string[i3] === "1" && i3 < string.length - 1) {
      bytes.push(0);
      i3++;
    }
    return new Uint8Array(bytes.reverse());
  };
  return result;
}

// ../util/websocket.js
function getWebSocket(domain, sigPubJwkHash) {
  return new WebSocket(`wss://${domain}/${sigPubJwkHash}`);
}
function handshakeWebsocket(websocket, sigPubJwk, challengeSig) {
  websocket.send(JSON.stringify({ sigPubJwk, challengeSig }));
}

// ../util/sign.js
var sigAlgorithm = {
  name: "ECDSA",
  hash: "SHA-256"
};
async function sign(privCryptoKey, bytes) {
  return crypto.subtle.sign(sigAlgorithm, privCryptoKey, bytes);
}
async function verify(pubCryptoKey, signature, bytes) {
  return crypto.subtle.verify(sigAlgorithm, pubCryptoKey, signature, bytes);
}

// ../util/auth.js
var challengeKey = "challenge";
async function fetchChallenge(domain, sigPubJwkHash) {
  try {
    const resp = await fetch(`https://${domain}/${sigPubJwkHash}/challenge`);
    return resp.json();
  } catch (e4) {
    console.log("failed to fetch challenge", e4);
    return null;
  }
}
function hasChallengeExpired(challenge) {
  if (!challenge || !challenge.exp) {
    return true;
  }
  if (Date.now() > challenge.exp) {
    return true;
  }
  return false;
}
async function signChallenge(privateKey, challengeText) {
  const bytes = new TextEncoder().encode(challengeText);
  const sig = new Uint8Array(await sign(privateKey, bytes));
  return base58().encode(sig);
}

// src/controller/auth.js
var AuthController = class {
  host;
  challenge = {};
  constructor(host) {
    this.host = host;
    host.addController(this);
  }
  async init() {
    this.challenge = null;
    this.challenge = await this.getChallenge();
    return this.challenge.exp;
  }
  async getChallenge() {
    if (this.challenge && !hasChallengeExpired(this.challenge)) {
      return this.challenge;
    }
    const stored = sessionStorage.getItem(challengeKey);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (!hasChallengeExpired(parsed)) {
        return parsed;
      }
    }
    return await fetchChallenge(this.host.pref.inboxDomain, this.host.pref.keys.sig.publicHash);
  }
  async getChallengeSig() {
    this.challenge = await this.getChallenge();
    return await signChallenge(this.host.pref.keys.sig.keyPair.privateKey, this.challenge.txt);
  }
};

// ../util/hash.js
var hashAlgorithm = "SHA-256";
async function hash(bytes) {
  return crypto.subtle.digest(hashAlgorithm, bytes);
}

// ../util/key.js
var sigKeyParams = {
  name: "ECDSA",
  namedCurve: "P-256"
};
async function genKeyPair() {
  return crypto.subtle.generateKey(sigKeyParams, true, ["sign", "verify"]);
}
async function exportKey(cryptoKey) {
  return crypto.subtle.exportKey("jwk", cryptoKey);
}
async function importKey(jwk, keyUsages) {
  return crypto.subtle.importKey("jwk", jwk, sigKeyParams, true, keyUsages);
}
function getJwkBytes(jwk) {
  const str = JSON.stringify(jwk);
  return new TextEncoder().encode(str);
}

// src/controller/contact.js
var contactsStorageKey = "contacts";
var ContactController = class {
  host;
  list = [];
  selected = {};
  constructor(host) {
    this.host = host;
    host.addController(this);
    this.init();
  }
  init() {
    const stored = localStorage.getItem(contactsStorageKey);
    if (stored) {
      this.list = JSON.parse(stored);
      this.selectContact(this.list[0]);
    }
    this.host.requestUpdate();
  }
  store() {
    localStorage.setItem(contactsStorageKey, JSON.stringify(this.list));
  }
  addContact(contact) {
    if (this.isValid(contact)) {
      const existing = this.list.find((c2) => this.matches(c2, contact));
      if (existing) {
        Object.assign(existing, contact);
      } else {
        this.list.push(contact);
      }
      this.store();
      this.selectContact(contact);
      this.host.requestUpdate();
    }
  }
  async addContactFromShareable(shareable) {
    if (!shareable || shareable.length < 1) {
      console.log("invalid");
      return false;
    }
    const bytes = base58().decode(shareable);
    const jsonString = new TextDecoder().decode(bytes);
    let contact = {};
    try {
      contact = JSON.parse(jsonString);
    } catch (e4) {
      console.log("failed to parse json", jsonString);
      return;
    }
    if (!this.isValid(contact)) {
      console.log("failed, missing keys, inboxDomain or name", contact);
      return;
    }
    const publicHashBytes = new Uint8Array(await hash(getJwkBytes(contact.keys.sig.jwk)));
    contact.keys.sig.publicHash = base58().encode(publicHashBytes);
    this.addContact(contact);
    this.host.requestUpdate();
    return true;
  }
  removeContact(contact) {
    const index = this.list.findIndex((c2) => this.matches(c2, contact));
    if (this.index >= 0) {
      this.list = this.list.splice(index, 1);
      console.log("removed");
    } else {
      console.log("not found");
    }
  }
  selectContact(contact) {
    this.selected = contact;
    console.log("selected", this.selected);
    this.host.requestUpdate();
  }
  isValid(contact) {
    return contact && contact.keys && contact.keys.sig && contact.keys.sig.jwk && contact.name && contact.inboxDomain;
  }
  matches(contact1, contact2) {
    return contact1.keys.sig.publicHash === contact2.keys.sig.publicHash;
  }
};

// ../util/message.js
var messagesKey = "messages";
async function fetchMessages(domain, sigPubJwk, sigPubJwkHash, challengeSig) {
  const sigPubJwkBytes = getJwkBytes(sigPubJwk);
  const sigPubJwkBase58 = base58().encode(sigPubJwkBytes);
  const resp = await fetch(`${window.location.protocol}//${domain}/${sigPubJwkHash}`, {
    headers: {
      "oc-pk": sigPubJwkBase58,
      "oc-sig": challengeSig
    }
  });
  return (await resp.json()).messages;
}
async function buildMessage(sigPriv, messageText, from) {
  const hashable = buildMessageBody(messageText, from);
  const bytes = new TextEncoder().encode(JSON.stringify(hashable));
  const hashBytes = new Uint8Array(await hash(bytes));
  const b58 = base58();
  hashable.h = b58.encode(hashBytes);
  if (sigPriv) {
    const hashSig = new Uint8Array(await sign(sigPriv, hashBytes));
    hashable.s = b58.encode(hashSig);
  }
  return hashable;
}
function buildMessageBody(messageText, from, time) {
  return {
    t: time || Date.now(),
    m: messageText,
    f: from
  };
}
async function sendMessage(domain, sigPriv, message, from, to) {
  const resp = await fetch(`https://${domain}/${to}`, {
    method: "POST",
    body: JSON.stringify(await buildMessage(sigPriv, message, from))
  });
  return resp.json();
}
async function verifyMessage(sigPub, message) {
  if (!message.h || !message.s) {
    return false;
  }
  const hashable = buildMessageBody(message.m, message.f, message.t);
  const bytes = new TextEncoder().encode(JSON.stringify(hashable));
  const hashBytes = new Uint8Array(await hash(bytes));
  const b58 = base58();
  const hashedMessage = b58.encode(hashBytes);
  if (hashedMessage !== message.h) {
    return false;
  }
  const sigBytes = b58.decode(message.s);
  const isVerified = await verify(sigPub, sigBytes, hashBytes);
  if (!isVerified) {
    return false;
  }
  return true;
}

// src/controller/message.js
var MessageController = class {
  host;
  list = [];
  constructor(host) {
    this.host = host;
    host.addController(this);
  }
  store() {
    localStorage.setItem(messagesKey, JSON.stringify(this.list));
  }
  async init() {
    const stored = localStorage.getItem(messagesKey);
    try {
      const parsed = JSON.parse(stored);
      this.list = parsed || [];
    } catch (e4) {
      console.log("failed to parse stored messages");
      this.list = [];
    }
    const fetched = await this.getMessages();
    return Promise.all(fetched.map(async (m2) => await this.handleRecievedMessage(m2, false))).then(() => this.store());
  }
  async getMessages() {
    return await fetchMessages(this.host.pref.inboxDomain, this.host.pref.keys.sig.jwk.public, this.host.pref.keys.sig.publicHash, await this.host.auth.getChallengeSig());
  }
  async handleRecievedMessage(data, doStore) {
    if (data.m && data.f && data.h) {
      const exists = this.list.find((m2) => m2.h === data.h);
      if (exists) {
        return false;
      }
      let isVerified = false;
      const contactMatch = this.host.contact.list.find((c2) => c2.keys.sig.publicHash === data.f);
      if (contactMatch && data.h && data.s) {
        const contactSigPub = await importKey(contactMatch.keys.sig.jwk, ["verify"]);
        isVerified = await verifyMessage(contactSigPub, data);
      } else {
        console.log("no match, hash or sig", data);
      }
      if (isVerified || !this.host.pref.acceptOnlyVerified) {
        const storable = data;
        storable.v = isVerified;
        this.list.push(storable);
        if (doStore) {
          this.store();
        }
        this.host.requestUpdate();
      } else {
        console.log("rejected unverified message", data);
      }
      return isVerified;
    }
    return false;
  }
  async handleSendMessage(inboxDomain, publicHash, message) {
    message = message.trim();
    if (message.length < 1) {
      return;
    }
    const res = await sendMessage(inboxDomain, this.host.pref.keys.sig.keyPair.privateKey, message, this.host.pref.keys.sig.publicHash, publicHash);
    if (res.error) {
      console.log("error", res);
      return;
    }
    const sentMessage = await buildMessage(void 0, message, this.host.pref.keys.sig.publicHash, publicHash);
    sentMessage.v = true;
    this.list.push(sentMessage);
    this.store();
    this.host.requestUpdate();
  }
  async pushAllMessages() {
    const resp = await fetch(`https://${this.host.pref.inboxDomain}/${this.host.pref.keys.sig.publicHash}`, {
      method: "POST",
      body: JSON.stringify(this.list)
    });
    return resp.json();
  }
};

// src/util/shareable.js
function buildShareable(name, sigJwk, inboxDomain) {
  return {
    name,
    keys: {
      sig: {
        jwk: sigJwk
      }
    },
    inboxDomain
  };
}

// src/util/qrcode.js
var import_qrcode = __toModule(require_qrcode());
async function generateQR(text, options) {
  try {
    return await import_qrcode.default.toDataURL(text, options);
  } catch (err) {
    console.error(err);
  }
}

// src/controller/preference.js
var nameStorageKey = "name";
var inboxDomainStorageKey = "inboxDomain";
var keysStorageKey = "keys";
var acceptOnlyVerifiedStorageKey = "acceptOnlyVerified";
var welcomeDismissedStorageKey = "welcomeDismissed";
var defaultDomain = "npchat.dr-useless.workers.dev";
var inboxDomainRegex = /^(?=.{1,255}$)[0-9A-Za-z](?:(?:[0-9A-Za-z]|-){0,61}[0-9A-Za-z])?(?:\.[0-9A-Za-z](?:(?:[0-9A-Za-z]|-){0,61}[0-9A-Za-z])?)*\.?$/;
var PreferenceController = class {
  host;
  keys = {};
  qrCodeShareable = {};
  exportLink = {};
  exportQRCode = {};
  constructor(host) {
    this.host = host;
    host.addController(this);
    this.acceptOnlyVerified = localStorage.getItem(acceptOnlyVerifiedStorageKey) !== "false";
    this.inboxDomain = localStorage.getItem(inboxDomainStorageKey) || defaultDomain;
    this.name = localStorage.getItem(nameStorageKey) || "Anonymous";
    this.welcomeDismissed = localStorage.getItem(welcomeDismissedStorageKey) || false;
  }
  async init() {
    await this.getKeys();
    await this.initShareables();
    await this.initExport();
    this.store();
    this.host.requestUpdate();
  }
  async getKeys() {
    const stored = localStorage.getItem(keysStorageKey);
    if (!stored) {
      this.keys = {
        sig: {
          keyPair: await genKeyPair()
        },
        enc: {}
      };
      this.keys.sig.jwk = {
        private: await exportKey(this.keys.sig.keyPair.privateKey),
        public: await exportKey(this.keys.sig.keyPair.publicKey)
      };
      const hashBytes = new Uint8Array(await hash(getJwkBytes(this.keys.sig.jwk.public)));
      this.keys.sig.publicHash = base58().encode(hashBytes);
      localStorage.setItem(keysStorageKey, JSON.stringify(this.keys));
      return;
    }
    const storedKeys = JSON.parse(stored);
    this.keys = storedKeys;
    this.keys.sig.keyPair = {
      privateKey: await importKey(this.keys.sig.jwk.private, ["sign"]),
      publicKey: await importKey(this.keys.sig.jwk.public, ["verify"])
    };
    return this.keys;
  }
  async initShareables() {
    this.shareable = this.getShareable();
    this.shareableLink = this.getShareableLink(this.shareable);
    this.qrCodeShareable = await this.getQRCodeAsDataUrl(this.shareableLink);
  }
  async initExport() {
    this.exportLink = `https://${window.location.host}#${this.getExportBase58()}`;
    this.exportQRCode = await this.getQRCodeAsDataUrl(this.exportLink);
  }
  getExportBase58() {
    const data = {
      keys: {
        sig: {
          jwk: {
            public: this.keys.sig.jwk.public,
            private: this.keys.sig.jwk.private
          },
          publicHash: this.keys.sig.publicHash
        }
      },
      name: this.name,
      inboxDomain: this.inboxDomain,
      contacts: this.host.contact.list
    };
    const bytes = new TextEncoder().encode(JSON.stringify(data));
    return base58().encode(bytes);
  }
  getShareable() {
    const sig = this.keys.sig;
    const shareable = buildShareable(this.name, sig.jwk.public, this.inboxDomain);
    const bytes = new TextEncoder().encode(JSON.stringify(shareable));
    return base58().encode(bytes);
  }
  async getQRCodeAsDataUrl(shareableLink) {
    return await generateQR(shareableLink, { errorCorrectionLevel: "L" });
  }
  getShareableLink(shareable) {
    return `https://${window.location.host}#${shareable}`;
  }
  store() {
    localStorage.setItem(nameStorageKey, this.name);
    localStorage.setItem(inboxDomainStorageKey, this.inboxDomain);
    localStorage.setItem(keysStorageKey, JSON.stringify(this.keys));
    localStorage.setItem(acceptOnlyVerifiedStorageKey, this.acceptOnlyVerified);
    localStorage.setItem(keysStorageKey, JSON.stringify(this.keys));
  }
  async changeName(name, enforceNotBlank) {
    if (enforceNotBlank) {
      if (name && name.trim().length > 0) {
        this.name = name.trim();
      } else {
        this.name = "Anonymous";
      }
    } else {
      this.name = name.trim();
    }
    await this.init();
    this.store();
    this.host.requestUpdate();
  }
  async changeInboxDomain(inboxDomain) {
    if (inboxDomain.trim().length > 0 && inboxDomainRegex.test(inboxDomain)) {
      this.inboxDomain = inboxDomain;
    } else {
      this.inboxDomain = defaultDomain;
    }
    await this.init();
    this.store();
  }
  changeAcceptOnlyVerified(acceptOnlyVerified) {
    this.acceptOnlyVerified = acceptOnlyVerified;
    console.log("changed to", this.acceptOnlyVerified);
    this.store();
    this.host.requestUpdate();
  }
  dismissWelcome() {
    this.welcomeDismissed = true;
    localStorage.setItem(welcomeDismissedStorageKey, "true");
    this.host.requestUpdate();
  }
};

// src/component/base.js
var Base = class extends s4 {
};
__publicField(Base, "styles", r`,,,,
    header, .main {
      width: 100%;
    }
    header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 .5rem;
    }
    header h1 {
      font-size: .8rem;
      margin: 0 .2rem;
    }
    header .welcome {
      display: none
    }
    nav {
      display: flex;
    }
    nav > * {
      padding: .5rem;
      display: block;
    }
    a {
      text-decoration: none;
      color: #000;
      transition: background-color 0.2s
    }
    a:hover {
      background-color: #e5e5e5
    }
    .main {
			display: flex;
			flex-wrap: wrap;
      padding: .5rem;
		}
    button, input {
      padding: 0.5rem;
      font-size: 1rem;
    }
    input[type=text] {
      width: 300px;
    }
    .background {
      background-color: #f5f5f5;
    }
    .box {
      display: block;
      padding: 0.5rem;
      margin: 1rem 0;
      border-radius: 2px;
    }
    .wrap {
      overflow-wrap: anywhere;
      word-break: break-all;
    }
    .no-list{
      list-style: none;
      padding: 0
    }
    .contact {
      padding: 0.5rem;
    }
    .contact:hover, .contact.selected {
      background-color: #e5e5e5;
    }
    .messages ul {
      display: flex;
      flex-direction: column;
    }
    .message .body {
      width: 100%

    }
    .message b
    .message.sent {
    }
    .compose {
      display: flex;
    }
    #message-compose {
      flex-grow: 1;
    }
    .meta {
      color: #555;
      font-size: .8rem;
      user-select: none;
    }
    .small {
      font-size: .6rem;
    }
    .smaller {
      font-size: .5rem;
    }
    .select-all {
      user-select: all;
    }
    .monospace {
      font-family: ui-monospace, Menlo, Monaco, "Cascadia Mono", "Segoe UI Mono", "Roboto Mono", "Oxygen Mono", "Ubuntu Monospace", "Source Code Pro", "Fira Mono", "Droid Sans Mono", "Courier New", monospace;
      font-size: .8rem
    }
    img {
      max-width: 100%
    }
    .error {
      color: #cc0000
    }
    .warn {
      color: #ff6700
    }
		@media(min-width: 750px) {
			.main > * {
				width: 49%
			}
      header h1 {
        font-size: 1rem
      }
      header .welcome {
        display: block
      }
		}
  `);

// src/component/app.js
var App = class extends Base {
  pref = new PreferenceController(this);
  contact = new ContactController(this);
  auth = new AuthController(this);
  message = new MessageController(this);
  constructor() {
    super();
    this.selectedMenu = "preferences";
    this.exportHidden = true;
    this.importFromUrlHash();
    this.initClient();
  }
  async initClient() {
    this.contact.init();
    await this.pref.init();
    try {
      await this.auth.init();
    } catch (e4) {
      this.isAuthed = false;
      this.isWebsocketOpen = false;
      this.auth.challenge = null;
      console.log("auth failed", e4);
      return false;
    }
    this.isAuthed = true;
    await this.message.init();
    try {
      await this.connectWebSocket();
    } catch (e4) {
      console.log("websocket connection failed", e4);
      this.isWebsocketOpen = false;
    }
    return true;
  }
  async connectWebSocket() {
    return new Promise((resolve, reject) => {
      this.websocket = getWebSocket(this.pref.inboxDomain, this.pref.keys.sig.publicHash);
      this.websocket.addEventListener("open", async () => {
        this.isWebsocketOpen = true;
        handshakeWebsocket(this.websocket, this.pref.keys.sig.jwk.public, await this.auth.getChallengeSig());
      });
      this.websocket.addEventListener("message", async (event) => {
        const data = JSON.parse(event.data);
        if (data.t && data.m && data.f) {
          await this.message.handleRecievedMessage(data, true);
        }
        if (!data.error) {
          resolve(data);
        } else {
          reject(data);
        }
      });
      this.addEventListener("close", () => {
        console.log("connection closed");
        this.isWebsocketOpen = false;
      });
    });
  }
  importFromUrlHash() {
    const h3 = window.location.hash.replace("#", "");
    if (h3.length > 0) {
      const bytes = base58().decode(h3);
      const text = new TextDecoder().decode(bytes);
      try {
        const obj = JSON.parse(text);
        console.log(obj);
        this.pref.inboxDomain = obj.inboxDomain || this.pref.inboxDomain;
        this.pref.name = obj.name || this.pref.name;
        this.pref.keys = obj.keys || this.pref.keys;
        this.pref.store();
        console.log(this.pref.keys.sig);
        this.contact.list = obj.contacts || this.contact.list;
        this.contact.store();
      } catch (e4) {
        console.log("import failed", e4);
      }
    }
  }
  async handleAddContact(event) {
    const added = this.contact.addContactFromShareable(event.target.value);
    if (added) {
      event.target.value = "";
    }
  }
  async handleSendMessage(event) {
    event.preventDefault();
    const c2 = this.contact.selected;
    if (!c2.keys) {
      console.log("no contact selected");
      return;
    }
    await this.message.handleSendMessage(c2.inboxDomain, c2.keys.sig.publicHash, this.messageInput.value);
    this.messageInput.value = "";
  }
  handleChangeName(event, enforceNotBlank) {
    this.pref.changeName(event.target.value, enforceNotBlank);
  }
  async handleChangeInboxDomain(event) {
    await this.pref.changeInboxDomain(event.target.value);
    await this.initClient();
  }
  handleChangeAcceptOnlyVerified(event) {
    this.pref.changeAcceptOnlyVerified(event.target.checked);
  }
  handleDismissWelcome() {
    this.pref.dismissWelcome();
  }
  selectMenu(event, menuName) {
    event.preventDefault();
    this.selectedMenu = menuName;
  }
  async showExport() {
    this.exportHidden = !this.exportHidden;
  }
  async pushAllMessages() {
    await this.message.pushAllMessages();
  }
  headerTemplate() {
    return p`
      <header>
        <nav>
          <a href="#" @click=${(e4) => this.selectMenu(e4, "preferences")}>⚙️ Preferences</a>
          <a href="#" @click=${(e4) => this.selectMenu(e4, "contacts")}>💬 Contacts</a>
        </nav>
        <h1>npchat webclient</h1>
        <span class="welcome">Hello, ${this.pref.name} ☺️</span>
      </header>
    `;
  }
  welcomeTemplate() {
    return p`
      <div class="intro">
        <h2>Thanks for trying out npchat</h2>
        <p>A non-profit, non-proprietary, private & secure messaging service.</p>
        <p>To begin, please enter a name. This will help other people identify you in their contact list.</p>
        ${this.nameInputTemplate()}
        <p>Below is your shareable. This contains your name & publicKey. Give it to someone else, and get theirs to start chatting.</p>
        <p>You can find this again in ⚙️ Preferences</span>
        <button class="dismiss" @click=${this.handleDismissWelcome}>Got it</button>
        ${this.shareableTemplate(false)}
      </div>
    `;
  }
  shareableTemplate(showPublicKeyHash) {
    const publicKeyHashTemplate = p`
      <div class="box background">
        <p class="meta">Your publicKeyHash</p>
        <p class="wrap monospace select-all">${this.pref.keys.sig && this.pref.keys.sig.publicHash}</p>
      </div>
    `;
    return p`
      <div class="shareable">
        <div class="box background">
          <p class="meta">Your shareable</p>
          <p class="wrap monospace select-all">${this.pref.shareable}</p>
          <div class="qr">${this.qrCodeTemplate(this.pref.qrCodeShareable)}</div>
        </div>
        ${showPublicKeyHash ? publicKeyHashTemplate : void 0}
      </div>
    `;
  }
  qrCodeTemplate(imgDataUrl) {
    return p`<img srcset="${imgDataUrl}"/>`;
  }
  preferencesMenuTemplate() {
    return p`
        <npchat-menu
            .content=${this.preferencesTemplate()}
            .isOpen=${this.selectedMenu === "preferences"}>
        </npchat-menu>
      </div>
    `;
  }
  nameInputTemplate() {
    return p`
      <label>
        <span>Your name</span>
        <input type="text" id="preferences-name"
            .value=${this.pref.name}
            @input=${(e4) => this.handleChangeName(e4, false)}
            @change=${(e4) => this.handleChangeName(e4, true)}/>
      </label>
    `;
  }
  preferencesTemplate() {
    return p`
      <div id="preferences" class="preferences">
        <div class="preferences-group">
          <h3>🔗 Shareable</h3>
          ${this.shareableTemplate(true)}
          ${this.nameInputTemplate()}
        </div>
        <div class="preferences-group">
          <h3>🌐 Domain</h3>
          <p>This must point to a service that implements the <a href="https://github.com/dr-useless/npchat">npchat protocol</a>.</p>
          <label>
            <span>Domain</span>
            <input type="text" id="preferences-domain"
                .value=${this.pref.inboxDomain}
                @change=${(e4) => this.handleChangeInboxDomain(e4)}/>
          </label>
          ${this.statusTemplate()}
        </div>
        <div class="preferences-group">
          <h3>🔒 Security</h3>
          <p>The npchat protocol is designed to be provably secure, hostable anywhere & interoperable across hosts.</p>
          <p>A key trait of this design is that anyone who has your publicKeyHash & inbox domain can send you messages.</p>
          <p>You cannot trust the authenticity of any message without verifying it cryptographically.</p>
          <p>Two conditions must be met for a message to be verified: it must be signed by the sender & the sender must be in your contacts list. You can choose to accept only messages that have been verified.</p>
          <label>
            <span>Accept only verified messages (recommended)</span>
            <input type="checkbox" id="preferences-accept-only-verified"
                .checked=${this.pref.acceptOnlyVerified}
                @change=${(e4) => this.handleChangeAcceptOnlyVerified(e4)}/>
          </label>
        </div>
        <div class="preferences-group">
          <h3>💾 Import / Export</h3>
          <p>Either scan the QR code or open the link using another device. This will sync your name, keys & inbox domain.</p>
          <p>Warning: This feature is unsafe if anyone can see your screen.</p>
          <div class="export">
            <button @click=${() => this.showExport()}>${this.exportHidden ? "Show" : "Hide"} sensitive data</button>
            <div ?hidden=${this.exportHidden}>
              <div class="box background">
                <div class="wrap monospace select-all">${this.pref.exportLink}</div>
                <div class="qr">${this.qrCodeTemplate(this.pref.exportQRCode)}</div>
              </div>
            </div>
          </div>
          <p>You can push all messages to the inbox so that your other device can collect them. They can only be collected once each time, so you may need to push them again.</p>
          <button @click=${() => this.pushAllMessages()}>Push all messages to sync</button>
        </div>
      </div>
    `;
  }
  statusTemplate() {
    return p`
      <span class="error" ?hidden=${this.isAuthed}>💥 Connection failed</span>
      <span class="warn" ?hidden=${!this.isAuthed || this.isWebsocketOpen}>⚠️ No WebSocket connection</span>
      <span ?hidden=${!this.isAuthed || !this.isWebsocketOpen}>👍 Connected</span>
    `;
  }
  contactsMenuTemplate(selectedPubHash) {
    return p`
        <npchat-menu
            .content=${this.contactsTemplate(selectedPubHash)}
            .isOpen=${this.selectedMenu === "contacts"}>
        </npchat-menu>
      </div>
    `;
  }
  contactsTemplate(selectedPubHash) {
    return p`
      <div id="contacts" class="contacts">
        <ul class="no-list">
          ${this.contact.list.map((c2) => this.contactTemplate(c2, selectedPubHash))}
        </ul>
        <input id="contact-addtext" placeholder="Enter a shareable" @change=${(e4) => this.handleAddContact(e4)}>
      </div>
    `;
  }
  contactTemplate(c2, selectedPubHash) {
    return p`
      <li class="contact wrap ${selectedPubHash === c2.keys.sig.publicHash ? "selected" : ""}"
          @click=${() => this.contact.selectContact(c2)}>
        ${c2.name} [${c2.keys.sig.publicHash}]
      </li>
    `;
  }
  messagesTemplate(messages) {
    let prevMessageTime;
    return p`
      <div id="messages" class="messages">
        <ul class="no-list">
          ${messages.map((m2) => {
      const template = this.messageTemplate(m2, prevMessageTime);
      prevMessageTime = m2.t;
      return template;
    })}
        </ul>
        <form class="compose" @submit=${this.handleSendMessage}>
          <input id="message-compose" type="text"
            placeholder="Write a message to ${this.contact.selected ? this.contact.selected.name : ""}"/>
          <button type="submit">Send</button>
        </form>
      </div>
    `;
  }
  messageTemplate(message, prevMessageTime) {
    const sent = message.f === this.pref.keys.sig.publicHash;
    const v2 = message.v === true;
    const timeElapsedPrev = message.t - (prevMessageTime || message.t);
    const msToDayMultiplier = 1157407e-14;
    const daysElapsedPrev = timeElapsedPrev * msToDayMultiplier;
    const messageAge = Date.now() - message.t;
    let timeElapsedString;
    if (daysElapsedPrev >= 1) {
      timeElapsedString = `${Math.floor(messageAge * msToDayMultiplier)} day${daysElapsedPrev > 1 ? "s" : ""} ago`;
    }
    return p`
      <li class="meta milestone background">${timeElapsedString}</span>
      <li class="message wrap ${!v2 ? "warn" : ""} ${sent ? "sent" : "recieved"}">
        <div class="message-body">
          ${message.m}
        </div>
        <div class="message-footer">
          <span class="meta smaller">${v2 ? "\u{1F511}" : "\u26A0\uFE0F"}</span>
      </li>`;
  }
  render() {
    let messages = this.message.list || [];
    let selectedPubHash;
    if (this.contact.selected && this.contact.selected.keys) {
      selectedPubHash = this.contact.selected.keys.sig.publicHash;
      messages = (this.message.list || []).filter((m2) => m2.f === selectedPubHash || !m2.to);
    }
    messages = messages.slice(-20, messages.length).sort((a2, b2) => a2.t > b2.t);
    return p`
      ${this.headerTemplate()}
      <div class="main">
        <div>
          ${this.pref.welcomeDismissed ? void 0 : this.welcomeTemplate()}
          ${this.preferencesMenuTemplate()}
          ${this.contactsMenuTemplate(selectedPubHash)}
        </div>
        ${this.messagesTemplate(messages)}
      </div>
    `;
  }
  get contactInput() {
    return this.renderRoot?.querySelector("#contact-addtext") ?? null;
  }
  get messageInput() {
    return this.renderRoot?.querySelector("#message-compose") ?? null;
  }
};
__publicField(App, "properties", {
  pref: {},
  contact: {},
  auth: {},
  message: {},
  websocket: {},
  isWebsocketOpen: {},
  isAuthed: {},
  selectedMenu: {},
  exportHidden: {}
});

// src/component/menu.js
var Menu = class extends Base {
  constructor() {
    super();
    this.isOpen = false;
  }
  toggle() {
    this.isOpen = !this.isOpen;
  }
  render() {
    return p`
			${this.button ? p`<button class="menu-button" @click=${this.toggle}>${this.button}</button>` : void 0}
			<div class="menu-content" ?hidden=${!this.isOpen}>
				${this.content}
			</div>
		`;
  }
};
__publicField(Menu, "properties", {
  content: {},
  button: {},
  isOpen: {}
});

// src/index.js
window.addEventListener("DOMContentLoaded", () => {
  customElements.define("npchat-app", App);
  customElements.define("npchat-menu", Menu);
});
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
