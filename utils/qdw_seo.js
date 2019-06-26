/**
 * // 解密
 * // 返回对象
 * qdw_seo.decode(字符串)
 * 
 * // 加密
 * // 返回 字符串
 * qdw_seo.encode(字符串)
 * 
 * // 解析url 
 * // 返回对象
 * qdw_seo.analysisQuery(字符串/对象)
 * 
 */

const qdw_seo = (() => {
  /*
   *  base64.js
   *
   *  Licensed under the BSD 3-Clause License.
   *    http://opensource.org/licenses/BSD-3-Clause
   *
   *  References:
   *    http://en.wikipedia.org/wiki/Base64
   * 
   *  Source:
   *    https://github.com/dankogai/js-base64
   */
  const _base64 = (function () {
    'use strict';
    // existing version for noConflict()
    const global = {};
    var _Base64 = global.Base64;
    var version = "2.5.1";
    // if node.js and NOT React Native, we use Buffer
    var buffer;
    if (typeof module !== 'undefined' && module.exports) {
      try {
        buffer = eval("require('buffer').Buffer");
      } catch (err) {
        buffer = undefined;
      }
    }
    // constants
    var b64chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    var b64tab = function (bin) {
      var t = {};
      for (var i = 0, l = bin.length; i < l; i++) t[bin.charAt(i)] = i;
      return t;
    }(b64chars);
    var fromCharCode = String.fromCharCode;
    // encoder stuff
    var cb_utob = function (c) {
      if (c.length < 2) {
        var cc = c.charCodeAt(0);
        return cc < 0x80 ? c :
          cc < 0x800 ? (fromCharCode(0xc0 | (cc >>> 6)) +
            fromCharCode(0x80 | (cc & 0x3f))) :
          (fromCharCode(0xe0 | ((cc >>> 12) & 0x0f)) +
            fromCharCode(0x80 | ((cc >>> 6) & 0x3f)) +
            fromCharCode(0x80 | (cc & 0x3f)));
      } else {
        var cc = 0x10000 +
          (c.charCodeAt(0) - 0xD800) * 0x400 +
          (c.charCodeAt(1) - 0xDC00);
        return (fromCharCode(0xf0 | ((cc >>> 18) & 0x07)) +
          fromCharCode(0x80 | ((cc >>> 12) & 0x3f)) +
          fromCharCode(0x80 | ((cc >>> 6) & 0x3f)) +
          fromCharCode(0x80 | (cc & 0x3f)));
      }
    };
    var re_utob = /[\uD800-\uDBFF][\uDC00-\uDFFFF]|[^\x00-\x7F]/g;
    var utob = function (u) {
      return u.replace(re_utob, cb_utob);
    };
    var cb_encode = function (ccc) {
      var padlen = [0, 2, 1][ccc.length % 3],
        ord = ccc.charCodeAt(0) << 16 |
        ((ccc.length > 1 ? ccc.charCodeAt(1) : 0) << 8) |
        ((ccc.length > 2 ? ccc.charCodeAt(2) : 0)),
        chars = [
          b64chars.charAt(ord >>> 18),
          b64chars.charAt((ord >>> 12) & 63),
          padlen >= 2 ? '=' : b64chars.charAt((ord >>> 6) & 63),
          padlen >= 1 ? '=' : b64chars.charAt(ord & 63)
        ];
      return chars.join('');
    };
    var btoa = global.btoa ? function (b) {
      return global.btoa(b);
    } : function (b) {
      return b.replace(/[\s\S]{1,3}/g, cb_encode);
    };
    var _encode = buffer ?
      buffer.from && Uint8Array && buffer.from !== Uint8Array.from ?
      function (u) {
        return (u.constructor === buffer.constructor ? u : buffer.from(u))
          .toString('base64')
      } :
      function (u) {
        return (u.constructor === buffer.constructor ? u : new buffer(u))
          .toString('base64')
      } :
      function (u) {
        return btoa(utob(u))
      };
    var encode = function (u, urisafe) {
      return !urisafe ?
        _encode(String(u)) :
        _encode(String(u)).replace(/[+\/]/g, function (m0) {
          return m0 == '+' ? '-' : '_';
        }).replace(/=/g, '');
    };
    var encodeURI = function (u) {
      return encode(u, true)
    };
    // decoder stuff
    var re_btou = new RegExp([
      '[\xC0-\xDF][\x80-\xBF]',
      '[\xE0-\xEF][\x80-\xBF]{2}',
      '[\xF0-\xF7][\x80-\xBF]{3}'
    ].join('|'), 'g');
    var cb_btou = function (cccc) {
      switch (cccc.length) {
        case 4:
          var cp = ((0x07 & cccc.charCodeAt(0)) << 18) |
            ((0x3f & cccc.charCodeAt(1)) << 12) |
            ((0x3f & cccc.charCodeAt(2)) << 6) |
            (0x3f & cccc.charCodeAt(3)),
            offset = cp - 0x10000;
          return (fromCharCode((offset >>> 10) + 0xD800) +
            fromCharCode((offset & 0x3FF) + 0xDC00));
        case 3:
          return fromCharCode(
            ((0x0f & cccc.charCodeAt(0)) << 12) |
            ((0x3f & cccc.charCodeAt(1)) << 6) |
            (0x3f & cccc.charCodeAt(2))
          );
        default:
          return fromCharCode(
            ((0x1f & cccc.charCodeAt(0)) << 6) |
            (0x3f & cccc.charCodeAt(1))
          );
      }
    };
    var btou = function (b) {
      return b.replace(re_btou, cb_btou);
    };
    var cb_decode = function (cccc) {
      var len = cccc.length,
        padlen = len % 4,
        n = (len > 0 ? b64tab[cccc.charAt(0)] << 18 : 0) |
        (len > 1 ? b64tab[cccc.charAt(1)] << 12 : 0) |
        (len > 2 ? b64tab[cccc.charAt(2)] << 6 : 0) |
        (len > 3 ? b64tab[cccc.charAt(3)] : 0),
        chars = [
          fromCharCode(n >>> 16),
          fromCharCode((n >>> 8) & 0xff),
          fromCharCode(n & 0xff)
        ];
      chars.length -= [0, 0, 2, 1][padlen];
      return chars.join('');
    };
    var _atob = global.atob ? function (a) {
      return global.atob(a);
    } : function (a) {
      return a.replace(/\S{1,4}/g, cb_decode);
    };
    var atob = function (a) {
      return _atob(String(a).replace(/[^A-Za-z0-9\+\/]/g, ''));
    };
    var _decode = buffer ?
      buffer.from && Uint8Array && buffer.from !== Uint8Array.from ?
      function (a) {
        return (a.constructor === buffer.constructor ?
          a : buffer.from(a, 'base64')).toString();
      } :
      function (a) {
        return (a.constructor === buffer.constructor ?
          a : new buffer(a, 'base64')).toString();
      } :
      function (a) {
        return btou(_atob(a))
      };
    var decode = function (a) {
      return _decode(
        String(a).replace(/[-_]/g, function (m0) {
          return m0 == '-' ? '+' : '/'
        })
        .replace(/[^A-Za-z0-9\+\/]/g, '')
      );
    };
    var noConflict = function () {
      var Base64 = global.Base64;
      global.Base64 = _Base64;
      return Base64;
    };
    // export Base64
    global.Base64 = {
      VERSION: version,
      atob: atob,
      btoa: btoa,
      fromBase64: decode,
      toBase64: encode,
      utob: utob,
      encode: encode,
      encodeURI: encodeURI,
      btou: btou,
      decode: decode,
      noConflict: noConflict,
      __buffer__: buffer
    };
    // if ES5 is available, make Base64.extendString() available
    if (typeof Object.defineProperty === 'function') {
      var noEnum = function (v) {
        return {
          value: v,
          enumerable: false,
          writable: true,
          configurable: true
        };
      };
      global.Base64.extendString = function () {
        Object.defineProperty(
          String.prototype, 'fromBase64', noEnum(function () {
            return decode(this)
          }));
        Object.defineProperty(
          String.prototype, 'toBase64', noEnum(function (urisafe) {
            return encode(this, urisafe)
          }));
        Object.defineProperty(
          String.prototype, 'toBase64URI', noEnum(function () {
            return encode(this, true)
          }));
      };
    }
    //
    // export Base64 to the namespace
    //
    if (global['Meteor']) { // Meteor.js
      Base64 = global.Base64;
    }
    // module.exports and AMD are mutually exclusive.
    // module.exports has precedence.
    if (typeof module !== 'undefined' && module.exports) {
      module.exports.Base64 = global.Base64;
    } else if (typeof define === 'function' && define.amd) {
      // AMD. Register as an anonymous module.
      define([], function () {
        return global.Base64
      });
    }
    // that's it!
    return global.Base64;
  })();

  class Mix {
    constructor() {}
    /**
     * 混淆
     */
    enMix(str) {
      _mix.getPassword(str).forEach(mixLen => {
        str = _mix.mixBase(str, mixLen);
      });
      return str;
    }
    /**
     * 解混淆
     */
    deMix(str) {
      // 解混淆
      _mix
        .getPassword(str)
        .reverse()
        .forEach(mixLen => {
          str = _mix.mixBase(str, mixLen);
        });
      return str;
    }
    mixBase(str, mixLen = 2) {
      let newStr = "";

      /// 混淆算法
      // 缓存字符串
      let cacheStr = "";
      for (let i = 0; i < str.length; i++) {
        cacheStr += str[i];
        if (cacheStr.length === mixLen) {
          // 首尾位置交换
          const bStr = cacheStr[0],
            eStr = cacheStr[cacheStr.length - 1];
          cacheStr = `${eStr}${cacheStr.substring(
            1,
            cacheStr.length - 1
          )}${bStr}`;

          // 存储到新字符串并清空
          newStr += cacheStr;
          cacheStr = "";
        }
      }
      cacheStr.length > 0 && (newStr += cacheStr);
      /// 混淆结束

      return newStr;
    }
    /**
     * 获取密码
     */
    getPassword(str) {
      const pArr = [str.length];

      let run = true;
      while (run) {
        let nowNum = Math.ceil(pArr[pArr.length - 1] / 2);
        if (nowNum > 1) {
          pArr.push(nowNum);
        } else {
          run = false;
        }
      }
      return pArr;
    }
  }

  const _mix = new Mix();

  /**
   * 解析url字符串结构
   * 测试 getQueryData('?ald_media_id=7898&ald_link_key=84830d4aa8eae401&ald_position_id=0')
   * @returns
   * {
   *  ald_media_id:7898,
   *  ald_link_key:84830d4aa8eae401,
   *  ald_position_id:0
   * }
   */
  function getQueryData(str) {
    // 去除第一个问号
    str = str.replace(/^\?/, "");
    const query = {};

    // 处理query参数
    str.split("&").forEach(KV => {
      KV = KV.split("=");
      let K = KV[0],
        V = KV[1];
      query[K] = V;
    });

    return query;
  }

  /**
   * 加密
   * ?ald_media_id=7898&ald_link_key=84830d4aa8eae401&ald_position_id=0
   * encode('?ald_media_id=7898&ald_link_key=84830d4aa8eae401&ald_position_id=0')
   */
  function encode(str) {
    let newStr = "";

    newStr = str;
    // 去掉最后一个&
    newStr = newStr.replace(/\&$/, "");

    // 进行混淆
    newStr = _mix.enMix(newStr);

    // base64加密
    newStr = _base64.encode(newStr);

    // 去掉=号 (base64最后的=可以省略)
    newStr = newStr.replace(/\=/g, '')

    return _mix.enMix(newStr);
  }
  /**
   * 解密
   */
  function decode(str) {
    let newStr = _mix.deMix(str);
    // base64解密
    newStr = _base64.decode(newStr);
    // 解混淆
    newStr = _mix.deMix(newStr);

    return newStr;
  }

  /**
   * 解析url参数 可以是对象也可以是字符串
   *
   * 解析后返回 query对象
   *
   * 此参数数据必须为url参数
   *
   * 字符串： ?a=123&b=123 第一个问号默认会去掉,可以要可以不要
   *
   * @param {String|Object} query url参数
   *
   * @returns
   * {
   *  name:value
   * }
   */
  function analysisQuery(query) {
    query = typeof query === "string" ? getQueryData(query) : query;
    //qTop: qdw
    const qTop = [113, 100, 119]
      .map(s => String.fromCharCode(s))
      .toString()
      .replace(/\,/g, "");
    const newQuery = {};
    Object.keys(query).forEach(kName => {
      if (kName === qTop) {
        const q = getQueryData(decode(query[kName]));
        Object.assign(newQuery, q);
      } else {
        newQuery[kName] = query[kName];
      }
    });
    return newQuery;
  }

  function test() {
    [
      "ald_media_id=7898&ald_link_key=84830d4aa8eae401&ald_position_id=0",
      "ald_media_id=7898&ald_link_key=84830d4aa8eae401",
      "type=3",
      "a=1&b=2",
      "q=cache:tYiUnwJSJMgJwwwliaoxuefeng.com/wikipage/001399413803339f4bbda5c01fc479cbea98b1387390748000+&cd=9&hl=zh-CN&ct=clnk"
    ].map(sStr => {
      const eStr = encode(sStr),
        dStr = decode(eStr);
      console.log('加密：', eStr, '\n', '解密：', dStr);
      return sStr;
    }).map(sStr => {
      console.time();
      const eStr = encode(sStr);
      const dStr = decode(eStr);
      console.log({
        '原字符': sStr,
        '原长度': sStr.length,
        '混淆后': _base64.decode(_mix.deMix(eStr)),
        '加密后': eStr,
        '加密长度': eStr.length,
        '解密后': dStr,
        '解密长度': dStr.length,
        '匹配': sStr === dStr
      })

      console.timeEnd();
    });
  }

  return {
    decode,
    encode,
    analysisQuery,
    _base64,
    __test: test
  }
})();



typeof exports === 'object' && typeof module !== 'undefined' ?
  module.exports = qdw_seo :
  typeof define === 'function' && define.amd ?
  define(qdw_seo) :
  self !== 'undefined' ?
  self :
  typeof window !== 'undefined' ? window : qdw_seo;