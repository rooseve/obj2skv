var objSkvHelper = require('../js/obj_skv_helper.js');

var fs = require('fs');
var file = __dirname + '/obj.json';

fs.readFile(file, 'utf8', function(err, data) {

	obj = JSON.parse(data);

	console.log('original obj:\n', obj, '\n');

	var simplekv = objSkvHelper.obj2simplekv(obj);
	console.log('simplekv:\n', simplekv, '\n');

	var newobj = objSkvHelper.simplekv2obj(simplekv);
	console.log('newobj converted back:\n', newobj, '\n');

	console.log('obj equals newobj: ', JSON.stringify(obj) == JSON.stringify(newobj));
});
