obj2skv
============

### What are "obj" and "skv" mean?

**obj** just means **object**, in json, it's like:

	{ 	
		a: 1, 
		b: {
			c: [1, 2]
		}
	}

**skv** means **simple key value** pairs, or simple hash object, like this:

	{
		k1: v1,
		k2: v2,
		k3: v3
	}

The key point of skv is "**simple**" key/value type, keys are just strings, values are just simple type values, e.g. string, number, no object or array allowed.

obj2skv provides two-way conversion functions, which convert object to skv and back.

###Why useful?

Given an object like this:

	{
		a: 1,
		b: [ 'x', 1, 2.4, 100, true ],
		c: { 
			d: { f: 'hello' },
			z: 'hi' 
		} 
	}

How to save it in Mysql? As we know, Mysql is a relational database, it saves data in **2-dimensional** tables, but an arbitrary object is not 2-dimensional restricted, it's **n-dimensional**. By converting an object to skv, it's can be saved in 2 columns, one for key, and one for value.

###How it works?

To reference an value in an object obj, there will be a path of keys, like this:

	obj[k1][k2][k3] = v 

In skv, the keys are joined into a single key, like:

	skv[k1.k2.k3] = v

With an example, Object:

	{ 	
		a: 1, 
		b: {
			c: "str"
		}
	}

Convert to skv, which will be like: 

	{ 
		'a': 1, 
		'b.c': "str"
	}


#####What about column type?

If to save the skv as 2 columns in mysql, one for key, one for value, the column type should be the same. Keys are all strings, no problem, but the values can be string, number...To keep the type information, and make the values got the same type, some prefixes are added, and values all become strings, for example, 


- Int 1 becomes "I1", with prefix "I" to identify int type
- String "hello" becomes "Shello", with prefix "S" to identify string type


###A real example

Object: 

	{
	    "a":null,
	    "b":[
	        "x",
	        1,
	        2.4,
	        1e2,
	        true
	    ],
	    "c":{
	        "d":{
	            "f":"hello"
	        },
	        "z":"hi"
	    }
	}

Convert to skv:

	{ 
		'$a': 'N', //N just means null type
		'$b.@0': 'Sx', //key prefix '@' means it's an element of array
		'$b.@1': 'I1', //I means int type
		'$b.@2': 'F2.4', //F means float type
		'$b.@3': 'I100',
		'$b.@4': 'B1', //B means boolean type
		'$c.$d.$f': 'Shello', //S means string type
		'$c.$z': 'Shi'
	}

### How to use?

obj2skv got JS(works on Browser/Node) and PHP version

####Browser

	<script src="/js/obj_skv_helper.js"></script>

	<script>
	//convert an object to skv
	var simplekv = objSkvHelper.obj2simplekv(obj);

	//convert skv back to object
	var newobj = objSkvHelper.simplekv2obj(simplekv);
	</script>

####Node

	var objSkvHelper = require('/js/obj_skv_helper.js');
	
	//convert an object to skv
	var simplekv = objSkvHelper.obj2simplekv(obj);

	//convert skv back to object
	var newobj = objSkvHelper.simplekv2obj(simplekv);

####PHP

	require '/php/obj_skv_helper.php';

	//convert an object to skv
	$simplekv = ObjSkvHelper::obj2simplekv ( $obj );
	
	//convert skv back to object
	$newobj = ObjSkvHelper::simplekv2obj ( $simplekv );
