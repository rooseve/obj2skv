obj2skv
============

### What are "*obj*" and "*skv*" mean?

**obj** just means **object**, like:

	{ 	
		a: 1, 
		b: {
			c: [1, 2]
		}
	}

**skv** means **simple key value** pairs, like:

	{
		k1: v1,
		k2: v2,
		k3: v3
	}

where k1,k2... are just strings, v1,v2..are just simple type values, e.g. string, number.

obj2skv provides two-way conversion functions, which convert object to skv and back.

### Why useful?

How to save an object in mysql? For example this object:

	{
		a: 1,
		b: [ 'x', 1, 2.4, 100, true ],
		c: { 
			d: { f: 'hello' },
			z: 'hi' 
		} 
	}


Mysql is a relational database, it saves data in **2-dimensional** tables, but an arbitrary object is not 2-dimensional restricted, it's **n-dimensional**. By convert an object to skv, it's can be saved in 2 columns, one for key, and one for value.


###How it works?

To reference an value in an object obj, we need the key path, like:

	obj[k1][k2][k3] = v 

Skv just concat the path to a single key, like:

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

If to save the skv as 2 columns in mysql, one for key, one for value, the column type should be the same. Keys are all strings, no problem, but the values can be string, number...To keep the type information, and make the values got the same type, some prefixes are add to the value, for example, 


- 1 becomes "I1", with prefix "I" to identify int type
- "hello" becomes "Shello", with prefix "S" to identify string type


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

