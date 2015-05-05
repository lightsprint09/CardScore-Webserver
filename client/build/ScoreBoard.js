(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var React = require('react');
var ScoreBoard = require("../view/ScoreBoard.js");
var GameService = require("./GameService.js");
var url = require("url");

var gameID = url.parse(document.location.href + "", true).query.id;
GameService.getGameObject(gameID, gotObject);

function gotObject(err, obj) {
	obj = JSON.parse(obj);
	React.render(React.createElement(ScoreBoard, {game: obj}), document.body);
}

},{"../view/ScoreBoard.js":218,"./GameService.js":2,"react":166,"url":9}],2:[function(require,module,exports){
var request = require("./RequestHandler.js");

module.exports = {
		joinGame: joinGame,
		createGame: createGame,
		getGameObject: getGameObject,
		addPoints: addPoints
	};	
	
function joinGame(username, gameName) {
	document.location = "/addPlayer?username=" + username + "&gameID=" + gameName;
}

function addPoints(gameID, playerID, points, callback) {
	var data = {
		id: gameID,
		playerID: playerID,
		points: points
	};
	request.performPostRequest("/addPoints", data, didSubmitPoints);
	
	function didSubmitPoints(err, result) {
		var game = JSON.parse(result);
		callback(err, game);
	}
}

function createGame(username) {
	document.location = "/startGame?username=" + username;
}

function getGameObject(gameID, callback) {
	request.performGetRequest("/gameObject", {id: gameID}, callback);
}

function getName() {
	return name;
}
	 
},{"./RequestHandler.js":3}],3:[function(require,module,exports){
module.exports = (function() {
	"use strict";
		
	function performPostRequest(url, data, callback, headerOptions) {
		var xhr = new XMLHttpRequest();
		xhr.open("POST", url);
		handleRequest(xhr, callback, headerOptions);
		xhr.send(JSON.stringify(data));
	}
		
	function performGetRequest(url, data, callback, headerOptions) {
		url = addParameterToURL(url, data);
		var xhr = new XMLHttpRequest();	
		xhr.open("GET", url);
		handleRequest(xhr, callback, headerOptions);
		xhr.send();
	}
	
	var DEFAULT_HEADER_OPTIONS = {
		"Accept": "application/json",
		"Content-Type": "application/json"
	};
	
	function handleRequest(xhr, callback, headerOptions) {
		var header = headerOptions || DEFAULT_HEADER_OPTIONS;
		for(var key in header) {
			xhr.setRequestHeader(key, header[key]);
		}
		xhr.onreadystatechange = function onRequestReadyChange() {
			if(this.status === 401) {
				callback(new Error("Invalid Credentials"));
			}
			if (this.readyState == 4) {
				callback(null, this.responseText);
			}
		};
		xhr.onerror = function onReuqestError() {
			callback(new Error("An Error occured"));
		};
	}
	
	function getJSONParseCallback(callback) {
		function parseJSON(err, data) {
			if(data) {
				//TODO try/catch
				data = JSON.parse(data);
				callback(err, data);
			}else {
				callback(err);
			}
			
		};
		
		return parseJSON;
	}
	
	function addParameterToURL(url, parameters) {
		var result = url;
		var addCharacter = "?";
		for(var key in parameters) {
			url += (addCharacter + key + "=" + parameters[key]);
			addCharacter = "&";
		}
		
		return url;
	}
	
	return {
		performPostRequest: performPostRequest,
		performGetRequest: performGetRequest,
		getJSONParseCallback: getJSONParseCallback,
		addParameterToURL: addParameterToURL
	};
})()
},{}],4:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};
var queue = [];
var draining = false;

function drainQueue() {
    if (draining) {
        return;
    }
    draining = true;
    var currentQueue;
    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        var i = -1;
        while (++i < len) {
            currentQueue[i]();
        }
        len = queue.length;
    }
    draining = false;
}
process.nextTick = function (fun) {
    queue.push(fun);
    if (!draining) {
        setTimeout(drainQueue, 0);
    }
};

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],5:[function(require,module,exports){
(function (global){
/*! http://mths.be/punycode v1.2.4 by @mathias */
;(function(root) {

	/** Detect free variables */
	var freeExports = typeof exports == 'object' && exports;
	var freeModule = typeof module == 'object' && module &&
		module.exports == freeExports && module;
	var freeGlobal = typeof global == 'object' && global;
	if (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal) {
		root = freeGlobal;
	}

	/**
	 * The `punycode` object.
	 * @name punycode
	 * @type Object
	 */
	var punycode,

	/** Highest positive signed 32-bit float value */
	maxInt = 2147483647, // aka. 0x7FFFFFFF or 2^31-1

	/** Bootstring parameters */
	base = 36,
	tMin = 1,
	tMax = 26,
	skew = 38,
	damp = 700,
	initialBias = 72,
	initialN = 128, // 0x80
	delimiter = '-', // '\x2D'

	/** Regular expressions */
	regexPunycode = /^xn--/,
	regexNonASCII = /[^ -~]/, // unprintable ASCII chars + non-ASCII chars
	regexSeparators = /\x2E|\u3002|\uFF0E|\uFF61/g, // RFC 3490 separators

	/** Error messages */
	errors = {
		'overflow': 'Overflow: input needs wider integers to process',
		'not-basic': 'Illegal input >= 0x80 (not a basic code point)',
		'invalid-input': 'Invalid input'
	},

	/** Convenience shortcuts */
	baseMinusTMin = base - tMin,
	floor = Math.floor,
	stringFromCharCode = String.fromCharCode,

	/** Temporary variable */
	key;

	/*--------------------------------------------------------------------------*/

	/**
	 * A generic error utility function.
	 * @private
	 * @param {String} type The error type.
	 * @returns {Error} Throws a `RangeError` with the applicable error message.
	 */
	function error(type) {
		throw RangeError(errors[type]);
	}

	/**
	 * A generic `Array#map` utility function.
	 * @private
	 * @param {Array} array The array to iterate over.
	 * @param {Function} callback The function that gets called for every array
	 * item.
	 * @returns {Array} A new array of values returned by the callback function.
	 */
	function map(array, fn) {
		var length = array.length;
		while (length--) {
			array[length] = fn(array[length]);
		}
		return array;
	}

	/**
	 * A simple `Array#map`-like wrapper to work with domain name strings.
	 * @private
	 * @param {String} domain The domain name.
	 * @param {Function} callback The function that gets called for every
	 * character.
	 * @returns {Array} A new string of characters returned by the callback
	 * function.
	 */
	function mapDomain(string, fn) {
		return map(string.split(regexSeparators), fn).join('.');
	}

	/**
	 * Creates an array containing the numeric code points of each Unicode
	 * character in the string. While JavaScript uses UCS-2 internally,
	 * this function will convert a pair of surrogate halves (each of which
	 * UCS-2 exposes as separate characters) into a single code point,
	 * matching UTF-16.
	 * @see `punycode.ucs2.encode`
	 * @see <http://mathiasbynens.be/notes/javascript-encoding>
	 * @memberOf punycode.ucs2
	 * @name decode
	 * @param {String} string The Unicode input string (UCS-2).
	 * @returns {Array} The new array of code points.
	 */
	function ucs2decode(string) {
		var output = [],
		    counter = 0,
		    length = string.length,
		    value,
		    extra;
		while (counter < length) {
			value = string.charCodeAt(counter++);
			if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
				// high surrogate, and there is a next character
				extra = string.charCodeAt(counter++);
				if ((extra & 0xFC00) == 0xDC00) { // low surrogate
					output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
				} else {
					// unmatched surrogate; only append this code unit, in case the next
					// code unit is the high surrogate of a surrogate pair
					output.push(value);
					counter--;
				}
			} else {
				output.push(value);
			}
		}
		return output;
	}

	/**
	 * Creates a string based on an array of numeric code points.
	 * @see `punycode.ucs2.decode`
	 * @memberOf punycode.ucs2
	 * @name encode
	 * @param {Array} codePoints The array of numeric code points.
	 * @returns {String} The new Unicode string (UCS-2).
	 */
	function ucs2encode(array) {
		return map(array, function(value) {
			var output = '';
			if (value > 0xFFFF) {
				value -= 0x10000;
				output += stringFromCharCode(value >>> 10 & 0x3FF | 0xD800);
				value = 0xDC00 | value & 0x3FF;
			}
			output += stringFromCharCode(value);
			return output;
		}).join('');
	}

	/**
	 * Converts a basic code point into a digit/integer.
	 * @see `digitToBasic()`
	 * @private
	 * @param {Number} codePoint The basic numeric code point value.
	 * @returns {Number} The numeric value of a basic code point (for use in
	 * representing integers) in the range `0` to `base - 1`, or `base` if
	 * the code point does not represent a value.
	 */
	function basicToDigit(codePoint) {
		if (codePoint - 48 < 10) {
			return codePoint - 22;
		}
		if (codePoint - 65 < 26) {
			return codePoint - 65;
		}
		if (codePoint - 97 < 26) {
			return codePoint - 97;
		}
		return base;
	}

	/**
	 * Converts a digit/integer into a basic code point.
	 * @see `basicToDigit()`
	 * @private
	 * @param {Number} digit The numeric value of a basic code point.
	 * @returns {Number} The basic code point whose value (when used for
	 * representing integers) is `digit`, which needs to be in the range
	 * `0` to `base - 1`. If `flag` is non-zero, the uppercase form is
	 * used; else, the lowercase form is used. The behavior is undefined
	 * if `flag` is non-zero and `digit` has no uppercase form.
	 */
	function digitToBasic(digit, flag) {
		//  0..25 map to ASCII a..z or A..Z
		// 26..35 map to ASCII 0..9
		return digit + 22 + 75 * (digit < 26) - ((flag != 0) << 5);
	}

	/**
	 * Bias adaptation function as per section 3.4 of RFC 3492.
	 * http://tools.ietf.org/html/rfc3492#section-3.4
	 * @private
	 */
	function adapt(delta, numPoints, firstTime) {
		var k = 0;
		delta = firstTime ? floor(delta / damp) : delta >> 1;
		delta += floor(delta / numPoints);
		for (/* no initialization */; delta > baseMinusTMin * tMax >> 1; k += base) {
			delta = floor(delta / baseMinusTMin);
		}
		return floor(k + (baseMinusTMin + 1) * delta / (delta + skew));
	}

	/**
	 * Converts a Punycode string of ASCII-only symbols to a string of Unicode
	 * symbols.
	 * @memberOf punycode
	 * @param {String} input The Punycode string of ASCII-only symbols.
	 * @returns {String} The resulting string of Unicode symbols.
	 */
	function decode(input) {
		// Don't use UCS-2
		var output = [],
		    inputLength = input.length,
		    out,
		    i = 0,
		    n = initialN,
		    bias = initialBias,
		    basic,
		    j,
		    index,
		    oldi,
		    w,
		    k,
		    digit,
		    t,
		    /** Cached calculation results */
		    baseMinusT;

		// Handle the basic code points: let `basic` be the number of input code
		// points before the last delimiter, or `0` if there is none, then copy
		// the first basic code points to the output.

		basic = input.lastIndexOf(delimiter);
		if (basic < 0) {
			basic = 0;
		}

		for (j = 0; j < basic; ++j) {
			// if it's not a basic code point
			if (input.charCodeAt(j) >= 0x80) {
				error('not-basic');
			}
			output.push(input.charCodeAt(j));
		}

		// Main decoding loop: start just after the last delimiter if any basic code
		// points were copied; start at the beginning otherwise.

		for (index = basic > 0 ? basic + 1 : 0; index < inputLength; /* no final expression */) {

			// `index` is the index of the next character to be consumed.
			// Decode a generalized variable-length integer into `delta`,
			// which gets added to `i`. The overflow checking is easier
			// if we increase `i` as we go, then subtract off its starting
			// value at the end to obtain `delta`.
			for (oldi = i, w = 1, k = base; /* no condition */; k += base) {

				if (index >= inputLength) {
					error('invalid-input');
				}

				digit = basicToDigit(input.charCodeAt(index++));

				if (digit >= base || digit > floor((maxInt - i) / w)) {
					error('overflow');
				}

				i += digit * w;
				t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);

				if (digit < t) {
					break;
				}

				baseMinusT = base - t;
				if (w > floor(maxInt / baseMinusT)) {
					error('overflow');
				}

				w *= baseMinusT;

			}

			out = output.length + 1;
			bias = adapt(i - oldi, out, oldi == 0);

			// `i` was supposed to wrap around from `out` to `0`,
			// incrementing `n` each time, so we'll fix that now:
			if (floor(i / out) > maxInt - n) {
				error('overflow');
			}

			n += floor(i / out);
			i %= out;

			// Insert `n` at position `i` of the output
			output.splice(i++, 0, n);

		}

		return ucs2encode(output);
	}

	/**
	 * Converts a string of Unicode symbols to a Punycode string of ASCII-only
	 * symbols.
	 * @memberOf punycode
	 * @param {String} input The string of Unicode symbols.
	 * @returns {String} The resulting Punycode string of ASCII-only symbols.
	 */
	function encode(input) {
		var n,
		    delta,
		    handledCPCount,
		    basicLength,
		    bias,
		    j,
		    m,
		    q,
		    k,
		    t,
		    currentValue,
		    output = [],
		    /** `inputLength` will hold the number of code points in `input`. */
		    inputLength,
		    /** Cached calculation results */
		    handledCPCountPlusOne,
		    baseMinusT,
		    qMinusT;

		// Convert the input in UCS-2 to Unicode
		input = ucs2decode(input);

		// Cache the length
		inputLength = input.length;

		// Initialize the state
		n = initialN;
		delta = 0;
		bias = initialBias;

		// Handle the basic code points
		for (j = 0; j < inputLength; ++j) {
			currentValue = input[j];
			if (currentValue < 0x80) {
				output.push(stringFromCharCode(currentValue));
			}
		}

		handledCPCount = basicLength = output.length;

		// `handledCPCount` is the number of code points that have been handled;
		// `basicLength` is the number of basic code points.

		// Finish the basic string - if it is not empty - with a delimiter
		if (basicLength) {
			output.push(delimiter);
		}

		// Main encoding loop:
		while (handledCPCount < inputLength) {

			// All non-basic code points < n have been handled already. Find the next
			// larger one:
			for (m = maxInt, j = 0; j < inputLength; ++j) {
				currentValue = input[j];
				if (currentValue >= n && currentValue < m) {
					m = currentValue;
				}
			}

			// Increase `delta` enough to advance the decoder's <n,i> state to <m,0>,
			// but guard against overflow
			handledCPCountPlusOne = handledCPCount + 1;
			if (m - n > floor((maxInt - delta) / handledCPCountPlusOne)) {
				error('overflow');
			}

			delta += (m - n) * handledCPCountPlusOne;
			n = m;

			for (j = 0; j < inputLength; ++j) {
				currentValue = input[j];

				if (currentValue < n && ++delta > maxInt) {
					error('overflow');
				}

				if (currentValue == n) {
					// Represent delta as a generalized variable-length integer
					for (q = delta, k = base; /* no condition */; k += base) {
						t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);
						if (q < t) {
							break;
						}
						qMinusT = q - t;
						baseMinusT = base - t;
						output.push(
							stringFromCharCode(digitToBasic(t + qMinusT % baseMinusT, 0))
						);
						q = floor(qMinusT / baseMinusT);
					}

					output.push(stringFromCharCode(digitToBasic(q, 0)));
					bias = adapt(delta, handledCPCountPlusOne, handledCPCount == basicLength);
					delta = 0;
					++handledCPCount;
				}
			}

			++delta;
			++n;

		}
		return output.join('');
	}

	/**
	 * Converts a Punycode string representing a domain name to Unicode. Only the
	 * Punycoded parts of the domain name will be converted, i.e. it doesn't
	 * matter if you call it on a string that has already been converted to
	 * Unicode.
	 * @memberOf punycode
	 * @param {String} domain The Punycode domain name to convert to Unicode.
	 * @returns {String} The Unicode representation of the given Punycode
	 * string.
	 */
	function toUnicode(domain) {
		return mapDomain(domain, function(string) {
			return regexPunycode.test(string)
				? decode(string.slice(4).toLowerCase())
				: string;
		});
	}

	/**
	 * Converts a Unicode string representing a domain name to Punycode. Only the
	 * non-ASCII parts of the domain name will be converted, i.e. it doesn't
	 * matter if you call it with a domain that's already in ASCII.
	 * @memberOf punycode
	 * @param {String} domain The domain name to convert, as a Unicode string.
	 * @returns {String} The Punycode representation of the given domain name.
	 */
	function toASCII(domain) {
		return mapDomain(domain, function(string) {
			return regexNonASCII.test(string)
				? 'xn--' + encode(string)
				: string;
		});
	}

	/*--------------------------------------------------------------------------*/

	/** Define the public API */
	punycode = {
		/**
		 * A string representing the current Punycode.js version number.
		 * @memberOf punycode
		 * @type String
		 */
		'version': '1.2.4',
		/**
		 * An object of methods to convert from JavaScript's internal character
		 * representation (UCS-2) to Unicode code points, and back.
		 * @see <http://mathiasbynens.be/notes/javascript-encoding>
		 * @memberOf punycode
		 * @type Object
		 */
		'ucs2': {
			'decode': ucs2decode,
			'encode': ucs2encode
		},
		'decode': decode,
		'encode': encode,
		'toASCII': toASCII,
		'toUnicode': toUnicode
	};

	/** Expose `punycode` */
	// Some AMD build optimizers, like r.js, check for specific condition patterns
	// like the following:
	if (
		typeof define == 'function' &&
		typeof define.amd == 'object' &&
		define.amd
	) {
		define('punycode', function() {
			return punycode;
		});
	} else if (freeExports && !freeExports.nodeType) {
		if (freeModule) { // in Node.js or RingoJS v0.8.0+
			freeModule.exports = punycode;
		} else { // in Narwhal or RingoJS v0.7.0-
			for (key in punycode) {
				punycode.hasOwnProperty(key) && (freeExports[key] = punycode[key]);
			}
		}
	} else { // in Rhino or a web browser
		root.punycode = punycode;
	}

}(this));

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],6:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

// If obj.hasOwnProperty has been overridden, then calling
// obj.hasOwnProperty(prop) will break.
// See: https://github.com/joyent/node/issues/1707
function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

module.exports = function(qs, sep, eq, options) {
  sep = sep || '&';
  eq = eq || '=';
  var obj = {};

  if (typeof qs !== 'string' || qs.length === 0) {
    return obj;
  }

  var regexp = /\+/g;
  qs = qs.split(sep);

  var maxKeys = 1000;
  if (options && typeof options.maxKeys === 'number') {
    maxKeys = options.maxKeys;
  }

  var len = qs.length;
  // maxKeys <= 0 means that we should not limit keys count
  if (maxKeys > 0 && len > maxKeys) {
    len = maxKeys;
  }

  for (var i = 0; i < len; ++i) {
    var x = qs[i].replace(regexp, '%20'),
        idx = x.indexOf(eq),
        kstr, vstr, k, v;

    if (idx >= 0) {
      kstr = x.substr(0, idx);
      vstr = x.substr(idx + 1);
    } else {
      kstr = x;
      vstr = '';
    }

    k = decodeURIComponent(kstr);
    v = decodeURIComponent(vstr);

    if (!hasOwnProperty(obj, k)) {
      obj[k] = v;
    } else if (isArray(obj[k])) {
      obj[k].push(v);
    } else {
      obj[k] = [obj[k], v];
    }
  }

  return obj;
};

var isArray = Array.isArray || function (xs) {
  return Object.prototype.toString.call(xs) === '[object Array]';
};

},{}],7:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

var stringifyPrimitive = function(v) {
  switch (typeof v) {
    case 'string':
      return v;

    case 'boolean':
      return v ? 'true' : 'false';

    case 'number':
      return isFinite(v) ? v : '';

    default:
      return '';
  }
};

module.exports = function(obj, sep, eq, name) {
  sep = sep || '&';
  eq = eq || '=';
  if (obj === null) {
    obj = undefined;
  }

  if (typeof obj === 'object') {
    return map(objectKeys(obj), function(k) {
      var ks = encodeURIComponent(stringifyPrimitive(k)) + eq;
      if (isArray(obj[k])) {
        return map(obj[k], function(v) {
          return ks + encodeURIComponent(stringifyPrimitive(v));
        }).join(sep);
      } else {
        return ks + encodeURIComponent(stringifyPrimitive(obj[k]));
      }
    }).join(sep);

  }

  if (!name) return '';
  return encodeURIComponent(stringifyPrimitive(name)) + eq +
         encodeURIComponent(stringifyPrimitive(obj));
};

var isArray = Array.isArray || function (xs) {
  return Object.prototype.toString.call(xs) === '[object Array]';
};

function map (xs, f) {
  if (xs.map) return xs.map(f);
  var res = [];
  for (var i = 0; i < xs.length; i++) {
    res.push(f(xs[i], i));
  }
  return res;
}

var objectKeys = Object.keys || function (obj) {
  var res = [];
  for (var key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) res.push(key);
  }
  return res;
};

},{}],8:[function(require,module,exports){
'use strict';

exports.decode = exports.parse = require('./decode');
exports.encode = exports.stringify = require('./encode');

},{"./decode":6,"./encode":7}],9:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var punycode = require('punycode');

exports.parse = urlParse;
exports.resolve = urlResolve;
exports.resolveObject = urlResolveObject;
exports.format = urlFormat;

exports.Url = Url;

function Url() {
  this.protocol = null;
  this.slashes = null;
  this.auth = null;
  this.host = null;
  this.port = null;
  this.hostname = null;
  this.hash = null;
  this.search = null;
  this.query = null;
  this.pathname = null;
  this.path = null;
  this.href = null;
}

// Reference: RFC 3986, RFC 1808, RFC 2396

// define these here so at least they only have to be
// compiled once on the first module load.
var protocolPattern = /^([a-z0-9.+-]+:)/i,
    portPattern = /:[0-9]*$/,

    // RFC 2396: characters reserved for delimiting URLs.
    // We actually just auto-escape these.
    delims = ['<', '>', '"', '`', ' ', '\r', '\n', '\t'],

    // RFC 2396: characters not allowed for various reasons.
    unwise = ['{', '}', '|', '\\', '^', '`'].concat(delims),

    // Allowed by RFCs, but cause of XSS attacks.  Always escape these.
    autoEscape = ['\''].concat(unwise),
    // Characters that are never ever allowed in a hostname.
    // Note that any invalid chars are also handled, but these
    // are the ones that are *expected* to be seen, so we fast-path
    // them.
    nonHostChars = ['%', '/', '?', ';', '#'].concat(autoEscape),
    hostEndingChars = ['/', '?', '#'],
    hostnameMaxLen = 255,
    hostnamePartPattern = /^[a-z0-9A-Z_-]{0,63}$/,
    hostnamePartStart = /^([a-z0-9A-Z_-]{0,63})(.*)$/,
    // protocols that can allow "unsafe" and "unwise" chars.
    unsafeProtocol = {
      'javascript': true,
      'javascript:': true
    },
    // protocols that never have a hostname.
    hostlessProtocol = {
      'javascript': true,
      'javascript:': true
    },
    // protocols that always contain a // bit.
    slashedProtocol = {
      'http': true,
      'https': true,
      'ftp': true,
      'gopher': true,
      'file': true,
      'http:': true,
      'https:': true,
      'ftp:': true,
      'gopher:': true,
      'file:': true
    },
    querystring = require('querystring');

function urlParse(url, parseQueryString, slashesDenoteHost) {
  if (url && isObject(url) && url instanceof Url) return url;

  var u = new Url;
  u.parse(url, parseQueryString, slashesDenoteHost);
  return u;
}

Url.prototype.parse = function(url, parseQueryString, slashesDenoteHost) {
  if (!isString(url)) {
    throw new TypeError("Parameter 'url' must be a string, not " + typeof url);
  }

  var rest = url;

  // trim before proceeding.
  // This is to support parse stuff like "  http://foo.com  \n"
  rest = rest.trim();

  var proto = protocolPattern.exec(rest);
  if (proto) {
    proto = proto[0];
    var lowerProto = proto.toLowerCase();
    this.protocol = lowerProto;
    rest = rest.substr(proto.length);
  }

  // figure out if it's got a host
  // user@server is *always* interpreted as a hostname, and url
  // resolution will treat //foo/bar as host=foo,path=bar because that's
  // how the browser resolves relative URLs.
  if (slashesDenoteHost || proto || rest.match(/^\/\/[^@\/]+@[^@\/]+/)) {
    var slashes = rest.substr(0, 2) === '//';
    if (slashes && !(proto && hostlessProtocol[proto])) {
      rest = rest.substr(2);
      this.slashes = true;
    }
  }

  if (!hostlessProtocol[proto] &&
      (slashes || (proto && !slashedProtocol[proto]))) {

    // there's a hostname.
    // the first instance of /, ?, ;, or # ends the host.
    //
    // If there is an @ in the hostname, then non-host chars *are* allowed
    // to the left of the last @ sign, unless some host-ending character
    // comes *before* the @-sign.
    // URLs are obnoxious.
    //
    // ex:
    // http://a@b@c/ => user:a@b host:c
    // http://a@b?@c => user:a host:c path:/?@c

    // v0.12 TODO(isaacs): This is not quite how Chrome does things.
    // Review our test case against browsers more comprehensively.

    // find the first instance of any hostEndingChars
    var hostEnd = -1;
    for (var i = 0; i < hostEndingChars.length; i++) {
      var hec = rest.indexOf(hostEndingChars[i]);
      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd))
        hostEnd = hec;
    }

    // at this point, either we have an explicit point where the
    // auth portion cannot go past, or the last @ char is the decider.
    var auth, atSign;
    if (hostEnd === -1) {
      // atSign can be anywhere.
      atSign = rest.lastIndexOf('@');
    } else {
      // atSign must be in auth portion.
      // http://a@b/c@d => host:b auth:a path:/c@d
      atSign = rest.lastIndexOf('@', hostEnd);
    }

    // Now we have a portion which is definitely the auth.
    // Pull that off.
    if (atSign !== -1) {
      auth = rest.slice(0, atSign);
      rest = rest.slice(atSign + 1);
      this.auth = decodeURIComponent(auth);
    }

    // the host is the remaining to the left of the first non-host char
    hostEnd = -1;
    for (var i = 0; i < nonHostChars.length; i++) {
      var hec = rest.indexOf(nonHostChars[i]);
      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd))
        hostEnd = hec;
    }
    // if we still have not hit it, then the entire thing is a host.
    if (hostEnd === -1)
      hostEnd = rest.length;

    this.host = rest.slice(0, hostEnd);
    rest = rest.slice(hostEnd);

    // pull out port.
    this.parseHost();

    // we've indicated that there is a hostname,
    // so even if it's empty, it has to be present.
    this.hostname = this.hostname || '';

    // if hostname begins with [ and ends with ]
    // assume that it's an IPv6 address.
    var ipv6Hostname = this.hostname[0] === '[' &&
        this.hostname[this.hostname.length - 1] === ']';

    // validate a little.
    if (!ipv6Hostname) {
      var hostparts = this.hostname.split(/\./);
      for (var i = 0, l = hostparts.length; i < l; i++) {
        var part = hostparts[i];
        if (!part) continue;
        if (!part.match(hostnamePartPattern)) {
          var newpart = '';
          for (var j = 0, k = part.length; j < k; j++) {
            if (part.charCodeAt(j) > 127) {
              // we replace non-ASCII char with a temporary placeholder
              // we need this to make sure size of hostname is not
              // broken by replacing non-ASCII by nothing
              newpart += 'x';
            } else {
              newpart += part[j];
            }
          }
          // we test again with ASCII char only
          if (!newpart.match(hostnamePartPattern)) {
            var validParts = hostparts.slice(0, i);
            var notHost = hostparts.slice(i + 1);
            var bit = part.match(hostnamePartStart);
            if (bit) {
              validParts.push(bit[1]);
              notHost.unshift(bit[2]);
            }
            if (notHost.length) {
              rest = '/' + notHost.join('.') + rest;
            }
            this.hostname = validParts.join('.');
            break;
          }
        }
      }
    }

    if (this.hostname.length > hostnameMaxLen) {
      this.hostname = '';
    } else {
      // hostnames are always lower case.
      this.hostname = this.hostname.toLowerCase();
    }

    if (!ipv6Hostname) {
      // IDNA Support: Returns a puny coded representation of "domain".
      // It only converts the part of the domain name that
      // has non ASCII characters. I.e. it dosent matter if
      // you call it with a domain that already is in ASCII.
      var domainArray = this.hostname.split('.');
      var newOut = [];
      for (var i = 0; i < domainArray.length; ++i) {
        var s = domainArray[i];
        newOut.push(s.match(/[^A-Za-z0-9_-]/) ?
            'xn--' + punycode.encode(s) : s);
      }
      this.hostname = newOut.join('.');
    }

    var p = this.port ? ':' + this.port : '';
    var h = this.hostname || '';
    this.host = h + p;
    this.href += this.host;

    // strip [ and ] from the hostname
    // the host field still retains them, though
    if (ipv6Hostname) {
      this.hostname = this.hostname.substr(1, this.hostname.length - 2);
      if (rest[0] !== '/') {
        rest = '/' + rest;
      }
    }
  }

  // now rest is set to the post-host stuff.
  // chop off any delim chars.
  if (!unsafeProtocol[lowerProto]) {

    // First, make 100% sure that any "autoEscape" chars get
    // escaped, even if encodeURIComponent doesn't think they
    // need to be.
    for (var i = 0, l = autoEscape.length; i < l; i++) {
      var ae = autoEscape[i];
      var esc = encodeURIComponent(ae);
      if (esc === ae) {
        esc = escape(ae);
      }
      rest = rest.split(ae).join(esc);
    }
  }


  // chop off from the tail first.
  var hash = rest.indexOf('#');
  if (hash !== -1) {
    // got a fragment string.
    this.hash = rest.substr(hash);
    rest = rest.slice(0, hash);
  }
  var qm = rest.indexOf('?');
  if (qm !== -1) {
    this.search = rest.substr(qm);
    this.query = rest.substr(qm + 1);
    if (parseQueryString) {
      this.query = querystring.parse(this.query);
    }
    rest = rest.slice(0, qm);
  } else if (parseQueryString) {
    // no query string, but parseQueryString still requested
    this.search = '';
    this.query = {};
  }
  if (rest) this.pathname = rest;
  if (slashedProtocol[lowerProto] &&
      this.hostname && !this.pathname) {
    this.pathname = '/';
  }

  //to support http.request
  if (this.pathname || this.search) {
    var p = this.pathname || '';
    var s = this.search || '';
    this.path = p + s;
  }

  // finally, reconstruct the href based on what has been validated.
  this.href = this.format();
  return this;
};

// format a parsed object into a url string
function urlFormat(obj) {
  // ensure it's an object, and not a string url.
  // If it's an obj, this is a no-op.
  // this way, you can call url_format() on strings
  // to clean up potentially wonky urls.
  if (isString(obj)) obj = urlParse(obj);
  if (!(obj instanceof Url)) return Url.prototype.format.call(obj);
  return obj.format();
}

Url.prototype.format = function() {
  var auth = this.auth || '';
  if (auth) {
    auth = encodeURIComponent(auth);
    auth = auth.replace(/%3A/i, ':');
    auth += '@';
  }

  var protocol = this.protocol || '',
      pathname = this.pathname || '',
      hash = this.hash || '',
      host = false,
      query = '';

  if (this.host) {
    host = auth + this.host;
  } else if (this.hostname) {
    host = auth + (this.hostname.indexOf(':') === -1 ?
        this.hostname :
        '[' + this.hostname + ']');
    if (this.port) {
      host += ':' + this.port;
    }
  }

  if (this.query &&
      isObject(this.query) &&
      Object.keys(this.query).length) {
    query = querystring.stringify(this.query);
  }

  var search = this.search || (query && ('?' + query)) || '';

  if (protocol && protocol.substr(-1) !== ':') protocol += ':';

  // only the slashedProtocols get the //.  Not mailto:, xmpp:, etc.
  // unless they had them to begin with.
  if (this.slashes ||
      (!protocol || slashedProtocol[protocol]) && host !== false) {
    host = '//' + (host || '');
    if (pathname && pathname.charAt(0) !== '/') pathname = '/' + pathname;
  } else if (!host) {
    host = '';
  }

  if (hash && hash.charAt(0) !== '#') hash = '#' + hash;
  if (search && search.charAt(0) !== '?') search = '?' + search;

  pathname = pathname.replace(/[?#]/g, function(match) {
    return encodeURIComponent(match);
  });
  search = search.replace('#', '%23');

  return protocol + host + pathname + search + hash;
};

function urlResolve(source, relative) {
  return urlParse(source, false, true).resolve(relative);
}

Url.prototype.resolve = function(relative) {
  return this.resolveObject(urlParse(relative, false, true)).format();
};

function urlResolveObject(source, relative) {
  if (!source) return relative;
  return urlParse(source, false, true).resolveObject(relative);
}

Url.prototype.resolveObject = function(relative) {
  if (isString(relative)) {
    var rel = new Url();
    rel.parse(relative, false, true);
    relative = rel;
  }

  var result = new Url();
  Object.keys(this).forEach(function(k) {
    result[k] = this[k];
  }, this);

  // hash is always overridden, no matter what.
  // even href="" will remove it.
  result.hash = relative.hash;

  // if the relative url is empty, then there's nothing left to do here.
  if (relative.href === '') {
    result.href = result.format();
    return result;
  }

  // hrefs like //foo/bar always cut to the protocol.
  if (relative.slashes && !relative.protocol) {
    // take everything except the protocol from relative
    Object.keys(relative).forEach(function(k) {
      if (k !== 'protocol')
        result[k] = relative[k];
    });

    //urlParse appends trailing / to urls like http://www.example.com
    if (slashedProtocol[result.protocol] &&
        result.hostname && !result.pathname) {
      result.path = result.pathname = '/';
    }

    result.href = result.format();
    return result;
  }

  if (relative.protocol && relative.protocol !== result.protocol) {
    // if it's a known url protocol, then changing
    // the protocol does weird things
    // first, if it's not file:, then we MUST have a host,
    // and if there was a path
    // to begin with, then we MUST have a path.
    // if it is file:, then the host is dropped,
    // because that's known to be hostless.
    // anything else is assumed to be absolute.
    if (!slashedProtocol[relative.protocol]) {
      Object.keys(relative).forEach(function(k) {
        result[k] = relative[k];
      });
      result.href = result.format();
      return result;
    }

    result.protocol = relative.protocol;
    if (!relative.host && !hostlessProtocol[relative.protocol]) {
      var relPath = (relative.pathname || '').split('/');
      while (relPath.length && !(relative.host = relPath.shift()));
      if (!relative.host) relative.host = '';
      if (!relative.hostname) relative.hostname = '';
      if (relPath[0] !== '') relPath.unshift('');
      if (relPath.length < 2) relPath.unshift('');
      result.pathname = relPath.join('/');
    } else {
      result.pathname = relative.pathname;
    }
    result.search = relative.search;
    result.query = relative.query;
    result.host = relative.host || '';
    result.auth = relative.auth;
    result.hostname = relative.hostname || relative.host;
    result.port = relative.port;
    // to support http.request
    if (result.pathname || result.search) {
      var p = result.pathname || '';
      var s = result.search || '';
      result.path = p + s;
    }
    result.slashes = result.slashes || relative.slashes;
    result.href = result.format();
    return result;
  }

  var isSourceAbs = (result.pathname && result.pathname.charAt(0) === '/'),
      isRelAbs = (
          relative.host ||
          relative.pathname && relative.pathname.charAt(0) === '/'
      ),
      mustEndAbs = (isRelAbs || isSourceAbs ||
                    (result.host && relative.pathname)),
      removeAllDots = mustEndAbs,
      srcPath = result.pathname && result.pathname.split('/') || [],
      relPath = relative.pathname && relative.pathname.split('/') || [],
      psychotic = result.protocol && !slashedProtocol[result.protocol];

  // if the url is a non-slashed url, then relative
  // links like ../.. should be able
  // to crawl up to the hostname, as well.  This is strange.
  // result.protocol has already been set by now.
  // Later on, put the first path part into the host field.
  if (psychotic) {
    result.hostname = '';
    result.port = null;
    if (result.host) {
      if (srcPath[0] === '') srcPath[0] = result.host;
      else srcPath.unshift(result.host);
    }
    result.host = '';
    if (relative.protocol) {
      relative.hostname = null;
      relative.port = null;
      if (relative.host) {
        if (relPath[0] === '') relPath[0] = relative.host;
        else relPath.unshift(relative.host);
      }
      relative.host = null;
    }
    mustEndAbs = mustEndAbs && (relPath[0] === '' || srcPath[0] === '');
  }

  if (isRelAbs) {
    // it's absolute.
    result.host = (relative.host || relative.host === '') ?
                  relative.host : result.host;
    result.hostname = (relative.hostname || relative.hostname === '') ?
                      relative.hostname : result.hostname;
    result.search = relative.search;
    result.query = relative.query;
    srcPath = relPath;
    // fall through to the dot-handling below.
  } else if (relPath.length) {
    // it's relative
    // throw away the existing file, and take the new path instead.
    if (!srcPath) srcPath = [];
    srcPath.pop();
    srcPath = srcPath.concat(relPath);
    result.search = relative.search;
    result.query = relative.query;
  } else if (!isNullOrUndefined(relative.search)) {
    // just pull out the search.
    // like href='?foo'.
    // Put this after the other two cases because it simplifies the booleans
    if (psychotic) {
      result.hostname = result.host = srcPath.shift();
      //occationaly the auth can get stuck only in host
      //this especialy happens in cases like
      //url.resolveObject('mailto:local1@domain1', 'local2@domain2')
      var authInHost = result.host && result.host.indexOf('@') > 0 ?
                       result.host.split('@') : false;
      if (authInHost) {
        result.auth = authInHost.shift();
        result.host = result.hostname = authInHost.shift();
      }
    }
    result.search = relative.search;
    result.query = relative.query;
    //to support http.request
    if (!isNull(result.pathname) || !isNull(result.search)) {
      result.path = (result.pathname ? result.pathname : '') +
                    (result.search ? result.search : '');
    }
    result.href = result.format();
    return result;
  }

  if (!srcPath.length) {
    // no path at all.  easy.
    // we've already handled the other stuff above.
    result.pathname = null;
    //to support http.request
    if (result.search) {
      result.path = '/' + result.search;
    } else {
      result.path = null;
    }
    result.href = result.format();
    return result;
  }

  // if a url ENDs in . or .., then it must get a trailing slash.
  // however, if it ends in anything else non-slashy,
  // then it must NOT get a trailing slash.
  var last = srcPath.slice(-1)[0];
  var hasTrailingSlash = (
      (result.host || relative.host) && (last === '.' || last === '..') ||
      last === '');

  // strip single dots, resolve double dots to parent dir
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = srcPath.length; i >= 0; i--) {
    last = srcPath[i];
    if (last == '.') {
      srcPath.splice(i, 1);
    } else if (last === '..') {
      srcPath.splice(i, 1);
      up++;
    } else if (up) {
      srcPath.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (!mustEndAbs && !removeAllDots) {
    for (; up--; up) {
      srcPath.unshift('..');
    }
  }

  if (mustEndAbs && srcPath[0] !== '' &&
      (!srcPath[0] || srcPath[0].charAt(0) !== '/')) {
    srcPath.unshift('');
  }

  if (hasTrailingSlash && (srcPath.join('/').substr(-1) !== '/')) {
    srcPath.push('');
  }

  var isAbsolute = srcPath[0] === '' ||
      (srcPath[0] && srcPath[0].charAt(0) === '/');

  // put the host back
  if (psychotic) {
    result.hostname = result.host = isAbsolute ? '' :
                                    srcPath.length ? srcPath.shift() : '';
    //occationaly the auth can get stuck only in host
    //this especialy happens in cases like
    //url.resolveObject('mailto:local1@domain1', 'local2@domain2')
    var authInHost = result.host && result.host.indexOf('@') > 0 ?
                     result.host.split('@') : false;
    if (authInHost) {
      result.auth = authInHost.shift();
      result.host = result.hostname = authInHost.shift();
    }
  }

  mustEndAbs = mustEndAbs || (result.host && srcPath.length);

  if (mustEndAbs && !isAbsolute) {
    srcPath.unshift('');
  }

  if (!srcPath.length) {
    result.pathname = null;
    result.path = null;
  } else {
    result.pathname = srcPath.join('/');
  }

  //to support request.http
  if (!isNull(result.pathname) || !isNull(result.search)) {
    result.path = (result.pathname ? result.pathname : '') +
                  (result.search ? result.search : '');
  }
  result.auth = relative.auth || result.auth;
  result.slashes = result.slashes || relative.slashes;
  result.href = result.format();
  return result;
};

Url.prototype.parseHost = function() {
  var host = this.host;
  var port = portPattern.exec(host);
  if (port) {
    port = port[0];
    if (port !== ':') {
      this.port = port.substr(1);
    }
    host = host.substr(0, host.length - port.length);
  }
  if (host) this.hostname = host;
};

function isString(arg) {
  return typeof arg === "string";
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isNull(arg) {
  return arg === null;
}
function isNullOrUndefined(arg) {
  return  arg == null;
}

},{"punycode":5,"querystring":8}],10:[function(require,module,exports){
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module unless amdModuleId is set
    define([], function () {
      return (root['Chartist'] = factory());
    });
  } else if (typeof exports === 'object') {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like environments that support module.exports,
    // like Node.
    module.exports = factory();
  } else {
    root['Chartist'] = factory();
  }
}(this, function () {

/* Chartist.js 0.7.4
 * Copyright © 2015 Gion Kunz
 * Free to use under the WTFPL license.
 * http://www.wtfpl.net/
 */
/**
 * The core module of Chartist that is mainly providing static functions and higher level functions for chart modules.
 *
 * @module Chartist.Core
 */
var Chartist = {
  version: '0.7.4'
};

(function (window, document, Chartist) {
  'use strict';

  /**
   * Helps to simplify functional style code
   *
   * @memberof Chartist.Core
   * @param {*} n This exact value will be returned by the noop function
   * @return {*} The same value that was provided to the n parameter
   */
  Chartist.noop = function (n) {
    return n;
  };

  /**
   * Generates a-z from a number 0 to 26
   *
   * @memberof Chartist.Core
   * @param {Number} n A number from 0 to 26 that will result in a letter a-z
   * @return {String} A character from a-z based on the input number n
   */
  Chartist.alphaNumerate = function (n) {
    // Limit to a-z
    return String.fromCharCode(97 + n % 26);
  };

  /**
   * Simple recursive object extend
   *
   * @memberof Chartist.Core
   * @param {Object} target Target object where the source will be merged into
   * @param {Object...} sources This object (objects) will be merged into target and then target is returned
   * @return {Object} An object that has the same reference as target but is extended and merged with the properties of source
   */
  Chartist.extend = function (target) {
    target = target || {};

    var sources = Array.prototype.slice.call(arguments, 1);
    sources.forEach(function(source) {
      for (var prop in source) {
        if (typeof source[prop] === 'object' && !(source[prop] instanceof Array)) {
          target[prop] = Chartist.extend({}, target[prop], source[prop]);
        } else {
          target[prop] = source[prop];
        }
      }
    });

    return target;
  };

  /**
   * Replaces all occurrences of subStr in str with newSubStr and returns a new string.
   *
   * @memberof Chartist.Core
   * @param {String} str
   * @param {String} subStr
   * @param {String} newSubStr
   * @return {String}
   */
  Chartist.replaceAll = function(str, subStr, newSubStr) {
    return str.replace(new RegExp(subStr, 'g'), newSubStr);
  };

  /**
   * Converts a string to a number while removing the unit if present. If a number is passed then this will be returned unmodified.
   *
   * @memberof Chartist.Core
   * @param {String|Number} value
   * @return {Number} Returns the string as number or NaN if the passed length could not be converted to pixel
   */
  Chartist.stripUnit = function(value) {
    if(typeof value === 'string') {
      value = value.replace(/[^0-9\+-\.]/g, '');
    }

    return +value;
  };

  /**
   * Converts a number to a string with a unit. If a string is passed then this will be returned unmodified.
   *
   * @memberof Chartist.Core
   * @param {Number} value
   * @param {String} unit
   * @return {String} Returns the passed number value with unit.
   */
  Chartist.ensureUnit = function(value, unit) {
    if(typeof value === 'number') {
      value = value + unit;
    }

    return value;
  };

  /**
   * This is a wrapper around document.querySelector that will return the query if it's already of type Node
   *
   * @memberof Chartist.Core
   * @param {String|Node} query The query to use for selecting a Node or a DOM node that will be returned directly
   * @return {Node}
   */
  Chartist.querySelector = function(query) {
    return query instanceof Node ? query : document.querySelector(query);
  };

  /**
   * Functional style helper to produce array with given length initialized with undefined values
   *
   * @memberof Chartist.Core
   * @param length
   * @return {Array}
   */
  Chartist.times = function(length) {
    return Array.apply(null, new Array(length));
  };

  /**
   * Sum helper to be used in reduce functions
   *
   * @memberof Chartist.Core
   * @param previous
   * @param current
   * @return {*}
   */
  Chartist.sum = function(previous, current) {
    return previous + current;
  };

  /**
   * Map for multi dimensional arrays where their nested arrays will be mapped in serial. The output array will have the length of the largest nested array. The callback function is called with variable arguments where each argument is the nested array value (or undefined if there are no more values).
   *
   * @memberof Chartist.Core
   * @param arr
   * @param cb
   * @return {Array}
   */
  Chartist.serialMap = function(arr, cb) {
    var result = [],
        length = Math.max.apply(null, arr.map(function(e) {
          return e.length;
        }));

    Chartist.times(length).forEach(function(e, index) {
      var args = arr.map(function(e) {
        return e[index];
      });

      result[index] = cb.apply(null, args);
    });

    return result;
  };

  /**
   * This helper function can be used to round values with certain precision level after decimal. This is used to prevent rounding errors near float point precision limit.
   *
   * @memberof Chartist.Core
   * @param {Number} value The value that should be rounded with precision
   * @param {Number} [digits] The number of digits after decimal used to do the rounding
   * @returns {number} Rounded value
   */
  Chartist.roundWithPrecision = function(value, digits) {
    var precision = Math.pow(10, digits || Chartist.precision);
    return Math.round(value * precision) / precision;
  };

  /**
   * Precision level used internally in Chartist for rounding. If you require more decimal places you can increase this number.
   *
   * @memberof Chartist.Core
   * @type {number}
   */
  Chartist.precision = 8;

  /**
   * A map with characters to escape for strings to be safely used as attribute values.
   *
   * @memberof Chartist.Core
   * @type {Object}
   */
  Chartist.escapingMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    '\'': '&#039;'
  };

  /**
   * This function serializes arbitrary data to a string. In case of data that can't be easily converted to a string, this function will create a wrapper object and serialize the data using JSON.stringify. The outcoming string will always be escaped using Chartist.escapingMap.
   * If called with null or undefined the function will return immediately with null or undefined.
   *
   * @memberof Chartist.Core
   * @param {Number|String|Object} data
   * @return {String}
   */
  Chartist.serialize = function(data) {
    if(data === null || data === undefined) {
      return data;
    } else if(typeof data === 'number') {
      data = ''+data;
    } else if(typeof data === 'object') {
      data = JSON.stringify({data: data});
    }

    return Object.keys(Chartist.escapingMap).reduce(function(result, key) {
      return Chartist.replaceAll(result, key, Chartist.escapingMap[key]);
    }, data);
  };

  /**
   * This function de-serializes a string previously serialized with Chartist.serialize. The string will always be unescaped using Chartist.escapingMap before it's returned. Based on the input value the return type can be Number, String or Object. JSON.parse is used with try / catch to see if the unescaped string can be parsed into an Object and this Object will be returned on success.
   *
   * @memberof Chartist.Core
   * @param {String} data
   * @return {String|Number|Object}
   */
  Chartist.deserialize = function(data) {
    if(typeof data !== 'string') {
      return data;
    }

    data = Object.keys(Chartist.escapingMap).reduce(function(result, key) {
      return Chartist.replaceAll(result, Chartist.escapingMap[key], key);
    }, data);

    try {
      data = JSON.parse(data);
      data = data.data !== undefined ? data.data : data;
    } catch(e) {}

    return data;
  };

  /**
   * Create or reinitialize the SVG element for the chart
   *
   * @memberof Chartist.Core
   * @param {Node} container The containing DOM Node object that will be used to plant the SVG element
   * @param {String} width Set the width of the SVG element. Default is 100%
   * @param {String} height Set the height of the SVG element. Default is 100%
   * @param {String} className Specify a class to be added to the SVG element
   * @return {Object} The created/reinitialized SVG element
   */
  Chartist.createSvg = function (container, width, height, className) {
    var svg;

    width = width || '100%';
    height = height || '100%';

    // Check if there is a previous SVG element in the container that contains the Chartist XML namespace and remove it
    // Since the DOM API does not support namespaces we need to manually search the returned list http://www.w3.org/TR/selectors-api/
    Array.prototype.slice.call(container.querySelectorAll('svg')).filter(function filterChartistSvgObjects(svg) {
      return svg.getAttribute(Chartist.xmlNs.qualifiedName);
    }).forEach(function removePreviousElement(svg) {
      container.removeChild(svg);
    });

    // Create svg object with width and height or use 100% as default
    svg = new Chartist.Svg('svg').attr({
      width: width,
      height: height
    }).addClass(className).attr({
      style: 'width: ' + width + '; height: ' + height + ';'
    });

    // Add the DOM node to our container
    container.appendChild(svg._node);

    return svg;
  };


  /**
   * Reverses the series, labels and series data arrays.
   *
   * @memberof Chartist.Core
   * @param data
   */
  Chartist.reverseData = function(data) {
    data.labels.reverse();
    data.series.reverse();
    for (var i = 0; i < data.series.length; i++) {
      if(typeof(data.series[i]) === 'object' && data.series[i].data !== undefined) {
        data.series[i].data.reverse();
      } else {
        data.series[i].reverse();
      }
    }
  };

  /**
   * Convert data series into plain array
   *
   * @memberof Chartist.Core
   * @param {Object} data The series object that contains the data to be visualized in the chart
   * @param {Boolean} reverse If true the whole data is reversed by the getDataArray call. This will modify the data object passed as first parameter. The labels as well as the series order is reversed. The whole series data arrays are reversed too.
   * @return {Array} A plain array that contains the data to be visualized in the chart
   */
  Chartist.getDataArray = function (data, reverse) {
    var array = [],
      value,
      localData;

    // If the data should be reversed but isn't we need to reverse it
    // If it's reversed but it shouldn't we need to reverse it back
    // That's required to handle data updates correctly and to reflect the responsive configurations
    if(reverse && !data.reversed || !reverse && data.reversed) {
      Chartist.reverseData(data);
      data.reversed = !data.reversed;
    }

    for (var i = 0; i < data.series.length; i++) {
      // If the series array contains an object with a data property we will use the property
      // otherwise the value directly (array or number).
      // We create a copy of the original data array with Array.prototype.push.apply
      localData = typeof(data.series[i]) === 'object' && data.series[i].data !== undefined ? data.series[i].data : data.series[i];
      if(localData instanceof Array) {
        array[i] = [];
        Array.prototype.push.apply(array[i], localData);
      } else {
        array[i] = localData;
      }

      // Convert object values to numbers
      for (var j = 0; j < array[i].length; j++) {
        value = array[i][j];
        value = value.value === 0 ? 0 : (value.value || value);
        array[i][j] = +value;
      }
    }

    return array;
  };

  /**
   * Converts a number into a padding object.
   *
   * @memberof Chartist.Core
   * @param {Object|Number} padding
   * @param {Number} [fallback] This value is used to fill missing values if a incomplete padding object was passed
   * @returns {Object} Returns a padding object containing top, right, bottom, left properties filled with the padding number passed in as argument. If the argument is something else than a number (presumably already a correct padding object) then this argument is directly returned.
   */
  Chartist.normalizePadding = function(padding, fallback) {
    fallback = fallback || 0;

    return typeof padding === 'number' ? {
      top: padding,
      right: padding,
      bottom: padding,
      left: padding
    } : {
      top: typeof padding.top === 'number' ? padding.top : fallback,
      right: typeof padding.right === 'number' ? padding.right : fallback,
      bottom: typeof padding.bottom === 'number' ? padding.bottom : fallback,
      left: typeof padding.left === 'number' ? padding.left : fallback
    };
  };

  /**
   * Adds missing values at the end of the array. This array contains the data, that will be visualized in the chart
   *
   * @memberof Chartist.Core
   * @param {Array} dataArray The array that contains the data to be visualized in the chart. The array in this parameter will be modified by function.
   * @param {Number} length The length of the x-axis data array.
   * @return {Array} The array that got updated with missing values.
   */
  Chartist.normalizeDataArray = function (dataArray, length) {
    for (var i = 0; i < dataArray.length; i++) {
      if (dataArray[i].length === length) {
        continue;
      }

      for (var j = dataArray[i].length; j < length; j++) {
        dataArray[i][j] = 0;
      }
    }

    return dataArray;
  };

  Chartist.getMetaData = function(series, index) {
    var value = series.data ? series.data[index] : series[index];
    return value ? Chartist.serialize(value.meta) : undefined;
  };

  /**
   * Calculate the order of magnitude for the chart scale
   *
   * @memberof Chartist.Core
   * @param {Number} value The value Range of the chart
   * @return {Number} The order of magnitude
   */
  Chartist.orderOfMagnitude = function (value) {
    return Math.floor(Math.log(Math.abs(value)) / Math.LN10);
  };

  /**
   * Project a data length into screen coordinates (pixels)
   *
   * @memberof Chartist.Core
   * @param {Object} axisLength The svg element for the chart
   * @param {Number} length Single data value from a series array
   * @param {Object} bounds All the values to set the bounds of the chart
   * @return {Number} The projected data length in pixels
   */
  Chartist.projectLength = function (axisLength, length, bounds) {
    return length / bounds.range * axisLength;
  };

  /**
   * Get the height of the area in the chart for the data series
   *
   * @memberof Chartist.Core
   * @param {Object} svg The svg element for the chart
   * @param {Object} options The Object that contains all the optional values for the chart
   * @return {Number} The height of the area in the chart for the data series
   */
  Chartist.getAvailableHeight = function (svg, options) {
    return Math.max((Chartist.stripUnit(options.height) || svg.height()) - (options.chartPadding.top +  options.chartPadding.bottom) - options.axisX.offset, 0);
  };

  /**
   * Get highest and lowest value of data array. This Array contains the data that will be visualized in the chart.
   *
   * @memberof Chartist.Core
   * @param {Array} dataArray The array that contains the data to be visualized in the chart
   * @return {Object} An object that contains the highest and lowest value that will be visualized on the chart.
   */
  Chartist.getHighLow = function (dataArray) {
    var i,
      j,
      highLow = {
        high: -Number.MAX_VALUE,
        low: Number.MAX_VALUE
      };

    for (i = 0; i < dataArray.length; i++) {
      for (j = 0; j < dataArray[i].length; j++) {
        if (dataArray[i][j] > highLow.high) {
          highLow.high = dataArray[i][j];
        }

        if (dataArray[i][j] < highLow.low) {
          highLow.low = dataArray[i][j];
        }
      }
    }

    return highLow;
  };

  /**
   * Calculate and retrieve all the bounds for the chart and return them in one array
   *
   * @memberof Chartist.Core
   * @param {Number} axisLength The length of the Axis used for
   * @param {Object} highLow An object containing a high and low property indicating the value range of the chart.
   * @param {Number} scaleMinSpace The minimum projected length a step should result in
   * @param {Number} referenceValue The reference value for the chart.
   * @return {Object} All the values to set the bounds of the chart
   */
  Chartist.getBounds = function (axisLength, highLow, scaleMinSpace, referenceValue) {
    var i,
      newMin,
      newMax,
      bounds = {
        high: highLow.high,
        low: highLow.low
      };

    // If high and low are the same because of misconfiguration or flat data (only the same value) we need
    // to set the high or low to 0 depending on the polarity
    if(bounds.high === bounds.low) {
      // If both values are 0 we set high to 1
      if(bounds.low === 0) {
        bounds.high = 1;
      } else if(bounds.low < 0) {
        // If we have the same negative value for the bounds we set bounds.high to 0
        bounds.high = 0;
      } else {
        // If we have the same positive value for the bounds we set bounds.low to 0
        bounds.low = 0;
      }
    }

    // Overrides of high / low based on reference value, it will make sure that the invisible reference value is
    // used to generate the chart. This is useful when the chart always needs to contain the position of the
    // invisible reference value in the view i.e. for bipolar scales.
    if (referenceValue || referenceValue === 0) {
      bounds.high = Math.max(referenceValue, bounds.high);
      bounds.low = Math.min(referenceValue, bounds.low);
    }

    bounds.valueRange = bounds.high - bounds.low;
    bounds.oom = Chartist.orderOfMagnitude(bounds.valueRange);
    bounds.min = Math.floor(bounds.low / Math.pow(10, bounds.oom)) * Math.pow(10, bounds.oom);
    bounds.max = Math.ceil(bounds.high / Math.pow(10, bounds.oom)) * Math.pow(10, bounds.oom);
    bounds.range = bounds.max - bounds.min;
    bounds.step = Math.pow(10, bounds.oom);
    bounds.numberOfSteps = Math.round(bounds.range / bounds.step);

    // Optimize scale step by checking if subdivision is possible based on horizontalGridMinSpace
    // If we are already below the scaleMinSpace value we will scale up
    var length = Chartist.projectLength(axisLength, bounds.step, bounds),
      scaleUp = length < scaleMinSpace;

    while (true) {
      if (scaleUp && Chartist.projectLength(axisLength, bounds.step, bounds) <= scaleMinSpace) {
        bounds.step *= 2;
      } else if (!scaleUp && Chartist.projectLength(axisLength, bounds.step / 2, bounds) >= scaleMinSpace) {
        bounds.step /= 2;
      } else {
        break;
      }
    }

    // Narrow min and max based on new step
    newMin = bounds.min;
    newMax = bounds.max;
    for (i = bounds.min; i <= bounds.max; i += bounds.step) {
      if (i + bounds.step < bounds.low) {
        newMin += bounds.step;
      }

      if (i - bounds.step >= bounds.high) {
        newMax -= bounds.step;
      }
    }
    bounds.min = newMin;
    bounds.max = newMax;
    bounds.range = bounds.max - bounds.min;

    bounds.values = [];
    for (i = bounds.min; i <= bounds.max; i += bounds.step) {
      bounds.values.push(Chartist.roundWithPrecision(i));
    }

    return bounds;
  };

  /**
   * Calculate cartesian coordinates of polar coordinates
   *
   * @memberof Chartist.Core
   * @param {Number} centerX X-axis coordinates of center point of circle segment
   * @param {Number} centerY X-axis coordinates of center point of circle segment
   * @param {Number} radius Radius of circle segment
   * @param {Number} angleInDegrees Angle of circle segment in degrees
   * @return {Number} Coordinates of point on circumference
   */
  Chartist.polarToCartesian = function (centerX, centerY, radius, angleInDegrees) {
    var angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;

    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  };

  /**
   * Initialize chart drawing rectangle (area where chart is drawn) x1,y1 = bottom left / x2,y2 = top right
   *
   * @memberof Chartist.Core
   * @param {Object} svg The svg element for the chart
   * @param {Object} options The Object that contains all the optional values for the chart
   * @param {Number} [fallbackPadding] The fallback padding if partial padding objects are used
   * @return {Object} The chart rectangles coordinates inside the svg element plus the rectangles measurements
   */
  Chartist.createChartRect = function (svg, options, fallbackPadding) {
    var yOffset = options.axisY ? options.axisY.offset || 0 : 0,
      xOffset = options.axisX ? options.axisX.offset || 0 : 0,
      w = Chartist.stripUnit(options.width) || svg.width(),
      h = Chartist.stripUnit(options.height) || svg.height(),
      normalizedPadding = Chartist.normalizePadding(options.chartPadding, fallbackPadding);

    return {
      x1: normalizedPadding.left + yOffset,
      y1: Math.max(h - normalizedPadding.bottom - xOffset, normalizedPadding.bottom),
      x2: Math.max(w - normalizedPadding.right, normalizedPadding.right + yOffset),
      y2: normalizedPadding.top,
      width: function () {
        return this.x2 - this.x1;
      },
      height: function () {
        return this.y1 - this.y2;
      }
    };
  };

  /**
   * Creates a grid line based on a projected value.
   *
   * @memberof Chartist.Core
   * @param projectedValue
   * @param index
   * @param axis
   * @param offset
   * @param length
   * @param group
   * @param classes
   * @param eventEmitter
   */
  Chartist.createGrid = function(projectedValue, index, axis, offset, length, group, classes, eventEmitter) {
    var positionalData = {};
    positionalData[axis.units.pos + '1'] = projectedValue.pos;
    positionalData[axis.units.pos + '2'] = projectedValue.pos;
    positionalData[axis.counterUnits.pos + '1'] = offset;
    positionalData[axis.counterUnits.pos + '2'] = offset + length;

    var gridElement = group.elem('line', positionalData, classes.join(' '));

    // Event for grid draw
    eventEmitter.emit('draw',
      Chartist.extend({
        type: 'grid',
        axis: axis,
        index: index,
        group: group,
        element: gridElement
      }, positionalData)
    );
  };

  /**
   * Creates a label based on a projected value and an axis.
   *
   * @memberof Chartist.Core
   * @param projectedValue
   * @param index
   * @param labels
   * @param axis
   * @param axisOffset
   * @param labelOffset
   * @param group
   * @param classes
   * @param useForeignObject
   * @param eventEmitter
   */
  Chartist.createLabel = function(projectedValue, index, labels, axis, axisOffset, labelOffset, group, classes, useForeignObject, eventEmitter) {
    var labelElement,
      positionalData = {};
    positionalData[axis.units.pos] = projectedValue.pos + labelOffset[axis.units.pos];
    positionalData[axis.counterUnits.pos] = labelOffset[axis.counterUnits.pos];
    positionalData[axis.units.len] = projectedValue.len;
    positionalData[axis.counterUnits.len] = axisOffset;

    if(useForeignObject) {
      var content = '<span class="' + classes.join(' ') + '">' + labels[index] + '</span>';
      labelElement = group.foreignObject(content, Chartist.extend({
        style: 'overflow: visible;'
      }, positionalData));
    } else {
      labelElement = group.elem('text', positionalData, classes.join(' ')).text(labels[index]);
    }

    eventEmitter.emit('draw', Chartist.extend({
      type: 'label',
      axis: axis,
      index: index,
      group: group,
      element: labelElement,
      text: labels[index]
    }, positionalData));
  };

  /**
   * This function creates a whole axis with its grid lines and labels based on an axis model and a chartRect.
   *
   * @memberof Chartist.Core
   * @param axis
   * @param data
   * @param chartRect
   * @param gridGroup
   * @param labelGroup
   * @param useForeignObject
   * @param options
   * @param eventEmitter
   */
  Chartist.createAxis = function(axis, data, chartRect, gridGroup, labelGroup, useForeignObject, options, eventEmitter) {
    var axisOptions = options['axis' + axis.units.pos.toUpperCase()],
      projectedValues = data.map(axis.projectValue.bind(axis)).map(axis.transform),
      labelValues = data.map(axisOptions.labelInterpolationFnc);

    projectedValues.forEach(function(projectedValue, index) {
      // Skip grid lines and labels where interpolated label values are falsey (execpt for 0)
      if(!labelValues[index] && labelValues[index] !== 0) {
        return;
      }

      if(axisOptions.showGrid) {
        Chartist.createGrid(projectedValue, index, axis, axis.gridOffset, chartRect[axis.counterUnits.len](), gridGroup, [
          options.classNames.grid,
          options.classNames[axis.units.dir]
        ], eventEmitter);
      }

      if(axisOptions.showLabel) {
        Chartist.createLabel(projectedValue, index, labelValues, axis, axisOptions.offset, axis.labelOffset, labelGroup, [
          options.classNames.label,
          options.classNames[axis.units.dir]
        ], useForeignObject, eventEmitter);
      }
    });
  };

  /**
   * Provides options handling functionality with callback for options changes triggered by responsive options and media query matches
   *
   * @memberof Chartist.Core
   * @param {Object} options Options set by user
   * @param {Array} responsiveOptions Optional functions to add responsive behavior to chart
   * @param {Object} eventEmitter The event emitter that will be used to emit the options changed events
   * @return {Object} The consolidated options object from the defaults, base and matching responsive options
   */
  Chartist.optionsProvider = function (options, responsiveOptions, eventEmitter) {
    var baseOptions = Chartist.extend({}, options),
      currentOptions,
      mediaQueryListeners = [],
      i;

    function updateCurrentOptions(preventChangedEvent) {
      var previousOptions = currentOptions;
      currentOptions = Chartist.extend({}, baseOptions);

      if (responsiveOptions) {
        for (i = 0; i < responsiveOptions.length; i++) {
          var mql = window.matchMedia(responsiveOptions[i][0]);
          if (mql.matches) {
            currentOptions = Chartist.extend(currentOptions, responsiveOptions[i][1]);
          }
        }
      }

      if(eventEmitter && !preventChangedEvent) {
        eventEmitter.emit('optionsChanged', {
          previousOptions: previousOptions,
          currentOptions: currentOptions
        });
      }
    }

    function removeMediaQueryListeners() {
      mediaQueryListeners.forEach(function(mql) {
        mql.removeListener(updateCurrentOptions);
      });
    }

    if (!window.matchMedia) {
      throw 'window.matchMedia not found! Make sure you\'re using a polyfill.';
    } else if (responsiveOptions) {

      for (i = 0; i < responsiveOptions.length; i++) {
        var mql = window.matchMedia(responsiveOptions[i][0]);
        mql.addListener(updateCurrentOptions);
        mediaQueryListeners.push(mql);
      }
    }
    // Execute initially so we get the correct options
    updateCurrentOptions(true);

    return {
      get currentOptions() {
        return Chartist.extend({}, currentOptions);
      },
      removeMediaQueryListeners: removeMediaQueryListeners
    };
  };

}(window, document, Chartist));
;/**
 * Chartist path interpolation functions.
 *
 * @module Chartist.Interpolation
 */
/* global Chartist */
(function(window, document, Chartist) {
  'use strict';

  Chartist.Interpolation = {};

  /**
   * This interpolation function does not smooth the path and the result is only containing lines and no curves.
   *
   * @memberof Chartist.Interpolation
   * @return {Function}
   */
  Chartist.Interpolation.none = function() {
    return function cardinal(pathCoordinates) {
      var path = new Chartist.Svg.Path().move(pathCoordinates[0], pathCoordinates[1]);

      for(var i = 3; i < pathCoordinates.length; i += 2) {
        path.line(pathCoordinates[i - 1], pathCoordinates[i]);
      }

      return path;
    };
  };

  /**
   * Simple smoothing creates horizontal handles that are positioned with a fraction of the length between two data points. You can use the divisor option to specify the amount of smoothing.
   *
   * Simple smoothing can be used instead of `Chartist.Smoothing.cardinal` if you'd like to get rid of the artifacts it produces sometimes. Simple smoothing produces less flowing lines but is accurate by hitting the points and it also doesn't swing below or above the given data point.
   *
   * All smoothing functions within Chartist are factory functions that accept an options parameter. The simple interpolation function accepts one configuration parameter `divisor`, between 1 and ∞, which controls the smoothing characteristics.
   *
   * @example
   * var chart = new Chartist.Line('.ct-chart', {
   *   labels: [1, 2, 3, 4, 5],
   *   series: [[1, 2, 8, 1, 7]]
   * }, {
   *   lineSmooth: Chartist.Interpolation.simple({
   *     divisor: 2
   *   })
   * });
   *
   *
   * @memberof Chartist.Interpolation
   * @param {Object} options The options of the simple interpolation factory function.
   * @return {Function}
   */
  Chartist.Interpolation.simple = function(options) {
    var defaultOptions = {
      divisor: 2
    };
    options = Chartist.extend({}, defaultOptions, options);

    var d = 1 / Math.max(1, options.divisor);

    return function simple(pathCoordinates) {
      var path = new Chartist.Svg.Path().move(pathCoordinates[0], pathCoordinates[1]);

      for(var i = 2; i < pathCoordinates.length; i += 2) {
        var prevX = pathCoordinates[i - 2],
            prevY = pathCoordinates[i - 1],
            currX = pathCoordinates[i],
            currY = pathCoordinates[i + 1],
            length = (currX - prevX) * d;

        path.curve(
          prevX + length,
          prevY,
          currX - length,
          currY,
          currX,
          currY
        );
      }

      return path;
    };
  };

  /**
   * Cardinal / Catmull-Rome spline interpolation is the default smoothing function in Chartist. It produces nice results where the splines will always meet the points. It produces some artifacts though when data values are increased or decreased rapidly. The line may not follow a very accurate path and if the line should be accurate this smoothing function does not produce the best results.
   *
   * Cardinal splines can only be created if there are more than two data points. If this is not the case this smoothing will fallback to `Chartist.Smoothing.none`.
   *
   * All smoothing functions within Chartist are factory functions that accept an options parameter. The cardinal interpolation function accepts one configuration parameter `tension`, between 0 and 1, which controls the smoothing intensity.
   *
   * @example
   * var chart = new Chartist.Line('.ct-chart', {
   *   labels: [1, 2, 3, 4, 5],
   *   series: [[1, 2, 8, 1, 7]]
   * }, {
   *   lineSmooth: Chartist.Interpolation.cardinal({
   *     tension: 1
   *   })
   * });
   *
   * @memberof Chartist.Interpolation
   * @param {Object} options The options of the cardinal factory function.
   * @return {Function}
   */
  Chartist.Interpolation.cardinal = function(options) {
    var defaultOptions = {
      tension: 1
    };

    options = Chartist.extend({}, defaultOptions, options);

    var t = Math.min(1, Math.max(0, options.tension)),
      c = 1 - t;

    return function cardinal(pathCoordinates) {
      // If less than two points we need to fallback to no smoothing
      if(pathCoordinates.length <= 4) {
        return Chartist.Interpolation.none()(pathCoordinates);
      }

      var path = new Chartist.Svg.Path().move(pathCoordinates[0], pathCoordinates[1]),
        z;

      for (var i = 0, iLen = pathCoordinates.length; iLen - 2 * !z > i; i += 2) {
        var p = [
          {x: +pathCoordinates[i - 2], y: +pathCoordinates[i - 1]},
          {x: +pathCoordinates[i], y: +pathCoordinates[i + 1]},
          {x: +pathCoordinates[i + 2], y: +pathCoordinates[i + 3]},
          {x: +pathCoordinates[i + 4], y: +pathCoordinates[i + 5]}
        ];
        if (z) {
          if (!i) {
            p[0] = {x: +pathCoordinates[iLen - 2], y: +pathCoordinates[iLen - 1]};
          } else if (iLen - 4 === i) {
            p[3] = {x: +pathCoordinates[0], y: +pathCoordinates[1]};
          } else if (iLen - 2 === i) {
            p[2] = {x: +pathCoordinates[0], y: +pathCoordinates[1]};
            p[3] = {x: +pathCoordinates[2], y: +pathCoordinates[3]};
          }
        } else {
          if (iLen - 4 === i) {
            p[3] = p[2];
          } else if (!i) {
            p[0] = {x: +pathCoordinates[i], y: +pathCoordinates[i + 1]};
          }
        }

        path.curve(
          (t * (-p[0].x + 6 * p[1].x + p[2].x) / 6) + (c * p[2].x),
          (t * (-p[0].y + 6 * p[1].y + p[2].y) / 6) + (c * p[2].y),
          (t * (p[1].x + 6 * p[2].x - p[3].x) / 6) + (c * p[2].x),
          (t * (p[1].y + 6 * p[2].y - p[3].y) / 6) + (c * p[2].y),
          p[2].x,
          p[2].y
        );
      }

      return path;
    };
  };

}(window, document, Chartist));
;/**
 * A very basic event module that helps to generate and catch events.
 *
 * @module Chartist.Event
 */
/* global Chartist */
(function (window, document, Chartist) {
  'use strict';

  Chartist.EventEmitter = function () {
    var handlers = [];

    /**
     * Add an event handler for a specific event
     *
     * @memberof Chartist.Event
     * @param {String} event The event name
     * @param {Function} handler A event handler function
     */
    function addEventHandler(event, handler) {
      handlers[event] = handlers[event] || [];
      handlers[event].push(handler);
    }

    /**
     * Remove an event handler of a specific event name or remove all event handlers for a specific event.
     *
     * @memberof Chartist.Event
     * @param {String} event The event name where a specific or all handlers should be removed
     * @param {Function} [handler] An optional event handler function. If specified only this specific handler will be removed and otherwise all handlers are removed.
     */
    function removeEventHandler(event, handler) {
      // Only do something if there are event handlers with this name existing
      if(handlers[event]) {
        // If handler is set we will look for a specific handler and only remove this
        if(handler) {
          handlers[event].splice(handlers[event].indexOf(handler), 1);
          if(handlers[event].length === 0) {
            delete handlers[event];
          }
        } else {
          // If no handler is specified we remove all handlers for this event
          delete handlers[event];
        }
      }
    }

    /**
     * Use this function to emit an event. All handlers that are listening for this event will be triggered with the data parameter.
     *
     * @memberof Chartist.Event
     * @param {String} event The event name that should be triggered
     * @param {*} data Arbitrary data that will be passed to the event handler callback functions
     */
    function emit(event, data) {
      // Only do something if there are event handlers with this name existing
      if(handlers[event]) {
        handlers[event].forEach(function(handler) {
          handler(data);
        });
      }

      // Emit event to star event handlers
      if(handlers['*']) {
        handlers['*'].forEach(function(starHandler) {
          starHandler(event, data);
        });
      }
    }

    return {
      addEventHandler: addEventHandler,
      removeEventHandler: removeEventHandler,
      emit: emit
    };
  };

}(window, document, Chartist));
;/**
 * This module provides some basic prototype inheritance utilities.
 *
 * @module Chartist.Class
 */
/* global Chartist */
(function(window, document, Chartist) {
  'use strict';

  function listToArray(list) {
    var arr = [];
    if (list.length) {
      for (var i = 0; i < list.length; i++) {
        arr.push(list[i]);
      }
    }
    return arr;
  }

  /**
   * Method to extend from current prototype.
   *
   * @memberof Chartist.Class
   * @param {Object} properties The object that serves as definition for the prototype that gets created for the new class. This object should always contain a constructor property that is the desired constructor for the newly created class.
   * @param {Object} [superProtoOverride] By default extens will use the current class prototype or Chartist.class. With this parameter you can specify any super prototype that will be used.
   * @return {Function} Constructor function of the new class
   *
   * @example
   * var Fruit = Class.extend({
     * color: undefined,
     *   sugar: undefined,
     *
     *   constructor: function(color, sugar) {
     *     this.color = color;
     *     this.sugar = sugar;
     *   },
     *
     *   eat: function() {
     *     this.sugar = 0;
     *     return this;
     *   }
     * });
   *
   * var Banana = Fruit.extend({
     *   length: undefined,
     *
     *   constructor: function(length, sugar) {
     *     Banana.super.constructor.call(this, 'Yellow', sugar);
     *     this.length = length;
     *   }
     * });
   *
   * var banana = new Banana(20, 40);
   * console.log('banana instanceof Fruit', banana instanceof Fruit);
   * console.log('Fruit is prototype of banana', Fruit.prototype.isPrototypeOf(banana));
   * console.log('bananas prototype is Fruit', Object.getPrototypeOf(banana) === Fruit.prototype);
   * console.log(banana.sugar);
   * console.log(banana.eat().sugar);
   * console.log(banana.color);
   */
  function extend(properties, superProtoOverride) {
    var superProto = superProtoOverride || this.prototype || Chartist.Class;
    var proto = Object.create(superProto);

    Chartist.Class.cloneDefinitions(proto, properties);

    var constr = function() {
      var fn = proto.constructor || function () {},
        instance;

      // If this is linked to the Chartist namespace the constructor was not called with new
      // To provide a fallback we will instantiate here and return the instance
      instance = this === Chartist ? Object.create(proto) : this;
      fn.apply(instance, Array.prototype.slice.call(arguments, 0));

      // If this constructor was not called with new we need to return the instance
      // This will not harm when the constructor has been called with new as the returned value is ignored
      return instance;
    };

    constr.prototype = proto;
    constr.super = superProto;
    constr.extend = this.extend;

    return constr;
  }

  // Variable argument list clones args > 0 into args[0] and retruns modified args[0]
  function cloneDefinitions() {
    var args = listToArray(arguments);
    var target = args[0];

    args.splice(1, args.length - 1).forEach(function (source) {
      Object.getOwnPropertyNames(source).forEach(function (propName) {
        // If this property already exist in target we delete it first
        delete target[propName];
        // Define the property with the descriptor from source
        Object.defineProperty(target, propName,
          Object.getOwnPropertyDescriptor(source, propName));
      });
    });

    return target;
  }

  Chartist.Class = {
    extend: extend,
    cloneDefinitions: cloneDefinitions
  };

}(window, document, Chartist));
;/**
 * Base for all chart types. The methods in Chartist.Base are inherited to all chart types.
 *
 * @module Chartist.Base
 */
/* global Chartist */
(function(window, document, Chartist) {
  'use strict';

  // TODO: Currently we need to re-draw the chart on window resize. This is usually very bad and will affect performance.
  // This is done because we can't work with relative coordinates when drawing the chart because SVG Path does not
  // work with relative positions yet. We need to check if we can do a viewBox hack to switch to percentage.
  // See http://mozilla.6506.n7.nabble.com/Specyfing-paths-with-percentages-unit-td247474.html
  // Update: can be done using the above method tested here: http://codepen.io/gionkunz/pen/KDvLj
  // The problem is with the label offsets that can't be converted into percentage and affecting the chart container
  /**
   * Updates the chart which currently does a full reconstruction of the SVG DOM
   *
   * @param {Object} [data] Optional data you'd like to set for the chart before it will update. If not specified the update method will use the data that is already configured with the chart.
   * @param {Object} [options] Optional options you'd like to add to the previous options for the chart before it will update. If not specified the update method will use the options that have been already configured with the chart.
   * @param {Boolean} [override] If set to true, the passed options will be used to extend the options that have been configured already. Otherwise the chart default options will be used as the base
   * @memberof Chartist.Base
   */
  function update(data, options, override) {
    if(data) {
      this.data = data;
      // Event for data transformation that allows to manipulate the data before it gets rendered in the charts
      this.eventEmitter.emit('data', {
        type: 'update',
        data: this.data
      });
    }

    if(options) {
      this.options = Chartist.extend({}, override ? this.options : this.defaultOptions, options);

      // If chartist was not initialized yet, we just set the options and leave the rest to the initialization
      // Otherwise we re-create the optionsProvider at this point
      if(!this.initializeTimeoutId) {
        this.optionsProvider.removeMediaQueryListeners();
        this.optionsProvider = Chartist.optionsProvider(this.options, this.responsiveOptions, this.eventEmitter);
      }
    }

    // Only re-created the chart if it has been initialized yet
    if(!this.initializeTimeoutId) {
      this.createChart(this.optionsProvider.currentOptions);
    }

    // Return a reference to the chart object to chain up calls
    return this;
  }

  /**
   * This method can be called on the API object of each chart and will un-register all event listeners that were added to other components. This currently includes a window.resize listener as well as media query listeners if any responsive options have been provided. Use this function if you need to destroy and recreate Chartist charts dynamically.
   *
   * @memberof Chartist.Base
   */
  function detach() {
    window.removeEventListener('resize', this.resizeListener);
    this.optionsProvider.removeMediaQueryListeners();
    return this;
  }

  /**
   * Use this function to register event handlers. The handler callbacks are synchronous and will run in the main thread rather than the event loop.
   *
   * @memberof Chartist.Base
   * @param {String} event Name of the event. Check the examples for supported events.
   * @param {Function} handler The handler function that will be called when an event with the given name was emitted. This function will receive a data argument which contains event data. See the example for more details.
   */
  function on(event, handler) {
    this.eventEmitter.addEventHandler(event, handler);
    return this;
  }

  /**
   * Use this function to un-register event handlers. If the handler function parameter is omitted all handlers for the given event will be un-registered.
   *
   * @memberof Chartist.Base
   * @param {String} event Name of the event for which a handler should be removed
   * @param {Function} [handler] The handler function that that was previously used to register a new event handler. This handler will be removed from the event handler list. If this parameter is omitted then all event handlers for the given event are removed from the list.
   */
  function off(event, handler) {
    this.eventEmitter.removeEventHandler(event, handler);
    return this;
  }

  function initialize() {
    // Add window resize listener that re-creates the chart
    window.addEventListener('resize', this.resizeListener);

    // Obtain current options based on matching media queries (if responsive options are given)
    // This will also register a listener that is re-creating the chart based on media changes
    this.optionsProvider = Chartist.optionsProvider(this.options, this.responsiveOptions, this.eventEmitter);
    // Register options change listener that will trigger a chart update
    this.eventEmitter.addEventHandler('optionsChanged', function() {
      this.update();
    }.bind(this));

    // Before the first chart creation we need to register us with all plugins that are configured
    // Initialize all relevant plugins with our chart object and the plugin options specified in the config
    if(this.options.plugins) {
      this.options.plugins.forEach(function(plugin) {
        if(plugin instanceof Array) {
          plugin[0](this, plugin[1]);
        } else {
          plugin(this);
        }
      }.bind(this));
    }

    // Event for data transformation that allows to manipulate the data before it gets rendered in the charts
    this.eventEmitter.emit('data', {
      type: 'initial',
      data: this.data
    });

    // Create the first chart
    this.createChart(this.optionsProvider.currentOptions);

    // As chart is initialized from the event loop now we can reset our timeout reference
    // This is important if the chart gets initialized on the same element twice
    this.initializeTimeoutId = undefined;
  }

  /**
   * Constructor of chart base class.
   *
   * @param query
   * @param data
   * @param defaultOptions
   * @param options
   * @param responsiveOptions
   * @constructor
   */
  function Base(query, data, defaultOptions, options, responsiveOptions) {
    this.container = Chartist.querySelector(query);
    this.data = data;
    this.defaultOptions = defaultOptions;
    this.options = options;
    this.responsiveOptions = responsiveOptions;
    this.eventEmitter = Chartist.EventEmitter();
    this.supportsForeignObject = Chartist.Svg.isSupported('Extensibility');
    this.supportsAnimations = Chartist.Svg.isSupported('AnimationEventsAttribute');
    this.resizeListener = function resizeListener(){
      this.update();
    }.bind(this);

    if(this.container) {
      // If chartist was already initialized in this container we are detaching all event listeners first
      if(this.container.__chartist__) {
        if(this.container.__chartist__.initializeTimeoutId) {
          // If the initializeTimeoutId is still set we can safely assume that the initialization function has not
          // been called yet from the event loop. Therefore we should cancel the timeout and don't need to detach
          window.clearTimeout(this.container.__chartist__.initializeTimeoutId);
        } else {
          // The timeout reference has already been reset which means we need to detach the old chart first
          this.container.__chartist__.detach();
        }
      }

      this.container.__chartist__ = this;
    }

    // Using event loop for first draw to make it possible to register event listeners in the same call stack where
    // the chart was created.
    this.initializeTimeoutId = setTimeout(initialize.bind(this), 0);
  }

  // Creating the chart base class
  Chartist.Base = Chartist.Class.extend({
    constructor: Base,
    optionsProvider: undefined,
    container: undefined,
    svg: undefined,
    eventEmitter: undefined,
    createChart: function() {
      throw new Error('Base chart type can\'t be instantiated!');
    },
    update: update,
    detach: detach,
    on: on,
    off: off,
    version: Chartist.version,
    supportsForeignObject: false
  });

}(window, document, Chartist));
;/**
 * Chartist SVG module for simple SVG DOM abstraction
 *
 * @module Chartist.Svg
 */
/* global Chartist */
(function(window, document, Chartist) {
  'use strict';

  var svgNs = 'http://www.w3.org/2000/svg',
    xmlNs = 'http://www.w3.org/2000/xmlns/',
    xhtmlNs = 'http://www.w3.org/1999/xhtml';

  Chartist.xmlNs = {
    qualifiedName: 'xmlns:ct',
    prefix: 'ct',
    uri: 'http://gionkunz.github.com/chartist-js/ct'
  };

  /**
   * Chartist.Svg creates a new SVG object wrapper with a starting element. You can use the wrapper to fluently create sub-elements and modify them.
   *
   * @memberof Chartist.Svg
   * @constructor
   * @param {String|SVGElement} name The name of the SVG element to create or an SVG dom element which should be wrapped into Chartist.Svg
   * @param {Object} attributes An object with properties that will be added as attributes to the SVG element that is created. Attributes with undefined values will not be added.
   * @param {String} className This class or class list will be added to the SVG element
   * @param {Object} parent The parent SVG wrapper object where this newly created wrapper and it's element will be attached to as child
   * @param {Boolean} insertFirst If this param is set to true in conjunction with a parent element the newly created element will be added as first child element in the parent element
   */
  function Svg(name, attributes, className, parent, insertFirst) {
    // If Svg is getting called with an SVG element we just return the wrapper
    if(name instanceof SVGElement) {
      this._node = name;
    } else {
      this._node = document.createElementNS(svgNs, name);

      // If this is an SVG element created then custom namespace
      if(name === 'svg') {
        this._node.setAttributeNS(xmlNs, Chartist.xmlNs.qualifiedName, Chartist.xmlNs.uri);
      }

      if(attributes) {
        this.attr(attributes);
      }

      if(className) {
        this.addClass(className);
      }

      if(parent) {
        if (insertFirst && parent._node.firstChild) {
          parent._node.insertBefore(this._node, parent._node.firstChild);
        } else {
          parent._node.appendChild(this._node);
        }
      }
    }
  }

  /**
   * Set attributes on the current SVG element of the wrapper you're currently working on.
   *
   * @memberof Chartist.Svg
   * @param {Object|String} attributes An object with properties that will be added as attributes to the SVG element that is created. Attributes with undefined values will not be added. If this parameter is a String then the function is used as a getter and will return the attribute value.
   * @param {String} ns If specified, the attributes will be set as namespace attributes with ns as prefix.
   * @return {Object|String} The current wrapper object will be returned so it can be used for chaining or the attribute value if used as getter function.
   */
  function attr(attributes, ns) {
    if(typeof attributes === 'string') {
      if(ns) {
        return this._node.getAttributeNS(ns, attributes);
      } else {
        return this._node.getAttribute(attributes);
      }
    }

    Object.keys(attributes).forEach(function(key) {
      // If the attribute value is undefined we can skip this one
      if(attributes[key] === undefined) {
        return;
      }

      if(ns) {
        this._node.setAttributeNS(ns, [Chartist.xmlNs.prefix, ':', key].join(''), attributes[key]);
      } else {
        this._node.setAttribute(key, attributes[key]);
      }
    }.bind(this));

    return this;
  }

  /**
   * Create a new SVG element whose wrapper object will be selected for further operations. This way you can also create nested groups easily.
   *
   * @memberof Chartist.Svg
   * @param {String} name The name of the SVG element that should be created as child element of the currently selected element wrapper
   * @param {Object} [attributes] An object with properties that will be added as attributes to the SVG element that is created. Attributes with undefined values will not be added.
   * @param {String} [className] This class or class list will be added to the SVG element
   * @param {Boolean} [insertFirst] If this param is set to true in conjunction with a parent element the newly created element will be added as first child element in the parent element
   * @return {Chartist.Svg} Returns a Chartist.Svg wrapper object that can be used to modify the containing SVG data
   */
  function elem(name, attributes, className, insertFirst) {
    return new Chartist.Svg(name, attributes, className, this, insertFirst);
  }

  /**
   * Returns the parent Chartist.SVG wrapper object
   *
   * @return {Chartist.Svg} Returns a Chartist.Svg wrapper around the parent node of the current node. If the parent node is not existing or it's not an SVG node then this function will return null.
   */
  function parent() {
    return this._node.parentNode instanceof SVGElement ? new Chartist.Svg(this._node.parentNode) : null;
  }

  /**
   * This method returns a Chartist.Svg wrapper around the root SVG element of the current tree.
   *
   * @return {Chartist.Svg} The root SVG element wrapped in a Chartist.Svg element
   */
  function root() {
    var node = this._node;
    while(node.nodeName !== 'svg') {
      node = node.parentNode;
    }
    return new Chartist.Svg(node);
  }

  /**
   * Find the first child SVG element of the current element that matches a CSS selector. The returned object is a Chartist.Svg wrapper.
   *
   * @param {String} selector A CSS selector that is used to query for child SVG elements
   * @return {Chartist.Svg} The SVG wrapper for the element found or null if no element was found
   */
  function querySelector(selector) {
    var foundNode = this._node.querySelector(selector);
    return foundNode ? new Chartist.Svg(foundNode) : null;
  }

  /**
   * Find the all child SVG elements of the current element that match a CSS selector. The returned object is a Chartist.Svg.List wrapper.
   *
   * @param {String} selector A CSS selector that is used to query for child SVG elements
   * @return {Chartist.Svg.List} The SVG wrapper list for the element found or null if no element was found
   */
  function querySelectorAll(selector) {
    var foundNodes = this._node.querySelectorAll(selector);
    return foundNodes.length ? new Chartist.Svg.List(foundNodes) : null;
  }

  /**
   * This method creates a foreignObject (see https://developer.mozilla.org/en-US/docs/Web/SVG/Element/foreignObject) that allows to embed HTML content into a SVG graphic. With the help of foreignObjects you can enable the usage of regular HTML elements inside of SVG where they are subject for SVG positioning and transformation but the Browser will use the HTML rendering capabilities for the containing DOM.
   *
   * @memberof Chartist.Svg
   * @param {Node|String} content The DOM Node, or HTML string that will be converted to a DOM Node, that is then placed into and wrapped by the foreignObject
   * @param {String} [attributes] An object with properties that will be added as attributes to the foreignObject element that is created. Attributes with undefined values will not be added.
   * @param {String} [className] This class or class list will be added to the SVG element
   * @param {Boolean} [insertFirst] Specifies if the foreignObject should be inserted as first child
   * @return {Chartist.Svg} New wrapper object that wraps the foreignObject element
   */
  function foreignObject(content, attributes, className, insertFirst) {
    // If content is string then we convert it to DOM
    // TODO: Handle case where content is not a string nor a DOM Node
    if(typeof content === 'string') {
      var container = document.createElement('div');
      container.innerHTML = content;
      content = container.firstChild;
    }

    // Adding namespace to content element
    content.setAttribute('xmlns', xhtmlNs);

    // Creating the foreignObject without required extension attribute (as described here
    // http://www.w3.org/TR/SVG/extend.html#ForeignObjectElement)
    var fnObj = this.elem('foreignObject', attributes, className, insertFirst);

    // Add content to foreignObjectElement
    fnObj._node.appendChild(content);

    return fnObj;
  }

  /**
   * This method adds a new text element to the current Chartist.Svg wrapper.
   *
   * @memberof Chartist.Svg
   * @param {String} t The text that should be added to the text element that is created
   * @return {Chartist.Svg} The same wrapper object that was used to add the newly created element
   */
  function text(t) {
    this._node.appendChild(document.createTextNode(t));
    return this;
  }

  /**
   * This method will clear all child nodes of the current wrapper object.
   *
   * @memberof Chartist.Svg
   * @return {Chartist.Svg} The same wrapper object that got emptied
   */
  function empty() {
    while (this._node.firstChild) {
      this._node.removeChild(this._node.firstChild);
    }

    return this;
  }

  /**
   * This method will cause the current wrapper to remove itself from its parent wrapper. Use this method if you'd like to get rid of an element in a given DOM structure.
   *
   * @memberof Chartist.Svg
   * @return {Chartist.Svg} The parent wrapper object of the element that got removed
   */
  function remove() {
    this._node.parentNode.removeChild(this._node);
    return this.parent();
  }

  /**
   * This method will replace the element with a new element that can be created outside of the current DOM.
   *
   * @memberof Chartist.Svg
   * @param {Chartist.Svg} newElement The new Chartist.Svg object that will be used to replace the current wrapper object
   * @return {Chartist.Svg} The wrapper of the new element
   */
  function replace(newElement) {
    this._node.parentNode.replaceChild(newElement._node, this._node);
    return newElement;
  }

  /**
   * This method will append an element to the current element as a child.
   *
   * @memberof Chartist.Svg
   * @param {Chartist.Svg} element The Chartist.Svg element that should be added as a child
   * @param {Boolean} [insertFirst] Specifies if the element should be inserted as first child
   * @return {Chartist.Svg} The wrapper of the appended object
   */
  function append(element, insertFirst) {
    if(insertFirst && this._node.firstChild) {
      this._node.insertBefore(element._node, this._node.firstChild);
    } else {
      this._node.appendChild(element._node);
    }

    return this;
  }

  /**
   * Returns an array of class names that are attached to the current wrapper element. This method can not be chained further.
   *
   * @memberof Chartist.Svg
   * @return {Array} A list of classes or an empty array if there are no classes on the current element
   */
  function classes() {
    return this._node.getAttribute('class') ? this._node.getAttribute('class').trim().split(/\s+/) : [];
  }

  /**
   * Adds one or a space separated list of classes to the current element and ensures the classes are only existing once.
   *
   * @memberof Chartist.Svg
   * @param {String} names A white space separated list of class names
   * @return {Chartist.Svg} The wrapper of the current element
   */
  function addClass(names) {
    this._node.setAttribute('class',
      this.classes(this._node)
        .concat(names.trim().split(/\s+/))
        .filter(function(elem, pos, self) {
          return self.indexOf(elem) === pos;
        }).join(' ')
    );

    return this;
  }

  /**
   * Removes one or a space separated list of classes from the current element.
   *
   * @memberof Chartist.Svg
   * @param {String} names A white space separated list of class names
   * @return {Chartist.Svg} The wrapper of the current element
   */
  function removeClass(names) {
    var removedClasses = names.trim().split(/\s+/);

    this._node.setAttribute('class', this.classes(this._node).filter(function(name) {
      return removedClasses.indexOf(name) === -1;
    }).join(' '));

    return this;
  }

  /**
   * Removes all classes from the current element.
   *
   * @memberof Chartist.Svg
   * @return {Chartist.Svg} The wrapper of the current element
   */
  function removeAllClasses() {
    this._node.setAttribute('class', '');

    return this;
  }

  /**
   * Get element height with fallback to svg BoundingBox or parent container dimensions:
   * See [bugzilla.mozilla.org](https://bugzilla.mozilla.org/show_bug.cgi?id=530985)
   *
   * @memberof Chartist.Svg
   * @return {Number} The elements height in pixels
   */
  function height() {
    return this._node.clientHeight || Math.round(this._node.getBBox().height) || this._node.parentNode.clientHeight;
  }

  /**
   * Get element width with fallback to svg BoundingBox or parent container dimensions:
   * See [bugzilla.mozilla.org](https://bugzilla.mozilla.org/show_bug.cgi?id=530985)
   *
   * @memberof Chartist.Core
   * @return {Number} The elements width in pixels
   */
  function width() {
    return this._node.clientWidth || Math.round(this._node.getBBox().width) || this._node.parentNode.clientWidth;
  }

  /**
   * The animate function lets you animate the current element with SMIL animations. You can add animations for multiple attributes at the same time by using an animation definition object. This object should contain SMIL animation attributes. Please refer to http://www.w3.org/TR/SVG/animate.html for a detailed specification about the available animation attributes. Additionally an easing property can be passed in the animation definition object. This can be a string with a name of an easing function in `Chartist.Svg.Easing` or an array with four numbers specifying a cubic Bézier curve.
   * **An animations object could look like this:**
   * ```javascript
   * element.animate({
   *   opacity: {
   *     dur: 1000,
   *     from: 0,
   *     to: 1
   *   },
   *   x1: {
   *     dur: '1000ms',
   *     from: 100,
   *     to: 200,
   *     easing: 'easeOutQuart'
   *   },
   *   y1: {
   *     dur: '2s',
   *     from: 0,
   *     to: 100
   *   }
   * });
   * ```
   * **Automatic unit conversion**
   * For the `dur` and the `begin` animate attribute you can also omit a unit by passing a number. The number will automatically be converted to milli seconds.
   * **Guided mode**
   * The default behavior of SMIL animations with offset using the `begin` attribute is that the attribute will keep it's original value until the animation starts. Mostly this behavior is not desired as you'd like to have your element attributes already initialized with the animation `from` value even before the animation starts. Also if you don't specify `fill="freeze"` on an animate element or if you delete the animation after it's done (which is done in guided mode) the attribute will switch back to the initial value. This behavior is also not desired when performing simple one-time animations. For one-time animations you'd want to trigger animations immediately instead of relative to the document begin time. That's why in guided mode Chartist.Svg will also use the `begin` property to schedule a timeout and manually start the animation after the timeout. If you're using multiple SMIL definition objects for an attribute (in an array), guided mode will be disabled for this attribute, even if you explicitly enabled it.
   * If guided mode is enabled the following behavior is added:
   * - Before the animation starts (even when delayed with `begin`) the animated attribute will be set already to the `from` value of the animation
   * - `begin` is explicitly set to `indefinite` so it can be started manually without relying on document begin time (creation)
   * - The animate element will be forced to use `fill="freeze"`
   * - The animation will be triggered with `beginElement()` in a timeout where `begin` of the definition object is interpreted in milli seconds. If no `begin` was specified the timeout is triggered immediately.
   * - After the animation the element attribute value will be set to the `to` value of the animation
   * - The animate element is deleted from the DOM
   *
   * @memberof Chartist.Svg
   * @param {Object} animations An animations object where the property keys are the attributes you'd like to animate. The properties should be objects again that contain the SMIL animation attributes (usually begin, dur, from, and to). The property begin and dur is auto converted (see Automatic unit conversion). You can also schedule multiple animations for the same attribute by passing an Array of SMIL definition objects. Attributes that contain an array of SMIL definition objects will not be executed in guided mode.
   * @param {Boolean} guided Specify if guided mode should be activated for this animation (see Guided mode). If not otherwise specified, guided mode will be activated.
   * @param {Object} eventEmitter If specified, this event emitter will be notified when an animation starts or ends.
   * @return {Chartist.Svg} The current element where the animation was added
   */
  function animate(animations, guided, eventEmitter) {
    if(guided === undefined) {
      guided = true;
    }

    Object.keys(animations).forEach(function createAnimateForAttributes(attribute) {

      function createAnimate(animationDefinition, guided) {
        var attributeProperties = {},
          animate,
          timeout,
          easing;

        // Check if an easing is specified in the definition object and delete it from the object as it will not
        // be part of the animate element attributes.
        if(animationDefinition.easing) {
          // If already an easing Bézier curve array we take it or we lookup a easing array in the Easing object
          easing = animationDefinition.easing instanceof Array ?
            animationDefinition.easing :
            Chartist.Svg.Easing[animationDefinition.easing];
          delete animationDefinition.easing;
        }

        // If numeric dur or begin was provided we assume milli seconds
        animationDefinition.begin = Chartist.ensureUnit(animationDefinition.begin, 'ms');
        animationDefinition.dur = Chartist.ensureUnit(animationDefinition.dur, 'ms');

        if(easing) {
          animationDefinition.calcMode = 'spline';
          animationDefinition.keySplines = easing.join(' ');
          animationDefinition.keyTimes = '0;1';
        }

        // Adding "fill: freeze" if we are in guided mode and set initial attribute values
        if(guided) {
          animationDefinition.fill = 'freeze';
          // Animated property on our element should already be set to the animation from value in guided mode
          attributeProperties[attribute] = animationDefinition.from;
          this.attr(attributeProperties);

          // In guided mode we also set begin to indefinite so we can trigger the start manually and put the begin
          // which needs to be in ms aside
          timeout = Chartist.stripUnit(animationDefinition.begin || 0);
          animationDefinition.begin = 'indefinite';
        }

        animate = this.elem('animate', Chartist.extend({
          attributeName: attribute
        }, animationDefinition));

        if(guided) {
          // If guided we take the value that was put aside in timeout and trigger the animation manually with a timeout
          setTimeout(function() {
            // If beginElement fails we set the animated attribute to the end position and remove the animate element
            // This happens if the SMIL ElementTimeControl interface is not supported or any other problems occured in
            // the browser. (Currently FF 34 does not support animate elements in foreignObjects)
            try {
              animate._node.beginElement();
            } catch(err) {
              // Set animated attribute to current animated value
              attributeProperties[attribute] = animationDefinition.to;
              this.attr(attributeProperties);
              // Remove the animate element as it's no longer required
              animate.remove();
            }
          }.bind(this), timeout);
        }

        if(eventEmitter) {
          animate._node.addEventListener('beginEvent', function handleBeginEvent() {
            eventEmitter.emit('animationBegin', {
              element: this,
              animate: animate._node,
              params: animationDefinition
            });
          }.bind(this));
        }

        animate._node.addEventListener('endEvent', function handleEndEvent() {
          if(eventEmitter) {
            eventEmitter.emit('animationEnd', {
              element: this,
              animate: animate._node,
              params: animationDefinition
            });
          }

          if(guided) {
            // Set animated attribute to current animated value
            attributeProperties[attribute] = animationDefinition.to;
            this.attr(attributeProperties);
            // Remove the animate element as it's no longer required
            animate.remove();
          }
        }.bind(this));
      }

      // If current attribute is an array of definition objects we create an animate for each and disable guided mode
      if(animations[attribute] instanceof Array) {
        animations[attribute].forEach(function(animationDefinition) {
          createAnimate.bind(this)(animationDefinition, false);
        }.bind(this));
      } else {
        createAnimate.bind(this)(animations[attribute], guided);
      }

    }.bind(this));

    return this;
  }

  Chartist.Svg = Chartist.Class.extend({
    constructor: Svg,
    attr: attr,
    elem: elem,
    parent: parent,
    root: root,
    querySelector: querySelector,
    querySelectorAll: querySelectorAll,
    foreignObject: foreignObject,
    text: text,
    empty: empty,
    remove: remove,
    replace: replace,
    append: append,
    classes: classes,
    addClass: addClass,
    removeClass: removeClass,
    removeAllClasses: removeAllClasses,
    height: height,
    width: width,
    animate: animate
  });

  /**
   * This method checks for support of a given SVG feature like Extensibility, SVG-animation or the like. Check http://www.w3.org/TR/SVG11/feature for a detailed list.
   *
   * @memberof Chartist.Svg
   * @param {String} feature The SVG 1.1 feature that should be checked for support.
   * @return {Boolean} True of false if the feature is supported or not
   */
  Chartist.Svg.isSupported = function(feature) {
    return document.implementation.hasFeature('www.http://w3.org/TR/SVG11/feature#' + feature, '1.1');
  };

  /**
   * This Object contains some standard easing cubic bezier curves. Then can be used with their name in the `Chartist.Svg.animate`. You can also extend the list and use your own name in the `animate` function. Click the show code button to see the available bezier functions.
   *
   * @memberof Chartist.Svg
   */
  var easingCubicBeziers = {
    easeInSine: [0.47, 0, 0.745, 0.715],
    easeOutSine: [0.39, 0.575, 0.565, 1],
    easeInOutSine: [0.445, 0.05, 0.55, 0.95],
    easeInQuad: [0.55, 0.085, 0.68, 0.53],
    easeOutQuad: [0.25, 0.46, 0.45, 0.94],
    easeInOutQuad: [0.455, 0.03, 0.515, 0.955],
    easeInCubic: [0.55, 0.055, 0.675, 0.19],
    easeOutCubic: [0.215, 0.61, 0.355, 1],
    easeInOutCubic: [0.645, 0.045, 0.355, 1],
    easeInQuart: [0.895, 0.03, 0.685, 0.22],
    easeOutQuart: [0.165, 0.84, 0.44, 1],
    easeInOutQuart: [0.77, 0, 0.175, 1],
    easeInQuint: [0.755, 0.05, 0.855, 0.06],
    easeOutQuint: [0.23, 1, 0.32, 1],
    easeInOutQuint: [0.86, 0, 0.07, 1],
    easeInExpo: [0.95, 0.05, 0.795, 0.035],
    easeOutExpo: [0.19, 1, 0.22, 1],
    easeInOutExpo: [1, 0, 0, 1],
    easeInCirc: [0.6, 0.04, 0.98, 0.335],
    easeOutCirc: [0.075, 0.82, 0.165, 1],
    easeInOutCirc: [0.785, 0.135, 0.15, 0.86],
    easeInBack: [0.6, -0.28, 0.735, 0.045],
    easeOutBack: [0.175, 0.885, 0.32, 1.275],
    easeInOutBack: [0.68, -0.55, 0.265, 1.55]
  };

  Chartist.Svg.Easing = easingCubicBeziers;

  /**
   * This helper class is to wrap multiple `Chartist.Svg` elements into a list where you can call the `Chartist.Svg` functions on all elements in the list with one call. This is helpful when you'd like to perform calls with `Chartist.Svg` on multiple elements.
   * An instance of this class is also returned by `Chartist.Svg.querySelectorAll`.
   *
   * @memberof Chartist.Svg
   * @param {Array<Node>|NodeList} nodeList An Array of SVG DOM nodes or a SVG DOM NodeList (as returned by document.querySelectorAll)
   * @constructor
   */
  function SvgList(nodeList) {
    var list = this;

    this.svgElements = [];
    for(var i = 0; i < nodeList.length; i++) {
      this.svgElements.push(new Chartist.Svg(nodeList[i]));
    }

    // Add delegation methods for Chartist.Svg
    Object.keys(Chartist.Svg.prototype).filter(function(prototypeProperty) {
      return ['constructor',
          'parent',
          'querySelector',
          'querySelectorAll',
          'replace',
          'append',
          'classes',
          'height',
          'width'].indexOf(prototypeProperty) === -1;
    }).forEach(function(prototypeProperty) {
      list[prototypeProperty] = function() {
        var args = Array.prototype.slice.call(arguments, 0);
        list.svgElements.forEach(function(element) {
          Chartist.Svg.prototype[prototypeProperty].apply(element, args);
        });
        return list;
      };
    });
  }

  Chartist.Svg.List = Chartist.Class.extend({
    constructor: SvgList
  });
}(window, document, Chartist));
;/**
 * Chartist SVG path module for SVG path description creation and modification.
 *
 * @module Chartist.Svg.Path
 */
/* global Chartist */
(function(window, document, Chartist) {
  'use strict';

  /**
   * Contains the descriptors of supported element types in a SVG path. Currently only move, line and curve are supported.
   *
   * @memberof Chartist.Svg.Path
   * @type {Object}
   */
  var elementDescriptions = {
    m: ['x', 'y'],
    l: ['x', 'y'],
    c: ['x1', 'y1', 'x2', 'y2', 'x', 'y'],
    a: ['rx', 'ry', 'xAr', 'lAf', 'sf', 'x', 'y']
  };

  /**
   * Default options for newly created SVG path objects.
   *
   * @memberof Chartist.Svg.Path
   * @type {Object}
   */
  var defaultOptions = {
    // The accuracy in digit count after the decimal point. This will be used to round numbers in the SVG path. If this option is set to false then no rounding will be performed.
    accuracy: 3
  };

  function element(command, params, pathElements, pos, relative) {
    pathElements.splice(pos, 0, Chartist.extend({
      command: relative ? command.toLowerCase() : command.toUpperCase()
    }, params));
  }

  function forEachParam(pathElements, cb) {
    pathElements.forEach(function(pathElement, pathElementIndex) {
      elementDescriptions[pathElement.command.toLowerCase()].forEach(function(paramName, paramIndex) {
        cb(pathElement, paramName, pathElementIndex, paramIndex, pathElements);
      });
    });
  }

  /**
   * Used to construct a new path object.
   *
   * @memberof Chartist.Svg.Path
   * @param {Boolean} close If set to true then this path will be closed when stringified (with a Z at the end)
   * @param {Object} options Options object that overrides the default objects. See default options for more details.
   * @constructor
   */
  function SvgPath(close, options) {
    this.pathElements = [];
    this.pos = 0;
    this.close = close;
    this.options = Chartist.extend({}, defaultOptions, options);
  }

  /**
   * Gets or sets the current position (cursor) inside of the path. You can move around the cursor freely but limited to 0 or the count of existing elements. All modifications with element functions will insert new elements at the position of this cursor.
   *
   * @memberof Chartist.Svg.Path
   * @param {Number} [pos] If a number is passed then the cursor is set to this position in the path element array.
   * @return {Chartist.Svg.Path|Number} If the position parameter was passed then the return value will be the path object for easy call chaining. If no position parameter was passed then the current position is returned.
   */
  function position(pos) {
    if(pos !== undefined) {
      this.pos = Math.max(0, Math.min(this.pathElements.length, pos));
      return this;
    } else {
      return this.pos;
    }
  }

  /**
   * Removes elements from the path starting at the current position.
   *
   * @memberof Chartist.Svg.Path
   * @param {Number} count Number of path elements that should be removed from the current position.
   * @return {Chartist.Svg.Path} The current path object for easy call chaining.
   */
  function remove(count) {
    this.pathElements.splice(this.pos, count);
    return this;
  }

  /**
   * Use this function to add a new move SVG path element.
   *
   * @memberof Chartist.Svg.Path
   * @param {Number} x The x coordinate for the move element.
   * @param {Number} y The y coordinate for the move element.
   * @param {Boolean} [relative] If set to true the move element will be created with relative coordinates (lowercase letter)
   * @return {Chartist.Svg.Path} The current path object for easy call chaining.
   */
  function move(x, y, relative) {
    element('M', {
      x: +x,
      y: +y
    }, this.pathElements, this.pos++, relative);
    return this;
  }

  /**
   * Use this function to add a new line SVG path element.
   *
   * @memberof Chartist.Svg.Path
   * @param {Number} x The x coordinate for the line element.
   * @param {Number} y The y coordinate for the line element.
   * @param {Boolean} [relative] If set to true the line element will be created with relative coordinates (lowercase letter)
   * @return {Chartist.Svg.Path} The current path object for easy call chaining.
   */
  function line(x, y, relative) {
    element('L', {
      x: +x,
      y: +y
    }, this.pathElements, this.pos++, relative);
    return this;
  }

  /**
   * Use this function to add a new curve SVG path element.
   *
   * @memberof Chartist.Svg.Path
   * @param {Number} x1 The x coordinate for the first control point of the bezier curve.
   * @param {Number} y1 The y coordinate for the first control point of the bezier curve.
   * @param {Number} x2 The x coordinate for the second control point of the bezier curve.
   * @param {Number} y2 The y coordinate for the second control point of the bezier curve.
   * @param {Number} x The x coordinate for the target point of the curve element.
   * @param {Number} y The y coordinate for the target point of the curve element.
   * @param {Boolean} [relative] If set to true the curve element will be created with relative coordinates (lowercase letter)
   * @return {Chartist.Svg.Path} The current path object for easy call chaining.
   */
  function curve(x1, y1, x2, y2, x, y, relative) {
    element('C', {
      x1: +x1,
      y1: +y1,
      x2: +x2,
      y2: +y2,
      x: +x,
      y: +y
    }, this.pathElements, this.pos++, relative);
    return this;
  }

  /**
   * Use this function to add a new non-bezier curve SVG path element.
   *
   * @memberof Chartist.Svg.Path
   * @param {Number} rx The radius to be used for the x-axis of the arc.
   * @param {Number} ry The radius to be used for the y-axis of the arc.
   * @param {Number} xAr Defines the orientation of the arc
   * @param {Number} lAf Large arc flag
   * @param {Number} sf Sweep flag
   * @param {Number} x The x coordinate for the target point of the curve element.
   * @param {Number} y The y coordinate for the target point of the curve element.
   * @param {Boolean} [relative] If set to true the curve element will be created with relative coordinates (lowercase letter)
   * @return {Chartist.Svg.Path} The current path object for easy call chaining.
   */
  function arc(rx, ry, xAr, lAf, sf, x, y, relative) {
    element('A', {
      rx: +rx,
      ry: +ry,
      xAr: +xAr,
      lAf: +lAf,
      sf: +sf,
      x: +x,
      y: +y
    }, this.pathElements, this.pos++, relative);
    return this;
  }

  /**
   * Parses an SVG path seen in the d attribute of path elements, and inserts the parsed elements into the existing path object at the current cursor position. Any closing path indicators (Z at the end of the path) will be ignored by the parser as this is provided by the close option in the options of the path object.
   *
   * @memberof Chartist.Svg.Path
   * @param {String} path Any SVG path that contains move (m), line (l) or curve (c) components.
   * @return {Chartist.Svg.Path} The current path object for easy call chaining.
   */
  function parse(path) {
    // Parsing the SVG path string into an array of arrays [['M', '10', '10'], ['L', '100', '100']]
    var chunks = path.replace(/([A-Za-z])([0-9])/g, '$1 $2')
      .replace(/([0-9])([A-Za-z])/g, '$1 $2')
      .split(/[\s,]+/)
      .reduce(function(result, element) {
        if(element.match(/[A-Za-z]/)) {
          result.push([]);
        }

        result[result.length - 1].push(element);
        return result;
      }, []);

    // If this is a closed path we remove the Z at the end because this is determined by the close option
    if(chunks[chunks.length - 1][0].toUpperCase() === 'Z') {
      chunks.pop();
    }

    // Using svgPathElementDescriptions to map raw path arrays into objects that contain the command and the parameters
    // For example {command: 'M', x: '10', y: '10'}
    var elements = chunks.map(function(chunk) {
        var command = chunk.shift(),
          description = elementDescriptions[command.toLowerCase()];

        return Chartist.extend({
          command: command
        }, description.reduce(function(result, paramName, index) {
          result[paramName] = +chunk[index];
          return result;
        }, {}));
      });

    // Preparing a splice call with the elements array as var arg params and insert the parsed elements at the current position
    var spliceArgs = [this.pos, 0];
    Array.prototype.push.apply(spliceArgs, elements);
    Array.prototype.splice.apply(this.pathElements, spliceArgs);
    // Increase the internal position by the element count
    this.pos += elements.length;

    return this;
  }

  /**
   * This function renders to current SVG path object into a final SVG string that can be used in the d attribute of SVG path elements. It uses the accuracy option to round big decimals. If the close parameter was set in the constructor of this path object then a path closing Z will be appended to the output string.
   *
   * @memberof Chartist.Svg.Path
   * @return {String}
   */
  function stringify() {
    var accuracyMultiplier = Math.pow(10, this.options.accuracy);

    return this.pathElements.reduce(function(path, pathElement) {
        var params = elementDescriptions[pathElement.command.toLowerCase()].map(function(paramName) {
          return this.options.accuracy ?
            (Math.round(pathElement[paramName] * accuracyMultiplier) / accuracyMultiplier) :
            pathElement[paramName];
        }.bind(this));

        return path + pathElement.command + params.join(',');
      }.bind(this), '') + (this.close ? 'Z' : '');
  }

  /**
   * Scales all elements in the current SVG path object. There is an individual parameter for each coordinate. Scaling will also be done for control points of curves, affecting the given coordinate.
   *
   * @memberof Chartist.Svg.Path
   * @param {Number} x The number which will be used to scale the x, x1 and x2 of all path elements.
   * @param {Number} y The number which will be used to scale the y, y1 and y2 of all path elements.
   * @return {Chartist.Svg.Path} The current path object for easy call chaining.
   */
  function scale(x, y) {
    forEachParam(this.pathElements, function(pathElement, paramName) {
      pathElement[paramName] *= paramName[0] === 'x' ? x : y;
    });
    return this;
  }

  /**
   * Translates all elements in the current SVG path object. The translation is relative and there is an individual parameter for each coordinate. Translation will also be done for control points of curves, affecting the given coordinate.
   *
   * @memberof Chartist.Svg.Path
   * @param {Number} x The number which will be used to translate the x, x1 and x2 of all path elements.
   * @param {Number} y The number which will be used to translate the y, y1 and y2 of all path elements.
   * @return {Chartist.Svg.Path} The current path object for easy call chaining.
   */
  function translate(x, y) {
    forEachParam(this.pathElements, function(pathElement, paramName) {
      pathElement[paramName] += paramName[0] === 'x' ? x : y;
    });
    return this;
  }

  /**
   * This function will run over all existing path elements and then loop over their attributes. The callback function will be called for every path element attribute that exists in the current path.
   * The method signature of the callback function looks like this:
   * ```javascript
   * function(pathElement, paramName, pathElementIndex, paramIndex, pathElements)
   * ```
   * If something else than undefined is returned by the callback function, this value will be used to replace the old value. This allows you to build custom transformations of path objects that can't be achieved using the basic transformation functions scale and translate.
   *
   * @memberof Chartist.Svg.Path
   * @param {Function} transformFnc The callback function for the transformation. Check the signature in the function description.
   * @return {Chartist.Svg.Path} The current path object for easy call chaining.
   */
  function transform(transformFnc) {
    forEachParam(this.pathElements, function(pathElement, paramName, pathElementIndex, paramIndex, pathElements) {
      var transformed = transformFnc(pathElement, paramName, pathElementIndex, paramIndex, pathElements);
      if(transformed || transformed === 0) {
        pathElement[paramName] = transformed;
      }
    });
    return this;
  }

  /**
   * This function clones a whole path object with all its properties. This is a deep clone and path element objects will also be cloned.
   *
   * @memberof Chartist.Svg.Path
   * @return {Chartist.Svg.Path}
   */
  function clone() {
    var c = new Chartist.Svg.Path(this.close);
    c.pos = this.pos;
    c.pathElements = this.pathElements.slice().map(function cloneElements(pathElement) {
      return Chartist.extend({}, pathElement);
    });
    c.options = Chartist.extend({}, this.options);
    return c;
  }

  Chartist.Svg.Path = Chartist.Class.extend({
    constructor: SvgPath,
    position: position,
    remove: remove,
    move: move,
    line: line,
    curve: curve,
    arc: arc,
    scale: scale,
    translate: translate,
    transform: transform,
    parse: parse,
    stringify: stringify,
    clone: clone
  });

  Chartist.Svg.Path.elementDescriptions = elementDescriptions;
}(window, document, Chartist));
;/**
 * Axis base class used to implement different axis types
 *
 * @module Chartist.Axis
 */
/* global Chartist */
(function (window, document, Chartist) {
  'use strict';

  var axisUnits = {
    x: {
      pos: 'x',
      len: 'width',
      dir: 'horizontal',
      rectStart: 'x1',
      rectEnd: 'x2',
      rectOffset: 'y2'
    },
    y: {
      pos: 'y',
      len: 'height',
      dir: 'vertical',
      rectStart: 'y2',
      rectEnd: 'y1',
      rectOffset: 'x1'
    }
  };

  function Axis(units, chartRect, transform, labelOffset, options) {
    this.units = units;
    this.counterUnits = units === axisUnits.x ? axisUnits.y : axisUnits.x;
    this.chartRect = chartRect;
    this.axisLength = chartRect[units.rectEnd] - chartRect[units.rectStart];
    this.gridOffset = chartRect[units.rectOffset];
    this.transform = transform;
    this.labelOffset = labelOffset;
    this.options = options;
  }

  Chartist.Axis = Chartist.Class.extend({
    constructor: Axis,
    projectValue: function(value, index, data) {
      throw new Error('Base axis can\'t be instantiated!');
    }
  });

  Chartist.Axis.units = axisUnits;

}(window, document, Chartist));
;/**
 * The linear scale axis uses standard linear scale projection of values along an axis.
 *
 * @module Chartist.LinearScaleAxis
 */
/* global Chartist */
(function (window, document, Chartist) {
  'use strict';

  function LinearScaleAxis(axisUnit, chartRect, transform, labelOffset, options) {
    Chartist.LinearScaleAxis.super.constructor.call(this,
      axisUnit,
      chartRect,
      transform,
      labelOffset,
      options);

    this.bounds = Chartist.getBounds(this.axisLength, options.highLow, options.scaleMinSpace, options.referenceValue);
  }

  function projectValue(value) {
    return {
      pos: this.axisLength * (value - this.bounds.min) / (this.bounds.range + this.bounds.step),
      len: Chartist.projectLength(this.axisLength, this.bounds.step, this.bounds)
    };
  }

  Chartist.LinearScaleAxis = Chartist.Axis.extend({
    constructor: LinearScaleAxis,
    projectValue: projectValue
  });

}(window, document, Chartist));
;/**
 * Step axis for step based charts like bar chart or step based line chart
 *
 * @module Chartist.StepAxis
 */
/* global Chartist */
(function (window, document, Chartist) {
  'use strict';

  function StepAxis(axisUnit, chartRect, transform, labelOffset, options) {
    Chartist.StepAxis.super.constructor.call(this,
      axisUnit,
      chartRect,
      transform,
      labelOffset,
      options);

    this.stepLength = this.axisLength / (options.stepCount - (options.stretch ? 1 : 0));
  }

  function projectValue(value, index) {
    return {
      pos: this.stepLength * index,
      len: this.stepLength
    };
  }

  Chartist.StepAxis = Chartist.Axis.extend({
    constructor: StepAxis,
    projectValue: projectValue
  });

}(window, document, Chartist));
;/**
 * The Chartist line chart can be used to draw Line or Scatter charts. If used in the browser you can access the global `Chartist` namespace where you find the `Line` function as a main entry point.
 *
 * For examples on how to use the line chart please check the examples of the `Chartist.Line` method.
 *
 * @module Chartist.Line
 */
/* global Chartist */
(function(window, document, Chartist){
  'use strict';

  /**
   * Default options in line charts. Expand the code view to see a detailed list of options with comments.
   *
   * @memberof Chartist.Line
   */
  var defaultOptions = {
    // Options for X-Axis
    axisX: {
      // The offset of the labels to the chart area
      offset: 30,
      // Allows you to correct label positioning on this axis by positive or negative x and y offset.
      labelOffset: {
        x: 0,
        y: 0
      },
      // If labels should be shown or not
      showLabel: true,
      // If the axis grid should be drawn or not
      showGrid: true,
      // Interpolation function that allows you to intercept the value from the axis label
      labelInterpolationFnc: Chartist.noop
    },
    // Options for Y-Axis
    axisY: {
      // The offset of the labels to the chart area
      offset: 40,
      // Allows you to correct label positioning on this axis by positive or negative x and y offset.
      labelOffset: {
        x: 0,
        y: 0
      },
      // If labels should be shown or not
      showLabel: true,
      // If the axis grid should be drawn or not
      showGrid: true,
      // Interpolation function that allows you to intercept the value from the axis label
      labelInterpolationFnc: Chartist.noop,
      // This value specifies the minimum height in pixel of the scale steps
      scaleMinSpace: 20
    },
    // Specify a fixed width for the chart as a string (i.e. '100px' or '50%')
    width: undefined,
    // Specify a fixed height for the chart as a string (i.e. '100px' or '50%')
    height: undefined,
    // If the line should be drawn or not
    showLine: true,
    // If dots should be drawn or not
    showPoint: true,
    // If the line chart should draw an area
    showArea: false,
    // The base for the area chart that will be used to close the area shape (is normally 0)
    areaBase: 0,
    // Specify if the lines should be smoothed. This value can be true or false where true will result in smoothing using the default smoothing interpolation function Chartist.Interpolation.cardinal and false results in Chartist.Interpolation.none. You can also choose other smoothing / interpolation functions available in the Chartist.Interpolation module, or write your own interpolation function. Check the examples for a brief description.
    lineSmooth: true,
    // Overriding the natural low of the chart allows you to zoom in or limit the charts lowest displayed value
    low: undefined,
    // Overriding the natural high of the chart allows you to zoom in or limit the charts highest displayed value
    high: undefined,
    // Padding of the chart drawing area to the container element and labels as a number or padding object {top: 5, right: 5, bottom: 5, left: 5}
    chartPadding: 5,
    // When set to true, the last grid line on the x-axis is not drawn and the chart elements will expand to the full available width of the chart. For the last label to be drawn correctly you might need to add chart padding or offset the last label with a draw event handler.
    fullWidth: false,
    // If true the whole data is reversed including labels, the series order as well as the whole series data arrays.
    reverseData: false,
    // Override the class names that get used to generate the SVG structure of the chart
    classNames: {
      chart: 'ct-chart-line',
      label: 'ct-label',
      labelGroup: 'ct-labels',
      series: 'ct-series',
      line: 'ct-line',
      point: 'ct-point',
      area: 'ct-area',
      grid: 'ct-grid',
      gridGroup: 'ct-grids',
      vertical: 'ct-vertical',
      horizontal: 'ct-horizontal'
    }
  };

  /**
   * Creates a new chart
   *
   */
  function createChart(options) {
    var seriesGroups = [],
      normalizedData = Chartist.normalizeDataArray(Chartist.getDataArray(this.data, options.reverseData), this.data.labels.length),
      normalizedPadding = Chartist.normalizePadding(options.chartPadding, defaultOptions.padding);

    // Create new svg object
    this.svg = Chartist.createSvg(this.container, options.width, options.height, options.classNames.chart);

    var chartRect = Chartist.createChartRect(this.svg, options, defaultOptions.padding);

    var highLow = Chartist.getHighLow(normalizedData);
    // Overrides of high / low from settings
    highLow.high = +options.high || (options.high === 0 ? 0 : highLow.high);
    highLow.low = +options.low || (options.low === 0 ? 0 : highLow.low);

    var axisX = new Chartist.StepAxis(
      Chartist.Axis.units.x,
      chartRect,
      function xAxisTransform(projectedValue) {
        projectedValue.pos = chartRect.x1 + projectedValue.pos;
        return projectedValue;
      },
      {
        x: options.axisX.labelOffset.x,
        y: chartRect.y1 + options.axisX.labelOffset.y + (this.supportsForeignObject ? 5 : 20)
      },
      {
        stepCount: this.data.labels.length,
        stretch: options.fullWidth
      }
    );

    var axisY = new Chartist.LinearScaleAxis(
      Chartist.Axis.units.y,
      chartRect,
      function yAxisTransform(projectedValue) {
        projectedValue.pos = chartRect.y1 - projectedValue.pos;
        return projectedValue;
      },
      {
        x: normalizedPadding.left + options.axisY.labelOffset.x + (this.supportsForeignObject ? -10 : 0),
        y: options.axisY.labelOffset.y + (this.supportsForeignObject ? -15 : 0)
      },
      {
        highLow: highLow,
        scaleMinSpace: options.axisY.scaleMinSpace
      }
    );

    // Start drawing
    var labelGroup = this.svg.elem('g').addClass(options.classNames.labelGroup),
      gridGroup = this.svg.elem('g').addClass(options.classNames.gridGroup);

    Chartist.createAxis(
      axisX,
      this.data.labels,
      chartRect,
      gridGroup,
      labelGroup,
      this.supportsForeignObject,
      options,
      this.eventEmitter
    );

    Chartist.createAxis(
      axisY,
      axisY.bounds.values,
      chartRect,
      gridGroup,
      labelGroup,
      this.supportsForeignObject,
      options,
      this.eventEmitter
    );

    // Draw the series
    this.data.series.forEach(function(series, seriesIndex) {
      seriesGroups[seriesIndex] = this.svg.elem('g');

      // Write attributes to series group element. If series name or meta is undefined the attributes will not be written
      seriesGroups[seriesIndex].attr({
        'series-name': series.name,
        'meta': Chartist.serialize(series.meta)
      }, Chartist.xmlNs.uri);

      // Use series class from series data or if not set generate one
      seriesGroups[seriesIndex].addClass([
        options.classNames.series,
        (series.className || options.classNames.series + '-' + Chartist.alphaNumerate(seriesIndex))
      ].join(' '));

      var pathCoordinates = [];

      normalizedData[seriesIndex].forEach(function(value, valueIndex) {
        var p = {
          x: chartRect.x1 + axisX.projectValue(value, valueIndex,  normalizedData[seriesIndex]).pos,
          y: chartRect.y1 - axisY.projectValue(value, valueIndex,  normalizedData[seriesIndex]).pos
        };
        pathCoordinates.push(p.x, p.y);

        //If we should show points we need to create them now to avoid secondary loop
        // Small offset for Firefox to render squares correctly
        if (options.showPoint) {
          var point = seriesGroups[seriesIndex].elem('line', {
            x1: p.x,
            y1: p.y,
            x2: p.x + 0.01,
            y2: p.y
          }, options.classNames.point).attr({
            'value': value,
            'meta': Chartist.getMetaData(series, valueIndex)
          }, Chartist.xmlNs.uri);

          this.eventEmitter.emit('draw', {
            type: 'point',
            value: value,
            index: valueIndex,
            group: seriesGroups[seriesIndex],
            element: point,
            x: p.x,
            y: p.y
          });
        }
      }.bind(this));

      // TODO: Nicer handling of conditions, maybe composition?
      if (options.showLine || options.showArea) {
        var smoothing = typeof options.lineSmooth === 'function' ?
          options.lineSmooth : (options.lineSmooth ? Chartist.Interpolation.cardinal() : Chartist.Interpolation.none()),
          path = smoothing(pathCoordinates);

        if(options.showLine) {
          var line = seriesGroups[seriesIndex].elem('path', {
            d: path.stringify()
          }, options.classNames.line, true).attr({
            'values': normalizedData[seriesIndex]
          }, Chartist.xmlNs.uri);

          this.eventEmitter.emit('draw', {
            type: 'line',
            values: normalizedData[seriesIndex],
            path: path.clone(),
            chartRect: chartRect,
            index: seriesIndex,
            group: seriesGroups[seriesIndex],
            element: line
          });
        }

        if(options.showArea) {
          // If areaBase is outside the chart area (< low or > high) we need to set it respectively so that
          // the area is not drawn outside the chart area.
          var areaBase = Math.max(Math.min(options.areaBase, axisY.bounds.max), axisY.bounds.min);

          // We project the areaBase value into screen coordinates
          var areaBaseProjected = chartRect.y1 - axisY.projectValue(areaBase).pos;

          // Clone original path and splice our new area path to add the missing path elements to close the area shape
          var areaPath = path.clone();
          // Modify line path and add missing elements for area
          areaPath.position(0)
            .remove(1)
            .move(chartRect.x1, areaBaseProjected)
            .line(pathCoordinates[0], pathCoordinates[1])
            .position(areaPath.pathElements.length)
            .line(pathCoordinates[pathCoordinates.length - 2], areaBaseProjected);

          // Create the new path for the area shape with the area class from the options
          var area = seriesGroups[seriesIndex].elem('path', {
            d: areaPath.stringify()
          }, options.classNames.area, true).attr({
            'values': normalizedData[seriesIndex]
          }, Chartist.xmlNs.uri);

          this.eventEmitter.emit('draw', {
            type: 'area',
            values: normalizedData[seriesIndex],
            path: areaPath.clone(),
            chartRect: chartRect,
            index: seriesIndex,
            group: seriesGroups[seriesIndex],
            element: area
          });
        }
      }
    }.bind(this));

    this.eventEmitter.emit('created', {
      bounds: axisY.bounds,
      chartRect: chartRect,
      axisX: axisX,
      axisY: axisY,
      svg: this.svg,
      options: options
    });
  }

  /**
   * This method creates a new line chart.
   *
   * @memberof Chartist.Line
   * @param {String|Node} query A selector query string or directly a DOM element
   * @param {Object} data The data object that needs to consist of a labels and a series array
   * @param {Object} [options] The options object with options that override the default options. Check the examples for a detailed list.
   * @param {Array} [responsiveOptions] Specify an array of responsive option arrays which are a media query and options object pair => [[mediaQueryString, optionsObject],[more...]]
   * @return {Object} An object which exposes the API for the created chart
   *
   * @example
   * // Create a simple line chart
   * var data = {
   *   // A labels array that can contain any sort of values
   *   labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
   *   // Our series array that contains series objects or in this case series data arrays
   *   series: [
   *     [5, 2, 4, 2, 0]
   *   ]
   * };
   *
   * // As options we currently only set a static size of 300x200 px
   * var options = {
   *   width: '300px',
   *   height: '200px'
   * };
   *
   * // In the global name space Chartist we call the Line function to initialize a line chart. As a first parameter we pass in a selector where we would like to get our chart created. Second parameter is the actual data object and as a third parameter we pass in our options
   * new Chartist.Line('.ct-chart', data, options);
   *
   * @example
   * // Use specific interpolation function with configuration from the Chartist.Interpolation module
   *
   * var chart = new Chartist.Line('.ct-chart', {
   *   labels: [1, 2, 3, 4, 5],
   *   series: [
   *     [1, 1, 8, 1, 7]
   *   ]
   * }, {
   *   lineSmooth: Chartist.Interpolation.cardinal({
   *     tension: 0.2
   *   })
   * });
   *
   * @example
   * // Create a line chart with responsive options
   *
   * var data = {
   *   // A labels array that can contain any sort of values
   *   labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
   *   // Our series array that contains series objects or in this case series data arrays
   *   series: [
   *     [5, 2, 4, 2, 0]
   *   ]
   * };
   *
   * // In adition to the regular options we specify responsive option overrides that will override the default configutation based on the matching media queries.
   * var responsiveOptions = [
   *   ['screen and (min-width: 641px) and (max-width: 1024px)', {
   *     showPoint: false,
   *     axisX: {
   *       labelInterpolationFnc: function(value) {
   *         // Will return Mon, Tue, Wed etc. on medium screens
   *         return value.slice(0, 3);
   *       }
   *     }
   *   }],
   *   ['screen and (max-width: 640px)', {
   *     showLine: false,
   *     axisX: {
   *       labelInterpolationFnc: function(value) {
   *         // Will return M, T, W etc. on small screens
   *         return value[0];
   *       }
   *     }
   *   }]
   * ];
   *
   * new Chartist.Line('.ct-chart', data, null, responsiveOptions);
   *
   */
  function Line(query, data, options, responsiveOptions) {
    Chartist.Line.super.constructor.call(this,
      query,
      data,
      defaultOptions,
      Chartist.extend({}, defaultOptions, options),
      responsiveOptions);
  }

  // Creating line chart type in Chartist namespace
  Chartist.Line = Chartist.Base.extend({
    constructor: Line,
    createChart: createChart
  });

}(window, document, Chartist));
;/**
 * The bar chart module of Chartist that can be used to draw unipolar or bipolar bar and grouped bar charts.
 *
 * @module Chartist.Bar
 */
/* global Chartist */
(function(window, document, Chartist){
  'use strict';

  /**
   * Default options in bar charts. Expand the code view to see a detailed list of options with comments.
   *
   * @memberof Chartist.Bar
   */
  var defaultOptions = {
    // Options for X-Axis
    axisX: {
      // The offset of the chart drawing area to the border of the container
      offset: 30,
      // Allows you to correct label positioning on this axis by positive or negative x and y offset.
      labelOffset: {
        x: 0,
        y: 0
      },
      // If labels should be shown or not
      showLabel: true,
      // If the axis grid should be drawn or not
      showGrid: true,
      // Interpolation function that allows you to intercept the value from the axis label
      labelInterpolationFnc: Chartist.noop,
      // This value specifies the minimum width in pixel of the scale steps
      scaleMinSpace: 40
    },
    // Options for Y-Axis
    axisY: {
      // The offset of the chart drawing area to the border of the container
      offset: 40,
      // Allows you to correct label positioning on this axis by positive or negative x and y offset.
      labelOffset: {
        x: 0,
        y: 0
      },
      // If labels should be shown or not
      showLabel: true,
      // If the axis grid should be drawn or not
      showGrid: true,
      // Interpolation function that allows you to intercept the value from the axis label
      labelInterpolationFnc: Chartist.noop,
      // This value specifies the minimum height in pixel of the scale steps
      scaleMinSpace: 20
    },
    // Specify a fixed width for the chart as a string (i.e. '100px' or '50%')
    width: undefined,
    // Specify a fixed height for the chart as a string (i.e. '100px' or '50%')
    height: undefined,
    // Overriding the natural high of the chart allows you to zoom in or limit the charts highest displayed value
    high: undefined,
    // Overriding the natural low of the chart allows you to zoom in or limit the charts lowest displayed value
    low: undefined,
    // Padding of the chart drawing area to the container element and labels as a number or padding object {top: 5, right: 5, bottom: 5, left: 5}
    chartPadding: 5,
    // Specify the distance in pixel of bars in a group
    seriesBarDistance: 15,
    // If set to true this property will cause the series bars to be stacked and form a total for each series point. This will also influence the y-axis and the overall bounds of the chart. In stacked mode the seriesBarDistance property will have no effect.
    stackBars: false,
    // Inverts the axes of the bar chart in order to draw a horizontal bar chart. Be aware that you also need to invert your axis settings as the Y Axis will now display the labels and the X Axis the values.
    horizontalBars: false,
    // If true the whole data is reversed including labels, the series order as well as the whole series data arrays.
    reverseData: false,
    // Override the class names that get used to generate the SVG structure of the chart
    classNames: {
      chart: 'ct-chart-bar',
      label: 'ct-label',
      labelGroup: 'ct-labels',
      series: 'ct-series',
      bar: 'ct-bar',
      grid: 'ct-grid',
      gridGroup: 'ct-grids',
      vertical: 'ct-vertical',
      horizontal: 'ct-horizontal'
    }
  };

  /**
   * Creates a new chart
   *
   */
  function createChart(options) {
    var seriesGroups = [],
      normalizedData = Chartist.normalizeDataArray(Chartist.getDataArray(this.data, options.reverseData), this.data.labels.length),
      normalizedPadding = Chartist.normalizePadding(options.chartPadding, defaultOptions.padding),
      highLow;

    // Create new svg element
    this.svg = Chartist.createSvg(this.container, options.width, options.height, options.classNames.chart);

    if(options.stackBars) {
      // If stacked bars we need to calculate the high low from stacked values from each series
      var serialSums = Chartist.serialMap(normalizedData, function serialSums() {
        return Array.prototype.slice.call(arguments).reduce(Chartist.sum, 0);
      });

      highLow = Chartist.getHighLow([serialSums]);
    } else {
      highLow = Chartist.getHighLow(normalizedData);
    }
    // Overrides of high / low from settings
    highLow.high = +options.high || (options.high === 0 ? 0 : highLow.high);
    highLow.low = +options.low || (options.low === 0 ? 0 : highLow.low);

    var chartRect = Chartist.createChartRect(this.svg, options, defaultOptions.padding);

    var valueAxis,
      labelAxis,
      axisX,
      axisY;

    if(options.horizontalBars) {
      labelAxis = axisY = new Chartist.StepAxis(
        Chartist.Axis.units.y,
        chartRect,
        function timeAxisTransform(projectedValue) {
          projectedValue.pos = chartRect.y1 - projectedValue.pos;
          return projectedValue;
        },
        {
          x: normalizedPadding.left + options.axisY.labelOffset.x + (this.supportsForeignObject ? -10 : 0),
          y: options.axisY.labelOffset.y - chartRect.height() / this.data.labels.length
        },
        {
          stepCount: this.data.labels.length,
          stretch: options.fullHeight
        }
      );

      valueAxis = axisX = new Chartist.LinearScaleAxis(
        Chartist.Axis.units.x,
        chartRect,
        function valueAxisTransform(projectedValue) {
          projectedValue.pos = chartRect.x1 + projectedValue.pos;
          return projectedValue;
        },
        {
          x: options.axisX.labelOffset.x,
          y: chartRect.y1 + options.axisX.labelOffset.y + (this.supportsForeignObject ? 5 : 20)
        },
        {
          highLow: highLow,
          scaleMinSpace: options.axisX.scaleMinSpace,
          referenceValue: 0
        }
      );
    } else {
      labelAxis = axisX = new Chartist.StepAxis(
        Chartist.Axis.units.x,
        chartRect,
        function timeAxisTransform(projectedValue) {
          projectedValue.pos = chartRect.x1 + projectedValue.pos;
          return projectedValue;
        },
        {
          x: options.axisX.labelOffset.x,
          y: chartRect.y1 + options.axisX.labelOffset.y + (this.supportsForeignObject ? 5 : 20)
        },
        {
          stepCount: this.data.labels.length
        }
      );

      valueAxis = axisY = new Chartist.LinearScaleAxis(
        Chartist.Axis.units.y,
        chartRect,
        function valueAxisTransform(projectedValue) {
          projectedValue.pos = chartRect.y1 - projectedValue.pos;
          return projectedValue;
        },
        {
          x: normalizedPadding.left + options.axisY.labelOffset.x + (this.supportsForeignObject ? -10 : 0),
          y: options.axisY.labelOffset.y + (this.supportsForeignObject ? -15 : 0)
        },
        {
          highLow: highLow,
          scaleMinSpace: options.axisY.scaleMinSpace,
          referenceValue: 0
        }
      );
    }

    // Start drawing
    var labelGroup = this.svg.elem('g').addClass(options.classNames.labelGroup),
      gridGroup = this.svg.elem('g').addClass(options.classNames.gridGroup),
      // Projected 0 point
      zeroPoint = options.horizontalBars ? (chartRect.x1 + valueAxis.projectValue(0).pos) : (chartRect.y1 - valueAxis.projectValue(0).pos),
      // Used to track the screen coordinates of stacked bars
      stackedBarValues = [];

    Chartist.createAxis(
      labelAxis,
      this.data.labels,
      chartRect,
      gridGroup,
      labelGroup,
      this.supportsForeignObject,
      options,
      this.eventEmitter
    );

    Chartist.createAxis(
      valueAxis,
      valueAxis.bounds.values,
      chartRect,
      gridGroup,
      labelGroup,
      this.supportsForeignObject,
      options,
      this.eventEmitter
    );

    // Draw the series
    this.data.series.forEach(function(series, seriesIndex) {
      // Calculating bi-polar value of index for seriesOffset. For i = 0..4 biPol will be -1.5, -0.5, 0.5, 1.5 etc.
      var biPol = seriesIndex - (this.data.series.length - 1) / 2,
      // Half of the period width between vertical grid lines used to position bars
        periodHalfLength = chartRect[labelAxis.units.len]() / normalizedData[seriesIndex].length / 2;

      seriesGroups[seriesIndex] = this.svg.elem('g');

      // Write attributes to series group element. If series name or meta is undefined the attributes will not be written
      seriesGroups[seriesIndex].attr({
        'series-name': series.name,
        'meta': Chartist.serialize(series.meta)
      }, Chartist.xmlNs.uri);

      // Use series class from series data or if not set generate one
      seriesGroups[seriesIndex].addClass([
        options.classNames.series,
        (series.className || options.classNames.series + '-' + Chartist.alphaNumerate(seriesIndex))
      ].join(' '));

      normalizedData[seriesIndex].forEach(function(value, valueIndex) {
        var projected = {
            x: chartRect.x1 + (options.horizontalBars ? valueAxis : labelAxis).projectValue(value, valueIndex, normalizedData[seriesIndex]).pos,
            y: chartRect.y1 - (options.horizontalBars ? labelAxis : valueAxis).projectValue(value, valueIndex, normalizedData[seriesIndex]).pos
          },
          bar,
          previousStack;

        // Offset to center bar between grid lines
        projected[labelAxis.units.pos] += periodHalfLength * (options.horizontalBars ? -1 : 1);
        // Using bi-polar offset for multiple series if no stacked bars are used
        projected[labelAxis.units.pos] += options.stackBars ? 0 : biPol * options.seriesBarDistance * (options.horizontalBars ? -1 : 1);

        // Enter value in stacked bar values used to remember previous screen value for stacking up bars
        previousStack = stackedBarValues[valueIndex] || zeroPoint;
        stackedBarValues[valueIndex] = previousStack - (zeroPoint - projected[labelAxis.counterUnits.pos]);

        var positions = {};
        positions[labelAxis.units.pos + '1'] = projected[labelAxis.units.pos];
        positions[labelAxis.units.pos + '2'] = projected[labelAxis.units.pos];
        // If bars are stacked we use the stackedBarValues reference and otherwise base all bars off the zero line
        positions[labelAxis.counterUnits.pos + '1'] = options.stackBars ? previousStack : zeroPoint;
        positions[labelAxis.counterUnits.pos + '2'] = options.stackBars ? stackedBarValues[valueIndex] : projected[labelAxis.counterUnits.pos];

        bar = seriesGroups[seriesIndex].elem('line', positions, options.classNames.bar).attr({
          'value': value,
          'meta': Chartist.getMetaData(series, valueIndex)
        }, Chartist.xmlNs.uri);

        this.eventEmitter.emit('draw', Chartist.extend({
          type: 'bar',
          value: value,
          index: valueIndex,
          chartRect: chartRect,
          group: seriesGroups[seriesIndex],
          element: bar
        }, positions));
      }.bind(this));
    }.bind(this));

    this.eventEmitter.emit('created', {
      bounds: valueAxis.bounds,
      chartRect: chartRect,
      axisX: axisX,
      axisY: axisY,
      svg: this.svg,
      options: options
    });
  }

  /**
   * This method creates a new bar chart and returns API object that you can use for later changes.
   *
   * @memberof Chartist.Bar
   * @param {String|Node} query A selector query string or directly a DOM element
   * @param {Object} data The data object that needs to consist of a labels and a series array
   * @param {Object} [options] The options object with options that override the default options. Check the examples for a detailed list.
   * @param {Array} [responsiveOptions] Specify an array of responsive option arrays which are a media query and options object pair => [[mediaQueryString, optionsObject],[more...]]
   * @return {Object} An object which exposes the API for the created chart
   *
   * @example
   * // Create a simple bar chart
   * var data = {
   *   labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
   *   series: [
   *     [5, 2, 4, 2, 0]
   *   ]
   * };
   *
   * // In the global name space Chartist we call the Bar function to initialize a bar chart. As a first parameter we pass in a selector where we would like to get our chart created and as a second parameter we pass our data object.
   * new Chartist.Bar('.ct-chart', data);
   *
   * @example
   * // This example creates a bipolar grouped bar chart where the boundaries are limitted to -10 and 10
   * new Chartist.Bar('.ct-chart', {
   *   labels: [1, 2, 3, 4, 5, 6, 7],
   *   series: [
   *     [1, 3, 2, -5, -3, 1, -6],
   *     [-5, -2, -4, -1, 2, -3, 1]
   *   ]
   * }, {
   *   seriesBarDistance: 12,
   *   low: -10,
   *   high: 10
   * });
   *
   */
  function Bar(query, data, options, responsiveOptions) {
    Chartist.Bar.super.constructor.call(this,
      query,
      data,
      defaultOptions,
      Chartist.extend({}, defaultOptions, options),
      responsiveOptions);
  }

  // Creating bar chart type in Chartist namespace
  Chartist.Bar = Chartist.Base.extend({
    constructor: Bar,
    createChart: createChart
  });

}(window, document, Chartist));
;/**
 * The pie chart module of Chartist that can be used to draw pie, donut or gauge charts
 *
 * @module Chartist.Pie
 */
/* global Chartist */
(function(window, document, Chartist) {
  'use strict';

  /**
   * Default options in line charts. Expand the code view to see a detailed list of options with comments.
   *
   * @memberof Chartist.Pie
   */
  var defaultOptions = {
    // Specify a fixed width for the chart as a string (i.e. '100px' or '50%')
    width: undefined,
    // Specify a fixed height for the chart as a string (i.e. '100px' or '50%')
    height: undefined,
    // Padding of the chart drawing area to the container element and labels as a number or padding object {top: 5, right: 5, bottom: 5, left: 5}
    chartPadding: 5,
    // Override the class names that get used to generate the SVG structure of the chart
    classNames: {
      chart: 'ct-chart-pie',
      series: 'ct-series',
      slice: 'ct-slice',
      donut: 'ct-donut',
      label: 'ct-label'
    },
    // The start angle of the pie chart in degrees where 0 points north. A higher value offsets the start angle clockwise.
    startAngle: 0,
    // An optional total you can specify. By specifying a total value, the sum of the values in the series must be this total in order to draw a full pie. You can use this parameter to draw only parts of a pie or gauge charts.
    total: undefined,
    // If specified the donut CSS classes will be used and strokes will be drawn instead of pie slices.
    donut: false,
    // Specify the donut stroke width, currently done in javascript for convenience. May move to CSS styles in the future.
    donutWidth: 60,
    // If a label should be shown or not
    showLabel: true,
    // Label position offset from the standard position which is half distance of the radius. This value can be either positive or negative. Positive values will position the label away from the center.
    labelOffset: 0,
    // An interpolation function for the label value
    labelInterpolationFnc: Chartist.noop,
    // Label direction can be 'neutral', 'explode' or 'implode'. The labels anchor will be positioned based on those settings as well as the fact if the labels are on the right or left side of the center of the chart. Usually explode is useful when labels are positioned far away from the center.
    labelDirection: 'neutral',
    // If true the whole data is reversed including labels, the series order as well as the whole series data arrays.
    reverseData: false
  };

  /**
   * Determines SVG anchor position based on direction and center parameter
   *
   * @param center
   * @param label
   * @param direction
   * @return {string}
   */
  function determineAnchorPosition(center, label, direction) {
    var toTheRight = label.x > center.x;

    if(toTheRight && direction === 'explode' ||
      !toTheRight && direction === 'implode') {
      return 'start';
    } else if(toTheRight && direction === 'implode' ||
      !toTheRight && direction === 'explode') {
      return 'end';
    } else {
      return 'middle';
    }
  }

  /**
   * Creates the pie chart
   *
   * @param options
   */
  function createChart(options) {
    var seriesGroups = [],
      chartRect,
      radius,
      labelRadius,
      totalDataSum,
      startAngle = options.startAngle,
      dataArray = Chartist.getDataArray(this.data, options.reverseData);

    // Create SVG.js draw
    this.svg = Chartist.createSvg(this.container, options.width, options.height, options.classNames.chart);
    // Calculate charting rect
    chartRect = Chartist.createChartRect(this.svg, options, defaultOptions.padding);
    // Get biggest circle radius possible within chartRect
    radius = Math.min(chartRect.width() / 2, chartRect.height() / 2);
    // Calculate total of all series to get reference value or use total reference from optional options
    totalDataSum = options.total || dataArray.reduce(function(previousValue, currentValue) {
      return previousValue + currentValue;
    }, 0);

    // If this is a donut chart we need to adjust our radius to enable strokes to be drawn inside
    // Unfortunately this is not possible with the current SVG Spec
    // See this proposal for more details: http://lists.w3.org/Archives/Public/www-svg/2003Oct/0000.html
    radius -= options.donut ? options.donutWidth / 2  : 0;

    // If a donut chart then the label position is at the radius, if regular pie chart it's half of the radius
    // see https://github.com/gionkunz/chartist-js/issues/21
    labelRadius = options.donut ? radius : radius / 2;
    // Add the offset to the labelRadius where a negative offset means closed to the center of the chart
    labelRadius += options.labelOffset;

    // Calculate end angle based on total sum and current data value and offset with padding
    var center = {
      x: chartRect.x1 + chartRect.width() / 2,
      y: chartRect.y2 + chartRect.height() / 2
    };

    // Check if there is only one non-zero value in the series array.
    var hasSingleValInSeries = this.data.series.filter(function(val) {
      return val !== 0;
    }).length === 1;

    // Draw the series
    // initialize series groups
    for (var i = 0; i < this.data.series.length; i++) {
      seriesGroups[i] = this.svg.elem('g', null, null, true);

      // If the series is an object and contains a name we add a custom attribute
      if(this.data.series[i].name) {
        seriesGroups[i].attr({
          'series-name': this.data.series[i].name,
          'meta': Chartist.serialize(this.data.series[i].meta)
        }, Chartist.xmlNs.uri);
      }

      // Use series class from series data or if not set generate one
      seriesGroups[i].addClass([
        options.classNames.series,
        (this.data.series[i].className || options.classNames.series + '-' + Chartist.alphaNumerate(i))
      ].join(' '));

      var endAngle = startAngle + dataArray[i] / totalDataSum * 360;
      // If we need to draw the arc for all 360 degrees we need to add a hack where we close the circle
      // with Z and use 359.99 degrees
      if(endAngle - startAngle === 360) {
        endAngle -= 0.01;
      }

      var start = Chartist.polarToCartesian(center.x, center.y, radius, startAngle - (i === 0 || hasSingleValInSeries ? 0 : 0.2)),
        end = Chartist.polarToCartesian(center.x, center.y, radius, endAngle);

      // Create a new path element for the pie chart. If this isn't a donut chart we should close the path for a correct stroke
      var path = new Chartist.Svg.Path(!options.donut)
        .move(end.x, end.y)
        .arc(radius, radius, 0, endAngle - startAngle > 180, 0, start.x, start.y);

      // If regular pie chart (no donut) we add a line to the center of the circle for completing the pie
      if(!options.donut) {
        path.line(center.x, center.y);
      }

      // Create the SVG path
      // If this is a donut chart we add the donut class, otherwise just a regular slice
      var pathElement = seriesGroups[i].elem('path', {
        d: path.stringify()
      }, options.classNames.slice + (options.donut ? ' ' + options.classNames.donut : ''));

      // Adding the pie series value to the path
      pathElement.attr({
        'value': dataArray[i]
      }, Chartist.xmlNs.uri);

      // If this is a donut, we add the stroke-width as style attribute
      if(options.donut) {
        pathElement.attr({
          'style': 'stroke-width: ' + (+options.donutWidth) + 'px'
        });
      }

      // Fire off draw event
      this.eventEmitter.emit('draw', {
        type: 'slice',
        value: dataArray[i],
        totalDataSum: totalDataSum,
        index: i,
        group: seriesGroups[i],
        element: pathElement,
        path: path.clone(),
        center: center,
        radius: radius,
        startAngle: startAngle,
        endAngle: endAngle
      });

      // If we need to show labels we need to add the label for this slice now
      if(options.showLabel) {
        // Position at the labelRadius distance from center and between start and end angle
        var labelPosition = Chartist.polarToCartesian(center.x, center.y, labelRadius, startAngle + (endAngle - startAngle) / 2),
          interpolatedValue = options.labelInterpolationFnc(this.data.labels ? this.data.labels[i] : dataArray[i], i);

        var labelElement = seriesGroups[i].elem('text', {
          dx: labelPosition.x,
          dy: labelPosition.y,
          'text-anchor': determineAnchorPosition(center, labelPosition, options.labelDirection)
        }, options.classNames.label).text('' + interpolatedValue);

        // Fire off draw event
        this.eventEmitter.emit('draw', {
          type: 'label',
          index: i,
          group: seriesGroups[i],
          element: labelElement,
          text: '' + interpolatedValue,
          x: labelPosition.x,
          y: labelPosition.y
        });
      }

      // Set next startAngle to current endAngle. Use slight offset so there are no transparent hairline issues
      // (except for last slice)
      startAngle = endAngle;
    }

    this.eventEmitter.emit('created', {
      chartRect: chartRect,
      svg: this.svg,
      options: options
    });
  }

  /**
   * This method creates a new pie chart and returns an object that can be used to redraw the chart.
   *
   * @memberof Chartist.Pie
   * @param {String|Node} query A selector query string or directly a DOM element
   * @param {Object} data The data object in the pie chart needs to have a series property with a one dimensional data array. The values will be normalized against each other and don't necessarily need to be in percentage. The series property can also be an array of objects that contain a data property with the value and a className property to override the CSS class name for the series group.
   * @param {Object} [options] The options object with options that override the default options. Check the examples for a detailed list.
   * @param {Array} [responsiveOptions] Specify an array of responsive option arrays which are a media query and options object pair => [[mediaQueryString, optionsObject],[more...]]
   * @return {Object} An object with a version and an update method to manually redraw the chart
   *
   * @example
   * // Simple pie chart example with four series
   * new Chartist.Pie('.ct-chart', {
   *   series: [10, 2, 4, 3]
   * });
   *
   * @example
   * // Drawing a donut chart
   * new Chartist.Pie('.ct-chart', {
   *   series: [10, 2, 4, 3]
   * }, {
   *   donut: true
   * });
   *
   * @example
   * // Using donut, startAngle and total to draw a gauge chart
   * new Chartist.Pie('.ct-chart', {
   *   series: [20, 10, 30, 40]
   * }, {
   *   donut: true,
   *   donutWidth: 20,
   *   startAngle: 270,
   *   total: 200
   * });
   *
   * @example
   * // Drawing a pie chart with padding and labels that are outside the pie
   * new Chartist.Pie('.ct-chart', {
   *   series: [20, 10, 30, 40]
   * }, {
   *   chartPadding: 30,
   *   labelOffset: 50,
   *   labelDirection: 'explode'
   * });
   *
   * @example
   * // Overriding the class names for individual series
   * new Chartist.Pie('.ct-chart', {
   *   series: [{
   *     data: 20,
   *     className: 'my-custom-class-one'
   *   }, {
   *     data: 10,
   *     className: 'my-custom-class-two'
   *   }, {
   *     data: 70,
   *     className: 'my-custom-class-three'
   *   }]
   * });
   */
  function Pie(query, data, options, responsiveOptions) {
    Chartist.Pie.super.constructor.call(this,
      query,
      data,
      defaultOptions,
      Chartist.extend({}, defaultOptions, options),
      responsiveOptions);
  }

  // Creating pie chart type in Chartist namespace
  Chartist.Pie = Chartist.Base.extend({
    constructor: Pie,
    createChart: createChart,
    determineAnchorPosition: determineAnchorPosition
  });

}(window, document, Chartist));

return Chartist;

}));

},{}],11:[function(require,module,exports){
'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _inherits = function (subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _React = require('react');

var _React2 = _interopRequireWildcard(_React);

var _Chartist = require('chartist');

var _Chartist2 = _interopRequireWildcard(_Chartist);

'use strict';

var ChartistGraph = (function (_React$Component) {
  function ChartistGraph() {
    _classCallCheck(this, ChartistGraph);

    if (_React$Component != null) {
      _React$Component.apply(this, arguments);
    }
  }

  _inherits(ChartistGraph, _React$Component);

  _createClass(ChartistGraph, [{
    key: 'displayName',
    enumerable: true
  }, {
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(newProps) {
      this.updateChart(newProps);
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      if (this.chartist) {
        try {
          this.chartist.detach();
        } catch (err) {}
      }
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      return this.updateChart(this.props);
    }
  }, {
    key: 'updateChart',
    value: function updateChart(config) {
      var type = config.type;
      var data = config.data;
      var options = config.options || {};
      var responsiveOptions = config.responsiveOptions || [];
      var event = undefined;

      if (this.chartist) {
        //this sometimes cause some error internal within chartist.
        try {
          this.chartist.detach();
        } catch (err) {
          console.err('internal chartist error: ', err);
        }
      }
      this.chartist = new _Chartist2['default'][type](_React2['default'].findDOMNode(this), data, options, responsiveOptions);

      //register event handlers
      /**
       * listeners: {
       *   draw : function() {}
       * }
       */
      if (config.listener) {
        for (event in config.listener) {
          if (config.listener.hasOwnProperty(event)) {
            this.chartist.on(event, config.listener[event]);
          }
        }
      }

      return this.chartist;
    }
  }, {
    key: 'render',
    value: function render() {
      return _React2['default'].DOM.div({ className: 'ct-chart' });
    }
  }]);

  return ChartistGraph;
})(_React2['default'].Component);

ChartistGraph.propTypes = {
  type: _React2['default'].PropTypes.string.isRequired,
  data: _React2['default'].PropTypes.object.isRequired,
  options: _React2['default'].PropTypes.object,
  responsiveOptions: _React2['default'].PropTypes.array
};

exports['default'] = ChartistGraph;
module.exports = exports['default'];


},{"chartist":10,"react":166}],12:[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule AutoFocusMixin
 * @typechecks static-only
 */

'use strict';

var focusNode = require("./focusNode");

var AutoFocusMixin = {
  componentDidMount: function() {
    if (this.props.autoFocus) {
      focusNode(this.getDOMNode());
    }
  }
};

module.exports = AutoFocusMixin;

},{"./focusNode":130}],13:[function(require,module,exports){
/**
 * Copyright 2013-2015 Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule BeforeInputEventPlugin
 * @typechecks static-only
 */

'use strict';

var EventConstants = require("./EventConstants");
var EventPropagators = require("./EventPropagators");
var ExecutionEnvironment = require("./ExecutionEnvironment");
var FallbackCompositionState = require("./FallbackCompositionState");
var SyntheticCompositionEvent = require("./SyntheticCompositionEvent");
var SyntheticInputEvent = require("./SyntheticInputEvent");

var keyOf = require("./keyOf");

var END_KEYCODES = [9, 13, 27, 32]; // Tab, Return, Esc, Space
var START_KEYCODE = 229;

var canUseCompositionEvent = (
  ExecutionEnvironment.canUseDOM &&
  'CompositionEvent' in window
);

var documentMode = null;
if (ExecutionEnvironment.canUseDOM && 'documentMode' in document) {
  documentMode = document.documentMode;
}

// Webkit offers a very useful `textInput` event that can be used to
// directly represent `beforeInput`. The IE `textinput` event is not as
// useful, so we don't use it.
var canUseTextInputEvent = (
  ExecutionEnvironment.canUseDOM &&
  'TextEvent' in window &&
  !documentMode &&
  !isPresto()
);

// In IE9+, we have access to composition events, but the data supplied
// by the native compositionend event may be incorrect. Japanese ideographic
// spaces, for instance (\u3000) are not recorded correctly.
var useFallbackCompositionData = (
  ExecutionEnvironment.canUseDOM &&
  (
    (!canUseCompositionEvent || documentMode && documentMode > 8 && documentMode <= 11)
  )
);

/**
 * Opera <= 12 includes TextEvent in window, but does not fire
 * text input events. Rely on keypress instead.
 */
function isPresto() {
  var opera = window.opera;
  return (
    typeof opera === 'object' &&
    typeof opera.version === 'function' &&
    parseInt(opera.version(), 10) <= 12
  );
}

var SPACEBAR_CODE = 32;
var SPACEBAR_CHAR = String.fromCharCode(SPACEBAR_CODE);

var topLevelTypes = EventConstants.topLevelTypes;

// Events and their corresponding property names.
var eventTypes = {
  beforeInput: {
    phasedRegistrationNames: {
      bubbled: keyOf({onBeforeInput: null}),
      captured: keyOf({onBeforeInputCapture: null})
    },
    dependencies: [
      topLevelTypes.topCompositionEnd,
      topLevelTypes.topKeyPress,
      topLevelTypes.topTextInput,
      topLevelTypes.topPaste
    ]
  },
  compositionEnd: {
    phasedRegistrationNames: {
      bubbled: keyOf({onCompositionEnd: null}),
      captured: keyOf({onCompositionEndCapture: null})
    },
    dependencies: [
      topLevelTypes.topBlur,
      topLevelTypes.topCompositionEnd,
      topLevelTypes.topKeyDown,
      topLevelTypes.topKeyPress,
      topLevelTypes.topKeyUp,
      topLevelTypes.topMouseDown
    ]
  },
  compositionStart: {
    phasedRegistrationNames: {
      bubbled: keyOf({onCompositionStart: null}),
      captured: keyOf({onCompositionStartCapture: null})
    },
    dependencies: [
      topLevelTypes.topBlur,
      topLevelTypes.topCompositionStart,
      topLevelTypes.topKeyDown,
      topLevelTypes.topKeyPress,
      topLevelTypes.topKeyUp,
      topLevelTypes.topMouseDown
    ]
  },
  compositionUpdate: {
    phasedRegistrationNames: {
      bubbled: keyOf({onCompositionUpdate: null}),
      captured: keyOf({onCompositionUpdateCapture: null})
    },
    dependencies: [
      topLevelTypes.topBlur,
      topLevelTypes.topCompositionUpdate,
      topLevelTypes.topKeyDown,
      topLevelTypes.topKeyPress,
      topLevelTypes.topKeyUp,
      topLevelTypes.topMouseDown
    ]
  }
};

// Track whether we've ever handled a keypress on the space key.
var hasSpaceKeypress = false;

/**
 * Return whether a native keypress event is assumed to be a command.
 * This is required because Firefox fires `keypress` events for key commands
 * (cut, copy, select-all, etc.) even though no character is inserted.
 */
function isKeypressCommand(nativeEvent) {
  return (
    (nativeEvent.ctrlKey || nativeEvent.altKey || nativeEvent.metaKey) &&
    // ctrlKey && altKey is equivalent to AltGr, and is not a command.
    !(nativeEvent.ctrlKey && nativeEvent.altKey)
  );
}


/**
 * Translate native top level events into event types.
 *
 * @param {string} topLevelType
 * @return {object}
 */
function getCompositionEventType(topLevelType) {
  switch (topLevelType) {
    case topLevelTypes.topCompositionStart:
      return eventTypes.compositionStart;
    case topLevelTypes.topCompositionEnd:
      return eventTypes.compositionEnd;
    case topLevelTypes.topCompositionUpdate:
      return eventTypes.compositionUpdate;
  }
}

/**
 * Does our fallback best-guess model think this event signifies that
 * composition has begun?
 *
 * @param {string} topLevelType
 * @param {object} nativeEvent
 * @return {boolean}
 */
function isFallbackCompositionStart(topLevelType, nativeEvent) {
  return (
    topLevelType === topLevelTypes.topKeyDown &&
    nativeEvent.keyCode === START_KEYCODE
  );
}

/**
 * Does our fallback mode think that this event is the end of composition?
 *
 * @param {string} topLevelType
 * @param {object} nativeEvent
 * @return {boolean}
 */
function isFallbackCompositionEnd(topLevelType, nativeEvent) {
  switch (topLevelType) {
    case topLevelTypes.topKeyUp:
      // Command keys insert or clear IME input.
      return (END_KEYCODES.indexOf(nativeEvent.keyCode) !== -1);
    case topLevelTypes.topKeyDown:
      // Expect IME keyCode on each keydown. If we get any other
      // code we must have exited earlier.
      return (nativeEvent.keyCode !== START_KEYCODE);
    case topLevelTypes.topKeyPress:
    case topLevelTypes.topMouseDown:
    case topLevelTypes.topBlur:
      // Events are not possible without cancelling IME.
      return true;
    default:
      return false;
  }
}

/**
 * Google Input Tools provides composition data via a CustomEvent,
 * with the `data` property populated in the `detail` object. If this
 * is available on the event object, use it. If not, this is a plain
 * composition event and we have nothing special to extract.
 *
 * @param {object} nativeEvent
 * @return {?string}
 */
function getDataFromCustomEvent(nativeEvent) {
  var detail = nativeEvent.detail;
  if (typeof detail === 'object' && 'data' in detail) {
    return detail.data;
  }
  return null;
}

// Track the current IME composition fallback object, if any.
var currentComposition = null;

/**
 * @param {string} topLevelType Record from `EventConstants`.
 * @param {DOMEventTarget} topLevelTarget The listening component root node.
 * @param {string} topLevelTargetID ID of `topLevelTarget`.
 * @param {object} nativeEvent Native browser event.
 * @return {?object} A SyntheticCompositionEvent.
 */
function extractCompositionEvent(
  topLevelType,
  topLevelTarget,
  topLevelTargetID,
  nativeEvent
) {
  var eventType;
  var fallbackData;

  if (canUseCompositionEvent) {
    eventType = getCompositionEventType(topLevelType);
  } else if (!currentComposition) {
    if (isFallbackCompositionStart(topLevelType, nativeEvent)) {
      eventType = eventTypes.compositionStart;
    }
  } else if (isFallbackCompositionEnd(topLevelType, nativeEvent)) {
    eventType = eventTypes.compositionEnd;
  }

  if (!eventType) {
    return null;
  }

  if (useFallbackCompositionData) {
    // The current composition is stored statically and must not be
    // overwritten while composition continues.
    if (!currentComposition && eventType === eventTypes.compositionStart) {
      currentComposition = FallbackCompositionState.getPooled(topLevelTarget);
    } else if (eventType === eventTypes.compositionEnd) {
      if (currentComposition) {
        fallbackData = currentComposition.getData();
      }
    }
  }

  var event = SyntheticCompositionEvent.getPooled(
    eventType,
    topLevelTargetID,
    nativeEvent
  );

  if (fallbackData) {
    // Inject data generated from fallback path into the synthetic event.
    // This matches the property of native CompositionEventInterface.
    event.data = fallbackData;
  } else {
    var customData = getDataFromCustomEvent(nativeEvent);
    if (customData !== null) {
      event.data = customData;
    }
  }

  EventPropagators.accumulateTwoPhaseDispatches(event);
  return event;
}

/**
 * @param {string} topLevelType Record from `EventConstants`.
 * @param {object} nativeEvent Native browser event.
 * @return {?string} The string corresponding to this `beforeInput` event.
 */
function getNativeBeforeInputChars(topLevelType, nativeEvent) {
  switch (topLevelType) {
    case topLevelTypes.topCompositionEnd:
      return getDataFromCustomEvent(nativeEvent);
    case topLevelTypes.topKeyPress:
      /**
       * If native `textInput` events are available, our goal is to make
       * use of them. However, there is a special case: the spacebar key.
       * In Webkit, preventing default on a spacebar `textInput` event
       * cancels character insertion, but it *also* causes the browser
       * to fall back to its default spacebar behavior of scrolling the
       * page.
       *
       * Tracking at:
       * https://code.google.com/p/chromium/issues/detail?id=355103
       *
       * To avoid this issue, use the keypress event as if no `textInput`
       * event is available.
       */
      var which = nativeEvent.which;
      if (which !== SPACEBAR_CODE) {
        return null;
      }

      hasSpaceKeypress = true;
      return SPACEBAR_CHAR;

    case topLevelTypes.topTextInput:
      // Record the characters to be added to the DOM.
      var chars = nativeEvent.data;

      // If it's a spacebar character, assume that we have already handled
      // it at the keypress level and bail immediately. Android Chrome
      // doesn't give us keycodes, so we need to blacklist it.
      if (chars === SPACEBAR_CHAR && hasSpaceKeypress) {
        return null;
      }

      return chars;

    default:
      // For other native event types, do nothing.
      return null;
  }
}

/**
 * For browsers that do not provide the `textInput` event, extract the
 * appropriate string to use for SyntheticInputEvent.
 *
 * @param {string} topLevelType Record from `EventConstants`.
 * @param {object} nativeEvent Native browser event.
 * @return {?string} The fallback string for this `beforeInput` event.
 */
function getFallbackBeforeInputChars(topLevelType, nativeEvent) {
  // If we are currently composing (IME) and using a fallback to do so,
  // try to extract the composed characters from the fallback object.
  if (currentComposition) {
    if (
      topLevelType === topLevelTypes.topCompositionEnd ||
      isFallbackCompositionEnd(topLevelType, nativeEvent)
    ) {
      var chars = currentComposition.getData();
      FallbackCompositionState.release(currentComposition);
      currentComposition = null;
      return chars;
    }
    return null;
  }

  switch (topLevelType) {
    case topLevelTypes.topPaste:
      // If a paste event occurs after a keypress, throw out the input
      // chars. Paste events should not lead to BeforeInput events.
      return null;
    case topLevelTypes.topKeyPress:
      /**
       * As of v27, Firefox may fire keypress events even when no character
       * will be inserted. A few possibilities:
       *
       * - `which` is `0`. Arrow keys, Esc key, etc.
       *
       * - `which` is the pressed key code, but no char is available.
       *   Ex: 'AltGr + d` in Polish. There is no modified character for
       *   this key combination and no character is inserted into the
       *   document, but FF fires the keypress for char code `100` anyway.
       *   No `input` event will occur.
       *
       * - `which` is the pressed key code, but a command combination is
       *   being used. Ex: `Cmd+C`. No character is inserted, and no
       *   `input` event will occur.
       */
      if (nativeEvent.which && !isKeypressCommand(nativeEvent)) {
        return String.fromCharCode(nativeEvent.which);
      }
      return null;
    case topLevelTypes.topCompositionEnd:
      return useFallbackCompositionData ? null : nativeEvent.data;
    default:
      return null;
  }
}

/**
 * Extract a SyntheticInputEvent for `beforeInput`, based on either native
 * `textInput` or fallback behavior.
 *
 * @param {string} topLevelType Record from `EventConstants`.
 * @param {DOMEventTarget} topLevelTarget The listening component root node.
 * @param {string} topLevelTargetID ID of `topLevelTarget`.
 * @param {object} nativeEvent Native browser event.
 * @return {?object} A SyntheticInputEvent.
 */
function extractBeforeInputEvent(
  topLevelType,
  topLevelTarget,
  topLevelTargetID,
  nativeEvent
) {
  var chars;

  if (canUseTextInputEvent) {
    chars = getNativeBeforeInputChars(topLevelType, nativeEvent);
  } else {
    chars = getFallbackBeforeInputChars(topLevelType, nativeEvent);
  }

  // If no characters are being inserted, no BeforeInput event should
  // be fired.
  if (!chars) {
    return null;
  }

  var event = SyntheticInputEvent.getPooled(
    eventTypes.beforeInput,
    topLevelTargetID,
    nativeEvent
  );

  event.data = chars;
  EventPropagators.accumulateTwoPhaseDispatches(event);
  return event;
}

/**
 * Create an `onBeforeInput` event to match
 * http://www.w3.org/TR/2013/WD-DOM-Level-3-Events-20131105/#events-inputevents.
 *
 * This event plugin is based on the native `textInput` event
 * available in Chrome, Safari, Opera, and IE. This event fires after
 * `onKeyPress` and `onCompositionEnd`, but before `onInput`.
 *
 * `beforeInput` is spec'd but not implemented in any browsers, and
 * the `input` event does not provide any useful information about what has
 * actually been added, contrary to the spec. Thus, `textInput` is the best
 * available event to identify the characters that have actually been inserted
 * into the target node.
 *
 * This plugin is also responsible for emitting `composition` events, thus
 * allowing us to share composition fallback code for both `beforeInput` and
 * `composition` event types.
 */
var BeforeInputEventPlugin = {

  eventTypes: eventTypes,

  /**
   * @param {string} topLevelType Record from `EventConstants`.
   * @param {DOMEventTarget} topLevelTarget The listening component root node.
   * @param {string} topLevelTargetID ID of `topLevelTarget`.
   * @param {object} nativeEvent Native browser event.
   * @return {*} An accumulation of synthetic events.
   * @see {EventPluginHub.extractEvents}
   */
  extractEvents: function(
    topLevelType,
    topLevelTarget,
    topLevelTargetID,
    nativeEvent
  ) {
    return [
      extractCompositionEvent(
        topLevelType,
        topLevelTarget,
        topLevelTargetID,
        nativeEvent
      ),
      extractBeforeInputEvent(
        topLevelType,
        topLevelTarget,
        topLevelTargetID,
        nativeEvent
      )
    ];
  }
};

module.exports = BeforeInputEventPlugin;

},{"./EventConstants":25,"./EventPropagators":30,"./ExecutionEnvironment":31,"./FallbackCompositionState":32,"./SyntheticCompositionEvent":104,"./SyntheticInputEvent":108,"./keyOf":152}],14:[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule CSSProperty
 */

'use strict';

/**
 * CSS properties which accept numbers but are not in units of "px".
 */
var isUnitlessNumber = {
  boxFlex: true,
  boxFlexGroup: true,
  columnCount: true,
  flex: true,
  flexGrow: true,
  flexPositive: true,
  flexShrink: true,
  flexNegative: true,
  fontWeight: true,
  lineClamp: true,
  lineHeight: true,
  opacity: true,
  order: true,
  orphans: true,
  widows: true,
  zIndex: true,
  zoom: true,

  // SVG-related properties
  fillOpacity: true,
  strokeDashoffset: true,
  strokeOpacity: true,
  strokeWidth: true
};

/**
 * @param {string} prefix vendor-specific prefix, eg: Webkit
 * @param {string} key style name, eg: transitionDuration
 * @return {string} style name prefixed with `prefix`, properly camelCased, eg:
 * WebkitTransitionDuration
 */
function prefixKey(prefix, key) {
  return prefix + key.charAt(0).toUpperCase() + key.substring(1);
}

/**
 * Support style names that may come passed in prefixed by adding permutations
 * of vendor prefixes.
 */
var prefixes = ['Webkit', 'ms', 'Moz', 'O'];

// Using Object.keys here, or else the vanilla for-in loop makes IE8 go into an
// infinite loop, because it iterates over the newly added props too.
Object.keys(isUnitlessNumber).forEach(function(prop) {
  prefixes.forEach(function(prefix) {
    isUnitlessNumber[prefixKey(prefix, prop)] = isUnitlessNumber[prop];
  });
});

/**
 * Most style properties can be unset by doing .style[prop] = '' but IE8
 * doesn't like doing that with shorthand properties so for the properties that
 * IE8 breaks on, which are listed here, we instead unset each of the
 * individual properties. See http://bugs.jquery.com/ticket/12385.
 * The 4-value 'clock' properties like margin, padding, border-width seem to
 * behave without any problems. Curiously, list-style works too without any
 * special prodding.
 */
var shorthandPropertyExpansions = {
  background: {
    backgroundImage: true,
    backgroundPosition: true,
    backgroundRepeat: true,
    backgroundColor: true
  },
  border: {
    borderWidth: true,
    borderStyle: true,
    borderColor: true
  },
  borderBottom: {
    borderBottomWidth: true,
    borderBottomStyle: true,
    borderBottomColor: true
  },
  borderLeft: {
    borderLeftWidth: true,
    borderLeftStyle: true,
    borderLeftColor: true
  },
  borderRight: {
    borderRightWidth: true,
    borderRightStyle: true,
    borderRightColor: true
  },
  borderTop: {
    borderTopWidth: true,
    borderTopStyle: true,
    borderTopColor: true
  },
  font: {
    fontStyle: true,
    fontVariant: true,
    fontWeight: true,
    fontSize: true,
    lineHeight: true,
    fontFamily: true
  }
};

var CSSProperty = {
  isUnitlessNumber: isUnitlessNumber,
  shorthandPropertyExpansions: shorthandPropertyExpansions
};

module.exports = CSSProperty;

},{}],15:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule CSSPropertyOperations
 * @typechecks static-only
 */

'use strict';

var CSSProperty = require("./CSSProperty");
var ExecutionEnvironment = require("./ExecutionEnvironment");

var camelizeStyleName = require("./camelizeStyleName");
var dangerousStyleValue = require("./dangerousStyleValue");
var hyphenateStyleName = require("./hyphenateStyleName");
var memoizeStringOnly = require("./memoizeStringOnly");
var warning = require("./warning");

var processStyleName = memoizeStringOnly(function(styleName) {
  return hyphenateStyleName(styleName);
});

var styleFloatAccessor = 'cssFloat';
if (ExecutionEnvironment.canUseDOM) {
  // IE8 only supports accessing cssFloat (standard) as styleFloat
  if (document.documentElement.style.cssFloat === undefined) {
    styleFloatAccessor = 'styleFloat';
  }
}

if ("production" !== process.env.NODE_ENV) {
  // 'msTransform' is correct, but the other prefixes should be capitalized
  var badVendoredStyleNamePattern = /^(?:webkit|moz|o)[A-Z]/;

  // style values shouldn't contain a semicolon
  var badStyleValueWithSemicolonPattern = /;\s*$/;

  var warnedStyleNames = {};
  var warnedStyleValues = {};

  var warnHyphenatedStyleName = function(name) {
    if (warnedStyleNames.hasOwnProperty(name) && warnedStyleNames[name]) {
      return;
    }

    warnedStyleNames[name] = true;
    ("production" !== process.env.NODE_ENV ? warning(
      false,
      'Unsupported style property %s. Did you mean %s?',
      name,
      camelizeStyleName(name)
    ) : null);
  };

  var warnBadVendoredStyleName = function(name) {
    if (warnedStyleNames.hasOwnProperty(name) && warnedStyleNames[name]) {
      return;
    }

    warnedStyleNames[name] = true;
    ("production" !== process.env.NODE_ENV ? warning(
      false,
      'Unsupported vendor-prefixed style property %s. Did you mean %s?',
      name,
      name.charAt(0).toUpperCase() + name.slice(1)
    ) : null);
  };

  var warnStyleValueWithSemicolon = function(name, value) {
    if (warnedStyleValues.hasOwnProperty(value) && warnedStyleValues[value]) {
      return;
    }

    warnedStyleValues[value] = true;
    ("production" !== process.env.NODE_ENV ? warning(
      false,
      'Style property values shouldn\'t contain a semicolon. ' +
      'Try "%s: %s" instead.',
      name,
      value.replace(badStyleValueWithSemicolonPattern, '')
    ) : null);
  };

  /**
   * @param {string} name
   * @param {*} value
   */
  var warnValidStyle = function(name, value) {
    if (name.indexOf('-') > -1) {
      warnHyphenatedStyleName(name);
    } else if (badVendoredStyleNamePattern.test(name)) {
      warnBadVendoredStyleName(name);
    } else if (badStyleValueWithSemicolonPattern.test(value)) {
      warnStyleValueWithSemicolon(name, value);
    }
  };
}

/**
 * Operations for dealing with CSS properties.
 */
var CSSPropertyOperations = {

  /**
   * Serializes a mapping of style properties for use as inline styles:
   *
   *   > createMarkupForStyles({width: '200px', height: 0})
   *   "width:200px;height:0;"
   *
   * Undefined values are ignored so that declarative programming is easier.
   * The result should be HTML-escaped before insertion into the DOM.
   *
   * @param {object} styles
   * @return {?string}
   */
  createMarkupForStyles: function(styles) {
    var serialized = '';
    for (var styleName in styles) {
      if (!styles.hasOwnProperty(styleName)) {
        continue;
      }
      var styleValue = styles[styleName];
      if ("production" !== process.env.NODE_ENV) {
        warnValidStyle(styleName, styleValue);
      }
      if (styleValue != null) {
        serialized += processStyleName(styleName) + ':';
        serialized += dangerousStyleValue(styleName, styleValue) + ';';
      }
    }
    return serialized || null;
  },

  /**
   * Sets the value for multiple styles on a node.  If a value is specified as
   * '' (empty string), the corresponding style property will be unset.
   *
   * @param {DOMElement} node
   * @param {object} styles
   */
  setValueForStyles: function(node, styles) {
    var style = node.style;
    for (var styleName in styles) {
      if (!styles.hasOwnProperty(styleName)) {
        continue;
      }
      if ("production" !== process.env.NODE_ENV) {
        warnValidStyle(styleName, styles[styleName]);
      }
      var styleValue = dangerousStyleValue(styleName, styles[styleName]);
      if (styleName === 'float') {
        styleName = styleFloatAccessor;
      }
      if (styleValue) {
        style[styleName] = styleValue;
      } else {
        var expansion = CSSProperty.shorthandPropertyExpansions[styleName];
        if (expansion) {
          // Shorthand property that IE8 won't like unsetting, so unset each
          // component to placate it
          for (var individualStyleName in expansion) {
            style[individualStyleName] = '';
          }
        } else {
          style[styleName] = '';
        }
      }
    }
  }

};

module.exports = CSSPropertyOperations;

}).call(this,require('_process'))
},{"./CSSProperty":14,"./ExecutionEnvironment":31,"./camelizeStyleName":119,"./dangerousStyleValue":124,"./hyphenateStyleName":144,"./memoizeStringOnly":154,"./warning":165,"_process":4}],16:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule CallbackQueue
 */

'use strict';

var PooledClass = require("./PooledClass");

var assign = require("./Object.assign");
var invariant = require("./invariant");

/**
 * A specialized pseudo-event module to help keep track of components waiting to
 * be notified when their DOM representations are available for use.
 *
 * This implements `PooledClass`, so you should never need to instantiate this.
 * Instead, use `CallbackQueue.getPooled()`.
 *
 * @class ReactMountReady
 * @implements PooledClass
 * @internal
 */
function CallbackQueue() {
  this._callbacks = null;
  this._contexts = null;
}

assign(CallbackQueue.prototype, {

  /**
   * Enqueues a callback to be invoked when `notifyAll` is invoked.
   *
   * @param {function} callback Invoked when `notifyAll` is invoked.
   * @param {?object} context Context to call `callback` with.
   * @internal
   */
  enqueue: function(callback, context) {
    this._callbacks = this._callbacks || [];
    this._contexts = this._contexts || [];
    this._callbacks.push(callback);
    this._contexts.push(context);
  },

  /**
   * Invokes all enqueued callbacks and clears the queue. This is invoked after
   * the DOM representation of a component has been created or updated.
   *
   * @internal
   */
  notifyAll: function() {
    var callbacks = this._callbacks;
    var contexts = this._contexts;
    if (callbacks) {
      ("production" !== process.env.NODE_ENV ? invariant(
        callbacks.length === contexts.length,
        'Mismatched list of contexts in callback queue'
      ) : invariant(callbacks.length === contexts.length));
      this._callbacks = null;
      this._contexts = null;
      for (var i = 0, l = callbacks.length; i < l; i++) {
        callbacks[i].call(contexts[i]);
      }
      callbacks.length = 0;
      contexts.length = 0;
    }
  },

  /**
   * Resets the internal queue.
   *
   * @internal
   */
  reset: function() {
    this._callbacks = null;
    this._contexts = null;
  },

  /**
   * `PooledClass` looks for this.
   */
  destructor: function() {
    this.reset();
  }

});

PooledClass.addPoolingTo(CallbackQueue);

module.exports = CallbackQueue;

}).call(this,require('_process'))
},{"./Object.assign":37,"./PooledClass":38,"./invariant":146,"_process":4}],17:[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ChangeEventPlugin
 */

'use strict';

var EventConstants = require("./EventConstants");
var EventPluginHub = require("./EventPluginHub");
var EventPropagators = require("./EventPropagators");
var ExecutionEnvironment = require("./ExecutionEnvironment");
var ReactUpdates = require("./ReactUpdates");
var SyntheticEvent = require("./SyntheticEvent");

var isEventSupported = require("./isEventSupported");
var isTextInputElement = require("./isTextInputElement");
var keyOf = require("./keyOf");

var topLevelTypes = EventConstants.topLevelTypes;

var eventTypes = {
  change: {
    phasedRegistrationNames: {
      bubbled: keyOf({onChange: null}),
      captured: keyOf({onChangeCapture: null})
    },
    dependencies: [
      topLevelTypes.topBlur,
      topLevelTypes.topChange,
      topLevelTypes.topClick,
      topLevelTypes.topFocus,
      topLevelTypes.topInput,
      topLevelTypes.topKeyDown,
      topLevelTypes.topKeyUp,
      topLevelTypes.topSelectionChange
    ]
  }
};

/**
 * For IE shims
 */
var activeElement = null;
var activeElementID = null;
var activeElementValue = null;
var activeElementValueProp = null;

/**
 * SECTION: handle `change` event
 */
function shouldUseChangeEvent(elem) {
  return (
    elem.nodeName === 'SELECT' ||
    (elem.nodeName === 'INPUT' && elem.type === 'file')
  );
}

var doesChangeEventBubble = false;
if (ExecutionEnvironment.canUseDOM) {
  // See `handleChange` comment below
  doesChangeEventBubble = isEventSupported('change') && (
    (!('documentMode' in document) || document.documentMode > 8)
  );
}

function manualDispatchChangeEvent(nativeEvent) {
  var event = SyntheticEvent.getPooled(
    eventTypes.change,
    activeElementID,
    nativeEvent
  );
  EventPropagators.accumulateTwoPhaseDispatches(event);

  // If change and propertychange bubbled, we'd just bind to it like all the
  // other events and have it go through ReactBrowserEventEmitter. Since it
  // doesn't, we manually listen for the events and so we have to enqueue and
  // process the abstract event manually.
  //
  // Batching is necessary here in order to ensure that all event handlers run
  // before the next rerender (including event handlers attached to ancestor
  // elements instead of directly on the input). Without this, controlled
  // components don't work properly in conjunction with event bubbling because
  // the component is rerendered and the value reverted before all the event
  // handlers can run. See https://github.com/facebook/react/issues/708.
  ReactUpdates.batchedUpdates(runEventInBatch, event);
}

function runEventInBatch(event) {
  EventPluginHub.enqueueEvents(event);
  EventPluginHub.processEventQueue();
}

function startWatchingForChangeEventIE8(target, targetID) {
  activeElement = target;
  activeElementID = targetID;
  activeElement.attachEvent('onchange', manualDispatchChangeEvent);
}

function stopWatchingForChangeEventIE8() {
  if (!activeElement) {
    return;
  }
  activeElement.detachEvent('onchange', manualDispatchChangeEvent);
  activeElement = null;
  activeElementID = null;
}

function getTargetIDForChangeEvent(
    topLevelType,
    topLevelTarget,
    topLevelTargetID) {
  if (topLevelType === topLevelTypes.topChange) {
    return topLevelTargetID;
  }
}
function handleEventsForChangeEventIE8(
    topLevelType,
    topLevelTarget,
    topLevelTargetID) {
  if (topLevelType === topLevelTypes.topFocus) {
    // stopWatching() should be a noop here but we call it just in case we
    // missed a blur event somehow.
    stopWatchingForChangeEventIE8();
    startWatchingForChangeEventIE8(topLevelTarget, topLevelTargetID);
  } else if (topLevelType === topLevelTypes.topBlur) {
    stopWatchingForChangeEventIE8();
  }
}


/**
 * SECTION: handle `input` event
 */
var isInputEventSupported = false;
if (ExecutionEnvironment.canUseDOM) {
  // IE9 claims to support the input event but fails to trigger it when
  // deleting text, so we ignore its input events
  isInputEventSupported = isEventSupported('input') && (
    (!('documentMode' in document) || document.documentMode > 9)
  );
}

/**
 * (For old IE.) Replacement getter/setter for the `value` property that gets
 * set on the active element.
 */
var newValueProp =  {
  get: function() {
    return activeElementValueProp.get.call(this);
  },
  set: function(val) {
    // Cast to a string so we can do equality checks.
    activeElementValue = '' + val;
    activeElementValueProp.set.call(this, val);
  }
};

/**
 * (For old IE.) Starts tracking propertychange events on the passed-in element
 * and override the value property so that we can distinguish user events from
 * value changes in JS.
 */
function startWatchingForValueChange(target, targetID) {
  activeElement = target;
  activeElementID = targetID;
  activeElementValue = target.value;
  activeElementValueProp = Object.getOwnPropertyDescriptor(
    target.constructor.prototype,
    'value'
  );

  Object.defineProperty(activeElement, 'value', newValueProp);
  activeElement.attachEvent('onpropertychange', handlePropertyChange);
}

/**
 * (For old IE.) Removes the event listeners from the currently-tracked element,
 * if any exists.
 */
function stopWatchingForValueChange() {
  if (!activeElement) {
    return;
  }

  // delete restores the original property definition
  delete activeElement.value;
  activeElement.detachEvent('onpropertychange', handlePropertyChange);

  activeElement = null;
  activeElementID = null;
  activeElementValue = null;
  activeElementValueProp = null;
}

/**
 * (For old IE.) Handles a propertychange event, sending a `change` event if
 * the value of the active element has changed.
 */
function handlePropertyChange(nativeEvent) {
  if (nativeEvent.propertyName !== 'value') {
    return;
  }
  var value = nativeEvent.srcElement.value;
  if (value === activeElementValue) {
    return;
  }
  activeElementValue = value;

  manualDispatchChangeEvent(nativeEvent);
}

/**
 * If a `change` event should be fired, returns the target's ID.
 */
function getTargetIDForInputEvent(
    topLevelType,
    topLevelTarget,
    topLevelTargetID) {
  if (topLevelType === topLevelTypes.topInput) {
    // In modern browsers (i.e., not IE8 or IE9), the input event is exactly
    // what we want so fall through here and trigger an abstract event
    return topLevelTargetID;
  }
}

// For IE8 and IE9.
function handleEventsForInputEventIE(
    topLevelType,
    topLevelTarget,
    topLevelTargetID) {
  if (topLevelType === topLevelTypes.topFocus) {
    // In IE8, we can capture almost all .value changes by adding a
    // propertychange handler and looking for events with propertyName
    // equal to 'value'
    // In IE9, propertychange fires for most input events but is buggy and
    // doesn't fire when text is deleted, but conveniently, selectionchange
    // appears to fire in all of the remaining cases so we catch those and
    // forward the event if the value has changed
    // In either case, we don't want to call the event handler if the value
    // is changed from JS so we redefine a setter for `.value` that updates
    // our activeElementValue variable, allowing us to ignore those changes
    //
    // stopWatching() should be a noop here but we call it just in case we
    // missed a blur event somehow.
    stopWatchingForValueChange();
    startWatchingForValueChange(topLevelTarget, topLevelTargetID);
  } else if (topLevelType === topLevelTypes.topBlur) {
    stopWatchingForValueChange();
  }
}

// For IE8 and IE9.
function getTargetIDForInputEventIE(
    topLevelType,
    topLevelTarget,
    topLevelTargetID) {
  if (topLevelType === topLevelTypes.topSelectionChange ||
      topLevelType === topLevelTypes.topKeyUp ||
      topLevelType === topLevelTypes.topKeyDown) {
    // On the selectionchange event, the target is just document which isn't
    // helpful for us so just check activeElement instead.
    //
    // 99% of the time, keydown and keyup aren't necessary. IE8 fails to fire
    // propertychange on the first input event after setting `value` from a
    // script and fires only keydown, keypress, keyup. Catching keyup usually
    // gets it and catching keydown lets us fire an event for the first
    // keystroke if user does a key repeat (it'll be a little delayed: right
    // before the second keystroke). Other input methods (e.g., paste) seem to
    // fire selectionchange normally.
    if (activeElement && activeElement.value !== activeElementValue) {
      activeElementValue = activeElement.value;
      return activeElementID;
    }
  }
}


/**
 * SECTION: handle `click` event
 */
function shouldUseClickEvent(elem) {
  // Use the `click` event to detect changes to checkbox and radio inputs.
  // This approach works across all browsers, whereas `change` does not fire
  // until `blur` in IE8.
  return (
    elem.nodeName === 'INPUT' &&
    (elem.type === 'checkbox' || elem.type === 'radio')
  );
}

function getTargetIDForClickEvent(
    topLevelType,
    topLevelTarget,
    topLevelTargetID) {
  if (topLevelType === topLevelTypes.topClick) {
    return topLevelTargetID;
  }
}

/**
 * This plugin creates an `onChange` event that normalizes change events
 * across form elements. This event fires at a time when it's possible to
 * change the element's value without seeing a flicker.
 *
 * Supported elements are:
 * - input (see `isTextInputElement`)
 * - textarea
 * - select
 */
var ChangeEventPlugin = {

  eventTypes: eventTypes,

  /**
   * @param {string} topLevelType Record from `EventConstants`.
   * @param {DOMEventTarget} topLevelTarget The listening component root node.
   * @param {string} topLevelTargetID ID of `topLevelTarget`.
   * @param {object} nativeEvent Native browser event.
   * @return {*} An accumulation of synthetic events.
   * @see {EventPluginHub.extractEvents}
   */
  extractEvents: function(
      topLevelType,
      topLevelTarget,
      topLevelTargetID,
      nativeEvent) {

    var getTargetIDFunc, handleEventFunc;
    if (shouldUseChangeEvent(topLevelTarget)) {
      if (doesChangeEventBubble) {
        getTargetIDFunc = getTargetIDForChangeEvent;
      } else {
        handleEventFunc = handleEventsForChangeEventIE8;
      }
    } else if (isTextInputElement(topLevelTarget)) {
      if (isInputEventSupported) {
        getTargetIDFunc = getTargetIDForInputEvent;
      } else {
        getTargetIDFunc = getTargetIDForInputEventIE;
        handleEventFunc = handleEventsForInputEventIE;
      }
    } else if (shouldUseClickEvent(topLevelTarget)) {
      getTargetIDFunc = getTargetIDForClickEvent;
    }

    if (getTargetIDFunc) {
      var targetID = getTargetIDFunc(
        topLevelType,
        topLevelTarget,
        topLevelTargetID
      );
      if (targetID) {
        var event = SyntheticEvent.getPooled(
          eventTypes.change,
          targetID,
          nativeEvent
        );
        EventPropagators.accumulateTwoPhaseDispatches(event);
        return event;
      }
    }

    if (handleEventFunc) {
      handleEventFunc(
        topLevelType,
        topLevelTarget,
        topLevelTargetID
      );
    }
  }

};

module.exports = ChangeEventPlugin;

},{"./EventConstants":25,"./EventPluginHub":27,"./EventPropagators":30,"./ExecutionEnvironment":31,"./ReactUpdates":98,"./SyntheticEvent":106,"./isEventSupported":147,"./isTextInputElement":149,"./keyOf":152}],18:[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ClientReactRootIndex
 * @typechecks
 */

'use strict';

var nextReactRootIndex = 0;

var ClientReactRootIndex = {
  createReactRootIndex: function() {
    return nextReactRootIndex++;
  }
};

module.exports = ClientReactRootIndex;

},{}],19:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule DOMChildrenOperations
 * @typechecks static-only
 */

'use strict';

var Danger = require("./Danger");
var ReactMultiChildUpdateTypes = require("./ReactMultiChildUpdateTypes");

var setTextContent = require("./setTextContent");
var invariant = require("./invariant");

/**
 * Inserts `childNode` as a child of `parentNode` at the `index`.
 *
 * @param {DOMElement} parentNode Parent node in which to insert.
 * @param {DOMElement} childNode Child node to insert.
 * @param {number} index Index at which to insert the child.
 * @internal
 */
function insertChildAt(parentNode, childNode, index) {
  // By exploiting arrays returning `undefined` for an undefined index, we can
  // rely exclusively on `insertBefore(node, null)` instead of also using
  // `appendChild(node)`. However, using `undefined` is not allowed by all
  // browsers so we must replace it with `null`.
  parentNode.insertBefore(
    childNode,
    parentNode.childNodes[index] || null
  );
}

/**
 * Operations for updating with DOM children.
 */
var DOMChildrenOperations = {

  dangerouslyReplaceNodeWithMarkup: Danger.dangerouslyReplaceNodeWithMarkup,

  updateTextContent: setTextContent,

  /**
   * Updates a component's children by processing a series of updates. The
   * update configurations are each expected to have a `parentNode` property.
   *
   * @param {array<object>} updates List of update configurations.
   * @param {array<string>} markupList List of markup strings.
   * @internal
   */
  processUpdates: function(updates, markupList) {
    var update;
    // Mapping from parent IDs to initial child orderings.
    var initialChildren = null;
    // List of children that will be moved or removed.
    var updatedChildren = null;

    for (var i = 0; i < updates.length; i++) {
      update = updates[i];
      if (update.type === ReactMultiChildUpdateTypes.MOVE_EXISTING ||
          update.type === ReactMultiChildUpdateTypes.REMOVE_NODE) {
        var updatedIndex = update.fromIndex;
        var updatedChild = update.parentNode.childNodes[updatedIndex];
        var parentID = update.parentID;

        ("production" !== process.env.NODE_ENV ? invariant(
          updatedChild,
          'processUpdates(): Unable to find child %s of element. This ' +
          'probably means the DOM was unexpectedly mutated (e.g., by the ' +
          'browser), usually due to forgetting a <tbody> when using tables, ' +
          'nesting tags like <form>, <p>, or <a>, or using non-SVG elements ' +
          'in an <svg> parent. Try inspecting the child nodes of the element ' +
          'with React ID `%s`.',
          updatedIndex,
          parentID
        ) : invariant(updatedChild));

        initialChildren = initialChildren || {};
        initialChildren[parentID] = initialChildren[parentID] || [];
        initialChildren[parentID][updatedIndex] = updatedChild;

        updatedChildren = updatedChildren || [];
        updatedChildren.push(updatedChild);
      }
    }

    var renderedMarkup = Danger.dangerouslyRenderMarkup(markupList);

    // Remove updated children first so that `toIndex` is consistent.
    if (updatedChildren) {
      for (var j = 0; j < updatedChildren.length; j++) {
        updatedChildren[j].parentNode.removeChild(updatedChildren[j]);
      }
    }

    for (var k = 0; k < updates.length; k++) {
      update = updates[k];
      switch (update.type) {
        case ReactMultiChildUpdateTypes.INSERT_MARKUP:
          insertChildAt(
            update.parentNode,
            renderedMarkup[update.markupIndex],
            update.toIndex
          );
          break;
        case ReactMultiChildUpdateTypes.MOVE_EXISTING:
          insertChildAt(
            update.parentNode,
            initialChildren[update.parentID][update.fromIndex],
            update.toIndex
          );
          break;
        case ReactMultiChildUpdateTypes.TEXT_CONTENT:
          setTextContent(
            update.parentNode,
            update.textContent
          );
          break;
        case ReactMultiChildUpdateTypes.REMOVE_NODE:
          // Already removed by the for-loop above.
          break;
      }
    }
  }

};

module.exports = DOMChildrenOperations;

}).call(this,require('_process'))
},{"./Danger":22,"./ReactMultiChildUpdateTypes":83,"./invariant":146,"./setTextContent":160,"_process":4}],20:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule DOMProperty
 * @typechecks static-only
 */

/*jslint bitwise: true */

'use strict';

var invariant = require("./invariant");

function checkMask(value, bitmask) {
  return (value & bitmask) === bitmask;
}

var DOMPropertyInjection = {
  /**
   * Mapping from normalized, camelcased property names to a configuration that
   * specifies how the associated DOM property should be accessed or rendered.
   */
  MUST_USE_ATTRIBUTE: 0x1,
  MUST_USE_PROPERTY: 0x2,
  HAS_SIDE_EFFECTS: 0x4,
  HAS_BOOLEAN_VALUE: 0x8,
  HAS_NUMERIC_VALUE: 0x10,
  HAS_POSITIVE_NUMERIC_VALUE: 0x20 | 0x10,
  HAS_OVERLOADED_BOOLEAN_VALUE: 0x40,

  /**
   * Inject some specialized knowledge about the DOM. This takes a config object
   * with the following properties:
   *
   * isCustomAttribute: function that given an attribute name will return true
   * if it can be inserted into the DOM verbatim. Useful for data-* or aria-*
   * attributes where it's impossible to enumerate all of the possible
   * attribute names,
   *
   * Properties: object mapping DOM property name to one of the
   * DOMPropertyInjection constants or null. If your attribute isn't in here,
   * it won't get written to the DOM.
   *
   * DOMAttributeNames: object mapping React attribute name to the DOM
   * attribute name. Attribute names not specified use the **lowercase**
   * normalized name.
   *
   * DOMPropertyNames: similar to DOMAttributeNames but for DOM properties.
   * Property names not specified use the normalized name.
   *
   * DOMMutationMethods: Properties that require special mutation methods. If
   * `value` is undefined, the mutation method should unset the property.
   *
   * @param {object} domPropertyConfig the config as described above.
   */
  injectDOMPropertyConfig: function(domPropertyConfig) {
    var Properties = domPropertyConfig.Properties || {};
    var DOMAttributeNames = domPropertyConfig.DOMAttributeNames || {};
    var DOMPropertyNames = domPropertyConfig.DOMPropertyNames || {};
    var DOMMutationMethods = domPropertyConfig.DOMMutationMethods || {};

    if (domPropertyConfig.isCustomAttribute) {
      DOMProperty._isCustomAttributeFunctions.push(
        domPropertyConfig.isCustomAttribute
      );
    }

    for (var propName in Properties) {
      ("production" !== process.env.NODE_ENV ? invariant(
        !DOMProperty.isStandardName.hasOwnProperty(propName),
        'injectDOMPropertyConfig(...): You\'re trying to inject DOM property ' +
        '\'%s\' which has already been injected. You may be accidentally ' +
        'injecting the same DOM property config twice, or you may be ' +
        'injecting two configs that have conflicting property names.',
        propName
      ) : invariant(!DOMProperty.isStandardName.hasOwnProperty(propName)));

      DOMProperty.isStandardName[propName] = true;

      var lowerCased = propName.toLowerCase();
      DOMProperty.getPossibleStandardName[lowerCased] = propName;

      if (DOMAttributeNames.hasOwnProperty(propName)) {
        var attributeName = DOMAttributeNames[propName];
        DOMProperty.getPossibleStandardName[attributeName] = propName;
        DOMProperty.getAttributeName[propName] = attributeName;
      } else {
        DOMProperty.getAttributeName[propName] = lowerCased;
      }

      DOMProperty.getPropertyName[propName] =
        DOMPropertyNames.hasOwnProperty(propName) ?
          DOMPropertyNames[propName] :
          propName;

      if (DOMMutationMethods.hasOwnProperty(propName)) {
        DOMProperty.getMutationMethod[propName] = DOMMutationMethods[propName];
      } else {
        DOMProperty.getMutationMethod[propName] = null;
      }

      var propConfig = Properties[propName];
      DOMProperty.mustUseAttribute[propName] =
        checkMask(propConfig, DOMPropertyInjection.MUST_USE_ATTRIBUTE);
      DOMProperty.mustUseProperty[propName] =
        checkMask(propConfig, DOMPropertyInjection.MUST_USE_PROPERTY);
      DOMProperty.hasSideEffects[propName] =
        checkMask(propConfig, DOMPropertyInjection.HAS_SIDE_EFFECTS);
      DOMProperty.hasBooleanValue[propName] =
        checkMask(propConfig, DOMPropertyInjection.HAS_BOOLEAN_VALUE);
      DOMProperty.hasNumericValue[propName] =
        checkMask(propConfig, DOMPropertyInjection.HAS_NUMERIC_VALUE);
      DOMProperty.hasPositiveNumericValue[propName] =
        checkMask(propConfig, DOMPropertyInjection.HAS_POSITIVE_NUMERIC_VALUE);
      DOMProperty.hasOverloadedBooleanValue[propName] =
        checkMask(propConfig, DOMPropertyInjection.HAS_OVERLOADED_BOOLEAN_VALUE);

      ("production" !== process.env.NODE_ENV ? invariant(
        !DOMProperty.mustUseAttribute[propName] ||
          !DOMProperty.mustUseProperty[propName],
        'DOMProperty: Cannot require using both attribute and property: %s',
        propName
      ) : invariant(!DOMProperty.mustUseAttribute[propName] ||
        !DOMProperty.mustUseProperty[propName]));
      ("production" !== process.env.NODE_ENV ? invariant(
        DOMProperty.mustUseProperty[propName] ||
          !DOMProperty.hasSideEffects[propName],
        'DOMProperty: Properties that have side effects must use property: %s',
        propName
      ) : invariant(DOMProperty.mustUseProperty[propName] ||
        !DOMProperty.hasSideEffects[propName]));
      ("production" !== process.env.NODE_ENV ? invariant(
        !!DOMProperty.hasBooleanValue[propName] +
          !!DOMProperty.hasNumericValue[propName] +
          !!DOMProperty.hasOverloadedBooleanValue[propName] <= 1,
        'DOMProperty: Value can be one of boolean, overloaded boolean, or ' +
        'numeric value, but not a combination: %s',
        propName
      ) : invariant(!!DOMProperty.hasBooleanValue[propName] +
        !!DOMProperty.hasNumericValue[propName] +
        !!DOMProperty.hasOverloadedBooleanValue[propName] <= 1));
    }
  }
};
var defaultValueCache = {};

/**
 * DOMProperty exports lookup objects that can be used like functions:
 *
 *   > DOMProperty.isValid['id']
 *   true
 *   > DOMProperty.isValid['foobar']
 *   undefined
 *
 * Although this may be confusing, it performs better in general.
 *
 * @see http://jsperf.com/key-exists
 * @see http://jsperf.com/key-missing
 */
var DOMProperty = {

  ID_ATTRIBUTE_NAME: 'data-reactid',

  /**
   * Checks whether a property name is a standard property.
   * @type {Object}
   */
  isStandardName: {},

  /**
   * Mapping from lowercase property names to the properly cased version, used
   * to warn in the case of missing properties.
   * @type {Object}
   */
  getPossibleStandardName: {},

  /**
   * Mapping from normalized names to attribute names that differ. Attribute
   * names are used when rendering markup or with `*Attribute()`.
   * @type {Object}
   */
  getAttributeName: {},

  /**
   * Mapping from normalized names to properties on DOM node instances.
   * (This includes properties that mutate due to external factors.)
   * @type {Object}
   */
  getPropertyName: {},

  /**
   * Mapping from normalized names to mutation methods. This will only exist if
   * mutation cannot be set simply by the property or `setAttribute()`.
   * @type {Object}
   */
  getMutationMethod: {},

  /**
   * Whether the property must be accessed and mutated as an object property.
   * @type {Object}
   */
  mustUseAttribute: {},

  /**
   * Whether the property must be accessed and mutated using `*Attribute()`.
   * (This includes anything that fails `<propName> in <element>`.)
   * @type {Object}
   */
  mustUseProperty: {},

  /**
   * Whether or not setting a value causes side effects such as triggering
   * resources to be loaded or text selection changes. We must ensure that
   * the value is only set if it has changed.
   * @type {Object}
   */
  hasSideEffects: {},

  /**
   * Whether the property should be removed when set to a falsey value.
   * @type {Object}
   */
  hasBooleanValue: {},

  /**
   * Whether the property must be numeric or parse as a
   * numeric and should be removed when set to a falsey value.
   * @type {Object}
   */
  hasNumericValue: {},

  /**
   * Whether the property must be positive numeric or parse as a positive
   * numeric and should be removed when set to a falsey value.
   * @type {Object}
   */
  hasPositiveNumericValue: {},

  /**
   * Whether the property can be used as a flag as well as with a value. Removed
   * when strictly equal to false; present without a value when strictly equal
   * to true; present with a value otherwise.
   * @type {Object}
   */
  hasOverloadedBooleanValue: {},

  /**
   * All of the isCustomAttribute() functions that have been injected.
   */
  _isCustomAttributeFunctions: [],

  /**
   * Checks whether a property name is a custom attribute.
   * @method
   */
  isCustomAttribute: function(attributeName) {
    for (var i = 0; i < DOMProperty._isCustomAttributeFunctions.length; i++) {
      var isCustomAttributeFn = DOMProperty._isCustomAttributeFunctions[i];
      if (isCustomAttributeFn(attributeName)) {
        return true;
      }
    }
    return false;
  },

  /**
   * Returns the default property value for a DOM property (i.e., not an
   * attribute). Most default values are '' or false, but not all. Worse yet,
   * some (in particular, `type`) vary depending on the type of element.
   *
   * TODO: Is it better to grab all the possible properties when creating an
   * element to avoid having to create the same element twice?
   */
  getDefaultValueForProperty: function(nodeName, prop) {
    var nodeDefaults = defaultValueCache[nodeName];
    var testElement;
    if (!nodeDefaults) {
      defaultValueCache[nodeName] = nodeDefaults = {};
    }
    if (!(prop in nodeDefaults)) {
      testElement = document.createElement(nodeName);
      nodeDefaults[prop] = testElement[prop];
    }
    return nodeDefaults[prop];
  },

  injection: DOMPropertyInjection
};

module.exports = DOMProperty;

}).call(this,require('_process'))
},{"./invariant":146,"_process":4}],21:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule DOMPropertyOperations
 * @typechecks static-only
 */

'use strict';

var DOMProperty = require("./DOMProperty");

var quoteAttributeValueForBrowser = require("./quoteAttributeValueForBrowser");
var warning = require("./warning");

function shouldIgnoreValue(name, value) {
  return value == null ||
    (DOMProperty.hasBooleanValue[name] && !value) ||
    (DOMProperty.hasNumericValue[name] && isNaN(value)) ||
    (DOMProperty.hasPositiveNumericValue[name] && (value < 1)) ||
    (DOMProperty.hasOverloadedBooleanValue[name] && value === false);
}

if ("production" !== process.env.NODE_ENV) {
  var reactProps = {
    children: true,
    dangerouslySetInnerHTML: true,
    key: true,
    ref: true
  };
  var warnedProperties = {};

  var warnUnknownProperty = function(name) {
    if (reactProps.hasOwnProperty(name) && reactProps[name] ||
        warnedProperties.hasOwnProperty(name) && warnedProperties[name]) {
      return;
    }

    warnedProperties[name] = true;
    var lowerCasedName = name.toLowerCase();

    // data-* attributes should be lowercase; suggest the lowercase version
    var standardName = (
      DOMProperty.isCustomAttribute(lowerCasedName) ?
        lowerCasedName :
      DOMProperty.getPossibleStandardName.hasOwnProperty(lowerCasedName) ?
        DOMProperty.getPossibleStandardName[lowerCasedName] :
        null
    );

    // For now, only warn when we have a suggested correction. This prevents
    // logging too much when using transferPropsTo.
    ("production" !== process.env.NODE_ENV ? warning(
      standardName == null,
      'Unknown DOM property %s. Did you mean %s?',
      name,
      standardName
    ) : null);

  };
}

/**
 * Operations for dealing with DOM properties.
 */
var DOMPropertyOperations = {

  /**
   * Creates markup for the ID property.
   *
   * @param {string} id Unescaped ID.
   * @return {string} Markup string.
   */
  createMarkupForID: function(id) {
    return DOMProperty.ID_ATTRIBUTE_NAME + '=' +
      quoteAttributeValueForBrowser(id);
  },

  /**
   * Creates markup for a property.
   *
   * @param {string} name
   * @param {*} value
   * @return {?string} Markup string, or null if the property was invalid.
   */
  createMarkupForProperty: function(name, value) {
    if (DOMProperty.isStandardName.hasOwnProperty(name) &&
        DOMProperty.isStandardName[name]) {
      if (shouldIgnoreValue(name, value)) {
        return '';
      }
      var attributeName = DOMProperty.getAttributeName[name];
      if (DOMProperty.hasBooleanValue[name] ||
          (DOMProperty.hasOverloadedBooleanValue[name] && value === true)) {
        return attributeName;
      }
      return attributeName + '=' + quoteAttributeValueForBrowser(value);
    } else if (DOMProperty.isCustomAttribute(name)) {
      if (value == null) {
        return '';
      }
      return name + '=' + quoteAttributeValueForBrowser(value);
    } else if ("production" !== process.env.NODE_ENV) {
      warnUnknownProperty(name);
    }
    return null;
  },

  /**
   * Sets the value for a property on a node.
   *
   * @param {DOMElement} node
   * @param {string} name
   * @param {*} value
   */
  setValueForProperty: function(node, name, value) {
    if (DOMProperty.isStandardName.hasOwnProperty(name) &&
        DOMProperty.isStandardName[name]) {
      var mutationMethod = DOMProperty.getMutationMethod[name];
      if (mutationMethod) {
        mutationMethod(node, value);
      } else if (shouldIgnoreValue(name, value)) {
        this.deleteValueForProperty(node, name);
      } else if (DOMProperty.mustUseAttribute[name]) {
        // `setAttribute` with objects becomes only `[object]` in IE8/9,
        // ('' + value) makes it output the correct toString()-value.
        node.setAttribute(DOMProperty.getAttributeName[name], '' + value);
      } else {
        var propName = DOMProperty.getPropertyName[name];
        // Must explicitly cast values for HAS_SIDE_EFFECTS-properties to the
        // property type before comparing; only `value` does and is string.
        if (!DOMProperty.hasSideEffects[name] ||
            ('' + node[propName]) !== ('' + value)) {
          // Contrary to `setAttribute`, object properties are properly
          // `toString`ed by IE8/9.
          node[propName] = value;
        }
      }
    } else if (DOMProperty.isCustomAttribute(name)) {
      if (value == null) {
        node.removeAttribute(name);
      } else {
        node.setAttribute(name, '' + value);
      }
    } else if ("production" !== process.env.NODE_ENV) {
      warnUnknownProperty(name);
    }
  },

  /**
   * Deletes the value for a property on a node.
   *
   * @param {DOMElement} node
   * @param {string} name
   */
  deleteValueForProperty: function(node, name) {
    if (DOMProperty.isStandardName.hasOwnProperty(name) &&
        DOMProperty.isStandardName[name]) {
      var mutationMethod = DOMProperty.getMutationMethod[name];
      if (mutationMethod) {
        mutationMethod(node, undefined);
      } else if (DOMProperty.mustUseAttribute[name]) {
        node.removeAttribute(DOMProperty.getAttributeName[name]);
      } else {
        var propName = DOMProperty.getPropertyName[name];
        var defaultValue = DOMProperty.getDefaultValueForProperty(
          node.nodeName,
          propName
        );
        if (!DOMProperty.hasSideEffects[name] ||
            ('' + node[propName]) !== defaultValue) {
          node[propName] = defaultValue;
        }
      }
    } else if (DOMProperty.isCustomAttribute(name)) {
      node.removeAttribute(name);
    } else if ("production" !== process.env.NODE_ENV) {
      warnUnknownProperty(name);
    }
  }

};

module.exports = DOMPropertyOperations;

}).call(this,require('_process'))
},{"./DOMProperty":20,"./quoteAttributeValueForBrowser":158,"./warning":165,"_process":4}],22:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule Danger
 * @typechecks static-only
 */

/*jslint evil: true, sub: true */

'use strict';

var ExecutionEnvironment = require("./ExecutionEnvironment");

var createNodesFromMarkup = require("./createNodesFromMarkup");
var emptyFunction = require("./emptyFunction");
var getMarkupWrap = require("./getMarkupWrap");
var invariant = require("./invariant");

var OPEN_TAG_NAME_EXP = /^(<[^ \/>]+)/;
var RESULT_INDEX_ATTR = 'data-danger-index';

/**
 * Extracts the `nodeName` from a string of markup.
 *
 * NOTE: Extracting the `nodeName` does not require a regular expression match
 * because we make assumptions about React-generated markup (i.e. there are no
 * spaces surrounding the opening tag and there is at least one attribute).
 *
 * @param {string} markup String of markup.
 * @return {string} Node name of the supplied markup.
 * @see http://jsperf.com/extract-nodename
 */
function getNodeName(markup) {
  return markup.substring(1, markup.indexOf(' '));
}

var Danger = {

  /**
   * Renders markup into an array of nodes. The markup is expected to render
   * into a list of root nodes. Also, the length of `resultList` and
   * `markupList` should be the same.
   *
   * @param {array<string>} markupList List of markup strings to render.
   * @return {array<DOMElement>} List of rendered nodes.
   * @internal
   */
  dangerouslyRenderMarkup: function(markupList) {
    ("production" !== process.env.NODE_ENV ? invariant(
      ExecutionEnvironment.canUseDOM,
      'dangerouslyRenderMarkup(...): Cannot render markup in a worker ' +
      'thread. Make sure `window` and `document` are available globally ' +
      'before requiring React when unit testing or use ' +
      'React.renderToString for server rendering.'
    ) : invariant(ExecutionEnvironment.canUseDOM));
    var nodeName;
    var markupByNodeName = {};
    // Group markup by `nodeName` if a wrap is necessary, else by '*'.
    for (var i = 0; i < markupList.length; i++) {
      ("production" !== process.env.NODE_ENV ? invariant(
        markupList[i],
        'dangerouslyRenderMarkup(...): Missing markup.'
      ) : invariant(markupList[i]));
      nodeName = getNodeName(markupList[i]);
      nodeName = getMarkupWrap(nodeName) ? nodeName : '*';
      markupByNodeName[nodeName] = markupByNodeName[nodeName] || [];
      markupByNodeName[nodeName][i] = markupList[i];
    }
    var resultList = [];
    var resultListAssignmentCount = 0;
    for (nodeName in markupByNodeName) {
      if (!markupByNodeName.hasOwnProperty(nodeName)) {
        continue;
      }
      var markupListByNodeName = markupByNodeName[nodeName];

      // This for-in loop skips the holes of the sparse array. The order of
      // iteration should follow the order of assignment, which happens to match
      // numerical index order, but we don't rely on that.
      var resultIndex;
      for (resultIndex in markupListByNodeName) {
        if (markupListByNodeName.hasOwnProperty(resultIndex)) {
          var markup = markupListByNodeName[resultIndex];

          // Push the requested markup with an additional RESULT_INDEX_ATTR
          // attribute.  If the markup does not start with a < character, it
          // will be discarded below (with an appropriate console.error).
          markupListByNodeName[resultIndex] = markup.replace(
            OPEN_TAG_NAME_EXP,
            // This index will be parsed back out below.
            '$1 ' + RESULT_INDEX_ATTR + '="' + resultIndex + '" '
          );
        }
      }

      // Render each group of markup with similar wrapping `nodeName`.
      var renderNodes = createNodesFromMarkup(
        markupListByNodeName.join(''),
        emptyFunction // Do nothing special with <script> tags.
      );

      for (var j = 0; j < renderNodes.length; ++j) {
        var renderNode = renderNodes[j];
        if (renderNode.hasAttribute &&
            renderNode.hasAttribute(RESULT_INDEX_ATTR)) {

          resultIndex = +renderNode.getAttribute(RESULT_INDEX_ATTR);
          renderNode.removeAttribute(RESULT_INDEX_ATTR);

          ("production" !== process.env.NODE_ENV ? invariant(
            !resultList.hasOwnProperty(resultIndex),
            'Danger: Assigning to an already-occupied result index.'
          ) : invariant(!resultList.hasOwnProperty(resultIndex)));

          resultList[resultIndex] = renderNode;

          // This should match resultList.length and markupList.length when
          // we're done.
          resultListAssignmentCount += 1;

        } else if ("production" !== process.env.NODE_ENV) {
          console.error(
            'Danger: Discarding unexpected node:',
            renderNode
          );
        }
      }
    }

    // Although resultList was populated out of order, it should now be a dense
    // array.
    ("production" !== process.env.NODE_ENV ? invariant(
      resultListAssignmentCount === resultList.length,
      'Danger: Did not assign to every index of resultList.'
    ) : invariant(resultListAssignmentCount === resultList.length));

    ("production" !== process.env.NODE_ENV ? invariant(
      resultList.length === markupList.length,
      'Danger: Expected markup to render %s nodes, but rendered %s.',
      markupList.length,
      resultList.length
    ) : invariant(resultList.length === markupList.length));

    return resultList;
  },

  /**
   * Replaces a node with a string of markup at its current position within its
   * parent. The markup must render into a single root node.
   *
   * @param {DOMElement} oldChild Child node to replace.
   * @param {string} markup Markup to render in place of the child node.
   * @internal
   */
  dangerouslyReplaceNodeWithMarkup: function(oldChild, markup) {
    ("production" !== process.env.NODE_ENV ? invariant(
      ExecutionEnvironment.canUseDOM,
      'dangerouslyReplaceNodeWithMarkup(...): Cannot render markup in a ' +
      'worker thread. Make sure `window` and `document` are available ' +
      'globally before requiring React when unit testing or use ' +
      'React.renderToString for server rendering.'
    ) : invariant(ExecutionEnvironment.canUseDOM));
    ("production" !== process.env.NODE_ENV ? invariant(markup, 'dangerouslyReplaceNodeWithMarkup(...): Missing markup.') : invariant(markup));
    ("production" !== process.env.NODE_ENV ? invariant(
      oldChild.tagName.toLowerCase() !== 'html',
      'dangerouslyReplaceNodeWithMarkup(...): Cannot replace markup of the ' +
      '<html> node. This is because browser quirks make this unreliable ' +
      'and/or slow. If you want to render to the root you must use ' +
      'server rendering. See React.renderToString().'
    ) : invariant(oldChild.tagName.toLowerCase() !== 'html'));

    var newChild = createNodesFromMarkup(markup, emptyFunction)[0];
    oldChild.parentNode.replaceChild(newChild, oldChild);
  }

};

module.exports = Danger;

}).call(this,require('_process'))
},{"./ExecutionEnvironment":31,"./createNodesFromMarkup":123,"./emptyFunction":125,"./getMarkupWrap":138,"./invariant":146,"_process":4}],23:[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule DefaultEventPluginOrder
 */

'use strict';

var keyOf = require("./keyOf");

/**
 * Module that is injectable into `EventPluginHub`, that specifies a
 * deterministic ordering of `EventPlugin`s. A convenient way to reason about
 * plugins, without having to package every one of them. This is better than
 * having plugins be ordered in the same order that they are injected because
 * that ordering would be influenced by the packaging order.
 * `ResponderEventPlugin` must occur before `SimpleEventPlugin` so that
 * preventing default on events is convenient in `SimpleEventPlugin` handlers.
 */
var DefaultEventPluginOrder = [
  keyOf({ResponderEventPlugin: null}),
  keyOf({SimpleEventPlugin: null}),
  keyOf({TapEventPlugin: null}),
  keyOf({EnterLeaveEventPlugin: null}),
  keyOf({ChangeEventPlugin: null}),
  keyOf({SelectEventPlugin: null}),
  keyOf({BeforeInputEventPlugin: null}),
  keyOf({AnalyticsEventPlugin: null}),
  keyOf({MobileSafariClickEventPlugin: null})
];

module.exports = DefaultEventPluginOrder;

},{"./keyOf":152}],24:[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule EnterLeaveEventPlugin
 * @typechecks static-only
 */

'use strict';

var EventConstants = require("./EventConstants");
var EventPropagators = require("./EventPropagators");
var SyntheticMouseEvent = require("./SyntheticMouseEvent");

var ReactMount = require("./ReactMount");
var keyOf = require("./keyOf");

var topLevelTypes = EventConstants.topLevelTypes;
var getFirstReactDOM = ReactMount.getFirstReactDOM;

var eventTypes = {
  mouseEnter: {
    registrationName: keyOf({onMouseEnter: null}),
    dependencies: [
      topLevelTypes.topMouseOut,
      topLevelTypes.topMouseOver
    ]
  },
  mouseLeave: {
    registrationName: keyOf({onMouseLeave: null}),
    dependencies: [
      topLevelTypes.topMouseOut,
      topLevelTypes.topMouseOver
    ]
  }
};

var extractedEvents = [null, null];

var EnterLeaveEventPlugin = {

  eventTypes: eventTypes,

  /**
   * For almost every interaction we care about, there will be both a top-level
   * `mouseover` and `mouseout` event that occurs. Only use `mouseout` so that
   * we do not extract duplicate events. However, moving the mouse into the
   * browser from outside will not fire a `mouseout` event. In this case, we use
   * the `mouseover` top-level event.
   *
   * @param {string} topLevelType Record from `EventConstants`.
   * @param {DOMEventTarget} topLevelTarget The listening component root node.
   * @param {string} topLevelTargetID ID of `topLevelTarget`.
   * @param {object} nativeEvent Native browser event.
   * @return {*} An accumulation of synthetic events.
   * @see {EventPluginHub.extractEvents}
   */
  extractEvents: function(
      topLevelType,
      topLevelTarget,
      topLevelTargetID,
      nativeEvent) {
    if (topLevelType === topLevelTypes.topMouseOver &&
        (nativeEvent.relatedTarget || nativeEvent.fromElement)) {
      return null;
    }
    if (topLevelType !== topLevelTypes.topMouseOut &&
        topLevelType !== topLevelTypes.topMouseOver) {
      // Must not be a mouse in or mouse out - ignoring.
      return null;
    }

    var win;
    if (topLevelTarget.window === topLevelTarget) {
      // `topLevelTarget` is probably a window object.
      win = topLevelTarget;
    } else {
      // TODO: Figure out why `ownerDocument` is sometimes undefined in IE8.
      var doc = topLevelTarget.ownerDocument;
      if (doc) {
        win = doc.defaultView || doc.parentWindow;
      } else {
        win = window;
      }
    }

    var from, to;
    if (topLevelType === topLevelTypes.topMouseOut) {
      from = topLevelTarget;
      to =
        getFirstReactDOM(nativeEvent.relatedTarget || nativeEvent.toElement) ||
        win;
    } else {
      from = win;
      to = topLevelTarget;
    }

    if (from === to) {
      // Nothing pertains to our managed components.
      return null;
    }

    var fromID = from ? ReactMount.getID(from) : '';
    var toID = to ? ReactMount.getID(to) : '';

    var leave = SyntheticMouseEvent.getPooled(
      eventTypes.mouseLeave,
      fromID,
      nativeEvent
    );
    leave.type = 'mouseleave';
    leave.target = from;
    leave.relatedTarget = to;

    var enter = SyntheticMouseEvent.getPooled(
      eventTypes.mouseEnter,
      toID,
      nativeEvent
    );
    enter.type = 'mouseenter';
    enter.target = to;
    enter.relatedTarget = from;

    EventPropagators.accumulateEnterLeaveDispatches(leave, enter, fromID, toID);

    extractedEvents[0] = leave;
    extractedEvents[1] = enter;

    return extractedEvents;
  }

};

module.exports = EnterLeaveEventPlugin;

},{"./EventConstants":25,"./EventPropagators":30,"./ReactMount":81,"./SyntheticMouseEvent":110,"./keyOf":152}],25:[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule EventConstants
 */

'use strict';

var keyMirror = require("./keyMirror");

var PropagationPhases = keyMirror({bubbled: null, captured: null});

/**
 * Types of raw signals from the browser caught at the top level.
 */
var topLevelTypes = keyMirror({
  topBlur: null,
  topChange: null,
  topClick: null,
  topCompositionEnd: null,
  topCompositionStart: null,
  topCompositionUpdate: null,
  topContextMenu: null,
  topCopy: null,
  topCut: null,
  topDoubleClick: null,
  topDrag: null,
  topDragEnd: null,
  topDragEnter: null,
  topDragExit: null,
  topDragLeave: null,
  topDragOver: null,
  topDragStart: null,
  topDrop: null,
  topError: null,
  topFocus: null,
  topInput: null,
  topKeyDown: null,
  topKeyPress: null,
  topKeyUp: null,
  topLoad: null,
  topMouseDown: null,
  topMouseMove: null,
  topMouseOut: null,
  topMouseOver: null,
  topMouseUp: null,
  topPaste: null,
  topReset: null,
  topScroll: null,
  topSelectionChange: null,
  topSubmit: null,
  topTextInput: null,
  topTouchCancel: null,
  topTouchEnd: null,
  topTouchMove: null,
  topTouchStart: null,
  topWheel: null
});

var EventConstants = {
  topLevelTypes: topLevelTypes,
  PropagationPhases: PropagationPhases
};

module.exports = EventConstants;

},{"./keyMirror":151}],26:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2015, Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule EventListener
 * @typechecks
 */

var emptyFunction = require("./emptyFunction");

/**
 * Upstream version of event listener. Does not take into account specific
 * nature of platform.
 */
var EventListener = {
  /**
   * Listen to DOM events during the bubble phase.
   *
   * @param {DOMEventTarget} target DOM element to register listener on.
   * @param {string} eventType Event type, e.g. 'click' or 'mouseover'.
   * @param {function} callback Callback function.
   * @return {object} Object with a `remove` method.
   */
  listen: function(target, eventType, callback) {
    if (target.addEventListener) {
      target.addEventListener(eventType, callback, false);
      return {
        remove: function() {
          target.removeEventListener(eventType, callback, false);
        }
      };
    } else if (target.attachEvent) {
      target.attachEvent('on' + eventType, callback);
      return {
        remove: function() {
          target.detachEvent('on' + eventType, callback);
        }
      };
    }
  },

  /**
   * Listen to DOM events during the capture phase.
   *
   * @param {DOMEventTarget} target DOM element to register listener on.
   * @param {string} eventType Event type, e.g. 'click' or 'mouseover'.
   * @param {function} callback Callback function.
   * @return {object} Object with a `remove` method.
   */
  capture: function(target, eventType, callback) {
    if (!target.addEventListener) {
      if ("production" !== process.env.NODE_ENV) {
        console.error(
          'Attempted to listen to events during the capture phase on a ' +
          'browser that does not support the capture phase. Your application ' +
          'will not receive some events.'
        );
      }
      return {
        remove: emptyFunction
      };
    } else {
      target.addEventListener(eventType, callback, true);
      return {
        remove: function() {
          target.removeEventListener(eventType, callback, true);
        }
      };
    }
  },

  registerDefault: function() {}
};

module.exports = EventListener;

}).call(this,require('_process'))
},{"./emptyFunction":125,"_process":4}],27:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule EventPluginHub
 */

'use strict';

var EventPluginRegistry = require("./EventPluginRegistry");
var EventPluginUtils = require("./EventPluginUtils");

var accumulateInto = require("./accumulateInto");
var forEachAccumulated = require("./forEachAccumulated");
var invariant = require("./invariant");

/**
 * Internal store for event listeners
 */
var listenerBank = {};

/**
 * Internal queue of events that have accumulated their dispatches and are
 * waiting to have their dispatches executed.
 */
var eventQueue = null;

/**
 * Dispatches an event and releases it back into the pool, unless persistent.
 *
 * @param {?object} event Synthetic event to be dispatched.
 * @private
 */
var executeDispatchesAndRelease = function(event) {
  if (event) {
    var executeDispatch = EventPluginUtils.executeDispatch;
    // Plugins can provide custom behavior when dispatching events.
    var PluginModule = EventPluginRegistry.getPluginModuleForEvent(event);
    if (PluginModule && PluginModule.executeDispatch) {
      executeDispatch = PluginModule.executeDispatch;
    }
    EventPluginUtils.executeDispatchesInOrder(event, executeDispatch);

    if (!event.isPersistent()) {
      event.constructor.release(event);
    }
  }
};

/**
 * - `InstanceHandle`: [required] Module that performs logical traversals of DOM
 *   hierarchy given ids of the logical DOM elements involved.
 */
var InstanceHandle = null;

function validateInstanceHandle() {
  var valid =
    InstanceHandle &&
    InstanceHandle.traverseTwoPhase &&
    InstanceHandle.traverseEnterLeave;
  ("production" !== process.env.NODE_ENV ? invariant(
    valid,
    'InstanceHandle not injected before use!'
  ) : invariant(valid));
}

/**
 * This is a unified interface for event plugins to be installed and configured.
 *
 * Event plugins can implement the following properties:
 *
 *   `extractEvents` {function(string, DOMEventTarget, string, object): *}
 *     Required. When a top-level event is fired, this method is expected to
 *     extract synthetic events that will in turn be queued and dispatched.
 *
 *   `eventTypes` {object}
 *     Optional, plugins that fire events must publish a mapping of registration
 *     names that are used to register listeners. Values of this mapping must
 *     be objects that contain `registrationName` or `phasedRegistrationNames`.
 *
 *   `executeDispatch` {function(object, function, string)}
 *     Optional, allows plugins to override how an event gets dispatched. By
 *     default, the listener is simply invoked.
 *
 * Each plugin that is injected into `EventsPluginHub` is immediately operable.
 *
 * @public
 */
var EventPluginHub = {

  /**
   * Methods for injecting dependencies.
   */
  injection: {

    /**
     * @param {object} InjectedMount
     * @public
     */
    injectMount: EventPluginUtils.injection.injectMount,

    /**
     * @param {object} InjectedInstanceHandle
     * @public
     */
    injectInstanceHandle: function(InjectedInstanceHandle) {
      InstanceHandle = InjectedInstanceHandle;
      if ("production" !== process.env.NODE_ENV) {
        validateInstanceHandle();
      }
    },

    getInstanceHandle: function() {
      if ("production" !== process.env.NODE_ENV) {
        validateInstanceHandle();
      }
      return InstanceHandle;
    },

    /**
     * @param {array} InjectedEventPluginOrder
     * @public
     */
    injectEventPluginOrder: EventPluginRegistry.injectEventPluginOrder,

    /**
     * @param {object} injectedNamesToPlugins Map from names to plugin modules.
     */
    injectEventPluginsByName: EventPluginRegistry.injectEventPluginsByName

  },

  eventNameDispatchConfigs: EventPluginRegistry.eventNameDispatchConfigs,

  registrationNameModules: EventPluginRegistry.registrationNameModules,

  /**
   * Stores `listener` at `listenerBank[registrationName][id]`. Is idempotent.
   *
   * @param {string} id ID of the DOM element.
   * @param {string} registrationName Name of listener (e.g. `onClick`).
   * @param {?function} listener The callback to store.
   */
  putListener: function(id, registrationName, listener) {
    ("production" !== process.env.NODE_ENV ? invariant(
      !listener || typeof listener === 'function',
      'Expected %s listener to be a function, instead got type %s',
      registrationName, typeof listener
    ) : invariant(!listener || typeof listener === 'function'));

    var bankForRegistrationName =
      listenerBank[registrationName] || (listenerBank[registrationName] = {});
    bankForRegistrationName[id] = listener;
  },

  /**
   * @param {string} id ID of the DOM element.
   * @param {string} registrationName Name of listener (e.g. `onClick`).
   * @return {?function} The stored callback.
   */
  getListener: function(id, registrationName) {
    var bankForRegistrationName = listenerBank[registrationName];
    return bankForRegistrationName && bankForRegistrationName[id];
  },

  /**
   * Deletes a listener from the registration bank.
   *
   * @param {string} id ID of the DOM element.
   * @param {string} registrationName Name of listener (e.g. `onClick`).
   */
  deleteListener: function(id, registrationName) {
    var bankForRegistrationName = listenerBank[registrationName];
    if (bankForRegistrationName) {
      delete bankForRegistrationName[id];
    }
  },

  /**
   * Deletes all listeners for the DOM element with the supplied ID.
   *
   * @param {string} id ID of the DOM element.
   */
  deleteAllListeners: function(id) {
    for (var registrationName in listenerBank) {
      delete listenerBank[registrationName][id];
    }
  },

  /**
   * Allows registered plugins an opportunity to extract events from top-level
   * native browser events.
   *
   * @param {string} topLevelType Record from `EventConstants`.
   * @param {DOMEventTarget} topLevelTarget The listening component root node.
   * @param {string} topLevelTargetID ID of `topLevelTarget`.
   * @param {object} nativeEvent Native browser event.
   * @return {*} An accumulation of synthetic events.
   * @internal
   */
  extractEvents: function(
      topLevelType,
      topLevelTarget,
      topLevelTargetID,
      nativeEvent) {
    var events;
    var plugins = EventPluginRegistry.plugins;
    for (var i = 0, l = plugins.length; i < l; i++) {
      // Not every plugin in the ordering may be loaded at runtime.
      var possiblePlugin = plugins[i];
      if (possiblePlugin) {
        var extractedEvents = possiblePlugin.extractEvents(
          topLevelType,
          topLevelTarget,
          topLevelTargetID,
          nativeEvent
        );
        if (extractedEvents) {
          events = accumulateInto(events, extractedEvents);
        }
      }
    }
    return events;
  },

  /**
   * Enqueues a synthetic event that should be dispatched when
   * `processEventQueue` is invoked.
   *
   * @param {*} events An accumulation of synthetic events.
   * @internal
   */
  enqueueEvents: function(events) {
    if (events) {
      eventQueue = accumulateInto(eventQueue, events);
    }
  },

  /**
   * Dispatches all synthetic events on the event queue.
   *
   * @internal
   */
  processEventQueue: function() {
    // Set `eventQueue` to null before processing it so that we can tell if more
    // events get enqueued while processing.
    var processingEventQueue = eventQueue;
    eventQueue = null;
    forEachAccumulated(processingEventQueue, executeDispatchesAndRelease);
    ("production" !== process.env.NODE_ENV ? invariant(
      !eventQueue,
      'processEventQueue(): Additional events were enqueued while processing ' +
      'an event queue. Support for this has not yet been implemented.'
    ) : invariant(!eventQueue));
  },

  /**
   * These are needed for tests only. Do not use!
   */
  __purge: function() {
    listenerBank = {};
  },

  __getListenerBank: function() {
    return listenerBank;
  }

};

module.exports = EventPluginHub;

}).call(this,require('_process'))
},{"./EventPluginRegistry":28,"./EventPluginUtils":29,"./accumulateInto":116,"./forEachAccumulated":131,"./invariant":146,"_process":4}],28:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule EventPluginRegistry
 * @typechecks static-only
 */

'use strict';

var invariant = require("./invariant");

/**
 * Injectable ordering of event plugins.
 */
var EventPluginOrder = null;

/**
 * Injectable mapping from names to event plugin modules.
 */
var namesToPlugins = {};

/**
 * Recomputes the plugin list using the injected plugins and plugin ordering.
 *
 * @private
 */
function recomputePluginOrdering() {
  if (!EventPluginOrder) {
    // Wait until an `EventPluginOrder` is injected.
    return;
  }
  for (var pluginName in namesToPlugins) {
    var PluginModule = namesToPlugins[pluginName];
    var pluginIndex = EventPluginOrder.indexOf(pluginName);
    ("production" !== process.env.NODE_ENV ? invariant(
      pluginIndex > -1,
      'EventPluginRegistry: Cannot inject event plugins that do not exist in ' +
      'the plugin ordering, `%s`.',
      pluginName
    ) : invariant(pluginIndex > -1));
    if (EventPluginRegistry.plugins[pluginIndex]) {
      continue;
    }
    ("production" !== process.env.NODE_ENV ? invariant(
      PluginModule.extractEvents,
      'EventPluginRegistry: Event plugins must implement an `extractEvents` ' +
      'method, but `%s` does not.',
      pluginName
    ) : invariant(PluginModule.extractEvents));
    EventPluginRegistry.plugins[pluginIndex] = PluginModule;
    var publishedEvents = PluginModule.eventTypes;
    for (var eventName in publishedEvents) {
      ("production" !== process.env.NODE_ENV ? invariant(
        publishEventForPlugin(
          publishedEvents[eventName],
          PluginModule,
          eventName
        ),
        'EventPluginRegistry: Failed to publish event `%s` for plugin `%s`.',
        eventName,
        pluginName
      ) : invariant(publishEventForPlugin(
        publishedEvents[eventName],
        PluginModule,
        eventName
      )));
    }
  }
}

/**
 * Publishes an event so that it can be dispatched by the supplied plugin.
 *
 * @param {object} dispatchConfig Dispatch configuration for the event.
 * @param {object} PluginModule Plugin publishing the event.
 * @return {boolean} True if the event was successfully published.
 * @private
 */
function publishEventForPlugin(dispatchConfig, PluginModule, eventName) {
  ("production" !== process.env.NODE_ENV ? invariant(
    !EventPluginRegistry.eventNameDispatchConfigs.hasOwnProperty(eventName),
    'EventPluginHub: More than one plugin attempted to publish the same ' +
    'event name, `%s`.',
    eventName
  ) : invariant(!EventPluginRegistry.eventNameDispatchConfigs.hasOwnProperty(eventName)));
  EventPluginRegistry.eventNameDispatchConfigs[eventName] = dispatchConfig;

  var phasedRegistrationNames = dispatchConfig.phasedRegistrationNames;
  if (phasedRegistrationNames) {
    for (var phaseName in phasedRegistrationNames) {
      if (phasedRegistrationNames.hasOwnProperty(phaseName)) {
        var phasedRegistrationName = phasedRegistrationNames[phaseName];
        publishRegistrationName(
          phasedRegistrationName,
          PluginModule,
          eventName
        );
      }
    }
    return true;
  } else if (dispatchConfig.registrationName) {
    publishRegistrationName(
      dispatchConfig.registrationName,
      PluginModule,
      eventName
    );
    return true;
  }
  return false;
}

/**
 * Publishes a registration name that is used to identify dispatched events and
 * can be used with `EventPluginHub.putListener` to register listeners.
 *
 * @param {string} registrationName Registration name to add.
 * @param {object} PluginModule Plugin publishing the event.
 * @private
 */
function publishRegistrationName(registrationName, PluginModule, eventName) {
  ("production" !== process.env.NODE_ENV ? invariant(
    !EventPluginRegistry.registrationNameModules[registrationName],
    'EventPluginHub: More than one plugin attempted to publish the same ' +
    'registration name, `%s`.',
    registrationName
  ) : invariant(!EventPluginRegistry.registrationNameModules[registrationName]));
  EventPluginRegistry.registrationNameModules[registrationName] = PluginModule;
  EventPluginRegistry.registrationNameDependencies[registrationName] =
    PluginModule.eventTypes[eventName].dependencies;
}

/**
 * Registers plugins so that they can extract and dispatch events.
 *
 * @see {EventPluginHub}
 */
var EventPluginRegistry = {

  /**
   * Ordered list of injected plugins.
   */
  plugins: [],

  /**
   * Mapping from event name to dispatch config
   */
  eventNameDispatchConfigs: {},

  /**
   * Mapping from registration name to plugin module
   */
  registrationNameModules: {},

  /**
   * Mapping from registration name to event name
   */
  registrationNameDependencies: {},

  /**
   * Injects an ordering of plugins (by plugin name). This allows the ordering
   * to be decoupled from injection of the actual plugins so that ordering is
   * always deterministic regardless of packaging, on-the-fly injection, etc.
   *
   * @param {array} InjectedEventPluginOrder
   * @internal
   * @see {EventPluginHub.injection.injectEventPluginOrder}
   */
  injectEventPluginOrder: function(InjectedEventPluginOrder) {
    ("production" !== process.env.NODE_ENV ? invariant(
      !EventPluginOrder,
      'EventPluginRegistry: Cannot inject event plugin ordering more than ' +
      'once. You are likely trying to load more than one copy of React.'
    ) : invariant(!EventPluginOrder));
    // Clone the ordering so it cannot be dynamically mutated.
    EventPluginOrder = Array.prototype.slice.call(InjectedEventPluginOrder);
    recomputePluginOrdering();
  },

  /**
   * Injects plugins to be used by `EventPluginHub`. The plugin names must be
   * in the ordering injected by `injectEventPluginOrder`.
   *
   * Plugins can be injected as part of page initialization or on-the-fly.
   *
   * @param {object} injectedNamesToPlugins Map from names to plugin modules.
   * @internal
   * @see {EventPluginHub.injection.injectEventPluginsByName}
   */
  injectEventPluginsByName: function(injectedNamesToPlugins) {
    var isOrderingDirty = false;
    for (var pluginName in injectedNamesToPlugins) {
      if (!injectedNamesToPlugins.hasOwnProperty(pluginName)) {
        continue;
      }
      var PluginModule = injectedNamesToPlugins[pluginName];
      if (!namesToPlugins.hasOwnProperty(pluginName) ||
          namesToPlugins[pluginName] !== PluginModule) {
        ("production" !== process.env.NODE_ENV ? invariant(
          !namesToPlugins[pluginName],
          'EventPluginRegistry: Cannot inject two different event plugins ' +
          'using the same name, `%s`.',
          pluginName
        ) : invariant(!namesToPlugins[pluginName]));
        namesToPlugins[pluginName] = PluginModule;
        isOrderingDirty = true;
      }
    }
    if (isOrderingDirty) {
      recomputePluginOrdering();
    }
  },

  /**
   * Looks up the plugin for the supplied event.
   *
   * @param {object} event A synthetic event.
   * @return {?object} The plugin that created the supplied event.
   * @internal
   */
  getPluginModuleForEvent: function(event) {
    var dispatchConfig = event.dispatchConfig;
    if (dispatchConfig.registrationName) {
      return EventPluginRegistry.registrationNameModules[
        dispatchConfig.registrationName
      ] || null;
    }
    for (var phase in dispatchConfig.phasedRegistrationNames) {
      if (!dispatchConfig.phasedRegistrationNames.hasOwnProperty(phase)) {
        continue;
      }
      var PluginModule = EventPluginRegistry.registrationNameModules[
        dispatchConfig.phasedRegistrationNames[phase]
      ];
      if (PluginModule) {
        return PluginModule;
      }
    }
    return null;
  },

  /**
   * Exposed for unit testing.
   * @private
   */
  _resetEventPlugins: function() {
    EventPluginOrder = null;
    for (var pluginName in namesToPlugins) {
      if (namesToPlugins.hasOwnProperty(pluginName)) {
        delete namesToPlugins[pluginName];
      }
    }
    EventPluginRegistry.plugins.length = 0;

    var eventNameDispatchConfigs = EventPluginRegistry.eventNameDispatchConfigs;
    for (var eventName in eventNameDispatchConfigs) {
      if (eventNameDispatchConfigs.hasOwnProperty(eventName)) {
        delete eventNameDispatchConfigs[eventName];
      }
    }

    var registrationNameModules = EventPluginRegistry.registrationNameModules;
    for (var registrationName in registrationNameModules) {
      if (registrationNameModules.hasOwnProperty(registrationName)) {
        delete registrationNameModules[registrationName];
      }
    }
  }

};

module.exports = EventPluginRegistry;

}).call(this,require('_process'))
},{"./invariant":146,"_process":4}],29:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule EventPluginUtils
 */

'use strict';

var EventConstants = require("./EventConstants");

var invariant = require("./invariant");

/**
 * Injected dependencies:
 */

/**
 * - `Mount`: [required] Module that can convert between React dom IDs and
 *   actual node references.
 */
var injection = {
  Mount: null,
  injectMount: function(InjectedMount) {
    injection.Mount = InjectedMount;
    if ("production" !== process.env.NODE_ENV) {
      ("production" !== process.env.NODE_ENV ? invariant(
        InjectedMount && InjectedMount.getNode,
        'EventPluginUtils.injection.injectMount(...): Injected Mount module ' +
        'is missing getNode.'
      ) : invariant(InjectedMount && InjectedMount.getNode));
    }
  }
};

var topLevelTypes = EventConstants.topLevelTypes;

function isEndish(topLevelType) {
  return topLevelType === topLevelTypes.topMouseUp ||
         topLevelType === topLevelTypes.topTouchEnd ||
         topLevelType === topLevelTypes.topTouchCancel;
}

function isMoveish(topLevelType) {
  return topLevelType === topLevelTypes.topMouseMove ||
         topLevelType === topLevelTypes.topTouchMove;
}
function isStartish(topLevelType) {
  return topLevelType === topLevelTypes.topMouseDown ||
         topLevelType === topLevelTypes.topTouchStart;
}


var validateEventDispatches;
if ("production" !== process.env.NODE_ENV) {
  validateEventDispatches = function(event) {
    var dispatchListeners = event._dispatchListeners;
    var dispatchIDs = event._dispatchIDs;

    var listenersIsArr = Array.isArray(dispatchListeners);
    var idsIsArr = Array.isArray(dispatchIDs);
    var IDsLen = idsIsArr ? dispatchIDs.length : dispatchIDs ? 1 : 0;
    var listenersLen = listenersIsArr ?
      dispatchListeners.length :
      dispatchListeners ? 1 : 0;

    ("production" !== process.env.NODE_ENV ? invariant(
      idsIsArr === listenersIsArr && IDsLen === listenersLen,
      'EventPluginUtils: Invalid `event`.'
    ) : invariant(idsIsArr === listenersIsArr && IDsLen === listenersLen));
  };
}

/**
 * Invokes `cb(event, listener, id)`. Avoids using call if no scope is
 * provided. The `(listener,id)` pair effectively forms the "dispatch" but are
 * kept separate to conserve memory.
 */
function forEachEventDispatch(event, cb) {
  var dispatchListeners = event._dispatchListeners;
  var dispatchIDs = event._dispatchIDs;
  if ("production" !== process.env.NODE_ENV) {
    validateEventDispatches(event);
  }
  if (Array.isArray(dispatchListeners)) {
    for (var i = 0; i < dispatchListeners.length; i++) {
      if (event.isPropagationStopped()) {
        break;
      }
      // Listeners and IDs are two parallel arrays that are always in sync.
      cb(event, dispatchListeners[i], dispatchIDs[i]);
    }
  } else if (dispatchListeners) {
    cb(event, dispatchListeners, dispatchIDs);
  }
}

/**
 * Default implementation of PluginModule.executeDispatch().
 * @param {SyntheticEvent} SyntheticEvent to handle
 * @param {function} Application-level callback
 * @param {string} domID DOM id to pass to the callback.
 */
function executeDispatch(event, listener, domID) {
  event.currentTarget = injection.Mount.getNode(domID);
  var returnValue = listener(event, domID);
  event.currentTarget = null;
  return returnValue;
}

/**
 * Standard/simple iteration through an event's collected dispatches.
 */
function executeDispatchesInOrder(event, cb) {
  forEachEventDispatch(event, cb);
  event._dispatchListeners = null;
  event._dispatchIDs = null;
}

/**
 * Standard/simple iteration through an event's collected dispatches, but stops
 * at the first dispatch execution returning true, and returns that id.
 *
 * @return id of the first dispatch execution who's listener returns true, or
 * null if no listener returned true.
 */
function executeDispatchesInOrderStopAtTrueImpl(event) {
  var dispatchListeners = event._dispatchListeners;
  var dispatchIDs = event._dispatchIDs;
  if ("production" !== process.env.NODE_ENV) {
    validateEventDispatches(event);
  }
  if (Array.isArray(dispatchListeners)) {
    for (var i = 0; i < dispatchListeners.length; i++) {
      if (event.isPropagationStopped()) {
        break;
      }
      // Listeners and IDs are two parallel arrays that are always in sync.
      if (dispatchListeners[i](event, dispatchIDs[i])) {
        return dispatchIDs[i];
      }
    }
  } else if (dispatchListeners) {
    if (dispatchListeners(event, dispatchIDs)) {
      return dispatchIDs;
    }
  }
  return null;
}

/**
 * @see executeDispatchesInOrderStopAtTrueImpl
 */
function executeDispatchesInOrderStopAtTrue(event) {
  var ret = executeDispatchesInOrderStopAtTrueImpl(event);
  event._dispatchIDs = null;
  event._dispatchListeners = null;
  return ret;
}

/**
 * Execution of a "direct" dispatch - there must be at most one dispatch
 * accumulated on the event or it is considered an error. It doesn't really make
 * sense for an event with multiple dispatches (bubbled) to keep track of the
 * return values at each dispatch execution, but it does tend to make sense when
 * dealing with "direct" dispatches.
 *
 * @return The return value of executing the single dispatch.
 */
function executeDirectDispatch(event) {
  if ("production" !== process.env.NODE_ENV) {
    validateEventDispatches(event);
  }
  var dispatchListener = event._dispatchListeners;
  var dispatchID = event._dispatchIDs;
  ("production" !== process.env.NODE_ENV ? invariant(
    !Array.isArray(dispatchListener),
    'executeDirectDispatch(...): Invalid `event`.'
  ) : invariant(!Array.isArray(dispatchListener)));
  var res = dispatchListener ?
    dispatchListener(event, dispatchID) :
    null;
  event._dispatchListeners = null;
  event._dispatchIDs = null;
  return res;
}

/**
 * @param {SyntheticEvent} event
 * @return {bool} True iff number of dispatches accumulated is greater than 0.
 */
function hasDispatches(event) {
  return !!event._dispatchListeners;
}

/**
 * General utilities that are useful in creating custom Event Plugins.
 */
var EventPluginUtils = {
  isEndish: isEndish,
  isMoveish: isMoveish,
  isStartish: isStartish,

  executeDirectDispatch: executeDirectDispatch,
  executeDispatch: executeDispatch,
  executeDispatchesInOrder: executeDispatchesInOrder,
  executeDispatchesInOrderStopAtTrue: executeDispatchesInOrderStopAtTrue,
  hasDispatches: hasDispatches,
  injection: injection,
  useTouchEvents: false
};

module.exports = EventPluginUtils;

}).call(this,require('_process'))
},{"./EventConstants":25,"./invariant":146,"_process":4}],30:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule EventPropagators
 */

'use strict';

var EventConstants = require("./EventConstants");
var EventPluginHub = require("./EventPluginHub");

var accumulateInto = require("./accumulateInto");
var forEachAccumulated = require("./forEachAccumulated");

var PropagationPhases = EventConstants.PropagationPhases;
var getListener = EventPluginHub.getListener;

/**
 * Some event types have a notion of different registration names for different
 * "phases" of propagation. This finds listeners by a given phase.
 */
function listenerAtPhase(id, event, propagationPhase) {
  var registrationName =
    event.dispatchConfig.phasedRegistrationNames[propagationPhase];
  return getListener(id, registrationName);
}

/**
 * Tags a `SyntheticEvent` with dispatched listeners. Creating this function
 * here, allows us to not have to bind or create functions for each event.
 * Mutating the event's members allows us to not have to create a wrapping
 * "dispatch" object that pairs the event with the listener.
 */
function accumulateDirectionalDispatches(domID, upwards, event) {
  if ("production" !== process.env.NODE_ENV) {
    if (!domID) {
      throw new Error('Dispatching id must not be null');
    }
  }
  var phase = upwards ? PropagationPhases.bubbled : PropagationPhases.captured;
  var listener = listenerAtPhase(domID, event, phase);
  if (listener) {
    event._dispatchListeners =
      accumulateInto(event._dispatchListeners, listener);
    event._dispatchIDs = accumulateInto(event._dispatchIDs, domID);
  }
}

/**
 * Collect dispatches (must be entirely collected before dispatching - see unit
 * tests). Lazily allocate the array to conserve memory.  We must loop through
 * each event and perform the traversal for each one. We can not perform a
 * single traversal for the entire collection of events because each event may
 * have a different target.
 */
function accumulateTwoPhaseDispatchesSingle(event) {
  if (event && event.dispatchConfig.phasedRegistrationNames) {
    EventPluginHub.injection.getInstanceHandle().traverseTwoPhase(
      event.dispatchMarker,
      accumulateDirectionalDispatches,
      event
    );
  }
}


/**
 * Accumulates without regard to direction, does not look for phased
 * registration names. Same as `accumulateDirectDispatchesSingle` but without
 * requiring that the `dispatchMarker` be the same as the dispatched ID.
 */
function accumulateDispatches(id, ignoredDirection, event) {
  if (event && event.dispatchConfig.registrationName) {
    var registrationName = event.dispatchConfig.registrationName;
    var listener = getListener(id, registrationName);
    if (listener) {
      event._dispatchListeners =
        accumulateInto(event._dispatchListeners, listener);
      event._dispatchIDs = accumulateInto(event._dispatchIDs, id);
    }
  }
}

/**
 * Accumulates dispatches on an `SyntheticEvent`, but only for the
 * `dispatchMarker`.
 * @param {SyntheticEvent} event
 */
function accumulateDirectDispatchesSingle(event) {
  if (event && event.dispatchConfig.registrationName) {
    accumulateDispatches(event.dispatchMarker, null, event);
  }
}

function accumulateTwoPhaseDispatches(events) {
  forEachAccumulated(events, accumulateTwoPhaseDispatchesSingle);
}

function accumulateEnterLeaveDispatches(leave, enter, fromID, toID) {
  EventPluginHub.injection.getInstanceHandle().traverseEnterLeave(
    fromID,
    toID,
    accumulateDispatches,
    leave,
    enter
  );
}


function accumulateDirectDispatches(events) {
  forEachAccumulated(events, accumulateDirectDispatchesSingle);
}



/**
 * A small set of propagation patterns, each of which will accept a small amount
 * of information, and generate a set of "dispatch ready event objects" - which
 * are sets of events that have already been annotated with a set of dispatched
 * listener functions/ids. The API is designed this way to discourage these
 * propagation strategies from actually executing the dispatches, since we
 * always want to collect the entire set of dispatches before executing event a
 * single one.
 *
 * @constructor EventPropagators
 */
var EventPropagators = {
  accumulateTwoPhaseDispatches: accumulateTwoPhaseDispatches,
  accumulateDirectDispatches: accumulateDirectDispatches,
  accumulateEnterLeaveDispatches: accumulateEnterLeaveDispatches
};

module.exports = EventPropagators;

}).call(this,require('_process'))
},{"./EventConstants":25,"./EventPluginHub":27,"./accumulateInto":116,"./forEachAccumulated":131,"_process":4}],31:[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ExecutionEnvironment
 */

/*jslint evil: true */

"use strict";

var canUseDOM = !!(
  (typeof window !== 'undefined' &&
  window.document && window.document.createElement)
);

/**
 * Simple, lightweight module assisting with the detection and context of
 * Worker. Helps avoid circular dependencies and allows code to reason about
 * whether or not they are in a Worker, even if they never include the main
 * `ReactWorker` dependency.
 */
var ExecutionEnvironment = {

  canUseDOM: canUseDOM,

  canUseWorkers: typeof Worker !== 'undefined',

  canUseEventListeners:
    canUseDOM && !!(window.addEventListener || window.attachEvent),

  canUseViewport: canUseDOM && !!window.screen,

  isInWorker: !canUseDOM // For now, this is true - might change in the future.

};

module.exports = ExecutionEnvironment;

},{}],32:[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule FallbackCompositionState
 * @typechecks static-only
 */

'use strict';

var PooledClass = require("./PooledClass");

var assign = require("./Object.assign");
var getTextContentAccessor = require("./getTextContentAccessor");

/**
 * This helper class stores information about text content of a target node,
 * allowing comparison of content before and after a given event.
 *
 * Identify the node where selection currently begins, then observe
 * both its text content and its current position in the DOM. Since the
 * browser may natively replace the target node during composition, we can
 * use its position to find its replacement.
 *
 * @param {DOMEventTarget} root
 */
function FallbackCompositionState(root) {
  this._root = root;
  this._startText = this.getText();
  this._fallbackText = null;
}

assign(FallbackCompositionState.prototype, {
  /**
   * Get current text of input.
   *
   * @return {string}
   */
  getText: function() {
    if ('value' in this._root) {
      return this._root.value;
    }
    return this._root[getTextContentAccessor()];
  },

  /**
   * Determine the differing substring between the initially stored
   * text content and the current content.
   *
   * @return {string}
   */
  getData: function() {
    if (this._fallbackText) {
      return this._fallbackText;
    }

    var start;
    var startValue = this._startText;
    var startLength = startValue.length;
    var end;
    var endValue = this.getText();
    var endLength = endValue.length;

    for (start = 0; start < startLength; start++) {
      if (startValue[start] !== endValue[start]) {
        break;
      }
    }

    var minEnd = startLength - start;
    for (end = 1; end <= minEnd; end++) {
      if (startValue[startLength - end] !== endValue[endLength - end]) {
        break;
      }
    }

    var sliceTail = end > 1 ? 1 - end : undefined;
    this._fallbackText = endValue.slice(start, sliceTail);
    return this._fallbackText;
  }
});

PooledClass.addPoolingTo(FallbackCompositionState);

module.exports = FallbackCompositionState;

},{"./Object.assign":37,"./PooledClass":38,"./getTextContentAccessor":141}],33:[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule HTMLDOMPropertyConfig
 */

/*jslint bitwise: true*/

'use strict';

var DOMProperty = require("./DOMProperty");
var ExecutionEnvironment = require("./ExecutionEnvironment");

var MUST_USE_ATTRIBUTE = DOMProperty.injection.MUST_USE_ATTRIBUTE;
var MUST_USE_PROPERTY = DOMProperty.injection.MUST_USE_PROPERTY;
var HAS_BOOLEAN_VALUE = DOMProperty.injection.HAS_BOOLEAN_VALUE;
var HAS_SIDE_EFFECTS = DOMProperty.injection.HAS_SIDE_EFFECTS;
var HAS_NUMERIC_VALUE = DOMProperty.injection.HAS_NUMERIC_VALUE;
var HAS_POSITIVE_NUMERIC_VALUE =
  DOMProperty.injection.HAS_POSITIVE_NUMERIC_VALUE;
var HAS_OVERLOADED_BOOLEAN_VALUE =
  DOMProperty.injection.HAS_OVERLOADED_BOOLEAN_VALUE;

var hasSVG;
if (ExecutionEnvironment.canUseDOM) {
  var implementation = document.implementation;
  hasSVG = (
    implementation &&
    implementation.hasFeature &&
    implementation.hasFeature(
      'http://www.w3.org/TR/SVG11/feature#BasicStructure',
      '1.1'
    )
  );
}


var HTMLDOMPropertyConfig = {
  isCustomAttribute: RegExp.prototype.test.bind(
    /^(data|aria)-[a-z_][a-z\d_.\-]*$/
  ),
  Properties: {
    /**
     * Standard Properties
     */
    accept: null,
    acceptCharset: null,
    accessKey: null,
    action: null,
    allowFullScreen: MUST_USE_ATTRIBUTE | HAS_BOOLEAN_VALUE,
    allowTransparency: MUST_USE_ATTRIBUTE,
    alt: null,
    async: HAS_BOOLEAN_VALUE,
    autoComplete: null,
    // autoFocus is polyfilled/normalized by AutoFocusMixin
    // autoFocus: HAS_BOOLEAN_VALUE,
    autoPlay: HAS_BOOLEAN_VALUE,
    cellPadding: null,
    cellSpacing: null,
    charSet: MUST_USE_ATTRIBUTE,
    checked: MUST_USE_PROPERTY | HAS_BOOLEAN_VALUE,
    classID: MUST_USE_ATTRIBUTE,
    // To set className on SVG elements, it's necessary to use .setAttribute;
    // this works on HTML elements too in all browsers except IE8. Conveniently,
    // IE8 doesn't support SVG and so we can simply use the attribute in
    // browsers that support SVG and the property in browsers that don't,
    // regardless of whether the element is HTML or SVG.
    className: hasSVG ? MUST_USE_ATTRIBUTE : MUST_USE_PROPERTY,
    cols: MUST_USE_ATTRIBUTE | HAS_POSITIVE_NUMERIC_VALUE,
    colSpan: null,
    content: null,
    contentEditable: null,
    contextMenu: MUST_USE_ATTRIBUTE,
    controls: MUST_USE_PROPERTY | HAS_BOOLEAN_VALUE,
    coords: null,
    crossOrigin: null,
    data: null, // For `<object />` acts as `src`.
    dateTime: MUST_USE_ATTRIBUTE,
    defer: HAS_BOOLEAN_VALUE,
    dir: null,
    disabled: MUST_USE_ATTRIBUTE | HAS_BOOLEAN_VALUE,
    download: HAS_OVERLOADED_BOOLEAN_VALUE,
    draggable: null,
    encType: null,
    form: MUST_USE_ATTRIBUTE,
    formAction: MUST_USE_ATTRIBUTE,
    formEncType: MUST_USE_ATTRIBUTE,
    formMethod: MUST_USE_ATTRIBUTE,
    formNoValidate: HAS_BOOLEAN_VALUE,
    formTarget: MUST_USE_ATTRIBUTE,
    frameBorder: MUST_USE_ATTRIBUTE,
    headers: null,
    height: MUST_USE_ATTRIBUTE,
    hidden: MUST_USE_ATTRIBUTE | HAS_BOOLEAN_VALUE,
    high: null,
    href: null,
    hrefLang: null,
    htmlFor: null,
    httpEquiv: null,
    icon: null,
    id: MUST_USE_PROPERTY,
    label: null,
    lang: null,
    list: MUST_USE_ATTRIBUTE,
    loop: MUST_USE_PROPERTY | HAS_BOOLEAN_VALUE,
    low: null,
    manifest: MUST_USE_ATTRIBUTE,
    marginHeight: null,
    marginWidth: null,
    max: null,
    maxLength: MUST_USE_ATTRIBUTE,
    media: MUST_USE_ATTRIBUTE,
    mediaGroup: null,
    method: null,
    min: null,
    multiple: MUST_USE_PROPERTY | HAS_BOOLEAN_VALUE,
    muted: MUST_USE_PROPERTY | HAS_BOOLEAN_VALUE,
    name: null,
    noValidate: HAS_BOOLEAN_VALUE,
    open: HAS_BOOLEAN_VALUE,
    optimum: null,
    pattern: null,
    placeholder: null,
    poster: null,
    preload: null,
    radioGroup: null,
    readOnly: MUST_USE_PROPERTY | HAS_BOOLEAN_VALUE,
    rel: null,
    required: HAS_BOOLEAN_VALUE,
    role: MUST_USE_ATTRIBUTE,
    rows: MUST_USE_ATTRIBUTE | HAS_POSITIVE_NUMERIC_VALUE,
    rowSpan: null,
    sandbox: null,
    scope: null,
    scoped: HAS_BOOLEAN_VALUE,
    scrolling: null,
    seamless: MUST_USE_ATTRIBUTE | HAS_BOOLEAN_VALUE,
    selected: MUST_USE_PROPERTY | HAS_BOOLEAN_VALUE,
    shape: null,
    size: MUST_USE_ATTRIBUTE | HAS_POSITIVE_NUMERIC_VALUE,
    sizes: MUST_USE_ATTRIBUTE,
    span: HAS_POSITIVE_NUMERIC_VALUE,
    spellCheck: null,
    src: null,
    srcDoc: MUST_USE_PROPERTY,
    srcSet: MUST_USE_ATTRIBUTE,
    start: HAS_NUMERIC_VALUE,
    step: null,
    style: null,
    tabIndex: null,
    target: null,
    title: null,
    type: null,
    useMap: null,
    value: MUST_USE_PROPERTY | HAS_SIDE_EFFECTS,
    width: MUST_USE_ATTRIBUTE,
    wmode: MUST_USE_ATTRIBUTE,

    /**
     * Non-standard Properties
     */
    // autoCapitalize and autoCorrect are supported in Mobile Safari for
    // keyboard hints.
    autoCapitalize: null,
    autoCorrect: null,
    // itemProp, itemScope, itemType are for
    // Microdata support. See http://schema.org/docs/gs.html
    itemProp: MUST_USE_ATTRIBUTE,
    itemScope: MUST_USE_ATTRIBUTE | HAS_BOOLEAN_VALUE,
    itemType: MUST_USE_ATTRIBUTE,
    // itemID and itemRef are for Microdata support as well but
    // only specified in the the WHATWG spec document. See
    // https://html.spec.whatwg.org/multipage/microdata.html#microdata-dom-api
    itemID: MUST_USE_ATTRIBUTE,
    itemRef: MUST_USE_ATTRIBUTE,
    // property is supported for OpenGraph in meta tags.
    property: null,
    // IE-only attribute that controls focus behavior
    unselectable: MUST_USE_ATTRIBUTE
  },
  DOMAttributeNames: {
    acceptCharset: 'accept-charset',
    className: 'class',
    htmlFor: 'for',
    httpEquiv: 'http-equiv'
  },
  DOMPropertyNames: {
    autoCapitalize: 'autocapitalize',
    autoComplete: 'autocomplete',
    autoCorrect: 'autocorrect',
    autoFocus: 'autofocus',
    autoPlay: 'autoplay',
    // `encoding` is equivalent to `enctype`, IE8 lacks an `enctype` setter.
    // http://www.w3.org/TR/html5/forms.html#dom-fs-encoding
    encType: 'encoding',
    hrefLang: 'hreflang',
    radioGroup: 'radiogroup',
    spellCheck: 'spellcheck',
    srcDoc: 'srcdoc',
    srcSet: 'srcset'
  }
};

module.exports = HTMLDOMPropertyConfig;

},{"./DOMProperty":20,"./ExecutionEnvironment":31}],34:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule LinkedValueUtils
 * @typechecks static-only
 */

'use strict';

var ReactPropTypes = require("./ReactPropTypes");

var invariant = require("./invariant");

var hasReadOnlyValue = {
  'button': true,
  'checkbox': true,
  'image': true,
  'hidden': true,
  'radio': true,
  'reset': true,
  'submit': true
};

function _assertSingleLink(input) {
  ("production" !== process.env.NODE_ENV ? invariant(
    input.props.checkedLink == null || input.props.valueLink == null,
    'Cannot provide a checkedLink and a valueLink. If you want to use ' +
    'checkedLink, you probably don\'t want to use valueLink and vice versa.'
  ) : invariant(input.props.checkedLink == null || input.props.valueLink == null));
}
function _assertValueLink(input) {
  _assertSingleLink(input);
  ("production" !== process.env.NODE_ENV ? invariant(
    input.props.value == null && input.props.onChange == null,
    'Cannot provide a valueLink and a value or onChange event. If you want ' +
    'to use value or onChange, you probably don\'t want to use valueLink.'
  ) : invariant(input.props.value == null && input.props.onChange == null));
}

function _assertCheckedLink(input) {
  _assertSingleLink(input);
  ("production" !== process.env.NODE_ENV ? invariant(
    input.props.checked == null && input.props.onChange == null,
    'Cannot provide a checkedLink and a checked property or onChange event. ' +
    'If you want to use checked or onChange, you probably don\'t want to ' +
    'use checkedLink'
  ) : invariant(input.props.checked == null && input.props.onChange == null));
}

/**
 * @param {SyntheticEvent} e change event to handle
 */
function _handleLinkedValueChange(e) {
  /*jshint validthis:true */
  this.props.valueLink.requestChange(e.target.value);
}

/**
  * @param {SyntheticEvent} e change event to handle
  */
function _handleLinkedCheckChange(e) {
  /*jshint validthis:true */
  this.props.checkedLink.requestChange(e.target.checked);
}

/**
 * Provide a linked `value` attribute for controlled forms. You should not use
 * this outside of the ReactDOM controlled form components.
 */
var LinkedValueUtils = {
  Mixin: {
    propTypes: {
      value: function(props, propName, componentName) {
        if (!props[propName] ||
            hasReadOnlyValue[props.type] ||
            props.onChange ||
            props.readOnly ||
            props.disabled) {
          return null;
        }
        return new Error(
          'You provided a `value` prop to a form field without an ' +
          '`onChange` handler. This will render a read-only field. If ' +
          'the field should be mutable use `defaultValue`. Otherwise, ' +
          'set either `onChange` or `readOnly`.'
        );
      },
      checked: function(props, propName, componentName) {
        if (!props[propName] ||
            props.onChange ||
            props.readOnly ||
            props.disabled) {
          return null;
        }
        return new Error(
          'You provided a `checked` prop to a form field without an ' +
          '`onChange` handler. This will render a read-only field. If ' +
          'the field should be mutable use `defaultChecked`. Otherwise, ' +
          'set either `onChange` or `readOnly`.'
        );
      },
      onChange: ReactPropTypes.func
    }
  },

  /**
   * @param {ReactComponent} input Form component
   * @return {*} current value of the input either from value prop or link.
   */
  getValue: function(input) {
    if (input.props.valueLink) {
      _assertValueLink(input);
      return input.props.valueLink.value;
    }
    return input.props.value;
  },

  /**
   * @param {ReactComponent} input Form component
   * @return {*} current checked status of the input either from checked prop
   *             or link.
   */
  getChecked: function(input) {
    if (input.props.checkedLink) {
      _assertCheckedLink(input);
      return input.props.checkedLink.value;
    }
    return input.props.checked;
  },

  /**
   * @param {ReactComponent} input Form component
   * @return {function} change callback either from onChange prop or link.
   */
  getOnChange: function(input) {
    if (input.props.valueLink) {
      _assertValueLink(input);
      return _handleLinkedValueChange;
    } else if (input.props.checkedLink) {
      _assertCheckedLink(input);
      return _handleLinkedCheckChange;
    }
    return input.props.onChange;
  }
};

module.exports = LinkedValueUtils;

}).call(this,require('_process'))
},{"./ReactPropTypes":89,"./invariant":146,"_process":4}],35:[function(require,module,exports){
(function (process){
/**
 * Copyright 2014-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule LocalEventTrapMixin
 */

'use strict';

var ReactBrowserEventEmitter = require("./ReactBrowserEventEmitter");

var accumulateInto = require("./accumulateInto");
var forEachAccumulated = require("./forEachAccumulated");
var invariant = require("./invariant");

function remove(event) {
  event.remove();
}

var LocalEventTrapMixin = {
  trapBubbledEvent:function(topLevelType, handlerBaseName) {
    ("production" !== process.env.NODE_ENV ? invariant(this.isMounted(), 'Must be mounted to trap events') : invariant(this.isMounted()));
    // If a component renders to null or if another component fatals and causes
    // the state of the tree to be corrupted, `node` here can be null.
    var node = this.getDOMNode();
    ("production" !== process.env.NODE_ENV ? invariant(
      node,
      'LocalEventTrapMixin.trapBubbledEvent(...): Requires node to be rendered.'
    ) : invariant(node));
    var listener = ReactBrowserEventEmitter.trapBubbledEvent(
      topLevelType,
      handlerBaseName,
      node
    );
    this._localEventListeners =
      accumulateInto(this._localEventListeners, listener);
  },

  // trapCapturedEvent would look nearly identical. We don't implement that
  // method because it isn't currently needed.

  componentWillUnmount:function() {
    if (this._localEventListeners) {
      forEachAccumulated(this._localEventListeners, remove);
    }
  }
};

module.exports = LocalEventTrapMixin;

}).call(this,require('_process'))
},{"./ReactBrowserEventEmitter":41,"./accumulateInto":116,"./forEachAccumulated":131,"./invariant":146,"_process":4}],36:[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule MobileSafariClickEventPlugin
 * @typechecks static-only
 */

'use strict';

var EventConstants = require("./EventConstants");

var emptyFunction = require("./emptyFunction");

var topLevelTypes = EventConstants.topLevelTypes;

/**
 * Mobile Safari does not fire properly bubble click events on non-interactive
 * elements, which means delegated click listeners do not fire. The workaround
 * for this bug involves attaching an empty click listener on the target node.
 *
 * This particular plugin works around the bug by attaching an empty click
 * listener on `touchstart` (which does fire on every element).
 */
var MobileSafariClickEventPlugin = {

  eventTypes: null,

  /**
   * @param {string} topLevelType Record from `EventConstants`.
   * @param {DOMEventTarget} topLevelTarget The listening component root node.
   * @param {string} topLevelTargetID ID of `topLevelTarget`.
   * @param {object} nativeEvent Native browser event.
   * @return {*} An accumulation of synthetic events.
   * @see {EventPluginHub.extractEvents}
   */
  extractEvents: function(
      topLevelType,
      topLevelTarget,
      topLevelTargetID,
      nativeEvent) {
    if (topLevelType === topLevelTypes.topTouchStart) {
      var target = nativeEvent.target;
      if (target && !target.onclick) {
        target.onclick = emptyFunction;
      }
    }
  }

};

module.exports = MobileSafariClickEventPlugin;

},{"./EventConstants":25,"./emptyFunction":125}],37:[function(require,module,exports){
/**
 * Copyright 2014-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule Object.assign
 */

// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-object.assign

'use strict';

function assign(target, sources) {
  if (target == null) {
    throw new TypeError('Object.assign target cannot be null or undefined');
  }

  var to = Object(target);
  var hasOwnProperty = Object.prototype.hasOwnProperty;

  for (var nextIndex = 1; nextIndex < arguments.length; nextIndex++) {
    var nextSource = arguments[nextIndex];
    if (nextSource == null) {
      continue;
    }

    var from = Object(nextSource);

    // We don't currently support accessors nor proxies. Therefore this
    // copy cannot throw. If we ever supported this then we must handle
    // exceptions and side-effects. We don't support symbols so they won't
    // be transferred.

    for (var key in from) {
      if (hasOwnProperty.call(from, key)) {
        to[key] = from[key];
      }
    }
  }

  return to;
}

module.exports = assign;

},{}],38:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule PooledClass
 */

'use strict';

var invariant = require("./invariant");

/**
 * Static poolers. Several custom versions for each potential number of
 * arguments. A completely generic pooler is easy to implement, but would
 * require accessing the `arguments` object. In each of these, `this` refers to
 * the Class itself, not an instance. If any others are needed, simply add them
 * here, or in their own files.
 */
var oneArgumentPooler = function(copyFieldsFrom) {
  var Klass = this;
  if (Klass.instancePool.length) {
    var instance = Klass.instancePool.pop();
    Klass.call(instance, copyFieldsFrom);
    return instance;
  } else {
    return new Klass(copyFieldsFrom);
  }
};

var twoArgumentPooler = function(a1, a2) {
  var Klass = this;
  if (Klass.instancePool.length) {
    var instance = Klass.instancePool.pop();
    Klass.call(instance, a1, a2);
    return instance;
  } else {
    return new Klass(a1, a2);
  }
};

var threeArgumentPooler = function(a1, a2, a3) {
  var Klass = this;
  if (Klass.instancePool.length) {
    var instance = Klass.instancePool.pop();
    Klass.call(instance, a1, a2, a3);
    return instance;
  } else {
    return new Klass(a1, a2, a3);
  }
};

var fiveArgumentPooler = function(a1, a2, a3, a4, a5) {
  var Klass = this;
  if (Klass.instancePool.length) {
    var instance = Klass.instancePool.pop();
    Klass.call(instance, a1, a2, a3, a4, a5);
    return instance;
  } else {
    return new Klass(a1, a2, a3, a4, a5);
  }
};

var standardReleaser = function(instance) {
  var Klass = this;
  ("production" !== process.env.NODE_ENV ? invariant(
    instance instanceof Klass,
    'Trying to release an instance into a pool of a different type.'
  ) : invariant(instance instanceof Klass));
  if (instance.destructor) {
    instance.destructor();
  }
  if (Klass.instancePool.length < Klass.poolSize) {
    Klass.instancePool.push(instance);
  }
};

var DEFAULT_POOL_SIZE = 10;
var DEFAULT_POOLER = oneArgumentPooler;

/**
 * Augments `CopyConstructor` to be a poolable class, augmenting only the class
 * itself (statically) not adding any prototypical fields. Any CopyConstructor
 * you give this may have a `poolSize` property, and will look for a
 * prototypical `destructor` on instances (optional).
 *
 * @param {Function} CopyConstructor Constructor that can be used to reset.
 * @param {Function} pooler Customizable pooler.
 */
var addPoolingTo = function(CopyConstructor, pooler) {
  var NewKlass = CopyConstructor;
  NewKlass.instancePool = [];
  NewKlass.getPooled = pooler || DEFAULT_POOLER;
  if (!NewKlass.poolSize) {
    NewKlass.poolSize = DEFAULT_POOL_SIZE;
  }
  NewKlass.release = standardReleaser;
  return NewKlass;
};

var PooledClass = {
  addPoolingTo: addPoolingTo,
  oneArgumentPooler: oneArgumentPooler,
  twoArgumentPooler: twoArgumentPooler,
  threeArgumentPooler: threeArgumentPooler,
  fiveArgumentPooler: fiveArgumentPooler
};

module.exports = PooledClass;

}).call(this,require('_process'))
},{"./invariant":146,"_process":4}],39:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule React
 */

/* globals __REACT_DEVTOOLS_GLOBAL_HOOK__*/

'use strict';

var EventPluginUtils = require("./EventPluginUtils");
var ReactChildren = require("./ReactChildren");
var ReactComponent = require("./ReactComponent");
var ReactClass = require("./ReactClass");
var ReactContext = require("./ReactContext");
var ReactCurrentOwner = require("./ReactCurrentOwner");
var ReactElement = require("./ReactElement");
var ReactElementValidator = require("./ReactElementValidator");
var ReactDOM = require("./ReactDOM");
var ReactDOMTextComponent = require("./ReactDOMTextComponent");
var ReactDefaultInjection = require("./ReactDefaultInjection");
var ReactInstanceHandles = require("./ReactInstanceHandles");
var ReactMount = require("./ReactMount");
var ReactPerf = require("./ReactPerf");
var ReactPropTypes = require("./ReactPropTypes");
var ReactReconciler = require("./ReactReconciler");
var ReactServerRendering = require("./ReactServerRendering");

var assign = require("./Object.assign");
var findDOMNode = require("./findDOMNode");
var onlyChild = require("./onlyChild");

ReactDefaultInjection.inject();

var createElement = ReactElement.createElement;
var createFactory = ReactElement.createFactory;
var cloneElement = ReactElement.cloneElement;

if ("production" !== process.env.NODE_ENV) {
  createElement = ReactElementValidator.createElement;
  createFactory = ReactElementValidator.createFactory;
  cloneElement = ReactElementValidator.cloneElement;
}

var render = ReactPerf.measure('React', 'render', ReactMount.render);

var React = {
  Children: {
    map: ReactChildren.map,
    forEach: ReactChildren.forEach,
    count: ReactChildren.count,
    only: onlyChild
  },
  Component: ReactComponent,
  DOM: ReactDOM,
  PropTypes: ReactPropTypes,
  initializeTouchEvents: function(shouldUseTouch) {
    EventPluginUtils.useTouchEvents = shouldUseTouch;
  },
  createClass: ReactClass.createClass,
  createElement: createElement,
  cloneElement: cloneElement,
  createFactory: createFactory,
  createMixin: function(mixin) {
    // Currently a noop. Will be used to validate and trace mixins.
    return mixin;
  },
  constructAndRenderComponent: ReactMount.constructAndRenderComponent,
  constructAndRenderComponentByID: ReactMount.constructAndRenderComponentByID,
  findDOMNode: findDOMNode,
  render: render,
  renderToString: ReactServerRendering.renderToString,
  renderToStaticMarkup: ReactServerRendering.renderToStaticMarkup,
  unmountComponentAtNode: ReactMount.unmountComponentAtNode,
  isValidElement: ReactElement.isValidElement,
  withContext: ReactContext.withContext,

  // Hook for JSX spread, don't use this for anything else.
  __spread: assign
};

// Inject the runtime into a devtools global hook regardless of browser.
// Allows for debugging when the hook is injected on the page.
if (
  typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ !== 'undefined' &&
  typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.inject === 'function') {
  __REACT_DEVTOOLS_GLOBAL_HOOK__.inject({
    CurrentOwner: ReactCurrentOwner,
    InstanceHandles: ReactInstanceHandles,
    Mount: ReactMount,
    Reconciler: ReactReconciler,
    TextComponent: ReactDOMTextComponent
  });
}

if ("production" !== process.env.NODE_ENV) {
  var ExecutionEnvironment = require("./ExecutionEnvironment");
  if (ExecutionEnvironment.canUseDOM && window.top === window.self) {

    // If we're in Chrome, look for the devtools marker and provide a download
    // link if not installed.
    if (navigator.userAgent.indexOf('Chrome') > -1) {
      if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ === 'undefined') {
        console.debug(
          'Download the React DevTools for a better development experience: ' +
          'http://fb.me/react-devtools'
        );
      }
    }

    var expectedFeatures = [
      // shims
      Array.isArray,
      Array.prototype.every,
      Array.prototype.forEach,
      Array.prototype.indexOf,
      Array.prototype.map,
      Date.now,
      Function.prototype.bind,
      Object.keys,
      String.prototype.split,
      String.prototype.trim,

      // shams
      Object.create,
      Object.freeze
    ];

    for (var i = 0; i < expectedFeatures.length; i++) {
      if (!expectedFeatures[i]) {
        console.error(
          'One or more ES5 shim/shams expected by React are not available: ' +
          'http://fb.me/react-warning-polyfills'
        );
        break;
      }
    }
  }
}

React.version = '0.13.2';

module.exports = React;

}).call(this,require('_process'))
},{"./EventPluginUtils":29,"./ExecutionEnvironment":31,"./Object.assign":37,"./ReactChildren":43,"./ReactClass":44,"./ReactComponent":45,"./ReactContext":49,"./ReactCurrentOwner":50,"./ReactDOM":51,"./ReactDOMTextComponent":62,"./ReactDefaultInjection":65,"./ReactElement":68,"./ReactElementValidator":69,"./ReactInstanceHandles":77,"./ReactMount":81,"./ReactPerf":86,"./ReactPropTypes":89,"./ReactReconciler":92,"./ReactServerRendering":95,"./findDOMNode":128,"./onlyChild":155,"_process":4}],40:[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactBrowserComponentMixin
 */

'use strict';

var findDOMNode = require("./findDOMNode");

var ReactBrowserComponentMixin = {
  /**
   * Returns the DOM node rendered by this component.
   *
   * @return {DOMElement} The root node of this component.
   * @final
   * @protected
   */
  getDOMNode: function() {
    return findDOMNode(this);
  }
};

module.exports = ReactBrowserComponentMixin;

},{"./findDOMNode":128}],41:[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactBrowserEventEmitter
 * @typechecks static-only
 */

'use strict';

var EventConstants = require("./EventConstants");
var EventPluginHub = require("./EventPluginHub");
var EventPluginRegistry = require("./EventPluginRegistry");
var ReactEventEmitterMixin = require("./ReactEventEmitterMixin");
var ViewportMetrics = require("./ViewportMetrics");

var assign = require("./Object.assign");
var isEventSupported = require("./isEventSupported");

/**
 * Summary of `ReactBrowserEventEmitter` event handling:
 *
 *  - Top-level delegation is used to trap most native browser events. This
 *    may only occur in the main thread and is the responsibility of
 *    ReactEventListener, which is injected and can therefore support pluggable
 *    event sources. This is the only work that occurs in the main thread.
 *
 *  - We normalize and de-duplicate events to account for browser quirks. This
 *    may be done in the worker thread.
 *
 *  - Forward these native events (with the associated top-level type used to
 *    trap it) to `EventPluginHub`, which in turn will ask plugins if they want
 *    to extract any synthetic events.
 *
 *  - The `EventPluginHub` will then process each event by annotating them with
 *    "dispatches", a sequence of listeners and IDs that care about that event.
 *
 *  - The `EventPluginHub` then dispatches the events.
 *
 * Overview of React and the event system:
 *
 * +------------+    .
 * |    DOM     |    .
 * +------------+    .
 *       |           .
 *       v           .
 * +------------+    .
 * | ReactEvent |    .
 * |  Listener  |    .
 * +------------+    .                         +-----------+
 *       |           .               +--------+|SimpleEvent|
 *       |           .               |         |Plugin     |
 * +-----|------+    .               v         +-----------+
 * |     |      |    .    +--------------+                    +------------+
 * |     +-----------.--->|EventPluginHub|                    |    Event   |
 * |            |    .    |              |     +-----------+  | Propagators|
 * | ReactEvent |    .    |              |     |TapEvent   |  |------------|
 * |  Emitter   |    .    |              |<---+|Plugin     |  |other plugin|
 * |            |    .    |              |     +-----------+  |  utilities |
 * |     +-----------.--->|              |                    +------------+
 * |     |      |    .    +--------------+
 * +-----|------+    .                ^        +-----------+
 *       |           .                |        |Enter/Leave|
 *       +           .                +-------+|Plugin     |
 * +-------------+   .                         +-----------+
 * | application |   .
 * |-------------|   .
 * |             |   .
 * |             |   .
 * +-------------+   .
 *                   .
 *    React Core     .  General Purpose Event Plugin System
 */

var alreadyListeningTo = {};
var isMonitoringScrollValue = false;
var reactTopListenersCounter = 0;

// For events like 'submit' which don't consistently bubble (which we trap at a
// lower node than `document`), binding at `document` would cause duplicate
// events so we don't include them here
var topEventMapping = {
  topBlur: 'blur',
  topChange: 'change',
  topClick: 'click',
  topCompositionEnd: 'compositionend',
  topCompositionStart: 'compositionstart',
  topCompositionUpdate: 'compositionupdate',
  topContextMenu: 'contextmenu',
  topCopy: 'copy',
  topCut: 'cut',
  topDoubleClick: 'dblclick',
  topDrag: 'drag',
  topDragEnd: 'dragend',
  topDragEnter: 'dragenter',
  topDragExit: 'dragexit',
  topDragLeave: 'dragleave',
  topDragOver: 'dragover',
  topDragStart: 'dragstart',
  topDrop: 'drop',
  topFocus: 'focus',
  topInput: 'input',
  topKeyDown: 'keydown',
  topKeyPress: 'keypress',
  topKeyUp: 'keyup',
  topMouseDown: 'mousedown',
  topMouseMove: 'mousemove',
  topMouseOut: 'mouseout',
  topMouseOver: 'mouseover',
  topMouseUp: 'mouseup',
  topPaste: 'paste',
  topScroll: 'scroll',
  topSelectionChange: 'selectionchange',
  topTextInput: 'textInput',
  topTouchCancel: 'touchcancel',
  topTouchEnd: 'touchend',
  topTouchMove: 'touchmove',
  topTouchStart: 'touchstart',
  topWheel: 'wheel'
};

/**
 * To ensure no conflicts with other potential React instances on the page
 */
var topListenersIDKey = '_reactListenersID' + String(Math.random()).slice(2);

function getListeningForDocument(mountAt) {
  // In IE8, `mountAt` is a host object and doesn't have `hasOwnProperty`
  // directly.
  if (!Object.prototype.hasOwnProperty.call(mountAt, topListenersIDKey)) {
    mountAt[topListenersIDKey] = reactTopListenersCounter++;
    alreadyListeningTo[mountAt[topListenersIDKey]] = {};
  }
  return alreadyListeningTo[mountAt[topListenersIDKey]];
}

/**
 * `ReactBrowserEventEmitter` is used to attach top-level event listeners. For
 * example:
 *
 *   ReactBrowserEventEmitter.putListener('myID', 'onClick', myFunction);
 *
 * This would allocate a "registration" of `('onClick', myFunction)` on 'myID'.
 *
 * @internal
 */
var ReactBrowserEventEmitter = assign({}, ReactEventEmitterMixin, {

  /**
   * Injectable event backend
   */
  ReactEventListener: null,

  injection: {
    /**
     * @param {object} ReactEventListener
     */
    injectReactEventListener: function(ReactEventListener) {
      ReactEventListener.setHandleTopLevel(
        ReactBrowserEventEmitter.handleTopLevel
      );
      ReactBrowserEventEmitter.ReactEventListener = ReactEventListener;
    }
  },

  /**
   * Sets whether or not any created callbacks should be enabled.
   *
   * @param {boolean} enabled True if callbacks should be enabled.
   */
  setEnabled: function(enabled) {
    if (ReactBrowserEventEmitter.ReactEventListener) {
      ReactBrowserEventEmitter.ReactEventListener.setEnabled(enabled);
    }
  },

  /**
   * @return {boolean} True if callbacks are enabled.
   */
  isEnabled: function() {
    return !!(
      (ReactBrowserEventEmitter.ReactEventListener && ReactBrowserEventEmitter.ReactEventListener.isEnabled())
    );
  },

  /**
   * We listen for bubbled touch events on the document object.
   *
   * Firefox v8.01 (and possibly others) exhibited strange behavior when
   * mounting `onmousemove` events at some node that was not the document
   * element. The symptoms were that if your mouse is not moving over something
   * contained within that mount point (for example on the background) the
   * top-level listeners for `onmousemove` won't be called. However, if you
   * register the `mousemove` on the document object, then it will of course
   * catch all `mousemove`s. This along with iOS quirks, justifies restricting
   * top-level listeners to the document object only, at least for these
   * movement types of events and possibly all events.
   *
   * @see http://www.quirksmode.org/blog/archives/2010/09/click_event_del.html
   *
   * Also, `keyup`/`keypress`/`keydown` do not bubble to the window on IE, but
   * they bubble to document.
   *
   * @param {string} registrationName Name of listener (e.g. `onClick`).
   * @param {object} contentDocumentHandle Document which owns the container
   */
  listenTo: function(registrationName, contentDocumentHandle) {
    var mountAt = contentDocumentHandle;
    var isListening = getListeningForDocument(mountAt);
    var dependencies = EventPluginRegistry.
      registrationNameDependencies[registrationName];

    var topLevelTypes = EventConstants.topLevelTypes;
    for (var i = 0, l = dependencies.length; i < l; i++) {
      var dependency = dependencies[i];
      if (!(
            (isListening.hasOwnProperty(dependency) && isListening[dependency])
          )) {
        if (dependency === topLevelTypes.topWheel) {
          if (isEventSupported('wheel')) {
            ReactBrowserEventEmitter.ReactEventListener.trapBubbledEvent(
              topLevelTypes.topWheel,
              'wheel',
              mountAt
            );
          } else if (isEventSupported('mousewheel')) {
            ReactBrowserEventEmitter.ReactEventListener.trapBubbledEvent(
              topLevelTypes.topWheel,
              'mousewheel',
              mountAt
            );
          } else {
            // Firefox needs to capture a different mouse scroll event.
            // @see http://www.quirksmode.org/dom/events/tests/scroll.html
            ReactBrowserEventEmitter.ReactEventListener.trapBubbledEvent(
              topLevelTypes.topWheel,
              'DOMMouseScroll',
              mountAt
            );
          }
        } else if (dependency === topLevelTypes.topScroll) {

          if (isEventSupported('scroll', true)) {
            ReactBrowserEventEmitter.ReactEventListener.trapCapturedEvent(
              topLevelTypes.topScroll,
              'scroll',
              mountAt
            );
          } else {
            ReactBrowserEventEmitter.ReactEventListener.trapBubbledEvent(
              topLevelTypes.topScroll,
              'scroll',
              ReactBrowserEventEmitter.ReactEventListener.WINDOW_HANDLE
            );
          }
        } else if (dependency === topLevelTypes.topFocus ||
            dependency === topLevelTypes.topBlur) {

          if (isEventSupported('focus', true)) {
            ReactBrowserEventEmitter.ReactEventListener.trapCapturedEvent(
              topLevelTypes.topFocus,
              'focus',
              mountAt
            );
            ReactBrowserEventEmitter.ReactEventListener.trapCapturedEvent(
              topLevelTypes.topBlur,
              'blur',
              mountAt
            );
          } else if (isEventSupported('focusin')) {
            // IE has `focusin` and `focusout` events which bubble.
            // @see http://www.quirksmode.org/blog/archives/2008/04/delegating_the.html
            ReactBrowserEventEmitter.ReactEventListener.trapBubbledEvent(
              topLevelTypes.topFocus,
              'focusin',
              mountAt
            );
            ReactBrowserEventEmitter.ReactEventListener.trapBubbledEvent(
              topLevelTypes.topBlur,
              'focusout',
              mountAt
            );
          }

          // to make sure blur and focus event listeners are only attached once
          isListening[topLevelTypes.topBlur] = true;
          isListening[topLevelTypes.topFocus] = true;
        } else if (topEventMapping.hasOwnProperty(dependency)) {
          ReactBrowserEventEmitter.ReactEventListener.trapBubbledEvent(
            dependency,
            topEventMapping[dependency],
            mountAt
          );
        }

        isListening[dependency] = true;
      }
    }
  },

  trapBubbledEvent: function(topLevelType, handlerBaseName, handle) {
    return ReactBrowserEventEmitter.ReactEventListener.trapBubbledEvent(
      topLevelType,
      handlerBaseName,
      handle
    );
  },

  trapCapturedEvent: function(topLevelType, handlerBaseName, handle) {
    return ReactBrowserEventEmitter.ReactEventListener.trapCapturedEvent(
      topLevelType,
      handlerBaseName,
      handle
    );
  },

  /**
   * Listens to window scroll and resize events. We cache scroll values so that
   * application code can access them without triggering reflows.
   *
   * NOTE: Scroll events do not bubble.
   *
   * @see http://www.quirksmode.org/dom/events/scroll.html
   */
  ensureScrollValueMonitoring: function() {
    if (!isMonitoringScrollValue) {
      var refresh = ViewportMetrics.refreshScrollValues;
      ReactBrowserEventEmitter.ReactEventListener.monitorScrollValue(refresh);
      isMonitoringScrollValue = true;
    }
  },

  eventNameDispatchConfigs: EventPluginHub.eventNameDispatchConfigs,

  registrationNameModules: EventPluginHub.registrationNameModules,

  putListener: EventPluginHub.putListener,

  getListener: EventPluginHub.getListener,

  deleteListener: EventPluginHub.deleteListener,

  deleteAllListeners: EventPluginHub.deleteAllListeners

});

module.exports = ReactBrowserEventEmitter;

},{"./EventConstants":25,"./EventPluginHub":27,"./EventPluginRegistry":28,"./Object.assign":37,"./ReactEventEmitterMixin":72,"./ViewportMetrics":115,"./isEventSupported":147}],42:[function(require,module,exports){
/**
 * Copyright 2014-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactChildReconciler
 * @typechecks static-only
 */

'use strict';

var ReactReconciler = require("./ReactReconciler");

var flattenChildren = require("./flattenChildren");
var instantiateReactComponent = require("./instantiateReactComponent");
var shouldUpdateReactComponent = require("./shouldUpdateReactComponent");

/**
 * ReactChildReconciler provides helpers for initializing or updating a set of
 * children. Its output is suitable for passing it onto ReactMultiChild which
 * does diffed reordering and insertion.
 */
var ReactChildReconciler = {

  /**
   * Generates a "mount image" for each of the supplied children. In the case
   * of `ReactDOMComponent`, a mount image is a string of markup.
   *
   * @param {?object} nestedChildNodes Nested child maps.
   * @return {?object} A set of child instances.
   * @internal
   */
  instantiateChildren: function(nestedChildNodes, transaction, context) {
    var children = flattenChildren(nestedChildNodes);
    for (var name in children) {
      if (children.hasOwnProperty(name)) {
        var child = children[name];
        // The rendered children must be turned into instances as they're
        // mounted.
        var childInstance = instantiateReactComponent(child, null);
        children[name] = childInstance;
      }
    }
    return children;
  },

  /**
   * Updates the rendered children and returns a new set of children.
   *
   * @param {?object} prevChildren Previously initialized set of children.
   * @param {?object} nextNestedChildNodes Nested child maps.
   * @param {ReactReconcileTransaction} transaction
   * @param {object} context
   * @return {?object} A new set of child instances.
   * @internal
   */
  updateChildren: function(
    prevChildren,
    nextNestedChildNodes,
    transaction,
    context) {
    // We currently don't have a way to track moves here but if we use iterators
    // instead of for..in we can zip the iterators and check if an item has
    // moved.
    // TODO: If nothing has changed, return the prevChildren object so that we
    // can quickly bailout if nothing has changed.
    var nextChildren = flattenChildren(nextNestedChildNodes);
    if (!nextChildren && !prevChildren) {
      return null;
    }
    var name;
    for (name in nextChildren) {
      if (!nextChildren.hasOwnProperty(name)) {
        continue;
      }
      var prevChild = prevChildren && prevChildren[name];
      var prevElement = prevChild && prevChild._currentElement;
      var nextElement = nextChildren[name];
      if (shouldUpdateReactComponent(prevElement, nextElement)) {
        ReactReconciler.receiveComponent(
          prevChild, nextElement, transaction, context
        );
        nextChildren[name] = prevChild;
      } else {
        if (prevChild) {
          ReactReconciler.unmountComponent(prevChild, name);
        }
        // The child must be instantiated before it's mounted.
        var nextChildInstance = instantiateReactComponent(
          nextElement,
          null
        );
        nextChildren[name] = nextChildInstance;
      }
    }
    // Unmount children that are no longer present.
    for (name in prevChildren) {
      if (prevChildren.hasOwnProperty(name) &&
          !(nextChildren && nextChildren.hasOwnProperty(name))) {
        ReactReconciler.unmountComponent(prevChildren[name]);
      }
    }
    return nextChildren;
  },

  /**
   * Unmounts all rendered children. This should be used to clean up children
   * when this component is unmounted.
   *
   * @param {?object} renderedChildren Previously initialized set of children.
   * @internal
   */
  unmountChildren: function(renderedChildren) {
    for (var name in renderedChildren) {
      var renderedChild = renderedChildren[name];
      ReactReconciler.unmountComponent(renderedChild);
    }
  }

};

module.exports = ReactChildReconciler;

},{"./ReactReconciler":92,"./flattenChildren":129,"./instantiateReactComponent":145,"./shouldUpdateReactComponent":162}],43:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactChildren
 */

'use strict';

var PooledClass = require("./PooledClass");
var ReactFragment = require("./ReactFragment");

var traverseAllChildren = require("./traverseAllChildren");
var warning = require("./warning");

var twoArgumentPooler = PooledClass.twoArgumentPooler;
var threeArgumentPooler = PooledClass.threeArgumentPooler;

/**
 * PooledClass representing the bookkeeping associated with performing a child
 * traversal. Allows avoiding binding callbacks.
 *
 * @constructor ForEachBookKeeping
 * @param {!function} forEachFunction Function to perform traversal with.
 * @param {?*} forEachContext Context to perform context with.
 */
function ForEachBookKeeping(forEachFunction, forEachContext) {
  this.forEachFunction = forEachFunction;
  this.forEachContext = forEachContext;
}
PooledClass.addPoolingTo(ForEachBookKeeping, twoArgumentPooler);

function forEachSingleChild(traverseContext, child, name, i) {
  var forEachBookKeeping = traverseContext;
  forEachBookKeeping.forEachFunction.call(
    forEachBookKeeping.forEachContext, child, i);
}

/**
 * Iterates through children that are typically specified as `props.children`.
 *
 * The provided forEachFunc(child, index) will be called for each
 * leaf child.
 *
 * @param {?*} children Children tree container.
 * @param {function(*, int)} forEachFunc.
 * @param {*} forEachContext Context for forEachContext.
 */
function forEachChildren(children, forEachFunc, forEachContext) {
  if (children == null) {
    return children;
  }

  var traverseContext =
    ForEachBookKeeping.getPooled(forEachFunc, forEachContext);
  traverseAllChildren(children, forEachSingleChild, traverseContext);
  ForEachBookKeeping.release(traverseContext);
}

/**
 * PooledClass representing the bookkeeping associated with performing a child
 * mapping. Allows avoiding binding callbacks.
 *
 * @constructor MapBookKeeping
 * @param {!*} mapResult Object containing the ordered map of results.
 * @param {!function} mapFunction Function to perform mapping with.
 * @param {?*} mapContext Context to perform mapping with.
 */
function MapBookKeeping(mapResult, mapFunction, mapContext) {
  this.mapResult = mapResult;
  this.mapFunction = mapFunction;
  this.mapContext = mapContext;
}
PooledClass.addPoolingTo(MapBookKeeping, threeArgumentPooler);

function mapSingleChildIntoContext(traverseContext, child, name, i) {
  var mapBookKeeping = traverseContext;
  var mapResult = mapBookKeeping.mapResult;

  var keyUnique = !mapResult.hasOwnProperty(name);
  if ("production" !== process.env.NODE_ENV) {
    ("production" !== process.env.NODE_ENV ? warning(
      keyUnique,
      'ReactChildren.map(...): Encountered two children with the same key, ' +
      '`%s`. Child keys must be unique; when two children share a key, only ' +
      'the first child will be used.',
      name
    ) : null);
  }

  if (keyUnique) {
    var mappedChild =
      mapBookKeeping.mapFunction.call(mapBookKeeping.mapContext, child, i);
    mapResult[name] = mappedChild;
  }
}

/**
 * Maps children that are typically specified as `props.children`.
 *
 * The provided mapFunction(child, key, index) will be called for each
 * leaf child.
 *
 * TODO: This may likely break any calls to `ReactChildren.map` that were
 * previously relying on the fact that we guarded against null children.
 *
 * @param {?*} children Children tree container.
 * @param {function(*, int)} mapFunction.
 * @param {*} mapContext Context for mapFunction.
 * @return {object} Object containing the ordered map of results.
 */
function mapChildren(children, func, context) {
  if (children == null) {
    return children;
  }

  var mapResult = {};
  var traverseContext = MapBookKeeping.getPooled(mapResult, func, context);
  traverseAllChildren(children, mapSingleChildIntoContext, traverseContext);
  MapBookKeeping.release(traverseContext);
  return ReactFragment.create(mapResult);
}

function forEachSingleChildDummy(traverseContext, child, name, i) {
  return null;
}

/**
 * Count the number of children that are typically specified as
 * `props.children`.
 *
 * @param {?*} children Children tree container.
 * @return {number} The number of children.
 */
function countChildren(children, context) {
  return traverseAllChildren(children, forEachSingleChildDummy, null);
}

var ReactChildren = {
  forEach: forEachChildren,
  map: mapChildren,
  count: countChildren
};

module.exports = ReactChildren;

}).call(this,require('_process'))
},{"./PooledClass":38,"./ReactFragment":74,"./traverseAllChildren":164,"./warning":165,"_process":4}],44:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactClass
 */

'use strict';

var ReactComponent = require("./ReactComponent");
var ReactCurrentOwner = require("./ReactCurrentOwner");
var ReactElement = require("./ReactElement");
var ReactErrorUtils = require("./ReactErrorUtils");
var ReactInstanceMap = require("./ReactInstanceMap");
var ReactLifeCycle = require("./ReactLifeCycle");
var ReactPropTypeLocations = require("./ReactPropTypeLocations");
var ReactPropTypeLocationNames = require("./ReactPropTypeLocationNames");
var ReactUpdateQueue = require("./ReactUpdateQueue");

var assign = require("./Object.assign");
var invariant = require("./invariant");
var keyMirror = require("./keyMirror");
var keyOf = require("./keyOf");
var warning = require("./warning");

var MIXINS_KEY = keyOf({mixins: null});

/**
 * Policies that describe methods in `ReactClassInterface`.
 */
var SpecPolicy = keyMirror({
  /**
   * These methods may be defined only once by the class specification or mixin.
   */
  DEFINE_ONCE: null,
  /**
   * These methods may be defined by both the class specification and mixins.
   * Subsequent definitions will be chained. These methods must return void.
   */
  DEFINE_MANY: null,
  /**
   * These methods are overriding the base class.
   */
  OVERRIDE_BASE: null,
  /**
   * These methods are similar to DEFINE_MANY, except we assume they return
   * objects. We try to merge the keys of the return values of all the mixed in
   * functions. If there is a key conflict we throw.
   */
  DEFINE_MANY_MERGED: null
});


var injectedMixins = [];

/**
 * Composite components are higher-level components that compose other composite
 * or native components.
 *
 * To create a new type of `ReactClass`, pass a specification of
 * your new class to `React.createClass`. The only requirement of your class
 * specification is that you implement a `render` method.
 *
 *   var MyComponent = React.createClass({
 *     render: function() {
 *       return <div>Hello World</div>;
 *     }
 *   });
 *
 * The class specification supports a specific protocol of methods that have
 * special meaning (e.g. `render`). See `ReactClassInterface` for
 * more the comprehensive protocol. Any other properties and methods in the
 * class specification will available on the prototype.
 *
 * @interface ReactClassInterface
 * @internal
 */
var ReactClassInterface = {

  /**
   * An array of Mixin objects to include when defining your component.
   *
   * @type {array}
   * @optional
   */
  mixins: SpecPolicy.DEFINE_MANY,

  /**
   * An object containing properties and methods that should be defined on
   * the component's constructor instead of its prototype (static methods).
   *
   * @type {object}
   * @optional
   */
  statics: SpecPolicy.DEFINE_MANY,

  /**
   * Definition of prop types for this component.
   *
   * @type {object}
   * @optional
   */
  propTypes: SpecPolicy.DEFINE_MANY,

  /**
   * Definition of context types for this component.
   *
   * @type {object}
   * @optional
   */
  contextTypes: SpecPolicy.DEFINE_MANY,

  /**
   * Definition of context types this component sets for its children.
   *
   * @type {object}
   * @optional
   */
  childContextTypes: SpecPolicy.DEFINE_MANY,

  // ==== Definition methods ====

  /**
   * Invoked when the component is mounted. Values in the mapping will be set on
   * `this.props` if that prop is not specified (i.e. using an `in` check).
   *
   * This method is invoked before `getInitialState` and therefore cannot rely
   * on `this.state` or use `this.setState`.
   *
   * @return {object}
   * @optional
   */
  getDefaultProps: SpecPolicy.DEFINE_MANY_MERGED,

  /**
   * Invoked once before the component is mounted. The return value will be used
   * as the initial value of `this.state`.
   *
   *   getInitialState: function() {
   *     return {
   *       isOn: false,
   *       fooBaz: new BazFoo()
   *     }
   *   }
   *
   * @return {object}
   * @optional
   */
  getInitialState: SpecPolicy.DEFINE_MANY_MERGED,

  /**
   * @return {object}
   * @optional
   */
  getChildContext: SpecPolicy.DEFINE_MANY_MERGED,

  /**
   * Uses props from `this.props` and state from `this.state` to render the
   * structure of the component.
   *
   * No guarantees are made about when or how often this method is invoked, so
   * it must not have side effects.
   *
   *   render: function() {
   *     var name = this.props.name;
   *     return <div>Hello, {name}!</div>;
   *   }
   *
   * @return {ReactComponent}
   * @nosideeffects
   * @required
   */
  render: SpecPolicy.DEFINE_ONCE,



  // ==== Delegate methods ====

  /**
   * Invoked when the component is initially created and about to be mounted.
   * This may have side effects, but any external subscriptions or data created
   * by this method must be cleaned up in `componentWillUnmount`.
   *
   * @optional
   */
  componentWillMount: SpecPolicy.DEFINE_MANY,

  /**
   * Invoked when the component has been mounted and has a DOM representation.
   * However, there is no guarantee that the DOM node is in the document.
   *
   * Use this as an opportunity to operate on the DOM when the component has
   * been mounted (initialized and rendered) for the first time.
   *
   * @param {DOMElement} rootNode DOM element representing the component.
   * @optional
   */
  componentDidMount: SpecPolicy.DEFINE_MANY,

  /**
   * Invoked before the component receives new props.
   *
   * Use this as an opportunity to react to a prop transition by updating the
   * state using `this.setState`. Current props are accessed via `this.props`.
   *
   *   componentWillReceiveProps: function(nextProps, nextContext) {
   *     this.setState({
   *       likesIncreasing: nextProps.likeCount > this.props.likeCount
   *     });
   *   }
   *
   * NOTE: There is no equivalent `componentWillReceiveState`. An incoming prop
   * transition may cause a state change, but the opposite is not true. If you
   * need it, you are probably looking for `componentWillUpdate`.
   *
   * @param {object} nextProps
   * @optional
   */
  componentWillReceiveProps: SpecPolicy.DEFINE_MANY,

  /**
   * Invoked while deciding if the component should be updated as a result of
   * receiving new props, state and/or context.
   *
   * Use this as an opportunity to `return false` when you're certain that the
   * transition to the new props/state/context will not require a component
   * update.
   *
   *   shouldComponentUpdate: function(nextProps, nextState, nextContext) {
   *     return !equal(nextProps, this.props) ||
   *       !equal(nextState, this.state) ||
   *       !equal(nextContext, this.context);
   *   }
   *
   * @param {object} nextProps
   * @param {?object} nextState
   * @param {?object} nextContext
   * @return {boolean} True if the component should update.
   * @optional
   */
  shouldComponentUpdate: SpecPolicy.DEFINE_ONCE,

  /**
   * Invoked when the component is about to update due to a transition from
   * `this.props`, `this.state` and `this.context` to `nextProps`, `nextState`
   * and `nextContext`.
   *
   * Use this as an opportunity to perform preparation before an update occurs.
   *
   * NOTE: You **cannot** use `this.setState()` in this method.
   *
   * @param {object} nextProps
   * @param {?object} nextState
   * @param {?object} nextContext
   * @param {ReactReconcileTransaction} transaction
   * @optional
   */
  componentWillUpdate: SpecPolicy.DEFINE_MANY,

  /**
   * Invoked when the component's DOM representation has been updated.
   *
   * Use this as an opportunity to operate on the DOM when the component has
   * been updated.
   *
   * @param {object} prevProps
   * @param {?object} prevState
   * @param {?object} prevContext
   * @param {DOMElement} rootNode DOM element representing the component.
   * @optional
   */
  componentDidUpdate: SpecPolicy.DEFINE_MANY,

  /**
   * Invoked when the component is about to be removed from its parent and have
   * its DOM representation destroyed.
   *
   * Use this as an opportunity to deallocate any external resources.
   *
   * NOTE: There is no `componentDidUnmount` since your component will have been
   * destroyed by that point.
   *
   * @optional
   */
  componentWillUnmount: SpecPolicy.DEFINE_MANY,



  // ==== Advanced methods ====

  /**
   * Updates the component's currently mounted DOM representation.
   *
   * By default, this implements React's rendering and reconciliation algorithm.
   * Sophisticated clients may wish to override this.
   *
   * @param {ReactReconcileTransaction} transaction
   * @internal
   * @overridable
   */
  updateComponent: SpecPolicy.OVERRIDE_BASE

};

/**
 * Mapping from class specification keys to special processing functions.
 *
 * Although these are declared like instance properties in the specification
 * when defining classes using `React.createClass`, they are actually static
 * and are accessible on the constructor instead of the prototype. Despite
 * being static, they must be defined outside of the "statics" key under
 * which all other static methods are defined.
 */
var RESERVED_SPEC_KEYS = {
  displayName: function(Constructor, displayName) {
    Constructor.displayName = displayName;
  },
  mixins: function(Constructor, mixins) {
    if (mixins) {
      for (var i = 0; i < mixins.length; i++) {
        mixSpecIntoComponent(Constructor, mixins[i]);
      }
    }
  },
  childContextTypes: function(Constructor, childContextTypes) {
    if ("production" !== process.env.NODE_ENV) {
      validateTypeDef(
        Constructor,
        childContextTypes,
        ReactPropTypeLocations.childContext
      );
    }
    Constructor.childContextTypes = assign(
      {},
      Constructor.childContextTypes,
      childContextTypes
    );
  },
  contextTypes: function(Constructor, contextTypes) {
    if ("production" !== process.env.NODE_ENV) {
      validateTypeDef(
        Constructor,
        contextTypes,
        ReactPropTypeLocations.context
      );
    }
    Constructor.contextTypes = assign(
      {},
      Constructor.contextTypes,
      contextTypes
    );
  },
  /**
   * Special case getDefaultProps which should move into statics but requires
   * automatic merging.
   */
  getDefaultProps: function(Constructor, getDefaultProps) {
    if (Constructor.getDefaultProps) {
      Constructor.getDefaultProps = createMergedResultFunction(
        Constructor.getDefaultProps,
        getDefaultProps
      );
    } else {
      Constructor.getDefaultProps = getDefaultProps;
    }
  },
  propTypes: function(Constructor, propTypes) {
    if ("production" !== process.env.NODE_ENV) {
      validateTypeDef(
        Constructor,
        propTypes,
        ReactPropTypeLocations.prop
      );
    }
    Constructor.propTypes = assign(
      {},
      Constructor.propTypes,
      propTypes
    );
  },
  statics: function(Constructor, statics) {
    mixStaticSpecIntoComponent(Constructor, statics);
  }
};

function validateTypeDef(Constructor, typeDef, location) {
  for (var propName in typeDef) {
    if (typeDef.hasOwnProperty(propName)) {
      // use a warning instead of an invariant so components
      // don't show up in prod but not in __DEV__
      ("production" !== process.env.NODE_ENV ? warning(
        typeof typeDef[propName] === 'function',
        '%s: %s type `%s` is invalid; it must be a function, usually from ' +
        'React.PropTypes.',
        Constructor.displayName || 'ReactClass',
        ReactPropTypeLocationNames[location],
        propName
      ) : null);
    }
  }
}

function validateMethodOverride(proto, name) {
  var specPolicy = ReactClassInterface.hasOwnProperty(name) ?
    ReactClassInterface[name] :
    null;

  // Disallow overriding of base class methods unless explicitly allowed.
  if (ReactClassMixin.hasOwnProperty(name)) {
    ("production" !== process.env.NODE_ENV ? invariant(
      specPolicy === SpecPolicy.OVERRIDE_BASE,
      'ReactClassInterface: You are attempting to override ' +
      '`%s` from your class specification. Ensure that your method names ' +
      'do not overlap with React methods.',
      name
    ) : invariant(specPolicy === SpecPolicy.OVERRIDE_BASE));
  }

  // Disallow defining methods more than once unless explicitly allowed.
  if (proto.hasOwnProperty(name)) {
    ("production" !== process.env.NODE_ENV ? invariant(
      specPolicy === SpecPolicy.DEFINE_MANY ||
      specPolicy === SpecPolicy.DEFINE_MANY_MERGED,
      'ReactClassInterface: You are attempting to define ' +
      '`%s` on your component more than once. This conflict may be due ' +
      'to a mixin.',
      name
    ) : invariant(specPolicy === SpecPolicy.DEFINE_MANY ||
    specPolicy === SpecPolicy.DEFINE_MANY_MERGED));
  }
}

/**
 * Mixin helper which handles policy validation and reserved
 * specification keys when building React classses.
 */
function mixSpecIntoComponent(Constructor, spec) {
  if (!spec) {
    return;
  }

  ("production" !== process.env.NODE_ENV ? invariant(
    typeof spec !== 'function',
    'ReactClass: You\'re attempting to ' +
    'use a component class as a mixin. Instead, just use a regular object.'
  ) : invariant(typeof spec !== 'function'));
  ("production" !== process.env.NODE_ENV ? invariant(
    !ReactElement.isValidElement(spec),
    'ReactClass: You\'re attempting to ' +
    'use a component as a mixin. Instead, just use a regular object.'
  ) : invariant(!ReactElement.isValidElement(spec)));

  var proto = Constructor.prototype;

  // By handling mixins before any other properties, we ensure the same
  // chaining order is applied to methods with DEFINE_MANY policy, whether
  // mixins are listed before or after these methods in the spec.
  if (spec.hasOwnProperty(MIXINS_KEY)) {
    RESERVED_SPEC_KEYS.mixins(Constructor, spec.mixins);
  }

  for (var name in spec) {
    if (!spec.hasOwnProperty(name)) {
      continue;
    }

    if (name === MIXINS_KEY) {
      // We have already handled mixins in a special case above
      continue;
    }

    var property = spec[name];
    validateMethodOverride(proto, name);

    if (RESERVED_SPEC_KEYS.hasOwnProperty(name)) {
      RESERVED_SPEC_KEYS[name](Constructor, property);
    } else {
      // Setup methods on prototype:
      // The following member methods should not be automatically bound:
      // 1. Expected ReactClass methods (in the "interface").
      // 2. Overridden methods (that were mixed in).
      var isReactClassMethod =
        ReactClassInterface.hasOwnProperty(name);
      var isAlreadyDefined = proto.hasOwnProperty(name);
      var markedDontBind = property && property.__reactDontBind;
      var isFunction = typeof property === 'function';
      var shouldAutoBind =
        isFunction &&
        !isReactClassMethod &&
        !isAlreadyDefined &&
        !markedDontBind;

      if (shouldAutoBind) {
        if (!proto.__reactAutoBindMap) {
          proto.__reactAutoBindMap = {};
        }
        proto.__reactAutoBindMap[name] = property;
        proto[name] = property;
      } else {
        if (isAlreadyDefined) {
          var specPolicy = ReactClassInterface[name];

          // These cases should already be caught by validateMethodOverride
          ("production" !== process.env.NODE_ENV ? invariant(
            isReactClassMethod && (
              (specPolicy === SpecPolicy.DEFINE_MANY_MERGED || specPolicy === SpecPolicy.DEFINE_MANY)
            ),
            'ReactClass: Unexpected spec policy %s for key %s ' +
            'when mixing in component specs.',
            specPolicy,
            name
          ) : invariant(isReactClassMethod && (
            (specPolicy === SpecPolicy.DEFINE_MANY_MERGED || specPolicy === SpecPolicy.DEFINE_MANY)
          )));

          // For methods which are defined more than once, call the existing
          // methods before calling the new property, merging if appropriate.
          if (specPolicy === SpecPolicy.DEFINE_MANY_MERGED) {
            proto[name] = createMergedResultFunction(proto[name], property);
          } else if (specPolicy === SpecPolicy.DEFINE_MANY) {
            proto[name] = createChainedFunction(proto[name], property);
          }
        } else {
          proto[name] = property;
          if ("production" !== process.env.NODE_ENV) {
            // Add verbose displayName to the function, which helps when looking
            // at profiling tools.
            if (typeof property === 'function' && spec.displayName) {
              proto[name].displayName = spec.displayName + '_' + name;
            }
          }
        }
      }
    }
  }
}

function mixStaticSpecIntoComponent(Constructor, statics) {
  if (!statics) {
    return;
  }
  for (var name in statics) {
    var property = statics[name];
    if (!statics.hasOwnProperty(name)) {
      continue;
    }

    var isReserved = name in RESERVED_SPEC_KEYS;
    ("production" !== process.env.NODE_ENV ? invariant(
      !isReserved,
      'ReactClass: You are attempting to define a reserved ' +
      'property, `%s`, that shouldn\'t be on the "statics" key. Define it ' +
      'as an instance property instead; it will still be accessible on the ' +
      'constructor.',
      name
    ) : invariant(!isReserved));

    var isInherited = name in Constructor;
    ("production" !== process.env.NODE_ENV ? invariant(
      !isInherited,
      'ReactClass: You are attempting to define ' +
      '`%s` on your component more than once. This conflict may be ' +
      'due to a mixin.',
      name
    ) : invariant(!isInherited));
    Constructor[name] = property;
  }
}

/**
 * Merge two objects, but throw if both contain the same key.
 *
 * @param {object} one The first object, which is mutated.
 * @param {object} two The second object
 * @return {object} one after it has been mutated to contain everything in two.
 */
function mergeIntoWithNoDuplicateKeys(one, two) {
  ("production" !== process.env.NODE_ENV ? invariant(
    one && two && typeof one === 'object' && typeof two === 'object',
    'mergeIntoWithNoDuplicateKeys(): Cannot merge non-objects.'
  ) : invariant(one && two && typeof one === 'object' && typeof two === 'object'));

  for (var key in two) {
    if (two.hasOwnProperty(key)) {
      ("production" !== process.env.NODE_ENV ? invariant(
        one[key] === undefined,
        'mergeIntoWithNoDuplicateKeys(): ' +
        'Tried to merge two objects with the same key: `%s`. This conflict ' +
        'may be due to a mixin; in particular, this may be caused by two ' +
        'getInitialState() or getDefaultProps() methods returning objects ' +
        'with clashing keys.',
        key
      ) : invariant(one[key] === undefined));
      one[key] = two[key];
    }
  }
  return one;
}

/**
 * Creates a function that invokes two functions and merges their return values.
 *
 * @param {function} one Function to invoke first.
 * @param {function} two Function to invoke second.
 * @return {function} Function that invokes the two argument functions.
 * @private
 */
function createMergedResultFunction(one, two) {
  return function mergedResult() {
    var a = one.apply(this, arguments);
    var b = two.apply(this, arguments);
    if (a == null) {
      return b;
    } else if (b == null) {
      return a;
    }
    var c = {};
    mergeIntoWithNoDuplicateKeys(c, a);
    mergeIntoWithNoDuplicateKeys(c, b);
    return c;
  };
}

/**
 * Creates a function that invokes two functions and ignores their return vales.
 *
 * @param {function} one Function to invoke first.
 * @param {function} two Function to invoke second.
 * @return {function} Function that invokes the two argument functions.
 * @private
 */
function createChainedFunction(one, two) {
  return function chainedFunction() {
    one.apply(this, arguments);
    two.apply(this, arguments);
  };
}

/**
 * Binds a method to the component.
 *
 * @param {object} component Component whose method is going to be bound.
 * @param {function} method Method to be bound.
 * @return {function} The bound method.
 */
function bindAutoBindMethod(component, method) {
  var boundMethod = method.bind(component);
  if ("production" !== process.env.NODE_ENV) {
    boundMethod.__reactBoundContext = component;
    boundMethod.__reactBoundMethod = method;
    boundMethod.__reactBoundArguments = null;
    var componentName = component.constructor.displayName;
    var _bind = boundMethod.bind;
    /* eslint-disable block-scoped-var, no-undef */
    boundMethod.bind = function(newThis ) {for (var args=[],$__0=1,$__1=arguments.length;$__0<$__1;$__0++) args.push(arguments[$__0]);
      // User is trying to bind() an autobound method; we effectively will
      // ignore the value of "this" that the user is trying to use, so
      // let's warn.
      if (newThis !== component && newThis !== null) {
        ("production" !== process.env.NODE_ENV ? warning(
          false,
          'bind(): React component methods may only be bound to the ' +
          'component instance. See %s',
          componentName
        ) : null);
      } else if (!args.length) {
        ("production" !== process.env.NODE_ENV ? warning(
          false,
          'bind(): You are binding a component method to the component. ' +
          'React does this for you automatically in a high-performance ' +
          'way, so you can safely remove this call. See %s',
          componentName
        ) : null);
        return boundMethod;
      }
      var reboundMethod = _bind.apply(boundMethod, arguments);
      reboundMethod.__reactBoundContext = component;
      reboundMethod.__reactBoundMethod = method;
      reboundMethod.__reactBoundArguments = args;
      return reboundMethod;
      /* eslint-enable */
    };
  }
  return boundMethod;
}

/**
 * Binds all auto-bound methods in a component.
 *
 * @param {object} component Component whose method is going to be bound.
 */
function bindAutoBindMethods(component) {
  for (var autoBindKey in component.__reactAutoBindMap) {
    if (component.__reactAutoBindMap.hasOwnProperty(autoBindKey)) {
      var method = component.__reactAutoBindMap[autoBindKey];
      component[autoBindKey] = bindAutoBindMethod(
        component,
        ReactErrorUtils.guard(
          method,
          component.constructor.displayName + '.' + autoBindKey
        )
      );
    }
  }
}

var typeDeprecationDescriptor = {
  enumerable: false,
  get: function() {
    var displayName = this.displayName || this.name || 'Component';
    ("production" !== process.env.NODE_ENV ? warning(
      false,
      '%s.type is deprecated. Use %s directly to access the class.',
      displayName,
      displayName
    ) : null);
    Object.defineProperty(this, 'type', {
      value: this
    });
    return this;
  }
};

/**
 * Add more to the ReactClass base class. These are all legacy features and
 * therefore not already part of the modern ReactComponent.
 */
var ReactClassMixin = {

  /**
   * TODO: This will be deprecated because state should always keep a consistent
   * type signature and the only use case for this, is to avoid that.
   */
  replaceState: function(newState, callback) {
    ReactUpdateQueue.enqueueReplaceState(this, newState);
    if (callback) {
      ReactUpdateQueue.enqueueCallback(this, callback);
    }
  },

  /**
   * Checks whether or not this composite component is mounted.
   * @return {boolean} True if mounted, false otherwise.
   * @protected
   * @final
   */
  isMounted: function() {
    if ("production" !== process.env.NODE_ENV) {
      var owner = ReactCurrentOwner.current;
      if (owner !== null) {
        ("production" !== process.env.NODE_ENV ? warning(
          owner._warnedAboutRefsInRender,
          '%s is accessing isMounted inside its render() function. ' +
          'render() should be a pure function of props and state. It should ' +
          'never access something that requires stale data from the previous ' +
          'render, such as refs. Move this logic to componentDidMount and ' +
          'componentDidUpdate instead.',
          owner.getName() || 'A component'
        ) : null);
        owner._warnedAboutRefsInRender = true;
      }
    }
    var internalInstance = ReactInstanceMap.get(this);
    return (
      internalInstance &&
      internalInstance !== ReactLifeCycle.currentlyMountingInstance
    );
  },

  /**
   * Sets a subset of the props.
   *
   * @param {object} partialProps Subset of the next props.
   * @param {?function} callback Called after props are updated.
   * @final
   * @public
   * @deprecated
   */
  setProps: function(partialProps, callback) {
    ReactUpdateQueue.enqueueSetProps(this, partialProps);
    if (callback) {
      ReactUpdateQueue.enqueueCallback(this, callback);
    }
  },

  /**
   * Replace all the props.
   *
   * @param {object} newProps Subset of the next props.
   * @param {?function} callback Called after props are updated.
   * @final
   * @public
   * @deprecated
   */
  replaceProps: function(newProps, callback) {
    ReactUpdateQueue.enqueueReplaceProps(this, newProps);
    if (callback) {
      ReactUpdateQueue.enqueueCallback(this, callback);
    }
  }
};

var ReactClassComponent = function() {};
assign(
  ReactClassComponent.prototype,
  ReactComponent.prototype,
  ReactClassMixin
);

/**
 * Module for creating composite components.
 *
 * @class ReactClass
 */
var ReactClass = {

  /**
   * Creates a composite component class given a class specification.
   *
   * @param {object} spec Class specification (which must define `render`).
   * @return {function} Component constructor function.
   * @public
   */
  createClass: function(spec) {
    var Constructor = function(props, context) {
      // This constructor is overridden by mocks. The argument is used
      // by mocks to assert on what gets mounted.

      if ("production" !== process.env.NODE_ENV) {
        ("production" !== process.env.NODE_ENV ? warning(
          this instanceof Constructor,
          'Something is calling a React component directly. Use a factory or ' +
          'JSX instead. See: http://fb.me/react-legacyfactory'
        ) : null);
      }

      // Wire up auto-binding
      if (this.__reactAutoBindMap) {
        bindAutoBindMethods(this);
      }

      this.props = props;
      this.context = context;
      this.state = null;

      // ReactClasses doesn't have constructors. Instead, they use the
      // getInitialState and componentWillMount methods for initialization.

      var initialState = this.getInitialState ? this.getInitialState() : null;
      if ("production" !== process.env.NODE_ENV) {
        // We allow auto-mocks to proceed as if they're returning null.
        if (typeof initialState === 'undefined' &&
            this.getInitialState._isMockFunction) {
          // This is probably bad practice. Consider warning here and
          // deprecating this convenience.
          initialState = null;
        }
      }
      ("production" !== process.env.NODE_ENV ? invariant(
        typeof initialState === 'object' && !Array.isArray(initialState),
        '%s.getInitialState(): must return an object or null',
        Constructor.displayName || 'ReactCompositeComponent'
      ) : invariant(typeof initialState === 'object' && !Array.isArray(initialState)));

      this.state = initialState;
    };
    Constructor.prototype = new ReactClassComponent();
    Constructor.prototype.constructor = Constructor;

    injectedMixins.forEach(
      mixSpecIntoComponent.bind(null, Constructor)
    );

    mixSpecIntoComponent(Constructor, spec);

    // Initialize the defaultProps property after all mixins have been merged
    if (Constructor.getDefaultProps) {
      Constructor.defaultProps = Constructor.getDefaultProps();
    }

    if ("production" !== process.env.NODE_ENV) {
      // This is a tag to indicate that the use of these method names is ok,
      // since it's used with createClass. If it's not, then it's likely a
      // mistake so we'll warn you to use the static property, property
      // initializer or constructor respectively.
      if (Constructor.getDefaultProps) {
        Constructor.getDefaultProps.isReactClassApproved = {};
      }
      if (Constructor.prototype.getInitialState) {
        Constructor.prototype.getInitialState.isReactClassApproved = {};
      }
    }

    ("production" !== process.env.NODE_ENV ? invariant(
      Constructor.prototype.render,
      'createClass(...): Class specification must implement a `render` method.'
    ) : invariant(Constructor.prototype.render));

    if ("production" !== process.env.NODE_ENV) {
      ("production" !== process.env.NODE_ENV ? warning(
        !Constructor.prototype.componentShouldUpdate,
        '%s has a method called ' +
        'componentShouldUpdate(). Did you mean shouldComponentUpdate()? ' +
        'The name is phrased as a question because the function is ' +
        'expected to return a value.',
        spec.displayName || 'A component'
      ) : null);
    }

    // Reduce time spent doing lookups by setting these on the prototype.
    for (var methodName in ReactClassInterface) {
      if (!Constructor.prototype[methodName]) {
        Constructor.prototype[methodName] = null;
      }
    }

    // Legacy hook
    Constructor.type = Constructor;
    if ("production" !== process.env.NODE_ENV) {
      try {
        Object.defineProperty(Constructor, 'type', typeDeprecationDescriptor);
      } catch (x) {
        // IE will fail on defineProperty (es5-shim/sham too)
      }
    }

    return Constructor;
  },

  injection: {
    injectMixin: function(mixin) {
      injectedMixins.push(mixin);
    }
  }

};

module.exports = ReactClass;

}).call(this,require('_process'))
},{"./Object.assign":37,"./ReactComponent":45,"./ReactCurrentOwner":50,"./ReactElement":68,"./ReactErrorUtils":71,"./ReactInstanceMap":78,"./ReactLifeCycle":79,"./ReactPropTypeLocationNames":87,"./ReactPropTypeLocations":88,"./ReactUpdateQueue":97,"./invariant":146,"./keyMirror":151,"./keyOf":152,"./warning":165,"_process":4}],45:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactComponent
 */

'use strict';

var ReactUpdateQueue = require("./ReactUpdateQueue");

var invariant = require("./invariant");
var warning = require("./warning");

/**
 * Base class helpers for the updating state of a component.
 */
function ReactComponent(props, context) {
  this.props = props;
  this.context = context;
}

/**
 * Sets a subset of the state. Always use this to mutate
 * state. You should treat `this.state` as immutable.
 *
 * There is no guarantee that `this.state` will be immediately updated, so
 * accessing `this.state` after calling this method may return the old value.
 *
 * There is no guarantee that calls to `setState` will run synchronously,
 * as they may eventually be batched together.  You can provide an optional
 * callback that will be executed when the call to setState is actually
 * completed.
 *
 * When a function is provided to setState, it will be called at some point in
 * the future (not synchronously). It will be called with the up to date
 * component arguments (state, props, context). These values can be different
 * from this.* because your function may be called after receiveProps but before
 * shouldComponentUpdate, and this new state, props, and context will not yet be
 * assigned to this.
 *
 * @param {object|function} partialState Next partial state or function to
 *        produce next partial state to be merged with current state.
 * @param {?function} callback Called after state is updated.
 * @final
 * @protected
 */
ReactComponent.prototype.setState = function(partialState, callback) {
  ("production" !== process.env.NODE_ENV ? invariant(
    typeof partialState === 'object' ||
    typeof partialState === 'function' ||
    partialState == null,
    'setState(...): takes an object of state variables to update or a ' +
    'function which returns an object of state variables.'
  ) : invariant(typeof partialState === 'object' ||
  typeof partialState === 'function' ||
  partialState == null));
  if ("production" !== process.env.NODE_ENV) {
    ("production" !== process.env.NODE_ENV ? warning(
      partialState != null,
      'setState(...): You passed an undefined or null state object; ' +
      'instead, use forceUpdate().'
    ) : null);
  }
  ReactUpdateQueue.enqueueSetState(this, partialState);
  if (callback) {
    ReactUpdateQueue.enqueueCallback(this, callback);
  }
};

/**
 * Forces an update. This should only be invoked when it is known with
 * certainty that we are **not** in a DOM transaction.
 *
 * You may want to call this when you know that some deeper aspect of the
 * component's state has changed but `setState` was not called.
 *
 * This will not invoke `shouldComponentUpdate`, but it will invoke
 * `componentWillUpdate` and `componentDidUpdate`.
 *
 * @param {?function} callback Called after update is complete.
 * @final
 * @protected
 */
ReactComponent.prototype.forceUpdate = function(callback) {
  ReactUpdateQueue.enqueueForceUpdate(this);
  if (callback) {
    ReactUpdateQueue.enqueueCallback(this, callback);
  }
};

/**
 * Deprecated APIs. These APIs used to exist on classic React classes but since
 * we would like to deprecate them, we're not going to move them over to this
 * modern base class. Instead, we define a getter that warns if it's accessed.
 */
if ("production" !== process.env.NODE_ENV) {
  var deprecatedAPIs = {
    getDOMNode: 'getDOMNode',
    isMounted: 'isMounted',
    replaceProps: 'replaceProps',
    replaceState: 'replaceState',
    setProps: 'setProps'
  };
  var defineDeprecationWarning = function(methodName, displayName) {
    try {
      Object.defineProperty(ReactComponent.prototype, methodName, {
        get: function() {
          ("production" !== process.env.NODE_ENV ? warning(
            false,
            '%s(...) is deprecated in plain JavaScript React classes.',
            displayName
          ) : null);
          return undefined;
        }
      });
    } catch (x) {
      // IE will fail on defineProperty (es5-shim/sham too)
    }
  };
  for (var fnName in deprecatedAPIs) {
    if (deprecatedAPIs.hasOwnProperty(fnName)) {
      defineDeprecationWarning(fnName, deprecatedAPIs[fnName]);
    }
  }
}

module.exports = ReactComponent;

}).call(this,require('_process'))
},{"./ReactUpdateQueue":97,"./invariant":146,"./warning":165,"_process":4}],46:[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactComponentBrowserEnvironment
 */

/*jslint evil: true */

'use strict';

var ReactDOMIDOperations = require("./ReactDOMIDOperations");
var ReactMount = require("./ReactMount");

/**
 * Abstracts away all functionality of the reconciler that requires knowledge of
 * the browser context. TODO: These callers should be refactored to avoid the
 * need for this injection.
 */
var ReactComponentBrowserEnvironment = {

  processChildrenUpdates:
    ReactDOMIDOperations.dangerouslyProcessChildrenUpdates,

  replaceNodeWithMarkupByID:
    ReactDOMIDOperations.dangerouslyReplaceNodeWithMarkupByID,

  /**
   * If a particular environment requires that some resources be cleaned up,
   * specify this in the injected Mixin. In the DOM, we would likely want to
   * purge any cached node ID lookups.
   *
   * @private
   */
  unmountIDFromEnvironment: function(rootNodeID) {
    ReactMount.purgeID(rootNodeID);
  }

};

module.exports = ReactComponentBrowserEnvironment;

},{"./ReactDOMIDOperations":55,"./ReactMount":81}],47:[function(require,module,exports){
(function (process){
/**
 * Copyright 2014-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactComponentEnvironment
 */

'use strict';

var invariant = require("./invariant");

var injected = false;

var ReactComponentEnvironment = {

  /**
   * Optionally injectable environment dependent cleanup hook. (server vs.
   * browser etc). Example: A browser system caches DOM nodes based on component
   * ID and must remove that cache entry when this instance is unmounted.
   */
  unmountIDFromEnvironment: null,

  /**
   * Optionally injectable hook for swapping out mount images in the middle of
   * the tree.
   */
  replaceNodeWithMarkupByID: null,

  /**
   * Optionally injectable hook for processing a queue of child updates. Will
   * later move into MultiChildComponents.
   */
  processChildrenUpdates: null,

  injection: {
    injectEnvironment: function(environment) {
      ("production" !== process.env.NODE_ENV ? invariant(
        !injected,
        'ReactCompositeComponent: injectEnvironment() can only be called once.'
      ) : invariant(!injected));
      ReactComponentEnvironment.unmountIDFromEnvironment =
        environment.unmountIDFromEnvironment;
      ReactComponentEnvironment.replaceNodeWithMarkupByID =
        environment.replaceNodeWithMarkupByID;
      ReactComponentEnvironment.processChildrenUpdates =
        environment.processChildrenUpdates;
      injected = true;
    }
  }

};

module.exports = ReactComponentEnvironment;

}).call(this,require('_process'))
},{"./invariant":146,"_process":4}],48:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactCompositeComponent
 */

'use strict';

var ReactComponentEnvironment = require("./ReactComponentEnvironment");
var ReactContext = require("./ReactContext");
var ReactCurrentOwner = require("./ReactCurrentOwner");
var ReactElement = require("./ReactElement");
var ReactElementValidator = require("./ReactElementValidator");
var ReactInstanceMap = require("./ReactInstanceMap");
var ReactLifeCycle = require("./ReactLifeCycle");
var ReactNativeComponent = require("./ReactNativeComponent");
var ReactPerf = require("./ReactPerf");
var ReactPropTypeLocations = require("./ReactPropTypeLocations");
var ReactPropTypeLocationNames = require("./ReactPropTypeLocationNames");
var ReactReconciler = require("./ReactReconciler");
var ReactUpdates = require("./ReactUpdates");

var assign = require("./Object.assign");
var emptyObject = require("./emptyObject");
var invariant = require("./invariant");
var shouldUpdateReactComponent = require("./shouldUpdateReactComponent");
var warning = require("./warning");

function getDeclarationErrorAddendum(component) {
  var owner = component._currentElement._owner || null;
  if (owner) {
    var name = owner.getName();
    if (name) {
      return ' Check the render method of `' + name + '`.';
    }
  }
  return '';
}

/**
 * ------------------ The Life-Cycle of a Composite Component ------------------
 *
 * - constructor: Initialization of state. The instance is now retained.
 *   - componentWillMount
 *   - render
 *   - [children's constructors]
 *     - [children's componentWillMount and render]
 *     - [children's componentDidMount]
 *     - componentDidMount
 *
 *       Update Phases:
 *       - componentWillReceiveProps (only called if parent updated)
 *       - shouldComponentUpdate
 *         - componentWillUpdate
 *           - render
 *           - [children's constructors or receive props phases]
 *         - componentDidUpdate
 *
 *     - componentWillUnmount
 *     - [children's componentWillUnmount]
 *   - [children destroyed]
 * - (destroyed): The instance is now blank, released by React and ready for GC.
 *
 * -----------------------------------------------------------------------------
 */

/**
 * An incrementing ID assigned to each component when it is mounted. This is
 * used to enforce the order in which `ReactUpdates` updates dirty components.
 *
 * @private
 */
var nextMountID = 1;

/**
 * @lends {ReactCompositeComponent.prototype}
 */
var ReactCompositeComponentMixin = {

  /**
   * Base constructor for all composite component.
   *
   * @param {ReactElement} element
   * @final
   * @internal
   */
  construct: function(element) {
    this._currentElement = element;
    this._rootNodeID = null;
    this._instance = null;

    // See ReactUpdateQueue
    this._pendingElement = null;
    this._pendingStateQueue = null;
    this._pendingReplaceState = false;
    this._pendingForceUpdate = false;

    this._renderedComponent = null;

    this._context = null;
    this._mountOrder = 0;
    this._isTopLevel = false;

    // See ReactUpdates and ReactUpdateQueue.
    this._pendingCallbacks = null;
  },

  /**
   * Initializes the component, renders markup, and registers event listeners.
   *
   * @param {string} rootID DOM ID of the root node.
   * @param {ReactReconcileTransaction|ReactServerRenderingTransaction} transaction
   * @return {?string} Rendered markup to be inserted into the DOM.
   * @final
   * @internal
   */
  mountComponent: function(rootID, transaction, context) {
    this._context = context;
    this._mountOrder = nextMountID++;
    this._rootNodeID = rootID;

    var publicProps = this._processProps(this._currentElement.props);
    var publicContext = this._processContext(this._currentElement._context);

    var Component = ReactNativeComponent.getComponentClassForElement(
      this._currentElement
    );

    // Initialize the public class
    var inst = new Component(publicProps, publicContext);

    if ("production" !== process.env.NODE_ENV) {
      // This will throw later in _renderValidatedComponent, but add an early
      // warning now to help debugging
      ("production" !== process.env.NODE_ENV ? warning(
        inst.render != null,
        '%s(...): No `render` method found on the returned component ' +
        'instance: you may have forgotten to define `render` in your ' +
        'component or you may have accidentally tried to render an element ' +
        'whose type is a function that isn\'t a React component.',
        Component.displayName || Component.name || 'Component'
      ) : null);
    }

    // These should be set up in the constructor, but as a convenience for
    // simpler class abstractions, we set them up after the fact.
    inst.props = publicProps;
    inst.context = publicContext;
    inst.refs = emptyObject;

    this._instance = inst;

    // Store a reference from the instance back to the internal representation
    ReactInstanceMap.set(inst, this);

    if ("production" !== process.env.NODE_ENV) {
      this._warnIfContextsDiffer(this._currentElement._context, context);
    }

    if ("production" !== process.env.NODE_ENV) {
      // Since plain JS classes are defined without any special initialization
      // logic, we can not catch common errors early. Therefore, we have to
      // catch them here, at initialization time, instead.
      ("production" !== process.env.NODE_ENV ? warning(
        !inst.getInitialState ||
        inst.getInitialState.isReactClassApproved,
        'getInitialState was defined on %s, a plain JavaScript class. ' +
        'This is only supported for classes created using React.createClass. ' +
        'Did you mean to define a state property instead?',
        this.getName() || 'a component'
      ) : null);
      ("production" !== process.env.NODE_ENV ? warning(
        !inst.getDefaultProps ||
        inst.getDefaultProps.isReactClassApproved,
        'getDefaultProps was defined on %s, a plain JavaScript class. ' +
        'This is only supported for classes created using React.createClass. ' +
        'Use a static property to define defaultProps instead.',
        this.getName() || 'a component'
      ) : null);
      ("production" !== process.env.NODE_ENV ? warning(
        !inst.propTypes,
        'propTypes was defined as an instance property on %s. Use a static ' +
        'property to define propTypes instead.',
        this.getName() || 'a component'
      ) : null);
      ("production" !== process.env.NODE_ENV ? warning(
        !inst.contextTypes,
        'contextTypes was defined as an instance property on %s. Use a ' +
        'static property to define contextTypes instead.',
        this.getName() || 'a component'
      ) : null);
      ("production" !== process.env.NODE_ENV ? warning(
        typeof inst.componentShouldUpdate !== 'function',
        '%s has a method called ' +
        'componentShouldUpdate(). Did you mean shouldComponentUpdate()? ' +
        'The name is phrased as a question because the function is ' +
        'expected to return a value.',
        (this.getName() || 'A component')
      ) : null);
    }

    var initialState = inst.state;
    if (initialState === undefined) {
      inst.state = initialState = null;
    }
    ("production" !== process.env.NODE_ENV ? invariant(
      typeof initialState === 'object' && !Array.isArray(initialState),
      '%s.state: must be set to an object or null',
      this.getName() || 'ReactCompositeComponent'
    ) : invariant(typeof initialState === 'object' && !Array.isArray(initialState)));

    this._pendingStateQueue = null;
    this._pendingReplaceState = false;
    this._pendingForceUpdate = false;

    var renderedElement;

    var previouslyMounting = ReactLifeCycle.currentlyMountingInstance;
    ReactLifeCycle.currentlyMountingInstance = this;
    try {
      if (inst.componentWillMount) {
        inst.componentWillMount();
        // When mounting, calls to `setState` by `componentWillMount` will set
        // `this._pendingStateQueue` without triggering a re-render.
        if (this._pendingStateQueue) {
          inst.state = this._processPendingState(inst.props, inst.context);
        }
      }

      renderedElement = this._renderValidatedComponent();
    } finally {
      ReactLifeCycle.currentlyMountingInstance = previouslyMounting;
    }

    this._renderedComponent = this._instantiateReactComponent(
      renderedElement,
      this._currentElement.type // The wrapping type
    );

    var markup = ReactReconciler.mountComponent(
      this._renderedComponent,
      rootID,
      transaction,
      this._processChildContext(context)
    );
    if (inst.componentDidMount) {
      transaction.getReactMountReady().enqueue(inst.componentDidMount, inst);
    }

    return markup;
  },

  /**
   * Releases any resources allocated by `mountComponent`.
   *
   * @final
   * @internal
   */
  unmountComponent: function() {
    var inst = this._instance;

    if (inst.componentWillUnmount) {
      var previouslyUnmounting = ReactLifeCycle.currentlyUnmountingInstance;
      ReactLifeCycle.currentlyUnmountingInstance = this;
      try {
        inst.componentWillUnmount();
      } finally {
        ReactLifeCycle.currentlyUnmountingInstance = previouslyUnmounting;
      }
    }

    ReactReconciler.unmountComponent(this._renderedComponent);
    this._renderedComponent = null;

    // Reset pending fields
    this._pendingStateQueue = null;
    this._pendingReplaceState = false;
    this._pendingForceUpdate = false;
    this._pendingCallbacks = null;
    this._pendingElement = null;

    // These fields do not really need to be reset since this object is no
    // longer accessible.
    this._context = null;
    this._rootNodeID = null;

    // Delete the reference from the instance to this internal representation
    // which allow the internals to be properly cleaned up even if the user
    // leaks a reference to the public instance.
    ReactInstanceMap.remove(inst);

    // Some existing components rely on inst.props even after they've been
    // destroyed (in event handlers).
    // TODO: inst.props = null;
    // TODO: inst.state = null;
    // TODO: inst.context = null;
  },

  /**
   * Schedule a partial update to the props. Only used for internal testing.
   *
   * @param {object} partialProps Subset of the next props.
   * @param {?function} callback Called after props are updated.
   * @final
   * @internal
   */
  _setPropsInternal: function(partialProps, callback) {
    // This is a deoptimized path. We optimize for always having an element.
    // This creates an extra internal element.
    var element = this._pendingElement || this._currentElement;
    this._pendingElement = ReactElement.cloneAndReplaceProps(
      element,
      assign({}, element.props, partialProps)
    );
    ReactUpdates.enqueueUpdate(this, callback);
  },

  /**
   * Filters the context object to only contain keys specified in
   * `contextTypes`
   *
   * @param {object} context
   * @return {?object}
   * @private
   */
  _maskContext: function(context) {
    var maskedContext = null;
    // This really should be getting the component class for the element,
    // but we know that we're not going to need it for built-ins.
    if (typeof this._currentElement.type === 'string') {
      return emptyObject;
    }
    var contextTypes = this._currentElement.type.contextTypes;
    if (!contextTypes) {
      return emptyObject;
    }
    maskedContext = {};
    for (var contextName in contextTypes) {
      maskedContext[contextName] = context[contextName];
    }
    return maskedContext;
  },

  /**
   * Filters the context object to only contain keys specified in
   * `contextTypes`, and asserts that they are valid.
   *
   * @param {object} context
   * @return {?object}
   * @private
   */
  _processContext: function(context) {
    var maskedContext = this._maskContext(context);
    if ("production" !== process.env.NODE_ENV) {
      var Component = ReactNativeComponent.getComponentClassForElement(
        this._currentElement
      );
      if (Component.contextTypes) {
        this._checkPropTypes(
          Component.contextTypes,
          maskedContext,
          ReactPropTypeLocations.context
        );
      }
    }
    return maskedContext;
  },

  /**
   * @param {object} currentContext
   * @return {object}
   * @private
   */
  _processChildContext: function(currentContext) {
    var inst = this._instance;
    var childContext = inst.getChildContext && inst.getChildContext();
    if (childContext) {
      ("production" !== process.env.NODE_ENV ? invariant(
        typeof inst.constructor.childContextTypes === 'object',
        '%s.getChildContext(): childContextTypes must be defined in order to ' +
        'use getChildContext().',
        this.getName() || 'ReactCompositeComponent'
      ) : invariant(typeof inst.constructor.childContextTypes === 'object'));
      if ("production" !== process.env.NODE_ENV) {
        this._checkPropTypes(
          inst.constructor.childContextTypes,
          childContext,
          ReactPropTypeLocations.childContext
        );
      }
      for (var name in childContext) {
        ("production" !== process.env.NODE_ENV ? invariant(
          name in inst.constructor.childContextTypes,
          '%s.getChildContext(): key "%s" is not defined in childContextTypes.',
          this.getName() || 'ReactCompositeComponent',
          name
        ) : invariant(name in inst.constructor.childContextTypes));
      }
      return assign({}, currentContext, childContext);
    }
    return currentContext;
  },

  /**
   * Processes props by setting default values for unspecified props and
   * asserting that the props are valid. Does not mutate its argument; returns
   * a new props object with defaults merged in.
   *
   * @param {object} newProps
   * @return {object}
   * @private
   */
  _processProps: function(newProps) {
    if ("production" !== process.env.NODE_ENV) {
      var Component = ReactNativeComponent.getComponentClassForElement(
        this._currentElement
      );
      if (Component.propTypes) {
        this._checkPropTypes(
          Component.propTypes,
          newProps,
          ReactPropTypeLocations.prop
        );
      }
    }
    return newProps;
  },

  /**
   * Assert that the props are valid
   *
   * @param {object} propTypes Map of prop name to a ReactPropType
   * @param {object} props
   * @param {string} location e.g. "prop", "context", "child context"
   * @private
   */
  _checkPropTypes: function(propTypes, props, location) {
    // TODO: Stop validating prop types here and only use the element
    // validation.
    var componentName = this.getName();
    for (var propName in propTypes) {
      if (propTypes.hasOwnProperty(propName)) {
        var error;
        try {
          // This is intentionally an invariant that gets caught. It's the same
          // behavior as without this statement except with a better message.
          ("production" !== process.env.NODE_ENV ? invariant(
            typeof propTypes[propName] === 'function',
            '%s: %s type `%s` is invalid; it must be a function, usually ' +
            'from React.PropTypes.',
            componentName || 'React class',
            ReactPropTypeLocationNames[location],
            propName
          ) : invariant(typeof propTypes[propName] === 'function'));
          error = propTypes[propName](props, propName, componentName, location);
        } catch (ex) {
          error = ex;
        }
        if (error instanceof Error) {
          // We may want to extend this logic for similar errors in
          // React.render calls, so I'm abstracting it away into
          // a function to minimize refactoring in the future
          var addendum = getDeclarationErrorAddendum(this);

          if (location === ReactPropTypeLocations.prop) {
            // Preface gives us something to blacklist in warning module
            ("production" !== process.env.NODE_ENV ? warning(
              false,
              'Failed Composite propType: %s%s',
              error.message,
              addendum
            ) : null);
          } else {
            ("production" !== process.env.NODE_ENV ? warning(
              false,
              'Failed Context Types: %s%s',
              error.message,
              addendum
            ) : null);
          }
        }
      }
    }
  },

  receiveComponent: function(nextElement, transaction, nextContext) {
    var prevElement = this._currentElement;
    var prevContext = this._context;

    this._pendingElement = null;

    this.updateComponent(
      transaction,
      prevElement,
      nextElement,
      prevContext,
      nextContext
    );
  },

  /**
   * If any of `_pendingElement`, `_pendingStateQueue`, or `_pendingForceUpdate`
   * is set, update the component.
   *
   * @param {ReactReconcileTransaction} transaction
   * @internal
   */
  performUpdateIfNecessary: function(transaction) {
    if (this._pendingElement != null) {
      ReactReconciler.receiveComponent(
        this,
        this._pendingElement || this._currentElement,
        transaction,
        this._context
      );
    }

    if (this._pendingStateQueue !== null || this._pendingForceUpdate) {
      if ("production" !== process.env.NODE_ENV) {
        ReactElementValidator.checkAndWarnForMutatedProps(
          this._currentElement
        );
      }

      this.updateComponent(
        transaction,
        this._currentElement,
        this._currentElement,
        this._context,
        this._context
      );
    }
  },

  /**
   * Compare two contexts, warning if they are different
   * TODO: Remove this check when owner-context is removed
   */
   _warnIfContextsDiffer: function(ownerBasedContext, parentBasedContext) {
    ownerBasedContext = this._maskContext(ownerBasedContext);
    parentBasedContext = this._maskContext(parentBasedContext);
    var parentKeys = Object.keys(parentBasedContext).sort();
    var displayName = this.getName() || 'ReactCompositeComponent';
    for (var i = 0; i < parentKeys.length; i++) {
      var key = parentKeys[i];
      ("production" !== process.env.NODE_ENV ? warning(
        ownerBasedContext[key] === parentBasedContext[key],
        'owner-based and parent-based contexts differ '  +
        '(values: `%s` vs `%s`) for key (%s) while mounting %s ' +
        '(see: http://fb.me/react-context-by-parent)',
        ownerBasedContext[key],
        parentBasedContext[key],
        key,
        displayName
      ) : null);
    }
  },

  /**
   * Perform an update to a mounted component. The componentWillReceiveProps and
   * shouldComponentUpdate methods are called, then (assuming the update isn't
   * skipped) the remaining update lifecycle methods are called and the DOM
   * representation is updated.
   *
   * By default, this implements React's rendering and reconciliation algorithm.
   * Sophisticated clients may wish to override this.
   *
   * @param {ReactReconcileTransaction} transaction
   * @param {ReactElement} prevParentElement
   * @param {ReactElement} nextParentElement
   * @internal
   * @overridable
   */
  updateComponent: function(
    transaction,
    prevParentElement,
    nextParentElement,
    prevUnmaskedContext,
    nextUnmaskedContext
  ) {
    var inst = this._instance;

    var nextContext = inst.context;
    var nextProps = inst.props;

    // Distinguish between a props update versus a simple state update
    if (prevParentElement !== nextParentElement) {
      nextContext = this._processContext(nextParentElement._context);
      nextProps = this._processProps(nextParentElement.props);

      if ("production" !== process.env.NODE_ENV) {
        if (nextUnmaskedContext != null) {
          this._warnIfContextsDiffer(
            nextParentElement._context,
            nextUnmaskedContext
          );
        }
      }

      // An update here will schedule an update but immediately set
      // _pendingStateQueue which will ensure that any state updates gets
      // immediately reconciled instead of waiting for the next batch.

      if (inst.componentWillReceiveProps) {
        inst.componentWillReceiveProps(nextProps, nextContext);
      }
    }

    var nextState = this._processPendingState(nextProps, nextContext);

    var shouldUpdate =
      this._pendingForceUpdate ||
      !inst.shouldComponentUpdate ||
      inst.shouldComponentUpdate(nextProps, nextState, nextContext);

    if ("production" !== process.env.NODE_ENV) {
      ("production" !== process.env.NODE_ENV ? warning(
        typeof shouldUpdate !== 'undefined',
        '%s.shouldComponentUpdate(): Returned undefined instead of a ' +
        'boolean value. Make sure to return true or false.',
        this.getName() || 'ReactCompositeComponent'
      ) : null);
    }

    if (shouldUpdate) {
      this._pendingForceUpdate = false;
      // Will set `this.props`, `this.state` and `this.context`.
      this._performComponentUpdate(
        nextParentElement,
        nextProps,
        nextState,
        nextContext,
        transaction,
        nextUnmaskedContext
      );
    } else {
      // If it's determined that a component should not update, we still want
      // to set props and state but we shortcut the rest of the update.
      this._currentElement = nextParentElement;
      this._context = nextUnmaskedContext;
      inst.props = nextProps;
      inst.state = nextState;
      inst.context = nextContext;
    }
  },

  _processPendingState: function(props, context) {
    var inst = this._instance;
    var queue = this._pendingStateQueue;
    var replace = this._pendingReplaceState;
    this._pendingReplaceState = false;
    this._pendingStateQueue = null;

    if (!queue) {
      return inst.state;
    }

    var nextState = assign({}, replace ? queue[0] : inst.state);
    for (var i = replace ? 1 : 0; i < queue.length; i++) {
      var partial = queue[i];
      assign(
        nextState,
        typeof partial === 'function' ?
          partial.call(inst, nextState, props, context) :
          partial
      );
    }

    return nextState;
  },

  /**
   * Merges new props and state, notifies delegate methods of update and
   * performs update.
   *
   * @param {ReactElement} nextElement Next element
   * @param {object} nextProps Next public object to set as properties.
   * @param {?object} nextState Next object to set as state.
   * @param {?object} nextContext Next public object to set as context.
   * @param {ReactReconcileTransaction} transaction
   * @param {?object} unmaskedContext
   * @private
   */
  _performComponentUpdate: function(
    nextElement,
    nextProps,
    nextState,
    nextContext,
    transaction,
    unmaskedContext
  ) {
    var inst = this._instance;

    var prevProps = inst.props;
    var prevState = inst.state;
    var prevContext = inst.context;

    if (inst.componentWillUpdate) {
      inst.componentWillUpdate(nextProps, nextState, nextContext);
    }

    this._currentElement = nextElement;
    this._context = unmaskedContext;
    inst.props = nextProps;
    inst.state = nextState;
    inst.context = nextContext;

    this._updateRenderedComponent(transaction, unmaskedContext);

    if (inst.componentDidUpdate) {
      transaction.getReactMountReady().enqueue(
        inst.componentDidUpdate.bind(inst, prevProps, prevState, prevContext),
        inst
      );
    }
  },

  /**
   * Call the component's `render` method and update the DOM accordingly.
   *
   * @param {ReactReconcileTransaction} transaction
   * @internal
   */
  _updateRenderedComponent: function(transaction, context) {
    var prevComponentInstance = this._renderedComponent;
    var prevRenderedElement = prevComponentInstance._currentElement;
    var nextRenderedElement = this._renderValidatedComponent();
    if (shouldUpdateReactComponent(prevRenderedElement, nextRenderedElement)) {
      ReactReconciler.receiveComponent(
        prevComponentInstance,
        nextRenderedElement,
        transaction,
        this._processChildContext(context)
      );
    } else {
      // These two IDs are actually the same! But nothing should rely on that.
      var thisID = this._rootNodeID;
      var prevComponentID = prevComponentInstance._rootNodeID;
      ReactReconciler.unmountComponent(prevComponentInstance);

      this._renderedComponent = this._instantiateReactComponent(
        nextRenderedElement,
        this._currentElement.type
      );
      var nextMarkup = ReactReconciler.mountComponent(
        this._renderedComponent,
        thisID,
        transaction,
        this._processChildContext(context)
      );
      this._replaceNodeWithMarkupByID(prevComponentID, nextMarkup);
    }
  },

  /**
   * @protected
   */
  _replaceNodeWithMarkupByID: function(prevComponentID, nextMarkup) {
    ReactComponentEnvironment.replaceNodeWithMarkupByID(
      prevComponentID,
      nextMarkup
    );
  },

  /**
   * @protected
   */
  _renderValidatedComponentWithoutOwnerOrContext: function() {
    var inst = this._instance;
    var renderedComponent = inst.render();
    if ("production" !== process.env.NODE_ENV) {
      // We allow auto-mocks to proceed as if they're returning null.
      if (typeof renderedComponent === 'undefined' &&
          inst.render._isMockFunction) {
        // This is probably bad practice. Consider warning here and
        // deprecating this convenience.
        renderedComponent = null;
      }
    }

    return renderedComponent;
  },

  /**
   * @private
   */
  _renderValidatedComponent: function() {
    var renderedComponent;
    var previousContext = ReactContext.current;
    ReactContext.current = this._processChildContext(
      this._currentElement._context
    );
    ReactCurrentOwner.current = this;
    try {
      renderedComponent =
        this._renderValidatedComponentWithoutOwnerOrContext();
    } finally {
      ReactContext.current = previousContext;
      ReactCurrentOwner.current = null;
    }
    ("production" !== process.env.NODE_ENV ? invariant(
      // TODO: An `isValidNode` function would probably be more appropriate
      renderedComponent === null || renderedComponent === false ||
      ReactElement.isValidElement(renderedComponent),
      '%s.render(): A valid ReactComponent must be returned. You may have ' +
        'returned undefined, an array or some other invalid object.',
      this.getName() || 'ReactCompositeComponent'
    ) : invariant(// TODO: An `isValidNode` function would probably be more appropriate
    renderedComponent === null || renderedComponent === false ||
    ReactElement.isValidElement(renderedComponent)));
    return renderedComponent;
  },

  /**
   * Lazily allocates the refs object and stores `component` as `ref`.
   *
   * @param {string} ref Reference name.
   * @param {component} component Component to store as `ref`.
   * @final
   * @private
   */
  attachRef: function(ref, component) {
    var inst = this.getPublicInstance();
    var refs = inst.refs === emptyObject ? (inst.refs = {}) : inst.refs;
    refs[ref] = component.getPublicInstance();
  },

  /**
   * Detaches a reference name.
   *
   * @param {string} ref Name to dereference.
   * @final
   * @private
   */
  detachRef: function(ref) {
    var refs = this.getPublicInstance().refs;
    delete refs[ref];
  },

  /**
   * Get a text description of the component that can be used to identify it
   * in error messages.
   * @return {string} The name or null.
   * @internal
   */
  getName: function() {
    var type = this._currentElement.type;
    var constructor = this._instance && this._instance.constructor;
    return (
      type.displayName || (constructor && constructor.displayName) ||
      type.name || (constructor && constructor.name) ||
      null
    );
  },

  /**
   * Get the publicly accessible representation of this component - i.e. what
   * is exposed by refs and returned by React.render. Can be null for stateless
   * components.
   *
   * @return {ReactComponent} the public component instance.
   * @internal
   */
  getPublicInstance: function() {
    return this._instance;
  },

  // Stub
  _instantiateReactComponent: null

};

ReactPerf.measureMethods(
  ReactCompositeComponentMixin,
  'ReactCompositeComponent',
  {
    mountComponent: 'mountComponent',
    updateComponent: 'updateComponent',
    _renderValidatedComponent: '_renderValidatedComponent'
  }
);

var ReactCompositeComponent = {

  Mixin: ReactCompositeComponentMixin

};

module.exports = ReactCompositeComponent;

}).call(this,require('_process'))
},{"./Object.assign":37,"./ReactComponentEnvironment":47,"./ReactContext":49,"./ReactCurrentOwner":50,"./ReactElement":68,"./ReactElementValidator":69,"./ReactInstanceMap":78,"./ReactLifeCycle":79,"./ReactNativeComponent":84,"./ReactPerf":86,"./ReactPropTypeLocationNames":87,"./ReactPropTypeLocations":88,"./ReactReconciler":92,"./ReactUpdates":98,"./emptyObject":126,"./invariant":146,"./shouldUpdateReactComponent":162,"./warning":165,"_process":4}],49:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactContext
 */

'use strict';

var assign = require("./Object.assign");
var emptyObject = require("./emptyObject");
var warning = require("./warning");

var didWarn = false;

/**
 * Keeps track of the current context.
 *
 * The context is automatically passed down the component ownership hierarchy
 * and is accessible via `this.context` on ReactCompositeComponents.
 */
var ReactContext = {

  /**
   * @internal
   * @type {object}
   */
  current: emptyObject,

  /**
   * Temporarily extends the current context while executing scopedCallback.
   *
   * A typical use case might look like
   *
   *  render: function() {
   *    var children = ReactContext.withContext({foo: 'foo'}, () => (
   *
   *    ));
   *    return <div>{children}</div>;
   *  }
   *
   * @param {object} newContext New context to merge into the existing context
   * @param {function} scopedCallback Callback to run with the new context
   * @return {ReactComponent|array<ReactComponent>}
   */
  withContext: function(newContext, scopedCallback) {
    if ("production" !== process.env.NODE_ENV) {
      ("production" !== process.env.NODE_ENV ? warning(
        didWarn,
        'withContext is deprecated and will be removed in a future version. ' +
        'Use a wrapper component with getChildContext instead.'
      ) : null);

      didWarn = true;
    }

    var result;
    var previousContext = ReactContext.current;
    ReactContext.current = assign({}, previousContext, newContext);
    try {
      result = scopedCallback();
    } finally {
      ReactContext.current = previousContext;
    }
    return result;
  }

};

module.exports = ReactContext;

}).call(this,require('_process'))
},{"./Object.assign":37,"./emptyObject":126,"./warning":165,"_process":4}],50:[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactCurrentOwner
 */

'use strict';

/**
 * Keeps track of the current owner.
 *
 * The current owner is the component who should own any components that are
 * currently being constructed.
 *
 * The depth indicate how many composite components are above this render level.
 */
var ReactCurrentOwner = {

  /**
   * @internal
   * @type {ReactComponent}
   */
  current: null

};

module.exports = ReactCurrentOwner;

},{}],51:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactDOM
 * @typechecks static-only
 */

'use strict';

var ReactElement = require("./ReactElement");
var ReactElementValidator = require("./ReactElementValidator");

var mapObject = require("./mapObject");

/**
 * Create a factory that creates HTML tag elements.
 *
 * @param {string} tag Tag name (e.g. `div`).
 * @private
 */
function createDOMFactory(tag) {
  if ("production" !== process.env.NODE_ENV) {
    return ReactElementValidator.createFactory(tag);
  }
  return ReactElement.createFactory(tag);
}

/**
 * Creates a mapping from supported HTML tags to `ReactDOMComponent` classes.
 * This is also accessible via `React.DOM`.
 *
 * @public
 */
var ReactDOM = mapObject({
  a: 'a',
  abbr: 'abbr',
  address: 'address',
  area: 'area',
  article: 'article',
  aside: 'aside',
  audio: 'audio',
  b: 'b',
  base: 'base',
  bdi: 'bdi',
  bdo: 'bdo',
  big: 'big',
  blockquote: 'blockquote',
  body: 'body',
  br: 'br',
  button: 'button',
  canvas: 'canvas',
  caption: 'caption',
  cite: 'cite',
  code: 'code',
  col: 'col',
  colgroup: 'colgroup',
  data: 'data',
  datalist: 'datalist',
  dd: 'dd',
  del: 'del',
  details: 'details',
  dfn: 'dfn',
  dialog: 'dialog',
  div: 'div',
  dl: 'dl',
  dt: 'dt',
  em: 'em',
  embed: 'embed',
  fieldset: 'fieldset',
  figcaption: 'figcaption',
  figure: 'figure',
  footer: 'footer',
  form: 'form',
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  h5: 'h5',
  h6: 'h6',
  head: 'head',
  header: 'header',
  hr: 'hr',
  html: 'html',
  i: 'i',
  iframe: 'iframe',
  img: 'img',
  input: 'input',
  ins: 'ins',
  kbd: 'kbd',
  keygen: 'keygen',
  label: 'label',
  legend: 'legend',
  li: 'li',
  link: 'link',
  main: 'main',
  map: 'map',
  mark: 'mark',
  menu: 'menu',
  menuitem: 'menuitem',
  meta: 'meta',
  meter: 'meter',
  nav: 'nav',
  noscript: 'noscript',
  object: 'object',
  ol: 'ol',
  optgroup: 'optgroup',
  option: 'option',
  output: 'output',
  p: 'p',
  param: 'param',
  picture: 'picture',
  pre: 'pre',
  progress: 'progress',
  q: 'q',
  rp: 'rp',
  rt: 'rt',
  ruby: 'ruby',
  s: 's',
  samp: 'samp',
  script: 'script',
  section: 'section',
  select: 'select',
  small: 'small',
  source: 'source',
  span: 'span',
  strong: 'strong',
  style: 'style',
  sub: 'sub',
  summary: 'summary',
  sup: 'sup',
  table: 'table',
  tbody: 'tbody',
  td: 'td',
  textarea: 'textarea',
  tfoot: 'tfoot',
  th: 'th',
  thead: 'thead',
  time: 'time',
  title: 'title',
  tr: 'tr',
  track: 'track',
  u: 'u',
  ul: 'ul',
  'var': 'var',
  video: 'video',
  wbr: 'wbr',

  // SVG
  circle: 'circle',
  defs: 'defs',
  ellipse: 'ellipse',
  g: 'g',
  line: 'line',
  linearGradient: 'linearGradient',
  mask: 'mask',
  path: 'path',
  pattern: 'pattern',
  polygon: 'polygon',
  polyline: 'polyline',
  radialGradient: 'radialGradient',
  rect: 'rect',
  stop: 'stop',
  svg: 'svg',
  text: 'text',
  tspan: 'tspan'

}, createDOMFactory);

module.exports = ReactDOM;

}).call(this,require('_process'))
},{"./ReactElement":68,"./ReactElementValidator":69,"./mapObject":153,"_process":4}],52:[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactDOMButton
 */

'use strict';

var AutoFocusMixin = require("./AutoFocusMixin");
var ReactBrowserComponentMixin = require("./ReactBrowserComponentMixin");
var ReactClass = require("./ReactClass");
var ReactElement = require("./ReactElement");

var keyMirror = require("./keyMirror");

var button = ReactElement.createFactory('button');

var mouseListenerNames = keyMirror({
  onClick: true,
  onDoubleClick: true,
  onMouseDown: true,
  onMouseMove: true,
  onMouseUp: true,
  onClickCapture: true,
  onDoubleClickCapture: true,
  onMouseDownCapture: true,
  onMouseMoveCapture: true,
  onMouseUpCapture: true
});

/**
 * Implements a <button> native component that does not receive mouse events
 * when `disabled` is set.
 */
var ReactDOMButton = ReactClass.createClass({
  displayName: 'ReactDOMButton',
  tagName: 'BUTTON',

  mixins: [AutoFocusMixin, ReactBrowserComponentMixin],

  render: function() {
    var props = {};

    // Copy the props; except the mouse listeners if we're disabled
    for (var key in this.props) {
      if (this.props.hasOwnProperty(key) &&
          (!this.props.disabled || !mouseListenerNames[key])) {
        props[key] = this.props[key];
      }
    }

    return button(props, this.props.children);
  }

});

module.exports = ReactDOMButton;

},{"./AutoFocusMixin":12,"./ReactBrowserComponentMixin":40,"./ReactClass":44,"./ReactElement":68,"./keyMirror":151}],53:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactDOMComponent
 * @typechecks static-only
 */

/* global hasOwnProperty:true */

'use strict';

var CSSPropertyOperations = require("./CSSPropertyOperations");
var DOMProperty = require("./DOMProperty");
var DOMPropertyOperations = require("./DOMPropertyOperations");
var ReactBrowserEventEmitter = require("./ReactBrowserEventEmitter");
var ReactComponentBrowserEnvironment =
  require("./ReactComponentBrowserEnvironment");
var ReactMount = require("./ReactMount");
var ReactMultiChild = require("./ReactMultiChild");
var ReactPerf = require("./ReactPerf");

var assign = require("./Object.assign");
var escapeTextContentForBrowser = require("./escapeTextContentForBrowser");
var invariant = require("./invariant");
var isEventSupported = require("./isEventSupported");
var keyOf = require("./keyOf");
var warning = require("./warning");

var deleteListener = ReactBrowserEventEmitter.deleteListener;
var listenTo = ReactBrowserEventEmitter.listenTo;
var registrationNameModules = ReactBrowserEventEmitter.registrationNameModules;

// For quickly matching children type, to test if can be treated as content.
var CONTENT_TYPES = {'string': true, 'number': true};

var STYLE = keyOf({style: null});

var ELEMENT_NODE_TYPE = 1;

/**
 * Optionally injectable operations for mutating the DOM
 */
var BackendIDOperations = null;

/**
 * @param {?object} props
 */
function assertValidProps(props) {
  if (!props) {
    return;
  }
  // Note the use of `==` which checks for null or undefined.
  if (props.dangerouslySetInnerHTML != null) {
    ("production" !== process.env.NODE_ENV ? invariant(
      props.children == null,
      'Can only set one of `children` or `props.dangerouslySetInnerHTML`.'
    ) : invariant(props.children == null));
    ("production" !== process.env.NODE_ENV ? invariant(
      props.dangerouslySetInnerHTML.__html != null,
      '`props.dangerouslySetInnerHTML` must be in the form `{__html: ...}`. ' +
      'Please visit http://fb.me/react-invariant-dangerously-set-inner-html ' +
      'for more information.'
    ) : invariant(props.dangerouslySetInnerHTML.__html != null));
  }
  if ("production" !== process.env.NODE_ENV) {
    ("production" !== process.env.NODE_ENV ? warning(
      props.innerHTML == null,
      'Directly setting property `innerHTML` is not permitted. ' +
      'For more information, lookup documentation on `dangerouslySetInnerHTML`.'
    ) : null);
    ("production" !== process.env.NODE_ENV ? warning(
      !props.contentEditable || props.children == null,
      'A component is `contentEditable` and contains `children` managed by ' +
      'React. It is now your responsibility to guarantee that none of ' +
      'those nodes are unexpectedly modified or duplicated. This is ' +
      'probably not intentional.'
    ) : null);
  }
  ("production" !== process.env.NODE_ENV ? invariant(
    props.style == null || typeof props.style === 'object',
    'The `style` prop expects a mapping from style properties to values, ' +
    'not a string. For example, style={{marginRight: spacing + \'em\'}} when ' +
    'using JSX.'
  ) : invariant(props.style == null || typeof props.style === 'object'));
}

function putListener(id, registrationName, listener, transaction) {
  if ("production" !== process.env.NODE_ENV) {
    // IE8 has no API for event capturing and the `onScroll` event doesn't
    // bubble.
    ("production" !== process.env.NODE_ENV ? warning(
      registrationName !== 'onScroll' || isEventSupported('scroll', true),
      'This browser doesn\'t support the `onScroll` event'
    ) : null);
  }
  var container = ReactMount.findReactContainerForID(id);
  if (container) {
    var doc = container.nodeType === ELEMENT_NODE_TYPE ?
      container.ownerDocument :
      container;
    listenTo(registrationName, doc);
  }
  transaction.getPutListenerQueue().enqueuePutListener(
    id,
    registrationName,
    listener
  );
}

// For HTML, certain tags should omit their close tag. We keep a whitelist for
// those special cased tags.

var omittedCloseTags = {
  'area': true,
  'base': true,
  'br': true,
  'col': true,
  'embed': true,
  'hr': true,
  'img': true,
  'input': true,
  'keygen': true,
  'link': true,
  'meta': true,
  'param': true,
  'source': true,
  'track': true,
  'wbr': true
  // NOTE: menuitem's close tag should be omitted, but that causes problems.
};

// We accept any tag to be rendered but since this gets injected into abitrary
// HTML, we want to make sure that it's a safe tag.
// http://www.w3.org/TR/REC-xml/#NT-Name

var VALID_TAG_REGEX = /^[a-zA-Z][a-zA-Z:_\.\-\d]*$/; // Simplified subset
var validatedTagCache = {};
var hasOwnProperty = {}.hasOwnProperty;

function validateDangerousTag(tag) {
  if (!hasOwnProperty.call(validatedTagCache, tag)) {
    ("production" !== process.env.NODE_ENV ? invariant(VALID_TAG_REGEX.test(tag), 'Invalid tag: %s', tag) : invariant(VALID_TAG_REGEX.test(tag)));
    validatedTagCache[tag] = true;
  }
}

/**
 * Creates a new React class that is idempotent and capable of containing other
 * React components. It accepts event listeners and DOM properties that are
 * valid according to `DOMProperty`.
 *
 *  - Event listeners: `onClick`, `onMouseDown`, etc.
 *  - DOM properties: `className`, `name`, `title`, etc.
 *
 * The `style` property functions differently from the DOM API. It accepts an
 * object mapping of style properties to values.
 *
 * @constructor ReactDOMComponent
 * @extends ReactMultiChild
 */
function ReactDOMComponent(tag) {
  validateDangerousTag(tag);
  this._tag = tag;
  this._renderedChildren = null;
  this._previousStyleCopy = null;
  this._rootNodeID = null;
}

ReactDOMComponent.displayName = 'ReactDOMComponent';

ReactDOMComponent.Mixin = {

  construct: function(element) {
    this._currentElement = element;
  },

  /**
   * Generates root tag markup then recurses. This method has side effects and
   * is not idempotent.
   *
   * @internal
   * @param {string} rootID The root DOM ID for this node.
   * @param {ReactReconcileTransaction|ReactServerRenderingTransaction} transaction
   * @return {string} The computed markup.
   */
  mountComponent: function(rootID, transaction, context) {
    this._rootNodeID = rootID;
    assertValidProps(this._currentElement.props);
    var closeTag = omittedCloseTags[this._tag] ? '' : '</' + this._tag + '>';
    return (
      this._createOpenTagMarkupAndPutListeners(transaction) +
      this._createContentMarkup(transaction, context) +
      closeTag
    );
  },

  /**
   * Creates markup for the open tag and all attributes.
   *
   * This method has side effects because events get registered.
   *
   * Iterating over object properties is faster than iterating over arrays.
   * @see http://jsperf.com/obj-vs-arr-iteration
   *
   * @private
   * @param {ReactReconcileTransaction|ReactServerRenderingTransaction} transaction
   * @return {string} Markup of opening tag.
   */
  _createOpenTagMarkupAndPutListeners: function(transaction) {
    var props = this._currentElement.props;
    var ret = '<' + this._tag;

    for (var propKey in props) {
      if (!props.hasOwnProperty(propKey)) {
        continue;
      }
      var propValue = props[propKey];
      if (propValue == null) {
        continue;
      }
      if (registrationNameModules.hasOwnProperty(propKey)) {
        putListener(this._rootNodeID, propKey, propValue, transaction);
      } else {
        if (propKey === STYLE) {
          if (propValue) {
            propValue = this._previousStyleCopy = assign({}, props.style);
          }
          propValue = CSSPropertyOperations.createMarkupForStyles(propValue);
        }
        var markup =
          DOMPropertyOperations.createMarkupForProperty(propKey, propValue);
        if (markup) {
          ret += ' ' + markup;
        }
      }
    }

    // For static pages, no need to put React ID and checksum. Saves lots of
    // bytes.
    if (transaction.renderToStaticMarkup) {
      return ret + '>';
    }

    var markupForID = DOMPropertyOperations.createMarkupForID(this._rootNodeID);
    return ret + ' ' + markupForID + '>';
  },

  /**
   * Creates markup for the content between the tags.
   *
   * @private
   * @param {ReactReconcileTransaction|ReactServerRenderingTransaction} transaction
   * @param {object} context
   * @return {string} Content markup.
   */
  _createContentMarkup: function(transaction, context) {
    var prefix = '';
    if (this._tag === 'listing' ||
        this._tag === 'pre' ||
        this._tag === 'textarea') {
      // Add an initial newline because browsers ignore the first newline in
      // a <listing>, <pre>, or <textarea> as an "authoring convenience" -- see
      // https://html.spec.whatwg.org/multipage/syntax.html#parsing-main-inbody.
      prefix = '\n';
    }

    var props = this._currentElement.props;

    // Intentional use of != to avoid catching zero/false.
    var innerHTML = props.dangerouslySetInnerHTML;
    if (innerHTML != null) {
      if (innerHTML.__html != null) {
        return prefix + innerHTML.__html;
      }
    } else {
      var contentToUse =
        CONTENT_TYPES[typeof props.children] ? props.children : null;
      var childrenToUse = contentToUse != null ? null : props.children;
      if (contentToUse != null) {
        return prefix + escapeTextContentForBrowser(contentToUse);
      } else if (childrenToUse != null) {
        var mountImages = this.mountChildren(
          childrenToUse,
          transaction,
          context
        );
        return prefix + mountImages.join('');
      }
    }
    return prefix;
  },

  receiveComponent: function(nextElement, transaction, context) {
    var prevElement = this._currentElement;
    this._currentElement = nextElement;
    this.updateComponent(transaction, prevElement, nextElement, context);
  },

  /**
   * Updates a native DOM component after it has already been allocated and
   * attached to the DOM. Reconciles the root DOM node, then recurses.
   *
   * @param {ReactReconcileTransaction} transaction
   * @param {ReactElement} prevElement
   * @param {ReactElement} nextElement
   * @internal
   * @overridable
   */
  updateComponent: function(transaction, prevElement, nextElement, context) {
    assertValidProps(this._currentElement.props);
    this._updateDOMProperties(prevElement.props, transaction);
    this._updateDOMChildren(prevElement.props, transaction, context);
  },

  /**
   * Reconciles the properties by detecting differences in property values and
   * updating the DOM as necessary. This function is probably the single most
   * critical path for performance optimization.
   *
   * TODO: Benchmark whether checking for changed values in memory actually
   *       improves performance (especially statically positioned elements).
   * TODO: Benchmark the effects of putting this at the top since 99% of props
   *       do not change for a given reconciliation.
   * TODO: Benchmark areas that can be improved with caching.
   *
   * @private
   * @param {object} lastProps
   * @param {ReactReconcileTransaction} transaction
   */
  _updateDOMProperties: function(lastProps, transaction) {
    var nextProps = this._currentElement.props;
    var propKey;
    var styleName;
    var styleUpdates;
    for (propKey in lastProps) {
      if (nextProps.hasOwnProperty(propKey) ||
         !lastProps.hasOwnProperty(propKey)) {
        continue;
      }
      if (propKey === STYLE) {
        var lastStyle = this._previousStyleCopy;
        for (styleName in lastStyle) {
          if (lastStyle.hasOwnProperty(styleName)) {
            styleUpdates = styleUpdates || {};
            styleUpdates[styleName] = '';
          }
        }
        this._previousStyleCopy = null;
      } else if (registrationNameModules.hasOwnProperty(propKey)) {
        deleteListener(this._rootNodeID, propKey);
      } else if (
          DOMProperty.isStandardName[propKey] ||
          DOMProperty.isCustomAttribute(propKey)) {
        BackendIDOperations.deletePropertyByID(
          this._rootNodeID,
          propKey
        );
      }
    }
    for (propKey in nextProps) {
      var nextProp = nextProps[propKey];
      var lastProp = propKey === STYLE ?
        this._previousStyleCopy :
        lastProps[propKey];
      if (!nextProps.hasOwnProperty(propKey) || nextProp === lastProp) {
        continue;
      }
      if (propKey === STYLE) {
        if (nextProp) {
          nextProp = this._previousStyleCopy = assign({}, nextProp);
        } else {
          this._previousStyleCopy = null;
        }
        if (lastProp) {
          // Unset styles on `lastProp` but not on `nextProp`.
          for (styleName in lastProp) {
            if (lastProp.hasOwnProperty(styleName) &&
                (!nextProp || !nextProp.hasOwnProperty(styleName))) {
              styleUpdates = styleUpdates || {};
              styleUpdates[styleName] = '';
            }
          }
          // Update styles that changed since `lastProp`.
          for (styleName in nextProp) {
            if (nextProp.hasOwnProperty(styleName) &&
                lastProp[styleName] !== nextProp[styleName]) {
              styleUpdates = styleUpdates || {};
              styleUpdates[styleName] = nextProp[styleName];
            }
          }
        } else {
          // Relies on `updateStylesByID` not mutating `styleUpdates`.
          styleUpdates = nextProp;
        }
      } else if (registrationNameModules.hasOwnProperty(propKey)) {
        putListener(this._rootNodeID, propKey, nextProp, transaction);
      } else if (
          DOMProperty.isStandardName[propKey] ||
          DOMProperty.isCustomAttribute(propKey)) {
        BackendIDOperations.updatePropertyByID(
          this._rootNodeID,
          propKey,
          nextProp
        );
      }
    }
    if (styleUpdates) {
      BackendIDOperations.updateStylesByID(
        this._rootNodeID,
        styleUpdates
      );
    }
  },

  /**
   * Reconciles the children with the various properties that affect the
   * children content.
   *
   * @param {object} lastProps
   * @param {ReactReconcileTransaction} transaction
   */
  _updateDOMChildren: function(lastProps, transaction, context) {
    var nextProps = this._currentElement.props;

    var lastContent =
      CONTENT_TYPES[typeof lastProps.children] ? lastProps.children : null;
    var nextContent =
      CONTENT_TYPES[typeof nextProps.children] ? nextProps.children : null;

    var lastHtml =
      lastProps.dangerouslySetInnerHTML &&
      lastProps.dangerouslySetInnerHTML.__html;
    var nextHtml =
      nextProps.dangerouslySetInnerHTML &&
      nextProps.dangerouslySetInnerHTML.__html;

    // Note the use of `!=` which checks for null or undefined.
    var lastChildren = lastContent != null ? null : lastProps.children;
    var nextChildren = nextContent != null ? null : nextProps.children;

    // If we're switching from children to content/html or vice versa, remove
    // the old content
    var lastHasContentOrHtml = lastContent != null || lastHtml != null;
    var nextHasContentOrHtml = nextContent != null || nextHtml != null;
    if (lastChildren != null && nextChildren == null) {
      this.updateChildren(null, transaction, context);
    } else if (lastHasContentOrHtml && !nextHasContentOrHtml) {
      this.updateTextContent('');
    }

    if (nextContent != null) {
      if (lastContent !== nextContent) {
        this.updateTextContent('' + nextContent);
      }
    } else if (nextHtml != null) {
      if (lastHtml !== nextHtml) {
        BackendIDOperations.updateInnerHTMLByID(
          this._rootNodeID,
          nextHtml
        );
      }
    } else if (nextChildren != null) {
      this.updateChildren(nextChildren, transaction, context);
    }
  },

  /**
   * Destroys all event registrations for this instance. Does not remove from
   * the DOM. That must be done by the parent.
   *
   * @internal
   */
  unmountComponent: function() {
    this.unmountChildren();
    ReactBrowserEventEmitter.deleteAllListeners(this._rootNodeID);
    ReactComponentBrowserEnvironment.unmountIDFromEnvironment(this._rootNodeID);
    this._rootNodeID = null;
  }

};

ReactPerf.measureMethods(ReactDOMComponent, 'ReactDOMComponent', {
  mountComponent: 'mountComponent',
  updateComponent: 'updateComponent'
});

assign(
  ReactDOMComponent.prototype,
  ReactDOMComponent.Mixin,
  ReactMultiChild.Mixin
);

ReactDOMComponent.injection = {
  injectIDOperations: function(IDOperations) {
    ReactDOMComponent.BackendIDOperations = BackendIDOperations = IDOperations;
  }
};

module.exports = ReactDOMComponent;

}).call(this,require('_process'))
},{"./CSSPropertyOperations":15,"./DOMProperty":20,"./DOMPropertyOperations":21,"./Object.assign":37,"./ReactBrowserEventEmitter":41,"./ReactComponentBrowserEnvironment":46,"./ReactMount":81,"./ReactMultiChild":82,"./ReactPerf":86,"./escapeTextContentForBrowser":127,"./invariant":146,"./isEventSupported":147,"./keyOf":152,"./warning":165,"_process":4}],54:[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactDOMForm
 */

'use strict';

var EventConstants = require("./EventConstants");
var LocalEventTrapMixin = require("./LocalEventTrapMixin");
var ReactBrowserComponentMixin = require("./ReactBrowserComponentMixin");
var ReactClass = require("./ReactClass");
var ReactElement = require("./ReactElement");

var form = ReactElement.createFactory('form');

/**
 * Since onSubmit doesn't bubble OR capture on the top level in IE8, we need
 * to capture it on the <form> element itself. There are lots of hacks we could
 * do to accomplish this, but the most reliable is to make <form> a
 * composite component and use `componentDidMount` to attach the event handlers.
 */
var ReactDOMForm = ReactClass.createClass({
  displayName: 'ReactDOMForm',
  tagName: 'FORM',

  mixins: [ReactBrowserComponentMixin, LocalEventTrapMixin],

  render: function() {
    // TODO: Instead of using `ReactDOM` directly, we should use JSX. However,
    // `jshint` fails to parse JSX so in order for linting to work in the open
    // source repo, we need to just use `ReactDOM.form`.
    return form(this.props);
  },

  componentDidMount: function() {
    this.trapBubbledEvent(EventConstants.topLevelTypes.topReset, 'reset');
    this.trapBubbledEvent(EventConstants.topLevelTypes.topSubmit, 'submit');
  }
});

module.exports = ReactDOMForm;

},{"./EventConstants":25,"./LocalEventTrapMixin":35,"./ReactBrowserComponentMixin":40,"./ReactClass":44,"./ReactElement":68}],55:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactDOMIDOperations
 * @typechecks static-only
 */

/*jslint evil: true */

'use strict';

var CSSPropertyOperations = require("./CSSPropertyOperations");
var DOMChildrenOperations = require("./DOMChildrenOperations");
var DOMPropertyOperations = require("./DOMPropertyOperations");
var ReactMount = require("./ReactMount");
var ReactPerf = require("./ReactPerf");

var invariant = require("./invariant");
var setInnerHTML = require("./setInnerHTML");

/**
 * Errors for properties that should not be updated with `updatePropertyById()`.
 *
 * @type {object}
 * @private
 */
var INVALID_PROPERTY_ERRORS = {
  dangerouslySetInnerHTML:
    '`dangerouslySetInnerHTML` must be set using `updateInnerHTMLByID()`.',
  style: '`style` must be set using `updateStylesByID()`.'
};

/**
 * Operations used to process updates to DOM nodes. This is made injectable via
 * `ReactDOMComponent.BackendIDOperations`.
 */
var ReactDOMIDOperations = {

  /**
   * Updates a DOM node with new property values. This should only be used to
   * update DOM properties in `DOMProperty`.
   *
   * @param {string} id ID of the node to update.
   * @param {string} name A valid property name, see `DOMProperty`.
   * @param {*} value New value of the property.
   * @internal
   */
  updatePropertyByID: function(id, name, value) {
    var node = ReactMount.getNode(id);
    ("production" !== process.env.NODE_ENV ? invariant(
      !INVALID_PROPERTY_ERRORS.hasOwnProperty(name),
      'updatePropertyByID(...): %s',
      INVALID_PROPERTY_ERRORS[name]
    ) : invariant(!INVALID_PROPERTY_ERRORS.hasOwnProperty(name)));

    // If we're updating to null or undefined, we should remove the property
    // from the DOM node instead of inadvertantly setting to a string. This
    // brings us in line with the same behavior we have on initial render.
    if (value != null) {
      DOMPropertyOperations.setValueForProperty(node, name, value);
    } else {
      DOMPropertyOperations.deleteValueForProperty(node, name);
    }
  },

  /**
   * Updates a DOM node to remove a property. This should only be used to remove
   * DOM properties in `DOMProperty`.
   *
   * @param {string} id ID of the node to update.
   * @param {string} name A property name to remove, see `DOMProperty`.
   * @internal
   */
  deletePropertyByID: function(id, name, value) {
    var node = ReactMount.getNode(id);
    ("production" !== process.env.NODE_ENV ? invariant(
      !INVALID_PROPERTY_ERRORS.hasOwnProperty(name),
      'updatePropertyByID(...): %s',
      INVALID_PROPERTY_ERRORS[name]
    ) : invariant(!INVALID_PROPERTY_ERRORS.hasOwnProperty(name)));
    DOMPropertyOperations.deleteValueForProperty(node, name, value);
  },

  /**
   * Updates a DOM node with new style values. If a value is specified as '',
   * the corresponding style property will be unset.
   *
   * @param {string} id ID of the node to update.
   * @param {object} styles Mapping from styles to values.
   * @internal
   */
  updateStylesByID: function(id, styles) {
    var node = ReactMount.getNode(id);
    CSSPropertyOperations.setValueForStyles(node, styles);
  },

  /**
   * Updates a DOM node's innerHTML.
   *
   * @param {string} id ID of the node to update.
   * @param {string} html An HTML string.
   * @internal
   */
  updateInnerHTMLByID: function(id, html) {
    var node = ReactMount.getNode(id);
    setInnerHTML(node, html);
  },

  /**
   * Updates a DOM node's text content set by `props.content`.
   *
   * @param {string} id ID of the node to update.
   * @param {string} content Text content.
   * @internal
   */
  updateTextContentByID: function(id, content) {
    var node = ReactMount.getNode(id);
    DOMChildrenOperations.updateTextContent(node, content);
  },

  /**
   * Replaces a DOM node that exists in the document with markup.
   *
   * @param {string} id ID of child to be replaced.
   * @param {string} markup Dangerous markup to inject in place of child.
   * @internal
   * @see {Danger.dangerouslyReplaceNodeWithMarkup}
   */
  dangerouslyReplaceNodeWithMarkupByID: function(id, markup) {
    var node = ReactMount.getNode(id);
    DOMChildrenOperations.dangerouslyReplaceNodeWithMarkup(node, markup);
  },

  /**
   * Updates a component's children by processing a series of updates.
   *
   * @param {array<object>} updates List of update configurations.
   * @param {array<string>} markup List of markup strings.
   * @internal
   */
  dangerouslyProcessChildrenUpdates: function(updates, markup) {
    for (var i = 0; i < updates.length; i++) {
      updates[i].parentNode = ReactMount.getNode(updates[i].parentID);
    }
    DOMChildrenOperations.processUpdates(updates, markup);
  }
};

ReactPerf.measureMethods(ReactDOMIDOperations, 'ReactDOMIDOperations', {
  updatePropertyByID: 'updatePropertyByID',
  deletePropertyByID: 'deletePropertyByID',
  updateStylesByID: 'updateStylesByID',
  updateInnerHTMLByID: 'updateInnerHTMLByID',
  updateTextContentByID: 'updateTextContentByID',
  dangerouslyReplaceNodeWithMarkupByID: 'dangerouslyReplaceNodeWithMarkupByID',
  dangerouslyProcessChildrenUpdates: 'dangerouslyProcessChildrenUpdates'
});

module.exports = ReactDOMIDOperations;

}).call(this,require('_process'))
},{"./CSSPropertyOperations":15,"./DOMChildrenOperations":19,"./DOMPropertyOperations":21,"./ReactMount":81,"./ReactPerf":86,"./invariant":146,"./setInnerHTML":159,"_process":4}],56:[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactDOMIframe
 */

'use strict';

var EventConstants = require("./EventConstants");
var LocalEventTrapMixin = require("./LocalEventTrapMixin");
var ReactBrowserComponentMixin = require("./ReactBrowserComponentMixin");
var ReactClass = require("./ReactClass");
var ReactElement = require("./ReactElement");

var iframe = ReactElement.createFactory('iframe');

/**
 * Since onLoad doesn't bubble OR capture on the top level in IE8, we need to
 * capture it on the <iframe> element itself. There are lots of hacks we could
 * do to accomplish this, but the most reliable is to make <iframe> a composite
 * component and use `componentDidMount` to attach the event handlers.
 */
var ReactDOMIframe = ReactClass.createClass({
  displayName: 'ReactDOMIframe',
  tagName: 'IFRAME',

  mixins: [ReactBrowserComponentMixin, LocalEventTrapMixin],

  render: function() {
    return iframe(this.props);
  },

  componentDidMount: function() {
    this.trapBubbledEvent(EventConstants.topLevelTypes.topLoad, 'load');
  }
});

module.exports = ReactDOMIframe;

},{"./EventConstants":25,"./LocalEventTrapMixin":35,"./ReactBrowserComponentMixin":40,"./ReactClass":44,"./ReactElement":68}],57:[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactDOMImg
 */

'use strict';

var EventConstants = require("./EventConstants");
var LocalEventTrapMixin = require("./LocalEventTrapMixin");
var ReactBrowserComponentMixin = require("./ReactBrowserComponentMixin");
var ReactClass = require("./ReactClass");
var ReactElement = require("./ReactElement");

var img = ReactElement.createFactory('img');

/**
 * Since onLoad doesn't bubble OR capture on the top level in IE8, we need to
 * capture it on the <img> element itself. There are lots of hacks we could do
 * to accomplish this, but the most reliable is to make <img> a composite
 * component and use `componentDidMount` to attach the event handlers.
 */
var ReactDOMImg = ReactClass.createClass({
  displayName: 'ReactDOMImg',
  tagName: 'IMG',

  mixins: [ReactBrowserComponentMixin, LocalEventTrapMixin],

  render: function() {
    return img(this.props);
  },

  componentDidMount: function() {
    this.trapBubbledEvent(EventConstants.topLevelTypes.topLoad, 'load');
    this.trapBubbledEvent(EventConstants.topLevelTypes.topError, 'error');
  }
});

module.exports = ReactDOMImg;

},{"./EventConstants":25,"./LocalEventTrapMixin":35,"./ReactBrowserComponentMixin":40,"./ReactClass":44,"./ReactElement":68}],58:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactDOMInput
 */

'use strict';

var AutoFocusMixin = require("./AutoFocusMixin");
var DOMPropertyOperations = require("./DOMPropertyOperations");
var LinkedValueUtils = require("./LinkedValueUtils");
var ReactBrowserComponentMixin = require("./ReactBrowserComponentMixin");
var ReactClass = require("./ReactClass");
var ReactElement = require("./ReactElement");
var ReactMount = require("./ReactMount");
var ReactUpdates = require("./ReactUpdates");

var assign = require("./Object.assign");
var invariant = require("./invariant");

var input = ReactElement.createFactory('input');

var instancesByReactID = {};

function forceUpdateIfMounted() {
  /*jshint validthis:true */
  if (this.isMounted()) {
    this.forceUpdate();
  }
}

/**
 * Implements an <input> native component that allows setting these optional
 * props: `checked`, `value`, `defaultChecked`, and `defaultValue`.
 *
 * If `checked` or `value` are not supplied (or null/undefined), user actions
 * that affect the checked state or value will trigger updates to the element.
 *
 * If they are supplied (and not null/undefined), the rendered element will not
 * trigger updates to the element. Instead, the props must change in order for
 * the rendered element to be updated.
 *
 * The rendered element will be initialized as unchecked (or `defaultChecked`)
 * with an empty value (or `defaultValue`).
 *
 * @see http://www.w3.org/TR/2012/WD-html5-20121025/the-input-element.html
 */
var ReactDOMInput = ReactClass.createClass({
  displayName: 'ReactDOMInput',
  tagName: 'INPUT',

  mixins: [AutoFocusMixin, LinkedValueUtils.Mixin, ReactBrowserComponentMixin],

  getInitialState: function() {
    var defaultValue = this.props.defaultValue;
    return {
      initialChecked: this.props.defaultChecked || false,
      initialValue: defaultValue != null ? defaultValue : null
    };
  },

  render: function() {
    // Clone `this.props` so we don't mutate the input.
    var props = assign({}, this.props);

    props.defaultChecked = null;
    props.defaultValue = null;

    var value = LinkedValueUtils.getValue(this);
    props.value = value != null ? value : this.state.initialValue;

    var checked = LinkedValueUtils.getChecked(this);
    props.checked = checked != null ? checked : this.state.initialChecked;

    props.onChange = this._handleChange;

    return input(props, this.props.children);
  },

  componentDidMount: function() {
    var id = ReactMount.getID(this.getDOMNode());
    instancesByReactID[id] = this;
  },

  componentWillUnmount: function() {
    var rootNode = this.getDOMNode();
    var id = ReactMount.getID(rootNode);
    delete instancesByReactID[id];
  },

  componentDidUpdate: function(prevProps, prevState, prevContext) {
    var rootNode = this.getDOMNode();
    if (this.props.checked != null) {
      DOMPropertyOperations.setValueForProperty(
        rootNode,
        'checked',
        this.props.checked || false
      );
    }

    var value = LinkedValueUtils.getValue(this);
    if (value != null) {
      // Cast `value` to a string to ensure the value is set correctly. While
      // browsers typically do this as necessary, jsdom doesn't.
      DOMPropertyOperations.setValueForProperty(rootNode, 'value', '' + value);
    }
  },

  _handleChange: function(event) {
    var returnValue;
    var onChange = LinkedValueUtils.getOnChange(this);
    if (onChange) {
      returnValue = onChange.call(this, event);
    }
    // Here we use asap to wait until all updates have propagated, which
    // is important when using controlled components within layers:
    // https://github.com/facebook/react/issues/1698
    ReactUpdates.asap(forceUpdateIfMounted, this);

    var name = this.props.name;
    if (this.props.type === 'radio' && name != null) {
      var rootNode = this.getDOMNode();
      var queryRoot = rootNode;

      while (queryRoot.parentNode) {
        queryRoot = queryRoot.parentNode;
      }

      // If `rootNode.form` was non-null, then we could try `form.elements`,
      // but that sometimes behaves strangely in IE8. We could also try using
      // `form.getElementsByName`, but that will only return direct children
      // and won't include inputs that use the HTML5 `form=` attribute. Since
      // the input might not even be in a form, let's just use the global
      // `querySelectorAll` to ensure we don't miss anything.
      var group = queryRoot.querySelectorAll(
        'input[name=' + JSON.stringify('' + name) + '][type="radio"]');

      for (var i = 0, groupLen = group.length; i < groupLen; i++) {
        var otherNode = group[i];
        if (otherNode === rootNode ||
            otherNode.form !== rootNode.form) {
          continue;
        }
        var otherID = ReactMount.getID(otherNode);
        ("production" !== process.env.NODE_ENV ? invariant(
          otherID,
          'ReactDOMInput: Mixing React and non-React radio inputs with the ' +
          'same `name` is not supported.'
        ) : invariant(otherID));
        var otherInstance = instancesByReactID[otherID];
        ("production" !== process.env.NODE_ENV ? invariant(
          otherInstance,
          'ReactDOMInput: Unknown radio button ID %s.',
          otherID
        ) : invariant(otherInstance));
        // If this is a controlled radio button group, forcing the input that
        // was previously checked to update will cause it to be come re-checked
        // as appropriate.
        ReactUpdates.asap(forceUpdateIfMounted, otherInstance);
      }
    }

    return returnValue;
  }

});

module.exports = ReactDOMInput;

}).call(this,require('_process'))
},{"./AutoFocusMixin":12,"./DOMPropertyOperations":21,"./LinkedValueUtils":34,"./Object.assign":37,"./ReactBrowserComponentMixin":40,"./ReactClass":44,"./ReactElement":68,"./ReactMount":81,"./ReactUpdates":98,"./invariant":146,"_process":4}],59:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactDOMOption
 */

'use strict';

var ReactBrowserComponentMixin = require("./ReactBrowserComponentMixin");
var ReactClass = require("./ReactClass");
var ReactElement = require("./ReactElement");

var warning = require("./warning");

var option = ReactElement.createFactory('option');

/**
 * Implements an <option> native component that warns when `selected` is set.
 */
var ReactDOMOption = ReactClass.createClass({
  displayName: 'ReactDOMOption',
  tagName: 'OPTION',

  mixins: [ReactBrowserComponentMixin],

  componentWillMount: function() {
    // TODO (yungsters): Remove support for `selected` in <option>.
    if ("production" !== process.env.NODE_ENV) {
      ("production" !== process.env.NODE_ENV ? warning(
        this.props.selected == null,
        'Use the `defaultValue` or `value` props on <select> instead of ' +
        'setting `selected` on <option>.'
      ) : null);
    }
  },

  render: function() {
    return option(this.props, this.props.children);
  }

});

module.exports = ReactDOMOption;

}).call(this,require('_process'))
},{"./ReactBrowserComponentMixin":40,"./ReactClass":44,"./ReactElement":68,"./warning":165,"_process":4}],60:[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactDOMSelect
 */

'use strict';

var AutoFocusMixin = require("./AutoFocusMixin");
var LinkedValueUtils = require("./LinkedValueUtils");
var ReactBrowserComponentMixin = require("./ReactBrowserComponentMixin");
var ReactClass = require("./ReactClass");
var ReactElement = require("./ReactElement");
var ReactUpdates = require("./ReactUpdates");

var assign = require("./Object.assign");

var select = ReactElement.createFactory('select');

function updateOptionsIfPendingUpdateAndMounted() {
  /*jshint validthis:true */
  if (this._pendingUpdate) {
    this._pendingUpdate = false;
    var value = LinkedValueUtils.getValue(this);
    if (value != null && this.isMounted()) {
      updateOptions(this, value);
    }
  }
}

/**
 * Validation function for `value` and `defaultValue`.
 * @private
 */
function selectValueType(props, propName, componentName) {
  if (props[propName] == null) {
    return null;
  }
  if (props.multiple) {
    if (!Array.isArray(props[propName])) {
      return new Error(
        ("The `" + propName + "` prop supplied to <select> must be an array if ") +
        ("`multiple` is true.")
      );
    }
  } else {
    if (Array.isArray(props[propName])) {
      return new Error(
        ("The `" + propName + "` prop supplied to <select> must be a scalar ") +
        ("value if `multiple` is false.")
      );
    }
  }
}

/**
 * @param {ReactComponent} component Instance of ReactDOMSelect
 * @param {*} propValue A stringable (with `multiple`, a list of stringables).
 * @private
 */
function updateOptions(component, propValue) {
  var selectedValue, i, l;
  var options = component.getDOMNode().options;

  if (component.props.multiple) {
    selectedValue = {};
    for (i = 0, l = propValue.length; i < l; i++) {
      selectedValue['' + propValue[i]] = true;
    }
    for (i = 0, l = options.length; i < l; i++) {
      var selected = selectedValue.hasOwnProperty(options[i].value);
      if (options[i].selected !== selected) {
        options[i].selected = selected;
      }
    }
  } else {
    // Do not set `select.value` as exact behavior isn't consistent across all
    // browsers for all cases.
    selectedValue = '' + propValue;
    for (i = 0, l = options.length; i < l; i++) {
      if (options[i].value === selectedValue) {
        options[i].selected = true;
        return;
      }
    }
    if (options.length) {
      options[0].selected = true;
    }
  }
}

/**
 * Implements a <select> native component that allows optionally setting the
 * props `value` and `defaultValue`. If `multiple` is false, the prop must be a
 * stringable. If `multiple` is true, the prop must be an array of stringables.
 *
 * If `value` is not supplied (or null/undefined), user actions that change the
 * selected option will trigger updates to the rendered options.
 *
 * If it is supplied (and not null/undefined), the rendered options will not
 * update in response to user actions. Instead, the `value` prop must change in
 * order for the rendered options to update.
 *
 * If `defaultValue` is provided, any options with the supplied values will be
 * selected.
 */
var ReactDOMSelect = ReactClass.createClass({
  displayName: 'ReactDOMSelect',
  tagName: 'SELECT',

  mixins: [AutoFocusMixin, LinkedValueUtils.Mixin, ReactBrowserComponentMixin],

  propTypes: {
    defaultValue: selectValueType,
    value: selectValueType
  },

  render: function() {
    // Clone `this.props` so we don't mutate the input.
    var props = assign({}, this.props);

    props.onChange = this._handleChange;
    props.value = null;

    return select(props, this.props.children);
  },

  componentWillMount: function() {
    this._pendingUpdate = false;
  },

  componentDidMount: function() {
    var value = LinkedValueUtils.getValue(this);
    if (value != null) {
      updateOptions(this, value);
    } else if (this.props.defaultValue != null) {
      updateOptions(this, this.props.defaultValue);
    }
  },

  componentDidUpdate: function(prevProps) {
    var value = LinkedValueUtils.getValue(this);
    if (value != null) {
      this._pendingUpdate = false;
      updateOptions(this, value);
    } else if (!prevProps.multiple !== !this.props.multiple) {
      // For simplicity, reapply `defaultValue` if `multiple` is toggled.
      if (this.props.defaultValue != null) {
        updateOptions(this, this.props.defaultValue);
      } else {
        // Revert the select back to its default unselected state.
        updateOptions(this, this.props.multiple ? [] : '');
      }
    }
  },

  _handleChange: function(event) {
    var returnValue;
    var onChange = LinkedValueUtils.getOnChange(this);
    if (onChange) {
      returnValue = onChange.call(this, event);
    }

    this._pendingUpdate = true;
    ReactUpdates.asap(updateOptionsIfPendingUpdateAndMounted, this);
    return returnValue;
  }

});

module.exports = ReactDOMSelect;

},{"./AutoFocusMixin":12,"./LinkedValueUtils":34,"./Object.assign":37,"./ReactBrowserComponentMixin":40,"./ReactClass":44,"./ReactElement":68,"./ReactUpdates":98}],61:[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactDOMSelection
 */

'use strict';

var ExecutionEnvironment = require("./ExecutionEnvironment");

var getNodeForCharacterOffset = require("./getNodeForCharacterOffset");
var getTextContentAccessor = require("./getTextContentAccessor");

/**
 * While `isCollapsed` is available on the Selection object and `collapsed`
 * is available on the Range object, IE11 sometimes gets them wrong.
 * If the anchor/focus nodes and offsets are the same, the range is collapsed.
 */
function isCollapsed(anchorNode, anchorOffset, focusNode, focusOffset) {
  return anchorNode === focusNode && anchorOffset === focusOffset;
}

/**
 * Get the appropriate anchor and focus node/offset pairs for IE.
 *
 * The catch here is that IE's selection API doesn't provide information
 * about whether the selection is forward or backward, so we have to
 * behave as though it's always forward.
 *
 * IE text differs from modern selection in that it behaves as though
 * block elements end with a new line. This means character offsets will
 * differ between the two APIs.
 *
 * @param {DOMElement} node
 * @return {object}
 */
function getIEOffsets(node) {
  var selection = document.selection;
  var selectedRange = selection.createRange();
  var selectedLength = selectedRange.text.length;

  // Duplicate selection so we can move range without breaking user selection.
  var fromStart = selectedRange.duplicate();
  fromStart.moveToElementText(node);
  fromStart.setEndPoint('EndToStart', selectedRange);

  var startOffset = fromStart.text.length;
  var endOffset = startOffset + selectedLength;

  return {
    start: startOffset,
    end: endOffset
  };
}

/**
 * @param {DOMElement} node
 * @return {?object}
 */
function getModernOffsets(node) {
  var selection = window.getSelection && window.getSelection();

  if (!selection || selection.rangeCount === 0) {
    return null;
  }

  var anchorNode = selection.anchorNode;
  var anchorOffset = selection.anchorOffset;
  var focusNode = selection.focusNode;
  var focusOffset = selection.focusOffset;

  var currentRange = selection.getRangeAt(0);

  // If the node and offset values are the same, the selection is collapsed.
  // `Selection.isCollapsed` is available natively, but IE sometimes gets
  // this value wrong.
  var isSelectionCollapsed = isCollapsed(
    selection.anchorNode,
    selection.anchorOffset,
    selection.focusNode,
    selection.focusOffset
  );

  var rangeLength = isSelectionCollapsed ? 0 : currentRange.toString().length;

  var tempRange = currentRange.cloneRange();
  tempRange.selectNodeContents(node);
  tempRange.setEnd(currentRange.startContainer, currentRange.startOffset);

  var isTempRangeCollapsed = isCollapsed(
    tempRange.startContainer,
    tempRange.startOffset,
    tempRange.endContainer,
    tempRange.endOffset
  );

  var start = isTempRangeCollapsed ? 0 : tempRange.toString().length;
  var end = start + rangeLength;

  // Detect whether the selection is backward.
  var detectionRange = document.createRange();
  detectionRange.setStart(anchorNode, anchorOffset);
  detectionRange.setEnd(focusNode, focusOffset);
  var isBackward = detectionRange.collapsed;

  return {
    start: isBackward ? end : start,
    end: isBackward ? start : end
  };
}

/**
 * @param {DOMElement|DOMTextNode} node
 * @param {object} offsets
 */
function setIEOffsets(node, offsets) {
  var range = document.selection.createRange().duplicate();
  var start, end;

  if (typeof offsets.end === 'undefined') {
    start = offsets.start;
    end = start;
  } else if (offsets.start > offsets.end) {
    start = offsets.end;
    end = offsets.start;
  } else {
    start = offsets.start;
    end = offsets.end;
  }

  range.moveToElementText(node);
  range.moveStart('character', start);
  range.setEndPoint('EndToStart', range);
  range.moveEnd('character', end - start);
  range.select();
}

/**
 * In modern non-IE browsers, we can support both forward and backward
 * selections.
 *
 * Note: IE10+ supports the Selection object, but it does not support
 * the `extend` method, which means that even in modern IE, it's not possible
 * to programatically create a backward selection. Thus, for all IE
 * versions, we use the old IE API to create our selections.
 *
 * @param {DOMElement|DOMTextNode} node
 * @param {object} offsets
 */
function setModernOffsets(node, offsets) {
  if (!window.getSelection) {
    return;
  }

  var selection = window.getSelection();
  var length = node[getTextContentAccessor()].length;
  var start = Math.min(offsets.start, length);
  var end = typeof offsets.end === 'undefined' ?
            start : Math.min(offsets.end, length);

  // IE 11 uses modern selection, but doesn't support the extend method.
  // Flip backward selections, so we can set with a single range.
  if (!selection.extend && start > end) {
    var temp = end;
    end = start;
    start = temp;
  }

  var startMarker = getNodeForCharacterOffset(node, start);
  var endMarker = getNodeForCharacterOffset(node, end);

  if (startMarker && endMarker) {
    var range = document.createRange();
    range.setStart(startMarker.node, startMarker.offset);
    selection.removeAllRanges();

    if (start > end) {
      selection.addRange(range);
      selection.extend(endMarker.node, endMarker.offset);
    } else {
      range.setEnd(endMarker.node, endMarker.offset);
      selection.addRange(range);
    }
  }
}

var useIEOffsets = (
  ExecutionEnvironment.canUseDOM &&
  'selection' in document &&
  !('getSelection' in window)
);

var ReactDOMSelection = {
  /**
   * @param {DOMElement} node
   */
  getOffsets: useIEOffsets ? getIEOffsets : getModernOffsets,

  /**
   * @param {DOMElement|DOMTextNode} node
   * @param {object} offsets
   */
  setOffsets: useIEOffsets ? setIEOffsets : setModernOffsets
};

module.exports = ReactDOMSelection;

},{"./ExecutionEnvironment":31,"./getNodeForCharacterOffset":139,"./getTextContentAccessor":141}],62:[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactDOMTextComponent
 * @typechecks static-only
 */

'use strict';

var DOMPropertyOperations = require("./DOMPropertyOperations");
var ReactComponentBrowserEnvironment =
  require("./ReactComponentBrowserEnvironment");
var ReactDOMComponent = require("./ReactDOMComponent");

var assign = require("./Object.assign");
var escapeTextContentForBrowser = require("./escapeTextContentForBrowser");

/**
 * Text nodes violate a couple assumptions that React makes about components:
 *
 *  - When mounting text into the DOM, adjacent text nodes are merged.
 *  - Text nodes cannot be assigned a React root ID.
 *
 * This component is used to wrap strings in elements so that they can undergo
 * the same reconciliation that is applied to elements.
 *
 * TODO: Investigate representing React components in the DOM with text nodes.
 *
 * @class ReactDOMTextComponent
 * @extends ReactComponent
 * @internal
 */
var ReactDOMTextComponent = function(props) {
  // This constructor and its argument is currently used by mocks.
};

assign(ReactDOMTextComponent.prototype, {

  /**
   * @param {ReactText} text
   * @internal
   */
  construct: function(text) {
    // TODO: This is really a ReactText (ReactNode), not a ReactElement
    this._currentElement = text;
    this._stringText = '' + text;

    // Properties
    this._rootNodeID = null;
    this._mountIndex = 0;
  },

  /**
   * Creates the markup for this text node. This node is not intended to have
   * any features besides containing text content.
   *
   * @param {string} rootID DOM ID of the root node.
   * @param {ReactReconcileTransaction|ReactServerRenderingTransaction} transaction
   * @return {string} Markup for this text node.
   * @internal
   */
  mountComponent: function(rootID, transaction, context) {
    this._rootNodeID = rootID;
    var escapedText = escapeTextContentForBrowser(this._stringText);

    if (transaction.renderToStaticMarkup) {
      // Normally we'd wrap this in a `span` for the reasons stated above, but
      // since this is a situation where React won't take over (static pages),
      // we can simply return the text as it is.
      return escapedText;
    }

    return (
      '<span ' + DOMPropertyOperations.createMarkupForID(rootID) + '>' +
        escapedText +
      '</span>'
    );
  },

  /**
   * Updates this component by updating the text content.
   *
   * @param {ReactText} nextText The next text content
   * @param {ReactReconcileTransaction} transaction
   * @internal
   */
  receiveComponent: function(nextText, transaction) {
    if (nextText !== this._currentElement) {
      this._currentElement = nextText;
      var nextStringText = '' + nextText;
      if (nextStringText !== this._stringText) {
        // TODO: Save this as pending props and use performUpdateIfNecessary
        // and/or updateComponent to do the actual update for consistency with
        // other component types?
        this._stringText = nextStringText;
        ReactDOMComponent.BackendIDOperations.updateTextContentByID(
          this._rootNodeID,
          nextStringText
        );
      }
    }
  },

  unmountComponent: function() {
    ReactComponentBrowserEnvironment.unmountIDFromEnvironment(this._rootNodeID);
  }

});

module.exports = ReactDOMTextComponent;

},{"./DOMPropertyOperations":21,"./Object.assign":37,"./ReactComponentBrowserEnvironment":46,"./ReactDOMComponent":53,"./escapeTextContentForBrowser":127}],63:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactDOMTextarea
 */

'use strict';

var AutoFocusMixin = require("./AutoFocusMixin");
var DOMPropertyOperations = require("./DOMPropertyOperations");
var LinkedValueUtils = require("./LinkedValueUtils");
var ReactBrowserComponentMixin = require("./ReactBrowserComponentMixin");
var ReactClass = require("./ReactClass");
var ReactElement = require("./ReactElement");
var ReactUpdates = require("./ReactUpdates");

var assign = require("./Object.assign");
var invariant = require("./invariant");

var warning = require("./warning");

var textarea = ReactElement.createFactory('textarea');

function forceUpdateIfMounted() {
  /*jshint validthis:true */
  if (this.isMounted()) {
    this.forceUpdate();
  }
}

/**
 * Implements a <textarea> native component that allows setting `value`, and
 * `defaultValue`. This differs from the traditional DOM API because value is
 * usually set as PCDATA children.
 *
 * If `value` is not supplied (or null/undefined), user actions that affect the
 * value will trigger updates to the element.
 *
 * If `value` is supplied (and not null/undefined), the rendered element will
 * not trigger updates to the element. Instead, the `value` prop must change in
 * order for the rendered element to be updated.
 *
 * The rendered element will be initialized with an empty value, the prop
 * `defaultValue` if specified, or the children content (deprecated).
 */
var ReactDOMTextarea = ReactClass.createClass({
  displayName: 'ReactDOMTextarea',
  tagName: 'TEXTAREA',

  mixins: [AutoFocusMixin, LinkedValueUtils.Mixin, ReactBrowserComponentMixin],

  getInitialState: function() {
    var defaultValue = this.props.defaultValue;
    // TODO (yungsters): Remove support for children content in <textarea>.
    var children = this.props.children;
    if (children != null) {
      if ("production" !== process.env.NODE_ENV) {
        ("production" !== process.env.NODE_ENV ? warning(
          false,
          'Use the `defaultValue` or `value` props instead of setting ' +
          'children on <textarea>.'
        ) : null);
      }
      ("production" !== process.env.NODE_ENV ? invariant(
        defaultValue == null,
        'If you supply `defaultValue` on a <textarea>, do not pass children.'
      ) : invariant(defaultValue == null));
      if (Array.isArray(children)) {
        ("production" !== process.env.NODE_ENV ? invariant(
          children.length <= 1,
          '<textarea> can only have at most one child.'
        ) : invariant(children.length <= 1));
        children = children[0];
      }

      defaultValue = '' + children;
    }
    if (defaultValue == null) {
      defaultValue = '';
    }
    var value = LinkedValueUtils.getValue(this);
    return {
      // We save the initial value so that `ReactDOMComponent` doesn't update
      // `textContent` (unnecessary since we update value).
      // The initial value can be a boolean or object so that's why it's
      // forced to be a string.
      initialValue: '' + (value != null ? value : defaultValue)
    };
  },

  render: function() {
    // Clone `this.props` so we don't mutate the input.
    var props = assign({}, this.props);

    ("production" !== process.env.NODE_ENV ? invariant(
      props.dangerouslySetInnerHTML == null,
      '`dangerouslySetInnerHTML` does not make sense on <textarea>.'
    ) : invariant(props.dangerouslySetInnerHTML == null));

    props.defaultValue = null;
    props.value = null;
    props.onChange = this._handleChange;

    // Always set children to the same thing. In IE9, the selection range will
    // get reset if `textContent` is mutated.
    return textarea(props, this.state.initialValue);
  },

  componentDidUpdate: function(prevProps, prevState, prevContext) {
    var value = LinkedValueUtils.getValue(this);
    if (value != null) {
      var rootNode = this.getDOMNode();
      // Cast `value` to a string to ensure the value is set correctly. While
      // browsers typically do this as necessary, jsdom doesn't.
      DOMPropertyOperations.setValueForProperty(rootNode, 'value', '' + value);
    }
  },

  _handleChange: function(event) {
    var returnValue;
    var onChange = LinkedValueUtils.getOnChange(this);
    if (onChange) {
      returnValue = onChange.call(this, event);
    }
    ReactUpdates.asap(forceUpdateIfMounted, this);
    return returnValue;
  }

});

module.exports = ReactDOMTextarea;

}).call(this,require('_process'))
},{"./AutoFocusMixin":12,"./DOMPropertyOperations":21,"./LinkedValueUtils":34,"./Object.assign":37,"./ReactBrowserComponentMixin":40,"./ReactClass":44,"./ReactElement":68,"./ReactUpdates":98,"./invariant":146,"./warning":165,"_process":4}],64:[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactDefaultBatchingStrategy
 */

'use strict';

var ReactUpdates = require("./ReactUpdates");
var Transaction = require("./Transaction");

var assign = require("./Object.assign");
var emptyFunction = require("./emptyFunction");

var RESET_BATCHED_UPDATES = {
  initialize: emptyFunction,
  close: function() {
    ReactDefaultBatchingStrategy.isBatchingUpdates = false;
  }
};

var FLUSH_BATCHED_UPDATES = {
  initialize: emptyFunction,
  close: ReactUpdates.flushBatchedUpdates.bind(ReactUpdates)
};

var TRANSACTION_WRAPPERS = [FLUSH_BATCHED_UPDATES, RESET_BATCHED_UPDATES];

function ReactDefaultBatchingStrategyTransaction() {
  this.reinitializeTransaction();
}

assign(
  ReactDefaultBatchingStrategyTransaction.prototype,
  Transaction.Mixin,
  {
    getTransactionWrappers: function() {
      return TRANSACTION_WRAPPERS;
    }
  }
);

var transaction = new ReactDefaultBatchingStrategyTransaction();

var ReactDefaultBatchingStrategy = {
  isBatchingUpdates: false,

  /**
   * Call the provided function in a context within which calls to `setState`
   * and friends are batched such that components aren't updated unnecessarily.
   */
  batchedUpdates: function(callback, a, b, c, d) {
    var alreadyBatchingUpdates = ReactDefaultBatchingStrategy.isBatchingUpdates;

    ReactDefaultBatchingStrategy.isBatchingUpdates = true;

    // The code is written this way to avoid extra allocations
    if (alreadyBatchingUpdates) {
      callback(a, b, c, d);
    } else {
      transaction.perform(callback, null, a, b, c, d);
    }
  }
};

module.exports = ReactDefaultBatchingStrategy;

},{"./Object.assign":37,"./ReactUpdates":98,"./Transaction":114,"./emptyFunction":125}],65:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactDefaultInjection
 */

'use strict';

var BeforeInputEventPlugin = require("./BeforeInputEventPlugin");
var ChangeEventPlugin = require("./ChangeEventPlugin");
var ClientReactRootIndex = require("./ClientReactRootIndex");
var DefaultEventPluginOrder = require("./DefaultEventPluginOrder");
var EnterLeaveEventPlugin = require("./EnterLeaveEventPlugin");
var ExecutionEnvironment = require("./ExecutionEnvironment");
var HTMLDOMPropertyConfig = require("./HTMLDOMPropertyConfig");
var MobileSafariClickEventPlugin = require("./MobileSafariClickEventPlugin");
var ReactBrowserComponentMixin = require("./ReactBrowserComponentMixin");
var ReactClass = require("./ReactClass");
var ReactComponentBrowserEnvironment =
  require("./ReactComponentBrowserEnvironment");
var ReactDefaultBatchingStrategy = require("./ReactDefaultBatchingStrategy");
var ReactDOMComponent = require("./ReactDOMComponent");
var ReactDOMButton = require("./ReactDOMButton");
var ReactDOMForm = require("./ReactDOMForm");
var ReactDOMImg = require("./ReactDOMImg");
var ReactDOMIDOperations = require("./ReactDOMIDOperations");
var ReactDOMIframe = require("./ReactDOMIframe");
var ReactDOMInput = require("./ReactDOMInput");
var ReactDOMOption = require("./ReactDOMOption");
var ReactDOMSelect = require("./ReactDOMSelect");
var ReactDOMTextarea = require("./ReactDOMTextarea");
var ReactDOMTextComponent = require("./ReactDOMTextComponent");
var ReactElement = require("./ReactElement");
var ReactEventListener = require("./ReactEventListener");
var ReactInjection = require("./ReactInjection");
var ReactInstanceHandles = require("./ReactInstanceHandles");
var ReactMount = require("./ReactMount");
var ReactReconcileTransaction = require("./ReactReconcileTransaction");
var SelectEventPlugin = require("./SelectEventPlugin");
var ServerReactRootIndex = require("./ServerReactRootIndex");
var SimpleEventPlugin = require("./SimpleEventPlugin");
var SVGDOMPropertyConfig = require("./SVGDOMPropertyConfig");

var createFullPageComponent = require("./createFullPageComponent");

function autoGenerateWrapperClass(type) {
  return ReactClass.createClass({
    tagName: type.toUpperCase(),
    render: function() {
      return new ReactElement(
        type,
        null,
        null,
        null,
        null,
        this.props
      );
    }
  });
}

function inject() {
  ReactInjection.EventEmitter.injectReactEventListener(
    ReactEventListener
  );

  /**
   * Inject modules for resolving DOM hierarchy and plugin ordering.
   */
  ReactInjection.EventPluginHub.injectEventPluginOrder(DefaultEventPluginOrder);
  ReactInjection.EventPluginHub.injectInstanceHandle(ReactInstanceHandles);
  ReactInjection.EventPluginHub.injectMount(ReactMount);

  /**
   * Some important event plugins included by default (without having to require
   * them).
   */
  ReactInjection.EventPluginHub.injectEventPluginsByName({
    SimpleEventPlugin: SimpleEventPlugin,
    EnterLeaveEventPlugin: EnterLeaveEventPlugin,
    ChangeEventPlugin: ChangeEventPlugin,
    MobileSafariClickEventPlugin: MobileSafariClickEventPlugin,
    SelectEventPlugin: SelectEventPlugin,
    BeforeInputEventPlugin: BeforeInputEventPlugin
  });

  ReactInjection.NativeComponent.injectGenericComponentClass(
    ReactDOMComponent
  );

  ReactInjection.NativeComponent.injectTextComponentClass(
    ReactDOMTextComponent
  );

  ReactInjection.NativeComponent.injectAutoWrapper(
    autoGenerateWrapperClass
  );

  // This needs to happen before createFullPageComponent() otherwise the mixin
  // won't be included.
  ReactInjection.Class.injectMixin(ReactBrowserComponentMixin);

  ReactInjection.NativeComponent.injectComponentClasses({
    'button': ReactDOMButton,
    'form': ReactDOMForm,
    'iframe': ReactDOMIframe,
    'img': ReactDOMImg,
    'input': ReactDOMInput,
    'option': ReactDOMOption,
    'select': ReactDOMSelect,
    'textarea': ReactDOMTextarea,

    'html': createFullPageComponent('html'),
    'head': createFullPageComponent('head'),
    'body': createFullPageComponent('body')
  });

  ReactInjection.DOMProperty.injectDOMPropertyConfig(HTMLDOMPropertyConfig);
  ReactInjection.DOMProperty.injectDOMPropertyConfig(SVGDOMPropertyConfig);

  ReactInjection.EmptyComponent.injectEmptyComponent('noscript');

  ReactInjection.Updates.injectReconcileTransaction(
    ReactReconcileTransaction
  );
  ReactInjection.Updates.injectBatchingStrategy(
    ReactDefaultBatchingStrategy
  );

  ReactInjection.RootIndex.injectCreateReactRootIndex(
    ExecutionEnvironment.canUseDOM ?
      ClientReactRootIndex.createReactRootIndex :
      ServerReactRootIndex.createReactRootIndex
  );

  ReactInjection.Component.injectEnvironment(ReactComponentBrowserEnvironment);
  ReactInjection.DOMComponent.injectIDOperations(ReactDOMIDOperations);

  if ("production" !== process.env.NODE_ENV) {
    var url = (ExecutionEnvironment.canUseDOM && window.location.href) || '';
    if ((/[?&]react_perf\b/).test(url)) {
      var ReactDefaultPerf = require("./ReactDefaultPerf");
      ReactDefaultPerf.start();
    }
  }
}

module.exports = {
  inject: inject
};

}).call(this,require('_process'))
},{"./BeforeInputEventPlugin":13,"./ChangeEventPlugin":17,"./ClientReactRootIndex":18,"./DefaultEventPluginOrder":23,"./EnterLeaveEventPlugin":24,"./ExecutionEnvironment":31,"./HTMLDOMPropertyConfig":33,"./MobileSafariClickEventPlugin":36,"./ReactBrowserComponentMixin":40,"./ReactClass":44,"./ReactComponentBrowserEnvironment":46,"./ReactDOMButton":52,"./ReactDOMComponent":53,"./ReactDOMForm":54,"./ReactDOMIDOperations":55,"./ReactDOMIframe":56,"./ReactDOMImg":57,"./ReactDOMInput":58,"./ReactDOMOption":59,"./ReactDOMSelect":60,"./ReactDOMTextComponent":62,"./ReactDOMTextarea":63,"./ReactDefaultBatchingStrategy":64,"./ReactDefaultPerf":66,"./ReactElement":68,"./ReactEventListener":73,"./ReactInjection":75,"./ReactInstanceHandles":77,"./ReactMount":81,"./ReactReconcileTransaction":91,"./SVGDOMPropertyConfig":99,"./SelectEventPlugin":100,"./ServerReactRootIndex":101,"./SimpleEventPlugin":102,"./createFullPageComponent":122,"_process":4}],66:[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactDefaultPerf
 * @typechecks static-only
 */

'use strict';

var DOMProperty = require("./DOMProperty");
var ReactDefaultPerfAnalysis = require("./ReactDefaultPerfAnalysis");
var ReactMount = require("./ReactMount");
var ReactPerf = require("./ReactPerf");

var performanceNow = require("./performanceNow");

function roundFloat(val) {
  return Math.floor(val * 100) / 100;
}

function addValue(obj, key, val) {
  obj[key] = (obj[key] || 0) + val;
}

var ReactDefaultPerf = {
  _allMeasurements: [], // last item in the list is the current one
  _mountStack: [0],
  _injected: false,

  start: function() {
    if (!ReactDefaultPerf._injected) {
      ReactPerf.injection.injectMeasure(ReactDefaultPerf.measure);
    }

    ReactDefaultPerf._allMeasurements.length = 0;
    ReactPerf.enableMeasure = true;
  },

  stop: function() {
    ReactPerf.enableMeasure = false;
  },

  getLastMeasurements: function() {
    return ReactDefaultPerf._allMeasurements;
  },

  printExclusive: function(measurements) {
    measurements = measurements || ReactDefaultPerf._allMeasurements;
    var summary = ReactDefaultPerfAnalysis.getExclusiveSummary(measurements);
    console.table(summary.map(function(item) {
      return {
        'Component class name': item.componentName,
        'Total inclusive time (ms)': roundFloat(item.inclusive),
        'Exclusive mount time (ms)': roundFloat(item.exclusive),
        'Exclusive render time (ms)': roundFloat(item.render),
        'Mount time per instance (ms)': roundFloat(item.exclusive / item.count),
        'Render time per instance (ms)': roundFloat(item.render / item.count),
        'Instances': item.count
      };
    }));
    // TODO: ReactDefaultPerfAnalysis.getTotalTime() does not return the correct
    // number.
  },

  printInclusive: function(measurements) {
    measurements = measurements || ReactDefaultPerf._allMeasurements;
    var summary = ReactDefaultPerfAnalysis.getInclusiveSummary(measurements);
    console.table(summary.map(function(item) {
      return {
        'Owner > component': item.componentName,
        'Inclusive time (ms)': roundFloat(item.time),
        'Instances': item.count
      };
    }));
    console.log(
      'Total time:',
      ReactDefaultPerfAnalysis.getTotalTime(measurements).toFixed(2) + ' ms'
    );
  },

  getMeasurementsSummaryMap: function(measurements) {
    var summary = ReactDefaultPerfAnalysis.getInclusiveSummary(
      measurements,
      true
    );
    return summary.map(function(item) {
      return {
        'Owner > component': item.componentName,
        'Wasted time (ms)': item.time,
        'Instances': item.count
      };
    });
  },

  printWasted: function(measurements) {
    measurements = measurements || ReactDefaultPerf._allMeasurements;
    console.table(ReactDefaultPerf.getMeasurementsSummaryMap(measurements));
    console.log(
      'Total time:',
      ReactDefaultPerfAnalysis.getTotalTime(measurements).toFixed(2) + ' ms'
    );
  },

  printDOM: function(measurements) {
    measurements = measurements || ReactDefaultPerf._allMeasurements;
    var summary = ReactDefaultPerfAnalysis.getDOMSummary(measurements);
    console.table(summary.map(function(item) {
      var result = {};
      result[DOMProperty.ID_ATTRIBUTE_NAME] = item.id;
      result['type'] = item.type;
      result['args'] = JSON.stringify(item.args);
      return result;
    }));
    console.log(
      'Total time:',
      ReactDefaultPerfAnalysis.getTotalTime(measurements).toFixed(2) + ' ms'
    );
  },

  _recordWrite: function(id, fnName, totalTime, args) {
    // TODO: totalTime isn't that useful since it doesn't count paints/reflows
    var writes =
      ReactDefaultPerf
        ._allMeasurements[ReactDefaultPerf._allMeasurements.length - 1]
        .writes;
    writes[id] = writes[id] || [];
    writes[id].push({
      type: fnName,
      time: totalTime,
      args: args
    });
  },

  measure: function(moduleName, fnName, func) {
    return function() {for (var args=[],$__0=0,$__1=arguments.length;$__0<$__1;$__0++) args.push(arguments[$__0]);
      var totalTime;
      var rv;
      var start;

      if (fnName === '_renderNewRootComponent' ||
          fnName === 'flushBatchedUpdates') {
        // A "measurement" is a set of metrics recorded for each flush. We want
        // to group the metrics for a given flush together so we can look at the
        // components that rendered and the DOM operations that actually
        // happened to determine the amount of "wasted work" performed.
        ReactDefaultPerf._allMeasurements.push({
          exclusive: {},
          inclusive: {},
          render: {},
          counts: {},
          writes: {},
          displayNames: {},
          totalTime: 0
        });
        start = performanceNow();
        rv = func.apply(this, args);
        ReactDefaultPerf._allMeasurements[
          ReactDefaultPerf._allMeasurements.length - 1
        ].totalTime = performanceNow() - start;
        return rv;
      } else if (fnName === '_mountImageIntoNode' ||
          moduleName === 'ReactDOMIDOperations') {
        start = performanceNow();
        rv = func.apply(this, args);
        totalTime = performanceNow() - start;

        if (fnName === '_mountImageIntoNode') {
          var mountID = ReactMount.getID(args[1]);
          ReactDefaultPerf._recordWrite(mountID, fnName, totalTime, args[0]);
        } else if (fnName === 'dangerouslyProcessChildrenUpdates') {
          // special format
          args[0].forEach(function(update) {
            var writeArgs = {};
            if (update.fromIndex !== null) {
              writeArgs.fromIndex = update.fromIndex;
            }
            if (update.toIndex !== null) {
              writeArgs.toIndex = update.toIndex;
            }
            if (update.textContent !== null) {
              writeArgs.textContent = update.textContent;
            }
            if (update.markupIndex !== null) {
              writeArgs.markup = args[1][update.markupIndex];
            }
            ReactDefaultPerf._recordWrite(
              update.parentID,
              update.type,
              totalTime,
              writeArgs
            );
          });
        } else {
          // basic format
          ReactDefaultPerf._recordWrite(
            args[0],
            fnName,
            totalTime,
            Array.prototype.slice.call(args, 1)
          );
        }
        return rv;
      } else if (moduleName === 'ReactCompositeComponent' && (
        (// TODO: receiveComponent()?
        (fnName === 'mountComponent' ||
        fnName === 'updateComponent' || fnName === '_renderValidatedComponent')))) {

        if (typeof this._currentElement.type === 'string') {
          return func.apply(this, args);
        }

        var rootNodeID = fnName === 'mountComponent' ?
          args[0] :
          this._rootNodeID;
        var isRender = fnName === '_renderValidatedComponent';
        var isMount = fnName === 'mountComponent';

        var mountStack = ReactDefaultPerf._mountStack;
        var entry = ReactDefaultPerf._allMeasurements[
          ReactDefaultPerf._allMeasurements.length - 1
        ];

        if (isRender) {
          addValue(entry.counts, rootNodeID, 1);
        } else if (isMount) {
          mountStack.push(0);
        }

        start = performanceNow();
        rv = func.apply(this, args);
        totalTime = performanceNow() - start;

        if (isRender) {
          addValue(entry.render, rootNodeID, totalTime);
        } else if (isMount) {
          var subMountTime = mountStack.pop();
          mountStack[mountStack.length - 1] += totalTime;
          addValue(entry.exclusive, rootNodeID, totalTime - subMountTime);
          addValue(entry.inclusive, rootNodeID, totalTime);
        } else {
          addValue(entry.inclusive, rootNodeID, totalTime);
        }

        entry.displayNames[rootNodeID] = {
          current: this.getName(),
          owner: this._currentElement._owner ?
            this._currentElement._owner.getName() :
            '<root>'
        };

        return rv;
      } else {
        return func.apply(this, args);
      }
    };
  }
};

module.exports = ReactDefaultPerf;

},{"./DOMProperty":20,"./ReactDefaultPerfAnalysis":67,"./ReactMount":81,"./ReactPerf":86,"./performanceNow":157}],67:[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactDefaultPerfAnalysis
 */

var assign = require("./Object.assign");

// Don't try to save users less than 1.2ms (a number I made up)
var DONT_CARE_THRESHOLD = 1.2;
var DOM_OPERATION_TYPES = {
  '_mountImageIntoNode': 'set innerHTML',
  INSERT_MARKUP: 'set innerHTML',
  MOVE_EXISTING: 'move',
  REMOVE_NODE: 'remove',
  TEXT_CONTENT: 'set textContent',
  'updatePropertyByID': 'update attribute',
  'deletePropertyByID': 'delete attribute',
  'updateStylesByID': 'update styles',
  'updateInnerHTMLByID': 'set innerHTML',
  'dangerouslyReplaceNodeWithMarkupByID': 'replace'
};

function getTotalTime(measurements) {
  // TODO: return number of DOM ops? could be misleading.
  // TODO: measure dropped frames after reconcile?
  // TODO: log total time of each reconcile and the top-level component
  // class that triggered it.
  var totalTime = 0;
  for (var i = 0; i < measurements.length; i++) {
    var measurement = measurements[i];
    totalTime += measurement.totalTime;
  }
  return totalTime;
}

function getDOMSummary(measurements) {
  var items = [];
  for (var i = 0; i < measurements.length; i++) {
    var measurement = measurements[i];
    var id;

    for (id in measurement.writes) {
      measurement.writes[id].forEach(function(write) {
        items.push({
          id: id,
          type: DOM_OPERATION_TYPES[write.type] || write.type,
          args: write.args
        });
      });
    }
  }
  return items;
}

function getExclusiveSummary(measurements) {
  var candidates = {};
  var displayName;

  for (var i = 0; i < measurements.length; i++) {
    var measurement = measurements[i];
    var allIDs = assign(
      {},
      measurement.exclusive,
      measurement.inclusive
    );

    for (var id in allIDs) {
      displayName = measurement.displayNames[id].current;

      candidates[displayName] = candidates[displayName] || {
        componentName: displayName,
        inclusive: 0,
        exclusive: 0,
        render: 0,
        count: 0
      };
      if (measurement.render[id]) {
        candidates[displayName].render += measurement.render[id];
      }
      if (measurement.exclusive[id]) {
        candidates[displayName].exclusive += measurement.exclusive[id];
      }
      if (measurement.inclusive[id]) {
        candidates[displayName].inclusive += measurement.inclusive[id];
      }
      if (measurement.counts[id]) {
        candidates[displayName].count += measurement.counts[id];
      }
    }
  }

  // Now make a sorted array with the results.
  var arr = [];
  for (displayName in candidates) {
    if (candidates[displayName].exclusive >= DONT_CARE_THRESHOLD) {
      arr.push(candidates[displayName]);
    }
  }

  arr.sort(function(a, b) {
    return b.exclusive - a.exclusive;
  });

  return arr;
}

function getInclusiveSummary(measurements, onlyClean) {
  var candidates = {};
  var inclusiveKey;

  for (var i = 0; i < measurements.length; i++) {
    var measurement = measurements[i];
    var allIDs = assign(
      {},
      measurement.exclusive,
      measurement.inclusive
    );
    var cleanComponents;

    if (onlyClean) {
      cleanComponents = getUnchangedComponents(measurement);
    }

    for (var id in allIDs) {
      if (onlyClean && !cleanComponents[id]) {
        continue;
      }

      var displayName = measurement.displayNames[id];

      // Inclusive time is not useful for many components without knowing where
      // they are instantiated. So we aggregate inclusive time with both the
      // owner and current displayName as the key.
      inclusiveKey = displayName.owner + ' > ' + displayName.current;

      candidates[inclusiveKey] = candidates[inclusiveKey] || {
        componentName: inclusiveKey,
        time: 0,
        count: 0
      };

      if (measurement.inclusive[id]) {
        candidates[inclusiveKey].time += measurement.inclusive[id];
      }
      if (measurement.counts[id]) {
        candidates[inclusiveKey].count += measurement.counts[id];
      }
    }
  }

  // Now make a sorted array with the results.
  var arr = [];
  for (inclusiveKey in candidates) {
    if (candidates[inclusiveKey].time >= DONT_CARE_THRESHOLD) {
      arr.push(candidates[inclusiveKey]);
    }
  }

  arr.sort(function(a, b) {
    return b.time - a.time;
  });

  return arr;
}

function getUnchangedComponents(measurement) {
  // For a given reconcile, look at which components did not actually
  // render anything to the DOM and return a mapping of their ID to
  // the amount of time it took to render the entire subtree.
  var cleanComponents = {};
  var dirtyLeafIDs = Object.keys(measurement.writes);
  var allIDs = assign({}, measurement.exclusive, measurement.inclusive);

  for (var id in allIDs) {
    var isDirty = false;
    // For each component that rendered, see if a component that triggered
    // a DOM op is in its subtree.
    for (var i = 0; i < dirtyLeafIDs.length; i++) {
      if (dirtyLeafIDs[i].indexOf(id) === 0) {
        isDirty = true;
        break;
      }
    }
    if (!isDirty && measurement.counts[id] > 0) {
      cleanComponents[id] = true;
    }
  }
  return cleanComponents;
}

var ReactDefaultPerfAnalysis = {
  getExclusiveSummary: getExclusiveSummary,
  getInclusiveSummary: getInclusiveSummary,
  getDOMSummary: getDOMSummary,
  getTotalTime: getTotalTime
};

module.exports = ReactDefaultPerfAnalysis;

},{"./Object.assign":37}],68:[function(require,module,exports){
(function (process){
/**
 * Copyright 2014-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactElement
 */

'use strict';

var ReactContext = require("./ReactContext");
var ReactCurrentOwner = require("./ReactCurrentOwner");

var assign = require("./Object.assign");
var warning = require("./warning");

var RESERVED_PROPS = {
  key: true,
  ref: true
};

/**
 * Warn for mutations.
 *
 * @internal
 * @param {object} object
 * @param {string} key
 */
function defineWarningProperty(object, key) {
  Object.defineProperty(object, key, {

    configurable: false,
    enumerable: true,

    get: function() {
      if (!this._store) {
        return null;
      }
      return this._store[key];
    },

    set: function(value) {
      ("production" !== process.env.NODE_ENV ? warning(
        false,
        'Don\'t set the %s property of the React element. Instead, ' +
        'specify the correct value when initially creating the element.',
        key
      ) : null);
      this._store[key] = value;
    }

  });
}

/**
 * This is updated to true if the membrane is successfully created.
 */
var useMutationMembrane = false;

/**
 * Warn for mutations.
 *
 * @internal
 * @param {object} element
 */
function defineMutationMembrane(prototype) {
  try {
    var pseudoFrozenProperties = {
      props: true
    };
    for (var key in pseudoFrozenProperties) {
      defineWarningProperty(prototype, key);
    }
    useMutationMembrane = true;
  } catch (x) {
    // IE will fail on defineProperty
  }
}

/**
 * Base constructor for all React elements. This is only used to make this
 * work with a dynamic instanceof check. Nothing should live on this prototype.
 *
 * @param {*} type
 * @param {string|object} ref
 * @param {*} key
 * @param {*} props
 * @internal
 */
var ReactElement = function(type, key, ref, owner, context, props) {
  // Built-in properties that belong on the element
  this.type = type;
  this.key = key;
  this.ref = ref;

  // Record the component responsible for creating this element.
  this._owner = owner;

  // TODO: Deprecate withContext, and then the context becomes accessible
  // through the owner.
  this._context = context;

  if ("production" !== process.env.NODE_ENV) {
    // The validation flag and props are currently mutative. We put them on
    // an external backing store so that we can freeze the whole object.
    // This can be replaced with a WeakMap once they are implemented in
    // commonly used development environments.
    this._store = {props: props, originalProps: assign({}, props)};

    // To make comparing ReactElements easier for testing purposes, we make
    // the validation flag non-enumerable (where possible, which should
    // include every environment we run tests in), so the test framework
    // ignores it.
    try {
      Object.defineProperty(this._store, 'validated', {
        configurable: false,
        enumerable: false,
        writable: true
      });
    } catch (x) {
    }
    this._store.validated = false;

    // We're not allowed to set props directly on the object so we early
    // return and rely on the prototype membrane to forward to the backing
    // store.
    if (useMutationMembrane) {
      Object.freeze(this);
      return;
    }
  }

  this.props = props;
};

// We intentionally don't expose the function on the constructor property.
// ReactElement should be indistinguishable from a plain object.
ReactElement.prototype = {
  _isReactElement: true
};

if ("production" !== process.env.NODE_ENV) {
  defineMutationMembrane(ReactElement.prototype);
}

ReactElement.createElement = function(type, config, children) {
  var propName;

  // Reserved names are extracted
  var props = {};

  var key = null;
  var ref = null;

  if (config != null) {
    ref = config.ref === undefined ? null : config.ref;
    key = config.key === undefined ? null : '' + config.key;
    // Remaining properties are added to a new props object
    for (propName in config) {
      if (config.hasOwnProperty(propName) &&
          !RESERVED_PROPS.hasOwnProperty(propName)) {
        props[propName] = config[propName];
      }
    }
  }

  // Children can be more than one argument, and those are transferred onto
  // the newly allocated props object.
  var childrenLength = arguments.length - 2;
  if (childrenLength === 1) {
    props.children = children;
  } else if (childrenLength > 1) {
    var childArray = Array(childrenLength);
    for (var i = 0; i < childrenLength; i++) {
      childArray[i] = arguments[i + 2];
    }
    props.children = childArray;
  }

  // Resolve default props
  if (type && type.defaultProps) {
    var defaultProps = type.defaultProps;
    for (propName in defaultProps) {
      if (typeof props[propName] === 'undefined') {
        props[propName] = defaultProps[propName];
      }
    }
  }

  return new ReactElement(
    type,
    key,
    ref,
    ReactCurrentOwner.current,
    ReactContext.current,
    props
  );
};

ReactElement.createFactory = function(type) {
  var factory = ReactElement.createElement.bind(null, type);
  // Expose the type on the factory and the prototype so that it can be
  // easily accessed on elements. E.g. <Foo />.type === Foo.type.
  // This should not be named `constructor` since this may not be the function
  // that created the element, and it may not even be a constructor.
  // Legacy hook TODO: Warn if this is accessed
  factory.type = type;
  return factory;
};

ReactElement.cloneAndReplaceProps = function(oldElement, newProps) {
  var newElement = new ReactElement(
    oldElement.type,
    oldElement.key,
    oldElement.ref,
    oldElement._owner,
    oldElement._context,
    newProps
  );

  if ("production" !== process.env.NODE_ENV) {
    // If the key on the original is valid, then the clone is valid
    newElement._store.validated = oldElement._store.validated;
  }
  return newElement;
};

ReactElement.cloneElement = function(element, config, children) {
  var propName;

  // Original props are copied
  var props = assign({}, element.props);

  // Reserved names are extracted
  var key = element.key;
  var ref = element.ref;

  // Owner will be preserved, unless ref is overridden
  var owner = element._owner;

  if (config != null) {
    if (config.ref !== undefined) {
      // Silently steal the ref from the parent.
      ref = config.ref;
      owner = ReactCurrentOwner.current;
    }
    if (config.key !== undefined) {
      key = '' + config.key;
    }
    // Remaining properties override existing props
    for (propName in config) {
      if (config.hasOwnProperty(propName) &&
          !RESERVED_PROPS.hasOwnProperty(propName)) {
        props[propName] = config[propName];
      }
    }
  }

  // Children can be more than one argument, and those are transferred onto
  // the newly allocated props object.
  var childrenLength = arguments.length - 2;
  if (childrenLength === 1) {
    props.children = children;
  } else if (childrenLength > 1) {
    var childArray = Array(childrenLength);
    for (var i = 0; i < childrenLength; i++) {
      childArray[i] = arguments[i + 2];
    }
    props.children = childArray;
  }

  return new ReactElement(
    element.type,
    key,
    ref,
    owner,
    element._context,
    props
  );
};

/**
 * @param {?object} object
 * @return {boolean} True if `object` is a valid component.
 * @final
 */
ReactElement.isValidElement = function(object) {
  // ReactTestUtils is often used outside of beforeEach where as React is
  // within it. This leads to two different instances of React on the same
  // page. To identify a element from a different React instance we use
  // a flag instead of an instanceof check.
  var isElement = !!(object && object._isReactElement);
  // if (isElement && !(object instanceof ReactElement)) {
  // This is an indicator that you're using multiple versions of React at the
  // same time. This will screw with ownership and stuff. Fix it, please.
  // TODO: We could possibly warn here.
  // }
  return isElement;
};

module.exports = ReactElement;

}).call(this,require('_process'))
},{"./Object.assign":37,"./ReactContext":49,"./ReactCurrentOwner":50,"./warning":165,"_process":4}],69:[function(require,module,exports){
(function (process){
/**
 * Copyright 2014-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactElementValidator
 */

/**
 * ReactElementValidator provides a wrapper around a element factory
 * which validates the props passed to the element. This is intended to be
 * used only in DEV and could be replaced by a static type checker for languages
 * that support it.
 */

'use strict';

var ReactElement = require("./ReactElement");
var ReactFragment = require("./ReactFragment");
var ReactPropTypeLocations = require("./ReactPropTypeLocations");
var ReactPropTypeLocationNames = require("./ReactPropTypeLocationNames");
var ReactCurrentOwner = require("./ReactCurrentOwner");
var ReactNativeComponent = require("./ReactNativeComponent");

var getIteratorFn = require("./getIteratorFn");
var invariant = require("./invariant");
var warning = require("./warning");

function getDeclarationErrorAddendum() {
  if (ReactCurrentOwner.current) {
    var name = ReactCurrentOwner.current.getName();
    if (name) {
      return ' Check the render method of `' + name + '`.';
    }
  }
  return '';
}

/**
 * Warn if there's no key explicitly set on dynamic arrays of children or
 * object keys are not valid. This allows us to keep track of children between
 * updates.
 */
var ownerHasKeyUseWarning = {};

var loggedTypeFailures = {};

var NUMERIC_PROPERTY_REGEX = /^\d+$/;

/**
 * Gets the instance's name for use in warnings.
 *
 * @internal
 * @return {?string} Display name or undefined
 */
function getName(instance) {
  var publicInstance = instance && instance.getPublicInstance();
  if (!publicInstance) {
    return undefined;
  }
  var constructor = publicInstance.constructor;
  if (!constructor) {
    return undefined;
  }
  return constructor.displayName || constructor.name || undefined;
}

/**
 * Gets the current owner's displayName for use in warnings.
 *
 * @internal
 * @return {?string} Display name or undefined
 */
function getCurrentOwnerDisplayName() {
  var current = ReactCurrentOwner.current;
  return (
    current && getName(current) || undefined
  );
}

/**
 * Warn if the element doesn't have an explicit key assigned to it.
 * This element is in an array. The array could grow and shrink or be
 * reordered. All children that haven't already been validated are required to
 * have a "key" property assigned to it.
 *
 * @internal
 * @param {ReactElement} element Element that requires a key.
 * @param {*} parentType element's parent's type.
 */
function validateExplicitKey(element, parentType) {
  if (element._store.validated || element.key != null) {
    return;
  }
  element._store.validated = true;

  warnAndMonitorForKeyUse(
    'Each child in an array or iterator should have a unique "key" prop.',
    element,
    parentType
  );
}

/**
 * Warn if the key is being defined as an object property but has an incorrect
 * value.
 *
 * @internal
 * @param {string} name Property name of the key.
 * @param {ReactElement} element Component that requires a key.
 * @param {*} parentType element's parent's type.
 */
function validatePropertyKey(name, element, parentType) {
  if (!NUMERIC_PROPERTY_REGEX.test(name)) {
    return;
  }
  warnAndMonitorForKeyUse(
    'Child objects should have non-numeric keys so ordering is preserved.',
    element,
    parentType
  );
}

/**
 * Shared warning and monitoring code for the key warnings.
 *
 * @internal
 * @param {string} message The base warning that gets output.
 * @param {ReactElement} element Component that requires a key.
 * @param {*} parentType element's parent's type.
 */
function warnAndMonitorForKeyUse(message, element, parentType) {
  var ownerName = getCurrentOwnerDisplayName();
  var parentName = typeof parentType === 'string' ?
    parentType : parentType.displayName || parentType.name;

  var useName = ownerName || parentName;
  var memoizer = ownerHasKeyUseWarning[message] || (
    (ownerHasKeyUseWarning[message] = {})
  );
  if (memoizer.hasOwnProperty(useName)) {
    return;
  }
  memoizer[useName] = true;

  var parentOrOwnerAddendum =
    ownerName ? (" Check the render method of " + ownerName + ".") :
    parentName ? (" Check the React.render call using <" + parentName + ">.") :
    '';

  // Usually the current owner is the offender, but if it accepts children as a
  // property, it may be the creator of the child that's responsible for
  // assigning it a key.
  var childOwnerAddendum = '';
  if (element &&
      element._owner &&
      element._owner !== ReactCurrentOwner.current) {
    // Name of the component that originally created this child.
    var childOwnerName = getName(element._owner);

    childOwnerAddendum = (" It was passed a child from " + childOwnerName + ".");
  }

  ("production" !== process.env.NODE_ENV ? warning(
    false,
    message + '%s%s See http://fb.me/react-warning-keys for more information.',
    parentOrOwnerAddendum,
    childOwnerAddendum
  ) : null);
}

/**
 * Ensure that every element either is passed in a static location, in an
 * array with an explicit keys property defined, or in an object literal
 * with valid key property.
 *
 * @internal
 * @param {ReactNode} node Statically passed child of any type.
 * @param {*} parentType node's parent's type.
 */
function validateChildKeys(node, parentType) {
  if (Array.isArray(node)) {
    for (var i = 0; i < node.length; i++) {
      var child = node[i];
      if (ReactElement.isValidElement(child)) {
        validateExplicitKey(child, parentType);
      }
    }
  } else if (ReactElement.isValidElement(node)) {
    // This element was passed in a valid location.
    node._store.validated = true;
  } else if (node) {
    var iteratorFn = getIteratorFn(node);
    // Entry iterators provide implicit keys.
    if (iteratorFn) {
      if (iteratorFn !== node.entries) {
        var iterator = iteratorFn.call(node);
        var step;
        while (!(step = iterator.next()).done) {
          if (ReactElement.isValidElement(step.value)) {
            validateExplicitKey(step.value, parentType);
          }
        }
      }
    } else if (typeof node === 'object') {
      var fragment = ReactFragment.extractIfFragment(node);
      for (var key in fragment) {
        if (fragment.hasOwnProperty(key)) {
          validatePropertyKey(key, fragment[key], parentType);
        }
      }
    }
  }
}

/**
 * Assert that the props are valid
 *
 * @param {string} componentName Name of the component for error messages.
 * @param {object} propTypes Map of prop name to a ReactPropType
 * @param {object} props
 * @param {string} location e.g. "prop", "context", "child context"
 * @private
 */
function checkPropTypes(componentName, propTypes, props, location) {
  for (var propName in propTypes) {
    if (propTypes.hasOwnProperty(propName)) {
      var error;
      // Prop type validation may throw. In case they do, we don't want to
      // fail the render phase where it didn't fail before. So we log it.
      // After these have been cleaned up, we'll let them throw.
      try {
        // This is intentionally an invariant that gets caught. It's the same
        // behavior as without this statement except with a better message.
        ("production" !== process.env.NODE_ENV ? invariant(
          typeof propTypes[propName] === 'function',
          '%s: %s type `%s` is invalid; it must be a function, usually from ' +
          'React.PropTypes.',
          componentName || 'React class',
          ReactPropTypeLocationNames[location],
          propName
        ) : invariant(typeof propTypes[propName] === 'function'));
        error = propTypes[propName](props, propName, componentName, location);
      } catch (ex) {
        error = ex;
      }
      if (error instanceof Error && !(error.message in loggedTypeFailures)) {
        // Only monitor this failure once because there tends to be a lot of the
        // same error.
        loggedTypeFailures[error.message] = true;

        var addendum = getDeclarationErrorAddendum(this);
        ("production" !== process.env.NODE_ENV ? warning(false, 'Failed propType: %s%s', error.message, addendum) : null);
      }
    }
  }
}

var warnedPropsMutations = {};

/**
 * Warn about mutating props when setting `propName` on `element`.
 *
 * @param {string} propName The string key within props that was set
 * @param {ReactElement} element
 */
function warnForPropsMutation(propName, element) {
  var type = element.type;
  var elementName = typeof type === 'string' ? type : type.displayName;
  var ownerName = element._owner ?
    element._owner.getPublicInstance().constructor.displayName : null;

  var warningKey = propName + '|' + elementName + '|' + ownerName;
  if (warnedPropsMutations.hasOwnProperty(warningKey)) {
    return;
  }
  warnedPropsMutations[warningKey] = true;

  var elementInfo = '';
  if (elementName) {
    elementInfo = ' <' + elementName + ' />';
  }
  var ownerInfo = '';
  if (ownerName) {
    ownerInfo = ' The element was created by ' + ownerName + '.';
  }

  ("production" !== process.env.NODE_ENV ? warning(
    false,
    'Don\'t set .props.%s of the React component%s. Instead, specify the ' +
    'correct value when initially creating the element or use ' +
    'React.cloneElement to make a new element with updated props.%s',
    propName,
    elementInfo,
    ownerInfo
  ) : null);
}

// Inline Object.is polyfill
function is(a, b) {
  if (a !== a) {
    // NaN
    return b !== b;
  }
  if (a === 0 && b === 0) {
    // +-0
    return 1 / a === 1 / b;
  }
  return a === b;
}

/**
 * Given an element, check if its props have been mutated since element
 * creation (or the last call to this function). In particular, check if any
 * new props have been added, which we can't directly catch by defining warning
 * properties on the props object.
 *
 * @param {ReactElement} element
 */
function checkAndWarnForMutatedProps(element) {
  if (!element._store) {
    // Element was created using `new ReactElement` directly or with
    // `ReactElement.createElement`; skip mutation checking
    return;
  }

  var originalProps = element._store.originalProps;
  var props = element.props;

  for (var propName in props) {
    if (props.hasOwnProperty(propName)) {
      if (!originalProps.hasOwnProperty(propName) ||
          !is(originalProps[propName], props[propName])) {
        warnForPropsMutation(propName, element);

        // Copy over the new value so that the two props objects match again
        originalProps[propName] = props[propName];
      }
    }
  }
}

/**
 * Given an element, validate that its props follow the propTypes definition,
 * provided by the type.
 *
 * @param {ReactElement} element
 */
function validatePropTypes(element) {
  if (element.type == null) {
    // This has already warned. Don't throw.
    return;
  }
  // Extract the component class from the element. Converts string types
  // to a composite class which may have propTypes.
  // TODO: Validating a string's propTypes is not decoupled from the
  // rendering target which is problematic.
  var componentClass = ReactNativeComponent.getComponentClassForElement(
    element
  );
  var name = componentClass.displayName || componentClass.name;
  if (componentClass.propTypes) {
    checkPropTypes(
      name,
      componentClass.propTypes,
      element.props,
      ReactPropTypeLocations.prop
    );
  }
  if (typeof componentClass.getDefaultProps === 'function') {
    ("production" !== process.env.NODE_ENV ? warning(
      componentClass.getDefaultProps.isReactClassApproved,
      'getDefaultProps is only used on classic React.createClass ' +
      'definitions. Use a static property named `defaultProps` instead.'
    ) : null);
  }
}

var ReactElementValidator = {

  checkAndWarnForMutatedProps: checkAndWarnForMutatedProps,

  createElement: function(type, props, children) {
    // We warn in this case but don't throw. We expect the element creation to
    // succeed and there will likely be errors in render.
    ("production" !== process.env.NODE_ENV ? warning(
      type != null,
      'React.createElement: type should not be null or undefined. It should ' +
        'be a string (for DOM elements) or a ReactClass (for composite ' +
        'components).'
    ) : null);

    var element = ReactElement.createElement.apply(this, arguments);

    // The result can be nullish if a mock or a custom function is used.
    // TODO: Drop this when these are no longer allowed as the type argument.
    if (element == null) {
      return element;
    }

    for (var i = 2; i < arguments.length; i++) {
      validateChildKeys(arguments[i], type);
    }

    validatePropTypes(element);

    return element;
  },

  createFactory: function(type) {
    var validatedFactory = ReactElementValidator.createElement.bind(
      null,
      type
    );
    // Legacy hook TODO: Warn if this is accessed
    validatedFactory.type = type;

    if ("production" !== process.env.NODE_ENV) {
      try {
        Object.defineProperty(
          validatedFactory,
          'type',
          {
            enumerable: false,
            get: function() {
              ("production" !== process.env.NODE_ENV ? warning(
                false,
                'Factory.type is deprecated. Access the class directly ' +
                'before passing it to createFactory.'
              ) : null);
              Object.defineProperty(this, 'type', {
                value: type
              });
              return type;
            }
          }
        );
      } catch (x) {
        // IE will fail on defineProperty (es5-shim/sham too)
      }
    }


    return validatedFactory;
  },

  cloneElement: function(element, props, children) {
    var newElement = ReactElement.cloneElement.apply(this, arguments);
    for (var i = 2; i < arguments.length; i++) {
      validateChildKeys(arguments[i], newElement.type);
    }
    validatePropTypes(newElement);
    return newElement;
  }

};

module.exports = ReactElementValidator;

}).call(this,require('_process'))
},{"./ReactCurrentOwner":50,"./ReactElement":68,"./ReactFragment":74,"./ReactNativeComponent":84,"./ReactPropTypeLocationNames":87,"./ReactPropTypeLocations":88,"./getIteratorFn":137,"./invariant":146,"./warning":165,"_process":4}],70:[function(require,module,exports){
(function (process){
/**
 * Copyright 2014-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactEmptyComponent
 */

'use strict';

var ReactElement = require("./ReactElement");
var ReactInstanceMap = require("./ReactInstanceMap");

var invariant = require("./invariant");

var component;
// This registry keeps track of the React IDs of the components that rendered to
// `null` (in reality a placeholder such as `noscript`)
var nullComponentIDsRegistry = {};

var ReactEmptyComponentInjection = {
  injectEmptyComponent: function(emptyComponent) {
    component = ReactElement.createFactory(emptyComponent);
  }
};

var ReactEmptyComponentType = function() {};
ReactEmptyComponentType.prototype.componentDidMount = function() {
  var internalInstance = ReactInstanceMap.get(this);
  // TODO: Make sure we run these methods in the correct order, we shouldn't
  // need this check. We're going to assume if we're here it means we ran
  // componentWillUnmount already so there is no internal instance (it gets
  // removed as part of the unmounting process).
  if (!internalInstance) {
    return;
  }
  registerNullComponentID(internalInstance._rootNodeID);
};
ReactEmptyComponentType.prototype.componentWillUnmount = function() {
  var internalInstance = ReactInstanceMap.get(this);
  // TODO: Get rid of this check. See TODO in componentDidMount.
  if (!internalInstance) {
    return;
  }
  deregisterNullComponentID(internalInstance._rootNodeID);
};
ReactEmptyComponentType.prototype.render = function() {
  ("production" !== process.env.NODE_ENV ? invariant(
    component,
    'Trying to return null from a render, but no null placeholder component ' +
    'was injected.'
  ) : invariant(component));
  return component();
};

var emptyElement = ReactElement.createElement(ReactEmptyComponentType);

/**
 * Mark the component as having rendered to null.
 * @param {string} id Component's `_rootNodeID`.
 */
function registerNullComponentID(id) {
  nullComponentIDsRegistry[id] = true;
}

/**
 * Unmark the component as having rendered to null: it renders to something now.
 * @param {string} id Component's `_rootNodeID`.
 */
function deregisterNullComponentID(id) {
  delete nullComponentIDsRegistry[id];
}

/**
 * @param {string} id Component's `_rootNodeID`.
 * @return {boolean} True if the component is rendered to null.
 */
function isNullComponentID(id) {
  return !!nullComponentIDsRegistry[id];
}

var ReactEmptyComponent = {
  emptyElement: emptyElement,
  injection: ReactEmptyComponentInjection,
  isNullComponentID: isNullComponentID
};

module.exports = ReactEmptyComponent;

}).call(this,require('_process'))
},{"./ReactElement":68,"./ReactInstanceMap":78,"./invariant":146,"_process":4}],71:[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactErrorUtils
 * @typechecks
 */

"use strict";

var ReactErrorUtils = {
  /**
   * Creates a guarded version of a function. This is supposed to make debugging
   * of event handlers easier. To aid debugging with the browser's debugger,
   * this currently simply returns the original function.
   *
   * @param {function} func Function to be executed
   * @param {string} name The name of the guard
   * @return {function}
   */
  guard: function(func, name) {
    return func;
  }
};

module.exports = ReactErrorUtils;

},{}],72:[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactEventEmitterMixin
 */

'use strict';

var EventPluginHub = require("./EventPluginHub");

function runEventQueueInBatch(events) {
  EventPluginHub.enqueueEvents(events);
  EventPluginHub.processEventQueue();
}

var ReactEventEmitterMixin = {

  /**
   * Streams a fired top-level event to `EventPluginHub` where plugins have the
   * opportunity to create `ReactEvent`s to be dispatched.
   *
   * @param {string} topLevelType Record from `EventConstants`.
   * @param {object} topLevelTarget The listening component root node.
   * @param {string} topLevelTargetID ID of `topLevelTarget`.
   * @param {object} nativeEvent Native environment event.
   */
  handleTopLevel: function(
      topLevelType,
      topLevelTarget,
      topLevelTargetID,
      nativeEvent) {
    var events = EventPluginHub.extractEvents(
      topLevelType,
      topLevelTarget,
      topLevelTargetID,
      nativeEvent
    );

    runEventQueueInBatch(events);
  }
};

module.exports = ReactEventEmitterMixin;

},{"./EventPluginHub":27}],73:[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactEventListener
 * @typechecks static-only
 */

'use strict';

var EventListener = require("./EventListener");
var ExecutionEnvironment = require("./ExecutionEnvironment");
var PooledClass = require("./PooledClass");
var ReactInstanceHandles = require("./ReactInstanceHandles");
var ReactMount = require("./ReactMount");
var ReactUpdates = require("./ReactUpdates");

var assign = require("./Object.assign");
var getEventTarget = require("./getEventTarget");
var getUnboundedScrollPosition = require("./getUnboundedScrollPosition");

/**
 * Finds the parent React component of `node`.
 *
 * @param {*} node
 * @return {?DOMEventTarget} Parent container, or `null` if the specified node
 *                           is not nested.
 */
function findParent(node) {
  // TODO: It may be a good idea to cache this to prevent unnecessary DOM
  // traversal, but caching is difficult to do correctly without using a
  // mutation observer to listen for all DOM changes.
  var nodeID = ReactMount.getID(node);
  var rootID = ReactInstanceHandles.getReactRootIDFromNodeID(nodeID);
  var container = ReactMount.findReactContainerForID(rootID);
  var parent = ReactMount.getFirstReactDOM(container);
  return parent;
}

// Used to store ancestor hierarchy in top level callback
function TopLevelCallbackBookKeeping(topLevelType, nativeEvent) {
  this.topLevelType = topLevelType;
  this.nativeEvent = nativeEvent;
  this.ancestors = [];
}
assign(TopLevelCallbackBookKeeping.prototype, {
  destructor: function() {
    this.topLevelType = null;
    this.nativeEvent = null;
    this.ancestors.length = 0;
  }
});
PooledClass.addPoolingTo(
  TopLevelCallbackBookKeeping,
  PooledClass.twoArgumentPooler
);

function handleTopLevelImpl(bookKeeping) {
  var topLevelTarget = ReactMount.getFirstReactDOM(
    getEventTarget(bookKeeping.nativeEvent)
  ) || window;

  // Loop through the hierarchy, in case there's any nested components.
  // It's important that we build the array of ancestors before calling any
  // event handlers, because event handlers can modify the DOM, leading to
  // inconsistencies with ReactMount's node cache. See #1105.
  var ancestor = topLevelTarget;
  while (ancestor) {
    bookKeeping.ancestors.push(ancestor);
    ancestor = findParent(ancestor);
  }

  for (var i = 0, l = bookKeeping.ancestors.length; i < l; i++) {
    topLevelTarget = bookKeeping.ancestors[i];
    var topLevelTargetID = ReactMount.getID(topLevelTarget) || '';
    ReactEventListener._handleTopLevel(
      bookKeeping.topLevelType,
      topLevelTarget,
      topLevelTargetID,
      bookKeeping.nativeEvent
    );
  }
}

function scrollValueMonitor(cb) {
  var scrollPosition = getUnboundedScrollPosition(window);
  cb(scrollPosition);
}

var ReactEventListener = {
  _enabled: true,
  _handleTopLevel: null,

  WINDOW_HANDLE: ExecutionEnvironment.canUseDOM ? window : null,

  setHandleTopLevel: function(handleTopLevel) {
    ReactEventListener._handleTopLevel = handleTopLevel;
  },

  setEnabled: function(enabled) {
    ReactEventListener._enabled = !!enabled;
  },

  isEnabled: function() {
    return ReactEventListener._enabled;
  },


  /**
   * Traps top-level events by using event bubbling.
   *
   * @param {string} topLevelType Record from `EventConstants`.
   * @param {string} handlerBaseName Event name (e.g. "click").
   * @param {object} handle Element on which to attach listener.
   * @return {object} An object with a remove function which will forcefully
   *                  remove the listener.
   * @internal
   */
  trapBubbledEvent: function(topLevelType, handlerBaseName, handle) {
    var element = handle;
    if (!element) {
      return null;
    }
    return EventListener.listen(
      element,
      handlerBaseName,
      ReactEventListener.dispatchEvent.bind(null, topLevelType)
    );
  },

  /**
   * Traps a top-level event by using event capturing.
   *
   * @param {string} topLevelType Record from `EventConstants`.
   * @param {string} handlerBaseName Event name (e.g. "click").
   * @param {object} handle Element on which to attach listener.
   * @return {object} An object with a remove function which will forcefully
   *                  remove the listener.
   * @internal
   */
  trapCapturedEvent: function(topLevelType, handlerBaseName, handle) {
    var element = handle;
    if (!element) {
      return null;
    }
    return EventListener.capture(
      element,
      handlerBaseName,
      ReactEventListener.dispatchEvent.bind(null, topLevelType)
    );
  },

  monitorScrollValue: function(refresh) {
    var callback = scrollValueMonitor.bind(null, refresh);
    EventListener.listen(window, 'scroll', callback);
  },

  dispatchEvent: function(topLevelType, nativeEvent) {
    if (!ReactEventListener._enabled) {
      return;
    }

    var bookKeeping = TopLevelCallbackBookKeeping.getPooled(
      topLevelType,
      nativeEvent
    );
    try {
      // Event queue being processed in the same cycle allows
      // `preventDefault`.
      ReactUpdates.batchedUpdates(handleTopLevelImpl, bookKeeping);
    } finally {
      TopLevelCallbackBookKeeping.release(bookKeeping);
    }
  }
};

module.exports = ReactEventListener;

},{"./EventListener":26,"./ExecutionEnvironment":31,"./Object.assign":37,"./PooledClass":38,"./ReactInstanceHandles":77,"./ReactMount":81,"./ReactUpdates":98,"./getEventTarget":136,"./getUnboundedScrollPosition":142}],74:[function(require,module,exports){
(function (process){
/**
 * Copyright 2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
* @providesModule ReactFragment
*/

'use strict';

var ReactElement = require("./ReactElement");

var warning = require("./warning");

/**
 * We used to allow keyed objects to serve as a collection of ReactElements,
 * or nested sets. This allowed us a way to explicitly key a set a fragment of
 * components. This is now being replaced with an opaque data structure.
 * The upgrade path is to call React.addons.createFragment({ key: value }) to
 * create a keyed fragment. The resulting data structure is opaque, for now.
 */

if ("production" !== process.env.NODE_ENV) {
  var fragmentKey = '_reactFragment';
  var didWarnKey = '_reactDidWarn';
  var canWarnForReactFragment = false;

  try {
    // Feature test. Don't even try to issue this warning if we can't use
    // enumerable: false.

    var dummy = function() {
      return 1;
    };

    Object.defineProperty(
      {},
      fragmentKey,
      {enumerable: false, value: true}
    );

    Object.defineProperty(
      {},
      'key',
      {enumerable: true, get: dummy}
    );

    canWarnForReactFragment = true;
  } catch (x) { }

  var proxyPropertyAccessWithWarning = function(obj, key) {
    Object.defineProperty(obj, key, {
      enumerable: true,
      get: function() {
        ("production" !== process.env.NODE_ENV ? warning(
          this[didWarnKey],
          'A ReactFragment is an opaque type. Accessing any of its ' +
          'properties is deprecated. Pass it to one of the React.Children ' +
          'helpers.'
        ) : null);
        this[didWarnKey] = true;
        return this[fragmentKey][key];
      },
      set: function(value) {
        ("production" !== process.env.NODE_ENV ? warning(
          this[didWarnKey],
          'A ReactFragment is an immutable opaque type. Mutating its ' +
          'properties is deprecated.'
        ) : null);
        this[didWarnKey] = true;
        this[fragmentKey][key] = value;
      }
    });
  };

  var issuedWarnings = {};

  var didWarnForFragment = function(fragment) {
    // We use the keys and the type of the value as a heuristic to dedupe the
    // warning to avoid spamming too much.
    var fragmentCacheKey = '';
    for (var key in fragment) {
      fragmentCacheKey += key + ':' + (typeof fragment[key]) + ',';
    }
    var alreadyWarnedOnce = !!issuedWarnings[fragmentCacheKey];
    issuedWarnings[fragmentCacheKey] = true;
    return alreadyWarnedOnce;
  };
}

var ReactFragment = {
  // Wrap a keyed object in an opaque proxy that warns you if you access any
  // of its properties.
  create: function(object) {
    if ("production" !== process.env.NODE_ENV) {
      if (typeof object !== 'object' || !object || Array.isArray(object)) {
        ("production" !== process.env.NODE_ENV ? warning(
          false,
          'React.addons.createFragment only accepts a single object.',
          object
        ) : null);
        return object;
      }
      if (ReactElement.isValidElement(object)) {
        ("production" !== process.env.NODE_ENV ? warning(
          false,
          'React.addons.createFragment does not accept a ReactElement ' +
          'without a wrapper object.'
        ) : null);
        return object;
      }
      if (canWarnForReactFragment) {
        var proxy = {};
        Object.defineProperty(proxy, fragmentKey, {
          enumerable: false,
          value: object
        });
        Object.defineProperty(proxy, didWarnKey, {
          writable: true,
          enumerable: false,
          value: false
        });
        for (var key in object) {
          proxyPropertyAccessWithWarning(proxy, key);
        }
        Object.preventExtensions(proxy);
        return proxy;
      }
    }
    return object;
  },
  // Extract the original keyed object from the fragment opaque type. Warn if
  // a plain object is passed here.
  extract: function(fragment) {
    if ("production" !== process.env.NODE_ENV) {
      if (canWarnForReactFragment) {
        if (!fragment[fragmentKey]) {
          ("production" !== process.env.NODE_ENV ? warning(
            didWarnForFragment(fragment),
            'Any use of a keyed object should be wrapped in ' +
            'React.addons.createFragment(object) before being passed as a ' +
            'child.'
          ) : null);
          return fragment;
        }
        return fragment[fragmentKey];
      }
    }
    return fragment;
  },
  // Check if this is a fragment and if so, extract the keyed object. If it
  // is a fragment-like object, warn that it should be wrapped. Ignore if we
  // can't determine what kind of object this is.
  extractIfFragment: function(fragment) {
    if ("production" !== process.env.NODE_ENV) {
      if (canWarnForReactFragment) {
        // If it is the opaque type, return the keyed object.
        if (fragment[fragmentKey]) {
          return fragment[fragmentKey];
        }
        // Otherwise, check each property if it has an element, if it does
        // it is probably meant as a fragment, so we can warn early. Defer,
        // the warning to extract.
        for (var key in fragment) {
          if (fragment.hasOwnProperty(key) &&
              ReactElement.isValidElement(fragment[key])) {
            // This looks like a fragment object, we should provide an
            // early warning.
            return ReactFragment.extract(fragment);
          }
        }
      }
    }
    return fragment;
  }
};

module.exports = ReactFragment;

}).call(this,require('_process'))
},{"./ReactElement":68,"./warning":165,"_process":4}],75:[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactInjection
 */

'use strict';

var DOMProperty = require("./DOMProperty");
var EventPluginHub = require("./EventPluginHub");
var ReactComponentEnvironment = require("./ReactComponentEnvironment");
var ReactClass = require("./ReactClass");
var ReactEmptyComponent = require("./ReactEmptyComponent");
var ReactBrowserEventEmitter = require("./ReactBrowserEventEmitter");
var ReactNativeComponent = require("./ReactNativeComponent");
var ReactDOMComponent = require("./ReactDOMComponent");
var ReactPerf = require("./ReactPerf");
var ReactRootIndex = require("./ReactRootIndex");
var ReactUpdates = require("./ReactUpdates");

var ReactInjection = {
  Component: ReactComponentEnvironment.injection,
  Class: ReactClass.injection,
  DOMComponent: ReactDOMComponent.injection,
  DOMProperty: DOMProperty.injection,
  EmptyComponent: ReactEmptyComponent.injection,
  EventPluginHub: EventPluginHub.injection,
  EventEmitter: ReactBrowserEventEmitter.injection,
  NativeComponent: ReactNativeComponent.injection,
  Perf: ReactPerf.injection,
  RootIndex: ReactRootIndex.injection,
  Updates: ReactUpdates.injection
};

module.exports = ReactInjection;

},{"./DOMProperty":20,"./EventPluginHub":27,"./ReactBrowserEventEmitter":41,"./ReactClass":44,"./ReactComponentEnvironment":47,"./ReactDOMComponent":53,"./ReactEmptyComponent":70,"./ReactNativeComponent":84,"./ReactPerf":86,"./ReactRootIndex":94,"./ReactUpdates":98}],76:[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactInputSelection
 */

'use strict';

var ReactDOMSelection = require("./ReactDOMSelection");

var containsNode = require("./containsNode");
var focusNode = require("./focusNode");
var getActiveElement = require("./getActiveElement");

function isInDocument(node) {
  return containsNode(document.documentElement, node);
}

/**
 * @ReactInputSelection: React input selection module. Based on Selection.js,
 * but modified to be suitable for react and has a couple of bug fixes (doesn't
 * assume buttons have range selections allowed).
 * Input selection module for React.
 */
var ReactInputSelection = {

  hasSelectionCapabilities: function(elem) {
    return elem && (
      ((elem.nodeName === 'INPUT' && elem.type === 'text') ||
      elem.nodeName === 'TEXTAREA' || elem.contentEditable === 'true')
    );
  },

  getSelectionInformation: function() {
    var focusedElem = getActiveElement();
    return {
      focusedElem: focusedElem,
      selectionRange:
          ReactInputSelection.hasSelectionCapabilities(focusedElem) ?
          ReactInputSelection.getSelection(focusedElem) :
          null
    };
  },

  /**
   * @restoreSelection: If any selection information was potentially lost,
   * restore it. This is useful when performing operations that could remove dom
   * nodes and place them back in, resulting in focus being lost.
   */
  restoreSelection: function(priorSelectionInformation) {
    var curFocusedElem = getActiveElement();
    var priorFocusedElem = priorSelectionInformation.focusedElem;
    var priorSelectionRange = priorSelectionInformation.selectionRange;
    if (curFocusedElem !== priorFocusedElem &&
        isInDocument(priorFocusedElem)) {
      if (ReactInputSelection.hasSelectionCapabilities(priorFocusedElem)) {
        ReactInputSelection.setSelection(
          priorFocusedElem,
          priorSelectionRange
        );
      }
      focusNode(priorFocusedElem);
    }
  },

  /**
   * @getSelection: Gets the selection bounds of a focused textarea, input or
   * contentEditable node.
   * -@input: Look up selection bounds of this input
   * -@return {start: selectionStart, end: selectionEnd}
   */
  getSelection: function(input) {
    var selection;

    if ('selectionStart' in input) {
      // Modern browser with input or textarea.
      selection = {
        start: input.selectionStart,
        end: input.selectionEnd
      };
    } else if (document.selection && input.nodeName === 'INPUT') {
      // IE8 input.
      var range = document.selection.createRange();
      // There can only be one selection per document in IE, so it must
      // be in our element.
      if (range.parentElement() === input) {
        selection = {
          start: -range.moveStart('character', -input.value.length),
          end: -range.moveEnd('character', -input.value.length)
        };
      }
    } else {
      // Content editable or old IE textarea.
      selection = ReactDOMSelection.getOffsets(input);
    }

    return selection || {start: 0, end: 0};
  },

  /**
   * @setSelection: Sets the selection bounds of a textarea or input and focuses
   * the input.
   * -@input     Set selection bounds of this input or textarea
   * -@offsets   Object of same form that is returned from get*
   */
  setSelection: function(input, offsets) {
    var start = offsets.start;
    var end = offsets.end;
    if (typeof end === 'undefined') {
      end = start;
    }

    if ('selectionStart' in input) {
      input.selectionStart = start;
      input.selectionEnd = Math.min(end, input.value.length);
    } else if (document.selection && input.nodeName === 'INPUT') {
      var range = input.createTextRange();
      range.collapse(true);
      range.moveStart('character', start);
      range.moveEnd('character', end - start);
      range.select();
    } else {
      ReactDOMSelection.setOffsets(input, offsets);
    }
  }
};

module.exports = ReactInputSelection;

},{"./ReactDOMSelection":61,"./containsNode":120,"./focusNode":130,"./getActiveElement":132}],77:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactInstanceHandles
 * @typechecks static-only
 */

'use strict';

var ReactRootIndex = require("./ReactRootIndex");

var invariant = require("./invariant");

var SEPARATOR = '.';
var SEPARATOR_LENGTH = SEPARATOR.length;

/**
 * Maximum depth of traversals before we consider the possibility of a bad ID.
 */
var MAX_TREE_DEPTH = 100;

/**
 * Creates a DOM ID prefix to use when mounting React components.
 *
 * @param {number} index A unique integer
 * @return {string} React root ID.
 * @internal
 */
function getReactRootIDString(index) {
  return SEPARATOR + index.toString(36);
}

/**
 * Checks if a character in the supplied ID is a separator or the end.
 *
 * @param {string} id A React DOM ID.
 * @param {number} index Index of the character to check.
 * @return {boolean} True if the character is a separator or end of the ID.
 * @private
 */
function isBoundary(id, index) {
  return id.charAt(index) === SEPARATOR || index === id.length;
}

/**
 * Checks if the supplied string is a valid React DOM ID.
 *
 * @param {string} id A React DOM ID, maybe.
 * @return {boolean} True if the string is a valid React DOM ID.
 * @private
 */
function isValidID(id) {
  return id === '' || (
    id.charAt(0) === SEPARATOR && id.charAt(id.length - 1) !== SEPARATOR
  );
}

/**
 * Checks if the first ID is an ancestor of or equal to the second ID.
 *
 * @param {string} ancestorID
 * @param {string} descendantID
 * @return {boolean} True if `ancestorID` is an ancestor of `descendantID`.
 * @internal
 */
function isAncestorIDOf(ancestorID, descendantID) {
  return (
    descendantID.indexOf(ancestorID) === 0 &&
    isBoundary(descendantID, ancestorID.length)
  );
}

/**
 * Gets the parent ID of the supplied React DOM ID, `id`.
 *
 * @param {string} id ID of a component.
 * @return {string} ID of the parent, or an empty string.
 * @private
 */
function getParentID(id) {
  return id ? id.substr(0, id.lastIndexOf(SEPARATOR)) : '';
}

/**
 * Gets the next DOM ID on the tree path from the supplied `ancestorID` to the
 * supplied `destinationID`. If they are equal, the ID is returned.
 *
 * @param {string} ancestorID ID of an ancestor node of `destinationID`.
 * @param {string} destinationID ID of the destination node.
 * @return {string} Next ID on the path from `ancestorID` to `destinationID`.
 * @private
 */
function getNextDescendantID(ancestorID, destinationID) {
  ("production" !== process.env.NODE_ENV ? invariant(
    isValidID(ancestorID) && isValidID(destinationID),
    'getNextDescendantID(%s, %s): Received an invalid React DOM ID.',
    ancestorID,
    destinationID
  ) : invariant(isValidID(ancestorID) && isValidID(destinationID)));
  ("production" !== process.env.NODE_ENV ? invariant(
    isAncestorIDOf(ancestorID, destinationID),
    'getNextDescendantID(...): React has made an invalid assumption about ' +
    'the DOM hierarchy. Expected `%s` to be an ancestor of `%s`.',
    ancestorID,
    destinationID
  ) : invariant(isAncestorIDOf(ancestorID, destinationID)));
  if (ancestorID === destinationID) {
    return ancestorID;
  }
  // Skip over the ancestor and the immediate separator. Traverse until we hit
  // another separator or we reach the end of `destinationID`.
  var start = ancestorID.length + SEPARATOR_LENGTH;
  var i;
  for (i = start; i < destinationID.length; i++) {
    if (isBoundary(destinationID, i)) {
      break;
    }
  }
  return destinationID.substr(0, i);
}

/**
 * Gets the nearest common ancestor ID of two IDs.
 *
 * Using this ID scheme, the nearest common ancestor ID is the longest common
 * prefix of the two IDs that immediately preceded a "marker" in both strings.
 *
 * @param {string} oneID
 * @param {string} twoID
 * @return {string} Nearest common ancestor ID, or the empty string if none.
 * @private
 */
function getFirstCommonAncestorID(oneID, twoID) {
  var minLength = Math.min(oneID.length, twoID.length);
  if (minLength === 0) {
    return '';
  }
  var lastCommonMarkerIndex = 0;
  // Use `<=` to traverse until the "EOL" of the shorter string.
  for (var i = 0; i <= minLength; i++) {
    if (isBoundary(oneID, i) && isBoundary(twoID, i)) {
      lastCommonMarkerIndex = i;
    } else if (oneID.charAt(i) !== twoID.charAt(i)) {
      break;
    }
  }
  var longestCommonID = oneID.substr(0, lastCommonMarkerIndex);
  ("production" !== process.env.NODE_ENV ? invariant(
    isValidID(longestCommonID),
    'getFirstCommonAncestorID(%s, %s): Expected a valid React DOM ID: %s',
    oneID,
    twoID,
    longestCommonID
  ) : invariant(isValidID(longestCommonID)));
  return longestCommonID;
}

/**
 * Traverses the parent path between two IDs (either up or down). The IDs must
 * not be the same, and there must exist a parent path between them. If the
 * callback returns `false`, traversal is stopped.
 *
 * @param {?string} start ID at which to start traversal.
 * @param {?string} stop ID at which to end traversal.
 * @param {function} cb Callback to invoke each ID with.
 * @param {?boolean} skipFirst Whether or not to skip the first node.
 * @param {?boolean} skipLast Whether or not to skip the last node.
 * @private
 */
function traverseParentPath(start, stop, cb, arg, skipFirst, skipLast) {
  start = start || '';
  stop = stop || '';
  ("production" !== process.env.NODE_ENV ? invariant(
    start !== stop,
    'traverseParentPath(...): Cannot traverse from and to the same ID, `%s`.',
    start
  ) : invariant(start !== stop));
  var traverseUp = isAncestorIDOf(stop, start);
  ("production" !== process.env.NODE_ENV ? invariant(
    traverseUp || isAncestorIDOf(start, stop),
    'traverseParentPath(%s, %s, ...): Cannot traverse from two IDs that do ' +
    'not have a parent path.',
    start,
    stop
  ) : invariant(traverseUp || isAncestorIDOf(start, stop)));
  // Traverse from `start` to `stop` one depth at a time.
  var depth = 0;
  var traverse = traverseUp ? getParentID : getNextDescendantID;
  for (var id = start; /* until break */; id = traverse(id, stop)) {
    var ret;
    if ((!skipFirst || id !== start) && (!skipLast || id !== stop)) {
      ret = cb(id, traverseUp, arg);
    }
    if (ret === false || id === stop) {
      // Only break //after// visiting `stop`.
      break;
    }
    ("production" !== process.env.NODE_ENV ? invariant(
      depth++ < MAX_TREE_DEPTH,
      'traverseParentPath(%s, %s, ...): Detected an infinite loop while ' +
      'traversing the React DOM ID tree. This may be due to malformed IDs: %s',
      start, stop
    ) : invariant(depth++ < MAX_TREE_DEPTH));
  }
}

/**
 * Manages the IDs assigned to DOM representations of React components. This
 * uses a specific scheme in order to traverse the DOM efficiently (e.g. in
 * order to simulate events).
 *
 * @internal
 */
var ReactInstanceHandles = {

  /**
   * Constructs a React root ID
   * @return {string} A React root ID.
   */
  createReactRootID: function() {
    return getReactRootIDString(ReactRootIndex.createReactRootIndex());
  },

  /**
   * Constructs a React ID by joining a root ID with a name.
   *
   * @param {string} rootID Root ID of a parent component.
   * @param {string} name A component's name (as flattened children).
   * @return {string} A React ID.
   * @internal
   */
  createReactID: function(rootID, name) {
    return rootID + name;
  },

  /**
   * Gets the DOM ID of the React component that is the root of the tree that
   * contains the React component with the supplied DOM ID.
   *
   * @param {string} id DOM ID of a React component.
   * @return {?string} DOM ID of the React component that is the root.
   * @internal
   */
  getReactRootIDFromNodeID: function(id) {
    if (id && id.charAt(0) === SEPARATOR && id.length > 1) {
      var index = id.indexOf(SEPARATOR, 1);
      return index > -1 ? id.substr(0, index) : id;
    }
    return null;
  },

  /**
   * Traverses the ID hierarchy and invokes the supplied `cb` on any IDs that
   * should would receive a `mouseEnter` or `mouseLeave` event.
   *
   * NOTE: Does not invoke the callback on the nearest common ancestor because
   * nothing "entered" or "left" that element.
   *
   * @param {string} leaveID ID being left.
   * @param {string} enterID ID being entered.
   * @param {function} cb Callback to invoke on each entered/left ID.
   * @param {*} upArg Argument to invoke the callback with on left IDs.
   * @param {*} downArg Argument to invoke the callback with on entered IDs.
   * @internal
   */
  traverseEnterLeave: function(leaveID, enterID, cb, upArg, downArg) {
    var ancestorID = getFirstCommonAncestorID(leaveID, enterID);
    if (ancestorID !== leaveID) {
      traverseParentPath(leaveID, ancestorID, cb, upArg, false, true);
    }
    if (ancestorID !== enterID) {
      traverseParentPath(ancestorID, enterID, cb, downArg, true, false);
    }
  },

  /**
   * Simulates the traversal of a two-phase, capture/bubble event dispatch.
   *
   * NOTE: This traversal happens on IDs without touching the DOM.
   *
   * @param {string} targetID ID of the target node.
   * @param {function} cb Callback to invoke.
   * @param {*} arg Argument to invoke the callback with.
   * @internal
   */
  traverseTwoPhase: function(targetID, cb, arg) {
    if (targetID) {
      traverseParentPath('', targetID, cb, arg, true, false);
      traverseParentPath(targetID, '', cb, arg, false, true);
    }
  },

  /**
   * Traverse a node ID, calling the supplied `cb` for each ancestor ID. For
   * example, passing `.0.$row-0.1` would result in `cb` getting called
   * with `.0`, `.0.$row-0`, and `.0.$row-0.1`.
   *
   * NOTE: This traversal happens on IDs without touching the DOM.
   *
   * @param {string} targetID ID of the target node.
   * @param {function} cb Callback to invoke.
   * @param {*} arg Argument to invoke the callback with.
   * @internal
   */
  traverseAncestors: function(targetID, cb, arg) {
    traverseParentPath('', targetID, cb, arg, true, false);
  },

  /**
   * Exposed for unit testing.
   * @private
   */
  _getFirstCommonAncestorID: getFirstCommonAncestorID,

  /**
   * Exposed for unit testing.
   * @private
   */
  _getNextDescendantID: getNextDescendantID,

  isAncestorIDOf: isAncestorIDOf,

  SEPARATOR: SEPARATOR

};

module.exports = ReactInstanceHandles;

}).call(this,require('_process'))
},{"./ReactRootIndex":94,"./invariant":146,"_process":4}],78:[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactInstanceMap
 */

'use strict';

/**
 * `ReactInstanceMap` maintains a mapping from a public facing stateful
 * instance (key) and the internal representation (value). This allows public
 * methods to accept the user facing instance as an argument and map them back
 * to internal methods.
 */

// TODO: Replace this with ES6: var ReactInstanceMap = new Map();
var ReactInstanceMap = {

  /**
   * This API should be called `delete` but we'd have to make sure to always
   * transform these to strings for IE support. When this transform is fully
   * supported we can rename it.
   */
  remove: function(key) {
    key._reactInternalInstance = undefined;
  },

  get: function(key) {
    return key._reactInternalInstance;
  },

  has: function(key) {
    return key._reactInternalInstance !== undefined;
  },

  set: function(key, value) {
    key._reactInternalInstance = value;
  }

};

module.exports = ReactInstanceMap;

},{}],79:[function(require,module,exports){
/**
 * Copyright 2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactLifeCycle
 */

'use strict';

/**
 * This module manages the bookkeeping when a component is in the process
 * of being mounted or being unmounted. This is used as a way to enforce
 * invariants (or warnings) when it is not recommended to call
 * setState/forceUpdate.
 *
 * currentlyMountingInstance: During the construction phase, it is not possible
 * to trigger an update since the instance is not fully mounted yet. However, we
 * currently allow this as a convenience for mutating the initial state.
 *
 * currentlyUnmountingInstance: During the unmounting phase, the instance is
 * still mounted and can therefore schedule an update. However, this is not
 * recommended and probably an error since it's about to be unmounted.
 * Therefore we still want to trigger in an error for that case.
 */

var ReactLifeCycle = {
  currentlyMountingInstance: null,
  currentlyUnmountingInstance: null
};

module.exports = ReactLifeCycle;

},{}],80:[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactMarkupChecksum
 */

'use strict';

var adler32 = require("./adler32");

var ReactMarkupChecksum = {
  CHECKSUM_ATTR_NAME: 'data-react-checksum',

  /**
   * @param {string} markup Markup string
   * @return {string} Markup string with checksum attribute attached
   */
  addChecksumToMarkup: function(markup) {
    var checksum = adler32(markup);
    return markup.replace(
      '>',
      ' ' + ReactMarkupChecksum.CHECKSUM_ATTR_NAME + '="' + checksum + '">'
    );
  },

  /**
   * @param {string} markup to use
   * @param {DOMElement} element root React element
   * @returns {boolean} whether or not the markup is the same
   */
  canReuseMarkup: function(markup, element) {
    var existingChecksum = element.getAttribute(
      ReactMarkupChecksum.CHECKSUM_ATTR_NAME
    );
    existingChecksum = existingChecksum && parseInt(existingChecksum, 10);
    var markupChecksum = adler32(markup);
    return markupChecksum === existingChecksum;
  }
};

module.exports = ReactMarkupChecksum;

},{"./adler32":117}],81:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactMount
 */

'use strict';

var DOMProperty = require("./DOMProperty");
var ReactBrowserEventEmitter = require("./ReactBrowserEventEmitter");
var ReactCurrentOwner = require("./ReactCurrentOwner");
var ReactElement = require("./ReactElement");
var ReactElementValidator = require("./ReactElementValidator");
var ReactEmptyComponent = require("./ReactEmptyComponent");
var ReactInstanceHandles = require("./ReactInstanceHandles");
var ReactInstanceMap = require("./ReactInstanceMap");
var ReactMarkupChecksum = require("./ReactMarkupChecksum");
var ReactPerf = require("./ReactPerf");
var ReactReconciler = require("./ReactReconciler");
var ReactUpdateQueue = require("./ReactUpdateQueue");
var ReactUpdates = require("./ReactUpdates");

var emptyObject = require("./emptyObject");
var containsNode = require("./containsNode");
var getReactRootElementInContainer = require("./getReactRootElementInContainer");
var instantiateReactComponent = require("./instantiateReactComponent");
var invariant = require("./invariant");
var setInnerHTML = require("./setInnerHTML");
var shouldUpdateReactComponent = require("./shouldUpdateReactComponent");
var warning = require("./warning");

var SEPARATOR = ReactInstanceHandles.SEPARATOR;

var ATTR_NAME = DOMProperty.ID_ATTRIBUTE_NAME;
var nodeCache = {};

var ELEMENT_NODE_TYPE = 1;
var DOC_NODE_TYPE = 9;

/** Mapping from reactRootID to React component instance. */
var instancesByReactRootID = {};

/** Mapping from reactRootID to `container` nodes. */
var containersByReactRootID = {};

if ("production" !== process.env.NODE_ENV) {
  /** __DEV__-only mapping from reactRootID to root elements. */
  var rootElementsByReactRootID = {};
}

// Used to store breadth-first search state in findComponentRoot.
var findComponentRootReusableArray = [];

/**
 * Finds the index of the first character
 * that's not common between the two given strings.
 *
 * @return {number} the index of the character where the strings diverge
 */
function firstDifferenceIndex(string1, string2) {
  var minLen = Math.min(string1.length, string2.length);
  for (var i = 0; i < minLen; i++) {
    if (string1.charAt(i) !== string2.charAt(i)) {
      return i;
    }
  }
  return string1.length === string2.length ? -1 : minLen;
}

/**
 * @param {DOMElement} container DOM element that may contain a React component.
 * @return {?string} A "reactRoot" ID, if a React component is rendered.
 */
function getReactRootID(container) {
  var rootElement = getReactRootElementInContainer(container);
  return rootElement && ReactMount.getID(rootElement);
}

/**
 * Accessing node[ATTR_NAME] or calling getAttribute(ATTR_NAME) on a form
 * element can return its control whose name or ID equals ATTR_NAME. All
 * DOM nodes support `getAttributeNode` but this can also get called on
 * other objects so just return '' if we're given something other than a
 * DOM node (such as window).
 *
 * @param {?DOMElement|DOMWindow|DOMDocument|DOMTextNode} node DOM node.
 * @return {string} ID of the supplied `domNode`.
 */
function getID(node) {
  var id = internalGetID(node);
  if (id) {
    if (nodeCache.hasOwnProperty(id)) {
      var cached = nodeCache[id];
      if (cached !== node) {
        ("production" !== process.env.NODE_ENV ? invariant(
          !isValid(cached, id),
          'ReactMount: Two valid but unequal nodes with the same `%s`: %s',
          ATTR_NAME, id
        ) : invariant(!isValid(cached, id)));

        nodeCache[id] = node;
      }
    } else {
      nodeCache[id] = node;
    }
  }

  return id;
}

function internalGetID(node) {
  // If node is something like a window, document, or text node, none of
  // which support attributes or a .getAttribute method, gracefully return
  // the empty string, as if the attribute were missing.
  return node && node.getAttribute && node.getAttribute(ATTR_NAME) || '';
}

/**
 * Sets the React-specific ID of the given node.
 *
 * @param {DOMElement} node The DOM node whose ID will be set.
 * @param {string} id The value of the ID attribute.
 */
function setID(node, id) {
  var oldID = internalGetID(node);
  if (oldID !== id) {
    delete nodeCache[oldID];
  }
  node.setAttribute(ATTR_NAME, id);
  nodeCache[id] = node;
}

/**
 * Finds the node with the supplied React-generated DOM ID.
 *
 * @param {string} id A React-generated DOM ID.
 * @return {DOMElement} DOM node with the suppled `id`.
 * @internal
 */
function getNode(id) {
  if (!nodeCache.hasOwnProperty(id) || !isValid(nodeCache[id], id)) {
    nodeCache[id] = ReactMount.findReactNodeByID(id);
  }
  return nodeCache[id];
}

/**
 * Finds the node with the supplied public React instance.
 *
 * @param {*} instance A public React instance.
 * @return {?DOMElement} DOM node with the suppled `id`.
 * @internal
 */
function getNodeFromInstance(instance) {
  var id = ReactInstanceMap.get(instance)._rootNodeID;
  if (ReactEmptyComponent.isNullComponentID(id)) {
    return null;
  }
  if (!nodeCache.hasOwnProperty(id) || !isValid(nodeCache[id], id)) {
    nodeCache[id] = ReactMount.findReactNodeByID(id);
  }
  return nodeCache[id];
}

/**
 * A node is "valid" if it is contained by a currently mounted container.
 *
 * This means that the node does not have to be contained by a document in
 * order to be considered valid.
 *
 * @param {?DOMElement} node The candidate DOM node.
 * @param {string} id The expected ID of the node.
 * @return {boolean} Whether the node is contained by a mounted container.
 */
function isValid(node, id) {
  if (node) {
    ("production" !== process.env.NODE_ENV ? invariant(
      internalGetID(node) === id,
      'ReactMount: Unexpected modification of `%s`',
      ATTR_NAME
    ) : invariant(internalGetID(node) === id));

    var container = ReactMount.findReactContainerForID(id);
    if (container && containsNode(container, node)) {
      return true;
    }
  }

  return false;
}

/**
 * Causes the cache to forget about one React-specific ID.
 *
 * @param {string} id The ID to forget.
 */
function purgeID(id) {
  delete nodeCache[id];
}

var deepestNodeSoFar = null;
function findDeepestCachedAncestorImpl(ancestorID) {
  var ancestor = nodeCache[ancestorID];
  if (ancestor && isValid(ancestor, ancestorID)) {
    deepestNodeSoFar = ancestor;
  } else {
    // This node isn't populated in the cache, so presumably none of its
    // descendants are. Break out of the loop.
    return false;
  }
}

/**
 * Return the deepest cached node whose ID is a prefix of `targetID`.
 */
function findDeepestCachedAncestor(targetID) {
  deepestNodeSoFar = null;
  ReactInstanceHandles.traverseAncestors(
    targetID,
    findDeepestCachedAncestorImpl
  );

  var foundNode = deepestNodeSoFar;
  deepestNodeSoFar = null;
  return foundNode;
}

/**
 * Mounts this component and inserts it into the DOM.
 *
 * @param {ReactComponent} componentInstance The instance to mount.
 * @param {string} rootID DOM ID of the root node.
 * @param {DOMElement} container DOM element to mount into.
 * @param {ReactReconcileTransaction} transaction
 * @param {boolean} shouldReuseMarkup If true, do not insert markup
 */
function mountComponentIntoNode(
    componentInstance,
    rootID,
    container,
    transaction,
    shouldReuseMarkup) {
  var markup = ReactReconciler.mountComponent(
    componentInstance, rootID, transaction, emptyObject
  );
  componentInstance._isTopLevel = true;
  ReactMount._mountImageIntoNode(markup, container, shouldReuseMarkup);
}

/**
 * Batched mount.
 *
 * @param {ReactComponent} componentInstance The instance to mount.
 * @param {string} rootID DOM ID of the root node.
 * @param {DOMElement} container DOM element to mount into.
 * @param {boolean} shouldReuseMarkup If true, do not insert markup
 */
function batchedMountComponentIntoNode(
    componentInstance,
    rootID,
    container,
    shouldReuseMarkup) {
  var transaction = ReactUpdates.ReactReconcileTransaction.getPooled();
  transaction.perform(
    mountComponentIntoNode,
    null,
    componentInstance,
    rootID,
    container,
    transaction,
    shouldReuseMarkup
  );
  ReactUpdates.ReactReconcileTransaction.release(transaction);
}

/**
 * Mounting is the process of initializing a React component by creating its
 * representative DOM elements and inserting them into a supplied `container`.
 * Any prior content inside `container` is destroyed in the process.
 *
 *   ReactMount.render(
 *     component,
 *     document.getElementById('container')
 *   );
 *
 *   <div id="container">                   <-- Supplied `container`.
 *     <div data-reactid=".3">              <-- Rendered reactRoot of React
 *       // ...                                 component.
 *     </div>
 *   </div>
 *
 * Inside of `container`, the first element rendered is the "reactRoot".
 */
var ReactMount = {
  /** Exposed for debugging purposes **/
  _instancesByReactRootID: instancesByReactRootID,

  /**
   * This is a hook provided to support rendering React components while
   * ensuring that the apparent scroll position of its `container` does not
   * change.
   *
   * @param {DOMElement} container The `container` being rendered into.
   * @param {function} renderCallback This must be called once to do the render.
   */
  scrollMonitor: function(container, renderCallback) {
    renderCallback();
  },

  /**
   * Take a component that's already mounted into the DOM and replace its props
   * @param {ReactComponent} prevComponent component instance already in the DOM
   * @param {ReactElement} nextElement component instance to render
   * @param {DOMElement} container container to render into
   * @param {?function} callback function triggered on completion
   */
  _updateRootComponent: function(
      prevComponent,
      nextElement,
      container,
      callback) {
    if ("production" !== process.env.NODE_ENV) {
      ReactElementValidator.checkAndWarnForMutatedProps(nextElement);
    }

    ReactMount.scrollMonitor(container, function() {
      ReactUpdateQueue.enqueueElementInternal(prevComponent, nextElement);
      if (callback) {
        ReactUpdateQueue.enqueueCallbackInternal(prevComponent, callback);
      }
    });

    if ("production" !== process.env.NODE_ENV) {
      // Record the root element in case it later gets transplanted.
      rootElementsByReactRootID[getReactRootID(container)] =
        getReactRootElementInContainer(container);
    }

    return prevComponent;
  },

  /**
   * Register a component into the instance map and starts scroll value
   * monitoring
   * @param {ReactComponent} nextComponent component instance to render
   * @param {DOMElement} container container to render into
   * @return {string} reactRoot ID prefix
   */
  _registerComponent: function(nextComponent, container) {
    ("production" !== process.env.NODE_ENV ? invariant(
      container && (
        (container.nodeType === ELEMENT_NODE_TYPE || container.nodeType === DOC_NODE_TYPE)
      ),
      '_registerComponent(...): Target container is not a DOM element.'
    ) : invariant(container && (
      (container.nodeType === ELEMENT_NODE_TYPE || container.nodeType === DOC_NODE_TYPE)
    )));

    ReactBrowserEventEmitter.ensureScrollValueMonitoring();

    var reactRootID = ReactMount.registerContainer(container);
    instancesByReactRootID[reactRootID] = nextComponent;
    return reactRootID;
  },

  /**
   * Render a new component into the DOM.
   * @param {ReactElement} nextElement element to render
   * @param {DOMElement} container container to render into
   * @param {boolean} shouldReuseMarkup if we should skip the markup insertion
   * @return {ReactComponent} nextComponent
   */
  _renderNewRootComponent: function(
    nextElement,
    container,
    shouldReuseMarkup
  ) {
    // Various parts of our code (such as ReactCompositeComponent's
    // _renderValidatedComponent) assume that calls to render aren't nested;
    // verify that that's the case.
    ("production" !== process.env.NODE_ENV ? warning(
      ReactCurrentOwner.current == null,
      '_renderNewRootComponent(): Render methods should be a pure function ' +
      'of props and state; triggering nested component updates from ' +
      'render is not allowed. If necessary, trigger nested updates in ' +
      'componentDidUpdate.'
    ) : null);

    var componentInstance = instantiateReactComponent(nextElement, null);
    var reactRootID = ReactMount._registerComponent(
      componentInstance,
      container
    );

    // The initial render is synchronous but any updates that happen during
    // rendering, in componentWillMount or componentDidMount, will be batched
    // according to the current batching strategy.

    ReactUpdates.batchedUpdates(
      batchedMountComponentIntoNode,
      componentInstance,
      reactRootID,
      container,
      shouldReuseMarkup
    );

    if ("production" !== process.env.NODE_ENV) {
      // Record the root element in case it later gets transplanted.
      rootElementsByReactRootID[reactRootID] =
        getReactRootElementInContainer(container);
    }

    return componentInstance;
  },

  /**
   * Renders a React component into the DOM in the supplied `container`.
   *
   * If the React component was previously rendered into `container`, this will
   * perform an update on it and only mutate the DOM as necessary to reflect the
   * latest React component.
   *
   * @param {ReactElement} nextElement Component element to render.
   * @param {DOMElement} container DOM element to render into.
   * @param {?function} callback function triggered on completion
   * @return {ReactComponent} Component instance rendered in `container`.
   */
  render: function(nextElement, container, callback) {
    ("production" !== process.env.NODE_ENV ? invariant(
      ReactElement.isValidElement(nextElement),
      'React.render(): Invalid component element.%s',
      (
        typeof nextElement === 'string' ?
          ' Instead of passing an element string, make sure to instantiate ' +
          'it by passing it to React.createElement.' :
        typeof nextElement === 'function' ?
          ' Instead of passing a component class, make sure to instantiate ' +
          'it by passing it to React.createElement.' :
        // Check if it quacks like an element
        nextElement != null && nextElement.props !== undefined ?
          ' This may be caused by unintentionally loading two independent ' +
          'copies of React.' :
          ''
      )
    ) : invariant(ReactElement.isValidElement(nextElement)));

    var prevComponent = instancesByReactRootID[getReactRootID(container)];

    if (prevComponent) {
      var prevElement = prevComponent._currentElement;
      if (shouldUpdateReactComponent(prevElement, nextElement)) {
        return ReactMount._updateRootComponent(
          prevComponent,
          nextElement,
          container,
          callback
        ).getPublicInstance();
      } else {
        ReactMount.unmountComponentAtNode(container);
      }
    }

    var reactRootElement = getReactRootElementInContainer(container);
    var containerHasReactMarkup =
      reactRootElement && ReactMount.isRenderedByReact(reactRootElement);

    if ("production" !== process.env.NODE_ENV) {
      if (!containerHasReactMarkup || reactRootElement.nextSibling) {
        var rootElementSibling = reactRootElement;
        while (rootElementSibling) {
          if (ReactMount.isRenderedByReact(rootElementSibling)) {
            ("production" !== process.env.NODE_ENV ? warning(
              false,
              'render(): Target node has markup rendered by React, but there ' +
              'are unrelated nodes as well. This is most commonly caused by ' +
              'white-space inserted around server-rendered markup.'
            ) : null);
            break;
          }

          rootElementSibling = rootElementSibling.nextSibling;
        }
      }
    }

    var shouldReuseMarkup = containerHasReactMarkup && !prevComponent;

    var component = ReactMount._renderNewRootComponent(
      nextElement,
      container,
      shouldReuseMarkup
    ).getPublicInstance();
    if (callback) {
      callback.call(component);
    }
    return component;
  },

  /**
   * Constructs a component instance of `constructor` with `initialProps` and
   * renders it into the supplied `container`.
   *
   * @param {function} constructor React component constructor.
   * @param {?object} props Initial props of the component instance.
   * @param {DOMElement} container DOM element to render into.
   * @return {ReactComponent} Component instance rendered in `container`.
   */
  constructAndRenderComponent: function(constructor, props, container) {
    var element = ReactElement.createElement(constructor, props);
    return ReactMount.render(element, container);
  },

  /**
   * Constructs a component instance of `constructor` with `initialProps` and
   * renders it into a container node identified by supplied `id`.
   *
   * @param {function} componentConstructor React component constructor
   * @param {?object} props Initial props of the component instance.
   * @param {string} id ID of the DOM element to render into.
   * @return {ReactComponent} Component instance rendered in the container node.
   */
  constructAndRenderComponentByID: function(constructor, props, id) {
    var domNode = document.getElementById(id);
    ("production" !== process.env.NODE_ENV ? invariant(
      domNode,
      'Tried to get element with id of "%s" but it is not present on the page.',
      id
    ) : invariant(domNode));
    return ReactMount.constructAndRenderComponent(constructor, props, domNode);
  },

  /**
   * Registers a container node into which React components will be rendered.
   * This also creates the "reactRoot" ID that will be assigned to the element
   * rendered within.
   *
   * @param {DOMElement} container DOM element to register as a container.
   * @return {string} The "reactRoot" ID of elements rendered within.
   */
  registerContainer: function(container) {
    var reactRootID = getReactRootID(container);
    if (reactRootID) {
      // If one exists, make sure it is a valid "reactRoot" ID.
      reactRootID = ReactInstanceHandles.getReactRootIDFromNodeID(reactRootID);
    }
    if (!reactRootID) {
      // No valid "reactRoot" ID found, create one.
      reactRootID = ReactInstanceHandles.createReactRootID();
    }
    containersByReactRootID[reactRootID] = container;
    return reactRootID;
  },

  /**
   * Unmounts and destroys the React component rendered in the `container`.
   *
   * @param {DOMElement} container DOM element containing a React component.
   * @return {boolean} True if a component was found in and unmounted from
   *                   `container`
   */
  unmountComponentAtNode: function(container) {
    // Various parts of our code (such as ReactCompositeComponent's
    // _renderValidatedComponent) assume that calls to render aren't nested;
    // verify that that's the case. (Strictly speaking, unmounting won't cause a
    // render but we still don't expect to be in a render call here.)
    ("production" !== process.env.NODE_ENV ? warning(
      ReactCurrentOwner.current == null,
      'unmountComponentAtNode(): Render methods should be a pure function of ' +
      'props and state; triggering nested component updates from render is ' +
      'not allowed. If necessary, trigger nested updates in ' +
      'componentDidUpdate.'
    ) : null);

    ("production" !== process.env.NODE_ENV ? invariant(
      container && (
        (container.nodeType === ELEMENT_NODE_TYPE || container.nodeType === DOC_NODE_TYPE)
      ),
      'unmountComponentAtNode(...): Target container is not a DOM element.'
    ) : invariant(container && (
      (container.nodeType === ELEMENT_NODE_TYPE || container.nodeType === DOC_NODE_TYPE)
    )));

    var reactRootID = getReactRootID(container);
    var component = instancesByReactRootID[reactRootID];
    if (!component) {
      return false;
    }
    ReactMount.unmountComponentFromNode(component, container);
    delete instancesByReactRootID[reactRootID];
    delete containersByReactRootID[reactRootID];
    if ("production" !== process.env.NODE_ENV) {
      delete rootElementsByReactRootID[reactRootID];
    }
    return true;
  },

  /**
   * Unmounts a component and removes it from the DOM.
   *
   * @param {ReactComponent} instance React component instance.
   * @param {DOMElement} container DOM element to unmount from.
   * @final
   * @internal
   * @see {ReactMount.unmountComponentAtNode}
   */
  unmountComponentFromNode: function(instance, container) {
    ReactReconciler.unmountComponent(instance);

    if (container.nodeType === DOC_NODE_TYPE) {
      container = container.documentElement;
    }

    // http://jsperf.com/emptying-a-node
    while (container.lastChild) {
      container.removeChild(container.lastChild);
    }
  },

  /**
   * Finds the container DOM element that contains React component to which the
   * supplied DOM `id` belongs.
   *
   * @param {string} id The ID of an element rendered by a React component.
   * @return {?DOMElement} DOM element that contains the `id`.
   */
  findReactContainerForID: function(id) {
    var reactRootID = ReactInstanceHandles.getReactRootIDFromNodeID(id);
    var container = containersByReactRootID[reactRootID];

    if ("production" !== process.env.NODE_ENV) {
      var rootElement = rootElementsByReactRootID[reactRootID];
      if (rootElement && rootElement.parentNode !== container) {
        ("production" !== process.env.NODE_ENV ? invariant(
          // Call internalGetID here because getID calls isValid which calls
          // findReactContainerForID (this function).
          internalGetID(rootElement) === reactRootID,
          'ReactMount: Root element ID differed from reactRootID.'
        ) : invariant(// Call internalGetID here because getID calls isValid which calls
        // findReactContainerForID (this function).
        internalGetID(rootElement) === reactRootID));

        var containerChild = container.firstChild;
        if (containerChild &&
            reactRootID === internalGetID(containerChild)) {
          // If the container has a new child with the same ID as the old
          // root element, then rootElementsByReactRootID[reactRootID] is
          // just stale and needs to be updated. The case that deserves a
          // warning is when the container is empty.
          rootElementsByReactRootID[reactRootID] = containerChild;
        } else {
          ("production" !== process.env.NODE_ENV ? warning(
            false,
            'ReactMount: Root element has been removed from its original ' +
            'container. New container:', rootElement.parentNode
          ) : null);
        }
      }
    }

    return container;
  },

  /**
   * Finds an element rendered by React with the supplied ID.
   *
   * @param {string} id ID of a DOM node in the React component.
   * @return {DOMElement} Root DOM node of the React component.
   */
  findReactNodeByID: function(id) {
    var reactRoot = ReactMount.findReactContainerForID(id);
    return ReactMount.findComponentRoot(reactRoot, id);
  },

  /**
   * True if the supplied `node` is rendered by React.
   *
   * @param {*} node DOM Element to check.
   * @return {boolean} True if the DOM Element appears to be rendered by React.
   * @internal
   */
  isRenderedByReact: function(node) {
    if (node.nodeType !== 1) {
      // Not a DOMElement, therefore not a React component
      return false;
    }
    var id = ReactMount.getID(node);
    return id ? id.charAt(0) === SEPARATOR : false;
  },

  /**
   * Traverses up the ancestors of the supplied node to find a node that is a
   * DOM representation of a React component.
   *
   * @param {*} node
   * @return {?DOMEventTarget}
   * @internal
   */
  getFirstReactDOM: function(node) {
    var current = node;
    while (current && current.parentNode !== current) {
      if (ReactMount.isRenderedByReact(current)) {
        return current;
      }
      current = current.parentNode;
    }
    return null;
  },

  /**
   * Finds a node with the supplied `targetID` inside of the supplied
   * `ancestorNode`.  Exploits the ID naming scheme to perform the search
   * quickly.
   *
   * @param {DOMEventTarget} ancestorNode Search from this root.
   * @pararm {string} targetID ID of the DOM representation of the component.
   * @return {DOMEventTarget} DOM node with the supplied `targetID`.
   * @internal
   */
  findComponentRoot: function(ancestorNode, targetID) {
    var firstChildren = findComponentRootReusableArray;
    var childIndex = 0;

    var deepestAncestor = findDeepestCachedAncestor(targetID) || ancestorNode;

    firstChildren[0] = deepestAncestor.firstChild;
    firstChildren.length = 1;

    while (childIndex < firstChildren.length) {
      var child = firstChildren[childIndex++];
      var targetChild;

      while (child) {
        var childID = ReactMount.getID(child);
        if (childID) {
          // Even if we find the node we're looking for, we finish looping
          // through its siblings to ensure they're cached so that we don't have
          // to revisit this node again. Otherwise, we make n^2 calls to getID
          // when visiting the many children of a single node in order.

          if (targetID === childID) {
            targetChild = child;
          } else if (ReactInstanceHandles.isAncestorIDOf(childID, targetID)) {
            // If we find a child whose ID is an ancestor of the given ID,
            // then we can be sure that we only want to search the subtree
            // rooted at this child, so we can throw out the rest of the
            // search state.
            firstChildren.length = childIndex = 0;
            firstChildren.push(child.firstChild);
          }

        } else {
          // If this child had no ID, then there's a chance that it was
          // injected automatically by the browser, as when a `<table>`
          // element sprouts an extra `<tbody>` child as a side effect of
          // `.innerHTML` parsing. Optimistically continue down this
          // branch, but not before examining the other siblings.
          firstChildren.push(child.firstChild);
        }

        child = child.nextSibling;
      }

      if (targetChild) {
        // Emptying firstChildren/findComponentRootReusableArray is
        // not necessary for correctness, but it helps the GC reclaim
        // any nodes that were left at the end of the search.
        firstChildren.length = 0;

        return targetChild;
      }
    }

    firstChildren.length = 0;

    ("production" !== process.env.NODE_ENV ? invariant(
      false,
      'findComponentRoot(..., %s): Unable to find element. This probably ' +
      'means the DOM was unexpectedly mutated (e.g., by the browser), ' +
      'usually due to forgetting a <tbody> when using tables, nesting tags ' +
      'like <form>, <p>, or <a>, or using non-SVG elements in an <svg> ' +
      'parent. ' +
      'Try inspecting the child nodes of the element with React ID `%s`.',
      targetID,
      ReactMount.getID(ancestorNode)
    ) : invariant(false));
  },

  _mountImageIntoNode: function(markup, container, shouldReuseMarkup) {
    ("production" !== process.env.NODE_ENV ? invariant(
      container && (
        (container.nodeType === ELEMENT_NODE_TYPE || container.nodeType === DOC_NODE_TYPE)
      ),
      'mountComponentIntoNode(...): Target container is not valid.'
    ) : invariant(container && (
      (container.nodeType === ELEMENT_NODE_TYPE || container.nodeType === DOC_NODE_TYPE)
    )));

    if (shouldReuseMarkup) {
      var rootElement = getReactRootElementInContainer(container);
      if (ReactMarkupChecksum.canReuseMarkup(markup, rootElement)) {
        return;
      } else {
        var checksum = rootElement.getAttribute(
          ReactMarkupChecksum.CHECKSUM_ATTR_NAME
        );
        rootElement.removeAttribute(ReactMarkupChecksum.CHECKSUM_ATTR_NAME);

        var rootMarkup = rootElement.outerHTML;
        rootElement.setAttribute(
          ReactMarkupChecksum.CHECKSUM_ATTR_NAME,
          checksum
        );

        var diffIndex = firstDifferenceIndex(markup, rootMarkup);
        var difference = ' (client) ' +
          markup.substring(diffIndex - 20, diffIndex + 20) +
          '\n (server) ' + rootMarkup.substring(diffIndex - 20, diffIndex + 20);

        ("production" !== process.env.NODE_ENV ? invariant(
          container.nodeType !== DOC_NODE_TYPE,
          'You\'re trying to render a component to the document using ' +
          'server rendering but the checksum was invalid. This usually ' +
          'means you rendered a different component type or props on ' +
          'the client from the one on the server, or your render() ' +
          'methods are impure. React cannot handle this case due to ' +
          'cross-browser quirks by rendering at the document root. You ' +
          'should look for environment dependent code in your components ' +
          'and ensure the props are the same client and server side:\n%s',
          difference
        ) : invariant(container.nodeType !== DOC_NODE_TYPE));

        if ("production" !== process.env.NODE_ENV) {
          ("production" !== process.env.NODE_ENV ? warning(
            false,
            'React attempted to reuse markup in a container but the ' +
            'checksum was invalid. This generally means that you are ' +
            'using server rendering and the markup generated on the ' +
            'server was not what the client was expecting. React injected ' +
            'new markup to compensate which works but you have lost many ' +
            'of the benefits of server rendering. Instead, figure out ' +
            'why the markup being generated is different on the client ' +
            'or server:\n%s',
            difference
          ) : null);
        }
      }
    }

    ("production" !== process.env.NODE_ENV ? invariant(
      container.nodeType !== DOC_NODE_TYPE,
      'You\'re trying to render a component to the document but ' +
        'you didn\'t use server rendering. We can\'t do this ' +
        'without using server rendering due to cross-browser quirks. ' +
        'See React.renderToString() for server rendering.'
    ) : invariant(container.nodeType !== DOC_NODE_TYPE));

    setInnerHTML(container, markup);
  },

  /**
   * React ID utilities.
   */

  getReactRootID: getReactRootID,

  getID: getID,

  setID: setID,

  getNode: getNode,

  getNodeFromInstance: getNodeFromInstance,

  purgeID: purgeID
};

ReactPerf.measureMethods(ReactMount, 'ReactMount', {
  _renderNewRootComponent: '_renderNewRootComponent',
  _mountImageIntoNode: '_mountImageIntoNode'
});

module.exports = ReactMount;

}).call(this,require('_process'))
},{"./DOMProperty":20,"./ReactBrowserEventEmitter":41,"./ReactCurrentOwner":50,"./ReactElement":68,"./ReactElementValidator":69,"./ReactEmptyComponent":70,"./ReactInstanceHandles":77,"./ReactInstanceMap":78,"./ReactMarkupChecksum":80,"./ReactPerf":86,"./ReactReconciler":92,"./ReactUpdateQueue":97,"./ReactUpdates":98,"./containsNode":120,"./emptyObject":126,"./getReactRootElementInContainer":140,"./instantiateReactComponent":145,"./invariant":146,"./setInnerHTML":159,"./shouldUpdateReactComponent":162,"./warning":165,"_process":4}],82:[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactMultiChild
 * @typechecks static-only
 */

'use strict';

var ReactComponentEnvironment = require("./ReactComponentEnvironment");
var ReactMultiChildUpdateTypes = require("./ReactMultiChildUpdateTypes");

var ReactReconciler = require("./ReactReconciler");
var ReactChildReconciler = require("./ReactChildReconciler");

/**
 * Updating children of a component may trigger recursive updates. The depth is
 * used to batch recursive updates to render markup more efficiently.
 *
 * @type {number}
 * @private
 */
var updateDepth = 0;

/**
 * Queue of update configuration objects.
 *
 * Each object has a `type` property that is in `ReactMultiChildUpdateTypes`.
 *
 * @type {array<object>}
 * @private
 */
var updateQueue = [];

/**
 * Queue of markup to be rendered.
 *
 * @type {array<string>}
 * @private
 */
var markupQueue = [];

/**
 * Enqueues markup to be rendered and inserted at a supplied index.
 *
 * @param {string} parentID ID of the parent component.
 * @param {string} markup Markup that renders into an element.
 * @param {number} toIndex Destination index.
 * @private
 */
function enqueueMarkup(parentID, markup, toIndex) {
  // NOTE: Null values reduce hidden classes.
  updateQueue.push({
    parentID: parentID,
    parentNode: null,
    type: ReactMultiChildUpdateTypes.INSERT_MARKUP,
    markupIndex: markupQueue.push(markup) - 1,
    textContent: null,
    fromIndex: null,
    toIndex: toIndex
  });
}

/**
 * Enqueues moving an existing element to another index.
 *
 * @param {string} parentID ID of the parent component.
 * @param {number} fromIndex Source index of the existing element.
 * @param {number} toIndex Destination index of the element.
 * @private
 */
function enqueueMove(parentID, fromIndex, toIndex) {
  // NOTE: Null values reduce hidden classes.
  updateQueue.push({
    parentID: parentID,
    parentNode: null,
    type: ReactMultiChildUpdateTypes.MOVE_EXISTING,
    markupIndex: null,
    textContent: null,
    fromIndex: fromIndex,
    toIndex: toIndex
  });
}

/**
 * Enqueues removing an element at an index.
 *
 * @param {string} parentID ID of the parent component.
 * @param {number} fromIndex Index of the element to remove.
 * @private
 */
function enqueueRemove(parentID, fromIndex) {
  // NOTE: Null values reduce hidden classes.
  updateQueue.push({
    parentID: parentID,
    parentNode: null,
    type: ReactMultiChildUpdateTypes.REMOVE_NODE,
    markupIndex: null,
    textContent: null,
    fromIndex: fromIndex,
    toIndex: null
  });
}

/**
 * Enqueues setting the text content.
 *
 * @param {string} parentID ID of the parent component.
 * @param {string} textContent Text content to set.
 * @private
 */
function enqueueTextContent(parentID, textContent) {
  // NOTE: Null values reduce hidden classes.
  updateQueue.push({
    parentID: parentID,
    parentNode: null,
    type: ReactMultiChildUpdateTypes.TEXT_CONTENT,
    markupIndex: null,
    textContent: textContent,
    fromIndex: null,
    toIndex: null
  });
}

/**
 * Processes any enqueued updates.
 *
 * @private
 */
function processQueue() {
  if (updateQueue.length) {
    ReactComponentEnvironment.processChildrenUpdates(
      updateQueue,
      markupQueue
    );
    clearQueue();
  }
}

/**
 * Clears any enqueued updates.
 *
 * @private
 */
function clearQueue() {
  updateQueue.length = 0;
  markupQueue.length = 0;
}

/**
 * ReactMultiChild are capable of reconciling multiple children.
 *
 * @class ReactMultiChild
 * @internal
 */
var ReactMultiChild = {

  /**
   * Provides common functionality for components that must reconcile multiple
   * children. This is used by `ReactDOMComponent` to mount, update, and
   * unmount child components.
   *
   * @lends {ReactMultiChild.prototype}
   */
  Mixin: {

    /**
     * Generates a "mount image" for each of the supplied children. In the case
     * of `ReactDOMComponent`, a mount image is a string of markup.
     *
     * @param {?object} nestedChildren Nested child maps.
     * @return {array} An array of mounted representations.
     * @internal
     */
    mountChildren: function(nestedChildren, transaction, context) {
      var children = ReactChildReconciler.instantiateChildren(
        nestedChildren, transaction, context
      );
      this._renderedChildren = children;
      var mountImages = [];
      var index = 0;
      for (var name in children) {
        if (children.hasOwnProperty(name)) {
          var child = children[name];
          // Inlined for performance, see `ReactInstanceHandles.createReactID`.
          var rootID = this._rootNodeID + name;
          var mountImage = ReactReconciler.mountComponent(
            child,
            rootID,
            transaction,
            context
          );
          child._mountIndex = index;
          mountImages.push(mountImage);
          index++;
        }
      }
      return mountImages;
    },

    /**
     * Replaces any rendered children with a text content string.
     *
     * @param {string} nextContent String of content.
     * @internal
     */
    updateTextContent: function(nextContent) {
      updateDepth++;
      var errorThrown = true;
      try {
        var prevChildren = this._renderedChildren;
        // Remove any rendered children.
        ReactChildReconciler.unmountChildren(prevChildren);
        // TODO: The setTextContent operation should be enough
        for (var name in prevChildren) {
          if (prevChildren.hasOwnProperty(name)) {
            this._unmountChildByName(prevChildren[name], name);
          }
        }
        // Set new text content.
        this.setTextContent(nextContent);
        errorThrown = false;
      } finally {
        updateDepth--;
        if (!updateDepth) {
          if (errorThrown) {
            clearQueue();
          } else {
            processQueue();
          }
        }
      }
    },

    /**
     * Updates the rendered children with new children.
     *
     * @param {?object} nextNestedChildren Nested child maps.
     * @param {ReactReconcileTransaction} transaction
     * @internal
     */
    updateChildren: function(nextNestedChildren, transaction, context) {
      updateDepth++;
      var errorThrown = true;
      try {
        this._updateChildren(nextNestedChildren, transaction, context);
        errorThrown = false;
      } finally {
        updateDepth--;
        if (!updateDepth) {
          if (errorThrown) {
            clearQueue();
          } else {
            processQueue();
          }
        }

      }
    },

    /**
     * Improve performance by isolating this hot code path from the try/catch
     * block in `updateChildren`.
     *
     * @param {?object} nextNestedChildren Nested child maps.
     * @param {ReactReconcileTransaction} transaction
     * @final
     * @protected
     */
    _updateChildren: function(nextNestedChildren, transaction, context) {
      var prevChildren = this._renderedChildren;
      var nextChildren = ReactChildReconciler.updateChildren(
        prevChildren, nextNestedChildren, transaction, context
      );
      this._renderedChildren = nextChildren;
      if (!nextChildren && !prevChildren) {
        return;
      }
      var name;
      // `nextIndex` will increment for each child in `nextChildren`, but
      // `lastIndex` will be the last index visited in `prevChildren`.
      var lastIndex = 0;
      var nextIndex = 0;
      for (name in nextChildren) {
        if (!nextChildren.hasOwnProperty(name)) {
          continue;
        }
        var prevChild = prevChildren && prevChildren[name];
        var nextChild = nextChildren[name];
        if (prevChild === nextChild) {
          this.moveChild(prevChild, nextIndex, lastIndex);
          lastIndex = Math.max(prevChild._mountIndex, lastIndex);
          prevChild._mountIndex = nextIndex;
        } else {
          if (prevChild) {
            // Update `lastIndex` before `_mountIndex` gets unset by unmounting.
            lastIndex = Math.max(prevChild._mountIndex, lastIndex);
            this._unmountChildByName(prevChild, name);
          }
          // The child must be instantiated before it's mounted.
          this._mountChildByNameAtIndex(
            nextChild, name, nextIndex, transaction, context
          );
        }
        nextIndex++;
      }
      // Remove children that are no longer present.
      for (name in prevChildren) {
        if (prevChildren.hasOwnProperty(name) &&
            !(nextChildren && nextChildren.hasOwnProperty(name))) {
          this._unmountChildByName(prevChildren[name], name);
        }
      }
    },

    /**
     * Unmounts all rendered children. This should be used to clean up children
     * when this component is unmounted.
     *
     * @internal
     */
    unmountChildren: function() {
      var renderedChildren = this._renderedChildren;
      ReactChildReconciler.unmountChildren(renderedChildren);
      this._renderedChildren = null;
    },

    /**
     * Moves a child component to the supplied index.
     *
     * @param {ReactComponent} child Component to move.
     * @param {number} toIndex Destination index of the element.
     * @param {number} lastIndex Last index visited of the siblings of `child`.
     * @protected
     */
    moveChild: function(child, toIndex, lastIndex) {
      // If the index of `child` is less than `lastIndex`, then it needs to
      // be moved. Otherwise, we do not need to move it because a child will be
      // inserted or moved before `child`.
      if (child._mountIndex < lastIndex) {
        enqueueMove(this._rootNodeID, child._mountIndex, toIndex);
      }
    },

    /**
     * Creates a child component.
     *
     * @param {ReactComponent} child Component to create.
     * @param {string} mountImage Markup to insert.
     * @protected
     */
    createChild: function(child, mountImage) {
      enqueueMarkup(this._rootNodeID, mountImage, child._mountIndex);
    },

    /**
     * Removes a child component.
     *
     * @param {ReactComponent} child Child to remove.
     * @protected
     */
    removeChild: function(child) {
      enqueueRemove(this._rootNodeID, child._mountIndex);
    },

    /**
     * Sets this text content string.
     *
     * @param {string} textContent Text content to set.
     * @protected
     */
    setTextContent: function(textContent) {
      enqueueTextContent(this._rootNodeID, textContent);
    },

    /**
     * Mounts a child with the supplied name.
     *
     * NOTE: This is part of `updateChildren` and is here for readability.
     *
     * @param {ReactComponent} child Component to mount.
     * @param {string} name Name of the child.
     * @param {number} index Index at which to insert the child.
     * @param {ReactReconcileTransaction} transaction
     * @private
     */
    _mountChildByNameAtIndex: function(
      child,
      name,
      index,
      transaction,
      context) {
      // Inlined for performance, see `ReactInstanceHandles.createReactID`.
      var rootID = this._rootNodeID + name;
      var mountImage = ReactReconciler.mountComponent(
        child,
        rootID,
        transaction,
        context
      );
      child._mountIndex = index;
      this.createChild(child, mountImage);
    },

    /**
     * Unmounts a rendered child by name.
     *
     * NOTE: This is part of `updateChildren` and is here for readability.
     *
     * @param {ReactComponent} child Component to unmount.
     * @param {string} name Name of the child in `this._renderedChildren`.
     * @private
     */
    _unmountChildByName: function(child, name) {
      this.removeChild(child);
      child._mountIndex = null;
    }

  }

};

module.exports = ReactMultiChild;

},{"./ReactChildReconciler":42,"./ReactComponentEnvironment":47,"./ReactMultiChildUpdateTypes":83,"./ReactReconciler":92}],83:[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactMultiChildUpdateTypes
 */

'use strict';

var keyMirror = require("./keyMirror");

/**
 * When a component's children are updated, a series of update configuration
 * objects are created in order to batch and serialize the required changes.
 *
 * Enumerates all the possible types of update configurations.
 *
 * @internal
 */
var ReactMultiChildUpdateTypes = keyMirror({
  INSERT_MARKUP: null,
  MOVE_EXISTING: null,
  REMOVE_NODE: null,
  TEXT_CONTENT: null
});

module.exports = ReactMultiChildUpdateTypes;

},{"./keyMirror":151}],84:[function(require,module,exports){
(function (process){
/**
 * Copyright 2014-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactNativeComponent
 */

'use strict';

var assign = require("./Object.assign");
var invariant = require("./invariant");

var autoGenerateWrapperClass = null;
var genericComponentClass = null;
// This registry keeps track of wrapper classes around native tags
var tagToComponentClass = {};
var textComponentClass = null;

var ReactNativeComponentInjection = {
  // This accepts a class that receives the tag string. This is a catch all
  // that can render any kind of tag.
  injectGenericComponentClass: function(componentClass) {
    genericComponentClass = componentClass;
  },
  // This accepts a text component class that takes the text string to be
  // rendered as props.
  injectTextComponentClass: function(componentClass) {
    textComponentClass = componentClass;
  },
  // This accepts a keyed object with classes as values. Each key represents a
  // tag. That particular tag will use this class instead of the generic one.
  injectComponentClasses: function(componentClasses) {
    assign(tagToComponentClass, componentClasses);
  },
  // Temporary hack since we expect DOM refs to behave like composites,
  // for this release.
  injectAutoWrapper: function(wrapperFactory) {
    autoGenerateWrapperClass = wrapperFactory;
  }
};

/**
 * Get a composite component wrapper class for a specific tag.
 *
 * @param {ReactElement} element The tag for which to get the class.
 * @return {function} The React class constructor function.
 */
function getComponentClassForElement(element) {
  if (typeof element.type === 'function') {
    return element.type;
  }
  var tag = element.type;
  var componentClass = tagToComponentClass[tag];
  if (componentClass == null) {
    tagToComponentClass[tag] = componentClass = autoGenerateWrapperClass(tag);
  }
  return componentClass;
}

/**
 * Get a native internal component class for a specific tag.
 *
 * @param {ReactElement} element The element to create.
 * @return {function} The internal class constructor function.
 */
function createInternalComponent(element) {
  ("production" !== process.env.NODE_ENV ? invariant(
    genericComponentClass,
    'There is no registered component for the tag %s',
    element.type
  ) : invariant(genericComponentClass));
  return new genericComponentClass(element.type, element.props);
}

/**
 * @param {ReactText} text
 * @return {ReactComponent}
 */
function createInstanceForText(text) {
  return new textComponentClass(text);
}

/**
 * @param {ReactComponent} component
 * @return {boolean}
 */
function isTextComponent(component) {
  return component instanceof textComponentClass;
}

var ReactNativeComponent = {
  getComponentClassForElement: getComponentClassForElement,
  createInternalComponent: createInternalComponent,
  createInstanceForText: createInstanceForText,
  isTextComponent: isTextComponent,
  injection: ReactNativeComponentInjection
};

module.exports = ReactNativeComponent;

}).call(this,require('_process'))
},{"./Object.assign":37,"./invariant":146,"_process":4}],85:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactOwner
 */

'use strict';

var invariant = require("./invariant");

/**
 * ReactOwners are capable of storing references to owned components.
 *
 * All components are capable of //being// referenced by owner components, but
 * only ReactOwner components are capable of //referencing// owned components.
 * The named reference is known as a "ref".
 *
 * Refs are available when mounted and updated during reconciliation.
 *
 *   var MyComponent = React.createClass({
 *     render: function() {
 *       return (
 *         <div onClick={this.handleClick}>
 *           <CustomComponent ref="custom" />
 *         </div>
 *       );
 *     },
 *     handleClick: function() {
 *       this.refs.custom.handleClick();
 *     },
 *     componentDidMount: function() {
 *       this.refs.custom.initialize();
 *     }
 *   });
 *
 * Refs should rarely be used. When refs are used, they should only be done to
 * control data that is not handled by React's data flow.
 *
 * @class ReactOwner
 */
var ReactOwner = {

  /**
   * @param {?object} object
   * @return {boolean} True if `object` is a valid owner.
   * @final
   */
  isValidOwner: function(object) {
    return !!(
      (object &&
      typeof object.attachRef === 'function' && typeof object.detachRef === 'function')
    );
  },

  /**
   * Adds a component by ref to an owner component.
   *
   * @param {ReactComponent} component Component to reference.
   * @param {string} ref Name by which to refer to the component.
   * @param {ReactOwner} owner Component on which to record the ref.
   * @final
   * @internal
   */
  addComponentAsRefTo: function(component, ref, owner) {
    ("production" !== process.env.NODE_ENV ? invariant(
      ReactOwner.isValidOwner(owner),
      'addComponentAsRefTo(...): Only a ReactOwner can have refs. This ' +
      'usually means that you\'re trying to add a ref to a component that ' +
      'doesn\'t have an owner (that is, was not created inside of another ' +
      'component\'s `render` method). Try rendering this component inside of ' +
      'a new top-level component which will hold the ref.'
    ) : invariant(ReactOwner.isValidOwner(owner)));
    owner.attachRef(ref, component);
  },

  /**
   * Removes a component by ref from an owner component.
   *
   * @param {ReactComponent} component Component to dereference.
   * @param {string} ref Name of the ref to remove.
   * @param {ReactOwner} owner Component on which the ref is recorded.
   * @final
   * @internal
   */
  removeComponentAsRefFrom: function(component, ref, owner) {
    ("production" !== process.env.NODE_ENV ? invariant(
      ReactOwner.isValidOwner(owner),
      'removeComponentAsRefFrom(...): Only a ReactOwner can have refs. This ' +
      'usually means that you\'re trying to remove a ref to a component that ' +
      'doesn\'t have an owner (that is, was not created inside of another ' +
      'component\'s `render` method). Try rendering this component inside of ' +
      'a new top-level component which will hold the ref.'
    ) : invariant(ReactOwner.isValidOwner(owner)));
    // Check that `component` is still the current ref because we do not want to
    // detach the ref if another component stole it.
    if (owner.getPublicInstance().refs[ref] === component.getPublicInstance()) {
      owner.detachRef(ref);
    }
  }

};

module.exports = ReactOwner;

}).call(this,require('_process'))
},{"./invariant":146,"_process":4}],86:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactPerf
 * @typechecks static-only
 */

'use strict';

/**
 * ReactPerf is a general AOP system designed to measure performance. This
 * module only has the hooks: see ReactDefaultPerf for the analysis tool.
 */
var ReactPerf = {
  /**
   * Boolean to enable/disable measurement. Set to false by default to prevent
   * accidental logging and perf loss.
   */
  enableMeasure: false,

  /**
   * Holds onto the measure function in use. By default, don't measure
   * anything, but we'll override this if we inject a measure function.
   */
  storedMeasure: _noMeasure,

  /**
   * @param {object} object
   * @param {string} objectName
   * @param {object<string>} methodNames
   */
  measureMethods: function(object, objectName, methodNames) {
    if ("production" !== process.env.NODE_ENV) {
      for (var key in methodNames) {
        if (!methodNames.hasOwnProperty(key)) {
          continue;
        }
        object[key] = ReactPerf.measure(
          objectName,
          methodNames[key],
          object[key]
        );
      }
    }
  },

  /**
   * Use this to wrap methods you want to measure. Zero overhead in production.
   *
   * @param {string} objName
   * @param {string} fnName
   * @param {function} func
   * @return {function}
   */
  measure: function(objName, fnName, func) {
    if ("production" !== process.env.NODE_ENV) {
      var measuredFunc = null;
      var wrapper = function() {
        if (ReactPerf.enableMeasure) {
          if (!measuredFunc) {
            measuredFunc = ReactPerf.storedMeasure(objName, fnName, func);
          }
          return measuredFunc.apply(this, arguments);
        }
        return func.apply(this, arguments);
      };
      wrapper.displayName = objName + '_' + fnName;
      return wrapper;
    }
    return func;
  },

  injection: {
    /**
     * @param {function} measure
     */
    injectMeasure: function(measure) {
      ReactPerf.storedMeasure = measure;
    }
  }
};

/**
 * Simply passes through the measured function, without measuring it.
 *
 * @param {string} objName
 * @param {string} fnName
 * @param {function} func
 * @return {function}
 */
function _noMeasure(objName, fnName, func) {
  return func;
}

module.exports = ReactPerf;

}).call(this,require('_process'))
},{"_process":4}],87:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactPropTypeLocationNames
 */

'use strict';

var ReactPropTypeLocationNames = {};

if ("production" !== process.env.NODE_ENV) {
  ReactPropTypeLocationNames = {
    prop: 'prop',
    context: 'context',
    childContext: 'child context'
  };
}

module.exports = ReactPropTypeLocationNames;

}).call(this,require('_process'))
},{"_process":4}],88:[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactPropTypeLocations
 */

'use strict';

var keyMirror = require("./keyMirror");

var ReactPropTypeLocations = keyMirror({
  prop: null,
  context: null,
  childContext: null
});

module.exports = ReactPropTypeLocations;

},{"./keyMirror":151}],89:[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactPropTypes
 */

'use strict';

var ReactElement = require("./ReactElement");
var ReactFragment = require("./ReactFragment");
var ReactPropTypeLocationNames = require("./ReactPropTypeLocationNames");

var emptyFunction = require("./emptyFunction");

/**
 * Collection of methods that allow declaration and validation of props that are
 * supplied to React components. Example usage:
 *
 *   var Props = require('ReactPropTypes');
 *   var MyArticle = React.createClass({
 *     propTypes: {
 *       // An optional string prop named "description".
 *       description: Props.string,
 *
 *       // A required enum prop named "category".
 *       category: Props.oneOf(['News','Photos']).isRequired,
 *
 *       // A prop named "dialog" that requires an instance of Dialog.
 *       dialog: Props.instanceOf(Dialog).isRequired
 *     },
 *     render: function() { ... }
 *   });
 *
 * A more formal specification of how these methods are used:
 *
 *   type := array|bool|func|object|number|string|oneOf([...])|instanceOf(...)
 *   decl := ReactPropTypes.{type}(.isRequired)?
 *
 * Each and every declaration produces a function with the same signature. This
 * allows the creation of custom validation functions. For example:
 *
 *  var MyLink = React.createClass({
 *    propTypes: {
 *      // An optional string or URI prop named "href".
 *      href: function(props, propName, componentName) {
 *        var propValue = props[propName];
 *        if (propValue != null && typeof propValue !== 'string' &&
 *            !(propValue instanceof URI)) {
 *          return new Error(
 *            'Expected a string or an URI for ' + propName + ' in ' +
 *            componentName
 *          );
 *        }
 *      }
 *    },
 *    render: function() {...}
 *  });
 *
 * @internal
 */

var ANONYMOUS = '<<anonymous>>';

var elementTypeChecker = createElementTypeChecker();
var nodeTypeChecker = createNodeChecker();

var ReactPropTypes = {
  array: createPrimitiveTypeChecker('array'),
  bool: createPrimitiveTypeChecker('boolean'),
  func: createPrimitiveTypeChecker('function'),
  number: createPrimitiveTypeChecker('number'),
  object: createPrimitiveTypeChecker('object'),
  string: createPrimitiveTypeChecker('string'),

  any: createAnyTypeChecker(),
  arrayOf: createArrayOfTypeChecker,
  element: elementTypeChecker,
  instanceOf: createInstanceTypeChecker,
  node: nodeTypeChecker,
  objectOf: createObjectOfTypeChecker,
  oneOf: createEnumTypeChecker,
  oneOfType: createUnionTypeChecker,
  shape: createShapeTypeChecker
};

function createChainableTypeChecker(validate) {
  function checkType(isRequired, props, propName, componentName, location) {
    componentName = componentName || ANONYMOUS;
    if (props[propName] == null) {
      var locationName = ReactPropTypeLocationNames[location];
      if (isRequired) {
        return new Error(
          ("Required " + locationName + " `" + propName + "` was not specified in ") +
          ("`" + componentName + "`.")
        );
      }
      return null;
    } else {
      return validate(props, propName, componentName, location);
    }
  }

  var chainedCheckType = checkType.bind(null, false);
  chainedCheckType.isRequired = checkType.bind(null, true);

  return chainedCheckType;
}

function createPrimitiveTypeChecker(expectedType) {
  function validate(props, propName, componentName, location) {
    var propValue = props[propName];
    var propType = getPropType(propValue);
    if (propType !== expectedType) {
      var locationName = ReactPropTypeLocationNames[location];
      // `propValue` being instance of, say, date/regexp, pass the 'object'
      // check, but we can offer a more precise error message here rather than
      // 'of type `object`'.
      var preciseType = getPreciseType(propValue);

      return new Error(
        ("Invalid " + locationName + " `" + propName + "` of type `" + preciseType + "` ") +
        ("supplied to `" + componentName + "`, expected `" + expectedType + "`.")
      );
    }
    return null;
  }
  return createChainableTypeChecker(validate);
}

function createAnyTypeChecker() {
  return createChainableTypeChecker(emptyFunction.thatReturns(null));
}

function createArrayOfTypeChecker(typeChecker) {
  function validate(props, propName, componentName, location) {
    var propValue = props[propName];
    if (!Array.isArray(propValue)) {
      var locationName = ReactPropTypeLocationNames[location];
      var propType = getPropType(propValue);
      return new Error(
        ("Invalid " + locationName + " `" + propName + "` of type ") +
        ("`" + propType + "` supplied to `" + componentName + "`, expected an array.")
      );
    }
    for (var i = 0; i < propValue.length; i++) {
      var error = typeChecker(propValue, i, componentName, location);
      if (error instanceof Error) {
        return error;
      }
    }
    return null;
  }
  return createChainableTypeChecker(validate);
}

function createElementTypeChecker() {
  function validate(props, propName, componentName, location) {
    if (!ReactElement.isValidElement(props[propName])) {
      var locationName = ReactPropTypeLocationNames[location];
      return new Error(
        ("Invalid " + locationName + " `" + propName + "` supplied to ") +
        ("`" + componentName + "`, expected a ReactElement.")
      );
    }
    return null;
  }
  return createChainableTypeChecker(validate);
}

function createInstanceTypeChecker(expectedClass) {
  function validate(props, propName, componentName, location) {
    if (!(props[propName] instanceof expectedClass)) {
      var locationName = ReactPropTypeLocationNames[location];
      var expectedClassName = expectedClass.name || ANONYMOUS;
      return new Error(
        ("Invalid " + locationName + " `" + propName + "` supplied to ") +
        ("`" + componentName + "`, expected instance of `" + expectedClassName + "`.")
      );
    }
    return null;
  }
  return createChainableTypeChecker(validate);
}

function createEnumTypeChecker(expectedValues) {
  function validate(props, propName, componentName, location) {
    var propValue = props[propName];
    for (var i = 0; i < expectedValues.length; i++) {
      if (propValue === expectedValues[i]) {
        return null;
      }
    }

    var locationName = ReactPropTypeLocationNames[location];
    var valuesString = JSON.stringify(expectedValues);
    return new Error(
      ("Invalid " + locationName + " `" + propName + "` of value `" + propValue + "` ") +
      ("supplied to `" + componentName + "`, expected one of " + valuesString + ".")
    );
  }
  return createChainableTypeChecker(validate);
}

function createObjectOfTypeChecker(typeChecker) {
  function validate(props, propName, componentName, location) {
    var propValue = props[propName];
    var propType = getPropType(propValue);
    if (propType !== 'object') {
      var locationName = ReactPropTypeLocationNames[location];
      return new Error(
        ("Invalid " + locationName + " `" + propName + "` of type ") +
        ("`" + propType + "` supplied to `" + componentName + "`, expected an object.")
      );
    }
    for (var key in propValue) {
      if (propValue.hasOwnProperty(key)) {
        var error = typeChecker(propValue, key, componentName, location);
        if (error instanceof Error) {
          return error;
        }
      }
    }
    return null;
  }
  return createChainableTypeChecker(validate);
}

function createUnionTypeChecker(arrayOfTypeCheckers) {
  function validate(props, propName, componentName, location) {
    for (var i = 0; i < arrayOfTypeCheckers.length; i++) {
      var checker = arrayOfTypeCheckers[i];
      if (checker(props, propName, componentName, location) == null) {
        return null;
      }
    }

    var locationName = ReactPropTypeLocationNames[location];
    return new Error(
      ("Invalid " + locationName + " `" + propName + "` supplied to ") +
      ("`" + componentName + "`.")
    );
  }
  return createChainableTypeChecker(validate);
}

function createNodeChecker() {
  function validate(props, propName, componentName, location) {
    if (!isNode(props[propName])) {
      var locationName = ReactPropTypeLocationNames[location];
      return new Error(
        ("Invalid " + locationName + " `" + propName + "` supplied to ") +
        ("`" + componentName + "`, expected a ReactNode.")
      );
    }
    return null;
  }
  return createChainableTypeChecker(validate);
}

function createShapeTypeChecker(shapeTypes) {
  function validate(props, propName, componentName, location) {
    var propValue = props[propName];
    var propType = getPropType(propValue);
    if (propType !== 'object') {
      var locationName = ReactPropTypeLocationNames[location];
      return new Error(
        ("Invalid " + locationName + " `" + propName + "` of type `" + propType + "` ") +
        ("supplied to `" + componentName + "`, expected `object`.")
      );
    }
    for (var key in shapeTypes) {
      var checker = shapeTypes[key];
      if (!checker) {
        continue;
      }
      var error = checker(propValue, key, componentName, location);
      if (error) {
        return error;
      }
    }
    return null;
  }
  return createChainableTypeChecker(validate);
}

function isNode(propValue) {
  switch (typeof propValue) {
    case 'number':
    case 'string':
    case 'undefined':
      return true;
    case 'boolean':
      return !propValue;
    case 'object':
      if (Array.isArray(propValue)) {
        return propValue.every(isNode);
      }
      if (propValue === null || ReactElement.isValidElement(propValue)) {
        return true;
      }
      propValue = ReactFragment.extractIfFragment(propValue);
      for (var k in propValue) {
        if (!isNode(propValue[k])) {
          return false;
        }
      }
      return true;
    default:
      return false;
  }
}

// Equivalent of `typeof` but with special handling for array and regexp.
function getPropType(propValue) {
  var propType = typeof propValue;
  if (Array.isArray(propValue)) {
    return 'array';
  }
  if (propValue instanceof RegExp) {
    // Old webkits (at least until Android 4.0) return 'function' rather than
    // 'object' for typeof a RegExp. We'll normalize this here so that /bla/
    // passes PropTypes.object.
    return 'object';
  }
  return propType;
}

// This handles more types than `getPropType`. Only used for error messages.
// See `createPrimitiveTypeChecker`.
function getPreciseType(propValue) {
  var propType = getPropType(propValue);
  if (propType === 'object') {
    if (propValue instanceof Date) {
      return 'date';
    } else if (propValue instanceof RegExp) {
      return 'regexp';
    }
  }
  return propType;
}

module.exports = ReactPropTypes;

},{"./ReactElement":68,"./ReactFragment":74,"./ReactPropTypeLocationNames":87,"./emptyFunction":125}],90:[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactPutListenerQueue
 */

'use strict';

var PooledClass = require("./PooledClass");
var ReactBrowserEventEmitter = require("./ReactBrowserEventEmitter");

var assign = require("./Object.assign");

function ReactPutListenerQueue() {
  this.listenersToPut = [];
}

assign(ReactPutListenerQueue.prototype, {
  enqueuePutListener: function(rootNodeID, propKey, propValue) {
    this.listenersToPut.push({
      rootNodeID: rootNodeID,
      propKey: propKey,
      propValue: propValue
    });
  },

  putListeners: function() {
    for (var i = 0; i < this.listenersToPut.length; i++) {
      var listenerToPut = this.listenersToPut[i];
      ReactBrowserEventEmitter.putListener(
        listenerToPut.rootNodeID,
        listenerToPut.propKey,
        listenerToPut.propValue
      );
    }
  },

  reset: function() {
    this.listenersToPut.length = 0;
  },

  destructor: function() {
    this.reset();
  }
});

PooledClass.addPoolingTo(ReactPutListenerQueue);

module.exports = ReactPutListenerQueue;

},{"./Object.assign":37,"./PooledClass":38,"./ReactBrowserEventEmitter":41}],91:[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactReconcileTransaction
 * @typechecks static-only
 */

'use strict';

var CallbackQueue = require("./CallbackQueue");
var PooledClass = require("./PooledClass");
var ReactBrowserEventEmitter = require("./ReactBrowserEventEmitter");
var ReactInputSelection = require("./ReactInputSelection");
var ReactPutListenerQueue = require("./ReactPutListenerQueue");
var Transaction = require("./Transaction");

var assign = require("./Object.assign");

/**
 * Ensures that, when possible, the selection range (currently selected text
 * input) is not disturbed by performing the transaction.
 */
var SELECTION_RESTORATION = {
  /**
   * @return {Selection} Selection information.
   */
  initialize: ReactInputSelection.getSelectionInformation,
  /**
   * @param {Selection} sel Selection information returned from `initialize`.
   */
  close: ReactInputSelection.restoreSelection
};

/**
 * Suppresses events (blur/focus) that could be inadvertently dispatched due to
 * high level DOM manipulations (like temporarily removing a text input from the
 * DOM).
 */
var EVENT_SUPPRESSION = {
  /**
   * @return {boolean} The enabled status of `ReactBrowserEventEmitter` before
   * the reconciliation.
   */
  initialize: function() {
    var currentlyEnabled = ReactBrowserEventEmitter.isEnabled();
    ReactBrowserEventEmitter.setEnabled(false);
    return currentlyEnabled;
  },

  /**
   * @param {boolean} previouslyEnabled Enabled status of
   *   `ReactBrowserEventEmitter` before the reconciliation occured. `close`
   *   restores the previous value.
   */
  close: function(previouslyEnabled) {
    ReactBrowserEventEmitter.setEnabled(previouslyEnabled);
  }
};

/**
 * Provides a queue for collecting `componentDidMount` and
 * `componentDidUpdate` callbacks during the the transaction.
 */
var ON_DOM_READY_QUEUEING = {
  /**
   * Initializes the internal `onDOMReady` queue.
   */
  initialize: function() {
    this.reactMountReady.reset();
  },

  /**
   * After DOM is flushed, invoke all registered `onDOMReady` callbacks.
   */
  close: function() {
    this.reactMountReady.notifyAll();
  }
};

var PUT_LISTENER_QUEUEING = {
  initialize: function() {
    this.putListenerQueue.reset();
  },

  close: function() {
    this.putListenerQueue.putListeners();
  }
};

/**
 * Executed within the scope of the `Transaction` instance. Consider these as
 * being member methods, but with an implied ordering while being isolated from
 * each other.
 */
var TRANSACTION_WRAPPERS = [
  PUT_LISTENER_QUEUEING,
  SELECTION_RESTORATION,
  EVENT_SUPPRESSION,
  ON_DOM_READY_QUEUEING
];

/**
 * Currently:
 * - The order that these are listed in the transaction is critical:
 * - Suppresses events.
 * - Restores selection range.
 *
 * Future:
 * - Restore document/overflow scroll positions that were unintentionally
 *   modified via DOM insertions above the top viewport boundary.
 * - Implement/integrate with customized constraint based layout system and keep
 *   track of which dimensions must be remeasured.
 *
 * @class ReactReconcileTransaction
 */
function ReactReconcileTransaction() {
  this.reinitializeTransaction();
  // Only server-side rendering really needs this option (see
  // `ReactServerRendering`), but server-side uses
  // `ReactServerRenderingTransaction` instead. This option is here so that it's
  // accessible and defaults to false when `ReactDOMComponent` and
  // `ReactTextComponent` checks it in `mountComponent`.`
  this.renderToStaticMarkup = false;
  this.reactMountReady = CallbackQueue.getPooled(null);
  this.putListenerQueue = ReactPutListenerQueue.getPooled();
}

var Mixin = {
  /**
   * @see Transaction
   * @abstract
   * @final
   * @return {array<object>} List of operation wrap proceedures.
   *   TODO: convert to array<TransactionWrapper>
   */
  getTransactionWrappers: function() {
    return TRANSACTION_WRAPPERS;
  },

  /**
   * @return {object} The queue to collect `onDOMReady` callbacks with.
   */
  getReactMountReady: function() {
    return this.reactMountReady;
  },

  getPutListenerQueue: function() {
    return this.putListenerQueue;
  },

  /**
   * `PooledClass` looks for this, and will invoke this before allowing this
   * instance to be resused.
   */
  destructor: function() {
    CallbackQueue.release(this.reactMountReady);
    this.reactMountReady = null;

    ReactPutListenerQueue.release(this.putListenerQueue);
    this.putListenerQueue = null;
  }
};


assign(ReactReconcileTransaction.prototype, Transaction.Mixin, Mixin);

PooledClass.addPoolingTo(ReactReconcileTransaction);

module.exports = ReactReconcileTransaction;

},{"./CallbackQueue":16,"./Object.assign":37,"./PooledClass":38,"./ReactBrowserEventEmitter":41,"./ReactInputSelection":76,"./ReactPutListenerQueue":90,"./Transaction":114}],92:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactReconciler
 */

'use strict';

var ReactRef = require("./ReactRef");
var ReactElementValidator = require("./ReactElementValidator");

/**
 * Helper to call ReactRef.attachRefs with this composite component, split out
 * to avoid allocations in the transaction mount-ready queue.
 */
function attachRefs() {
  ReactRef.attachRefs(this, this._currentElement);
}

var ReactReconciler = {

  /**
   * Initializes the component, renders markup, and registers event listeners.
   *
   * @param {ReactComponent} internalInstance
   * @param {string} rootID DOM ID of the root node.
   * @param {ReactReconcileTransaction|ReactServerRenderingTransaction} transaction
   * @return {?string} Rendered markup to be inserted into the DOM.
   * @final
   * @internal
   */
  mountComponent: function(internalInstance, rootID, transaction, context) {
    var markup = internalInstance.mountComponent(rootID, transaction, context);
    if ("production" !== process.env.NODE_ENV) {
      ReactElementValidator.checkAndWarnForMutatedProps(
        internalInstance._currentElement
      );
    }
    transaction.getReactMountReady().enqueue(attachRefs, internalInstance);
    return markup;
  },

  /**
   * Releases any resources allocated by `mountComponent`.
   *
   * @final
   * @internal
   */
  unmountComponent: function(internalInstance) {
    ReactRef.detachRefs(internalInstance, internalInstance._currentElement);
    internalInstance.unmountComponent();
  },

  /**
   * Update a component using a new element.
   *
   * @param {ReactComponent} internalInstance
   * @param {ReactElement} nextElement
   * @param {ReactReconcileTransaction} transaction
   * @param {object} context
   * @internal
   */
  receiveComponent: function(
    internalInstance, nextElement, transaction, context
  ) {
    var prevElement = internalInstance._currentElement;

    if (nextElement === prevElement && nextElement._owner != null) {
      // Since elements are immutable after the owner is rendered,
      // we can do a cheap identity compare here to determine if this is a
      // superfluous reconcile. It's possible for state to be mutable but such
      // change should trigger an update of the owner which would recreate
      // the element. We explicitly check for the existence of an owner since
      // it's possible for an element created outside a composite to be
      // deeply mutated and reused.
      return;
    }

    if ("production" !== process.env.NODE_ENV) {
      ReactElementValidator.checkAndWarnForMutatedProps(nextElement);
    }

    var refsChanged = ReactRef.shouldUpdateRefs(
      prevElement,
      nextElement
    );

    if (refsChanged) {
      ReactRef.detachRefs(internalInstance, prevElement);
    }

    internalInstance.receiveComponent(nextElement, transaction, context);

    if (refsChanged) {
      transaction.getReactMountReady().enqueue(attachRefs, internalInstance);
    }
  },

  /**
   * Flush any dirty changes in a component.
   *
   * @param {ReactComponent} internalInstance
   * @param {ReactReconcileTransaction} transaction
   * @internal
   */
  performUpdateIfNecessary: function(
    internalInstance,
    transaction
  ) {
    internalInstance.performUpdateIfNecessary(transaction);
  }

};

module.exports = ReactReconciler;

}).call(this,require('_process'))
},{"./ReactElementValidator":69,"./ReactRef":93,"_process":4}],93:[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactRef
 */

'use strict';

var ReactOwner = require("./ReactOwner");

var ReactRef = {};

function attachRef(ref, component, owner) {
  if (typeof ref === 'function') {
    ref(component.getPublicInstance());
  } else {
    // Legacy ref
    ReactOwner.addComponentAsRefTo(component, ref, owner);
  }
}

function detachRef(ref, component, owner) {
  if (typeof ref === 'function') {
    ref(null);
  } else {
    // Legacy ref
    ReactOwner.removeComponentAsRefFrom(component, ref, owner);
  }
}

ReactRef.attachRefs = function(instance, element) {
  var ref = element.ref;
  if (ref != null) {
    attachRef(ref, instance, element._owner);
  }
};

ReactRef.shouldUpdateRefs = function(prevElement, nextElement) {
  // If either the owner or a `ref` has changed, make sure the newest owner
  // has stored a reference to `this`, and the previous owner (if different)
  // has forgotten the reference to `this`. We use the element instead
  // of the public this.props because the post processing cannot determine
  // a ref. The ref conceptually lives on the element.

  // TODO: Should this even be possible? The owner cannot change because
  // it's forbidden by shouldUpdateReactComponent. The ref can change
  // if you swap the keys of but not the refs. Reconsider where this check
  // is made. It probably belongs where the key checking and
  // instantiateReactComponent is done.

  return (
    nextElement._owner !== prevElement._owner ||
    nextElement.ref !== prevElement.ref
  );
};

ReactRef.detachRefs = function(instance, element) {
  var ref = element.ref;
  if (ref != null) {
    detachRef(ref, instance, element._owner);
  }
};

module.exports = ReactRef;

},{"./ReactOwner":85}],94:[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactRootIndex
 * @typechecks
 */

'use strict';

var ReactRootIndexInjection = {
  /**
   * @param {function} _createReactRootIndex
   */
  injectCreateReactRootIndex: function(_createReactRootIndex) {
    ReactRootIndex.createReactRootIndex = _createReactRootIndex;
  }
};

var ReactRootIndex = {
  createReactRootIndex: null,
  injection: ReactRootIndexInjection
};

module.exports = ReactRootIndex;

},{}],95:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @typechecks static-only
 * @providesModule ReactServerRendering
 */
'use strict';

var ReactElement = require("./ReactElement");
var ReactInstanceHandles = require("./ReactInstanceHandles");
var ReactMarkupChecksum = require("./ReactMarkupChecksum");
var ReactServerRenderingTransaction =
  require("./ReactServerRenderingTransaction");

var emptyObject = require("./emptyObject");
var instantiateReactComponent = require("./instantiateReactComponent");
var invariant = require("./invariant");

/**
 * @param {ReactElement} element
 * @return {string} the HTML markup
 */
function renderToString(element) {
  ("production" !== process.env.NODE_ENV ? invariant(
    ReactElement.isValidElement(element),
    'renderToString(): You must pass a valid ReactElement.'
  ) : invariant(ReactElement.isValidElement(element)));

  var transaction;
  try {
    var id = ReactInstanceHandles.createReactRootID();
    transaction = ReactServerRenderingTransaction.getPooled(false);

    return transaction.perform(function() {
      var componentInstance = instantiateReactComponent(element, null);
      var markup =
        componentInstance.mountComponent(id, transaction, emptyObject);
      return ReactMarkupChecksum.addChecksumToMarkup(markup);
    }, null);
  } finally {
    ReactServerRenderingTransaction.release(transaction);
  }
}

/**
 * @param {ReactElement} element
 * @return {string} the HTML markup, without the extra React ID and checksum
 * (for generating static pages)
 */
function renderToStaticMarkup(element) {
  ("production" !== process.env.NODE_ENV ? invariant(
    ReactElement.isValidElement(element),
    'renderToStaticMarkup(): You must pass a valid ReactElement.'
  ) : invariant(ReactElement.isValidElement(element)));

  var transaction;
  try {
    var id = ReactInstanceHandles.createReactRootID();
    transaction = ReactServerRenderingTransaction.getPooled(true);

    return transaction.perform(function() {
      var componentInstance = instantiateReactComponent(element, null);
      return componentInstance.mountComponent(id, transaction, emptyObject);
    }, null);
  } finally {
    ReactServerRenderingTransaction.release(transaction);
  }
}

module.exports = {
  renderToString: renderToString,
  renderToStaticMarkup: renderToStaticMarkup
};

}).call(this,require('_process'))
},{"./ReactElement":68,"./ReactInstanceHandles":77,"./ReactMarkupChecksum":80,"./ReactServerRenderingTransaction":96,"./emptyObject":126,"./instantiateReactComponent":145,"./invariant":146,"_process":4}],96:[function(require,module,exports){
/**
 * Copyright 2014-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactServerRenderingTransaction
 * @typechecks
 */

'use strict';

var PooledClass = require("./PooledClass");
var CallbackQueue = require("./CallbackQueue");
var ReactPutListenerQueue = require("./ReactPutListenerQueue");
var Transaction = require("./Transaction");

var assign = require("./Object.assign");
var emptyFunction = require("./emptyFunction");

/**
 * Provides a `CallbackQueue` queue for collecting `onDOMReady` callbacks
 * during the performing of the transaction.
 */
var ON_DOM_READY_QUEUEING = {
  /**
   * Initializes the internal `onDOMReady` queue.
   */
  initialize: function() {
    this.reactMountReady.reset();
  },

  close: emptyFunction
};

var PUT_LISTENER_QUEUEING = {
  initialize: function() {
    this.putListenerQueue.reset();
  },

  close: emptyFunction
};

/**
 * Executed within the scope of the `Transaction` instance. Consider these as
 * being member methods, but with an implied ordering while being isolated from
 * each other.
 */
var TRANSACTION_WRAPPERS = [
  PUT_LISTENER_QUEUEING,
  ON_DOM_READY_QUEUEING
];

/**
 * @class ReactServerRenderingTransaction
 * @param {boolean} renderToStaticMarkup
 */
function ReactServerRenderingTransaction(renderToStaticMarkup) {
  this.reinitializeTransaction();
  this.renderToStaticMarkup = renderToStaticMarkup;
  this.reactMountReady = CallbackQueue.getPooled(null);
  this.putListenerQueue = ReactPutListenerQueue.getPooled();
}

var Mixin = {
  /**
   * @see Transaction
   * @abstract
   * @final
   * @return {array} Empty list of operation wrap proceedures.
   */
  getTransactionWrappers: function() {
    return TRANSACTION_WRAPPERS;
  },

  /**
   * @return {object} The queue to collect `onDOMReady` callbacks with.
   */
  getReactMountReady: function() {
    return this.reactMountReady;
  },

  getPutListenerQueue: function() {
    return this.putListenerQueue;
  },

  /**
   * `PooledClass` looks for this, and will invoke this before allowing this
   * instance to be resused.
   */
  destructor: function() {
    CallbackQueue.release(this.reactMountReady);
    this.reactMountReady = null;

    ReactPutListenerQueue.release(this.putListenerQueue);
    this.putListenerQueue = null;
  }
};


assign(
  ReactServerRenderingTransaction.prototype,
  Transaction.Mixin,
  Mixin
);

PooledClass.addPoolingTo(ReactServerRenderingTransaction);

module.exports = ReactServerRenderingTransaction;

},{"./CallbackQueue":16,"./Object.assign":37,"./PooledClass":38,"./ReactPutListenerQueue":90,"./Transaction":114,"./emptyFunction":125}],97:[function(require,module,exports){
(function (process){
/**
 * Copyright 2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactUpdateQueue
 */

'use strict';

var ReactLifeCycle = require("./ReactLifeCycle");
var ReactCurrentOwner = require("./ReactCurrentOwner");
var ReactElement = require("./ReactElement");
var ReactInstanceMap = require("./ReactInstanceMap");
var ReactUpdates = require("./ReactUpdates");

var assign = require("./Object.assign");
var invariant = require("./invariant");
var warning = require("./warning");

function enqueueUpdate(internalInstance) {
  if (internalInstance !== ReactLifeCycle.currentlyMountingInstance) {
    // If we're in a componentWillMount handler, don't enqueue a rerender
    // because ReactUpdates assumes we're in a browser context (which is
    // wrong for server rendering) and we're about to do a render anyway.
    // See bug in #1740.
    ReactUpdates.enqueueUpdate(internalInstance);
  }
}

function getInternalInstanceReadyForUpdate(publicInstance, callerName) {
  ("production" !== process.env.NODE_ENV ? invariant(
    ReactCurrentOwner.current == null,
    '%s(...): Cannot update during an existing state transition ' +
    '(such as within `render`). Render methods should be a pure function ' +
    'of props and state.',
    callerName
  ) : invariant(ReactCurrentOwner.current == null));

  var internalInstance = ReactInstanceMap.get(publicInstance);
  if (!internalInstance) {
    if ("production" !== process.env.NODE_ENV) {
      // Only warn when we have a callerName. Otherwise we should be silent.
      // We're probably calling from enqueueCallback. We don't want to warn
      // there because we already warned for the corresponding lifecycle method.
      ("production" !== process.env.NODE_ENV ? warning(
        !callerName,
        '%s(...): Can only update a mounted or mounting component. ' +
        'This usually means you called %s() on an unmounted ' +
        'component. This is a no-op.',
        callerName,
        callerName
      ) : null);
    }
    return null;
  }

  if (internalInstance === ReactLifeCycle.currentlyUnmountingInstance) {
    return null;
  }

  return internalInstance;
}

/**
 * ReactUpdateQueue allows for state updates to be scheduled into a later
 * reconciliation step.
 */
var ReactUpdateQueue = {

  /**
   * Enqueue a callback that will be executed after all the pending updates
   * have processed.
   *
   * @param {ReactClass} publicInstance The instance to use as `this` context.
   * @param {?function} callback Called after state is updated.
   * @internal
   */
  enqueueCallback: function(publicInstance, callback) {
    ("production" !== process.env.NODE_ENV ? invariant(
      typeof callback === 'function',
      'enqueueCallback(...): You called `setProps`, `replaceProps`, ' +
      '`setState`, `replaceState`, or `forceUpdate` with a callback that ' +
      'isn\'t callable.'
    ) : invariant(typeof callback === 'function'));
    var internalInstance = getInternalInstanceReadyForUpdate(publicInstance);

    // Previously we would throw an error if we didn't have an internal
    // instance. Since we want to make it a no-op instead, we mirror the same
    // behavior we have in other enqueue* methods.
    // We also need to ignore callbacks in componentWillMount. See
    // enqueueUpdates.
    if (!internalInstance ||
        internalInstance === ReactLifeCycle.currentlyMountingInstance) {
      return null;
    }

    if (internalInstance._pendingCallbacks) {
      internalInstance._pendingCallbacks.push(callback);
    } else {
      internalInstance._pendingCallbacks = [callback];
    }
    // TODO: The callback here is ignored when setState is called from
    // componentWillMount. Either fix it or disallow doing so completely in
    // favor of getInitialState. Alternatively, we can disallow
    // componentWillMount during server-side rendering.
    enqueueUpdate(internalInstance);
  },

  enqueueCallbackInternal: function(internalInstance, callback) {
    ("production" !== process.env.NODE_ENV ? invariant(
      typeof callback === 'function',
      'enqueueCallback(...): You called `setProps`, `replaceProps`, ' +
      '`setState`, `replaceState`, or `forceUpdate` with a callback that ' +
      'isn\'t callable.'
    ) : invariant(typeof callback === 'function'));
    if (internalInstance._pendingCallbacks) {
      internalInstance._pendingCallbacks.push(callback);
    } else {
      internalInstance._pendingCallbacks = [callback];
    }
    enqueueUpdate(internalInstance);
  },

  /**
   * Forces an update. This should only be invoked when it is known with
   * certainty that we are **not** in a DOM transaction.
   *
   * You may want to call this when you know that some deeper aspect of the
   * component's state has changed but `setState` was not called.
   *
   * This will not invoke `shouldUpdateComponent`, but it will invoke
   * `componentWillUpdate` and `componentDidUpdate`.
   *
   * @param {ReactClass} publicInstance The instance that should rerender.
   * @internal
   */
  enqueueForceUpdate: function(publicInstance) {
    var internalInstance = getInternalInstanceReadyForUpdate(
      publicInstance,
      'forceUpdate'
    );

    if (!internalInstance) {
      return;
    }

    internalInstance._pendingForceUpdate = true;

    enqueueUpdate(internalInstance);
  },

  /**
   * Replaces all of the state. Always use this or `setState` to mutate state.
   * You should treat `this.state` as immutable.
   *
   * There is no guarantee that `this.state` will be immediately updated, so
   * accessing `this.state` after calling this method may return the old value.
   *
   * @param {ReactClass} publicInstance The instance that should rerender.
   * @param {object} completeState Next state.
   * @internal
   */
  enqueueReplaceState: function(publicInstance, completeState) {
    var internalInstance = getInternalInstanceReadyForUpdate(
      publicInstance,
      'replaceState'
    );

    if (!internalInstance) {
      return;
    }

    internalInstance._pendingStateQueue = [completeState];
    internalInstance._pendingReplaceState = true;

    enqueueUpdate(internalInstance);
  },

  /**
   * Sets a subset of the state. This only exists because _pendingState is
   * internal. This provides a merging strategy that is not available to deep
   * properties which is confusing. TODO: Expose pendingState or don't use it
   * during the merge.
   *
   * @param {ReactClass} publicInstance The instance that should rerender.
   * @param {object} partialState Next partial state to be merged with state.
   * @internal
   */
  enqueueSetState: function(publicInstance, partialState) {
    var internalInstance = getInternalInstanceReadyForUpdate(
      publicInstance,
      'setState'
    );

    if (!internalInstance) {
      return;
    }

    var queue =
      internalInstance._pendingStateQueue ||
      (internalInstance._pendingStateQueue = []);
    queue.push(partialState);

    enqueueUpdate(internalInstance);
  },

  /**
   * Sets a subset of the props.
   *
   * @param {ReactClass} publicInstance The instance that should rerender.
   * @param {object} partialProps Subset of the next props.
   * @internal
   */
  enqueueSetProps: function(publicInstance, partialProps) {
    var internalInstance = getInternalInstanceReadyForUpdate(
      publicInstance,
      'setProps'
    );

    if (!internalInstance) {
      return;
    }

    ("production" !== process.env.NODE_ENV ? invariant(
      internalInstance._isTopLevel,
      'setProps(...): You called `setProps` on a ' +
      'component with a parent. This is an anti-pattern since props will ' +
      'get reactively updated when rendered. Instead, change the owner\'s ' +
      '`render` method to pass the correct value as props to the component ' +
      'where it is created.'
    ) : invariant(internalInstance._isTopLevel));

    // Merge with the pending element if it exists, otherwise with existing
    // element props.
    var element = internalInstance._pendingElement ||
                  internalInstance._currentElement;
    var props = assign({}, element.props, partialProps);
    internalInstance._pendingElement = ReactElement.cloneAndReplaceProps(
      element,
      props
    );

    enqueueUpdate(internalInstance);
  },

  /**
   * Replaces all of the props.
   *
   * @param {ReactClass} publicInstance The instance that should rerender.
   * @param {object} props New props.
   * @internal
   */
  enqueueReplaceProps: function(publicInstance, props) {
    var internalInstance = getInternalInstanceReadyForUpdate(
      publicInstance,
      'replaceProps'
    );

    if (!internalInstance) {
      return;
    }

    ("production" !== process.env.NODE_ENV ? invariant(
      internalInstance._isTopLevel,
      'replaceProps(...): You called `replaceProps` on a ' +
      'component with a parent. This is an anti-pattern since props will ' +
      'get reactively updated when rendered. Instead, change the owner\'s ' +
      '`render` method to pass the correct value as props to the component ' +
      'where it is created.'
    ) : invariant(internalInstance._isTopLevel));

    // Merge with the pending element if it exists, otherwise with existing
    // element props.
    var element = internalInstance._pendingElement ||
                  internalInstance._currentElement;
    internalInstance._pendingElement = ReactElement.cloneAndReplaceProps(
      element,
      props
    );

    enqueueUpdate(internalInstance);
  },

  enqueueElementInternal: function(internalInstance, newElement) {
    internalInstance._pendingElement = newElement;
    enqueueUpdate(internalInstance);
  }

};

module.exports = ReactUpdateQueue;

}).call(this,require('_process'))
},{"./Object.assign":37,"./ReactCurrentOwner":50,"./ReactElement":68,"./ReactInstanceMap":78,"./ReactLifeCycle":79,"./ReactUpdates":98,"./invariant":146,"./warning":165,"_process":4}],98:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactUpdates
 */

'use strict';

var CallbackQueue = require("./CallbackQueue");
var PooledClass = require("./PooledClass");
var ReactCurrentOwner = require("./ReactCurrentOwner");
var ReactPerf = require("./ReactPerf");
var ReactReconciler = require("./ReactReconciler");
var Transaction = require("./Transaction");

var assign = require("./Object.assign");
var invariant = require("./invariant");
var warning = require("./warning");

var dirtyComponents = [];
var asapCallbackQueue = CallbackQueue.getPooled();
var asapEnqueued = false;

var batchingStrategy = null;

function ensureInjected() {
  ("production" !== process.env.NODE_ENV ? invariant(
    ReactUpdates.ReactReconcileTransaction && batchingStrategy,
    'ReactUpdates: must inject a reconcile transaction class and batching ' +
    'strategy'
  ) : invariant(ReactUpdates.ReactReconcileTransaction && batchingStrategy));
}

var NESTED_UPDATES = {
  initialize: function() {
    this.dirtyComponentsLength = dirtyComponents.length;
  },
  close: function() {
    if (this.dirtyComponentsLength !== dirtyComponents.length) {
      // Additional updates were enqueued by componentDidUpdate handlers or
      // similar; before our own UPDATE_QUEUEING wrapper closes, we want to run
      // these new updates so that if A's componentDidUpdate calls setState on
      // B, B will update before the callback A's updater provided when calling
      // setState.
      dirtyComponents.splice(0, this.dirtyComponentsLength);
      flushBatchedUpdates();
    } else {
      dirtyComponents.length = 0;
    }
  }
};

var UPDATE_QUEUEING = {
  initialize: function() {
    this.callbackQueue.reset();
  },
  close: function() {
    this.callbackQueue.notifyAll();
  }
};

var TRANSACTION_WRAPPERS = [NESTED_UPDATES, UPDATE_QUEUEING];

function ReactUpdatesFlushTransaction() {
  this.reinitializeTransaction();
  this.dirtyComponentsLength = null;
  this.callbackQueue = CallbackQueue.getPooled();
  this.reconcileTransaction =
    ReactUpdates.ReactReconcileTransaction.getPooled();
}

assign(
  ReactUpdatesFlushTransaction.prototype,
  Transaction.Mixin, {
  getTransactionWrappers: function() {
    return TRANSACTION_WRAPPERS;
  },

  destructor: function() {
    this.dirtyComponentsLength = null;
    CallbackQueue.release(this.callbackQueue);
    this.callbackQueue = null;
    ReactUpdates.ReactReconcileTransaction.release(this.reconcileTransaction);
    this.reconcileTransaction = null;
  },

  perform: function(method, scope, a) {
    // Essentially calls `this.reconcileTransaction.perform(method, scope, a)`
    // with this transaction's wrappers around it.
    return Transaction.Mixin.perform.call(
      this,
      this.reconcileTransaction.perform,
      this.reconcileTransaction,
      method,
      scope,
      a
    );
  }
});

PooledClass.addPoolingTo(ReactUpdatesFlushTransaction);

function batchedUpdates(callback, a, b, c, d) {
  ensureInjected();
  batchingStrategy.batchedUpdates(callback, a, b, c, d);
}

/**
 * Array comparator for ReactComponents by mount ordering.
 *
 * @param {ReactComponent} c1 first component you're comparing
 * @param {ReactComponent} c2 second component you're comparing
 * @return {number} Return value usable by Array.prototype.sort().
 */
function mountOrderComparator(c1, c2) {
  return c1._mountOrder - c2._mountOrder;
}

function runBatchedUpdates(transaction) {
  var len = transaction.dirtyComponentsLength;
  ("production" !== process.env.NODE_ENV ? invariant(
    len === dirtyComponents.length,
    'Expected flush transaction\'s stored dirty-components length (%s) to ' +
    'match dirty-components array length (%s).',
    len,
    dirtyComponents.length
  ) : invariant(len === dirtyComponents.length));

  // Since reconciling a component higher in the owner hierarchy usually (not
  // always -- see shouldComponentUpdate()) will reconcile children, reconcile
  // them before their children by sorting the array.
  dirtyComponents.sort(mountOrderComparator);

  for (var i = 0; i < len; i++) {
    // If a component is unmounted before pending changes apply, it will still
    // be here, but we assume that it has cleared its _pendingCallbacks and
    // that performUpdateIfNecessary is a noop.
    var component = dirtyComponents[i];

    // If performUpdateIfNecessary happens to enqueue any new updates, we
    // shouldn't execute the callbacks until the next render happens, so
    // stash the callbacks first
    var callbacks = component._pendingCallbacks;
    component._pendingCallbacks = null;

    ReactReconciler.performUpdateIfNecessary(
      component,
      transaction.reconcileTransaction
    );

    if (callbacks) {
      for (var j = 0; j < callbacks.length; j++) {
        transaction.callbackQueue.enqueue(
          callbacks[j],
          component.getPublicInstance()
        );
      }
    }
  }
}

var flushBatchedUpdates = function() {
  // ReactUpdatesFlushTransaction's wrappers will clear the dirtyComponents
  // array and perform any updates enqueued by mount-ready handlers (i.e.,
  // componentDidUpdate) but we need to check here too in order to catch
  // updates enqueued by setState callbacks and asap calls.
  while (dirtyComponents.length || asapEnqueued) {
    if (dirtyComponents.length) {
      var transaction = ReactUpdatesFlushTransaction.getPooled();
      transaction.perform(runBatchedUpdates, null, transaction);
      ReactUpdatesFlushTransaction.release(transaction);
    }

    if (asapEnqueued) {
      asapEnqueued = false;
      var queue = asapCallbackQueue;
      asapCallbackQueue = CallbackQueue.getPooled();
      queue.notifyAll();
      CallbackQueue.release(queue);
    }
  }
};
flushBatchedUpdates = ReactPerf.measure(
  'ReactUpdates',
  'flushBatchedUpdates',
  flushBatchedUpdates
);

/**
 * Mark a component as needing a rerender, adding an optional callback to a
 * list of functions which will be executed once the rerender occurs.
 */
function enqueueUpdate(component) {
  ensureInjected();

  // Various parts of our code (such as ReactCompositeComponent's
  // _renderValidatedComponent) assume that calls to render aren't nested;
  // verify that that's the case. (This is called by each top-level update
  // function, like setProps, setState, forceUpdate, etc.; creation and
  // destruction of top-level components is guarded in ReactMount.)
  ("production" !== process.env.NODE_ENV ? warning(
    ReactCurrentOwner.current == null,
    'enqueueUpdate(): Render methods should be a pure function of props ' +
    'and state; triggering nested component updates from render is not ' +
    'allowed. If necessary, trigger nested updates in ' +
    'componentDidUpdate.'
  ) : null);

  if (!batchingStrategy.isBatchingUpdates) {
    batchingStrategy.batchedUpdates(enqueueUpdate, component);
    return;
  }

  dirtyComponents.push(component);
}

/**
 * Enqueue a callback to be run at the end of the current batching cycle. Throws
 * if no updates are currently being performed.
 */
function asap(callback, context) {
  ("production" !== process.env.NODE_ENV ? invariant(
    batchingStrategy.isBatchingUpdates,
    'ReactUpdates.asap: Can\'t enqueue an asap callback in a context where' +
    'updates are not being batched.'
  ) : invariant(batchingStrategy.isBatchingUpdates));
  asapCallbackQueue.enqueue(callback, context);
  asapEnqueued = true;
}

var ReactUpdatesInjection = {
  injectReconcileTransaction: function(ReconcileTransaction) {
    ("production" !== process.env.NODE_ENV ? invariant(
      ReconcileTransaction,
      'ReactUpdates: must provide a reconcile transaction class'
    ) : invariant(ReconcileTransaction));
    ReactUpdates.ReactReconcileTransaction = ReconcileTransaction;
  },

  injectBatchingStrategy: function(_batchingStrategy) {
    ("production" !== process.env.NODE_ENV ? invariant(
      _batchingStrategy,
      'ReactUpdates: must provide a batching strategy'
    ) : invariant(_batchingStrategy));
    ("production" !== process.env.NODE_ENV ? invariant(
      typeof _batchingStrategy.batchedUpdates === 'function',
      'ReactUpdates: must provide a batchedUpdates() function'
    ) : invariant(typeof _batchingStrategy.batchedUpdates === 'function'));
    ("production" !== process.env.NODE_ENV ? invariant(
      typeof _batchingStrategy.isBatchingUpdates === 'boolean',
      'ReactUpdates: must provide an isBatchingUpdates boolean attribute'
    ) : invariant(typeof _batchingStrategy.isBatchingUpdates === 'boolean'));
    batchingStrategy = _batchingStrategy;
  }
};

var ReactUpdates = {
  /**
   * React references `ReactReconcileTransaction` using this property in order
   * to allow dependency injection.
   *
   * @internal
   */
  ReactReconcileTransaction: null,

  batchedUpdates: batchedUpdates,
  enqueueUpdate: enqueueUpdate,
  flushBatchedUpdates: flushBatchedUpdates,
  injection: ReactUpdatesInjection,
  asap: asap
};

module.exports = ReactUpdates;

}).call(this,require('_process'))
},{"./CallbackQueue":16,"./Object.assign":37,"./PooledClass":38,"./ReactCurrentOwner":50,"./ReactPerf":86,"./ReactReconciler":92,"./Transaction":114,"./invariant":146,"./warning":165,"_process":4}],99:[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule SVGDOMPropertyConfig
 */

/*jslint bitwise: true*/

'use strict';

var DOMProperty = require("./DOMProperty");

var MUST_USE_ATTRIBUTE = DOMProperty.injection.MUST_USE_ATTRIBUTE;

var SVGDOMPropertyConfig = {
  Properties: {
    cx: MUST_USE_ATTRIBUTE,
    cy: MUST_USE_ATTRIBUTE,
    d: MUST_USE_ATTRIBUTE,
    dx: MUST_USE_ATTRIBUTE,
    dy: MUST_USE_ATTRIBUTE,
    fill: MUST_USE_ATTRIBUTE,
    fillOpacity: MUST_USE_ATTRIBUTE,
    fontFamily: MUST_USE_ATTRIBUTE,
    fontSize: MUST_USE_ATTRIBUTE,
    fx: MUST_USE_ATTRIBUTE,
    fy: MUST_USE_ATTRIBUTE,
    gradientTransform: MUST_USE_ATTRIBUTE,
    gradientUnits: MUST_USE_ATTRIBUTE,
    markerEnd: MUST_USE_ATTRIBUTE,
    markerMid: MUST_USE_ATTRIBUTE,
    markerStart: MUST_USE_ATTRIBUTE,
    offset: MUST_USE_ATTRIBUTE,
    opacity: MUST_USE_ATTRIBUTE,
    patternContentUnits: MUST_USE_ATTRIBUTE,
    patternUnits: MUST_USE_ATTRIBUTE,
    points: MUST_USE_ATTRIBUTE,
    preserveAspectRatio: MUST_USE_ATTRIBUTE,
    r: MUST_USE_ATTRIBUTE,
    rx: MUST_USE_ATTRIBUTE,
    ry: MUST_USE_ATTRIBUTE,
    spreadMethod: MUST_USE_ATTRIBUTE,
    stopColor: MUST_USE_ATTRIBUTE,
    stopOpacity: MUST_USE_ATTRIBUTE,
    stroke: MUST_USE_ATTRIBUTE,
    strokeDasharray: MUST_USE_ATTRIBUTE,
    strokeLinecap: MUST_USE_ATTRIBUTE,
    strokeOpacity: MUST_USE_ATTRIBUTE,
    strokeWidth: MUST_USE_ATTRIBUTE,
    textAnchor: MUST_USE_ATTRIBUTE,
    transform: MUST_USE_ATTRIBUTE,
    version: MUST_USE_ATTRIBUTE,
    viewBox: MUST_USE_ATTRIBUTE,
    x1: MUST_USE_ATTRIBUTE,
    x2: MUST_USE_ATTRIBUTE,
    x: MUST_USE_ATTRIBUTE,
    y1: MUST_USE_ATTRIBUTE,
    y2: MUST_USE_ATTRIBUTE,
    y: MUST_USE_ATTRIBUTE
  },
  DOMAttributeNames: {
    fillOpacity: 'fill-opacity',
    fontFamily: 'font-family',
    fontSize: 'font-size',
    gradientTransform: 'gradientTransform',
    gradientUnits: 'gradientUnits',
    markerEnd: 'marker-end',
    markerMid: 'marker-mid',
    markerStart: 'marker-start',
    patternContentUnits: 'patternContentUnits',
    patternUnits: 'patternUnits',
    preserveAspectRatio: 'preserveAspectRatio',
    spreadMethod: 'spreadMethod',
    stopColor: 'stop-color',
    stopOpacity: 'stop-opacity',
    strokeDasharray: 'stroke-dasharray',
    strokeLinecap: 'stroke-linecap',
    strokeOpacity: 'stroke-opacity',
    strokeWidth: 'stroke-width',
    textAnchor: 'text-anchor',
    viewBox: 'viewBox'
  }
};

module.exports = SVGDOMPropertyConfig;

},{"./DOMProperty":20}],100:[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule SelectEventPlugin
 */

'use strict';

var EventConstants = require("./EventConstants");
var EventPropagators = require("./EventPropagators");
var ReactInputSelection = require("./ReactInputSelection");
var SyntheticEvent = require("./SyntheticEvent");

var getActiveElement = require("./getActiveElement");
var isTextInputElement = require("./isTextInputElement");
var keyOf = require("./keyOf");
var shallowEqual = require("./shallowEqual");

var topLevelTypes = EventConstants.topLevelTypes;

var eventTypes = {
  select: {
    phasedRegistrationNames: {
      bubbled: keyOf({onSelect: null}),
      captured: keyOf({onSelectCapture: null})
    },
    dependencies: [
      topLevelTypes.topBlur,
      topLevelTypes.topContextMenu,
      topLevelTypes.topFocus,
      topLevelTypes.topKeyDown,
      topLevelTypes.topMouseDown,
      topLevelTypes.topMouseUp,
      topLevelTypes.topSelectionChange
    ]
  }
};

var activeElement = null;
var activeElementID = null;
var lastSelection = null;
var mouseDown = false;

/**
 * Get an object which is a unique representation of the current selection.
 *
 * The return value will not be consistent across nodes or browsers, but
 * two identical selections on the same node will return identical objects.
 *
 * @param {DOMElement} node
 * @param {object}
 */
function getSelection(node) {
  if ('selectionStart' in node &&
      ReactInputSelection.hasSelectionCapabilities(node)) {
    return {
      start: node.selectionStart,
      end: node.selectionEnd
    };
  } else if (window.getSelection) {
    var selection = window.getSelection();
    return {
      anchorNode: selection.anchorNode,
      anchorOffset: selection.anchorOffset,
      focusNode: selection.focusNode,
      focusOffset: selection.focusOffset
    };
  } else if (document.selection) {
    var range = document.selection.createRange();
    return {
      parentElement: range.parentElement(),
      text: range.text,
      top: range.boundingTop,
      left: range.boundingLeft
    };
  }
}

/**
 * Poll selection to see whether it's changed.
 *
 * @param {object} nativeEvent
 * @return {?SyntheticEvent}
 */
function constructSelectEvent(nativeEvent) {
  // Ensure we have the right element, and that the user is not dragging a
  // selection (this matches native `select` event behavior). In HTML5, select
  // fires only on input and textarea thus if there's no focused element we
  // won't dispatch.
  if (mouseDown ||
      activeElement == null ||
      activeElement !== getActiveElement()) {
    return null;
  }

  // Only fire when selection has actually changed.
  var currentSelection = getSelection(activeElement);
  if (!lastSelection || !shallowEqual(lastSelection, currentSelection)) {
    lastSelection = currentSelection;

    var syntheticEvent = SyntheticEvent.getPooled(
      eventTypes.select,
      activeElementID,
      nativeEvent
    );

    syntheticEvent.type = 'select';
    syntheticEvent.target = activeElement;

    EventPropagators.accumulateTwoPhaseDispatches(syntheticEvent);

    return syntheticEvent;
  }
}

/**
 * This plugin creates an `onSelect` event that normalizes select events
 * across form elements.
 *
 * Supported elements are:
 * - input (see `isTextInputElement`)
 * - textarea
 * - contentEditable
 *
 * This differs from native browser implementations in the following ways:
 * - Fires on contentEditable fields as well as inputs.
 * - Fires for collapsed selection.
 * - Fires after user input.
 */
var SelectEventPlugin = {

  eventTypes: eventTypes,

  /**
   * @param {string} topLevelType Record from `EventConstants`.
   * @param {DOMEventTarget} topLevelTarget The listening component root node.
   * @param {string} topLevelTargetID ID of `topLevelTarget`.
   * @param {object} nativeEvent Native browser event.
   * @return {*} An accumulation of synthetic events.
   * @see {EventPluginHub.extractEvents}
   */
  extractEvents: function(
      topLevelType,
      topLevelTarget,
      topLevelTargetID,
      nativeEvent) {

    switch (topLevelType) {
      // Track the input node that has focus.
      case topLevelTypes.topFocus:
        if (isTextInputElement(topLevelTarget) ||
            topLevelTarget.contentEditable === 'true') {
          activeElement = topLevelTarget;
          activeElementID = topLevelTargetID;
          lastSelection = null;
        }
        break;
      case topLevelTypes.topBlur:
        activeElement = null;
        activeElementID = null;
        lastSelection = null;
        break;

      // Don't fire the event while the user is dragging. This matches the
      // semantics of the native select event.
      case topLevelTypes.topMouseDown:
        mouseDown = true;
        break;
      case topLevelTypes.topContextMenu:
      case topLevelTypes.topMouseUp:
        mouseDown = false;
        return constructSelectEvent(nativeEvent);

      // Chrome and IE fire non-standard event when selection is changed (and
      // sometimes when it hasn't).
      // Firefox doesn't support selectionchange, so check selection status
      // after each key entry. The selection changes after keydown and before
      // keyup, but we check on keydown as well in the case of holding down a
      // key, when multiple keydown events are fired but only one keyup is.
      case topLevelTypes.topSelectionChange:
      case topLevelTypes.topKeyDown:
      case topLevelTypes.topKeyUp:
        return constructSelectEvent(nativeEvent);
    }
  }
};

module.exports = SelectEventPlugin;

},{"./EventConstants":25,"./EventPropagators":30,"./ReactInputSelection":76,"./SyntheticEvent":106,"./getActiveElement":132,"./isTextInputElement":149,"./keyOf":152,"./shallowEqual":161}],101:[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ServerReactRootIndex
 * @typechecks
 */

'use strict';

/**
 * Size of the reactRoot ID space. We generate random numbers for React root
 * IDs and if there's a collision the events and DOM update system will
 * get confused. In the future we need a way to generate GUIDs but for
 * now this will work on a smaller scale.
 */
var GLOBAL_MOUNT_POINT_MAX = Math.pow(2, 53);

var ServerReactRootIndex = {
  createReactRootIndex: function() {
    return Math.ceil(Math.random() * GLOBAL_MOUNT_POINT_MAX);
  }
};

module.exports = ServerReactRootIndex;

},{}],102:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule SimpleEventPlugin
 */

'use strict';

var EventConstants = require("./EventConstants");
var EventPluginUtils = require("./EventPluginUtils");
var EventPropagators = require("./EventPropagators");
var SyntheticClipboardEvent = require("./SyntheticClipboardEvent");
var SyntheticEvent = require("./SyntheticEvent");
var SyntheticFocusEvent = require("./SyntheticFocusEvent");
var SyntheticKeyboardEvent = require("./SyntheticKeyboardEvent");
var SyntheticMouseEvent = require("./SyntheticMouseEvent");
var SyntheticDragEvent = require("./SyntheticDragEvent");
var SyntheticTouchEvent = require("./SyntheticTouchEvent");
var SyntheticUIEvent = require("./SyntheticUIEvent");
var SyntheticWheelEvent = require("./SyntheticWheelEvent");

var getEventCharCode = require("./getEventCharCode");

var invariant = require("./invariant");
var keyOf = require("./keyOf");
var warning = require("./warning");

var topLevelTypes = EventConstants.topLevelTypes;

var eventTypes = {
  blur: {
    phasedRegistrationNames: {
      bubbled: keyOf({onBlur: true}),
      captured: keyOf({onBlurCapture: true})
    }
  },
  click: {
    phasedRegistrationNames: {
      bubbled: keyOf({onClick: true}),
      captured: keyOf({onClickCapture: true})
    }
  },
  contextMenu: {
    phasedRegistrationNames: {
      bubbled: keyOf({onContextMenu: true}),
      captured: keyOf({onContextMenuCapture: true})
    }
  },
  copy: {
    phasedRegistrationNames: {
      bubbled: keyOf({onCopy: true}),
      captured: keyOf({onCopyCapture: true})
    }
  },
  cut: {
    phasedRegistrationNames: {
      bubbled: keyOf({onCut: true}),
      captured: keyOf({onCutCapture: true})
    }
  },
  doubleClick: {
    phasedRegistrationNames: {
      bubbled: keyOf({onDoubleClick: true}),
      captured: keyOf({onDoubleClickCapture: true})
    }
  },
  drag: {
    phasedRegistrationNames: {
      bubbled: keyOf({onDrag: true}),
      captured: keyOf({onDragCapture: true})
    }
  },
  dragEnd: {
    phasedRegistrationNames: {
      bubbled: keyOf({onDragEnd: true}),
      captured: keyOf({onDragEndCapture: true})
    }
  },
  dragEnter: {
    phasedRegistrationNames: {
      bubbled: keyOf({onDragEnter: true}),
      captured: keyOf({onDragEnterCapture: true})
    }
  },
  dragExit: {
    phasedRegistrationNames: {
      bubbled: keyOf({onDragExit: true}),
      captured: keyOf({onDragExitCapture: true})
    }
  },
  dragLeave: {
    phasedRegistrationNames: {
      bubbled: keyOf({onDragLeave: true}),
      captured: keyOf({onDragLeaveCapture: true})
    }
  },
  dragOver: {
    phasedRegistrationNames: {
      bubbled: keyOf({onDragOver: true}),
      captured: keyOf({onDragOverCapture: true})
    }
  },
  dragStart: {
    phasedRegistrationNames: {
      bubbled: keyOf({onDragStart: true}),
      captured: keyOf({onDragStartCapture: true})
    }
  },
  drop: {
    phasedRegistrationNames: {
      bubbled: keyOf({onDrop: true}),
      captured: keyOf({onDropCapture: true})
    }
  },
  focus: {
    phasedRegistrationNames: {
      bubbled: keyOf({onFocus: true}),
      captured: keyOf({onFocusCapture: true})
    }
  },
  input: {
    phasedRegistrationNames: {
      bubbled: keyOf({onInput: true}),
      captured: keyOf({onInputCapture: true})
    }
  },
  keyDown: {
    phasedRegistrationNames: {
      bubbled: keyOf({onKeyDown: true}),
      captured: keyOf({onKeyDownCapture: true})
    }
  },
  keyPress: {
    phasedRegistrationNames: {
      bubbled: keyOf({onKeyPress: true}),
      captured: keyOf({onKeyPressCapture: true})
    }
  },
  keyUp: {
    phasedRegistrationNames: {
      bubbled: keyOf({onKeyUp: true}),
      captured: keyOf({onKeyUpCapture: true})
    }
  },
  load: {
    phasedRegistrationNames: {
      bubbled: keyOf({onLoad: true}),
      captured: keyOf({onLoadCapture: true})
    }
  },
  error: {
    phasedRegistrationNames: {
      bubbled: keyOf({onError: true}),
      captured: keyOf({onErrorCapture: true})
    }
  },
  // Note: We do not allow listening to mouseOver events. Instead, use the
  // onMouseEnter/onMouseLeave created by `EnterLeaveEventPlugin`.
  mouseDown: {
    phasedRegistrationNames: {
      bubbled: keyOf({onMouseDown: true}),
      captured: keyOf({onMouseDownCapture: true})
    }
  },
  mouseMove: {
    phasedRegistrationNames: {
      bubbled: keyOf({onMouseMove: true}),
      captured: keyOf({onMouseMoveCapture: true})
    }
  },
  mouseOut: {
    phasedRegistrationNames: {
      bubbled: keyOf({onMouseOut: true}),
      captured: keyOf({onMouseOutCapture: true})
    }
  },
  mouseOver: {
    phasedRegistrationNames: {
      bubbled: keyOf({onMouseOver: true}),
      captured: keyOf({onMouseOverCapture: true})
    }
  },
  mouseUp: {
    phasedRegistrationNames: {
      bubbled: keyOf({onMouseUp: true}),
      captured: keyOf({onMouseUpCapture: true})
    }
  },
  paste: {
    phasedRegistrationNames: {
      bubbled: keyOf({onPaste: true}),
      captured: keyOf({onPasteCapture: true})
    }
  },
  reset: {
    phasedRegistrationNames: {
      bubbled: keyOf({onReset: true}),
      captured: keyOf({onResetCapture: true})
    }
  },
  scroll: {
    phasedRegistrationNames: {
      bubbled: keyOf({onScroll: true}),
      captured: keyOf({onScrollCapture: true})
    }
  },
  submit: {
    phasedRegistrationNames: {
      bubbled: keyOf({onSubmit: true}),
      captured: keyOf({onSubmitCapture: true})
    }
  },
  touchCancel: {
    phasedRegistrationNames: {
      bubbled: keyOf({onTouchCancel: true}),
      captured: keyOf({onTouchCancelCapture: true})
    }
  },
  touchEnd: {
    phasedRegistrationNames: {
      bubbled: keyOf({onTouchEnd: true}),
      captured: keyOf({onTouchEndCapture: true})
    }
  },
  touchMove: {
    phasedRegistrationNames: {
      bubbled: keyOf({onTouchMove: true}),
      captured: keyOf({onTouchMoveCapture: true})
    }
  },
  touchStart: {
    phasedRegistrationNames: {
      bubbled: keyOf({onTouchStart: true}),
      captured: keyOf({onTouchStartCapture: true})
    }
  },
  wheel: {
    phasedRegistrationNames: {
      bubbled: keyOf({onWheel: true}),
      captured: keyOf({onWheelCapture: true})
    }
  }
};

var topLevelEventsToDispatchConfig = {
  topBlur:        eventTypes.blur,
  topClick:       eventTypes.click,
  topContextMenu: eventTypes.contextMenu,
  topCopy:        eventTypes.copy,
  topCut:         eventTypes.cut,
  topDoubleClick: eventTypes.doubleClick,
  topDrag:        eventTypes.drag,
  topDragEnd:     eventTypes.dragEnd,
  topDragEnter:   eventTypes.dragEnter,
  topDragExit:    eventTypes.dragExit,
  topDragLeave:   eventTypes.dragLeave,
  topDragOver:    eventTypes.dragOver,
  topDragStart:   eventTypes.dragStart,
  topDrop:        eventTypes.drop,
  topError:       eventTypes.error,
  topFocus:       eventTypes.focus,
  topInput:       eventTypes.input,
  topKeyDown:     eventTypes.keyDown,
  topKeyPress:    eventTypes.keyPress,
  topKeyUp:       eventTypes.keyUp,
  topLoad:        eventTypes.load,
  topMouseDown:   eventTypes.mouseDown,
  topMouseMove:   eventTypes.mouseMove,
  topMouseOut:    eventTypes.mouseOut,
  topMouseOver:   eventTypes.mouseOver,
  topMouseUp:     eventTypes.mouseUp,
  topPaste:       eventTypes.paste,
  topReset:       eventTypes.reset,
  topScroll:      eventTypes.scroll,
  topSubmit:      eventTypes.submit,
  topTouchCancel: eventTypes.touchCancel,
  topTouchEnd:    eventTypes.touchEnd,
  topTouchMove:   eventTypes.touchMove,
  topTouchStart:  eventTypes.touchStart,
  topWheel:       eventTypes.wheel
};

for (var type in topLevelEventsToDispatchConfig) {
  topLevelEventsToDispatchConfig[type].dependencies = [type];
}

var SimpleEventPlugin = {

  eventTypes: eventTypes,

  /**
   * Same as the default implementation, except cancels the event when return
   * value is false. This behavior will be disabled in a future release.
   *
   * @param {object} Event to be dispatched.
   * @param {function} Application-level callback.
   * @param {string} domID DOM ID to pass to the callback.
   */
  executeDispatch: function(event, listener, domID) {
    var returnValue = EventPluginUtils.executeDispatch(event, listener, domID);

    ("production" !== process.env.NODE_ENV ? warning(
      typeof returnValue !== 'boolean',
      'Returning `false` from an event handler is deprecated and will be ' +
      'ignored in a future release. Instead, manually call ' +
      'e.stopPropagation() or e.preventDefault(), as appropriate.'
    ) : null);

    if (returnValue === false) {
      event.stopPropagation();
      event.preventDefault();
    }
  },

  /**
   * @param {string} topLevelType Record from `EventConstants`.
   * @param {DOMEventTarget} topLevelTarget The listening component root node.
   * @param {string} topLevelTargetID ID of `topLevelTarget`.
   * @param {object} nativeEvent Native browser event.
   * @return {*} An accumulation of synthetic events.
   * @see {EventPluginHub.extractEvents}
   */
  extractEvents: function(
      topLevelType,
      topLevelTarget,
      topLevelTargetID,
      nativeEvent) {
    var dispatchConfig = topLevelEventsToDispatchConfig[topLevelType];
    if (!dispatchConfig) {
      return null;
    }
    var EventConstructor;
    switch (topLevelType) {
      case topLevelTypes.topInput:
      case topLevelTypes.topLoad:
      case topLevelTypes.topError:
      case topLevelTypes.topReset:
      case topLevelTypes.topSubmit:
        // HTML Events
        // @see http://www.w3.org/TR/html5/index.html#events-0
        EventConstructor = SyntheticEvent;
        break;
      case topLevelTypes.topKeyPress:
        // FireFox creates a keypress event for function keys too. This removes
        // the unwanted keypress events. Enter is however both printable and
        // non-printable. One would expect Tab to be as well (but it isn't).
        if (getEventCharCode(nativeEvent) === 0) {
          return null;
        }
        /* falls through */
      case topLevelTypes.topKeyDown:
      case topLevelTypes.topKeyUp:
        EventConstructor = SyntheticKeyboardEvent;
        break;
      case topLevelTypes.topBlur:
      case topLevelTypes.topFocus:
        EventConstructor = SyntheticFocusEvent;
        break;
      case topLevelTypes.topClick:
        // Firefox creates a click event on right mouse clicks. This removes the
        // unwanted click events.
        if (nativeEvent.button === 2) {
          return null;
        }
        /* falls through */
      case topLevelTypes.topContextMenu:
      case topLevelTypes.topDoubleClick:
      case topLevelTypes.topMouseDown:
      case topLevelTypes.topMouseMove:
      case topLevelTypes.topMouseOut:
      case topLevelTypes.topMouseOver:
      case topLevelTypes.topMouseUp:
        EventConstructor = SyntheticMouseEvent;
        break;
      case topLevelTypes.topDrag:
      case topLevelTypes.topDragEnd:
      case topLevelTypes.topDragEnter:
      case topLevelTypes.topDragExit:
      case topLevelTypes.topDragLeave:
      case topLevelTypes.topDragOver:
      case topLevelTypes.topDragStart:
      case topLevelTypes.topDrop:
        EventConstructor = SyntheticDragEvent;
        break;
      case topLevelTypes.topTouchCancel:
      case topLevelTypes.topTouchEnd:
      case topLevelTypes.topTouchMove:
      case topLevelTypes.topTouchStart:
        EventConstructor = SyntheticTouchEvent;
        break;
      case topLevelTypes.topScroll:
        EventConstructor = SyntheticUIEvent;
        break;
      case topLevelTypes.topWheel:
        EventConstructor = SyntheticWheelEvent;
        break;
      case topLevelTypes.topCopy:
      case topLevelTypes.topCut:
      case topLevelTypes.topPaste:
        EventConstructor = SyntheticClipboardEvent;
        break;
    }
    ("production" !== process.env.NODE_ENV ? invariant(
      EventConstructor,
      'SimpleEventPlugin: Unhandled event type, `%s`.',
      topLevelType
    ) : invariant(EventConstructor));
    var event = EventConstructor.getPooled(
      dispatchConfig,
      topLevelTargetID,
      nativeEvent
    );
    EventPropagators.accumulateTwoPhaseDispatches(event);
    return event;
  }

};

module.exports = SimpleEventPlugin;

}).call(this,require('_process'))
},{"./EventConstants":25,"./EventPluginUtils":29,"./EventPropagators":30,"./SyntheticClipboardEvent":103,"./SyntheticDragEvent":105,"./SyntheticEvent":106,"./SyntheticFocusEvent":107,"./SyntheticKeyboardEvent":109,"./SyntheticMouseEvent":110,"./SyntheticTouchEvent":111,"./SyntheticUIEvent":112,"./SyntheticWheelEvent":113,"./getEventCharCode":133,"./invariant":146,"./keyOf":152,"./warning":165,"_process":4}],103:[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule SyntheticClipboardEvent
 * @typechecks static-only
 */

'use strict';

var SyntheticEvent = require("./SyntheticEvent");

/**
 * @interface Event
 * @see http://www.w3.org/TR/clipboard-apis/
 */
var ClipboardEventInterface = {
  clipboardData: function(event) {
    return (
      'clipboardData' in event ?
        event.clipboardData :
        window.clipboardData
    );
  }
};

/**
 * @param {object} dispatchConfig Configuration used to dispatch this event.
 * @param {string} dispatchMarker Marker identifying the event target.
 * @param {object} nativeEvent Native browser event.
 * @extends {SyntheticUIEvent}
 */
function SyntheticClipboardEvent(dispatchConfig, dispatchMarker, nativeEvent) {
  SyntheticEvent.call(this, dispatchConfig, dispatchMarker, nativeEvent);
}

SyntheticEvent.augmentClass(SyntheticClipboardEvent, ClipboardEventInterface);

module.exports = SyntheticClipboardEvent;

},{"./SyntheticEvent":106}],104:[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule SyntheticCompositionEvent
 * @typechecks static-only
 */

'use strict';

var SyntheticEvent = require("./SyntheticEvent");

/**
 * @interface Event
 * @see http://www.w3.org/TR/DOM-Level-3-Events/#events-compositionevents
 */
var CompositionEventInterface = {
  data: null
};

/**
 * @param {object} dispatchConfig Configuration used to dispatch this event.
 * @param {string} dispatchMarker Marker identifying the event target.
 * @param {object} nativeEvent Native browser event.
 * @extends {SyntheticUIEvent}
 */
function SyntheticCompositionEvent(
  dispatchConfig,
  dispatchMarker,
  nativeEvent) {
  SyntheticEvent.call(this, dispatchConfig, dispatchMarker, nativeEvent);
}

SyntheticEvent.augmentClass(
  SyntheticCompositionEvent,
  CompositionEventInterface
);

module.exports = SyntheticCompositionEvent;

},{"./SyntheticEvent":106}],105:[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule SyntheticDragEvent
 * @typechecks static-only
 */

'use strict';

var SyntheticMouseEvent = require("./SyntheticMouseEvent");

/**
 * @interface DragEvent
 * @see http://www.w3.org/TR/DOM-Level-3-Events/
 */
var DragEventInterface = {
  dataTransfer: null
};

/**
 * @param {object} dispatchConfig Configuration used to dispatch this event.
 * @param {string} dispatchMarker Marker identifying the event target.
 * @param {object} nativeEvent Native browser event.
 * @extends {SyntheticUIEvent}
 */
function SyntheticDragEvent(dispatchConfig, dispatchMarker, nativeEvent) {
  SyntheticMouseEvent.call(this, dispatchConfig, dispatchMarker, nativeEvent);
}

SyntheticMouseEvent.augmentClass(SyntheticDragEvent, DragEventInterface);

module.exports = SyntheticDragEvent;

},{"./SyntheticMouseEvent":110}],106:[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule SyntheticEvent
 * @typechecks static-only
 */

'use strict';

var PooledClass = require("./PooledClass");

var assign = require("./Object.assign");
var emptyFunction = require("./emptyFunction");
var getEventTarget = require("./getEventTarget");

/**
 * @interface Event
 * @see http://www.w3.org/TR/DOM-Level-3-Events/
 */
var EventInterface = {
  type: null,
  target: getEventTarget,
  // currentTarget is set when dispatching; no use in copying it here
  currentTarget: emptyFunction.thatReturnsNull,
  eventPhase: null,
  bubbles: null,
  cancelable: null,
  timeStamp: function(event) {
    return event.timeStamp || Date.now();
  },
  defaultPrevented: null,
  isTrusted: null
};

/**
 * Synthetic events are dispatched by event plugins, typically in response to a
 * top-level event delegation handler.
 *
 * These systems should generally use pooling to reduce the frequency of garbage
 * collection. The system should check `isPersistent` to determine whether the
 * event should be released into the pool after being dispatched. Users that
 * need a persisted event should invoke `persist`.
 *
 * Synthetic events (and subclasses) implement the DOM Level 3 Events API by
 * normalizing browser quirks. Subclasses do not necessarily have to implement a
 * DOM interface; custom application-specific events can also subclass this.
 *
 * @param {object} dispatchConfig Configuration used to dispatch this event.
 * @param {string} dispatchMarker Marker identifying the event target.
 * @param {object} nativeEvent Native browser event.
 */
function SyntheticEvent(dispatchConfig, dispatchMarker, nativeEvent) {
  this.dispatchConfig = dispatchConfig;
  this.dispatchMarker = dispatchMarker;
  this.nativeEvent = nativeEvent;

  var Interface = this.constructor.Interface;
  for (var propName in Interface) {
    if (!Interface.hasOwnProperty(propName)) {
      continue;
    }
    var normalize = Interface[propName];
    if (normalize) {
      this[propName] = normalize(nativeEvent);
    } else {
      this[propName] = nativeEvent[propName];
    }
  }

  var defaultPrevented = nativeEvent.defaultPrevented != null ?
    nativeEvent.defaultPrevented :
    nativeEvent.returnValue === false;
  if (defaultPrevented) {
    this.isDefaultPrevented = emptyFunction.thatReturnsTrue;
  } else {
    this.isDefaultPrevented = emptyFunction.thatReturnsFalse;
  }
  this.isPropagationStopped = emptyFunction.thatReturnsFalse;
}

assign(SyntheticEvent.prototype, {

  preventDefault: function() {
    this.defaultPrevented = true;
    var event = this.nativeEvent;
    if (event.preventDefault) {
      event.preventDefault();
    } else {
      event.returnValue = false;
    }
    this.isDefaultPrevented = emptyFunction.thatReturnsTrue;
  },

  stopPropagation: function() {
    var event = this.nativeEvent;
    if (event.stopPropagation) {
      event.stopPropagation();
    } else {
      event.cancelBubble = true;
    }
    this.isPropagationStopped = emptyFunction.thatReturnsTrue;
  },

  /**
   * We release all dispatched `SyntheticEvent`s after each event loop, adding
   * them back into the pool. This allows a way to hold onto a reference that
   * won't be added back into the pool.
   */
  persist: function() {
    this.isPersistent = emptyFunction.thatReturnsTrue;
  },

  /**
   * Checks if this event should be released back into the pool.
   *
   * @return {boolean} True if this should not be released, false otherwise.
   */
  isPersistent: emptyFunction.thatReturnsFalse,

  /**
   * `PooledClass` looks for `destructor` on each instance it releases.
   */
  destructor: function() {
    var Interface = this.constructor.Interface;
    for (var propName in Interface) {
      this[propName] = null;
    }
    this.dispatchConfig = null;
    this.dispatchMarker = null;
    this.nativeEvent = null;
  }

});

SyntheticEvent.Interface = EventInterface;

/**
 * Helper to reduce boilerplate when creating subclasses.
 *
 * @param {function} Class
 * @param {?object} Interface
 */
SyntheticEvent.augmentClass = function(Class, Interface) {
  var Super = this;

  var prototype = Object.create(Super.prototype);
  assign(prototype, Class.prototype);
  Class.prototype = prototype;
  Class.prototype.constructor = Class;

  Class.Interface = assign({}, Super.Interface, Interface);
  Class.augmentClass = Super.augmentClass;

  PooledClass.addPoolingTo(Class, PooledClass.threeArgumentPooler);
};

PooledClass.addPoolingTo(SyntheticEvent, PooledClass.threeArgumentPooler);

module.exports = SyntheticEvent;

},{"./Object.assign":37,"./PooledClass":38,"./emptyFunction":125,"./getEventTarget":136}],107:[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule SyntheticFocusEvent
 * @typechecks static-only
 */

'use strict';

var SyntheticUIEvent = require("./SyntheticUIEvent");

/**
 * @interface FocusEvent
 * @see http://www.w3.org/TR/DOM-Level-3-Events/
 */
var FocusEventInterface = {
  relatedTarget: null
};

/**
 * @param {object} dispatchConfig Configuration used to dispatch this event.
 * @param {string} dispatchMarker Marker identifying the event target.
 * @param {object} nativeEvent Native browser event.
 * @extends {SyntheticUIEvent}
 */
function SyntheticFocusEvent(dispatchConfig, dispatchMarker, nativeEvent) {
  SyntheticUIEvent.call(this, dispatchConfig, dispatchMarker, nativeEvent);
}

SyntheticUIEvent.augmentClass(SyntheticFocusEvent, FocusEventInterface);

module.exports = SyntheticFocusEvent;

},{"./SyntheticUIEvent":112}],108:[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule SyntheticInputEvent
 * @typechecks static-only
 */

'use strict';

var SyntheticEvent = require("./SyntheticEvent");

/**
 * @interface Event
 * @see http://www.w3.org/TR/2013/WD-DOM-Level-3-Events-20131105
 *      /#events-inputevents
 */
var InputEventInterface = {
  data: null
};

/**
 * @param {object} dispatchConfig Configuration used to dispatch this event.
 * @param {string} dispatchMarker Marker identifying the event target.
 * @param {object} nativeEvent Native browser event.
 * @extends {SyntheticUIEvent}
 */
function SyntheticInputEvent(
  dispatchConfig,
  dispatchMarker,
  nativeEvent) {
  SyntheticEvent.call(this, dispatchConfig, dispatchMarker, nativeEvent);
}

SyntheticEvent.augmentClass(
  SyntheticInputEvent,
  InputEventInterface
);

module.exports = SyntheticInputEvent;

},{"./SyntheticEvent":106}],109:[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule SyntheticKeyboardEvent
 * @typechecks static-only
 */

'use strict';

var SyntheticUIEvent = require("./SyntheticUIEvent");

var getEventCharCode = require("./getEventCharCode");
var getEventKey = require("./getEventKey");
var getEventModifierState = require("./getEventModifierState");

/**
 * @interface KeyboardEvent
 * @see http://www.w3.org/TR/DOM-Level-3-Events/
 */
var KeyboardEventInterface = {
  key: getEventKey,
  location: null,
  ctrlKey: null,
  shiftKey: null,
  altKey: null,
  metaKey: null,
  repeat: null,
  locale: null,
  getModifierState: getEventModifierState,
  // Legacy Interface
  charCode: function(event) {
    // `charCode` is the result of a KeyPress event and represents the value of
    // the actual printable character.

    // KeyPress is deprecated, but its replacement is not yet final and not
    // implemented in any major browser. Only KeyPress has charCode.
    if (event.type === 'keypress') {
      return getEventCharCode(event);
    }
    return 0;
  },
  keyCode: function(event) {
    // `keyCode` is the result of a KeyDown/Up event and represents the value of
    // physical keyboard key.

    // The actual meaning of the value depends on the users' keyboard layout
    // which cannot be detected. Assuming that it is a US keyboard layout
    // provides a surprisingly accurate mapping for US and European users.
    // Due to this, it is left to the user to implement at this time.
    if (event.type === 'keydown' || event.type === 'keyup') {
      return event.keyCode;
    }
    return 0;
  },
  which: function(event) {
    // `which` is an alias for either `keyCode` or `charCode` depending on the
    // type of the event.
    if (event.type === 'keypress') {
      return getEventCharCode(event);
    }
    if (event.type === 'keydown' || event.type === 'keyup') {
      return event.keyCode;
    }
    return 0;
  }
};

/**
 * @param {object} dispatchConfig Configuration used to dispatch this event.
 * @param {string} dispatchMarker Marker identifying the event target.
 * @param {object} nativeEvent Native browser event.
 * @extends {SyntheticUIEvent}
 */
function SyntheticKeyboardEvent(dispatchConfig, dispatchMarker, nativeEvent) {
  SyntheticUIEvent.call(this, dispatchConfig, dispatchMarker, nativeEvent);
}

SyntheticUIEvent.augmentClass(SyntheticKeyboardEvent, KeyboardEventInterface);

module.exports = SyntheticKeyboardEvent;

},{"./SyntheticUIEvent":112,"./getEventCharCode":133,"./getEventKey":134,"./getEventModifierState":135}],110:[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule SyntheticMouseEvent
 * @typechecks static-only
 */

'use strict';

var SyntheticUIEvent = require("./SyntheticUIEvent");
var ViewportMetrics = require("./ViewportMetrics");

var getEventModifierState = require("./getEventModifierState");

/**
 * @interface MouseEvent
 * @see http://www.w3.org/TR/DOM-Level-3-Events/
 */
var MouseEventInterface = {
  screenX: null,
  screenY: null,
  clientX: null,
  clientY: null,
  ctrlKey: null,
  shiftKey: null,
  altKey: null,
  metaKey: null,
  getModifierState: getEventModifierState,
  button: function(event) {
    // Webkit, Firefox, IE9+
    // which:  1 2 3
    // button: 0 1 2 (standard)
    var button = event.button;
    if ('which' in event) {
      return button;
    }
    // IE<9
    // which:  undefined
    // button: 0 0 0
    // button: 1 4 2 (onmouseup)
    return button === 2 ? 2 : button === 4 ? 1 : 0;
  },
  buttons: null,
  relatedTarget: function(event) {
    return event.relatedTarget || (
      ((event.fromElement === event.srcElement ? event.toElement : event.fromElement))
    );
  },
  // "Proprietary" Interface.
  pageX: function(event) {
    return 'pageX' in event ?
      event.pageX :
      event.clientX + ViewportMetrics.currentScrollLeft;
  },
  pageY: function(event) {
    return 'pageY' in event ?
      event.pageY :
      event.clientY + ViewportMetrics.currentScrollTop;
  }
};

/**
 * @param {object} dispatchConfig Configuration used to dispatch this event.
 * @param {string} dispatchMarker Marker identifying the event target.
 * @param {object} nativeEvent Native browser event.
 * @extends {SyntheticUIEvent}
 */
function SyntheticMouseEvent(dispatchConfig, dispatchMarker, nativeEvent) {
  SyntheticUIEvent.call(this, dispatchConfig, dispatchMarker, nativeEvent);
}

SyntheticUIEvent.augmentClass(SyntheticMouseEvent, MouseEventInterface);

module.exports = SyntheticMouseEvent;

},{"./SyntheticUIEvent":112,"./ViewportMetrics":115,"./getEventModifierState":135}],111:[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule SyntheticTouchEvent
 * @typechecks static-only
 */

'use strict';

var SyntheticUIEvent = require("./SyntheticUIEvent");

var getEventModifierState = require("./getEventModifierState");

/**
 * @interface TouchEvent
 * @see http://www.w3.org/TR/touch-events/
 */
var TouchEventInterface = {
  touches: null,
  targetTouches: null,
  changedTouches: null,
  altKey: null,
  metaKey: null,
  ctrlKey: null,
  shiftKey: null,
  getModifierState: getEventModifierState
};

/**
 * @param {object} dispatchConfig Configuration used to dispatch this event.
 * @param {string} dispatchMarker Marker identifying the event target.
 * @param {object} nativeEvent Native browser event.
 * @extends {SyntheticUIEvent}
 */
function SyntheticTouchEvent(dispatchConfig, dispatchMarker, nativeEvent) {
  SyntheticUIEvent.call(this, dispatchConfig, dispatchMarker, nativeEvent);
}

SyntheticUIEvent.augmentClass(SyntheticTouchEvent, TouchEventInterface);

module.exports = SyntheticTouchEvent;

},{"./SyntheticUIEvent":112,"./getEventModifierState":135}],112:[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule SyntheticUIEvent
 * @typechecks static-only
 */

'use strict';

var SyntheticEvent = require("./SyntheticEvent");

var getEventTarget = require("./getEventTarget");

/**
 * @interface UIEvent
 * @see http://www.w3.org/TR/DOM-Level-3-Events/
 */
var UIEventInterface = {
  view: function(event) {
    if (event.view) {
      return event.view;
    }

    var target = getEventTarget(event);
    if (target != null && target.window === target) {
      // target is a window object
      return target;
    }

    var doc = target.ownerDocument;
    // TODO: Figure out why `ownerDocument` is sometimes undefined in IE8.
    if (doc) {
      return doc.defaultView || doc.parentWindow;
    } else {
      return window;
    }
  },
  detail: function(event) {
    return event.detail || 0;
  }
};

/**
 * @param {object} dispatchConfig Configuration used to dispatch this event.
 * @param {string} dispatchMarker Marker identifying the event target.
 * @param {object} nativeEvent Native browser event.
 * @extends {SyntheticEvent}
 */
function SyntheticUIEvent(dispatchConfig, dispatchMarker, nativeEvent) {
  SyntheticEvent.call(this, dispatchConfig, dispatchMarker, nativeEvent);
}

SyntheticEvent.augmentClass(SyntheticUIEvent, UIEventInterface);

module.exports = SyntheticUIEvent;

},{"./SyntheticEvent":106,"./getEventTarget":136}],113:[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule SyntheticWheelEvent
 * @typechecks static-only
 */

'use strict';

var SyntheticMouseEvent = require("./SyntheticMouseEvent");

/**
 * @interface WheelEvent
 * @see http://www.w3.org/TR/DOM-Level-3-Events/
 */
var WheelEventInterface = {
  deltaX: function(event) {
    return (
      'deltaX' in event ? event.deltaX :
      // Fallback to `wheelDeltaX` for Webkit and normalize (right is positive).
      'wheelDeltaX' in event ? -event.wheelDeltaX : 0
    );
  },
  deltaY: function(event) {
    return (
      'deltaY' in event ? event.deltaY :
      // Fallback to `wheelDeltaY` for Webkit and normalize (down is positive).
      'wheelDeltaY' in event ? -event.wheelDeltaY :
      // Fallback to `wheelDelta` for IE<9 and normalize (down is positive).
      'wheelDelta' in event ? -event.wheelDelta : 0
    );
  },
  deltaZ: null,

  // Browsers without "deltaMode" is reporting in raw wheel delta where one
  // notch on the scroll is always +/- 120, roughly equivalent to pixels.
  // A good approximation of DOM_DELTA_LINE (1) is 5% of viewport size or
  // ~40 pixels, for DOM_DELTA_SCREEN (2) it is 87.5% of viewport size.
  deltaMode: null
};

/**
 * @param {object} dispatchConfig Configuration used to dispatch this event.
 * @param {string} dispatchMarker Marker identifying the event target.
 * @param {object} nativeEvent Native browser event.
 * @extends {SyntheticMouseEvent}
 */
function SyntheticWheelEvent(dispatchConfig, dispatchMarker, nativeEvent) {
  SyntheticMouseEvent.call(this, dispatchConfig, dispatchMarker, nativeEvent);
}

SyntheticMouseEvent.augmentClass(SyntheticWheelEvent, WheelEventInterface);

module.exports = SyntheticWheelEvent;

},{"./SyntheticMouseEvent":110}],114:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule Transaction
 */

'use strict';

var invariant = require("./invariant");

/**
 * `Transaction` creates a black box that is able to wrap any method such that
 * certain invariants are maintained before and after the method is invoked
 * (Even if an exception is thrown while invoking the wrapped method). Whoever
 * instantiates a transaction can provide enforcers of the invariants at
 * creation time. The `Transaction` class itself will supply one additional
 * automatic invariant for you - the invariant that any transaction instance
 * should not be run while it is already being run. You would typically create a
 * single instance of a `Transaction` for reuse multiple times, that potentially
 * is used to wrap several different methods. Wrappers are extremely simple -
 * they only require implementing two methods.
 *
 * <pre>
 *                       wrappers (injected at creation time)
 *                                      +        +
 *                                      |        |
 *                    +-----------------|--------|--------------+
 *                    |                 v        |              |
 *                    |      +---------------+   |              |
 *                    |   +--|    wrapper1   |---|----+         |
 *                    |   |  +---------------+   v    |         |
 *                    |   |          +-------------+  |         |
 *                    |   |     +----|   wrapper2  |--------+   |
 *                    |   |     |    +-------------+  |     |   |
 *                    |   |     |                     |     |   |
 *                    |   v     v                     v     v   | wrapper
 *                    | +---+ +---+   +---------+   +---+ +---+ | invariants
 * perform(anyMethod) | |   | |   |   |         |   |   | |   | | maintained
 * +----------------->|-|---|-|---|-->|anyMethod|---|---|-|---|-|-------->
 *                    | |   | |   |   |         |   |   | |   | |
 *                    | |   | |   |   |         |   |   | |   | |
 *                    | |   | |   |   |         |   |   | |   | |
 *                    | +---+ +---+   +---------+   +---+ +---+ |
 *                    |  initialize                    close    |
 *                    +-----------------------------------------+
 * </pre>
 *
 * Use cases:
 * - Preserving the input selection ranges before/after reconciliation.
 *   Restoring selection even in the event of an unexpected error.
 * - Deactivating events while rearranging the DOM, preventing blurs/focuses,
 *   while guaranteeing that afterwards, the event system is reactivated.
 * - Flushing a queue of collected DOM mutations to the main UI thread after a
 *   reconciliation takes place in a worker thread.
 * - Invoking any collected `componentDidUpdate` callbacks after rendering new
 *   content.
 * - (Future use case): Wrapping particular flushes of the `ReactWorker` queue
 *   to preserve the `scrollTop` (an automatic scroll aware DOM).
 * - (Future use case): Layout calculations before and after DOM updates.
 *
 * Transactional plugin API:
 * - A module that has an `initialize` method that returns any precomputation.
 * - and a `close` method that accepts the precomputation. `close` is invoked
 *   when the wrapped process is completed, or has failed.
 *
 * @param {Array<TransactionalWrapper>} transactionWrapper Wrapper modules
 * that implement `initialize` and `close`.
 * @return {Transaction} Single transaction for reuse in thread.
 *
 * @class Transaction
 */
var Mixin = {
  /**
   * Sets up this instance so that it is prepared for collecting metrics. Does
   * so such that this setup method may be used on an instance that is already
   * initialized, in a way that does not consume additional memory upon reuse.
   * That can be useful if you decide to make your subclass of this mixin a
   * "PooledClass".
   */
  reinitializeTransaction: function() {
    this.transactionWrappers = this.getTransactionWrappers();
    if (!this.wrapperInitData) {
      this.wrapperInitData = [];
    } else {
      this.wrapperInitData.length = 0;
    }
    this._isInTransaction = false;
  },

  _isInTransaction: false,

  /**
   * @abstract
   * @return {Array<TransactionWrapper>} Array of transaction wrappers.
   */
  getTransactionWrappers: null,

  isInTransaction: function() {
    return !!this._isInTransaction;
  },

  /**
   * Executes the function within a safety window. Use this for the top level
   * methods that result in large amounts of computation/mutations that would
   * need to be safety checked.
   *
   * @param {function} method Member of scope to call.
   * @param {Object} scope Scope to invoke from.
   * @param {Object?=} args... Arguments to pass to the method (optional).
   *                           Helps prevent need to bind in many cases.
   * @return Return value from `method`.
   */
  perform: function(method, scope, a, b, c, d, e, f) {
    ("production" !== process.env.NODE_ENV ? invariant(
      !this.isInTransaction(),
      'Transaction.perform(...): Cannot initialize a transaction when there ' +
      'is already an outstanding transaction.'
    ) : invariant(!this.isInTransaction()));
    var errorThrown;
    var ret;
    try {
      this._isInTransaction = true;
      // Catching errors makes debugging more difficult, so we start with
      // errorThrown set to true before setting it to false after calling
      // close -- if it's still set to true in the finally block, it means
      // one of these calls threw.
      errorThrown = true;
      this.initializeAll(0);
      ret = method.call(scope, a, b, c, d, e, f);
      errorThrown = false;
    } finally {
      try {
        if (errorThrown) {
          // If `method` throws, prefer to show that stack trace over any thrown
          // by invoking `closeAll`.
          try {
            this.closeAll(0);
          } catch (err) {
          }
        } else {
          // Since `method` didn't throw, we don't want to silence the exception
          // here.
          this.closeAll(0);
        }
      } finally {
        this._isInTransaction = false;
      }
    }
    return ret;
  },

  initializeAll: function(startIndex) {
    var transactionWrappers = this.transactionWrappers;
    for (var i = startIndex; i < transactionWrappers.length; i++) {
      var wrapper = transactionWrappers[i];
      try {
        // Catching errors makes debugging more difficult, so we start with the
        // OBSERVED_ERROR state before overwriting it with the real return value
        // of initialize -- if it's still set to OBSERVED_ERROR in the finally
        // block, it means wrapper.initialize threw.
        this.wrapperInitData[i] = Transaction.OBSERVED_ERROR;
        this.wrapperInitData[i] = wrapper.initialize ?
          wrapper.initialize.call(this) :
          null;
      } finally {
        if (this.wrapperInitData[i] === Transaction.OBSERVED_ERROR) {
          // The initializer for wrapper i threw an error; initialize the
          // remaining wrappers but silence any exceptions from them to ensure
          // that the first error is the one to bubble up.
          try {
            this.initializeAll(i + 1);
          } catch (err) {
          }
        }
      }
    }
  },

  /**
   * Invokes each of `this.transactionWrappers.close[i]` functions, passing into
   * them the respective return values of `this.transactionWrappers.init[i]`
   * (`close`rs that correspond to initializers that failed will not be
   * invoked).
   */
  closeAll: function(startIndex) {
    ("production" !== process.env.NODE_ENV ? invariant(
      this.isInTransaction(),
      'Transaction.closeAll(): Cannot close transaction when none are open.'
    ) : invariant(this.isInTransaction()));
    var transactionWrappers = this.transactionWrappers;
    for (var i = startIndex; i < transactionWrappers.length; i++) {
      var wrapper = transactionWrappers[i];
      var initData = this.wrapperInitData[i];
      var errorThrown;
      try {
        // Catching errors makes debugging more difficult, so we start with
        // errorThrown set to true before setting it to false after calling
        // close -- if it's still set to true in the finally block, it means
        // wrapper.close threw.
        errorThrown = true;
        if (initData !== Transaction.OBSERVED_ERROR && wrapper.close) {
          wrapper.close.call(this, initData);
        }
        errorThrown = false;
      } finally {
        if (errorThrown) {
          // The closer for wrapper i threw an error; close the remaining
          // wrappers but silence any exceptions from them to ensure that the
          // first error is the one to bubble up.
          try {
            this.closeAll(i + 1);
          } catch (e) {
          }
        }
      }
    }
    this.wrapperInitData.length = 0;
  }
};

var Transaction = {

  Mixin: Mixin,

  /**
   * Token to look for to determine if an error occured.
   */
  OBSERVED_ERROR: {}

};

module.exports = Transaction;

}).call(this,require('_process'))
},{"./invariant":146,"_process":4}],115:[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ViewportMetrics
 */

'use strict';

var ViewportMetrics = {

  currentScrollLeft: 0,

  currentScrollTop: 0,

  refreshScrollValues: function(scrollPosition) {
    ViewportMetrics.currentScrollLeft = scrollPosition.x;
    ViewportMetrics.currentScrollTop = scrollPosition.y;
  }

};

module.exports = ViewportMetrics;

},{}],116:[function(require,module,exports){
(function (process){
/**
 * Copyright 2014-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule accumulateInto
 */

'use strict';

var invariant = require("./invariant");

/**
 *
 * Accumulates items that must not be null or undefined into the first one. This
 * is used to conserve memory by avoiding array allocations, and thus sacrifices
 * API cleanness. Since `current` can be null before being passed in and not
 * null after this function, make sure to assign it back to `current`:
 *
 * `a = accumulateInto(a, b);`
 *
 * This API should be sparingly used. Try `accumulate` for something cleaner.
 *
 * @return {*|array<*>} An accumulation of items.
 */

function accumulateInto(current, next) {
  ("production" !== process.env.NODE_ENV ? invariant(
    next != null,
    'accumulateInto(...): Accumulated items must not be null or undefined.'
  ) : invariant(next != null));
  if (current == null) {
    return next;
  }

  // Both are not empty. Warning: Never call x.concat(y) when you are not
  // certain that x is an Array (x could be a string with concat method).
  var currentIsArray = Array.isArray(current);
  var nextIsArray = Array.isArray(next);

  if (currentIsArray && nextIsArray) {
    current.push.apply(current, next);
    return current;
  }

  if (currentIsArray) {
    current.push(next);
    return current;
  }

  if (nextIsArray) {
    // A bit too dangerous to mutate `next`.
    return [current].concat(next);
  }

  return [current, next];
}

module.exports = accumulateInto;

}).call(this,require('_process'))
},{"./invariant":146,"_process":4}],117:[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule adler32
 */

/* jslint bitwise:true */

'use strict';

var MOD = 65521;

// This is a clean-room implementation of adler32 designed for detecting
// if markup is not what we expect it to be. It does not need to be
// cryptographically strong, only reasonably good at detecting if markup
// generated on the server is different than that on the client.
function adler32(data) {
  var a = 1;
  var b = 0;
  for (var i = 0; i < data.length; i++) {
    a = (a + data.charCodeAt(i)) % MOD;
    b = (b + a) % MOD;
  }
  return a | (b << 16);
}

module.exports = adler32;

},{}],118:[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule camelize
 * @typechecks
 */

var _hyphenPattern = /-(.)/g;

/**
 * Camelcases a hyphenated string, for example:
 *
 *   > camelize('background-color')
 *   < "backgroundColor"
 *
 * @param {string} string
 * @return {string}
 */
function camelize(string) {
  return string.replace(_hyphenPattern, function(_, character) {
    return character.toUpperCase();
  });
}

module.exports = camelize;

},{}],119:[function(require,module,exports){
/**
 * Copyright 2014-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule camelizeStyleName
 * @typechecks
 */

"use strict";

var camelize = require("./camelize");

var msPattern = /^-ms-/;

/**
 * Camelcases a hyphenated CSS property name, for example:
 *
 *   > camelizeStyleName('background-color')
 *   < "backgroundColor"
 *   > camelizeStyleName('-moz-transition')
 *   < "MozTransition"
 *   > camelizeStyleName('-ms-transition')
 *   < "msTransition"
 *
 * As Andi Smith suggests
 * (http://www.andismith.com/blog/2012/02/modernizr-prefixed/), an `-ms` prefix
 * is converted to lowercase `ms`.
 *
 * @param {string} string
 * @return {string}
 */
function camelizeStyleName(string) {
  return camelize(string.replace(msPattern, 'ms-'));
}

module.exports = camelizeStyleName;

},{"./camelize":118}],120:[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule containsNode
 * @typechecks
 */

var isTextNode = require("./isTextNode");

/*jslint bitwise:true */

/**
 * Checks if a given DOM node contains or is another DOM node.
 *
 * @param {?DOMNode} outerNode Outer DOM node.
 * @param {?DOMNode} innerNode Inner DOM node.
 * @return {boolean} True if `outerNode` contains or is `innerNode`.
 */
function containsNode(outerNode, innerNode) {
  if (!outerNode || !innerNode) {
    return false;
  } else if (outerNode === innerNode) {
    return true;
  } else if (isTextNode(outerNode)) {
    return false;
  } else if (isTextNode(innerNode)) {
    return containsNode(outerNode, innerNode.parentNode);
  } else if (outerNode.contains) {
    return outerNode.contains(innerNode);
  } else if (outerNode.compareDocumentPosition) {
    return !!(outerNode.compareDocumentPosition(innerNode) & 16);
  } else {
    return false;
  }
}

module.exports = containsNode;

},{"./isTextNode":150}],121:[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule createArrayFromMixed
 * @typechecks
 */

var toArray = require("./toArray");

/**
 * Perform a heuristic test to determine if an object is "array-like".
 *
 *   A monk asked Joshu, a Zen master, "Has a dog Buddha nature?"
 *   Joshu replied: "Mu."
 *
 * This function determines if its argument has "array nature": it returns
 * true if the argument is an actual array, an `arguments' object, or an
 * HTMLCollection (e.g. node.childNodes or node.getElementsByTagName()).
 *
 * It will return false for other array-like objects like Filelist.
 *
 * @param {*} obj
 * @return {boolean}
 */
function hasArrayNature(obj) {
  return (
    // not null/false
    !!obj &&
    // arrays are objects, NodeLists are functions in Safari
    (typeof obj == 'object' || typeof obj == 'function') &&
    // quacks like an array
    ('length' in obj) &&
    // not window
    !('setInterval' in obj) &&
    // no DOM node should be considered an array-like
    // a 'select' element has 'length' and 'item' properties on IE8
    (typeof obj.nodeType != 'number') &&
    (
      // a real array
      (// HTMLCollection/NodeList
      (Array.isArray(obj) ||
      // arguments
      ('callee' in obj) || 'item' in obj))
    )
  );
}

/**
 * Ensure that the argument is an array by wrapping it in an array if it is not.
 * Creates a copy of the argument if it is already an array.
 *
 * This is mostly useful idiomatically:
 *
 *   var createArrayFromMixed = require('createArrayFromMixed');
 *
 *   function takesOneOrMoreThings(things) {
 *     things = createArrayFromMixed(things);
 *     ...
 *   }
 *
 * This allows you to treat `things' as an array, but accept scalars in the API.
 *
 * If you need to convert an array-like object, like `arguments`, into an array
 * use toArray instead.
 *
 * @param {*} obj
 * @return {array}
 */
function createArrayFromMixed(obj) {
  if (!hasArrayNature(obj)) {
    return [obj];
  } else if (Array.isArray(obj)) {
    return obj.slice();
  } else {
    return toArray(obj);
  }
}

module.exports = createArrayFromMixed;

},{"./toArray":163}],122:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule createFullPageComponent
 * @typechecks
 */

'use strict';

// Defeat circular references by requiring this directly.
var ReactClass = require("./ReactClass");
var ReactElement = require("./ReactElement");

var invariant = require("./invariant");

/**
 * Create a component that will throw an exception when unmounted.
 *
 * Components like <html> <head> and <body> can't be removed or added
 * easily in a cross-browser way, however it's valuable to be able to
 * take advantage of React's reconciliation for styling and <title>
 * management. So we just document it and throw in dangerous cases.
 *
 * @param {string} tag The tag to wrap
 * @return {function} convenience constructor of new component
 */
function createFullPageComponent(tag) {
  var elementFactory = ReactElement.createFactory(tag);

  var FullPageComponent = ReactClass.createClass({
    tagName: tag.toUpperCase(),
    displayName: 'ReactFullPageComponent' + tag,

    componentWillUnmount: function() {
      ("production" !== process.env.NODE_ENV ? invariant(
        false,
        '%s tried to unmount. Because of cross-browser quirks it is ' +
        'impossible to unmount some top-level components (eg <html>, <head>, ' +
        'and <body>) reliably and efficiently. To fix this, have a single ' +
        'top-level component that never unmounts render these elements.',
        this.constructor.displayName
      ) : invariant(false));
    },

    render: function() {
      return elementFactory(this.props);
    }
  });

  return FullPageComponent;
}

module.exports = createFullPageComponent;

}).call(this,require('_process'))
},{"./ReactClass":44,"./ReactElement":68,"./invariant":146,"_process":4}],123:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule createNodesFromMarkup
 * @typechecks
 */

/*jslint evil: true, sub: true */

var ExecutionEnvironment = require("./ExecutionEnvironment");

var createArrayFromMixed = require("./createArrayFromMixed");
var getMarkupWrap = require("./getMarkupWrap");
var invariant = require("./invariant");

/**
 * Dummy container used to render all markup.
 */
var dummyNode =
  ExecutionEnvironment.canUseDOM ? document.createElement('div') : null;

/**
 * Pattern used by `getNodeName`.
 */
var nodeNamePattern = /^\s*<(\w+)/;

/**
 * Extracts the `nodeName` of the first element in a string of markup.
 *
 * @param {string} markup String of markup.
 * @return {?string} Node name of the supplied markup.
 */
function getNodeName(markup) {
  var nodeNameMatch = markup.match(nodeNamePattern);
  return nodeNameMatch && nodeNameMatch[1].toLowerCase();
}

/**
 * Creates an array containing the nodes rendered from the supplied markup. The
 * optionally supplied `handleScript` function will be invoked once for each
 * <script> element that is rendered. If no `handleScript` function is supplied,
 * an exception is thrown if any <script> elements are rendered.
 *
 * @param {string} markup A string of valid HTML markup.
 * @param {?function} handleScript Invoked once for each rendered <script>.
 * @return {array<DOMElement|DOMTextNode>} An array of rendered nodes.
 */
function createNodesFromMarkup(markup, handleScript) {
  var node = dummyNode;
  ("production" !== process.env.NODE_ENV ? invariant(!!dummyNode, 'createNodesFromMarkup dummy not initialized') : invariant(!!dummyNode));
  var nodeName = getNodeName(markup);

  var wrap = nodeName && getMarkupWrap(nodeName);
  if (wrap) {
    node.innerHTML = wrap[1] + markup + wrap[2];

    var wrapDepth = wrap[0];
    while (wrapDepth--) {
      node = node.lastChild;
    }
  } else {
    node.innerHTML = markup;
  }

  var scripts = node.getElementsByTagName('script');
  if (scripts.length) {
    ("production" !== process.env.NODE_ENV ? invariant(
      handleScript,
      'createNodesFromMarkup(...): Unexpected <script> element rendered.'
    ) : invariant(handleScript));
    createArrayFromMixed(scripts).forEach(handleScript);
  }

  var nodes = createArrayFromMixed(node.childNodes);
  while (node.lastChild) {
    node.removeChild(node.lastChild);
  }
  return nodes;
}

module.exports = createNodesFromMarkup;

}).call(this,require('_process'))
},{"./ExecutionEnvironment":31,"./createArrayFromMixed":121,"./getMarkupWrap":138,"./invariant":146,"_process":4}],124:[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule dangerousStyleValue
 * @typechecks static-only
 */

'use strict';

var CSSProperty = require("./CSSProperty");

var isUnitlessNumber = CSSProperty.isUnitlessNumber;

/**
 * Convert a value into the proper css writable value. The style name `name`
 * should be logical (no hyphens), as specified
 * in `CSSProperty.isUnitlessNumber`.
 *
 * @param {string} name CSS property name such as `topMargin`.
 * @param {*} value CSS property value such as `10px`.
 * @return {string} Normalized style value with dimensions applied.
 */
function dangerousStyleValue(name, value) {
  // Note that we've removed escapeTextForBrowser() calls here since the
  // whole string will be escaped when the attribute is injected into
  // the markup. If you provide unsafe user data here they can inject
  // arbitrary CSS which may be problematic (I couldn't repro this):
  // https://www.owasp.org/index.php/XSS_Filter_Evasion_Cheat_Sheet
  // http://www.thespanner.co.uk/2007/11/26/ultimate-xss-css-injection/
  // This is not an XSS hole but instead a potential CSS injection issue
  // which has lead to a greater discussion about how we're going to
  // trust URLs moving forward. See #2115901

  var isEmpty = value == null || typeof value === 'boolean' || value === '';
  if (isEmpty) {
    return '';
  }

  var isNonNumeric = isNaN(value);
  if (isNonNumeric || value === 0 ||
      isUnitlessNumber.hasOwnProperty(name) && isUnitlessNumber[name]) {
    return '' + value; // cast to string
  }

  if (typeof value === 'string') {
    value = value.trim();
  }
  return value + 'px';
}

module.exports = dangerousStyleValue;

},{"./CSSProperty":14}],125:[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule emptyFunction
 */

function makeEmptyFunction(arg) {
  return function() {
    return arg;
  };
}

/**
 * This function accepts and discards inputs; it has no side effects. This is
 * primarily useful idiomatically for overridable function endpoints which
 * always need to be callable, since JS lacks a null-call idiom ala Cocoa.
 */
function emptyFunction() {}

emptyFunction.thatReturns = makeEmptyFunction;
emptyFunction.thatReturnsFalse = makeEmptyFunction(false);
emptyFunction.thatReturnsTrue = makeEmptyFunction(true);
emptyFunction.thatReturnsNull = makeEmptyFunction(null);
emptyFunction.thatReturnsThis = function() { return this; };
emptyFunction.thatReturnsArgument = function(arg) { return arg; };

module.exports = emptyFunction;

},{}],126:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule emptyObject
 */

"use strict";

var emptyObject = {};

if ("production" !== process.env.NODE_ENV) {
  Object.freeze(emptyObject);
}

module.exports = emptyObject;

}).call(this,require('_process'))
},{"_process":4}],127:[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule escapeTextContentForBrowser
 */

'use strict';

var ESCAPE_LOOKUP = {
  '&': '&amp;',
  '>': '&gt;',
  '<': '&lt;',
  '"': '&quot;',
  '\'': '&#x27;'
};

var ESCAPE_REGEX = /[&><"']/g;

function escaper(match) {
  return ESCAPE_LOOKUP[match];
}

/**
 * Escapes text to prevent scripting attacks.
 *
 * @param {*} text Text value to escape.
 * @return {string} An escaped string.
 */
function escapeTextContentForBrowser(text) {
  return ('' + text).replace(ESCAPE_REGEX, escaper);
}

module.exports = escapeTextContentForBrowser;

},{}],128:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule findDOMNode
 * @typechecks static-only
 */

'use strict';

var ReactCurrentOwner = require("./ReactCurrentOwner");
var ReactInstanceMap = require("./ReactInstanceMap");
var ReactMount = require("./ReactMount");

var invariant = require("./invariant");
var isNode = require("./isNode");
var warning = require("./warning");

/**
 * Returns the DOM node rendered by this element.
 *
 * @param {ReactComponent|DOMElement} componentOrElement
 * @return {DOMElement} The root node of this element.
 */
function findDOMNode(componentOrElement) {
  if ("production" !== process.env.NODE_ENV) {
    var owner = ReactCurrentOwner.current;
    if (owner !== null) {
      ("production" !== process.env.NODE_ENV ? warning(
        owner._warnedAboutRefsInRender,
        '%s is accessing getDOMNode or findDOMNode inside its render(). ' +
        'render() should be a pure function of props and state. It should ' +
        'never access something that requires stale data from the previous ' +
        'render, such as refs. Move this logic to componentDidMount and ' +
        'componentDidUpdate instead.',
        owner.getName() || 'A component'
      ) : null);
      owner._warnedAboutRefsInRender = true;
    }
  }
  if (componentOrElement == null) {
    return null;
  }
  if (isNode(componentOrElement)) {
    return componentOrElement;
  }
  if (ReactInstanceMap.has(componentOrElement)) {
    return ReactMount.getNodeFromInstance(componentOrElement);
  }
  ("production" !== process.env.NODE_ENV ? invariant(
    componentOrElement.render == null ||
    typeof componentOrElement.render !== 'function',
    'Component (with keys: %s) contains `render` method ' +
    'but is not mounted in the DOM',
    Object.keys(componentOrElement)
  ) : invariant(componentOrElement.render == null ||
  typeof componentOrElement.render !== 'function'));
  ("production" !== process.env.NODE_ENV ? invariant(
    false,
    'Element appears to be neither ReactComponent nor DOMNode (keys: %s)',
    Object.keys(componentOrElement)
  ) : invariant(false));
}

module.exports = findDOMNode;

}).call(this,require('_process'))
},{"./ReactCurrentOwner":50,"./ReactInstanceMap":78,"./ReactMount":81,"./invariant":146,"./isNode":148,"./warning":165,"_process":4}],129:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule flattenChildren
 */

'use strict';

var traverseAllChildren = require("./traverseAllChildren");
var warning = require("./warning");

/**
 * @param {function} traverseContext Context passed through traversal.
 * @param {?ReactComponent} child React child component.
 * @param {!string} name String name of key path to child.
 */
function flattenSingleChildIntoContext(traverseContext, child, name) {
  // We found a component instance.
  var result = traverseContext;
  var keyUnique = !result.hasOwnProperty(name);
  if ("production" !== process.env.NODE_ENV) {
    ("production" !== process.env.NODE_ENV ? warning(
      keyUnique,
      'flattenChildren(...): Encountered two children with the same key, ' +
      '`%s`. Child keys must be unique; when two children share a key, only ' +
      'the first child will be used.',
      name
    ) : null);
  }
  if (keyUnique && child != null) {
    result[name] = child;
  }
}

/**
 * Flattens children that are typically specified as `props.children`. Any null
 * children will not be included in the resulting object.
 * @return {!object} flattened children keyed by name.
 */
function flattenChildren(children) {
  if (children == null) {
    return children;
  }
  var result = {};
  traverseAllChildren(children, flattenSingleChildIntoContext, result);
  return result;
}

module.exports = flattenChildren;

}).call(this,require('_process'))
},{"./traverseAllChildren":164,"./warning":165,"_process":4}],130:[function(require,module,exports){
/**
 * Copyright 2014-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule focusNode
 */

"use strict";

/**
 * @param {DOMElement} node input/textarea to focus
 */
function focusNode(node) {
  // IE8 can throw "Can't move focus to the control because it is invisible,
  // not enabled, or of a type that does not accept the focus." for all kinds of
  // reasons that are too expensive and fragile to test.
  try {
    node.focus();
  } catch(e) {
  }
}

module.exports = focusNode;

},{}],131:[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule forEachAccumulated
 */

'use strict';

/**
 * @param {array} an "accumulation" of items which is either an Array or
 * a single item. Useful when paired with the `accumulate` module. This is a
 * simple utility that allows us to reason about a collection of items, but
 * handling the case when there is exactly one item (and we do not need to
 * allocate an array).
 */
var forEachAccumulated = function(arr, cb, scope) {
  if (Array.isArray(arr)) {
    arr.forEach(cb, scope);
  } else if (arr) {
    cb.call(scope, arr);
  }
};

module.exports = forEachAccumulated;

},{}],132:[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule getActiveElement
 * @typechecks
 */

/**
 * Same as document.activeElement but wraps in a try-catch block. In IE it is
 * not safe to call document.activeElement if there is nothing focused.
 *
 * The activeElement will be null only if the document body is not yet defined.
 */
function getActiveElement() /*?DOMElement*/ {
  try {
    return document.activeElement || document.body;
  } catch (e) {
    return document.body;
  }
}

module.exports = getActiveElement;

},{}],133:[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule getEventCharCode
 * @typechecks static-only
 */

'use strict';

/**
 * `charCode` represents the actual "character code" and is safe to use with
 * `String.fromCharCode`. As such, only keys that correspond to printable
 * characters produce a valid `charCode`, the only exception to this is Enter.
 * The Tab-key is considered non-printable and does not have a `charCode`,
 * presumably because it does not produce a tab-character in browsers.
 *
 * @param {object} nativeEvent Native browser event.
 * @return {string} Normalized `charCode` property.
 */
function getEventCharCode(nativeEvent) {
  var charCode;
  var keyCode = nativeEvent.keyCode;

  if ('charCode' in nativeEvent) {
    charCode = nativeEvent.charCode;

    // FF does not set `charCode` for the Enter-key, check against `keyCode`.
    if (charCode === 0 && keyCode === 13) {
      charCode = 13;
    }
  } else {
    // IE8 does not implement `charCode`, but `keyCode` has the correct value.
    charCode = keyCode;
  }

  // Some non-printable keys are reported in `charCode`/`keyCode`, discard them.
  // Must not discard the (non-)printable Enter-key.
  if (charCode >= 32 || charCode === 13) {
    return charCode;
  }

  return 0;
}

module.exports = getEventCharCode;

},{}],134:[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule getEventKey
 * @typechecks static-only
 */

'use strict';

var getEventCharCode = require("./getEventCharCode");

/**
 * Normalization of deprecated HTML5 `key` values
 * @see https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent#Key_names
 */
var normalizeKey = {
  'Esc': 'Escape',
  'Spacebar': ' ',
  'Left': 'ArrowLeft',
  'Up': 'ArrowUp',
  'Right': 'ArrowRight',
  'Down': 'ArrowDown',
  'Del': 'Delete',
  'Win': 'OS',
  'Menu': 'ContextMenu',
  'Apps': 'ContextMenu',
  'Scroll': 'ScrollLock',
  'MozPrintableKey': 'Unidentified'
};

/**
 * Translation from legacy `keyCode` to HTML5 `key`
 * Only special keys supported, all others depend on keyboard layout or browser
 * @see https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent#Key_names
 */
var translateToKey = {
  8: 'Backspace',
  9: 'Tab',
  12: 'Clear',
  13: 'Enter',
  16: 'Shift',
  17: 'Control',
  18: 'Alt',
  19: 'Pause',
  20: 'CapsLock',
  27: 'Escape',
  32: ' ',
  33: 'PageUp',
  34: 'PageDown',
  35: 'End',
  36: 'Home',
  37: 'ArrowLeft',
  38: 'ArrowUp',
  39: 'ArrowRight',
  40: 'ArrowDown',
  45: 'Insert',
  46: 'Delete',
  112: 'F1', 113: 'F2', 114: 'F3', 115: 'F4', 116: 'F5', 117: 'F6',
  118: 'F7', 119: 'F8', 120: 'F9', 121: 'F10', 122: 'F11', 123: 'F12',
  144: 'NumLock',
  145: 'ScrollLock',
  224: 'Meta'
};

/**
 * @param {object} nativeEvent Native browser event.
 * @return {string} Normalized `key` property.
 */
function getEventKey(nativeEvent) {
  if (nativeEvent.key) {
    // Normalize inconsistent values reported by browsers due to
    // implementations of a working draft specification.

    // FireFox implements `key` but returns `MozPrintableKey` for all
    // printable characters (normalized to `Unidentified`), ignore it.
    var key = normalizeKey[nativeEvent.key] || nativeEvent.key;
    if (key !== 'Unidentified') {
      return key;
    }
  }

  // Browser does not implement `key`, polyfill as much of it as we can.
  if (nativeEvent.type === 'keypress') {
    var charCode = getEventCharCode(nativeEvent);

    // The enter-key is technically both printable and non-printable and can
    // thus be captured by `keypress`, no other non-printable key should.
    return charCode === 13 ? 'Enter' : String.fromCharCode(charCode);
  }
  if (nativeEvent.type === 'keydown' || nativeEvent.type === 'keyup') {
    // While user keyboard layout determines the actual meaning of each
    // `keyCode` value, almost all function keys have a universal value.
    return translateToKey[nativeEvent.keyCode] || 'Unidentified';
  }
  return '';
}

module.exports = getEventKey;

},{"./getEventCharCode":133}],135:[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule getEventModifierState
 * @typechecks static-only
 */

'use strict';

/**
 * Translation from modifier key to the associated property in the event.
 * @see http://www.w3.org/TR/DOM-Level-3-Events/#keys-Modifiers
 */

var modifierKeyToProp = {
  'Alt': 'altKey',
  'Control': 'ctrlKey',
  'Meta': 'metaKey',
  'Shift': 'shiftKey'
};

// IE8 does not implement getModifierState so we simply map it to the only
// modifier keys exposed by the event itself, does not support Lock-keys.
// Currently, all major browsers except Chrome seems to support Lock-keys.
function modifierStateGetter(keyArg) {
  /*jshint validthis:true */
  var syntheticEvent = this;
  var nativeEvent = syntheticEvent.nativeEvent;
  if (nativeEvent.getModifierState) {
    return nativeEvent.getModifierState(keyArg);
  }
  var keyProp = modifierKeyToProp[keyArg];
  return keyProp ? !!nativeEvent[keyProp] : false;
}

function getEventModifierState(nativeEvent) {
  return modifierStateGetter;
}

module.exports = getEventModifierState;

},{}],136:[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule getEventTarget
 * @typechecks static-only
 */

'use strict';

/**
 * Gets the target node from a native browser event by accounting for
 * inconsistencies in browser DOM APIs.
 *
 * @param {object} nativeEvent Native browser event.
 * @return {DOMEventTarget} Target node.
 */
function getEventTarget(nativeEvent) {
  var target = nativeEvent.target || nativeEvent.srcElement || window;
  // Safari may fire events on text nodes (Node.TEXT_NODE is 3).
  // @see http://www.quirksmode.org/js/events_properties.html
  return target.nodeType === 3 ? target.parentNode : target;
}

module.exports = getEventTarget;

},{}],137:[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule getIteratorFn
 * @typechecks static-only
 */

'use strict';

/* global Symbol */
var ITERATOR_SYMBOL = typeof Symbol === 'function' && Symbol.iterator;
var FAUX_ITERATOR_SYMBOL = '@@iterator'; // Before Symbol spec.

/**
 * Returns the iterator method function contained on the iterable object.
 *
 * Be sure to invoke the function with the iterable as context:
 *
 *     var iteratorFn = getIteratorFn(myIterable);
 *     if (iteratorFn) {
 *       var iterator = iteratorFn.call(myIterable);
 *       ...
 *     }
 *
 * @param {?object} maybeIterable
 * @return {?function}
 */
function getIteratorFn(maybeIterable) {
  var iteratorFn = maybeIterable && (
    (ITERATOR_SYMBOL && maybeIterable[ITERATOR_SYMBOL] || maybeIterable[FAUX_ITERATOR_SYMBOL])
  );
  if (typeof iteratorFn === 'function') {
    return iteratorFn;
  }
}

module.exports = getIteratorFn;

},{}],138:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule getMarkupWrap
 */

var ExecutionEnvironment = require("./ExecutionEnvironment");

var invariant = require("./invariant");

/**
 * Dummy container used to detect which wraps are necessary.
 */
var dummyNode =
  ExecutionEnvironment.canUseDOM ? document.createElement('div') : null;

/**
 * Some browsers cannot use `innerHTML` to render certain elements standalone,
 * so we wrap them, render the wrapped nodes, then extract the desired node.
 *
 * In IE8, certain elements cannot render alone, so wrap all elements ('*').
 */
var shouldWrap = {
  // Force wrapping for SVG elements because if they get created inside a <div>,
  // they will be initialized in the wrong namespace (and will not display).
  'circle': true,
  'defs': true,
  'ellipse': true,
  'g': true,
  'line': true,
  'linearGradient': true,
  'path': true,
  'polygon': true,
  'polyline': true,
  'radialGradient': true,
  'rect': true,
  'stop': true,
  'text': true
};

var selectWrap = [1, '<select multiple="true">', '</select>'];
var tableWrap = [1, '<table>', '</table>'];
var trWrap = [3, '<table><tbody><tr>', '</tr></tbody></table>'];

var svgWrap = [1, '<svg>', '</svg>'];

var markupWrap = {
  '*': [1, '?<div>', '</div>'],

  'area': [1, '<map>', '</map>'],
  'col': [2, '<table><tbody></tbody><colgroup>', '</colgroup></table>'],
  'legend': [1, '<fieldset>', '</fieldset>'],
  'param': [1, '<object>', '</object>'],
  'tr': [2, '<table><tbody>', '</tbody></table>'],

  'optgroup': selectWrap,
  'option': selectWrap,

  'caption': tableWrap,
  'colgroup': tableWrap,
  'tbody': tableWrap,
  'tfoot': tableWrap,
  'thead': tableWrap,

  'td': trWrap,
  'th': trWrap,

  'circle': svgWrap,
  'defs': svgWrap,
  'ellipse': svgWrap,
  'g': svgWrap,
  'line': svgWrap,
  'linearGradient': svgWrap,
  'path': svgWrap,
  'polygon': svgWrap,
  'polyline': svgWrap,
  'radialGradient': svgWrap,
  'rect': svgWrap,
  'stop': svgWrap,
  'text': svgWrap
};

/**
 * Gets the markup wrap configuration for the supplied `nodeName`.
 *
 * NOTE: This lazily detects which wraps are necessary for the current browser.
 *
 * @param {string} nodeName Lowercase `nodeName`.
 * @return {?array} Markup wrap configuration, if applicable.
 */
function getMarkupWrap(nodeName) {
  ("production" !== process.env.NODE_ENV ? invariant(!!dummyNode, 'Markup wrapping node not initialized') : invariant(!!dummyNode));
  if (!markupWrap.hasOwnProperty(nodeName)) {
    nodeName = '*';
  }
  if (!shouldWrap.hasOwnProperty(nodeName)) {
    if (nodeName === '*') {
      dummyNode.innerHTML = '<link />';
    } else {
      dummyNode.innerHTML = '<' + nodeName + '></' + nodeName + '>';
    }
    shouldWrap[nodeName] = !dummyNode.firstChild;
  }
  return shouldWrap[nodeName] ? markupWrap[nodeName] : null;
}


module.exports = getMarkupWrap;

}).call(this,require('_process'))
},{"./ExecutionEnvironment":31,"./invariant":146,"_process":4}],139:[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule getNodeForCharacterOffset
 */

'use strict';

/**
 * Given any node return the first leaf node without children.
 *
 * @param {DOMElement|DOMTextNode} node
 * @return {DOMElement|DOMTextNode}
 */
function getLeafNode(node) {
  while (node && node.firstChild) {
    node = node.firstChild;
  }
  return node;
}

/**
 * Get the next sibling within a container. This will walk up the
 * DOM if a node's siblings have been exhausted.
 *
 * @param {DOMElement|DOMTextNode} node
 * @return {?DOMElement|DOMTextNode}
 */
function getSiblingNode(node) {
  while (node) {
    if (node.nextSibling) {
      return node.nextSibling;
    }
    node = node.parentNode;
  }
}

/**
 * Get object describing the nodes which contain characters at offset.
 *
 * @param {DOMElement|DOMTextNode} root
 * @param {number} offset
 * @return {?object}
 */
function getNodeForCharacterOffset(root, offset) {
  var node = getLeafNode(root);
  var nodeStart = 0;
  var nodeEnd = 0;

  while (node) {
    if (node.nodeType === 3) {
      nodeEnd = nodeStart + node.textContent.length;

      if (nodeStart <= offset && nodeEnd >= offset) {
        return {
          node: node,
          offset: offset - nodeStart
        };
      }

      nodeStart = nodeEnd;
    }

    node = getLeafNode(getSiblingNode(node));
  }
}

module.exports = getNodeForCharacterOffset;

},{}],140:[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule getReactRootElementInContainer
 */

'use strict';

var DOC_NODE_TYPE = 9;

/**
 * @param {DOMElement|DOMDocument} container DOM element that may contain
 *                                           a React component
 * @return {?*} DOM element that may have the reactRoot ID, or null.
 */
function getReactRootElementInContainer(container) {
  if (!container) {
    return null;
  }

  if (container.nodeType === DOC_NODE_TYPE) {
    return container.documentElement;
  } else {
    return container.firstChild;
  }
}

module.exports = getReactRootElementInContainer;

},{}],141:[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule getTextContentAccessor
 */

'use strict';

var ExecutionEnvironment = require("./ExecutionEnvironment");

var contentKey = null;

/**
 * Gets the key used to access text content on a DOM node.
 *
 * @return {?string} Key used to access text content.
 * @internal
 */
function getTextContentAccessor() {
  if (!contentKey && ExecutionEnvironment.canUseDOM) {
    // Prefer textContent to innerText because many browsers support both but
    // SVG <text> elements don't support innerText even when <div> does.
    contentKey = 'textContent' in document.documentElement ?
      'textContent' :
      'innerText';
  }
  return contentKey;
}

module.exports = getTextContentAccessor;

},{"./ExecutionEnvironment":31}],142:[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule getUnboundedScrollPosition
 * @typechecks
 */

"use strict";

/**
 * Gets the scroll position of the supplied element or window.
 *
 * The return values are unbounded, unlike `getScrollPosition`. This means they
 * may be negative or exceed the element boundaries (which is possible using
 * inertial scrolling).
 *
 * @param {DOMWindow|DOMElement} scrollable
 * @return {object} Map with `x` and `y` keys.
 */
function getUnboundedScrollPosition(scrollable) {
  if (scrollable === window) {
    return {
      x: window.pageXOffset || document.documentElement.scrollLeft,
      y: window.pageYOffset || document.documentElement.scrollTop
    };
  }
  return {
    x: scrollable.scrollLeft,
    y: scrollable.scrollTop
  };
}

module.exports = getUnboundedScrollPosition;

},{}],143:[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule hyphenate
 * @typechecks
 */

var _uppercasePattern = /([A-Z])/g;

/**
 * Hyphenates a camelcased string, for example:
 *
 *   > hyphenate('backgroundColor')
 *   < "background-color"
 *
 * For CSS style names, use `hyphenateStyleName` instead which works properly
 * with all vendor prefixes, including `ms`.
 *
 * @param {string} string
 * @return {string}
 */
function hyphenate(string) {
  return string.replace(_uppercasePattern, '-$1').toLowerCase();
}

module.exports = hyphenate;

},{}],144:[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule hyphenateStyleName
 * @typechecks
 */

"use strict";

var hyphenate = require("./hyphenate");

var msPattern = /^ms-/;

/**
 * Hyphenates a camelcased CSS property name, for example:
 *
 *   > hyphenateStyleName('backgroundColor')
 *   < "background-color"
 *   > hyphenateStyleName('MozTransition')
 *   < "-moz-transition"
 *   > hyphenateStyleName('msTransition')
 *   < "-ms-transition"
 *
 * As Modernizr suggests (http://modernizr.com/docs/#prefixed), an `ms` prefix
 * is converted to `-ms-`.
 *
 * @param {string} string
 * @return {string}
 */
function hyphenateStyleName(string) {
  return hyphenate(string).replace(msPattern, '-ms-');
}

module.exports = hyphenateStyleName;

},{"./hyphenate":143}],145:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule instantiateReactComponent
 * @typechecks static-only
 */

'use strict';

var ReactCompositeComponent = require("./ReactCompositeComponent");
var ReactEmptyComponent = require("./ReactEmptyComponent");
var ReactNativeComponent = require("./ReactNativeComponent");

var assign = require("./Object.assign");
var invariant = require("./invariant");
var warning = require("./warning");

// To avoid a cyclic dependency, we create the final class in this module
var ReactCompositeComponentWrapper = function() { };
assign(
  ReactCompositeComponentWrapper.prototype,
  ReactCompositeComponent.Mixin,
  {
    _instantiateReactComponent: instantiateReactComponent
  }
);

/**
 * Check if the type reference is a known internal type. I.e. not a user
 * provided composite type.
 *
 * @param {function} type
 * @return {boolean} Returns true if this is a valid internal type.
 */
function isInternalComponentType(type) {
  return (
    typeof type === 'function' &&
    typeof type.prototype !== 'undefined' &&
    typeof type.prototype.mountComponent === 'function' &&
    typeof type.prototype.receiveComponent === 'function'
  );
}

/**
 * Given a ReactNode, create an instance that will actually be mounted.
 *
 * @param {ReactNode} node
 * @param {*} parentCompositeType The composite type that resolved this.
 * @return {object} A new instance of the element's constructor.
 * @protected
 */
function instantiateReactComponent(node, parentCompositeType) {
  var instance;

  if (node === null || node === false) {
    node = ReactEmptyComponent.emptyElement;
  }

  if (typeof node === 'object') {
    var element = node;
    if ("production" !== process.env.NODE_ENV) {
      ("production" !== process.env.NODE_ENV ? warning(
        element && (typeof element.type === 'function' ||
                    typeof element.type === 'string'),
        'Only functions or strings can be mounted as React components.'
      ) : null);
    }

    // Special case string values
    if (parentCompositeType === element.type &&
        typeof element.type === 'string') {
      // Avoid recursion if the wrapper renders itself.
      instance = ReactNativeComponent.createInternalComponent(element);
      // All native components are currently wrapped in a composite so we're
      // safe to assume that this is what we should instantiate.
    } else if (isInternalComponentType(element.type)) {
      // This is temporarily available for custom components that are not string
      // represenations. I.e. ART. Once those are updated to use the string
      // representation, we can drop this code path.
      instance = new element.type(element);
    } else {
      instance = new ReactCompositeComponentWrapper();
    }
  } else if (typeof node === 'string' || typeof node === 'number') {
    instance = ReactNativeComponent.createInstanceForText(node);
  } else {
    ("production" !== process.env.NODE_ENV ? invariant(
      false,
      'Encountered invalid React node of type %s',
      typeof node
    ) : invariant(false));
  }

  if ("production" !== process.env.NODE_ENV) {
    ("production" !== process.env.NODE_ENV ? warning(
      typeof instance.construct === 'function' &&
      typeof instance.mountComponent === 'function' &&
      typeof instance.receiveComponent === 'function' &&
      typeof instance.unmountComponent === 'function',
      'Only React Components can be mounted.'
    ) : null);
  }

  // Sets up the instance. This can probably just move into the constructor now.
  instance.construct(node);

  // These two fields are used by the DOM and ART diffing algorithms
  // respectively. Instead of using expandos on components, we should be
  // storing the state needed by the diffing algorithms elsewhere.
  instance._mountIndex = 0;
  instance._mountImage = null;

  if ("production" !== process.env.NODE_ENV) {
    instance._isOwnerNecessary = false;
    instance._warnedAboutRefsInRender = false;
  }

  // Internal instances should fully constructed at this point, so they should
  // not get any new fields added to them at this point.
  if ("production" !== process.env.NODE_ENV) {
    if (Object.preventExtensions) {
      Object.preventExtensions(instance);
    }
  }

  return instance;
}

module.exports = instantiateReactComponent;

}).call(this,require('_process'))
},{"./Object.assign":37,"./ReactCompositeComponent":48,"./ReactEmptyComponent":70,"./ReactNativeComponent":84,"./invariant":146,"./warning":165,"_process":4}],146:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule invariant
 */

"use strict";

/**
 * Use invariant() to assert state which your program assumes to be true.
 *
 * Provide sprintf-style format (only %s is supported) and arguments
 * to provide information about what broke and what you were
 * expecting.
 *
 * The invariant message will be stripped in production, but the invariant
 * will remain to ensure logic does not differ in production.
 */

var invariant = function(condition, format, a, b, c, d, e, f) {
  if ("production" !== process.env.NODE_ENV) {
    if (format === undefined) {
      throw new Error('invariant requires an error message argument');
    }
  }

  if (!condition) {
    var error;
    if (format === undefined) {
      error = new Error(
        'Minified exception occurred; use the non-minified dev environment ' +
        'for the full error message and additional helpful warnings.'
      );
    } else {
      var args = [a, b, c, d, e, f];
      var argIndex = 0;
      error = new Error(
        'Invariant Violation: ' +
        format.replace(/%s/g, function() { return args[argIndex++]; })
      );
    }

    error.framesToPop = 1; // we don't care about invariant's own frame
    throw error;
  }
};

module.exports = invariant;

}).call(this,require('_process'))
},{"_process":4}],147:[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule isEventSupported
 */

'use strict';

var ExecutionEnvironment = require("./ExecutionEnvironment");

var useHasFeature;
if (ExecutionEnvironment.canUseDOM) {
  useHasFeature =
    document.implementation &&
    document.implementation.hasFeature &&
    // always returns true in newer browsers as per the standard.
    // @see http://dom.spec.whatwg.org/#dom-domimplementation-hasfeature
    document.implementation.hasFeature('', '') !== true;
}

/**
 * Checks if an event is supported in the current execution environment.
 *
 * NOTE: This will not work correctly for non-generic events such as `change`,
 * `reset`, `load`, `error`, and `select`.
 *
 * Borrows from Modernizr.
 *
 * @param {string} eventNameSuffix Event name, e.g. "click".
 * @param {?boolean} capture Check if the capture phase is supported.
 * @return {boolean} True if the event is supported.
 * @internal
 * @license Modernizr 3.0.0pre (Custom Build) | MIT
 */
function isEventSupported(eventNameSuffix, capture) {
  if (!ExecutionEnvironment.canUseDOM ||
      capture && !('addEventListener' in document)) {
    return false;
  }

  var eventName = 'on' + eventNameSuffix;
  var isSupported = eventName in document;

  if (!isSupported) {
    var element = document.createElement('div');
    element.setAttribute(eventName, 'return;');
    isSupported = typeof element[eventName] === 'function';
  }

  if (!isSupported && useHasFeature && eventNameSuffix === 'wheel') {
    // This is the only way to test support for the `wheel` event in IE9+.
    isSupported = document.implementation.hasFeature('Events.wheel', '3.0');
  }

  return isSupported;
}

module.exports = isEventSupported;

},{"./ExecutionEnvironment":31}],148:[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule isNode
 * @typechecks
 */

/**
 * @param {*} object The object to check.
 * @return {boolean} Whether or not the object is a DOM node.
 */
function isNode(object) {
  return !!(object && (
    ((typeof Node === 'function' ? object instanceof Node : typeof object === 'object' &&
    typeof object.nodeType === 'number' &&
    typeof object.nodeName === 'string'))
  ));
}

module.exports = isNode;

},{}],149:[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule isTextInputElement
 */

'use strict';

/**
 * @see http://www.whatwg.org/specs/web-apps/current-work/multipage/the-input-element.html#input-type-attr-summary
 */
var supportedInputTypes = {
  'color': true,
  'date': true,
  'datetime': true,
  'datetime-local': true,
  'email': true,
  'month': true,
  'number': true,
  'password': true,
  'range': true,
  'search': true,
  'tel': true,
  'text': true,
  'time': true,
  'url': true,
  'week': true
};

function isTextInputElement(elem) {
  return elem && (
    (elem.nodeName === 'INPUT' && supportedInputTypes[elem.type] || elem.nodeName === 'TEXTAREA')
  );
}

module.exports = isTextInputElement;

},{}],150:[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule isTextNode
 * @typechecks
 */

var isNode = require("./isNode");

/**
 * @param {*} object The object to check.
 * @return {boolean} Whether or not the object is a DOM text node.
 */
function isTextNode(object) {
  return isNode(object) && object.nodeType == 3;
}

module.exports = isTextNode;

},{"./isNode":148}],151:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule keyMirror
 * @typechecks static-only
 */

'use strict';

var invariant = require("./invariant");

/**
 * Constructs an enumeration with keys equal to their value.
 *
 * For example:
 *
 *   var COLORS = keyMirror({blue: null, red: null});
 *   var myColor = COLORS.blue;
 *   var isColorValid = !!COLORS[myColor];
 *
 * The last line could not be performed if the values of the generated enum were
 * not equal to their keys.
 *
 *   Input:  {key1: val1, key2: val2}
 *   Output: {key1: key1, key2: key2}
 *
 * @param {object} obj
 * @return {object}
 */
var keyMirror = function(obj) {
  var ret = {};
  var key;
  ("production" !== process.env.NODE_ENV ? invariant(
    obj instanceof Object && !Array.isArray(obj),
    'keyMirror(...): Argument must be an object.'
  ) : invariant(obj instanceof Object && !Array.isArray(obj)));
  for (key in obj) {
    if (!obj.hasOwnProperty(key)) {
      continue;
    }
    ret[key] = key;
  }
  return ret;
};

module.exports = keyMirror;

}).call(this,require('_process'))
},{"./invariant":146,"_process":4}],152:[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule keyOf
 */

/**
 * Allows extraction of a minified key. Let's the build system minify keys
 * without loosing the ability to dynamically use key strings as values
 * themselves. Pass in an object with a single key/val pair and it will return
 * you the string key of that single record. Suppose you want to grab the
 * value for a key 'className' inside of an object. Key/val minification may
 * have aliased that key to be 'xa12'. keyOf({className: null}) will return
 * 'xa12' in that case. Resolve keys you want to use once at startup time, then
 * reuse those resolutions.
 */
var keyOf = function(oneKeyObj) {
  var key;
  for (key in oneKeyObj) {
    if (!oneKeyObj.hasOwnProperty(key)) {
      continue;
    }
    return key;
  }
  return null;
};


module.exports = keyOf;

},{}],153:[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule mapObject
 */

'use strict';

var hasOwnProperty = Object.prototype.hasOwnProperty;

/**
 * Executes the provided `callback` once for each enumerable own property in the
 * object and constructs a new object from the results. The `callback` is
 * invoked with three arguments:
 *
 *  - the property value
 *  - the property name
 *  - the object being traversed
 *
 * Properties that are added after the call to `mapObject` will not be visited
 * by `callback`. If the values of existing properties are changed, the value
 * passed to `callback` will be the value at the time `mapObject` visits them.
 * Properties that are deleted before being visited are not visited.
 *
 * @grep function objectMap()
 * @grep function objMap()
 *
 * @param {?object} object
 * @param {function} callback
 * @param {*} context
 * @return {?object}
 */
function mapObject(object, callback, context) {
  if (!object) {
    return null;
  }
  var result = {};
  for (var name in object) {
    if (hasOwnProperty.call(object, name)) {
      result[name] = callback.call(context, object[name], name, object);
    }
  }
  return result;
}

module.exports = mapObject;

},{}],154:[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule memoizeStringOnly
 * @typechecks static-only
 */

'use strict';

/**
 * Memoizes the return value of a function that accepts one string argument.
 *
 * @param {function} callback
 * @return {function}
 */
function memoizeStringOnly(callback) {
  var cache = {};
  return function(string) {
    if (!cache.hasOwnProperty(string)) {
      cache[string] = callback.call(this, string);
    }
    return cache[string];
  };
}

module.exports = memoizeStringOnly;

},{}],155:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule onlyChild
 */
'use strict';

var ReactElement = require("./ReactElement");

var invariant = require("./invariant");

/**
 * Returns the first child in a collection of children and verifies that there
 * is only one child in the collection. The current implementation of this
 * function assumes that a single child gets passed without a wrapper, but the
 * purpose of this helper function is to abstract away the particular structure
 * of children.
 *
 * @param {?object} children Child collection structure.
 * @return {ReactComponent} The first and only `ReactComponent` contained in the
 * structure.
 */
function onlyChild(children) {
  ("production" !== process.env.NODE_ENV ? invariant(
    ReactElement.isValidElement(children),
    'onlyChild must be passed a children with exactly one child.'
  ) : invariant(ReactElement.isValidElement(children)));
  return children;
}

module.exports = onlyChild;

}).call(this,require('_process'))
},{"./ReactElement":68,"./invariant":146,"_process":4}],156:[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule performance
 * @typechecks
 */

"use strict";

var ExecutionEnvironment = require("./ExecutionEnvironment");

var performance;

if (ExecutionEnvironment.canUseDOM) {
  performance =
    window.performance ||
    window.msPerformance ||
    window.webkitPerformance;
}

module.exports = performance || {};

},{"./ExecutionEnvironment":31}],157:[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule performanceNow
 * @typechecks
 */

var performance = require("./performance");

/**
 * Detect if we can use `window.performance.now()` and gracefully fallback to
 * `Date.now()` if it doesn't exist. We need to support Firefox < 15 for now
 * because of Facebook's testing infrastructure.
 */
if (!performance || !performance.now) {
  performance = Date;
}

var performanceNow = performance.now.bind(performance);

module.exports = performanceNow;

},{"./performance":156}],158:[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule quoteAttributeValueForBrowser
 */

'use strict';

var escapeTextContentForBrowser = require("./escapeTextContentForBrowser");

/**
 * Escapes attribute value to prevent scripting attacks.
 *
 * @param {*} value Value to escape.
 * @return {string} An escaped string.
 */
function quoteAttributeValueForBrowser(value) {
  return '"' + escapeTextContentForBrowser(value) + '"';
}

module.exports = quoteAttributeValueForBrowser;

},{"./escapeTextContentForBrowser":127}],159:[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule setInnerHTML
 */

/* globals MSApp */

'use strict';

var ExecutionEnvironment = require("./ExecutionEnvironment");

var WHITESPACE_TEST = /^[ \r\n\t\f]/;
var NONVISIBLE_TEST = /<(!--|link|noscript|meta|script|style)[ \r\n\t\f\/>]/;

/**
 * Set the innerHTML property of a node, ensuring that whitespace is preserved
 * even in IE8.
 *
 * @param {DOMElement} node
 * @param {string} html
 * @internal
 */
var setInnerHTML = function(node, html) {
  node.innerHTML = html;
};

// Win8 apps: Allow all html to be inserted
if (typeof MSApp !== 'undefined' && MSApp.execUnsafeLocalFunction) {
  setInnerHTML = function(node, html) {
    MSApp.execUnsafeLocalFunction(function() {
      node.innerHTML = html;
    });
  };
}

if (ExecutionEnvironment.canUseDOM) {
  // IE8: When updating a just created node with innerHTML only leading
  // whitespace is removed. When updating an existing node with innerHTML
  // whitespace in root TextNodes is also collapsed.
  // @see quirksmode.org/bugreports/archives/2004/11/innerhtml_and_t.html

  // Feature detection; only IE8 is known to behave improperly like this.
  var testElement = document.createElement('div');
  testElement.innerHTML = ' ';
  if (testElement.innerHTML === '') {
    setInnerHTML = function(node, html) {
      // Magic theory: IE8 supposedly differentiates between added and updated
      // nodes when processing innerHTML, innerHTML on updated nodes suffers
      // from worse whitespace behavior. Re-adding a node like this triggers
      // the initial and more favorable whitespace behavior.
      // TODO: What to do on a detached node?
      if (node.parentNode) {
        node.parentNode.replaceChild(node, node);
      }

      // We also implement a workaround for non-visible tags disappearing into
      // thin air on IE8, this only happens if there is no visible text
      // in-front of the non-visible tags. Piggyback on the whitespace fix
      // and simply check if any non-visible tags appear in the source.
      if (WHITESPACE_TEST.test(html) ||
          html[0] === '<' && NONVISIBLE_TEST.test(html)) {
        // Recover leading whitespace by temporarily prepending any character.
        // \uFEFF has the potential advantage of being zero-width/invisible.
        node.innerHTML = '\uFEFF' + html;

        // deleteData leaves an empty `TextNode` which offsets the index of all
        // children. Definitely want to avoid this.
        var textNode = node.firstChild;
        if (textNode.data.length === 1) {
          node.removeChild(textNode);
        } else {
          textNode.deleteData(0, 1);
        }
      } else {
        node.innerHTML = html;
      }
    };
  }
}

module.exports = setInnerHTML;

},{"./ExecutionEnvironment":31}],160:[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule setTextContent
 */

'use strict';

var ExecutionEnvironment = require("./ExecutionEnvironment");
var escapeTextContentForBrowser = require("./escapeTextContentForBrowser");
var setInnerHTML = require("./setInnerHTML");

/**
 * Set the textContent property of a node, ensuring that whitespace is preserved
 * even in IE8. innerText is a poor substitute for textContent and, among many
 * issues, inserts <br> instead of the literal newline chars. innerHTML behaves
 * as it should.
 *
 * @param {DOMElement} node
 * @param {string} text
 * @internal
 */
var setTextContent = function(node, text) {
  node.textContent = text;
};

if (ExecutionEnvironment.canUseDOM) {
  if (!('textContent' in document.documentElement)) {
    setTextContent = function(node, text) {
      setInnerHTML(node, escapeTextContentForBrowser(text));
    };
  }
}

module.exports = setTextContent;

},{"./ExecutionEnvironment":31,"./escapeTextContentForBrowser":127,"./setInnerHTML":159}],161:[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule shallowEqual
 */

'use strict';

/**
 * Performs equality by iterating through keys on an object and returning
 * false when any key has values which are not strictly equal between
 * objA and objB. Returns true when the values of all keys are strictly equal.
 *
 * @return {boolean}
 */
function shallowEqual(objA, objB) {
  if (objA === objB) {
    return true;
  }
  var key;
  // Test for A's keys different from B.
  for (key in objA) {
    if (objA.hasOwnProperty(key) &&
        (!objB.hasOwnProperty(key) || objA[key] !== objB[key])) {
      return false;
    }
  }
  // Test for B's keys missing from A.
  for (key in objB) {
    if (objB.hasOwnProperty(key) && !objA.hasOwnProperty(key)) {
      return false;
    }
  }
  return true;
}

module.exports = shallowEqual;

},{}],162:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule shouldUpdateReactComponent
 * @typechecks static-only
 */

'use strict';

var warning = require("./warning");

/**
 * Given a `prevElement` and `nextElement`, determines if the existing
 * instance should be updated as opposed to being destroyed or replaced by a new
 * instance. Both arguments are elements. This ensures that this logic can
 * operate on stateless trees without any backing instance.
 *
 * @param {?object} prevElement
 * @param {?object} nextElement
 * @return {boolean} True if the existing instance should be updated.
 * @protected
 */
function shouldUpdateReactComponent(prevElement, nextElement) {
  if (prevElement != null && nextElement != null) {
    var prevType = typeof prevElement;
    var nextType = typeof nextElement;
    if (prevType === 'string' || prevType === 'number') {
      return (nextType === 'string' || nextType === 'number');
    } else {
      if (nextType === 'object' &&
          prevElement.type === nextElement.type &&
          prevElement.key === nextElement.key) {
        var ownersMatch = prevElement._owner === nextElement._owner;
        var prevName = null;
        var nextName = null;
        var nextDisplayName = null;
        if ("production" !== process.env.NODE_ENV) {
          if (!ownersMatch) {
            if (prevElement._owner != null &&
                prevElement._owner.getPublicInstance() != null &&
                prevElement._owner.getPublicInstance().constructor != null) {
              prevName =
                prevElement._owner.getPublicInstance().constructor.displayName;
            }
            if (nextElement._owner != null &&
                nextElement._owner.getPublicInstance() != null &&
                nextElement._owner.getPublicInstance().constructor != null) {
              nextName =
                nextElement._owner.getPublicInstance().constructor.displayName;
            }
            if (nextElement.type != null &&
                nextElement.type.displayName != null) {
              nextDisplayName = nextElement.type.displayName;
            }
            if (nextElement.type != null && typeof nextElement.type === 'string') {
              nextDisplayName = nextElement.type;
            }
            if (typeof nextElement.type !== 'string' ||
                nextElement.type === 'input' ||
                nextElement.type === 'textarea') {
              if ((prevElement._owner != null &&
                  prevElement._owner._isOwnerNecessary === false) ||
                  (nextElement._owner != null &&
                  nextElement._owner._isOwnerNecessary === false)) {
                if (prevElement._owner != null) {
                  prevElement._owner._isOwnerNecessary = true;
                }
                if (nextElement._owner != null) {
                  nextElement._owner._isOwnerNecessary = true;
                }
                ("production" !== process.env.NODE_ENV ? warning(
                  false,
                  '<%s /> is being rendered by both %s and %s using the same ' +
                  'key (%s) in the same place. Currently, this means that ' +
                  'they don\'t preserve state. This behavior should be very ' +
                  'rare so we\'re considering deprecating it. Please contact ' +
                  'the React team and explain your use case so that we can ' +
                  'take that into consideration.',
                  nextDisplayName || 'Unknown Component',
                  prevName || '[Unknown]',
                  nextName || '[Unknown]',
                  prevElement.key
                ) : null);
              }
            }
          }
        }
        return ownersMatch;
      }
    }
  }
  return false;
}

module.exports = shouldUpdateReactComponent;

}).call(this,require('_process'))
},{"./warning":165,"_process":4}],163:[function(require,module,exports){
(function (process){
/**
 * Copyright 2014-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule toArray
 * @typechecks
 */

var invariant = require("./invariant");

/**
 * Convert array-like objects to arrays.
 *
 * This API assumes the caller knows the contents of the data type. For less
 * well defined inputs use createArrayFromMixed.
 *
 * @param {object|function|filelist} obj
 * @return {array}
 */
function toArray(obj) {
  var length = obj.length;

  // Some browse builtin objects can report typeof 'function' (e.g. NodeList in
  // old versions of Safari).
  ("production" !== process.env.NODE_ENV ? invariant(
    !Array.isArray(obj) &&
    (typeof obj === 'object' || typeof obj === 'function'),
    'toArray: Array-like object expected'
  ) : invariant(!Array.isArray(obj) &&
  (typeof obj === 'object' || typeof obj === 'function')));

  ("production" !== process.env.NODE_ENV ? invariant(
    typeof length === 'number',
    'toArray: Object needs a length property'
  ) : invariant(typeof length === 'number'));

  ("production" !== process.env.NODE_ENV ? invariant(
    length === 0 ||
    (length - 1) in obj,
    'toArray: Object should have keys for indices'
  ) : invariant(length === 0 ||
  (length - 1) in obj));

  // Old IE doesn't give collections access to hasOwnProperty. Assume inputs
  // without method will throw during the slice call and skip straight to the
  // fallback.
  if (obj.hasOwnProperty) {
    try {
      return Array.prototype.slice.call(obj);
    } catch (e) {
      // IE < 9 does not support Array#slice on collections objects
    }
  }

  // Fall back to copying key by key. This assumes all keys have a value,
  // so will not preserve sparsely populated inputs.
  var ret = Array(length);
  for (var ii = 0; ii < length; ii++) {
    ret[ii] = obj[ii];
  }
  return ret;
}

module.exports = toArray;

}).call(this,require('_process'))
},{"./invariant":146,"_process":4}],164:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule traverseAllChildren
 */

'use strict';

var ReactElement = require("./ReactElement");
var ReactFragment = require("./ReactFragment");
var ReactInstanceHandles = require("./ReactInstanceHandles");

var getIteratorFn = require("./getIteratorFn");
var invariant = require("./invariant");
var warning = require("./warning");

var SEPARATOR = ReactInstanceHandles.SEPARATOR;
var SUBSEPARATOR = ':';

/**
 * TODO: Test that a single child and an array with one item have the same key
 * pattern.
 */

var userProvidedKeyEscaperLookup = {
  '=': '=0',
  '.': '=1',
  ':': '=2'
};

var userProvidedKeyEscapeRegex = /[=.:]/g;

var didWarnAboutMaps = false;

function userProvidedKeyEscaper(match) {
  return userProvidedKeyEscaperLookup[match];
}

/**
 * Generate a key string that identifies a component within a set.
 *
 * @param {*} component A component that could contain a manual key.
 * @param {number} index Index that is used if a manual key is not provided.
 * @return {string}
 */
function getComponentKey(component, index) {
  if (component && component.key != null) {
    // Explicit key
    return wrapUserProvidedKey(component.key);
  }
  // Implicit key determined by the index in the set
  return index.toString(36);
}

/**
 * Escape a component key so that it is safe to use in a reactid.
 *
 * @param {*} key Component key to be escaped.
 * @return {string} An escaped string.
 */
function escapeUserProvidedKey(text) {
  return ('' + text).replace(
    userProvidedKeyEscapeRegex,
    userProvidedKeyEscaper
  );
}

/**
 * Wrap a `key` value explicitly provided by the user to distinguish it from
 * implicitly-generated keys generated by a component's index in its parent.
 *
 * @param {string} key Value of a user-provided `key` attribute
 * @return {string}
 */
function wrapUserProvidedKey(key) {
  return '$' + escapeUserProvidedKey(key);
}

/**
 * @param {?*} children Children tree container.
 * @param {!string} nameSoFar Name of the key path so far.
 * @param {!number} indexSoFar Number of children encountered until this point.
 * @param {!function} callback Callback to invoke with each child found.
 * @param {?*} traverseContext Used to pass information throughout the traversal
 * process.
 * @return {!number} The number of children in this subtree.
 */
function traverseAllChildrenImpl(
  children,
  nameSoFar,
  indexSoFar,
  callback,
  traverseContext
) {
  var type = typeof children;

  if (type === 'undefined' || type === 'boolean') {
    // All of the above are perceived as null.
    children = null;
  }

  if (children === null ||
      type === 'string' ||
      type === 'number' ||
      ReactElement.isValidElement(children)) {
    callback(
      traverseContext,
      children,
      // If it's the only child, treat the name as if it was wrapped in an array
      // so that it's consistent if the number of children grows.
      nameSoFar === '' ? SEPARATOR + getComponentKey(children, 0) : nameSoFar,
      indexSoFar
    );
    return 1;
  }

  var child, nextName, nextIndex;
  var subtreeCount = 0; // Count of children found in the current subtree.

  if (Array.isArray(children)) {
    for (var i = 0; i < children.length; i++) {
      child = children[i];
      nextName = (
        (nameSoFar !== '' ? nameSoFar + SUBSEPARATOR : SEPARATOR) +
        getComponentKey(child, i)
      );
      nextIndex = indexSoFar + subtreeCount;
      subtreeCount += traverseAllChildrenImpl(
        child,
        nextName,
        nextIndex,
        callback,
        traverseContext
      );
    }
  } else {
    var iteratorFn = getIteratorFn(children);
    if (iteratorFn) {
      var iterator = iteratorFn.call(children);
      var step;
      if (iteratorFn !== children.entries) {
        var ii = 0;
        while (!(step = iterator.next()).done) {
          child = step.value;
          nextName = (
            (nameSoFar !== '' ? nameSoFar + SUBSEPARATOR : SEPARATOR) +
            getComponentKey(child, ii++)
          );
          nextIndex = indexSoFar + subtreeCount;
          subtreeCount += traverseAllChildrenImpl(
            child,
            nextName,
            nextIndex,
            callback,
            traverseContext
          );
        }
      } else {
        if ("production" !== process.env.NODE_ENV) {
          ("production" !== process.env.NODE_ENV ? warning(
            didWarnAboutMaps,
            'Using Maps as children is not yet fully supported. It is an ' +
            'experimental feature that might be removed. Convert it to a ' +
            'sequence / iterable of keyed ReactElements instead.'
          ) : null);
          didWarnAboutMaps = true;
        }
        // Iterator will provide entry [k,v] tuples rather than values.
        while (!(step = iterator.next()).done) {
          var entry = step.value;
          if (entry) {
            child = entry[1];
            nextName = (
              (nameSoFar !== '' ? nameSoFar + SUBSEPARATOR : SEPARATOR) +
              wrapUserProvidedKey(entry[0]) + SUBSEPARATOR +
              getComponentKey(child, 0)
            );
            nextIndex = indexSoFar + subtreeCount;
            subtreeCount += traverseAllChildrenImpl(
              child,
              nextName,
              nextIndex,
              callback,
              traverseContext
            );
          }
        }
      }
    } else if (type === 'object') {
      ("production" !== process.env.NODE_ENV ? invariant(
        children.nodeType !== 1,
        'traverseAllChildren(...): Encountered an invalid child; DOM ' +
        'elements are not valid children of React components.'
      ) : invariant(children.nodeType !== 1));
      var fragment = ReactFragment.extract(children);
      for (var key in fragment) {
        if (fragment.hasOwnProperty(key)) {
          child = fragment[key];
          nextName = (
            (nameSoFar !== '' ? nameSoFar + SUBSEPARATOR : SEPARATOR) +
            wrapUserProvidedKey(key) + SUBSEPARATOR +
            getComponentKey(child, 0)
          );
          nextIndex = indexSoFar + subtreeCount;
          subtreeCount += traverseAllChildrenImpl(
            child,
            nextName,
            nextIndex,
            callback,
            traverseContext
          );
        }
      }
    }
  }

  return subtreeCount;
}

/**
 * Traverses children that are typically specified as `props.children`, but
 * might also be specified through attributes:
 *
 * - `traverseAllChildren(this.props.children, ...)`
 * - `traverseAllChildren(this.props.leftPanelChildren, ...)`
 *
 * The `traverseContext` is an optional argument that is passed through the
 * entire traversal. It can be used to store accumulations or anything else that
 * the callback might find relevant.
 *
 * @param {?*} children Children tree object.
 * @param {!function} callback To invoke upon traversing each child.
 * @param {?*} traverseContext Context for traversal.
 * @return {!number} The number of children in this subtree.
 */
function traverseAllChildren(children, callback, traverseContext) {
  if (children == null) {
    return 0;
  }

  return traverseAllChildrenImpl(children, '', 0, callback, traverseContext);
}

module.exports = traverseAllChildren;

}).call(this,require('_process'))
},{"./ReactElement":68,"./ReactFragment":74,"./ReactInstanceHandles":77,"./getIteratorFn":137,"./invariant":146,"./warning":165,"_process":4}],165:[function(require,module,exports){
(function (process){
/**
 * Copyright 2014-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule warning
 */

"use strict";

var emptyFunction = require("./emptyFunction");

/**
 * Similar to invariant but only logs a warning if the condition is not met.
 * This can be used to log issues in development environments in critical
 * paths. Removing the logging code for production environments will keep the
 * same logic and follow the same code paths.
 */

var warning = emptyFunction;

if ("production" !== process.env.NODE_ENV) {
  warning = function(condition, format ) {for (var args=[],$__0=2,$__1=arguments.length;$__0<$__1;$__0++) args.push(arguments[$__0]);
    if (format === undefined) {
      throw new Error(
        '`warning(condition, format, ...args)` requires a warning ' +
        'message argument'
      );
    }

    if (format.length < 10 || /^[s\W]*$/.test(format)) {
      throw new Error(
        'The warning format should be able to uniquely identify this ' +
        'warning. Please, use a more descriptive format than: ' + format
      );
    }

    if (format.indexOf('Failed Composite propType: ') === 0) {
      return; // Ignore CompositeComponent proptype check.
    }

    if (!condition) {
      var argIndex = 0;
      var message = 'Warning: ' + format.replace(/%s/g, function()  {return args[argIndex++];});
      console.warn(message);
      try {
        // --- Welcome to debugging React ---
        // This error was thrown as a convenience so that you can use this stack
        // to find the callsite that caused this warning to fire.
        throw new Error(message);
      } catch(x) {}
    }
  };
}

module.exports = warning;

}).call(this,require('_process'))
},{"./emptyFunction":125,"_process":4}],166:[function(require,module,exports){
module.exports = require('./lib/React');

},{"./lib/React":39}],167:[function(require,module,exports){

module.exports = require('./lib/');

},{"./lib/":168}],168:[function(require,module,exports){

/**
 * Module dependencies.
 */

var url = require('./url');
var parser = require('socket.io-parser');
var Manager = require('./manager');
var debug = require('debug')('socket.io-client');

/**
 * Module exports.
 */

module.exports = exports = lookup;

/**
 * Managers cache.
 */

var cache = exports.managers = {};

/**
 * Looks up an existing `Manager` for multiplexing.
 * If the user summons:
 *
 *   `io('http://localhost/a');`
 *   `io('http://localhost/b');`
 *
 * We reuse the existing instance based on same scheme/port/host,
 * and we initialize sockets for each namespace.
 *
 * @api public
 */

function lookup(uri, opts) {
  if (typeof uri == 'object') {
    opts = uri;
    uri = undefined;
  }

  opts = opts || {};

  var parsed = url(uri);
  var source = parsed.source;
  var id = parsed.id;
  var io;

  if (opts.forceNew || opts['force new connection'] || false === opts.multiplex) {
    debug('ignoring socket cache for %s', source);
    io = Manager(source, opts);
  } else {
    if (!cache[id]) {
      debug('new io instance for %s', source);
      cache[id] = Manager(source, opts);
    }
    io = cache[id];
  }

  return io.socket(parsed.path);
}

/**
 * Protocol version.
 *
 * @api public
 */

exports.protocol = parser.protocol;

/**
 * `connect`.
 *
 * @param {String} uri
 * @api public
 */

exports.connect = lookup;

/**
 * Expose constructors for standalone build.
 *
 * @api public
 */

exports.Manager = require('./manager');
exports.Socket = require('./socket');

},{"./manager":169,"./socket":171,"./url":172,"debug":176,"socket.io-parser":212}],169:[function(require,module,exports){

/**
 * Module dependencies.
 */

var url = require('./url');
var eio = require('engine.io-client');
var Socket = require('./socket');
var Emitter = require('component-emitter');
var parser = require('socket.io-parser');
var on = require('./on');
var bind = require('component-bind');
var object = require('object-component');
var debug = require('debug')('socket.io-client:manager');
var indexOf = require('indexof');
var Backoff = require('backo2');

/**
 * Module exports
 */

module.exports = Manager;

/**
 * `Manager` constructor.
 *
 * @param {String} engine instance or engine uri/opts
 * @param {Object} options
 * @api public
 */

function Manager(uri, opts){
  if (!(this instanceof Manager)) return new Manager(uri, opts);
  if (uri && ('object' == typeof uri)) {
    opts = uri;
    uri = undefined;
  }
  opts = opts || {};

  opts.path = opts.path || '/socket.io';
  this.nsps = {};
  this.subs = [];
  this.opts = opts;
  this.reconnection(opts.reconnection !== false);
  this.reconnectionAttempts(opts.reconnectionAttempts || Infinity);
  this.reconnectionDelay(opts.reconnectionDelay || 1000);
  this.reconnectionDelayMax(opts.reconnectionDelayMax || 5000);
  this.randomizationFactor(opts.randomizationFactor || 0.5);
  this.backoff = new Backoff({
    min: this.reconnectionDelay(),
    max: this.reconnectionDelayMax(),
    jitter: this.randomizationFactor()
  });
  this.timeout(null == opts.timeout ? 20000 : opts.timeout);
  this.readyState = 'closed';
  this.uri = uri;
  this.connected = [];
  this.encoding = false;
  this.packetBuffer = [];
  this.encoder = new parser.Encoder();
  this.decoder = new parser.Decoder();
  this.autoConnect = opts.autoConnect !== false;
  if (this.autoConnect) this.open();
}

/**
 * Propagate given event to sockets and emit on `this`
 *
 * @api private
 */

Manager.prototype.emitAll = function() {
  this.emit.apply(this, arguments);
  for (var nsp in this.nsps) {
    this.nsps[nsp].emit.apply(this.nsps[nsp], arguments);
  }
};

/**
 * Update `socket.id` of all sockets
 *
 * @api private
 */

Manager.prototype.updateSocketIds = function(){
  for (var nsp in this.nsps) {
    this.nsps[nsp].id = this.engine.id;
  }
};

/**
 * Mix in `Emitter`.
 */

Emitter(Manager.prototype);

/**
 * Sets the `reconnection` config.
 *
 * @param {Boolean} true/false if it should automatically reconnect
 * @return {Manager} self or value
 * @api public
 */

Manager.prototype.reconnection = function(v){
  if (!arguments.length) return this._reconnection;
  this._reconnection = !!v;
  return this;
};

/**
 * Sets the reconnection attempts config.
 *
 * @param {Number} max reconnection attempts before giving up
 * @return {Manager} self or value
 * @api public
 */

Manager.prototype.reconnectionAttempts = function(v){
  if (!arguments.length) return this._reconnectionAttempts;
  this._reconnectionAttempts = v;
  return this;
};

/**
 * Sets the delay between reconnections.
 *
 * @param {Number} delay
 * @return {Manager} self or value
 * @api public
 */

Manager.prototype.reconnectionDelay = function(v){
  if (!arguments.length) return this._reconnectionDelay;
  this._reconnectionDelay = v;
  this.backoff && this.backoff.setMin(v);
  return this;
};

Manager.prototype.randomizationFactor = function(v){
  if (!arguments.length) return this._randomizationFactor;
  this._randomizationFactor = v;
  this.backoff && this.backoff.setJitter(v);
  return this;
};

/**
 * Sets the maximum delay between reconnections.
 *
 * @param {Number} delay
 * @return {Manager} self or value
 * @api public
 */

Manager.prototype.reconnectionDelayMax = function(v){
  if (!arguments.length) return this._reconnectionDelayMax;
  this._reconnectionDelayMax = v;
  this.backoff && this.backoff.setMax(v);
  return this;
};

/**
 * Sets the connection timeout. `false` to disable
 *
 * @return {Manager} self or value
 * @api public
 */

Manager.prototype.timeout = function(v){
  if (!arguments.length) return this._timeout;
  this._timeout = v;
  return this;
};

/**
 * Starts trying to reconnect if reconnection is enabled and we have not
 * started reconnecting yet
 *
 * @api private
 */

Manager.prototype.maybeReconnectOnOpen = function() {
  // Only try to reconnect if it's the first time we're connecting
  if (!this.reconnecting && this._reconnection && this.backoff.attempts === 0) {
    // keeps reconnection from firing twice for the same reconnection loop
    this.reconnect();
  }
};


/**
 * Sets the current transport `socket`.
 *
 * @param {Function} optional, callback
 * @return {Manager} self
 * @api public
 */

Manager.prototype.open =
Manager.prototype.connect = function(fn){
  debug('readyState %s', this.readyState);
  if (~this.readyState.indexOf('open')) return this;

  debug('opening %s', this.uri);
  this.engine = eio(this.uri, this.opts);
  var socket = this.engine;
  var self = this;
  this.readyState = 'opening';
  this.skipReconnect = false;

  // emit `open`
  var openSub = on(socket, 'open', function() {
    self.onopen();
    fn && fn();
  });

  // emit `connect_error`
  var errorSub = on(socket, 'error', function(data){
    debug('connect_error');
    self.cleanup();
    self.readyState = 'closed';
    self.emitAll('connect_error', data);
    if (fn) {
      var err = new Error('Connection error');
      err.data = data;
      fn(err);
    } else {
      // Only do this if there is no fn to handle the error
      self.maybeReconnectOnOpen();
    }
  });

  // emit `connect_timeout`
  if (false !== this._timeout) {
    var timeout = this._timeout;
    debug('connect attempt will timeout after %d', timeout);

    // set timer
    var timer = setTimeout(function(){
      debug('connect attempt timed out after %d', timeout);
      openSub.destroy();
      socket.close();
      socket.emit('error', 'timeout');
      self.emitAll('connect_timeout', timeout);
    }, timeout);

    this.subs.push({
      destroy: function(){
        clearTimeout(timer);
      }
    });
  }

  this.subs.push(openSub);
  this.subs.push(errorSub);

  return this;
};

/**
 * Called upon transport open.
 *
 * @api private
 */

Manager.prototype.onopen = function(){
  debug('open');

  // clear old subs
  this.cleanup();

  // mark as open
  this.readyState = 'open';
  this.emit('open');

  // add new subs
  var socket = this.engine;
  this.subs.push(on(socket, 'data', bind(this, 'ondata')));
  this.subs.push(on(this.decoder, 'decoded', bind(this, 'ondecoded')));
  this.subs.push(on(socket, 'error', bind(this, 'onerror')));
  this.subs.push(on(socket, 'close', bind(this, 'onclose')));
};

/**
 * Called with data.
 *
 * @api private
 */

Manager.prototype.ondata = function(data){
  this.decoder.add(data);
};

/**
 * Called when parser fully decodes a packet.
 *
 * @api private
 */

Manager.prototype.ondecoded = function(packet) {
  this.emit('packet', packet);
};

/**
 * Called upon socket error.
 *
 * @api private
 */

Manager.prototype.onerror = function(err){
  debug('error', err);
  this.emitAll('error', err);
};

/**
 * Creates a new socket for the given `nsp`.
 *
 * @return {Socket}
 * @api public
 */

Manager.prototype.socket = function(nsp){
  var socket = this.nsps[nsp];
  if (!socket) {
    socket = new Socket(this, nsp);
    this.nsps[nsp] = socket;
    var self = this;
    socket.on('connect', function(){
      socket.id = self.engine.id;
      if (!~indexOf(self.connected, socket)) {
        self.connected.push(socket);
      }
    });
  }
  return socket;
};

/**
 * Called upon a socket close.
 *
 * @param {Socket} socket
 */

Manager.prototype.destroy = function(socket){
  var index = indexOf(this.connected, socket);
  if (~index) this.connected.splice(index, 1);
  if (this.connected.length) return;

  this.close();
};

/**
 * Writes a packet.
 *
 * @param {Object} packet
 * @api private
 */

Manager.prototype.packet = function(packet){
  debug('writing packet %j', packet);
  var self = this;

  if (!self.encoding) {
    // encode, then write to engine with result
    self.encoding = true;
    this.encoder.encode(packet, function(encodedPackets) {
      for (var i = 0; i < encodedPackets.length; i++) {
        self.engine.write(encodedPackets[i]);
      }
      self.encoding = false;
      self.processPacketQueue();
    });
  } else { // add packet to the queue
    self.packetBuffer.push(packet);
  }
};

/**
 * If packet buffer is non-empty, begins encoding the
 * next packet in line.
 *
 * @api private
 */

Manager.prototype.processPacketQueue = function() {
  if (this.packetBuffer.length > 0 && !this.encoding) {
    var pack = this.packetBuffer.shift();
    this.packet(pack);
  }
};

/**
 * Clean up transport subscriptions and packet buffer.
 *
 * @api private
 */

Manager.prototype.cleanup = function(){
  var sub;
  while (sub = this.subs.shift()) sub.destroy();

  this.packetBuffer = [];
  this.encoding = false;

  this.decoder.destroy();
};

/**
 * Close the current socket.
 *
 * @api private
 */

Manager.prototype.close =
Manager.prototype.disconnect = function(){
  this.skipReconnect = true;
  this.backoff.reset();
  this.readyState = 'closed';
  this.engine && this.engine.close();
};

/**
 * Called upon engine close.
 *
 * @api private
 */

Manager.prototype.onclose = function(reason){
  debug('close');
  this.cleanup();
  this.backoff.reset();
  this.readyState = 'closed';
  this.emit('close', reason);
  if (this._reconnection && !this.skipReconnect) {
    this.reconnect();
  }
};

/**
 * Attempt a reconnection.
 *
 * @api private
 */

Manager.prototype.reconnect = function(){
  if (this.reconnecting || this.skipReconnect) return this;

  var self = this;

  if (this.backoff.attempts >= this._reconnectionAttempts) {
    debug('reconnect failed');
    this.backoff.reset();
    this.emitAll('reconnect_failed');
    this.reconnecting = false;
  } else {
    var delay = this.backoff.duration();
    debug('will wait %dms before reconnect attempt', delay);

    this.reconnecting = true;
    var timer = setTimeout(function(){
      if (self.skipReconnect) return;

      debug('attempting reconnect');
      self.emitAll('reconnect_attempt', self.backoff.attempts);
      self.emitAll('reconnecting', self.backoff.attempts);

      // check again for the case socket closed in above events
      if (self.skipReconnect) return;

      self.open(function(err){
        if (err) {
          debug('reconnect attempt error');
          self.reconnecting = false;
          self.reconnect();
          self.emitAll('reconnect_error', err.data);
        } else {
          debug('reconnect success');
          self.onreconnect();
        }
      });
    }, delay);

    this.subs.push({
      destroy: function(){
        clearTimeout(timer);
      }
    });
  }
};

/**
 * Called upon successful reconnect.
 *
 * @api private
 */

Manager.prototype.onreconnect = function(){
  var attempt = this.backoff.attempts;
  this.reconnecting = false;
  this.backoff.reset();
  this.updateSocketIds();
  this.emitAll('reconnect', attempt);
};

},{"./on":170,"./socket":171,"./url":172,"backo2":173,"component-bind":174,"component-emitter":175,"debug":176,"engine.io-client":177,"indexof":208,"object-component":209,"socket.io-parser":212}],170:[function(require,module,exports){

/**
 * Module exports.
 */

module.exports = on;

/**
 * Helper for subscriptions.
 *
 * @param {Object|EventEmitter} obj with `Emitter` mixin or `EventEmitter`
 * @param {String} event name
 * @param {Function} callback
 * @api public
 */

function on(obj, ev, fn) {
  obj.on(ev, fn);
  return {
    destroy: function(){
      obj.removeListener(ev, fn);
    }
  };
}

},{}],171:[function(require,module,exports){

/**
 * Module dependencies.
 */

var parser = require('socket.io-parser');
var Emitter = require('component-emitter');
var toArray = require('to-array');
var on = require('./on');
var bind = require('component-bind');
var debug = require('debug')('socket.io-client:socket');
var hasBin = require('has-binary');

/**
 * Module exports.
 */

module.exports = exports = Socket;

/**
 * Internal events (blacklisted).
 * These events can't be emitted by the user.
 *
 * @api private
 */

var events = {
  connect: 1,
  connect_error: 1,
  connect_timeout: 1,
  disconnect: 1,
  error: 1,
  reconnect: 1,
  reconnect_attempt: 1,
  reconnect_failed: 1,
  reconnect_error: 1,
  reconnecting: 1
};

/**
 * Shortcut to `Emitter#emit`.
 */

var emit = Emitter.prototype.emit;

/**
 * `Socket` constructor.
 *
 * @api public
 */

function Socket(io, nsp){
  this.io = io;
  this.nsp = nsp;
  this.json = this; // compat
  this.ids = 0;
  this.acks = {};
  if (this.io.autoConnect) this.open();
  this.receiveBuffer = [];
  this.sendBuffer = [];
  this.connected = false;
  this.disconnected = true;
}

/**
 * Mix in `Emitter`.
 */

Emitter(Socket.prototype);

/**
 * Subscribe to open, close and packet events
 *
 * @api private
 */

Socket.prototype.subEvents = function() {
  if (this.subs) return;

  var io = this.io;
  this.subs = [
    on(io, 'open', bind(this, 'onopen')),
    on(io, 'packet', bind(this, 'onpacket')),
    on(io, 'close', bind(this, 'onclose'))
  ];
};

/**
 * "Opens" the socket.
 *
 * @api public
 */

Socket.prototype.open =
Socket.prototype.connect = function(){
  if (this.connected) return this;

  this.subEvents();
  this.io.open(); // ensure open
  if ('open' == this.io.readyState) this.onopen();
  return this;
};

/**
 * Sends a `message` event.
 *
 * @return {Socket} self
 * @api public
 */

Socket.prototype.send = function(){
  var args = toArray(arguments);
  args.unshift('message');
  this.emit.apply(this, args);
  return this;
};

/**
 * Override `emit`.
 * If the event is in `events`, it's emitted normally.
 *
 * @param {String} event name
 * @return {Socket} self
 * @api public
 */

Socket.prototype.emit = function(ev){
  if (events.hasOwnProperty(ev)) {
    emit.apply(this, arguments);
    return this;
  }

  var args = toArray(arguments);
  var parserType = parser.EVENT; // default
  if (hasBin(args)) { parserType = parser.BINARY_EVENT; } // binary
  var packet = { type: parserType, data: args };

  // event ack callback
  if ('function' == typeof args[args.length - 1]) {
    debug('emitting packet with ack id %d', this.ids);
    this.acks[this.ids] = args.pop();
    packet.id = this.ids++;
  }

  if (this.connected) {
    this.packet(packet);
  } else {
    this.sendBuffer.push(packet);
  }

  return this;
};

/**
 * Sends a packet.
 *
 * @param {Object} packet
 * @api private
 */

Socket.prototype.packet = function(packet){
  packet.nsp = this.nsp;
  this.io.packet(packet);
};

/**
 * Called upon engine `open`.
 *
 * @api private
 */

Socket.prototype.onopen = function(){
  debug('transport is open - connecting');

  // write connect packet if necessary
  if ('/' != this.nsp) {
    this.packet({ type: parser.CONNECT });
  }
};

/**
 * Called upon engine `close`.
 *
 * @param {String} reason
 * @api private
 */

Socket.prototype.onclose = function(reason){
  debug('close (%s)', reason);
  this.connected = false;
  this.disconnected = true;
  delete this.id;
  this.emit('disconnect', reason);
};

/**
 * Called with socket packet.
 *
 * @param {Object} packet
 * @api private
 */

Socket.prototype.onpacket = function(packet){
  if (packet.nsp != this.nsp) return;

  switch (packet.type) {
    case parser.CONNECT:
      this.onconnect();
      break;

    case parser.EVENT:
      this.onevent(packet);
      break;

    case parser.BINARY_EVENT:
      this.onevent(packet);
      break;

    case parser.ACK:
      this.onack(packet);
      break;

    case parser.BINARY_ACK:
      this.onack(packet);
      break;

    case parser.DISCONNECT:
      this.ondisconnect();
      break;

    case parser.ERROR:
      this.emit('error', packet.data);
      break;
  }
};

/**
 * Called upon a server event.
 *
 * @param {Object} packet
 * @api private
 */

Socket.prototype.onevent = function(packet){
  var args = packet.data || [];
  debug('emitting event %j', args);

  if (null != packet.id) {
    debug('attaching ack callback to event');
    args.push(this.ack(packet.id));
  }

  if (this.connected) {
    emit.apply(this, args);
  } else {
    this.receiveBuffer.push(args);
  }
};

/**
 * Produces an ack callback to emit with an event.
 *
 * @api private
 */

Socket.prototype.ack = function(id){
  var self = this;
  var sent = false;
  return function(){
    // prevent double callbacks
    if (sent) return;
    sent = true;
    var args = toArray(arguments);
    debug('sending ack %j', args);

    var type = hasBin(args) ? parser.BINARY_ACK : parser.ACK;
    self.packet({
      type: type,
      id: id,
      data: args
    });
  };
};

/**
 * Called upon a server acknowlegement.
 *
 * @param {Object} packet
 * @api private
 */

Socket.prototype.onack = function(packet){
  debug('calling ack %s with %j', packet.id, packet.data);
  var fn = this.acks[packet.id];
  fn.apply(this, packet.data);
  delete this.acks[packet.id];
};

/**
 * Called upon server connect.
 *
 * @api private
 */

Socket.prototype.onconnect = function(){
  this.connected = true;
  this.disconnected = false;
  this.emit('connect');
  this.emitBuffered();
};

/**
 * Emit buffered events (received and emitted).
 *
 * @api private
 */

Socket.prototype.emitBuffered = function(){
  var i;
  for (i = 0; i < this.receiveBuffer.length; i++) {
    emit.apply(this, this.receiveBuffer[i]);
  }
  this.receiveBuffer = [];

  for (i = 0; i < this.sendBuffer.length; i++) {
    this.packet(this.sendBuffer[i]);
  }
  this.sendBuffer = [];
};

/**
 * Called upon server disconnect.
 *
 * @api private
 */

Socket.prototype.ondisconnect = function(){
  debug('server disconnect (%s)', this.nsp);
  this.destroy();
  this.onclose('io server disconnect');
};

/**
 * Called upon forced client/server side disconnections,
 * this method ensures the manager stops tracking us and
 * that reconnections don't get triggered for this.
 *
 * @api private.
 */

Socket.prototype.destroy = function(){
  if (this.subs) {
    // clean subscriptions to avoid reconnections
    for (var i = 0; i < this.subs.length; i++) {
      this.subs[i].destroy();
    }
    this.subs = null;
  }

  this.io.destroy(this);
};

/**
 * Disconnects the socket manually.
 *
 * @return {Socket} self
 * @api public
 */

Socket.prototype.close =
Socket.prototype.disconnect = function(){
  if (this.connected) {
    debug('performing disconnect (%s)', this.nsp);
    this.packet({ type: parser.DISCONNECT });
  }

  // remove socket from pool
  this.destroy();

  if (this.connected) {
    // fire events
    this.onclose('io client disconnect');
  }
  return this;
};

},{"./on":170,"component-bind":174,"component-emitter":175,"debug":176,"has-binary":206,"socket.io-parser":212,"to-array":216}],172:[function(require,module,exports){
(function (global){

/**
 * Module dependencies.
 */

var parseuri = require('parseuri');
var debug = require('debug')('socket.io-client:url');

/**
 * Module exports.
 */

module.exports = url;

/**
 * URL parser.
 *
 * @param {String} url
 * @param {Object} An object meant to mimic window.location.
 *                 Defaults to window.location.
 * @api public
 */

function url(uri, loc){
  var obj = uri;

  // default to window.location
  var loc = loc || global.location;
  if (null == uri) uri = loc.protocol + '//' + loc.host;

  // relative path support
  if ('string' == typeof uri) {
    if ('/' == uri.charAt(0)) {
      if ('/' == uri.charAt(1)) {
        uri = loc.protocol + uri;
      } else {
        uri = loc.hostname + uri;
      }
    }

    if (!/^(https?|wss?):\/\//.test(uri)) {
      debug('protocol-less url %s', uri);
      if ('undefined' != typeof loc) {
        uri = loc.protocol + '//' + uri;
      } else {
        uri = 'https://' + uri;
      }
    }

    // parse
    debug('parse %s', uri);
    obj = parseuri(uri);
  }

  // make sure we treat `localhost:80` and `localhost` equally
  if (!obj.port) {
    if (/^(http|ws)$/.test(obj.protocol)) {
      obj.port = '80';
    }
    else if (/^(http|ws)s$/.test(obj.protocol)) {
      obj.port = '443';
    }
  }

  obj.path = obj.path || '/';

  // define unique id
  obj.id = obj.protocol + '://' + obj.host + ':' + obj.port;
  // define href
  obj.href = obj.protocol + '://' + obj.host + (loc && loc.port == obj.port ? '' : (':' + obj.port));

  return obj;
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"debug":176,"parseuri":210}],173:[function(require,module,exports){

/**
 * Expose `Backoff`.
 */

module.exports = Backoff;

/**
 * Initialize backoff timer with `opts`.
 *
 * - `min` initial timeout in milliseconds [100]
 * - `max` max timeout [10000]
 * - `jitter` [0]
 * - `factor` [2]
 *
 * @param {Object} opts
 * @api public
 */

function Backoff(opts) {
  opts = opts || {};
  this.ms = opts.min || 100;
  this.max = opts.max || 10000;
  this.factor = opts.factor || 2;
  this.jitter = opts.jitter > 0 && opts.jitter <= 1 ? opts.jitter : 0;
  this.attempts = 0;
}

/**
 * Return the backoff duration.
 *
 * @return {Number}
 * @api public
 */

Backoff.prototype.duration = function(){
  var ms = this.ms * Math.pow(this.factor, this.attempts++);
  if (this.jitter) {
    var rand =  Math.random();
    var deviation = Math.floor(rand * this.jitter * ms);
    ms = (Math.floor(rand * 10) & 1) == 0  ? ms - deviation : ms + deviation;
  }
  return Math.min(ms, this.max) | 0;
};

/**
 * Reset the number of attempts.
 *
 * @api public
 */

Backoff.prototype.reset = function(){
  this.attempts = 0;
};

/**
 * Set the minimum duration
 *
 * @api public
 */

Backoff.prototype.setMin = function(min){
  this.ms = min;
};

/**
 * Set the maximum duration
 *
 * @api public
 */

Backoff.prototype.setMax = function(max){
  this.max = max;
};

/**
 * Set the jitter
 *
 * @api public
 */

Backoff.prototype.setJitter = function(jitter){
  this.jitter = jitter;
};


},{}],174:[function(require,module,exports){
/**
 * Slice reference.
 */

var slice = [].slice;

/**
 * Bind `obj` to `fn`.
 *
 * @param {Object} obj
 * @param {Function|String} fn or string
 * @return {Function}
 * @api public
 */

module.exports = function(obj, fn){
  if ('string' == typeof fn) fn = obj[fn];
  if ('function' != typeof fn) throw new Error('bind() requires a function');
  var args = slice.call(arguments, 2);
  return function(){
    return fn.apply(obj, args.concat(slice.call(arguments)));
  }
};

},{}],175:[function(require,module,exports){

/**
 * Expose `Emitter`.
 */

module.exports = Emitter;

/**
 * Initialize a new `Emitter`.
 *
 * @api public
 */

function Emitter(obj) {
  if (obj) return mixin(obj);
};

/**
 * Mixin the emitter properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function mixin(obj) {
  for (var key in Emitter.prototype) {
    obj[key] = Emitter.prototype[key];
  }
  return obj;
}

/**
 * Listen on the given `event` with `fn`.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.on =
Emitter.prototype.addEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};
  (this._callbacks[event] = this._callbacks[event] || [])
    .push(fn);
  return this;
};

/**
 * Adds an `event` listener that will be invoked a single
 * time then automatically removed.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.once = function(event, fn){
  var self = this;
  this._callbacks = this._callbacks || {};

  function on() {
    self.off(event, on);
    fn.apply(this, arguments);
  }

  on.fn = fn;
  this.on(event, on);
  return this;
};

/**
 * Remove the given callback for `event` or all
 * registered callbacks.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.off =
Emitter.prototype.removeListener =
Emitter.prototype.removeAllListeners =
Emitter.prototype.removeEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};

  // all
  if (0 == arguments.length) {
    this._callbacks = {};
    return this;
  }

  // specific event
  var callbacks = this._callbacks[event];
  if (!callbacks) return this;

  // remove all handlers
  if (1 == arguments.length) {
    delete this._callbacks[event];
    return this;
  }

  // remove specific handler
  var cb;
  for (var i = 0; i < callbacks.length; i++) {
    cb = callbacks[i];
    if (cb === fn || cb.fn === fn) {
      callbacks.splice(i, 1);
      break;
    }
  }
  return this;
};

/**
 * Emit `event` with the given args.
 *
 * @param {String} event
 * @param {Mixed} ...
 * @return {Emitter}
 */

Emitter.prototype.emit = function(event){
  this._callbacks = this._callbacks || {};
  var args = [].slice.call(arguments, 1)
    , callbacks = this._callbacks[event];

  if (callbacks) {
    callbacks = callbacks.slice(0);
    for (var i = 0, len = callbacks.length; i < len; ++i) {
      callbacks[i].apply(this, args);
    }
  }

  return this;
};

/**
 * Return array of callbacks for `event`.
 *
 * @param {String} event
 * @return {Array}
 * @api public
 */

Emitter.prototype.listeners = function(event){
  this._callbacks = this._callbacks || {};
  return this._callbacks[event] || [];
};

/**
 * Check if this emitter has `event` handlers.
 *
 * @param {String} event
 * @return {Boolean}
 * @api public
 */

Emitter.prototype.hasListeners = function(event){
  return !! this.listeners(event).length;
};

},{}],176:[function(require,module,exports){

/**
 * Expose `debug()` as the module.
 */

module.exports = debug;

/**
 * Create a debugger with the given `name`.
 *
 * @param {String} name
 * @return {Type}
 * @api public
 */

function debug(name) {
  if (!debug.enabled(name)) return function(){};

  return function(fmt){
    fmt = coerce(fmt);

    var curr = new Date;
    var ms = curr - (debug[name] || curr);
    debug[name] = curr;

    fmt = name
      + ' '
      + fmt
      + ' +' + debug.humanize(ms);

    // This hackery is required for IE8
    // where `console.log` doesn't have 'apply'
    window.console
      && console.log
      && Function.prototype.apply.call(console.log, console, arguments);
  }
}

/**
 * The currently active debug mode names.
 */

debug.names = [];
debug.skips = [];

/**
 * Enables a debug mode by name. This can include modes
 * separated by a colon and wildcards.
 *
 * @param {String} name
 * @api public
 */

debug.enable = function(name) {
  try {
    localStorage.debug = name;
  } catch(e){}

  var split = (name || '').split(/[\s,]+/)
    , len = split.length;

  for (var i = 0; i < len; i++) {
    name = split[i].replace('*', '.*?');
    if (name[0] === '-') {
      debug.skips.push(new RegExp('^' + name.substr(1) + '$'));
    }
    else {
      debug.names.push(new RegExp('^' + name + '$'));
    }
  }
};

/**
 * Disable debug output.
 *
 * @api public
 */

debug.disable = function(){
  debug.enable('');
};

/**
 * Humanize the given `ms`.
 *
 * @param {Number} m
 * @return {String}
 * @api private
 */

debug.humanize = function(ms) {
  var sec = 1000
    , min = 60 * 1000
    , hour = 60 * min;

  if (ms >= hour) return (ms / hour).toFixed(1) + 'h';
  if (ms >= min) return (ms / min).toFixed(1) + 'm';
  if (ms >= sec) return (ms / sec | 0) + 's';
  return ms + 'ms';
};

/**
 * Returns true if the given mode name is enabled, false otherwise.
 *
 * @param {String} name
 * @return {Boolean}
 * @api public
 */

debug.enabled = function(name) {
  for (var i = 0, len = debug.skips.length; i < len; i++) {
    if (debug.skips[i].test(name)) {
      return false;
    }
  }
  for (var i = 0, len = debug.names.length; i < len; i++) {
    if (debug.names[i].test(name)) {
      return true;
    }
  }
  return false;
};

/**
 * Coerce `val`.
 */

function coerce(val) {
  if (val instanceof Error) return val.stack || val.message;
  return val;
}

// persist

try {
  if (window.localStorage) debug.enable(localStorage.debug);
} catch(e){}

},{}],177:[function(require,module,exports){

module.exports =  require('./lib/');

},{"./lib/":178}],178:[function(require,module,exports){

module.exports = require('./socket');

/**
 * Exports parser
 *
 * @api public
 *
 */
module.exports.parser = require('engine.io-parser');

},{"./socket":179,"engine.io-parser":191}],179:[function(require,module,exports){
(function (global){
/**
 * Module dependencies.
 */

var transports = require('./transports');
var Emitter = require('component-emitter');
var debug = require('debug')('engine.io-client:socket');
var index = require('indexof');
var parser = require('engine.io-parser');
var parseuri = require('parseuri');
var parsejson = require('parsejson');
var parseqs = require('parseqs');

/**
 * Module exports.
 */

module.exports = Socket;

/**
 * Noop function.
 *
 * @api private
 */

function noop(){}

/**
 * Socket constructor.
 *
 * @param {String|Object} uri or options
 * @param {Object} options
 * @api public
 */

function Socket(uri, opts){
  if (!(this instanceof Socket)) return new Socket(uri, opts);

  opts = opts || {};

  if (uri && 'object' == typeof uri) {
    opts = uri;
    uri = null;
  }

  if (uri) {
    uri = parseuri(uri);
    opts.host = uri.host;
    opts.secure = uri.protocol == 'https' || uri.protocol == 'wss';
    opts.port = uri.port;
    if (uri.query) opts.query = uri.query;
  }

  this.secure = null != opts.secure ? opts.secure :
    (global.location && 'https:' == location.protocol);

  if (opts.host) {
    var pieces = opts.host.split(':');
    opts.hostname = pieces.shift();
    if (pieces.length) {
      opts.port = pieces.pop();
    } else if (!opts.port) {
      // if no port is specified manually, use the protocol default
      opts.port = this.secure ? '443' : '80';
    }
  }

  this.agent = opts.agent || false;
  this.hostname = opts.hostname ||
    (global.location ? location.hostname : 'localhost');
  this.port = opts.port || (global.location && location.port ?
       location.port :
       (this.secure ? 443 : 80));
  this.query = opts.query || {};
  if ('string' == typeof this.query) this.query = parseqs.decode(this.query);
  this.upgrade = false !== opts.upgrade;
  this.path = (opts.path || '/engine.io').replace(/\/$/, '') + '/';
  this.forceJSONP = !!opts.forceJSONP;
  this.jsonp = false !== opts.jsonp;
  this.forceBase64 = !!opts.forceBase64;
  this.enablesXDR = !!opts.enablesXDR;
  this.timestampParam = opts.timestampParam || 't';
  this.timestampRequests = opts.timestampRequests;
  this.transports = opts.transports || ['polling', 'websocket'];
  this.readyState = '';
  this.writeBuffer = [];
  this.callbackBuffer = [];
  this.policyPort = opts.policyPort || 843;
  this.rememberUpgrade = opts.rememberUpgrade || false;
  this.binaryType = null;
  this.onlyBinaryUpgrades = opts.onlyBinaryUpgrades;

  // SSL options for Node.js client
  this.pfx = opts.pfx || null;
  this.key = opts.key || null;
  this.passphrase = opts.passphrase || null;
  this.cert = opts.cert || null;
  this.ca = opts.ca || null;
  this.ciphers = opts.ciphers || null;
  this.rejectUnauthorized = opts.rejectUnauthorized || null;

  this.open();
}

Socket.priorWebsocketSuccess = false;

/**
 * Mix in `Emitter`.
 */

Emitter(Socket.prototype);

/**
 * Protocol version.
 *
 * @api public
 */

Socket.protocol = parser.protocol; // this is an int

/**
 * Expose deps for legacy compatibility
 * and standalone browser access.
 */

Socket.Socket = Socket;
Socket.Transport = require('./transport');
Socket.transports = require('./transports');
Socket.parser = require('engine.io-parser');

/**
 * Creates transport of the given type.
 *
 * @param {String} transport name
 * @return {Transport}
 * @api private
 */

Socket.prototype.createTransport = function (name) {
  debug('creating transport "%s"', name);
  var query = clone(this.query);

  // append engine.io protocol identifier
  query.EIO = parser.protocol;

  // transport name
  query.transport = name;

  // session id if we already have one
  if (this.id) query.sid = this.id;

  var transport = new transports[name]({
    agent: this.agent,
    hostname: this.hostname,
    port: this.port,
    secure: this.secure,
    path: this.path,
    query: query,
    forceJSONP: this.forceJSONP,
    jsonp: this.jsonp,
    forceBase64: this.forceBase64,
    enablesXDR: this.enablesXDR,
    timestampRequests: this.timestampRequests,
    timestampParam: this.timestampParam,
    policyPort: this.policyPort,
    socket: this,
    pfx: this.pfx,
    key: this.key,
    passphrase: this.passphrase,
    cert: this.cert,
    ca: this.ca,
    ciphers: this.ciphers,
    rejectUnauthorized: this.rejectUnauthorized
  });

  return transport;
};

function clone (obj) {
  var o = {};
  for (var i in obj) {
    if (obj.hasOwnProperty(i)) {
      o[i] = obj[i];
    }
  }
  return o;
}

/**
 * Initializes transport to use and starts probe.
 *
 * @api private
 */
Socket.prototype.open = function () {
  var transport;
  if (this.rememberUpgrade && Socket.priorWebsocketSuccess && this.transports.indexOf('websocket') != -1) {
    transport = 'websocket';
  } else if (0 == this.transports.length) {
    // Emit error on next tick so it can be listened to
    var self = this;
    setTimeout(function() {
      self.emit('error', 'No transports available');
    }, 0);
    return;
  } else {
    transport = this.transports[0];
  }
  this.readyState = 'opening';

  // Retry with the next transport if the transport is disabled (jsonp: false)
  var transport;
  try {
    transport = this.createTransport(transport);
  } catch (e) {
    this.transports.shift();
    this.open();
    return;
  }

  transport.open();
  this.setTransport(transport);
};

/**
 * Sets the current transport. Disables the existing one (if any).
 *
 * @api private
 */

Socket.prototype.setTransport = function(transport){
  debug('setting transport %s', transport.name);
  var self = this;

  if (this.transport) {
    debug('clearing existing transport %s', this.transport.name);
    this.transport.removeAllListeners();
  }

  // set up transport
  this.transport = transport;

  // set up transport listeners
  transport
  .on('drain', function(){
    self.onDrain();
  })
  .on('packet', function(packet){
    self.onPacket(packet);
  })
  .on('error', function(e){
    self.onError(e);
  })
  .on('close', function(){
    self.onClose('transport close');
  });
};

/**
 * Probes a transport.
 *
 * @param {String} transport name
 * @api private
 */

Socket.prototype.probe = function (name) {
  debug('probing transport "%s"', name);
  var transport = this.createTransport(name, { probe: 1 })
    , failed = false
    , self = this;

  Socket.priorWebsocketSuccess = false;

  function onTransportOpen(){
    if (self.onlyBinaryUpgrades) {
      var upgradeLosesBinary = !this.supportsBinary && self.transport.supportsBinary;
      failed = failed || upgradeLosesBinary;
    }
    if (failed) return;

    debug('probe transport "%s" opened', name);
    transport.send([{ type: 'ping', data: 'probe' }]);
    transport.once('packet', function (msg) {
      if (failed) return;
      if ('pong' == msg.type && 'probe' == msg.data) {
        debug('probe transport "%s" pong', name);
        self.upgrading = true;
        self.emit('upgrading', transport);
        if (!transport) return;
        Socket.priorWebsocketSuccess = 'websocket' == transport.name;

        debug('pausing current transport "%s"', self.transport.name);
        self.transport.pause(function () {
          if (failed) return;
          if ('closed' == self.readyState) return;
          debug('changing transport and sending upgrade packet');

          cleanup();

          self.setTransport(transport);
          transport.send([{ type: 'upgrade' }]);
          self.emit('upgrade', transport);
          transport = null;
          self.upgrading = false;
          self.flush();
        });
      } else {
        debug('probe transport "%s" failed', name);
        var err = new Error('probe error');
        err.transport = transport.name;
        self.emit('upgradeError', err);
      }
    });
  }

  function freezeTransport() {
    if (failed) return;

    // Any callback called by transport should be ignored since now
    failed = true;

    cleanup();

    transport.close();
    transport = null;
  }

  //Handle any error that happens while probing
  function onerror(err) {
    var error = new Error('probe error: ' + err);
    error.transport = transport.name;

    freezeTransport();

    debug('probe transport "%s" failed because of error: %s', name, err);

    self.emit('upgradeError', error);
  }

  function onTransportClose(){
    onerror("transport closed");
  }

  //When the socket is closed while we're probing
  function onclose(){
    onerror("socket closed");
  }

  //When the socket is upgraded while we're probing
  function onupgrade(to){
    if (transport && to.name != transport.name) {
      debug('"%s" works - aborting "%s"', to.name, transport.name);
      freezeTransport();
    }
  }

  //Remove all listeners on the transport and on self
  function cleanup(){
    transport.removeListener('open', onTransportOpen);
    transport.removeListener('error', onerror);
    transport.removeListener('close', onTransportClose);
    self.removeListener('close', onclose);
    self.removeListener('upgrading', onupgrade);
  }

  transport.once('open', onTransportOpen);
  transport.once('error', onerror);
  transport.once('close', onTransportClose);

  this.once('close', onclose);
  this.once('upgrading', onupgrade);

  transport.open();

};

/**
 * Called when connection is deemed open.
 *
 * @api public
 */

Socket.prototype.onOpen = function () {
  debug('socket open');
  this.readyState = 'open';
  Socket.priorWebsocketSuccess = 'websocket' == this.transport.name;
  this.emit('open');
  this.flush();

  // we check for `readyState` in case an `open`
  // listener already closed the socket
  if ('open' == this.readyState && this.upgrade && this.transport.pause) {
    debug('starting upgrade probes');
    for (var i = 0, l = this.upgrades.length; i < l; i++) {
      this.probe(this.upgrades[i]);
    }
  }
};

/**
 * Handles a packet.
 *
 * @api private
 */

Socket.prototype.onPacket = function (packet) {
  if ('opening' == this.readyState || 'open' == this.readyState) {
    debug('socket receive: type "%s", data "%s"', packet.type, packet.data);

    this.emit('packet', packet);

    // Socket is live - any packet counts
    this.emit('heartbeat');

    switch (packet.type) {
      case 'open':
        this.onHandshake(parsejson(packet.data));
        break;

      case 'pong':
        this.setPing();
        break;

      case 'error':
        var err = new Error('server error');
        err.code = packet.data;
        this.emit('error', err);
        break;

      case 'message':
        this.emit('data', packet.data);
        this.emit('message', packet.data);
        break;
    }
  } else {
    debug('packet received with socket readyState "%s"', this.readyState);
  }
};

/**
 * Called upon handshake completion.
 *
 * @param {Object} handshake obj
 * @api private
 */

Socket.prototype.onHandshake = function (data) {
  this.emit('handshake', data);
  this.id = data.sid;
  this.transport.query.sid = data.sid;
  this.upgrades = this.filterUpgrades(data.upgrades);
  this.pingInterval = data.pingInterval;
  this.pingTimeout = data.pingTimeout;
  this.onOpen();
  // In case open handler closes socket
  if  ('closed' == this.readyState) return;
  this.setPing();

  // Prolong liveness of socket on heartbeat
  this.removeListener('heartbeat', this.onHeartbeat);
  this.on('heartbeat', this.onHeartbeat);
};

/**
 * Resets ping timeout.
 *
 * @api private
 */

Socket.prototype.onHeartbeat = function (timeout) {
  clearTimeout(this.pingTimeoutTimer);
  var self = this;
  self.pingTimeoutTimer = setTimeout(function () {
    if ('closed' == self.readyState) return;
    self.onClose('ping timeout');
  }, timeout || (self.pingInterval + self.pingTimeout));
};

/**
 * Pings server every `this.pingInterval` and expects response
 * within `this.pingTimeout` or closes connection.
 *
 * @api private
 */

Socket.prototype.setPing = function () {
  var self = this;
  clearTimeout(self.pingIntervalTimer);
  self.pingIntervalTimer = setTimeout(function () {
    debug('writing ping packet - expecting pong within %sms', self.pingTimeout);
    self.ping();
    self.onHeartbeat(self.pingTimeout);
  }, self.pingInterval);
};

/**
* Sends a ping packet.
*
* @api public
*/

Socket.prototype.ping = function () {
  this.sendPacket('ping');
};

/**
 * Called on `drain` event
 *
 * @api private
 */

Socket.prototype.onDrain = function() {
  for (var i = 0; i < this.prevBufferLen; i++) {
    if (this.callbackBuffer[i]) {
      this.callbackBuffer[i]();
    }
  }

  this.writeBuffer.splice(0, this.prevBufferLen);
  this.callbackBuffer.splice(0, this.prevBufferLen);

  // setting prevBufferLen = 0 is very important
  // for example, when upgrading, upgrade packet is sent over,
  // and a nonzero prevBufferLen could cause problems on `drain`
  this.prevBufferLen = 0;

  if (this.writeBuffer.length == 0) {
    this.emit('drain');
  } else {
    this.flush();
  }
};

/**
 * Flush write buffers.
 *
 * @api private
 */

Socket.prototype.flush = function () {
  if ('closed' != this.readyState && this.transport.writable &&
    !this.upgrading && this.writeBuffer.length) {
    debug('flushing %d packets in socket', this.writeBuffer.length);
    this.transport.send(this.writeBuffer);
    // keep track of current length of writeBuffer
    // splice writeBuffer and callbackBuffer on `drain`
    this.prevBufferLen = this.writeBuffer.length;
    this.emit('flush');
  }
};

/**
 * Sends a message.
 *
 * @param {String} message.
 * @param {Function} callback function.
 * @return {Socket} for chaining.
 * @api public
 */

Socket.prototype.write =
Socket.prototype.send = function (msg, fn) {
  this.sendPacket('message', msg, fn);
  return this;
};

/**
 * Sends a packet.
 *
 * @param {String} packet type.
 * @param {String} data.
 * @param {Function} callback function.
 * @api private
 */

Socket.prototype.sendPacket = function (type, data, fn) {
  if ('closing' == this.readyState || 'closed' == this.readyState) {
    return;
  }

  var packet = { type: type, data: data };
  this.emit('packetCreate', packet);
  this.writeBuffer.push(packet);
  this.callbackBuffer.push(fn);
  this.flush();
};

/**
 * Closes the connection.
 *
 * @api private
 */

Socket.prototype.close = function () {
  if ('opening' == this.readyState || 'open' == this.readyState) {
    this.readyState = 'closing';

    var self = this;

    function close() {
      self.onClose('forced close');
      debug('socket closing - telling transport to close');
      self.transport.close();
    }

    function cleanupAndClose() {
      self.removeListener('upgrade', cleanupAndClose);
      self.removeListener('upgradeError', cleanupAndClose);
      close();
    }

    function waitForUpgrade() {
      // wait for upgrade to finish since we can't send packets while pausing a transport
      self.once('upgrade', cleanupAndClose);
      self.once('upgradeError', cleanupAndClose);
    }

    if (this.writeBuffer.length) {
      this.once('drain', function() {
        if (this.upgrading) {
          waitForUpgrade();
        } else {
          close();
        }
      });
    } else if (this.upgrading) {
      waitForUpgrade();
    } else {
      close();
    }
  }

  return this;
};

/**
 * Called upon transport error
 *
 * @api private
 */

Socket.prototype.onError = function (err) {
  debug('socket error %j', err);
  Socket.priorWebsocketSuccess = false;
  this.emit('error', err);
  this.onClose('transport error', err);
};

/**
 * Called upon transport close.
 *
 * @api private
 */

Socket.prototype.onClose = function (reason, desc) {
  if ('opening' == this.readyState || 'open' == this.readyState || 'closing' == this.readyState) {
    debug('socket close with reason: "%s"', reason);
    var self = this;

    // clear timers
    clearTimeout(this.pingIntervalTimer);
    clearTimeout(this.pingTimeoutTimer);

    // clean buffers in next tick, so developers can still
    // grab the buffers on `close` event
    setTimeout(function() {
      self.writeBuffer = [];
      self.callbackBuffer = [];
      self.prevBufferLen = 0;
    }, 0);

    // stop event from firing again for transport
    this.transport.removeAllListeners('close');

    // ensure transport won't stay open
    this.transport.close();

    // ignore further transport communication
    this.transport.removeAllListeners();

    // set ready state
    this.readyState = 'closed';

    // clear session id
    this.id = null;

    // emit close event
    this.emit('close', reason, desc);
  }
};

/**
 * Filters upgrades, returning only those matching client transports.
 *
 * @param {Array} server upgrades
 * @api private
 *
 */

Socket.prototype.filterUpgrades = function (upgrades) {
  var filteredUpgrades = [];
  for (var i = 0, j = upgrades.length; i<j; i++) {
    if (~index(this.transports, upgrades[i])) filteredUpgrades.push(upgrades[i]);
  }
  return filteredUpgrades;
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./transport":180,"./transports":181,"component-emitter":175,"debug":188,"engine.io-parser":191,"indexof":208,"parsejson":202,"parseqs":203,"parseuri":204}],180:[function(require,module,exports){
/**
 * Module dependencies.
 */

var parser = require('engine.io-parser');
var Emitter = require('component-emitter');

/**
 * Module exports.
 */

module.exports = Transport;

/**
 * Transport abstract constructor.
 *
 * @param {Object} options.
 * @api private
 */

function Transport (opts) {
  this.path = opts.path;
  this.hostname = opts.hostname;
  this.port = opts.port;
  this.secure = opts.secure;
  this.query = opts.query;
  this.timestampParam = opts.timestampParam;
  this.timestampRequests = opts.timestampRequests;
  this.readyState = '';
  this.agent = opts.agent || false;
  this.socket = opts.socket;
  this.enablesXDR = opts.enablesXDR;

  // SSL options for Node.js client
  this.pfx = opts.pfx;
  this.key = opts.key;
  this.passphrase = opts.passphrase;
  this.cert = opts.cert;
  this.ca = opts.ca;
  this.ciphers = opts.ciphers;
  this.rejectUnauthorized = opts.rejectUnauthorized;
}

/**
 * Mix in `Emitter`.
 */

Emitter(Transport.prototype);

/**
 * A counter used to prevent collisions in the timestamps used
 * for cache busting.
 */

Transport.timestamps = 0;

/**
 * Emits an error.
 *
 * @param {String} str
 * @return {Transport} for chaining
 * @api public
 */

Transport.prototype.onError = function (msg, desc) {
  var err = new Error(msg);
  err.type = 'TransportError';
  err.description = desc;
  this.emit('error', err);
  return this;
};

/**
 * Opens the transport.
 *
 * @api public
 */

Transport.prototype.open = function () {
  if ('closed' == this.readyState || '' == this.readyState) {
    this.readyState = 'opening';
    this.doOpen();
  }

  return this;
};

/**
 * Closes the transport.
 *
 * @api private
 */

Transport.prototype.close = function () {
  if ('opening' == this.readyState || 'open' == this.readyState) {
    this.doClose();
    this.onClose();
  }

  return this;
};

/**
 * Sends multiple packets.
 *
 * @param {Array} packets
 * @api private
 */

Transport.prototype.send = function(packets){
  if ('open' == this.readyState) {
    this.write(packets);
  } else {
    throw new Error('Transport not open');
  }
};

/**
 * Called upon open
 *
 * @api private
 */

Transport.prototype.onOpen = function () {
  this.readyState = 'open';
  this.writable = true;
  this.emit('open');
};

/**
 * Called with data.
 *
 * @param {String} data
 * @api private
 */

Transport.prototype.onData = function(data){
  var packet = parser.decodePacket(data, this.socket.binaryType);
  this.onPacket(packet);
};

/**
 * Called with a decoded packet.
 */

Transport.prototype.onPacket = function (packet) {
  this.emit('packet', packet);
};

/**
 * Called upon close.
 *
 * @api private
 */

Transport.prototype.onClose = function () {
  this.readyState = 'closed';
  this.emit('close');
};

},{"component-emitter":175,"engine.io-parser":191}],181:[function(require,module,exports){
(function (global){
/**
 * Module dependencies
 */

var XMLHttpRequest = require('xmlhttprequest');
var XHR = require('./polling-xhr');
var JSONP = require('./polling-jsonp');
var websocket = require('./websocket');

/**
 * Export transports.
 */

exports.polling = polling;
exports.websocket = websocket;

/**
 * Polling transport polymorphic constructor.
 * Decides on xhr vs jsonp based on feature detection.
 *
 * @api private
 */

function polling(opts){
  var xhr;
  var xd = false;
  var xs = false;
  var jsonp = false !== opts.jsonp;

  if (global.location) {
    var isSSL = 'https:' == location.protocol;
    var port = location.port;

    // some user agents have empty `location.port`
    if (!port) {
      port = isSSL ? 443 : 80;
    }

    xd = opts.hostname != location.hostname || port != opts.port;
    xs = opts.secure != isSSL;
  }

  opts.xdomain = xd;
  opts.xscheme = xs;
  xhr = new XMLHttpRequest(opts);

  if ('open' in xhr && !opts.forceJSONP) {
    return new XHR(opts);
  } else {
    if (!jsonp) throw new Error('JSONP disabled');
    return new JSONP(opts);
  }
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./polling-jsonp":182,"./polling-xhr":183,"./websocket":185,"xmlhttprequest":186}],182:[function(require,module,exports){
(function (global){

/**
 * Module requirements.
 */

var Polling = require('./polling');
var inherit = require('component-inherit');

/**
 * Module exports.
 */

module.exports = JSONPPolling;

/**
 * Cached regular expressions.
 */

var rNewline = /\n/g;
var rEscapedNewline = /\\n/g;

/**
 * Global JSONP callbacks.
 */

var callbacks;

/**
 * Callbacks count.
 */

var index = 0;

/**
 * Noop.
 */

function empty () { }

/**
 * JSONP Polling constructor.
 *
 * @param {Object} opts.
 * @api public
 */

function JSONPPolling (opts) {
  Polling.call(this, opts);

  this.query = this.query || {};

  // define global callbacks array if not present
  // we do this here (lazily) to avoid unneeded global pollution
  if (!callbacks) {
    // we need to consider multiple engines in the same page
    if (!global.___eio) global.___eio = [];
    callbacks = global.___eio;
  }

  // callback identifier
  this.index = callbacks.length;

  // add callback to jsonp global
  var self = this;
  callbacks.push(function (msg) {
    self.onData(msg);
  });

  // append to query string
  this.query.j = this.index;

  // prevent spurious errors from being emitted when the window is unloaded
  if (global.document && global.addEventListener) {
    global.addEventListener('beforeunload', function () {
      if (self.script) self.script.onerror = empty;
    }, false);
  }
}

/**
 * Inherits from Polling.
 */

inherit(JSONPPolling, Polling);

/*
 * JSONP only supports binary as base64 encoded strings
 */

JSONPPolling.prototype.supportsBinary = false;

/**
 * Closes the socket.
 *
 * @api private
 */

JSONPPolling.prototype.doClose = function () {
  if (this.script) {
    this.script.parentNode.removeChild(this.script);
    this.script = null;
  }

  if (this.form) {
    this.form.parentNode.removeChild(this.form);
    this.form = null;
    this.iframe = null;
  }

  Polling.prototype.doClose.call(this);
};

/**
 * Starts a poll cycle.
 *
 * @api private
 */

JSONPPolling.prototype.doPoll = function () {
  var self = this;
  var script = document.createElement('script');

  if (this.script) {
    this.script.parentNode.removeChild(this.script);
    this.script = null;
  }

  script.async = true;
  script.src = this.uri();
  script.onerror = function(e){
    self.onError('jsonp poll error',e);
  };

  var insertAt = document.getElementsByTagName('script')[0];
  insertAt.parentNode.insertBefore(script, insertAt);
  this.script = script;

  var isUAgecko = 'undefined' != typeof navigator && /gecko/i.test(navigator.userAgent);
  
  if (isUAgecko) {
    setTimeout(function () {
      var iframe = document.createElement('iframe');
      document.body.appendChild(iframe);
      document.body.removeChild(iframe);
    }, 100);
  }
};

/**
 * Writes with a hidden iframe.
 *
 * @param {String} data to send
 * @param {Function} called upon flush.
 * @api private
 */

JSONPPolling.prototype.doWrite = function (data, fn) {
  var self = this;

  if (!this.form) {
    var form = document.createElement('form');
    var area = document.createElement('textarea');
    var id = this.iframeId = 'eio_iframe_' + this.index;
    var iframe;

    form.className = 'socketio';
    form.style.position = 'absolute';
    form.style.top = '-1000px';
    form.style.left = '-1000px';
    form.target = id;
    form.method = 'POST';
    form.setAttribute('accept-charset', 'utf-8');
    area.name = 'd';
    form.appendChild(area);
    document.body.appendChild(form);

    this.form = form;
    this.area = area;
  }

  this.form.action = this.uri();

  function complete () {
    initIframe();
    fn();
  }

  function initIframe () {
    if (self.iframe) {
      try {
        self.form.removeChild(self.iframe);
      } catch (e) {
        self.onError('jsonp polling iframe removal error', e);
      }
    }

    try {
      // ie6 dynamic iframes with target="" support (thanks Chris Lambacher)
      var html = '<iframe src="javascript:0" name="'+ self.iframeId +'">';
      iframe = document.createElement(html);
    } catch (e) {
      iframe = document.createElement('iframe');
      iframe.name = self.iframeId;
      iframe.src = 'javascript:0';
    }

    iframe.id = self.iframeId;

    self.form.appendChild(iframe);
    self.iframe = iframe;
  }

  initIframe();

  // escape \n to prevent it from being converted into \r\n by some UAs
  // double escaping is required for escaped new lines because unescaping of new lines can be done safely on server-side
  data = data.replace(rEscapedNewline, '\\\n');
  this.area.value = data.replace(rNewline, '\\n');

  try {
    this.form.submit();
  } catch(e) {}

  if (this.iframe.attachEvent) {
    this.iframe.onreadystatechange = function(){
      if (self.iframe.readyState == 'complete') {
        complete();
      }
    };
  } else {
    this.iframe.onload = complete;
  }
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./polling":184,"component-inherit":187}],183:[function(require,module,exports){
(function (global){
/**
 * Module requirements.
 */

var XMLHttpRequest = require('xmlhttprequest');
var Polling = require('./polling');
var Emitter = require('component-emitter');
var inherit = require('component-inherit');
var debug = require('debug')('engine.io-client:polling-xhr');

/**
 * Module exports.
 */

module.exports = XHR;
module.exports.Request = Request;

/**
 * Empty function
 */

function empty(){}

/**
 * XHR Polling constructor.
 *
 * @param {Object} opts
 * @api public
 */

function XHR(opts){
  Polling.call(this, opts);

  if (global.location) {
    var isSSL = 'https:' == location.protocol;
    var port = location.port;

    // some user agents have empty `location.port`
    if (!port) {
      port = isSSL ? 443 : 80;
    }

    this.xd = opts.hostname != global.location.hostname ||
      port != opts.port;
    this.xs = opts.secure != isSSL;
  }
}

/**
 * Inherits from Polling.
 */

inherit(XHR, Polling);

/**
 * XHR supports binary
 */

XHR.prototype.supportsBinary = true;

/**
 * Creates a request.
 *
 * @param {String} method
 * @api private
 */

XHR.prototype.request = function(opts){
  opts = opts || {};
  opts.uri = this.uri();
  opts.xd = this.xd;
  opts.xs = this.xs;
  opts.agent = this.agent || false;
  opts.supportsBinary = this.supportsBinary;
  opts.enablesXDR = this.enablesXDR;

  // SSL options for Node.js client
  opts.pfx = this.pfx;
  opts.key = this.key;
  opts.passphrase = this.passphrase;
  opts.cert = this.cert;
  opts.ca = this.ca;
  opts.ciphers = this.ciphers;
  opts.rejectUnauthorized = this.rejectUnauthorized;

  return new Request(opts);
};

/**
 * Sends data.
 *
 * @param {String} data to send.
 * @param {Function} called upon flush.
 * @api private
 */

XHR.prototype.doWrite = function(data, fn){
  var isBinary = typeof data !== 'string' && data !== undefined;
  var req = this.request({ method: 'POST', data: data, isBinary: isBinary });
  var self = this;
  req.on('success', fn);
  req.on('error', function(err){
    self.onError('xhr post error', err);
  });
  this.sendXhr = req;
};

/**
 * Starts a poll cycle.
 *
 * @api private
 */

XHR.prototype.doPoll = function(){
  debug('xhr poll');
  var req = this.request();
  var self = this;
  req.on('data', function(data){
    self.onData(data);
  });
  req.on('error', function(err){
    self.onError('xhr poll error', err);
  });
  this.pollXhr = req;
};

/**
 * Request constructor
 *
 * @param {Object} options
 * @api public
 */

function Request(opts){
  this.method = opts.method || 'GET';
  this.uri = opts.uri;
  this.xd = !!opts.xd;
  this.xs = !!opts.xs;
  this.async = false !== opts.async;
  this.data = undefined != opts.data ? opts.data : null;
  this.agent = opts.agent;
  this.isBinary = opts.isBinary;
  this.supportsBinary = opts.supportsBinary;
  this.enablesXDR = opts.enablesXDR;

  // SSL options for Node.js client
  this.pfx = opts.pfx;
  this.key = opts.key;
  this.passphrase = opts.passphrase;
  this.cert = opts.cert;
  this.ca = opts.ca;
  this.ciphers = opts.ciphers;
  this.rejectUnauthorized = opts.rejectUnauthorized;

  this.create();
}

/**
 * Mix in `Emitter`.
 */

Emitter(Request.prototype);

/**
 * Creates the XHR object and sends the request.
 *
 * @api private
 */

Request.prototype.create = function(){
  var opts = { agent: this.agent, xdomain: this.xd, xscheme: this.xs, enablesXDR: this.enablesXDR };

  // SSL options for Node.js client
  opts.pfx = this.pfx;
  opts.key = this.key;
  opts.passphrase = this.passphrase;
  opts.cert = this.cert;
  opts.ca = this.ca;
  opts.ciphers = this.ciphers;
  opts.rejectUnauthorized = this.rejectUnauthorized;

  var xhr = this.xhr = new XMLHttpRequest(opts);
  var self = this;

  try {
    debug('xhr open %s: %s', this.method, this.uri);
    xhr.open(this.method, this.uri, this.async);
    if (this.supportsBinary) {
      // This has to be done after open because Firefox is stupid
      // http://stackoverflow.com/questions/13216903/get-binary-data-with-xmlhttprequest-in-a-firefox-extension
      xhr.responseType = 'arraybuffer';
    }

    if ('POST' == this.method) {
      try {
        if (this.isBinary) {
          xhr.setRequestHeader('Content-type', 'application/octet-stream');
        } else {
          xhr.setRequestHeader('Content-type', 'text/plain;charset=UTF-8');
        }
      } catch (e) {}
    }

    // ie6 check
    if ('withCredentials' in xhr) {
      xhr.withCredentials = true;
    }

    if (this.hasXDR()) {
      xhr.onload = function(){
        self.onLoad();
      };
      xhr.onerror = function(){
        self.onError(xhr.responseText);
      };
    } else {
      xhr.onreadystatechange = function(){
        if (4 != xhr.readyState) return;
        if (200 == xhr.status || 1223 == xhr.status) {
          self.onLoad();
        } else {
          // make sure the `error` event handler that's user-set
          // does not throw in the same tick and gets caught here
          setTimeout(function(){
            self.onError(xhr.status);
          }, 0);
        }
      };
    }

    debug('xhr data %s', this.data);
    xhr.send(this.data);
  } catch (e) {
    // Need to defer since .create() is called directly fhrom the constructor
    // and thus the 'error' event can only be only bound *after* this exception
    // occurs.  Therefore, also, we cannot throw here at all.
    setTimeout(function() {
      self.onError(e);
    }, 0);
    return;
  }

  if (global.document) {
    this.index = Request.requestsCount++;
    Request.requests[this.index] = this;
  }
};

/**
 * Called upon successful response.
 *
 * @api private
 */

Request.prototype.onSuccess = function(){
  this.emit('success');
  this.cleanup();
};

/**
 * Called if we have data.
 *
 * @api private
 */

Request.prototype.onData = function(data){
  this.emit('data', data);
  this.onSuccess();
};

/**
 * Called upon error.
 *
 * @api private
 */

Request.prototype.onError = function(err){
  this.emit('error', err);
  this.cleanup(true);
};

/**
 * Cleans up house.
 *
 * @api private
 */

Request.prototype.cleanup = function(fromError){
  if ('undefined' == typeof this.xhr || null === this.xhr) {
    return;
  }
  // xmlhttprequest
  if (this.hasXDR()) {
    this.xhr.onload = this.xhr.onerror = empty;
  } else {
    this.xhr.onreadystatechange = empty;
  }

  if (fromError) {
    try {
      this.xhr.abort();
    } catch(e) {}
  }

  if (global.document) {
    delete Request.requests[this.index];
  }

  this.xhr = null;
};

/**
 * Called upon load.
 *
 * @api private
 */

Request.prototype.onLoad = function(){
  var data;
  try {
    var contentType;
    try {
      contentType = this.xhr.getResponseHeader('Content-Type').split(';')[0];
    } catch (e) {}
    if (contentType === 'application/octet-stream') {
      data = this.xhr.response;
    } else {
      if (!this.supportsBinary) {
        data = this.xhr.responseText;
      } else {
        data = 'ok';
      }
    }
  } catch (e) {
    this.onError(e);
  }
  if (null != data) {
    this.onData(data);
  }
};

/**
 * Check if it has XDomainRequest.
 *
 * @api private
 */

Request.prototype.hasXDR = function(){
  return 'undefined' !== typeof global.XDomainRequest && !this.xs && this.enablesXDR;
};

/**
 * Aborts the request.
 *
 * @api public
 */

Request.prototype.abort = function(){
  this.cleanup();
};

/**
 * Aborts pending requests when unloading the window. This is needed to prevent
 * memory leaks (e.g. when using IE) and to ensure that no spurious error is
 * emitted.
 */

if (global.document) {
  Request.requestsCount = 0;
  Request.requests = {};
  if (global.attachEvent) {
    global.attachEvent('onunload', unloadHandler);
  } else if (global.addEventListener) {
    global.addEventListener('beforeunload', unloadHandler, false);
  }
}

function unloadHandler() {
  for (var i in Request.requests) {
    if (Request.requests.hasOwnProperty(i)) {
      Request.requests[i].abort();
    }
  }
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./polling":184,"component-emitter":175,"component-inherit":187,"debug":188,"xmlhttprequest":186}],184:[function(require,module,exports){
/**
 * Module dependencies.
 */

var Transport = require('../transport');
var parseqs = require('parseqs');
var parser = require('engine.io-parser');
var inherit = require('component-inherit');
var debug = require('debug')('engine.io-client:polling');

/**
 * Module exports.
 */

module.exports = Polling;

/**
 * Is XHR2 supported?
 */

var hasXHR2 = (function() {
  var XMLHttpRequest = require('xmlhttprequest');
  var xhr = new XMLHttpRequest({ xdomain: false });
  return null != xhr.responseType;
})();

/**
 * Polling interface.
 *
 * @param {Object} opts
 * @api private
 */

function Polling(opts){
  var forceBase64 = (opts && opts.forceBase64);
  if (!hasXHR2 || forceBase64) {
    this.supportsBinary = false;
  }
  Transport.call(this, opts);
}

/**
 * Inherits from Transport.
 */

inherit(Polling, Transport);

/**
 * Transport name.
 */

Polling.prototype.name = 'polling';

/**
 * Opens the socket (triggers polling). We write a PING message to determine
 * when the transport is open.
 *
 * @api private
 */

Polling.prototype.doOpen = function(){
  this.poll();
};

/**
 * Pauses polling.
 *
 * @param {Function} callback upon buffers are flushed and transport is paused
 * @api private
 */

Polling.prototype.pause = function(onPause){
  var pending = 0;
  var self = this;

  this.readyState = 'pausing';

  function pause(){
    debug('paused');
    self.readyState = 'paused';
    onPause();
  }

  if (this.polling || !this.writable) {
    var total = 0;

    if (this.polling) {
      debug('we are currently polling - waiting to pause');
      total++;
      this.once('pollComplete', function(){
        debug('pre-pause polling complete');
        --total || pause();
      });
    }

    if (!this.writable) {
      debug('we are currently writing - waiting to pause');
      total++;
      this.once('drain', function(){
        debug('pre-pause writing complete');
        --total || pause();
      });
    }
  } else {
    pause();
  }
};

/**
 * Starts polling cycle.
 *
 * @api public
 */

Polling.prototype.poll = function(){
  debug('polling');
  this.polling = true;
  this.doPoll();
  this.emit('poll');
};

/**
 * Overloads onData to detect payloads.
 *
 * @api private
 */

Polling.prototype.onData = function(data){
  var self = this;
  debug('polling got data %s', data);
  var callback = function(packet, index, total) {
    // if its the first message we consider the transport open
    if ('opening' == self.readyState) {
      self.onOpen();
    }

    // if its a close packet, we close the ongoing requests
    if ('close' == packet.type) {
      self.onClose();
      return false;
    }

    // otherwise bypass onData and handle the message
    self.onPacket(packet);
  };

  // decode payload
  parser.decodePayload(data, this.socket.binaryType, callback);

  // if an event did not trigger closing
  if ('closed' != this.readyState) {
    // if we got data we're not polling
    this.polling = false;
    this.emit('pollComplete');

    if ('open' == this.readyState) {
      this.poll();
    } else {
      debug('ignoring poll - transport state "%s"', this.readyState);
    }
  }
};

/**
 * For polling, send a close packet.
 *
 * @api private
 */

Polling.prototype.doClose = function(){
  var self = this;

  function close(){
    debug('writing close packet');
    self.write([{ type: 'close' }]);
  }

  if ('open' == this.readyState) {
    debug('transport open - closing');
    close();
  } else {
    // in case we're trying to close while
    // handshaking is in progress (GH-164)
    debug('transport not open - deferring close');
    this.once('open', close);
  }
};

/**
 * Writes a packets payload.
 *
 * @param {Array} data packets
 * @param {Function} drain callback
 * @api private
 */

Polling.prototype.write = function(packets){
  var self = this;
  this.writable = false;
  var callbackfn = function() {
    self.writable = true;
    self.emit('drain');
  };

  var self = this;
  parser.encodePayload(packets, this.supportsBinary, function(data) {
    self.doWrite(data, callbackfn);
  });
};

/**
 * Generates uri for connection.
 *
 * @api private
 */

Polling.prototype.uri = function(){
  var query = this.query || {};
  var schema = this.secure ? 'https' : 'http';
  var port = '';

  // cache busting is forced
  if (false !== this.timestampRequests) {
    query[this.timestampParam] = +new Date + '-' + Transport.timestamps++;
  }

  if (!this.supportsBinary && !query.sid) {
    query.b64 = 1;
  }

  query = parseqs.encode(query);

  // avoid port if default for schema
  if (this.port && (('https' == schema && this.port != 443) ||
     ('http' == schema && this.port != 80))) {
    port = ':' + this.port;
  }

  // prepend ? to query
  if (query.length) {
    query = '?' + query;
  }

  return schema + '://' + this.hostname + port + this.path + query;
};

},{"../transport":180,"component-inherit":187,"debug":188,"engine.io-parser":191,"parseqs":203,"xmlhttprequest":186}],185:[function(require,module,exports){
/**
 * Module dependencies.
 */

var Transport = require('../transport');
var parser = require('engine.io-parser');
var parseqs = require('parseqs');
var inherit = require('component-inherit');
var debug = require('debug')('engine.io-client:websocket');

/**
 * `ws` exposes a WebSocket-compatible interface in
 * Node, or the `WebSocket` or `MozWebSocket` globals
 * in the browser.
 */

var WebSocket = require('ws');

/**
 * Module exports.
 */

module.exports = WS;

/**
 * WebSocket transport constructor.
 *
 * @api {Object} connection options
 * @api public
 */

function WS(opts){
  var forceBase64 = (opts && opts.forceBase64);
  if (forceBase64) {
    this.supportsBinary = false;
  }
  Transport.call(this, opts);
}

/**
 * Inherits from Transport.
 */

inherit(WS, Transport);

/**
 * Transport name.
 *
 * @api public
 */

WS.prototype.name = 'websocket';

/*
 * WebSockets support binary
 */

WS.prototype.supportsBinary = true;

/**
 * Opens socket.
 *
 * @api private
 */

WS.prototype.doOpen = function(){
  if (!this.check()) {
    // let probe timeout
    return;
  }

  var self = this;
  var uri = this.uri();
  var protocols = void(0);
  var opts = { agent: this.agent };

  // SSL options for Node.js client
  opts.pfx = this.pfx;
  opts.key = this.key;
  opts.passphrase = this.passphrase;
  opts.cert = this.cert;
  opts.ca = this.ca;
  opts.ciphers = this.ciphers;
  opts.rejectUnauthorized = this.rejectUnauthorized;

  this.ws = new WebSocket(uri, protocols, opts);

  if (this.ws.binaryType === undefined) {
    this.supportsBinary = false;
  }

  this.ws.binaryType = 'arraybuffer';
  this.addEventListeners();
};

/**
 * Adds event listeners to the socket
 *
 * @api private
 */

WS.prototype.addEventListeners = function(){
  var self = this;

  this.ws.onopen = function(){
    self.onOpen();
  };
  this.ws.onclose = function(){
    self.onClose();
  };
  this.ws.onmessage = function(ev){
    self.onData(ev.data);
  };
  this.ws.onerror = function(e){
    self.onError('websocket error', e);
  };
};

/**
 * Override `onData` to use a timer on iOS.
 * See: https://gist.github.com/mloughran/2052006
 *
 * @api private
 */

if ('undefined' != typeof navigator
  && /iPad|iPhone|iPod/i.test(navigator.userAgent)) {
  WS.prototype.onData = function(data){
    var self = this;
    setTimeout(function(){
      Transport.prototype.onData.call(self, data);
    }, 0);
  };
}

/**
 * Writes data to socket.
 *
 * @param {Array} array of packets.
 * @api private
 */

WS.prototype.write = function(packets){
  var self = this;
  this.writable = false;
  // encodePacket efficient as it uses WS framing
  // no need for encodePayload
  for (var i = 0, l = packets.length; i < l; i++) {
    parser.encodePacket(packets[i], this.supportsBinary, function(data) {
      //Sometimes the websocket has already been closed but the browser didn't
      //have a chance of informing us about it yet, in that case send will
      //throw an error
      try {
        self.ws.send(data);
      } catch (e){
        debug('websocket closed before onclose event');
      }
    });
  }

  function ondrain() {
    self.writable = true;
    self.emit('drain');
  }
  // fake drain
  // defer to next tick to allow Socket to clear writeBuffer
  setTimeout(ondrain, 0);
};

/**
 * Called upon close
 *
 * @api private
 */

WS.prototype.onClose = function(){
  Transport.prototype.onClose.call(this);
};

/**
 * Closes socket.
 *
 * @api private
 */

WS.prototype.doClose = function(){
  if (typeof this.ws !== 'undefined') {
    this.ws.close();
  }
};

/**
 * Generates uri for connection.
 *
 * @api private
 */

WS.prototype.uri = function(){
  var query = this.query || {};
  var schema = this.secure ? 'wss' : 'ws';
  var port = '';

  // avoid port if default for schema
  if (this.port && (('wss' == schema && this.port != 443)
    || ('ws' == schema && this.port != 80))) {
    port = ':' + this.port;
  }

  // append timestamp to URI
  if (this.timestampRequests) {
    query[this.timestampParam] = +new Date;
  }

  // communicate binary support capabilities
  if (!this.supportsBinary) {
    query.b64 = 1;
  }

  query = parseqs.encode(query);

  // prepend ? to query
  if (query.length) {
    query = '?' + query;
  }

  return schema + '://' + this.hostname + port + this.path + query;
};

/**
 * Feature detection for WebSocket.
 *
 * @return {Boolean} whether this transport is available.
 * @api public
 */

WS.prototype.check = function(){
  return !!WebSocket && !('__initialize' in WebSocket && this.name === WS.prototype.name);
};

},{"../transport":180,"component-inherit":187,"debug":188,"engine.io-parser":191,"parseqs":203,"ws":205}],186:[function(require,module,exports){
// browser shim for xmlhttprequest module
var hasCORS = require('has-cors');

module.exports = function(opts) {
  var xdomain = opts.xdomain;

  // scheme must be same when usign XDomainRequest
  // http://blogs.msdn.com/b/ieinternals/archive/2010/05/13/xdomainrequest-restrictions-limitations-and-workarounds.aspx
  var xscheme = opts.xscheme;

  // XDomainRequest has a flow of not sending cookie, therefore it should be disabled as a default.
  // https://github.com/Automattic/engine.io-client/pull/217
  var enablesXDR = opts.enablesXDR;

  // XMLHttpRequest can be disabled on IE
  try {
    if ('undefined' != typeof XMLHttpRequest && (!xdomain || hasCORS)) {
      return new XMLHttpRequest();
    }
  } catch (e) { }

  // Use XDomainRequest for IE8 if enablesXDR is true
  // because loading bar keeps flashing when using jsonp-polling
  // https://github.com/yujiosaka/socke.io-ie8-loading-example
  try {
    if ('undefined' != typeof XDomainRequest && !xscheme && enablesXDR) {
      return new XDomainRequest();
    }
  } catch (e) { }

  if (!xdomain) {
    try {
      return new ActiveXObject('Microsoft.XMLHTTP');
    } catch(e) { }
  }
}

},{"has-cors":200}],187:[function(require,module,exports){

module.exports = function(a, b){
  var fn = function(){};
  fn.prototype = b.prototype;
  a.prototype = new fn;
  a.prototype.constructor = a;
};
},{}],188:[function(require,module,exports){

/**
 * This is the web browser implementation of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = require('./debug');
exports.log = log;
exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;

/**
 * Colors.
 */

exports.colors = [
  'lightseagreen',
  'forestgreen',
  'goldenrod',
  'dodgerblue',
  'darkorchid',
  'crimson'
];

/**
 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
 * and the Firebug extension (any Firefox version) are known
 * to support "%c" CSS customizations.
 *
 * TODO: add a `localStorage` variable to explicitly enable/disable colors
 */

function useColors() {
  // is webkit? http://stackoverflow.com/a/16459606/376773
  return ('WebkitAppearance' in document.documentElement.style) ||
    // is firebug? http://stackoverflow.com/a/398120/376773
    (window.console && (console.firebug || (console.exception && console.table))) ||
    // is firefox >= v31?
    // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
    (navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31);
}

/**
 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
 */

exports.formatters.j = function(v) {
  return JSON.stringify(v);
};


/**
 * Colorize log arguments if enabled.
 *
 * @api public
 */

function formatArgs() {
  var args = arguments;
  var useColors = this.useColors;

  args[0] = (useColors ? '%c' : '')
    + this.namespace
    + (useColors ? ' %c' : ' ')
    + args[0]
    + (useColors ? '%c ' : ' ')
    + '+' + exports.humanize(this.diff);

  if (!useColors) return args;

  var c = 'color: ' + this.color;
  args = [args[0], c, 'color: inherit'].concat(Array.prototype.slice.call(args, 1));

  // the final "%c" is somewhat tricky, because there could be other
  // arguments passed either before or after the %c, so we need to
  // figure out the correct index to insert the CSS into
  var index = 0;
  var lastC = 0;
  args[0].replace(/%[a-z%]/g, function(match) {
    if ('%%' === match) return;
    index++;
    if ('%c' === match) {
      // we only are interested in the *last* %c
      // (the user may have provided their own)
      lastC = index;
    }
  });

  args.splice(lastC, 0, c);
  return args;
}

/**
 * Invokes `console.log()` when available.
 * No-op when `console.log` is not a "function".
 *
 * @api public
 */

function log() {
  // This hackery is required for IE8,
  // where the `console.log` function doesn't have 'apply'
  return 'object' == typeof console
    && 'function' == typeof console.log
    && Function.prototype.apply.call(console.log, console, arguments);
}

/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */

function save(namespaces) {
  try {
    if (null == namespaces) {
      localStorage.removeItem('debug');
    } else {
      localStorage.debug = namespaces;
    }
  } catch(e) {}
}

/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */

function load() {
  var r;
  try {
    r = localStorage.debug;
  } catch(e) {}
  return r;
}

/**
 * Enable namespaces listed in `localStorage.debug` initially.
 */

exports.enable(load());

},{"./debug":189}],189:[function(require,module,exports){

/**
 * This is the common logic for both the Node.js and web browser
 * implementations of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = debug;
exports.coerce = coerce;
exports.disable = disable;
exports.enable = enable;
exports.enabled = enabled;
exports.humanize = require('ms');

/**
 * The currently active debug mode names, and names to skip.
 */

exports.names = [];
exports.skips = [];

/**
 * Map of special "%n" handling functions, for the debug "format" argument.
 *
 * Valid key names are a single, lowercased letter, i.e. "n".
 */

exports.formatters = {};

/**
 * Previously assigned color.
 */

var prevColor = 0;

/**
 * Previous log timestamp.
 */

var prevTime;

/**
 * Select a color.
 *
 * @return {Number}
 * @api private
 */

function selectColor() {
  return exports.colors[prevColor++ % exports.colors.length];
}

/**
 * Create a debugger with the given `namespace`.
 *
 * @param {String} namespace
 * @return {Function}
 * @api public
 */

function debug(namespace) {

  // define the `disabled` version
  function disabled() {
  }
  disabled.enabled = false;

  // define the `enabled` version
  function enabled() {

    var self = enabled;

    // set `diff` timestamp
    var curr = +new Date();
    var ms = curr - (prevTime || curr);
    self.diff = ms;
    self.prev = prevTime;
    self.curr = curr;
    prevTime = curr;

    // add the `color` if not set
    if (null == self.useColors) self.useColors = exports.useColors();
    if (null == self.color && self.useColors) self.color = selectColor();

    var args = Array.prototype.slice.call(arguments);

    args[0] = exports.coerce(args[0]);

    if ('string' !== typeof args[0]) {
      // anything else let's inspect with %o
      args = ['%o'].concat(args);
    }

    // apply any `formatters` transformations
    var index = 0;
    args[0] = args[0].replace(/%([a-z%])/g, function(match, format) {
      // if we encounter an escaped % then don't increase the array index
      if (match === '%%') return match;
      index++;
      var formatter = exports.formatters[format];
      if ('function' === typeof formatter) {
        var val = args[index];
        match = formatter.call(self, val);

        // now we need to remove `args[index]` since it's inlined in the `format`
        args.splice(index, 1);
        index--;
      }
      return match;
    });

    if ('function' === typeof exports.formatArgs) {
      args = exports.formatArgs.apply(self, args);
    }
    var logFn = enabled.log || exports.log || console.log.bind(console);
    logFn.apply(self, args);
  }
  enabled.enabled = true;

  var fn = exports.enabled(namespace) ? enabled : disabled;

  fn.namespace = namespace;

  return fn;
}

/**
 * Enables a debug mode by namespaces. This can include modes
 * separated by a colon and wildcards.
 *
 * @param {String} namespaces
 * @api public
 */

function enable(namespaces) {
  exports.save(namespaces);

  var split = (namespaces || '').split(/[\s,]+/);
  var len = split.length;

  for (var i = 0; i < len; i++) {
    if (!split[i]) continue; // ignore empty strings
    namespaces = split[i].replace(/\*/g, '.*?');
    if (namespaces[0] === '-') {
      exports.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
    } else {
      exports.names.push(new RegExp('^' + namespaces + '$'));
    }
  }
}

/**
 * Disable debug output.
 *
 * @api public
 */

function disable() {
  exports.enable('');
}

/**
 * Returns true if the given mode name is enabled, false otherwise.
 *
 * @param {String} name
 * @return {Boolean}
 * @api public
 */

function enabled(name) {
  var i, len;
  for (i = 0, len = exports.skips.length; i < len; i++) {
    if (exports.skips[i].test(name)) {
      return false;
    }
  }
  for (i = 0, len = exports.names.length; i < len; i++) {
    if (exports.names[i].test(name)) {
      return true;
    }
  }
  return false;
}

/**
 * Coerce `val`.
 *
 * @param {Mixed} val
 * @return {Mixed}
 * @api private
 */

function coerce(val) {
  if (val instanceof Error) return val.stack || val.message;
  return val;
}

},{"ms":190}],190:[function(require,module,exports){
/**
 * Helpers.
 */

var s = 1000;
var m = s * 60;
var h = m * 60;
var d = h * 24;
var y = d * 365.25;

/**
 * Parse or format the given `val`.
 *
 * Options:
 *
 *  - `long` verbose formatting [false]
 *
 * @param {String|Number} val
 * @param {Object} options
 * @return {String|Number}
 * @api public
 */

module.exports = function(val, options){
  options = options || {};
  if ('string' == typeof val) return parse(val);
  return options.long
    ? long(val)
    : short(val);
};

/**
 * Parse the given `str` and return milliseconds.
 *
 * @param {String} str
 * @return {Number}
 * @api private
 */

function parse(str) {
  var match = /^((?:\d+)?\.?\d+) *(ms|seconds?|s|minutes?|m|hours?|h|days?|d|years?|y)?$/i.exec(str);
  if (!match) return;
  var n = parseFloat(match[1]);
  var type = (match[2] || 'ms').toLowerCase();
  switch (type) {
    case 'years':
    case 'year':
    case 'y':
      return n * y;
    case 'days':
    case 'day':
    case 'd':
      return n * d;
    case 'hours':
    case 'hour':
    case 'h':
      return n * h;
    case 'minutes':
    case 'minute':
    case 'm':
      return n * m;
    case 'seconds':
    case 'second':
    case 's':
      return n * s;
    case 'ms':
      return n;
  }
}

/**
 * Short format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function short(ms) {
  if (ms >= d) return Math.round(ms / d) + 'd';
  if (ms >= h) return Math.round(ms / h) + 'h';
  if (ms >= m) return Math.round(ms / m) + 'm';
  if (ms >= s) return Math.round(ms / s) + 's';
  return ms + 'ms';
}

/**
 * Long format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function long(ms) {
  return plural(ms, d, 'day')
    || plural(ms, h, 'hour')
    || plural(ms, m, 'minute')
    || plural(ms, s, 'second')
    || ms + ' ms';
}

/**
 * Pluralization helper.
 */

function plural(ms, n, name) {
  if (ms < n) return;
  if (ms < n * 1.5) return Math.floor(ms / n) + ' ' + name;
  return Math.ceil(ms / n) + ' ' + name + 's';
}

},{}],191:[function(require,module,exports){
(function (global){
/**
 * Module dependencies.
 */

var keys = require('./keys');
var hasBinary = require('has-binary');
var sliceBuffer = require('arraybuffer.slice');
var base64encoder = require('base64-arraybuffer');
var after = require('after');
var utf8 = require('utf8');

/**
 * Check if we are running an android browser. That requires us to use
 * ArrayBuffer with polling transports...
 *
 * http://ghinda.net/jpeg-blob-ajax-android/
 */

var isAndroid = navigator.userAgent.match(/Android/i);

/**
 * Check if we are running in PhantomJS.
 * Uploading a Blob with PhantomJS does not work correctly, as reported here:
 * https://github.com/ariya/phantomjs/issues/11395
 * @type boolean
 */
var isPhantomJS = /PhantomJS/i.test(navigator.userAgent);

/**
 * When true, avoids using Blobs to encode payloads.
 * @type boolean
 */
var dontSendBlobs = isAndroid || isPhantomJS;

/**
 * Current protocol version.
 */

exports.protocol = 3;

/**
 * Packet types.
 */

var packets = exports.packets = {
    open:     0    // non-ws
  , close:    1    // non-ws
  , ping:     2
  , pong:     3
  , message:  4
  , upgrade:  5
  , noop:     6
};

var packetslist = keys(packets);

/**
 * Premade error packet.
 */

var err = { type: 'error', data: 'parser error' };

/**
 * Create a blob api even for blob builder when vendor prefixes exist
 */

var Blob = require('blob');

/**
 * Encodes a packet.
 *
 *     <packet type id> [ <data> ]
 *
 * Example:
 *
 *     5hello world
 *     3
 *     4
 *
 * Binary is encoded in an identical principle
 *
 * @api private
 */

exports.encodePacket = function (packet, supportsBinary, utf8encode, callback) {
  if ('function' == typeof supportsBinary) {
    callback = supportsBinary;
    supportsBinary = false;
  }

  if ('function' == typeof utf8encode) {
    callback = utf8encode;
    utf8encode = null;
  }

  var data = (packet.data === undefined)
    ? undefined
    : packet.data.buffer || packet.data;

  if (global.ArrayBuffer && data instanceof ArrayBuffer) {
    return encodeArrayBuffer(packet, supportsBinary, callback);
  } else if (Blob && data instanceof global.Blob) {
    return encodeBlob(packet, supportsBinary, callback);
  }

  // might be an object with { base64: true, data: dataAsBase64String }
  if (data && data.base64) {
    return encodeBase64Object(packet, callback);
  }

  // Sending data as a utf-8 string
  var encoded = packets[packet.type];

  // data fragment is optional
  if (undefined !== packet.data) {
    encoded += utf8encode ? utf8.encode(String(packet.data)) : String(packet.data);
  }

  return callback('' + encoded);

};

function encodeBase64Object(packet, callback) {
  // packet data is an object { base64: true, data: dataAsBase64String }
  var message = 'b' + exports.packets[packet.type] + packet.data.data;
  return callback(message);
}

/**
 * Encode packet helpers for binary types
 */

function encodeArrayBuffer(packet, supportsBinary, callback) {
  if (!supportsBinary) {
    return exports.encodeBase64Packet(packet, callback);
  }

  var data = packet.data;
  var contentArray = new Uint8Array(data);
  var resultBuffer = new Uint8Array(1 + data.byteLength);

  resultBuffer[0] = packets[packet.type];
  for (var i = 0; i < contentArray.length; i++) {
    resultBuffer[i+1] = contentArray[i];
  }

  return callback(resultBuffer.buffer);
}

function encodeBlobAsArrayBuffer(packet, supportsBinary, callback) {
  if (!supportsBinary) {
    return exports.encodeBase64Packet(packet, callback);
  }

  var fr = new FileReader();
  fr.onload = function() {
    packet.data = fr.result;
    exports.encodePacket(packet, supportsBinary, true, callback);
  };
  return fr.readAsArrayBuffer(packet.data);
}

function encodeBlob(packet, supportsBinary, callback) {
  if (!supportsBinary) {
    return exports.encodeBase64Packet(packet, callback);
  }

  if (dontSendBlobs) {
    return encodeBlobAsArrayBuffer(packet, supportsBinary, callback);
  }

  var length = new Uint8Array(1);
  length[0] = packets[packet.type];
  var blob = new Blob([length.buffer, packet.data]);

  return callback(blob);
}

/**
 * Encodes a packet with binary data in a base64 string
 *
 * @param {Object} packet, has `type` and `data`
 * @return {String} base64 encoded message
 */

exports.encodeBase64Packet = function(packet, callback) {
  var message = 'b' + exports.packets[packet.type];
  if (Blob && packet.data instanceof Blob) {
    var fr = new FileReader();
    fr.onload = function() {
      var b64 = fr.result.split(',')[1];
      callback(message + b64);
    };
    return fr.readAsDataURL(packet.data);
  }

  var b64data;
  try {
    b64data = String.fromCharCode.apply(null, new Uint8Array(packet.data));
  } catch (e) {
    // iPhone Safari doesn't let you apply with typed arrays
    var typed = new Uint8Array(packet.data);
    var basic = new Array(typed.length);
    for (var i = 0; i < typed.length; i++) {
      basic[i] = typed[i];
    }
    b64data = String.fromCharCode.apply(null, basic);
  }
  message += global.btoa(b64data);
  return callback(message);
};

/**
 * Decodes a packet. Changes format to Blob if requested.
 *
 * @return {Object} with `type` and `data` (if any)
 * @api private
 */

exports.decodePacket = function (data, binaryType, utf8decode) {
  // String data
  if (typeof data == 'string' || data === undefined) {
    if (data.charAt(0) == 'b') {
      return exports.decodeBase64Packet(data.substr(1), binaryType);
    }

    if (utf8decode) {
      try {
        data = utf8.decode(data);
      } catch (e) {
        return err;
      }
    }
    var type = data.charAt(0);

    if (Number(type) != type || !packetslist[type]) {
      return err;
    }

    if (data.length > 1) {
      return { type: packetslist[type], data: data.substring(1) };
    } else {
      return { type: packetslist[type] };
    }
  }

  var asArray = new Uint8Array(data);
  var type = asArray[0];
  var rest = sliceBuffer(data, 1);
  if (Blob && binaryType === 'blob') {
    rest = new Blob([rest]);
  }
  return { type: packetslist[type], data: rest };
};

/**
 * Decodes a packet encoded in a base64 string
 *
 * @param {String} base64 encoded message
 * @return {Object} with `type` and `data` (if any)
 */

exports.decodeBase64Packet = function(msg, binaryType) {
  var type = packetslist[msg.charAt(0)];
  if (!global.ArrayBuffer) {
    return { type: type, data: { base64: true, data: msg.substr(1) } };
  }

  var data = base64encoder.decode(msg.substr(1));

  if (binaryType === 'blob' && Blob) {
    data = new Blob([data]);
  }

  return { type: type, data: data };
};

/**
 * Encodes multiple messages (payload).
 *
 *     <length>:data
 *
 * Example:
 *
 *     11:hello world2:hi
 *
 * If any contents are binary, they will be encoded as base64 strings. Base64
 * encoded strings are marked with a b before the length specifier
 *
 * @param {Array} packets
 * @api private
 */

exports.encodePayload = function (packets, supportsBinary, callback) {
  if (typeof supportsBinary == 'function') {
    callback = supportsBinary;
    supportsBinary = null;
  }

  var isBinary = hasBinary(packets);

  if (supportsBinary && isBinary) {
    if (Blob && !dontSendBlobs) {
      return exports.encodePayloadAsBlob(packets, callback);
    }

    return exports.encodePayloadAsArrayBuffer(packets, callback);
  }

  if (!packets.length) {
    return callback('0:');
  }

  function setLengthHeader(message) {
    return message.length + ':' + message;
  }

  function encodeOne(packet, doneCallback) {
    exports.encodePacket(packet, !isBinary ? false : supportsBinary, true, function(message) {
      doneCallback(null, setLengthHeader(message));
    });
  }

  map(packets, encodeOne, function(err, results) {
    return callback(results.join(''));
  });
};

/**
 * Async array map using after
 */

function map(ary, each, done) {
  var result = new Array(ary.length);
  var next = after(ary.length, done);

  var eachWithIndex = function(i, el, cb) {
    each(el, function(error, msg) {
      result[i] = msg;
      cb(error, result);
    });
  };

  for (var i = 0; i < ary.length; i++) {
    eachWithIndex(i, ary[i], next);
  }
}

/*
 * Decodes data when a payload is maybe expected. Possible binary contents are
 * decoded from their base64 representation
 *
 * @param {String} data, callback method
 * @api public
 */

exports.decodePayload = function (data, binaryType, callback) {
  if (typeof data != 'string') {
    return exports.decodePayloadAsBinary(data, binaryType, callback);
  }

  if (typeof binaryType === 'function') {
    callback = binaryType;
    binaryType = null;
  }

  var packet;
  if (data == '') {
    // parser error - ignoring payload
    return callback(err, 0, 1);
  }

  var length = ''
    , n, msg;

  for (var i = 0, l = data.length; i < l; i++) {
    var chr = data.charAt(i);

    if (':' != chr) {
      length += chr;
    } else {
      if ('' == length || (length != (n = Number(length)))) {
        // parser error - ignoring payload
        return callback(err, 0, 1);
      }

      msg = data.substr(i + 1, n);

      if (length != msg.length) {
        // parser error - ignoring payload
        return callback(err, 0, 1);
      }

      if (msg.length) {
        packet = exports.decodePacket(msg, binaryType, true);

        if (err.type == packet.type && err.data == packet.data) {
          // parser error in individual packet - ignoring payload
          return callback(err, 0, 1);
        }

        var ret = callback(packet, i + n, l);
        if (false === ret) return;
      }

      // advance cursor
      i += n;
      length = '';
    }
  }

  if (length != '') {
    // parser error - ignoring payload
    return callback(err, 0, 1);
  }

};

/**
 * Encodes multiple messages (payload) as binary.
 *
 * <1 = binary, 0 = string><number from 0-9><number from 0-9>[...]<number
 * 255><data>
 *
 * Example:
 * 1 3 255 1 2 3, if the binary contents are interpreted as 8 bit integers
 *
 * @param {Array} packets
 * @return {ArrayBuffer} encoded payload
 * @api private
 */

exports.encodePayloadAsArrayBuffer = function(packets, callback) {
  if (!packets.length) {
    return callback(new ArrayBuffer(0));
  }

  function encodeOne(packet, doneCallback) {
    exports.encodePacket(packet, true, true, function(data) {
      return doneCallback(null, data);
    });
  }

  map(packets, encodeOne, function(err, encodedPackets) {
    var totalLength = encodedPackets.reduce(function(acc, p) {
      var len;
      if (typeof p === 'string'){
        len = p.length;
      } else {
        len = p.byteLength;
      }
      return acc + len.toString().length + len + 2; // string/binary identifier + separator = 2
    }, 0);

    var resultArray = new Uint8Array(totalLength);

    var bufferIndex = 0;
    encodedPackets.forEach(function(p) {
      var isString = typeof p === 'string';
      var ab = p;
      if (isString) {
        var view = new Uint8Array(p.length);
        for (var i = 0; i < p.length; i++) {
          view[i] = p.charCodeAt(i);
        }
        ab = view.buffer;
      }

      if (isString) { // not true binary
        resultArray[bufferIndex++] = 0;
      } else { // true binary
        resultArray[bufferIndex++] = 1;
      }

      var lenStr = ab.byteLength.toString();
      for (var i = 0; i < lenStr.length; i++) {
        resultArray[bufferIndex++] = parseInt(lenStr[i]);
      }
      resultArray[bufferIndex++] = 255;

      var view = new Uint8Array(ab);
      for (var i = 0; i < view.length; i++) {
        resultArray[bufferIndex++] = view[i];
      }
    });

    return callback(resultArray.buffer);
  });
};

/**
 * Encode as Blob
 */

exports.encodePayloadAsBlob = function(packets, callback) {
  function encodeOne(packet, doneCallback) {
    exports.encodePacket(packet, true, true, function(encoded) {
      var binaryIdentifier = new Uint8Array(1);
      binaryIdentifier[0] = 1;
      if (typeof encoded === 'string') {
        var view = new Uint8Array(encoded.length);
        for (var i = 0; i < encoded.length; i++) {
          view[i] = encoded.charCodeAt(i);
        }
        encoded = view.buffer;
        binaryIdentifier[0] = 0;
      }

      var len = (encoded instanceof ArrayBuffer)
        ? encoded.byteLength
        : encoded.size;

      var lenStr = len.toString();
      var lengthAry = new Uint8Array(lenStr.length + 1);
      for (var i = 0; i < lenStr.length; i++) {
        lengthAry[i] = parseInt(lenStr[i]);
      }
      lengthAry[lenStr.length] = 255;

      if (Blob) {
        var blob = new Blob([binaryIdentifier.buffer, lengthAry.buffer, encoded]);
        doneCallback(null, blob);
      }
    });
  }

  map(packets, encodeOne, function(err, results) {
    return callback(new Blob(results));
  });
};

/*
 * Decodes data when a payload is maybe expected. Strings are decoded by
 * interpreting each byte as a key code for entries marked to start with 0. See
 * description of encodePayloadAsBinary
 *
 * @param {ArrayBuffer} data, callback method
 * @api public
 */

exports.decodePayloadAsBinary = function (data, binaryType, callback) {
  if (typeof binaryType === 'function') {
    callback = binaryType;
    binaryType = null;
  }

  var bufferTail = data;
  var buffers = [];

  var numberTooLong = false;
  while (bufferTail.byteLength > 0) {
    var tailArray = new Uint8Array(bufferTail);
    var isString = tailArray[0] === 0;
    var msgLength = '';

    for (var i = 1; ; i++) {
      if (tailArray[i] == 255) break;

      if (msgLength.length > 310) {
        numberTooLong = true;
        break;
      }

      msgLength += tailArray[i];
    }

    if(numberTooLong) return callback(err, 0, 1);

    bufferTail = sliceBuffer(bufferTail, 2 + msgLength.length);
    msgLength = parseInt(msgLength);

    var msg = sliceBuffer(bufferTail, 0, msgLength);
    if (isString) {
      try {
        msg = String.fromCharCode.apply(null, new Uint8Array(msg));
      } catch (e) {
        // iPhone Safari doesn't let you apply to typed arrays
        var typed = new Uint8Array(msg);
        msg = '';
        for (var i = 0; i < typed.length; i++) {
          msg += String.fromCharCode(typed[i]);
        }
      }
    }

    buffers.push(msg);
    bufferTail = sliceBuffer(bufferTail, msgLength);
  }

  var total = buffers.length;
  buffers.forEach(function(buffer, i) {
    callback(exports.decodePacket(buffer, binaryType, true), i, total);
  });
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./keys":192,"after":193,"arraybuffer.slice":194,"base64-arraybuffer":195,"blob":196,"has-binary":197,"utf8":199}],192:[function(require,module,exports){

/**
 * Gets the keys for an object.
 *
 * @return {Array} keys
 * @api private
 */

module.exports = Object.keys || function keys (obj){
  var arr = [];
  var has = Object.prototype.hasOwnProperty;

  for (var i in obj) {
    if (has.call(obj, i)) {
      arr.push(i);
    }
  }
  return arr;
};

},{}],193:[function(require,module,exports){
module.exports = after

function after(count, callback, err_cb) {
    var bail = false
    err_cb = err_cb || noop
    proxy.count = count

    return (count === 0) ? callback() : proxy

    function proxy(err, result) {
        if (proxy.count <= 0) {
            throw new Error('after called too many times')
        }
        --proxy.count

        // after first error, rest are passed to err_cb
        if (err) {
            bail = true
            callback(err)
            // future error callbacks will go to error handler
            callback = err_cb
        } else if (proxy.count === 0 && !bail) {
            callback(null, result)
        }
    }
}

function noop() {}

},{}],194:[function(require,module,exports){
/**
 * An abstraction for slicing an arraybuffer even when
 * ArrayBuffer.prototype.slice is not supported
 *
 * @api public
 */

module.exports = function(arraybuffer, start, end) {
  var bytes = arraybuffer.byteLength;
  start = start || 0;
  end = end || bytes;

  if (arraybuffer.slice) { return arraybuffer.slice(start, end); }

  if (start < 0) { start += bytes; }
  if (end < 0) { end += bytes; }
  if (end > bytes) { end = bytes; }

  if (start >= bytes || start >= end || bytes === 0) {
    return new ArrayBuffer(0);
  }

  var abv = new Uint8Array(arraybuffer);
  var result = new Uint8Array(end - start);
  for (var i = start, ii = 0; i < end; i++, ii++) {
    result[ii] = abv[i];
  }
  return result.buffer;
};

},{}],195:[function(require,module,exports){
/*
 * base64-arraybuffer
 * https://github.com/niklasvh/base64-arraybuffer
 *
 * Copyright (c) 2012 Niklas von Hertzen
 * Licensed under the MIT license.
 */
(function(chars){
  "use strict";

  exports.encode = function(arraybuffer) {
    var bytes = new Uint8Array(arraybuffer),
    i, len = bytes.length, base64 = "";

    for (i = 0; i < len; i+=3) {
      base64 += chars[bytes[i] >> 2];
      base64 += chars[((bytes[i] & 3) << 4) | (bytes[i + 1] >> 4)];
      base64 += chars[((bytes[i + 1] & 15) << 2) | (bytes[i + 2] >> 6)];
      base64 += chars[bytes[i + 2] & 63];
    }

    if ((len % 3) === 2) {
      base64 = base64.substring(0, base64.length - 1) + "=";
    } else if (len % 3 === 1) {
      base64 = base64.substring(0, base64.length - 2) + "==";
    }

    return base64;
  };

  exports.decode =  function(base64) {
    var bufferLength = base64.length * 0.75,
    len = base64.length, i, p = 0,
    encoded1, encoded2, encoded3, encoded4;

    if (base64[base64.length - 1] === "=") {
      bufferLength--;
      if (base64[base64.length - 2] === "=") {
        bufferLength--;
      }
    }

    var arraybuffer = new ArrayBuffer(bufferLength),
    bytes = new Uint8Array(arraybuffer);

    for (i = 0; i < len; i+=4) {
      encoded1 = chars.indexOf(base64[i]);
      encoded2 = chars.indexOf(base64[i+1]);
      encoded3 = chars.indexOf(base64[i+2]);
      encoded4 = chars.indexOf(base64[i+3]);

      bytes[p++] = (encoded1 << 2) | (encoded2 >> 4);
      bytes[p++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
      bytes[p++] = ((encoded3 & 3) << 6) | (encoded4 & 63);
    }

    return arraybuffer;
  };
})("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/");

},{}],196:[function(require,module,exports){
(function (global){
/**
 * Create a blob builder even when vendor prefixes exist
 */

var BlobBuilder = global.BlobBuilder
  || global.WebKitBlobBuilder
  || global.MSBlobBuilder
  || global.MozBlobBuilder;

/**
 * Check if Blob constructor is supported
 */

var blobSupported = (function() {
  try {
    var b = new Blob(['hi']);
    return b.size == 2;
  } catch(e) {
    return false;
  }
})();

/**
 * Check if BlobBuilder is supported
 */

var blobBuilderSupported = BlobBuilder
  && BlobBuilder.prototype.append
  && BlobBuilder.prototype.getBlob;

function BlobBuilderConstructor(ary, options) {
  options = options || {};

  var bb = new BlobBuilder();
  for (var i = 0; i < ary.length; i++) {
    bb.append(ary[i]);
  }
  return (options.type) ? bb.getBlob(options.type) : bb.getBlob();
};

module.exports = (function() {
  if (blobSupported) {
    return global.Blob;
  } else if (blobBuilderSupported) {
    return BlobBuilderConstructor;
  } else {
    return undefined;
  }
})();

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],197:[function(require,module,exports){
(function (global){

/*
 * Module requirements.
 */

var isArray = require('isarray');

/**
 * Module exports.
 */

module.exports = hasBinary;

/**
 * Checks for binary data.
 *
 * Right now only Buffer and ArrayBuffer are supported..
 *
 * @param {Object} anything
 * @api public
 */

function hasBinary(data) {

  function _hasBinary(obj) {
    if (!obj) return false;

    if ( (global.Buffer && global.Buffer.isBuffer(obj)) ||
         (global.ArrayBuffer && obj instanceof ArrayBuffer) ||
         (global.Blob && obj instanceof Blob) ||
         (global.File && obj instanceof File)
        ) {
      return true;
    }

    if (isArray(obj)) {
      for (var i = 0; i < obj.length; i++) {
          if (_hasBinary(obj[i])) {
              return true;
          }
      }
    } else if (obj && 'object' == typeof obj) {
      if (obj.toJSON) {
        obj = obj.toJSON();
      }

      for (var key in obj) {
        if (obj.hasOwnProperty(key) && _hasBinary(obj[key])) {
          return true;
        }
      }
    }

    return false;
  }

  return _hasBinary(data);
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"isarray":198}],198:[function(require,module,exports){
module.exports = Array.isArray || function (arr) {
  return Object.prototype.toString.call(arr) == '[object Array]';
};

},{}],199:[function(require,module,exports){
(function (global){
/*! http://mths.be/utf8js v2.0.0 by @mathias */
;(function(root) {

	// Detect free variables `exports`
	var freeExports = typeof exports == 'object' && exports;

	// Detect free variable `module`
	var freeModule = typeof module == 'object' && module &&
		module.exports == freeExports && module;

	// Detect free variable `global`, from Node.js or Browserified code,
	// and use it as `root`
	var freeGlobal = typeof global == 'object' && global;
	if (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal) {
		root = freeGlobal;
	}

	/*--------------------------------------------------------------------------*/

	var stringFromCharCode = String.fromCharCode;

	// Taken from http://mths.be/punycode
	function ucs2decode(string) {
		var output = [];
		var counter = 0;
		var length = string.length;
		var value;
		var extra;
		while (counter < length) {
			value = string.charCodeAt(counter++);
			if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
				// high surrogate, and there is a next character
				extra = string.charCodeAt(counter++);
				if ((extra & 0xFC00) == 0xDC00) { // low surrogate
					output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
				} else {
					// unmatched surrogate; only append this code unit, in case the next
					// code unit is the high surrogate of a surrogate pair
					output.push(value);
					counter--;
				}
			} else {
				output.push(value);
			}
		}
		return output;
	}

	// Taken from http://mths.be/punycode
	function ucs2encode(array) {
		var length = array.length;
		var index = -1;
		var value;
		var output = '';
		while (++index < length) {
			value = array[index];
			if (value > 0xFFFF) {
				value -= 0x10000;
				output += stringFromCharCode(value >>> 10 & 0x3FF | 0xD800);
				value = 0xDC00 | value & 0x3FF;
			}
			output += stringFromCharCode(value);
		}
		return output;
	}

	/*--------------------------------------------------------------------------*/

	function createByte(codePoint, shift) {
		return stringFromCharCode(((codePoint >> shift) & 0x3F) | 0x80);
	}

	function encodeCodePoint(codePoint) {
		if ((codePoint & 0xFFFFFF80) == 0) { // 1-byte sequence
			return stringFromCharCode(codePoint);
		}
		var symbol = '';
		if ((codePoint & 0xFFFFF800) == 0) { // 2-byte sequence
			symbol = stringFromCharCode(((codePoint >> 6) & 0x1F) | 0xC0);
		}
		else if ((codePoint & 0xFFFF0000) == 0) { // 3-byte sequence
			symbol = stringFromCharCode(((codePoint >> 12) & 0x0F) | 0xE0);
			symbol += createByte(codePoint, 6);
		}
		else if ((codePoint & 0xFFE00000) == 0) { // 4-byte sequence
			symbol = stringFromCharCode(((codePoint >> 18) & 0x07) | 0xF0);
			symbol += createByte(codePoint, 12);
			symbol += createByte(codePoint, 6);
		}
		symbol += stringFromCharCode((codePoint & 0x3F) | 0x80);
		return symbol;
	}

	function utf8encode(string) {
		var codePoints = ucs2decode(string);

		// console.log(JSON.stringify(codePoints.map(function(x) {
		// 	return 'U+' + x.toString(16).toUpperCase();
		// })));

		var length = codePoints.length;
		var index = -1;
		var codePoint;
		var byteString = '';
		while (++index < length) {
			codePoint = codePoints[index];
			byteString += encodeCodePoint(codePoint);
		}
		return byteString;
	}

	/*--------------------------------------------------------------------------*/

	function readContinuationByte() {
		if (byteIndex >= byteCount) {
			throw Error('Invalid byte index');
		}

		var continuationByte = byteArray[byteIndex] & 0xFF;
		byteIndex++;

		if ((continuationByte & 0xC0) == 0x80) {
			return continuationByte & 0x3F;
		}

		// If we end up here, it’s not a continuation byte
		throw Error('Invalid continuation byte');
	}

	function decodeSymbol() {
		var byte1;
		var byte2;
		var byte3;
		var byte4;
		var codePoint;

		if (byteIndex > byteCount) {
			throw Error('Invalid byte index');
		}

		if (byteIndex == byteCount) {
			return false;
		}

		// Read first byte
		byte1 = byteArray[byteIndex] & 0xFF;
		byteIndex++;

		// 1-byte sequence (no continuation bytes)
		if ((byte1 & 0x80) == 0) {
			return byte1;
		}

		// 2-byte sequence
		if ((byte1 & 0xE0) == 0xC0) {
			var byte2 = readContinuationByte();
			codePoint = ((byte1 & 0x1F) << 6) | byte2;
			if (codePoint >= 0x80) {
				return codePoint;
			} else {
				throw Error('Invalid continuation byte');
			}
		}

		// 3-byte sequence (may include unpaired surrogates)
		if ((byte1 & 0xF0) == 0xE0) {
			byte2 = readContinuationByte();
			byte3 = readContinuationByte();
			codePoint = ((byte1 & 0x0F) << 12) | (byte2 << 6) | byte3;
			if (codePoint >= 0x0800) {
				return codePoint;
			} else {
				throw Error('Invalid continuation byte');
			}
		}

		// 4-byte sequence
		if ((byte1 & 0xF8) == 0xF0) {
			byte2 = readContinuationByte();
			byte3 = readContinuationByte();
			byte4 = readContinuationByte();
			codePoint = ((byte1 & 0x0F) << 0x12) | (byte2 << 0x0C) |
				(byte3 << 0x06) | byte4;
			if (codePoint >= 0x010000 && codePoint <= 0x10FFFF) {
				return codePoint;
			}
		}

		throw Error('Invalid UTF-8 detected');
	}

	var byteArray;
	var byteCount;
	var byteIndex;
	function utf8decode(byteString) {
		byteArray = ucs2decode(byteString);
		byteCount = byteArray.length;
		byteIndex = 0;
		var codePoints = [];
		var tmp;
		while ((tmp = decodeSymbol()) !== false) {
			codePoints.push(tmp);
		}
		return ucs2encode(codePoints);
	}

	/*--------------------------------------------------------------------------*/

	var utf8 = {
		'version': '2.0.0',
		'encode': utf8encode,
		'decode': utf8decode
	};

	// Some AMD build optimizers, like r.js, check for specific condition patterns
	// like the following:
	if (
		typeof define == 'function' &&
		typeof define.amd == 'object' &&
		define.amd
	) {
		define(function() {
			return utf8;
		});
	}	else if (freeExports && !freeExports.nodeType) {
		if (freeModule) { // in Node.js or RingoJS v0.8.0+
			freeModule.exports = utf8;
		} else { // in Narwhal or RingoJS v0.7.0-
			var object = {};
			var hasOwnProperty = object.hasOwnProperty;
			for (var key in utf8) {
				hasOwnProperty.call(utf8, key) && (freeExports[key] = utf8[key]);
			}
		}
	} else { // in Rhino or a web browser
		root.utf8 = utf8;
	}

}(this));

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],200:[function(require,module,exports){

/**
 * Module dependencies.
 */

var global = require('global');

/**
 * Module exports.
 *
 * Logic borrowed from Modernizr:
 *
 *   - https://github.com/Modernizr/Modernizr/blob/master/feature-detects/cors.js
 */

try {
  module.exports = 'XMLHttpRequest' in global &&
    'withCredentials' in new global.XMLHttpRequest();
} catch (err) {
  // if XMLHttp support is disabled in IE then it will throw
  // when trying to create
  module.exports = false;
}

},{"global":201}],201:[function(require,module,exports){

/**
 * Returns `this`. Execute this without a "context" (i.e. without it being
 * attached to an object of the left-hand side), and `this` points to the
 * "global" scope of the current JS execution.
 */

module.exports = (function () { return this; })();

},{}],202:[function(require,module,exports){
(function (global){
/**
 * JSON parse.
 *
 * @see Based on jQuery#parseJSON (MIT) and JSON2
 * @api private
 */

var rvalidchars = /^[\],:{}\s]*$/;
var rvalidescape = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g;
var rvalidtokens = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g;
var rvalidbraces = /(?:^|:|,)(?:\s*\[)+/g;
var rtrimLeft = /^\s+/;
var rtrimRight = /\s+$/;

module.exports = function parsejson(data) {
  if ('string' != typeof data || !data) {
    return null;
  }

  data = data.replace(rtrimLeft, '').replace(rtrimRight, '');

  // Attempt to parse using the native JSON parser first
  if (global.JSON && JSON.parse) {
    return JSON.parse(data);
  }

  if (rvalidchars.test(data.replace(rvalidescape, '@')
      .replace(rvalidtokens, ']')
      .replace(rvalidbraces, ''))) {
    return (new Function('return ' + data))();
  }
};
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],203:[function(require,module,exports){
/**
 * Compiles a querystring
 * Returns string representation of the object
 *
 * @param {Object}
 * @api private
 */

exports.encode = function (obj) {
  var str = '';

  for (var i in obj) {
    if (obj.hasOwnProperty(i)) {
      if (str.length) str += '&';
      str += encodeURIComponent(i) + '=' + encodeURIComponent(obj[i]);
    }
  }

  return str;
};

/**
 * Parses a simple querystring into an object
 *
 * @param {String} qs
 * @api private
 */

exports.decode = function(qs){
  var qry = {};
  var pairs = qs.split('&');
  for (var i = 0, l = pairs.length; i < l; i++) {
    var pair = pairs[i].split('=');
    qry[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
  }
  return qry;
};

},{}],204:[function(require,module,exports){
/**
 * Parses an URI
 *
 * @author Steven Levithan <stevenlevithan.com> (MIT license)
 * @api private
 */

var re = /^(?:(?![^:@]+:[^:@\/]*@)(http|https|ws|wss):\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?((?:[a-f0-9]{0,4}:){2,7}[a-f0-9]{0,4}|[^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/;

var parts = [
    'source', 'protocol', 'authority', 'userInfo', 'user', 'password', 'host', 'port', 'relative', 'path', 'directory', 'file', 'query', 'anchor'
];

module.exports = function parseuri(str) {
    var src = str,
        b = str.indexOf('['),
        e = str.indexOf(']');

    if (b != -1 && e != -1) {
        str = str.substring(0, b) + str.substring(b, e).replace(/:/g, ';') + str.substring(e, str.length);
    }

    var m = re.exec(str || ''),
        uri = {},
        i = 14;

    while (i--) {
        uri[parts[i]] = m[i] || '';
    }

    if (b != -1 && e != -1) {
        uri.source = src;
        uri.host = uri.host.substring(1, uri.host.length - 1).replace(/;/g, ':');
        uri.authority = uri.authority.replace('[', '').replace(']', '').replace(/;/g, ':');
        uri.ipv6uri = true;
    }

    return uri;
};

},{}],205:[function(require,module,exports){

/**
 * Module dependencies.
 */

var global = (function() { return this; })();

/**
 * WebSocket constructor.
 */

var WebSocket = global.WebSocket || global.MozWebSocket;

/**
 * Module exports.
 */

module.exports = WebSocket ? ws : null;

/**
 * WebSocket constructor.
 *
 * The third `opts` options object gets ignored in web browsers, since it's
 * non-standard, and throws a TypeError if passed to the constructor.
 * See: https://github.com/einaros/ws/issues/227
 *
 * @param {String} uri
 * @param {Array} protocols (optional)
 * @param {Object) opts (optional)
 * @api public
 */

function ws(uri, protocols, opts) {
  var instance;
  if (protocols) {
    instance = new WebSocket(uri, protocols);
  } else {
    instance = new WebSocket(uri);
  }
  return instance;
}

if (WebSocket) ws.prototype = WebSocket.prototype;

},{}],206:[function(require,module,exports){
(function (global){

/*
 * Module requirements.
 */

var isArray = require('isarray');

/**
 * Module exports.
 */

module.exports = hasBinary;

/**
 * Checks for binary data.
 *
 * Right now only Buffer and ArrayBuffer are supported..
 *
 * @param {Object} anything
 * @api public
 */

function hasBinary(data) {

  function _hasBinary(obj) {
    if (!obj) return false;

    if ( (global.Buffer && global.Buffer.isBuffer(obj)) ||
         (global.ArrayBuffer && obj instanceof ArrayBuffer) ||
         (global.Blob && obj instanceof Blob) ||
         (global.File && obj instanceof File)
        ) {
      return true;
    }

    if (isArray(obj)) {
      for (var i = 0; i < obj.length; i++) {
          if (_hasBinary(obj[i])) {
              return true;
          }
      }
    } else if (obj && 'object' == typeof obj) {
      if (obj.toJSON) {
        obj = obj.toJSON();
      }

      for (var key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key) && _hasBinary(obj[key])) {
          return true;
        }
      }
    }

    return false;
  }

  return _hasBinary(data);
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"isarray":207}],207:[function(require,module,exports){
arguments[4][198][0].apply(exports,arguments)
},{"dup":198}],208:[function(require,module,exports){

var indexOf = [].indexOf;

module.exports = function(arr, obj){
  if (indexOf) return arr.indexOf(obj);
  for (var i = 0; i < arr.length; ++i) {
    if (arr[i] === obj) return i;
  }
  return -1;
};
},{}],209:[function(require,module,exports){

/**
 * HOP ref.
 */

var has = Object.prototype.hasOwnProperty;

/**
 * Return own keys in `obj`.
 *
 * @param {Object} obj
 * @return {Array}
 * @api public
 */

exports.keys = Object.keys || function(obj){
  var keys = [];
  for (var key in obj) {
    if (has.call(obj, key)) {
      keys.push(key);
    }
  }
  return keys;
};

/**
 * Return own values in `obj`.
 *
 * @param {Object} obj
 * @return {Array}
 * @api public
 */

exports.values = function(obj){
  var vals = [];
  for (var key in obj) {
    if (has.call(obj, key)) {
      vals.push(obj[key]);
    }
  }
  return vals;
};

/**
 * Merge `b` into `a`.
 *
 * @param {Object} a
 * @param {Object} b
 * @return {Object} a
 * @api public
 */

exports.merge = function(a, b){
  for (var key in b) {
    if (has.call(b, key)) {
      a[key] = b[key];
    }
  }
  return a;
};

/**
 * Return length of `obj`.
 *
 * @param {Object} obj
 * @return {Number}
 * @api public
 */

exports.length = function(obj){
  return exports.keys(obj).length;
};

/**
 * Check if `obj` is empty.
 *
 * @param {Object} obj
 * @return {Boolean}
 * @api public
 */

exports.isEmpty = function(obj){
  return 0 == exports.length(obj);
};
},{}],210:[function(require,module,exports){
/**
 * Parses an URI
 *
 * @author Steven Levithan <stevenlevithan.com> (MIT license)
 * @api private
 */

var re = /^(?:(?![^:@]+:[^:@\/]*@)(http|https|ws|wss):\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?((?:[a-f0-9]{0,4}:){2,7}[a-f0-9]{0,4}|[^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/;

var parts = [
    'source', 'protocol', 'authority', 'userInfo', 'user', 'password', 'host'
  , 'port', 'relative', 'path', 'directory', 'file', 'query', 'anchor'
];

module.exports = function parseuri(str) {
  var m = re.exec(str || '')
    , uri = {}
    , i = 14;

  while (i--) {
    uri[parts[i]] = m[i] || '';
  }

  return uri;
};

},{}],211:[function(require,module,exports){
(function (global){
/*global Blob,File*/

/**
 * Module requirements
 */

var isArray = require('isarray');
var isBuf = require('./is-buffer');

/**
 * Replaces every Buffer | ArrayBuffer in packet with a numbered placeholder.
 * Anything with blobs or files should be fed through removeBlobs before coming
 * here.
 *
 * @param {Object} packet - socket.io event packet
 * @return {Object} with deconstructed packet and list of buffers
 * @api public
 */

exports.deconstructPacket = function(packet){
  var buffers = [];
  var packetData = packet.data;

  function _deconstructPacket(data) {
    if (!data) return data;

    if (isBuf(data)) {
      var placeholder = { _placeholder: true, num: buffers.length };
      buffers.push(data);
      return placeholder;
    } else if (isArray(data)) {
      var newData = new Array(data.length);
      for (var i = 0; i < data.length; i++) {
        newData[i] = _deconstructPacket(data[i]);
      }
      return newData;
    } else if ('object' == typeof data && !(data instanceof Date)) {
      var newData = {};
      for (var key in data) {
        newData[key] = _deconstructPacket(data[key]);
      }
      return newData;
    }
    return data;
  }

  var pack = packet;
  pack.data = _deconstructPacket(packetData);
  pack.attachments = buffers.length; // number of binary 'attachments'
  return {packet: pack, buffers: buffers};
};

/**
 * Reconstructs a binary packet from its placeholder packet and buffers
 *
 * @param {Object} packet - event packet with placeholders
 * @param {Array} buffers - binary buffers to put in placeholder positions
 * @return {Object} reconstructed packet
 * @api public
 */

exports.reconstructPacket = function(packet, buffers) {
  var curPlaceHolder = 0;

  function _reconstructPacket(data) {
    if (data && data._placeholder) {
      var buf = buffers[data.num]; // appropriate buffer (should be natural order anyway)
      return buf;
    } else if (isArray(data)) {
      for (var i = 0; i < data.length; i++) {
        data[i] = _reconstructPacket(data[i]);
      }
      return data;
    } else if (data && 'object' == typeof data) {
      for (var key in data) {
        data[key] = _reconstructPacket(data[key]);
      }
      return data;
    }
    return data;
  }

  packet.data = _reconstructPacket(packet.data);
  packet.attachments = undefined; // no longer useful
  return packet;
};

/**
 * Asynchronously removes Blobs or Files from data via
 * FileReader's readAsArrayBuffer method. Used before encoding
 * data as msgpack. Calls callback with the blobless data.
 *
 * @param {Object} data
 * @param {Function} callback
 * @api private
 */

exports.removeBlobs = function(data, callback) {
  function _removeBlobs(obj, curKey, containingObject) {
    if (!obj) return obj;

    // convert any blob
    if ((global.Blob && obj instanceof Blob) ||
        (global.File && obj instanceof File)) {
      pendingBlobs++;

      // async filereader
      var fileReader = new FileReader();
      fileReader.onload = function() { // this.result == arraybuffer
        if (containingObject) {
          containingObject[curKey] = this.result;
        }
        else {
          bloblessData = this.result;
        }

        // if nothing pending its callback time
        if(! --pendingBlobs) {
          callback(bloblessData);
        }
      };

      fileReader.readAsArrayBuffer(obj); // blob -> arraybuffer
    } else if (isArray(obj)) { // handle array
      for (var i = 0; i < obj.length; i++) {
        _removeBlobs(obj[i], i, obj);
      }
    } else if (obj && 'object' == typeof obj && !isBuf(obj)) { // and object
      for (var key in obj) {
        _removeBlobs(obj[key], key, obj);
      }
    }
  }

  var pendingBlobs = 0;
  var bloblessData = data;
  _removeBlobs(bloblessData);
  if (!pendingBlobs) {
    callback(bloblessData);
  }
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./is-buffer":213,"isarray":214}],212:[function(require,module,exports){

/**
 * Module dependencies.
 */

var debug = require('debug')('socket.io-parser');
var json = require('json3');
var isArray = require('isarray');
var Emitter = require('component-emitter');
var binary = require('./binary');
var isBuf = require('./is-buffer');

/**
 * Protocol version.
 *
 * @api public
 */

exports.protocol = 4;

/**
 * Packet types.
 *
 * @api public
 */

exports.types = [
  'CONNECT',
  'DISCONNECT',
  'EVENT',
  'BINARY_EVENT',
  'ACK',
  'BINARY_ACK',
  'ERROR'
];

/**
 * Packet type `connect`.
 *
 * @api public
 */

exports.CONNECT = 0;

/**
 * Packet type `disconnect`.
 *
 * @api public
 */

exports.DISCONNECT = 1;

/**
 * Packet type `event`.
 *
 * @api public
 */

exports.EVENT = 2;

/**
 * Packet type `ack`.
 *
 * @api public
 */

exports.ACK = 3;

/**
 * Packet type `error`.
 *
 * @api public
 */

exports.ERROR = 4;

/**
 * Packet type 'binary event'
 *
 * @api public
 */

exports.BINARY_EVENT = 5;

/**
 * Packet type `binary ack`. For acks with binary arguments.
 *
 * @api public
 */

exports.BINARY_ACK = 6;

/**
 * Encoder constructor.
 *
 * @api public
 */

exports.Encoder = Encoder;

/**
 * Decoder constructor.
 *
 * @api public
 */

exports.Decoder = Decoder;

/**
 * A socket.io Encoder instance
 *
 * @api public
 */

function Encoder() {}

/**
 * Encode a packet as a single string if non-binary, or as a
 * buffer sequence, depending on packet type.
 *
 * @param {Object} obj - packet object
 * @param {Function} callback - function to handle encodings (likely engine.write)
 * @return Calls callback with Array of encodings
 * @api public
 */

Encoder.prototype.encode = function(obj, callback){
  debug('encoding packet %j', obj);

  if (exports.BINARY_EVENT == obj.type || exports.BINARY_ACK == obj.type) {
    encodeAsBinary(obj, callback);
  }
  else {
    var encoding = encodeAsString(obj);
    callback([encoding]);
  }
};

/**
 * Encode packet as string.
 *
 * @param {Object} packet
 * @return {String} encoded
 * @api private
 */

function encodeAsString(obj) {
  var str = '';
  var nsp = false;

  // first is type
  str += obj.type;

  // attachments if we have them
  if (exports.BINARY_EVENT == obj.type || exports.BINARY_ACK == obj.type) {
    str += obj.attachments;
    str += '-';
  }

  // if we have a namespace other than `/`
  // we append it followed by a comma `,`
  if (obj.nsp && '/' != obj.nsp) {
    nsp = true;
    str += obj.nsp;
  }

  // immediately followed by the id
  if (null != obj.id) {
    if (nsp) {
      str += ',';
      nsp = false;
    }
    str += obj.id;
  }

  // json data
  if (null != obj.data) {
    if (nsp) str += ',';
    str += json.stringify(obj.data);
  }

  debug('encoded %j as %s', obj, str);
  return str;
}

/**
 * Encode packet as 'buffer sequence' by removing blobs, and
 * deconstructing packet into object with placeholders and
 * a list of buffers.
 *
 * @param {Object} packet
 * @return {Buffer} encoded
 * @api private
 */

function encodeAsBinary(obj, callback) {

  function writeEncoding(bloblessData) {
    var deconstruction = binary.deconstructPacket(bloblessData);
    var pack = encodeAsString(deconstruction.packet);
    var buffers = deconstruction.buffers;

    buffers.unshift(pack); // add packet info to beginning of data list
    callback(buffers); // write all the buffers
  }

  binary.removeBlobs(obj, writeEncoding);
}

/**
 * A socket.io Decoder instance
 *
 * @return {Object} decoder
 * @api public
 */

function Decoder() {
  this.reconstructor = null;
}

/**
 * Mix in `Emitter` with Decoder.
 */

Emitter(Decoder.prototype);

/**
 * Decodes an ecoded packet string into packet JSON.
 *
 * @param {String} obj - encoded packet
 * @return {Object} packet
 * @api public
 */

Decoder.prototype.add = function(obj) {
  var packet;
  if ('string' == typeof obj) {
    packet = decodeString(obj);
    if (exports.BINARY_EVENT == packet.type || exports.BINARY_ACK == packet.type) { // binary packet's json
      this.reconstructor = new BinaryReconstructor(packet);

      // no attachments, labeled binary but no binary data to follow
      if (this.reconstructor.reconPack.attachments === 0) {
        this.emit('decoded', packet);
      }
    } else { // non-binary full packet
      this.emit('decoded', packet);
    }
  }
  else if (isBuf(obj) || obj.base64) { // raw binary data
    if (!this.reconstructor) {
      throw new Error('got binary data when not reconstructing a packet');
    } else {
      packet = this.reconstructor.takeBinaryData(obj);
      if (packet) { // received final buffer
        this.reconstructor = null;
        this.emit('decoded', packet);
      }
    }
  }
  else {
    throw new Error('Unknown type: ' + obj);
  }
};

/**
 * Decode a packet String (JSON data)
 *
 * @param {String} str
 * @return {Object} packet
 * @api private
 */

function decodeString(str) {
  var p = {};
  var i = 0;

  // look up type
  p.type = Number(str.charAt(0));
  if (null == exports.types[p.type]) return error();

  // look up attachments if type binary
  if (exports.BINARY_EVENT == p.type || exports.BINARY_ACK == p.type) {
    var buf = '';
    while (str.charAt(++i) != '-') {
      buf += str.charAt(i);
      if (i == str.length) break;
    }
    if (buf != Number(buf) || str.charAt(i) != '-') {
      throw new Error('Illegal attachments');
    }
    p.attachments = Number(buf);
  }

  // look up namespace (if any)
  if ('/' == str.charAt(i + 1)) {
    p.nsp = '';
    while (++i) {
      var c = str.charAt(i);
      if (',' == c) break;
      p.nsp += c;
      if (i == str.length) break;
    }
  } else {
    p.nsp = '/';
  }

  // look up id
  var next = str.charAt(i + 1);
  if ('' !== next && Number(next) == next) {
    p.id = '';
    while (++i) {
      var c = str.charAt(i);
      if (null == c || Number(c) != c) {
        --i;
        break;
      }
      p.id += str.charAt(i);
      if (i == str.length) break;
    }
    p.id = Number(p.id);
  }

  // look up json data
  if (str.charAt(++i)) {
    try {
      p.data = json.parse(str.substr(i));
    } catch(e){
      return error();
    }
  }

  debug('decoded %s as %j', str, p);
  return p;
}

/**
 * Deallocates a parser's resources
 *
 * @api public
 */

Decoder.prototype.destroy = function() {
  if (this.reconstructor) {
    this.reconstructor.finishedReconstruction();
  }
};

/**
 * A manager of a binary event's 'buffer sequence'. Should
 * be constructed whenever a packet of type BINARY_EVENT is
 * decoded.
 *
 * @param {Object} packet
 * @return {BinaryReconstructor} initialized reconstructor
 * @api private
 */

function BinaryReconstructor(packet) {
  this.reconPack = packet;
  this.buffers = [];
}

/**
 * Method to be called when binary data received from connection
 * after a BINARY_EVENT packet.
 *
 * @param {Buffer | ArrayBuffer} binData - the raw binary data received
 * @return {null | Object} returns null if more binary data is expected or
 *   a reconstructed packet object if all buffers have been received.
 * @api private
 */

BinaryReconstructor.prototype.takeBinaryData = function(binData) {
  this.buffers.push(binData);
  if (this.buffers.length == this.reconPack.attachments) { // done with buffer list
    var packet = binary.reconstructPacket(this.reconPack, this.buffers);
    this.finishedReconstruction();
    return packet;
  }
  return null;
};

/**
 * Cleans up binary packet reconstruction variables.
 *
 * @api private
 */

BinaryReconstructor.prototype.finishedReconstruction = function() {
  this.reconPack = null;
  this.buffers = [];
};

function error(data){
  return {
    type: exports.ERROR,
    data: 'parser error'
  };
}

},{"./binary":211,"./is-buffer":213,"component-emitter":175,"debug":176,"isarray":214,"json3":215}],213:[function(require,module,exports){
(function (global){

module.exports = isBuf;

/**
 * Returns true if obj is a buffer or an arraybuffer.
 *
 * @api private
 */

function isBuf(obj) {
  return (global.Buffer && global.Buffer.isBuffer(obj)) ||
         (global.ArrayBuffer && obj instanceof ArrayBuffer);
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],214:[function(require,module,exports){
arguments[4][198][0].apply(exports,arguments)
},{"dup":198}],215:[function(require,module,exports){
/*! JSON v3.2.6 | http://bestiejs.github.io/json3 | Copyright 2012-2013, Kit Cambridge | http://kit.mit-license.org */
;(function (window) {
  // Convenience aliases.
  var getClass = {}.toString, isProperty, forEach, undef;

  // Detect the `define` function exposed by asynchronous module loaders. The
  // strict `define` check is necessary for compatibility with `r.js`.
  var isLoader = typeof define === "function" && define.amd;

  // Detect native implementations.
  var nativeJSON = typeof JSON == "object" && JSON;

  // Set up the JSON 3 namespace, preferring the CommonJS `exports` object if
  // available.
  var JSON3 = typeof exports == "object" && exports && !exports.nodeType && exports;

  if (JSON3 && nativeJSON) {
    // Explicitly delegate to the native `stringify` and `parse`
    // implementations in CommonJS environments.
    JSON3.stringify = nativeJSON.stringify;
    JSON3.parse = nativeJSON.parse;
  } else {
    // Export for web browsers, JavaScript engines, and asynchronous module
    // loaders, using the global `JSON` object if available.
    JSON3 = window.JSON = nativeJSON || {};
  }

  // Test the `Date#getUTC*` methods. Based on work by @Yaffle.
  var isExtended = new Date(-3509827334573292);
  try {
    // The `getUTCFullYear`, `Month`, and `Date` methods return nonsensical
    // results for certain dates in Opera >= 10.53.
    isExtended = isExtended.getUTCFullYear() == -109252 && isExtended.getUTCMonth() === 0 && isExtended.getUTCDate() === 1 &&
      // Safari < 2.0.2 stores the internal millisecond time value correctly,
      // but clips the values returned by the date methods to the range of
      // signed 32-bit integers ([-2 ** 31, 2 ** 31 - 1]).
      isExtended.getUTCHours() == 10 && isExtended.getUTCMinutes() == 37 && isExtended.getUTCSeconds() == 6 && isExtended.getUTCMilliseconds() == 708;
  } catch (exception) {}

  // Internal: Determines whether the native `JSON.stringify` and `parse`
  // implementations are spec-compliant. Based on work by Ken Snyder.
  function has(name) {
    if (has[name] !== undef) {
      // Return cached feature test result.
      return has[name];
    }

    var isSupported;
    if (name == "bug-string-char-index") {
      // IE <= 7 doesn't support accessing string characters using square
      // bracket notation. IE 8 only supports this for primitives.
      isSupported = "a"[0] != "a";
    } else if (name == "json") {
      // Indicates whether both `JSON.stringify` and `JSON.parse` are
      // supported.
      isSupported = has("json-stringify") && has("json-parse");
    } else {
      var value, serialized = '{"a":[1,true,false,null,"\\u0000\\b\\n\\f\\r\\t"]}';
      // Test `JSON.stringify`.
      if (name == "json-stringify") {
        var stringify = JSON3.stringify, stringifySupported = typeof stringify == "function" && isExtended;
        if (stringifySupported) {
          // A test function object with a custom `toJSON` method.
          (value = function () {
            return 1;
          }).toJSON = value;
          try {
            stringifySupported =
              // Firefox 3.1b1 and b2 serialize string, number, and boolean
              // primitives as object literals.
              stringify(0) === "0" &&
              // FF 3.1b1, b2, and JSON 2 serialize wrapped primitives as object
              // literals.
              stringify(new Number()) === "0" &&
              stringify(new String()) == '""' &&
              // FF 3.1b1, 2 throw an error if the value is `null`, `undefined`, or
              // does not define a canonical JSON representation (this applies to
              // objects with `toJSON` properties as well, *unless* they are nested
              // within an object or array).
              stringify(getClass) === undef &&
              // IE 8 serializes `undefined` as `"undefined"`. Safari <= 5.1.7 and
              // FF 3.1b3 pass this test.
              stringify(undef) === undef &&
              // Safari <= 5.1.7 and FF 3.1b3 throw `Error`s and `TypeError`s,
              // respectively, if the value is omitted entirely.
              stringify() === undef &&
              // FF 3.1b1, 2 throw an error if the given value is not a number,
              // string, array, object, Boolean, or `null` literal. This applies to
              // objects with custom `toJSON` methods as well, unless they are nested
              // inside object or array literals. YUI 3.0.0b1 ignores custom `toJSON`
              // methods entirely.
              stringify(value) === "1" &&
              stringify([value]) == "[1]" &&
              // Prototype <= 1.6.1 serializes `[undefined]` as `"[]"` instead of
              // `"[null]"`.
              stringify([undef]) == "[null]" &&
              // YUI 3.0.0b1 fails to serialize `null` literals.
              stringify(null) == "null" &&
              // FF 3.1b1, 2 halts serialization if an array contains a function:
              // `[1, true, getClass, 1]` serializes as "[1,true,],". FF 3.1b3
              // elides non-JSON values from objects and arrays, unless they
              // define custom `toJSON` methods.
              stringify([undef, getClass, null]) == "[null,null,null]" &&
              // Simple serialization test. FF 3.1b1 uses Unicode escape sequences
              // where character escape codes are expected (e.g., `\b` => `\u0008`).
              stringify({ "a": [value, true, false, null, "\x00\b\n\f\r\t"] }) == serialized &&
              // FF 3.1b1 and b2 ignore the `filter` and `width` arguments.
              stringify(null, value) === "1" &&
              stringify([1, 2], null, 1) == "[\n 1,\n 2\n]" &&
              // JSON 2, Prototype <= 1.7, and older WebKit builds incorrectly
              // serialize extended years.
              stringify(new Date(-8.64e15)) == '"-271821-04-20T00:00:00.000Z"' &&
              // The milliseconds are optional in ES 5, but required in 5.1.
              stringify(new Date(8.64e15)) == '"+275760-09-13T00:00:00.000Z"' &&
              // Firefox <= 11.0 incorrectly serializes years prior to 0 as negative
              // four-digit years instead of six-digit years. Credits: @Yaffle.
              stringify(new Date(-621987552e5)) == '"-000001-01-01T00:00:00.000Z"' &&
              // Safari <= 5.1.5 and Opera >= 10.53 incorrectly serialize millisecond
              // values less than 1000. Credits: @Yaffle.
              stringify(new Date(-1)) == '"1969-12-31T23:59:59.999Z"';
          } catch (exception) {
            stringifySupported = false;
          }
        }
        isSupported = stringifySupported;
      }
      // Test `JSON.parse`.
      if (name == "json-parse") {
        var parse = JSON3.parse;
        if (typeof parse == "function") {
          try {
            // FF 3.1b1, b2 will throw an exception if a bare literal is provided.
            // Conforming implementations should also coerce the initial argument to
            // a string prior to parsing.
            if (parse("0") === 0 && !parse(false)) {
              // Simple parsing test.
              value = parse(serialized);
              var parseSupported = value["a"].length == 5 && value["a"][0] === 1;
              if (parseSupported) {
                try {
                  // Safari <= 5.1.2 and FF 3.1b1 allow unescaped tabs in strings.
                  parseSupported = !parse('"\t"');
                } catch (exception) {}
                if (parseSupported) {
                  try {
                    // FF 4.0 and 4.0.1 allow leading `+` signs and leading
                    // decimal points. FF 4.0, 4.0.1, and IE 9-10 also allow
                    // certain octal literals.
                    parseSupported = parse("01") !== 1;
                  } catch (exception) {}
                }
                if (parseSupported) {
                  try {
                    // FF 4.0, 4.0.1, and Rhino 1.7R3-R4 allow trailing decimal
                    // points. These environments, along with FF 3.1b1 and 2,
                    // also allow trailing commas in JSON objects and arrays.
                    parseSupported = parse("1.") !== 1;
                  } catch (exception) {}
                }
              }
            }
          } catch (exception) {
            parseSupported = false;
          }
        }
        isSupported = parseSupported;
      }
    }
    return has[name] = !!isSupported;
  }

  if (!has("json")) {
    // Common `[[Class]]` name aliases.
    var functionClass = "[object Function]";
    var dateClass = "[object Date]";
    var numberClass = "[object Number]";
    var stringClass = "[object String]";
    var arrayClass = "[object Array]";
    var booleanClass = "[object Boolean]";

    // Detect incomplete support for accessing string characters by index.
    var charIndexBuggy = has("bug-string-char-index");

    // Define additional utility methods if the `Date` methods are buggy.
    if (!isExtended) {
      var floor = Math.floor;
      // A mapping between the months of the year and the number of days between
      // January 1st and the first of the respective month.
      var Months = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
      // Internal: Calculates the number of days between the Unix epoch and the
      // first day of the given month.
      var getDay = function (year, month) {
        return Months[month] + 365 * (year - 1970) + floor((year - 1969 + (month = +(month > 1))) / 4) - floor((year - 1901 + month) / 100) + floor((year - 1601 + month) / 400);
      };
    }

    // Internal: Determines if a property is a direct property of the given
    // object. Delegates to the native `Object#hasOwnProperty` method.
    if (!(isProperty = {}.hasOwnProperty)) {
      isProperty = function (property) {
        var members = {}, constructor;
        if ((members.__proto__ = null, members.__proto__ = {
          // The *proto* property cannot be set multiple times in recent
          // versions of Firefox and SeaMonkey.
          "toString": 1
        }, members).toString != getClass) {
          // Safari <= 2.0.3 doesn't implement `Object#hasOwnProperty`, but
          // supports the mutable *proto* property.
          isProperty = function (property) {
            // Capture and break the object's prototype chain (see section 8.6.2
            // of the ES 5.1 spec). The parenthesized expression prevents an
            // unsafe transformation by the Closure Compiler.
            var original = this.__proto__, result = property in (this.__proto__ = null, this);
            // Restore the original prototype chain.
            this.__proto__ = original;
            return result;
          };
        } else {
          // Capture a reference to the top-level `Object` constructor.
          constructor = members.constructor;
          // Use the `constructor` property to simulate `Object#hasOwnProperty` in
          // other environments.
          isProperty = function (property) {
            var parent = (this.constructor || constructor).prototype;
            return property in this && !(property in parent && this[property] === parent[property]);
          };
        }
        members = null;
        return isProperty.call(this, property);
      };
    }

    // Internal: A set of primitive types used by `isHostType`.
    var PrimitiveTypes = {
      'boolean': 1,
      'number': 1,
      'string': 1,
      'undefined': 1
    };

    // Internal: Determines if the given object `property` value is a
    // non-primitive.
    var isHostType = function (object, property) {
      var type = typeof object[property];
      return type == 'object' ? !!object[property] : !PrimitiveTypes[type];
    };

    // Internal: Normalizes the `for...in` iteration algorithm across
    // environments. Each enumerated key is yielded to a `callback` function.
    forEach = function (object, callback) {
      var size = 0, Properties, members, property;

      // Tests for bugs in the current environment's `for...in` algorithm. The
      // `valueOf` property inherits the non-enumerable flag from
      // `Object.prototype` in older versions of IE, Netscape, and Mozilla.
      (Properties = function () {
        this.valueOf = 0;
      }).prototype.valueOf = 0;

      // Iterate over a new instance of the `Properties` class.
      members = new Properties();
      for (property in members) {
        // Ignore all properties inherited from `Object.prototype`.
        if (isProperty.call(members, property)) {
          size++;
        }
      }
      Properties = members = null;

      // Normalize the iteration algorithm.
      if (!size) {
        // A list of non-enumerable properties inherited from `Object.prototype`.
        members = ["valueOf", "toString", "toLocaleString", "propertyIsEnumerable", "isPrototypeOf", "hasOwnProperty", "constructor"];
        // IE <= 8, Mozilla 1.0, and Netscape 6.2 ignore shadowed non-enumerable
        // properties.
        forEach = function (object, callback) {
          var isFunction = getClass.call(object) == functionClass, property, length;
          var hasProperty = !isFunction && typeof object.constructor != 'function' && isHostType(object, 'hasOwnProperty') ? object.hasOwnProperty : isProperty;
          for (property in object) {
            // Gecko <= 1.0 enumerates the `prototype` property of functions under
            // certain conditions; IE does not.
            if (!(isFunction && property == "prototype") && hasProperty.call(object, property)) {
              callback(property);
            }
          }
          // Manually invoke the callback for each non-enumerable property.
          for (length = members.length; property = members[--length]; hasProperty.call(object, property) && callback(property));
        };
      } else if (size == 2) {
        // Safari <= 2.0.4 enumerates shadowed properties twice.
        forEach = function (object, callback) {
          // Create a set of iterated properties.
          var members = {}, isFunction = getClass.call(object) == functionClass, property;
          for (property in object) {
            // Store each property name to prevent double enumeration. The
            // `prototype` property of functions is not enumerated due to cross-
            // environment inconsistencies.
            if (!(isFunction && property == "prototype") && !isProperty.call(members, property) && (members[property] = 1) && isProperty.call(object, property)) {
              callback(property);
            }
          }
        };
      } else {
        // No bugs detected; use the standard `for...in` algorithm.
        forEach = function (object, callback) {
          var isFunction = getClass.call(object) == functionClass, property, isConstructor;
          for (property in object) {
            if (!(isFunction && property == "prototype") && isProperty.call(object, property) && !(isConstructor = property === "constructor")) {
              callback(property);
            }
          }
          // Manually invoke the callback for the `constructor` property due to
          // cross-environment inconsistencies.
          if (isConstructor || isProperty.call(object, (property = "constructor"))) {
            callback(property);
          }
        };
      }
      return forEach(object, callback);
    };

    // Public: Serializes a JavaScript `value` as a JSON string. The optional
    // `filter` argument may specify either a function that alters how object and
    // array members are serialized, or an array of strings and numbers that
    // indicates which properties should be serialized. The optional `width`
    // argument may be either a string or number that specifies the indentation
    // level of the output.
    if (!has("json-stringify")) {
      // Internal: A map of control characters and their escaped equivalents.
      var Escapes = {
        92: "\\\\",
        34: '\\"',
        8: "\\b",
        12: "\\f",
        10: "\\n",
        13: "\\r",
        9: "\\t"
      };

      // Internal: Converts `value` into a zero-padded string such that its
      // length is at least equal to `width`. The `width` must be <= 6.
      var leadingZeroes = "000000";
      var toPaddedString = function (width, value) {
        // The `|| 0` expression is necessary to work around a bug in
        // Opera <= 7.54u2 where `0 == -0`, but `String(-0) !== "0"`.
        return (leadingZeroes + (value || 0)).slice(-width);
      };

      // Internal: Double-quotes a string `value`, replacing all ASCII control
      // characters (characters with code unit values between 0 and 31) with
      // their escaped equivalents. This is an implementation of the
      // `Quote(value)` operation defined in ES 5.1 section 15.12.3.
      var unicodePrefix = "\\u00";
      var quote = function (value) {
        var result = '"', index = 0, length = value.length, isLarge = length > 10 && charIndexBuggy, symbols;
        if (isLarge) {
          symbols = value.split("");
        }
        for (; index < length; index++) {
          var charCode = value.charCodeAt(index);
          // If the character is a control character, append its Unicode or
          // shorthand escape sequence; otherwise, append the character as-is.
          switch (charCode) {
            case 8: case 9: case 10: case 12: case 13: case 34: case 92:
              result += Escapes[charCode];
              break;
            default:
              if (charCode < 32) {
                result += unicodePrefix + toPaddedString(2, charCode.toString(16));
                break;
              }
              result += isLarge ? symbols[index] : charIndexBuggy ? value.charAt(index) : value[index];
          }
        }
        return result + '"';
      };

      // Internal: Recursively serializes an object. Implements the
      // `Str(key, holder)`, `JO(value)`, and `JA(value)` operations.
      var serialize = function (property, object, callback, properties, whitespace, indentation, stack) {
        var value, className, year, month, date, time, hours, minutes, seconds, milliseconds, results, element, index, length, prefix, result;
        try {
          // Necessary for host object support.
          value = object[property];
        } catch (exception) {}
        if (typeof value == "object" && value) {
          className = getClass.call(value);
          if (className == dateClass && !isProperty.call(value, "toJSON")) {
            if (value > -1 / 0 && value < 1 / 0) {
              // Dates are serialized according to the `Date#toJSON` method
              // specified in ES 5.1 section 15.9.5.44. See section 15.9.1.15
              // for the ISO 8601 date time string format.
              if (getDay) {
                // Manually compute the year, month, date, hours, minutes,
                // seconds, and milliseconds if the `getUTC*` methods are
                // buggy. Adapted from @Yaffle's `date-shim` project.
                date = floor(value / 864e5);
                for (year = floor(date / 365.2425) + 1970 - 1; getDay(year + 1, 0) <= date; year++);
                for (month = floor((date - getDay(year, 0)) / 30.42); getDay(year, month + 1) <= date; month++);
                date = 1 + date - getDay(year, month);
                // The `time` value specifies the time within the day (see ES
                // 5.1 section 15.9.1.2). The formula `(A % B + B) % B` is used
                // to compute `A modulo B`, as the `%` operator does not
                // correspond to the `modulo` operation for negative numbers.
                time = (value % 864e5 + 864e5) % 864e5;
                // The hours, minutes, seconds, and milliseconds are obtained by
                // decomposing the time within the day. See section 15.9.1.10.
                hours = floor(time / 36e5) % 24;
                minutes = floor(time / 6e4) % 60;
                seconds = floor(time / 1e3) % 60;
                milliseconds = time % 1e3;
              } else {
                year = value.getUTCFullYear();
                month = value.getUTCMonth();
                date = value.getUTCDate();
                hours = value.getUTCHours();
                minutes = value.getUTCMinutes();
                seconds = value.getUTCSeconds();
                milliseconds = value.getUTCMilliseconds();
              }
              // Serialize extended years correctly.
              value = (year <= 0 || year >= 1e4 ? (year < 0 ? "-" : "+") + toPaddedString(6, year < 0 ? -year : year) : toPaddedString(4, year)) +
                "-" + toPaddedString(2, month + 1) + "-" + toPaddedString(2, date) +
                // Months, dates, hours, minutes, and seconds should have two
                // digits; milliseconds should have three.
                "T" + toPaddedString(2, hours) + ":" + toPaddedString(2, minutes) + ":" + toPaddedString(2, seconds) +
                // Milliseconds are optional in ES 5.0, but required in 5.1.
                "." + toPaddedString(3, milliseconds) + "Z";
            } else {
              value = null;
            }
          } else if (typeof value.toJSON == "function" && ((className != numberClass && className != stringClass && className != arrayClass) || isProperty.call(value, "toJSON"))) {
            // Prototype <= 1.6.1 adds non-standard `toJSON` methods to the
            // `Number`, `String`, `Date`, and `Array` prototypes. JSON 3
            // ignores all `toJSON` methods on these objects unless they are
            // defined directly on an instance.
            value = value.toJSON(property);
          }
        }
        if (callback) {
          // If a replacement function was provided, call it to obtain the value
          // for serialization.
          value = callback.call(object, property, value);
        }
        if (value === null) {
          return "null";
        }
        className = getClass.call(value);
        if (className == booleanClass) {
          // Booleans are represented literally.
          return "" + value;
        } else if (className == numberClass) {
          // JSON numbers must be finite. `Infinity` and `NaN` are serialized as
          // `"null"`.
          return value > -1 / 0 && value < 1 / 0 ? "" + value : "null";
        } else if (className == stringClass) {
          // Strings are double-quoted and escaped.
          return quote("" + value);
        }
        // Recursively serialize objects and arrays.
        if (typeof value == "object") {
          // Check for cyclic structures. This is a linear search; performance
          // is inversely proportional to the number of unique nested objects.
          for (length = stack.length; length--;) {
            if (stack[length] === value) {
              // Cyclic structures cannot be serialized by `JSON.stringify`.
              throw TypeError();
            }
          }
          // Add the object to the stack of traversed objects.
          stack.push(value);
          results = [];
          // Save the current indentation level and indent one additional level.
          prefix = indentation;
          indentation += whitespace;
          if (className == arrayClass) {
            // Recursively serialize array elements.
            for (index = 0, length = value.length; index < length; index++) {
              element = serialize(index, value, callback, properties, whitespace, indentation, stack);
              results.push(element === undef ? "null" : element);
            }
            result = results.length ? (whitespace ? "[\n" + indentation + results.join(",\n" + indentation) + "\n" + prefix + "]" : ("[" + results.join(",") + "]")) : "[]";
          } else {
            // Recursively serialize object members. Members are selected from
            // either a user-specified list of property names, or the object
            // itself.
            forEach(properties || value, function (property) {
              var element = serialize(property, value, callback, properties, whitespace, indentation, stack);
              if (element !== undef) {
                // According to ES 5.1 section 15.12.3: "If `gap` {whitespace}
                // is not the empty string, let `member` {quote(property) + ":"}
                // be the concatenation of `member` and the `space` character."
                // The "`space` character" refers to the literal space
                // character, not the `space` {width} argument provided to
                // `JSON.stringify`.
                results.push(quote(property) + ":" + (whitespace ? " " : "") + element);
              }
            });
            result = results.length ? (whitespace ? "{\n" + indentation + results.join(",\n" + indentation) + "\n" + prefix + "}" : ("{" + results.join(",") + "}")) : "{}";
          }
          // Remove the object from the traversed object stack.
          stack.pop();
          return result;
        }
      };

      // Public: `JSON.stringify`. See ES 5.1 section 15.12.3.
      JSON3.stringify = function (source, filter, width) {
        var whitespace, callback, properties, className;
        if (typeof filter == "function" || typeof filter == "object" && filter) {
          if ((className = getClass.call(filter)) == functionClass) {
            callback = filter;
          } else if (className == arrayClass) {
            // Convert the property names array into a makeshift set.
            properties = {};
            for (var index = 0, length = filter.length, value; index < length; value = filter[index++], ((className = getClass.call(value)), className == stringClass || className == numberClass) && (properties[value] = 1));
          }
        }
        if (width) {
          if ((className = getClass.call(width)) == numberClass) {
            // Convert the `width` to an integer and create a string containing
            // `width` number of space characters.
            if ((width -= width % 1) > 0) {
              for (whitespace = "", width > 10 && (width = 10); whitespace.length < width; whitespace += " ");
            }
          } else if (className == stringClass) {
            whitespace = width.length <= 10 ? width : width.slice(0, 10);
          }
        }
        // Opera <= 7.54u2 discards the values associated with empty string keys
        // (`""`) only if they are used directly within an object member list
        // (e.g., `!("" in { "": 1})`).
        return serialize("", (value = {}, value[""] = source, value), callback, properties, whitespace, "", []);
      };
    }

    // Public: Parses a JSON source string.
    if (!has("json-parse")) {
      var fromCharCode = String.fromCharCode;

      // Internal: A map of escaped control characters and their unescaped
      // equivalents.
      var Unescapes = {
        92: "\\",
        34: '"',
        47: "/",
        98: "\b",
        116: "\t",
        110: "\n",
        102: "\f",
        114: "\r"
      };

      // Internal: Stores the parser state.
      var Index, Source;

      // Internal: Resets the parser state and throws a `SyntaxError`.
      var abort = function() {
        Index = Source = null;
        throw SyntaxError();
      };

      // Internal: Returns the next token, or `"$"` if the parser has reached
      // the end of the source string. A token may be a string, number, `null`
      // literal, or Boolean literal.
      var lex = function () {
        var source = Source, length = source.length, value, begin, position, isSigned, charCode;
        while (Index < length) {
          charCode = source.charCodeAt(Index);
          switch (charCode) {
            case 9: case 10: case 13: case 32:
              // Skip whitespace tokens, including tabs, carriage returns, line
              // feeds, and space characters.
              Index++;
              break;
            case 123: case 125: case 91: case 93: case 58: case 44:
              // Parse a punctuator token (`{`, `}`, `[`, `]`, `:`, or `,`) at
              // the current position.
              value = charIndexBuggy ? source.charAt(Index) : source[Index];
              Index++;
              return value;
            case 34:
              // `"` delimits a JSON string; advance to the next character and
              // begin parsing the string. String tokens are prefixed with the
              // sentinel `@` character to distinguish them from punctuators and
              // end-of-string tokens.
              for (value = "@", Index++; Index < length;) {
                charCode = source.charCodeAt(Index);
                if (charCode < 32) {
                  // Unescaped ASCII control characters (those with a code unit
                  // less than the space character) are not permitted.
                  abort();
                } else if (charCode == 92) {
                  // A reverse solidus (`\`) marks the beginning of an escaped
                  // control character (including `"`, `\`, and `/`) or Unicode
                  // escape sequence.
                  charCode = source.charCodeAt(++Index);
                  switch (charCode) {
                    case 92: case 34: case 47: case 98: case 116: case 110: case 102: case 114:
                      // Revive escaped control characters.
                      value += Unescapes[charCode];
                      Index++;
                      break;
                    case 117:
                      // `\u` marks the beginning of a Unicode escape sequence.
                      // Advance to the first character and validate the
                      // four-digit code point.
                      begin = ++Index;
                      for (position = Index + 4; Index < position; Index++) {
                        charCode = source.charCodeAt(Index);
                        // A valid sequence comprises four hexdigits (case-
                        // insensitive) that form a single hexadecimal value.
                        if (!(charCode >= 48 && charCode <= 57 || charCode >= 97 && charCode <= 102 || charCode >= 65 && charCode <= 70)) {
                          // Invalid Unicode escape sequence.
                          abort();
                        }
                      }
                      // Revive the escaped character.
                      value += fromCharCode("0x" + source.slice(begin, Index));
                      break;
                    default:
                      // Invalid escape sequence.
                      abort();
                  }
                } else {
                  if (charCode == 34) {
                    // An unescaped double-quote character marks the end of the
                    // string.
                    break;
                  }
                  charCode = source.charCodeAt(Index);
                  begin = Index;
                  // Optimize for the common case where a string is valid.
                  while (charCode >= 32 && charCode != 92 && charCode != 34) {
                    charCode = source.charCodeAt(++Index);
                  }
                  // Append the string as-is.
                  value += source.slice(begin, Index);
                }
              }
              if (source.charCodeAt(Index) == 34) {
                // Advance to the next character and return the revived string.
                Index++;
                return value;
              }
              // Unterminated string.
              abort();
            default:
              // Parse numbers and literals.
              begin = Index;
              // Advance past the negative sign, if one is specified.
              if (charCode == 45) {
                isSigned = true;
                charCode = source.charCodeAt(++Index);
              }
              // Parse an integer or floating-point value.
              if (charCode >= 48 && charCode <= 57) {
                // Leading zeroes are interpreted as octal literals.
                if (charCode == 48 && ((charCode = source.charCodeAt(Index + 1)), charCode >= 48 && charCode <= 57)) {
                  // Illegal octal literal.
                  abort();
                }
                isSigned = false;
                // Parse the integer component.
                for (; Index < length && ((charCode = source.charCodeAt(Index)), charCode >= 48 && charCode <= 57); Index++);
                // Floats cannot contain a leading decimal point; however, this
                // case is already accounted for by the parser.
                if (source.charCodeAt(Index) == 46) {
                  position = ++Index;
                  // Parse the decimal component.
                  for (; position < length && ((charCode = source.charCodeAt(position)), charCode >= 48 && charCode <= 57); position++);
                  if (position == Index) {
                    // Illegal trailing decimal.
                    abort();
                  }
                  Index = position;
                }
                // Parse exponents. The `e` denoting the exponent is
                // case-insensitive.
                charCode = source.charCodeAt(Index);
                if (charCode == 101 || charCode == 69) {
                  charCode = source.charCodeAt(++Index);
                  // Skip past the sign following the exponent, if one is
                  // specified.
                  if (charCode == 43 || charCode == 45) {
                    Index++;
                  }
                  // Parse the exponential component.
                  for (position = Index; position < length && ((charCode = source.charCodeAt(position)), charCode >= 48 && charCode <= 57); position++);
                  if (position == Index) {
                    // Illegal empty exponent.
                    abort();
                  }
                  Index = position;
                }
                // Coerce the parsed value to a JavaScript number.
                return +source.slice(begin, Index);
              }
              // A negative sign may only precede numbers.
              if (isSigned) {
                abort();
              }
              // `true`, `false`, and `null` literals.
              if (source.slice(Index, Index + 4) == "true") {
                Index += 4;
                return true;
              } else if (source.slice(Index, Index + 5) == "false") {
                Index += 5;
                return false;
              } else if (source.slice(Index, Index + 4) == "null") {
                Index += 4;
                return null;
              }
              // Unrecognized token.
              abort();
          }
        }
        // Return the sentinel `$` character if the parser has reached the end
        // of the source string.
        return "$";
      };

      // Internal: Parses a JSON `value` token.
      var get = function (value) {
        var results, hasMembers;
        if (value == "$") {
          // Unexpected end of input.
          abort();
        }
        if (typeof value == "string") {
          if ((charIndexBuggy ? value.charAt(0) : value[0]) == "@") {
            // Remove the sentinel `@` character.
            return value.slice(1);
          }
          // Parse object and array literals.
          if (value == "[") {
            // Parses a JSON array, returning a new JavaScript array.
            results = [];
            for (;; hasMembers || (hasMembers = true)) {
              value = lex();
              // A closing square bracket marks the end of the array literal.
              if (value == "]") {
                break;
              }
              // If the array literal contains elements, the current token
              // should be a comma separating the previous element from the
              // next.
              if (hasMembers) {
                if (value == ",") {
                  value = lex();
                  if (value == "]") {
                    // Unexpected trailing `,` in array literal.
                    abort();
                  }
                } else {
                  // A `,` must separate each array element.
                  abort();
                }
              }
              // Elisions and leading commas are not permitted.
              if (value == ",") {
                abort();
              }
              results.push(get(value));
            }
            return results;
          } else if (value == "{") {
            // Parses a JSON object, returning a new JavaScript object.
            results = {};
            for (;; hasMembers || (hasMembers = true)) {
              value = lex();
              // A closing curly brace marks the end of the object literal.
              if (value == "}") {
                break;
              }
              // If the object literal contains members, the current token
              // should be a comma separator.
              if (hasMembers) {
                if (value == ",") {
                  value = lex();
                  if (value == "}") {
                    // Unexpected trailing `,` in object literal.
                    abort();
                  }
                } else {
                  // A `,` must separate each object member.
                  abort();
                }
              }
              // Leading commas are not permitted, object property names must be
              // double-quoted strings, and a `:` must separate each property
              // name and value.
              if (value == "," || typeof value != "string" || (charIndexBuggy ? value.charAt(0) : value[0]) != "@" || lex() != ":") {
                abort();
              }
              results[value.slice(1)] = get(lex());
            }
            return results;
          }
          // Unexpected token encountered.
          abort();
        }
        return value;
      };

      // Internal: Updates a traversed object member.
      var update = function(source, property, callback) {
        var element = walk(source, property, callback);
        if (element === undef) {
          delete source[property];
        } else {
          source[property] = element;
        }
      };

      // Internal: Recursively traverses a parsed JSON object, invoking the
      // `callback` function for each value. This is an implementation of the
      // `Walk(holder, name)` operation defined in ES 5.1 section 15.12.2.
      var walk = function (source, property, callback) {
        var value = source[property], length;
        if (typeof value == "object" && value) {
          // `forEach` can't be used to traverse an array in Opera <= 8.54
          // because its `Object#hasOwnProperty` implementation returns `false`
          // for array indices (e.g., `![1, 2, 3].hasOwnProperty("0")`).
          if (getClass.call(value) == arrayClass) {
            for (length = value.length; length--;) {
              update(value, length, callback);
            }
          } else {
            forEach(value, function (property) {
              update(value, property, callback);
            });
          }
        }
        return callback.call(source, property, value);
      };

      // Public: `JSON.parse`. See ES 5.1 section 15.12.2.
      JSON3.parse = function (source, callback) {
        var result, value;
        Index = 0;
        Source = "" + source;
        result = get(lex());
        // If a JSON string contains multiple tokens, it is invalid.
        if (lex() != "$") {
          abort();
        }
        // Reset the parser state.
        Index = Source = null;
        return callback && getClass.call(callback) == functionClass ? walk((value = {}, value[""] = result, value), "", callback) : result;
      };
    }
  }

  // Export for asynchronous module loaders.
  if (isLoader) {
    define(function () {
      return JSON3;
    });
  }
}(this));

},{}],216:[function(require,module,exports){
module.exports = toArray

function toArray(list, index) {
    var array = []

    index = index || 0

    for (var i = index || 0; i < list.length; i++) {
        array[i - index] = list[i]
    }

    return array
}

},{}],217:[function(require,module,exports){
/** @jsx React.DOM */
var React = require('react');
var GamerService = require("../client/GameService.js");

var GameView = React.createClass({displayName: "GameView",
	getInitialState: function() {
    	return {points: ""};
  	},
  	onChangePoints: function(event) {
		this.setState({points: event.target.value});
	},
	onSubmitPoints: function() {
		GamerService.addPoints(this.props.gameID, this.props.player.id, this.state.points, didSendPoints);
		var self = this;
		function didSendPoints(err, player) {
			self.props.player = player;
			self.state.points = "";
			self.forceUpdate();	
		}
	},
	render: function() {
		var pointList = this.props.player.points.map(function(point){ return React.createElement("li", null, point)});
		return (
			React.createElement("div", {className: "player-row"}, 
			React.createElement("h3", null, this.props.player.name + " - Punkte: " + this.props.player.pointsAll), 
			React.createElement("input", {type: "button", onClick: this.onSubmitPoints, value: "Eintragen"}), 
			React.createElement("input", {type: "number", value: this.state.points, onChange: this.onChangePoints, placeholder: "Neue Punkte"}), 
			
			React.createElement("ul", null, pointList)
			)
		)
		
	}
});


module.exports = GameView;

},{"../client/GameService.js":2,"react":166}],218:[function(require,module,exports){
/** @jsx React.DOM */
var React = require('react');
var PlayerRow = require("./PlayerRow.js");
var SocketClient = require("socket.io-client");
var ChartistGraph = require('react-chartist');


var Chart = React.createClass({displayName: "Chart",
	render: function() {
		console.log(this.props.game)
		var simpleLineChartData = {
			  labels: ['Monday', 'Tuesday'],
			  series: [
			    [12, 9]]
			}
     return(
    	React.createElement("div", null, 
        React.createElement(ChartistGraph, {data: simpleLineChartData, type: '.ct-chart'})
		))
		
	}
});

var ScoreBoard = React.createClass({displayName: "ScoreBoard",
	getInitialState: function() {
		if(!this.props.server) {
			var socket = SocketClient.connect("///" + this.props.game.name);
			socket.on("update", this.updateGame);
		}
				
    	return {socket: null};
  	},
  	updateGame: function(game) {
	  	this.props.game = game;
	  	this.forceUpdate();
  	},
  	players: function() {
	  	var players = [];
	  	for(var key in this.props.game.players) {
		    var player = this.props.game.players[key];
		    players.push(player);
		}
		
		return players;
  	},
	render: function() {
		var playersDOM = []
		var players = this.players();
		var length = players.length;
		var i;
		for(i = 0; i < length; i++) {
			var player = players[i];
			playersDOM.push(React.createElement("li", null, React.createElement("div", null, player.name), React.createElement("div", null, player.pointsAll)))
		}
		
		return (
			React.createElement("div", {className: "game-view"}, 
				React.createElement("h2", null, "Spiel: " + this.props.game.name), 
				playersDOM, 
				React.createElement(Chart, {game:  this.props.game}), 
				React.createElement("a", {href: "/game?id=" + this.props.game.name}, "Spiel")
			)
		)
		
	}
});


module.exports = ScoreBoard;

},{"./PlayerRow.js":217,"react":166,"react-chartist":11,"socket.io-client":167}]},{},[1]);
