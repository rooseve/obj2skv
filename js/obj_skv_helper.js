(function(define, global) {

	'use strict';

	define(function(require) {

		var consts = {
			//divider for keys, this should never appear in the key itself
			KDivider : '.',

			//key prefix to identify the value is an element of array
			KTypeArray : '@',

			//normal key prefix
			KTypeObj : '$',

			//value prefix if the final simple value is string
			VTypeString : 'S',

			//value prefix if the final simple value is integer
			VTypeInt : 'I',

			//value prefix if the final simple value is float
			VTypeFloat : 'F',

			//value prefix if the final simple value is boolean
			VTypeBoolean : 'B',

			//value prefix if the final simple value is null
			VTypeNull : 'N'
		};

		/**
		 * Given an object, e.g.
		 * 
		 * <code>
		 * {
		 * 		a: 1,
		 *		b: [ 'x', 1, 2.4, 100, true ],
		 *		c: { 
		 *				d: { f: 'hello' },
		 *				z: 'hi' 
		 *		} 
		 *	}
		 * </code>
		 * 
		 * Convert it to simple key value pairs, like this:
		 * 
		 * <code>
		 *   { 
		 *   	'$a': 'I1',
		 *	  	'$b.@0': 'Sx',
		 *	 	'$b.@1': 'I1',
		 *	  	'$b.@2': 'F2.4',
		 *	 	'$b.@3': 'I100',
		 *	 	'$b.@4': 'B1',
		 *	 	'$c.$d.$f': 'Shello',
		 *  	'$c.$z': 'Shi'
		 *	  }
		 * </code>
		 * 
		 * Prefixes are added to identify the value type(e.g. "F" means float) and parent element type(e.g. "@" means
		 * array)
		 * 
		 * Keys and values are all simple strings, so you can save these as multiple rows in db, like mysql
		 */
		function obj2simplekv(obj) {

			if (!isObject(obj)) {
				throw new Error('obj supposed to be an object/array');
			}

			var simplekv = {}, nxkv, attrKey, attrVal, isArr = isArray(obj);

			for ( var k in obj) {

				if (!obj.hasOwnProperty(k))
					continue;

				attrKey = (isArr ? consts.KTypeArray : consts.KTypeObj) + k;

				if (attrKey.indexOf(consts.KDivider) >= 0) {
					throw new Error('obj key could not contains the divider: ' + consts.KDivider);
				}

				if (isObject(obj[k])) {

					//convert recursively
					nxkv = obj2simplekv(obj[k]);

					for ( var nk in nxkv) {
						simplekv[attrKey + consts.KDivider + nk] = nxkv[nk];
					}

				} else {
					//the final simple value

					switch (typeof (obj[k])) {

						case 'string':
							attrVal = consts.VTypeString + obj[k];
							break;

						case 'number':
							attrVal = (obj[k] % 1 ? consts.VTypeFloat : consts.VTypeInt) + obj[k];
							break;

						case 'boolean':
							attrVal = consts.VTypeBoolean + (obj[k] ? 1 : 0);
							break;

						//case 'undefined':
						//case 'object':
						//case 'function':

						case 'object':
							attrVal = consts.VTypeNull;
							break;

						default:
							attrVal = false;
							break;
					}

					if (attrVal !== false)
						simplekv[attrKey] = attrVal;
				}
			}

			return simplekv;
		}

		/**
		 * convert the key value pairs back to object
		 * 
		 * @param simpkv,
		 *            the value returned by the obj2simplekv function
		 * 
		 * @returns obj
		 */
		function simplekv2obj(simpkv) {

			if (!isObject(simpkv)) {
				throw new Error('simpkv supposed to be an object');
			}

			var obj = {
				_ : null
			}, cks, pre_ck, cur_ck, pre_obj, isArr, rawVal, val, tlen = consts.VTypeString.length;

			for ( var mk in simpkv) {

				cks = mk.split(consts.KDivider);

				pre_ck = '_';
				pre_obj = obj;

				for ( var i = 0; i < cks.length; i++) {

					isArr = cks[i][0] == consts.KTypeArray;

					cur_ck = cks[i].substr(1);

					if (isArr)
						cur_ck = parseInt(cur_ck, 10);

					if (!pre_obj[pre_ck]) {
						pre_obj[pre_ck] = isArr ? [] : {};
					}

					pre_obj = pre_obj[pre_ck];

					pre_ck = cur_ck;
				}

				rawVal = simpkv[mk].substr(tlen);

				switch (simpkv[mk].substr(0, tlen)) {
					case consts.VTypeString:
						val = rawVal;
						break;

					case consts.VTypeInt:
						val = parseInt(rawVal, 10);
						break;

					case consts.VTypeFloat:
						val = parseFloat(rawVal);
						break;

					case consts.VTypeBoolean:
						val = rawVal == '1' ? true : false;
						break;

					case consts.VTypeNull:
						val = null;
						break;

					default:
						throw new Error('Unknown value: ', simpkv[mk]);
						//val = false;
						//break;
				}
				pre_obj[pre_ck] = val;
			}

			return obj._;
		}

		function isArray(obj) {

			return Array.isArray ? Array.isArray(obj) : Object.prototype.call(obj) == '[object Array]';
		}

		function isObject(value) {

			return value !== null && typeof value === 'object';
		}

		return {
			obj2simplekv : obj2simplekv,
			simplekv2obj : simplekv2obj
		};

	});

})(typeof define === 'function' && define.amd ? define : function(name, deps, factory) {

	var isNodeSvr = typeof module != 'undefined' && module.exports;

	if (isNodeSvr) {

		var mfunc = null, alArgs = [ name, deps, factory ];

		//find the right factory func, as define has multiple args options
		for ( var i = 0, len = alArgs.length; i < len; i++) {
			if (typeof (alArgs[i]) == 'function') {
				mfunc = alArgs[i];
				break;
			}
		}

		module.exports = mfunc(require);

	} else if (typeof (window) != 'undefined') {

		window.objSkvHelper = factory(void (0));
	}

}, this);
