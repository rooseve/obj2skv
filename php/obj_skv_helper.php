<?php
class ObjSkvHelper
{
	
	//divider for keys, this should never appear in the key itself
	const KDivider = '.';
	
	//key prefix to identify the value is an element of array
	const KTypeArray = '@';
	
	//normal key prefix
	const KTypeObj = '$';
	
	//value prefix if the final simple value is string
	const VTypeString = 'S';
	
	//value prefix if the final simple value is integer
	const VTypeInt = 'I';
	
	//value prefix if the final simple value is float
	const VTypeFloat = 'F';
	
	//value prefix if the final simple value is boolean
	const VTypeBoolean = 'B';
	
	//value prefix if the final simple value is null
	const VTypeNull = 'N';

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
	 * Prefixes are added to identify the value type(e.g. "F" means float)
	 * and parent element type(e.g. "@" means array)
	 *
	 * Keys and values are all simple strings, so you can save these as
	 * multiple rows in db, like mysql
	 */
	public static function obj2simplekv($arr)
	{
		$simplekv = array ();
		
		$isArray = is_array ( $arr );
		
		$isObject = $isArray ? false : is_object ( $arr );
		
		if (! $isArray && ! $isObject)
			throw new Exception ( 'An array or object supposed' );
		
		if ($isObject)
			$arr = get_object_vars ( $arr );
		
		foreach ( $arr as $k => $v )
		{
			$attrKey = ($isArray ? self::KTypeArray : self::KTypeObj) . $k;
			
			if (stripos ( $attrKey, self::KDivider ) !== false)
			{
				throw new Exception ( 'obj key could not contains the divider: ' . self::KDivider );
			}
			
			if (is_array ( $v ) || is_object ( $v ))
			{
				$tmp_kvs = self::obj2simplekv ( $v );
				
				foreach ( $tmp_kvs as $ck => $cv )
				{
					$simplekv [$attrKey . self::KDivider . $ck] = $cv;
				}
			}
			else
			{
				if (is_string ( $v ))
				{
					$attrVal = self::VTypeString . $v;
				}
				else if (is_int ( $v ))
				{
					$attrVal = self::VTypeInt . $v;
				}
				else if (is_float ( $v ))
				{
					$attrVal = self::VTypeFloat . $v;
				}
				else if (is_bool ( $v ))
				{
					$attrVal = self::VTypeBoolean . ($v ? 1 : 0);
				}
				else if (is_null ( $v ))
				{
					$attrVal = self::VTypeNull;
				}
				else
				{
					$attrVal = false;
				}
				
				if ($attrVal !== false)
					$simplekv [$attrKey] = $attrVal;
			}
		}
		
		return $simplekv;
	}

	/**
	 * convert the key value pairs back to object
	 *
	 * @param simpkv,
	 *            the value returned by the obj2simplekv function
	 *
	 * @returns obj
	 */
	public static function simplekv2obj($simplekv)
	{
		$isArray = is_array ( $simplekv );
		
		$isObject = $isArray ? false : is_object ( $simplekv );
		
		if (! $isArray && ! $isObject)
			throw new Exception ( 'An array or object supposed' );
		
		if ($isObject)
			$simplekv = get_object_vars ( $simplekv );
		
		$arr = array (
				'_' => null 
		);
		
		$tlen = strlen ( self::VTypeString );
		
		foreach ( $simplekv as $k => $v )
		{
			$mks = explode ( self::KDivider, $k );
			
			$pre_ck = '_';
			$pre_obj = &$arr;
			
			foreach ( $mks as $ck )
			{
				
				$isArr = $ck [0] == self::KTypeArray;
				
				$cur_ck = substr ( $ck, 1 );
				
				$current = self::getObjVal ( $pre_obj, $pre_ck );
				
				if (! $current)
				{
					self::setObjVal ( $pre_obj, $pre_ck, $isArr ? array () : new stdClass () );
				}
				
				$pre_obj = &self::getObjValRef ( $pre_obj, $pre_ck );
				
				$pre_ck = $cur_ck;
			}
			
			$rawVal = substr ( $v, $tlen );
			
			switch (substr ( $v, 0, $tlen ))
			{
				case self::VTypeString :
					$val = $rawVal;
					break;
				
				case self::VTypeInt :
					$val = intval ( $rawVal );
					break;
				
				case self::VTypeFloat :
					$val = floatval ( $rawVal );
					break;
				
				case self::VTypeBoolean :
					$val = $rawVal == '1' ? true : false;
					break;
				
				case self::VTypeNull :
					$val = null;
					break;
				
				default :
					throw new Exception ( 'Unknown value: ' . $v );
				//val = false;
				//break;
			}
			
			self::setObjVal ( $pre_obj, $pre_ck, $val );
			
			unset ( $pre_obj );
		}
		
		return $arr ['_'];
	}

	private static function setObjVal(&$obj, $k, $v)
	{
		if (is_array ( $obj ))
			$obj [$k] = $v;
		else
			$obj->$k = $v;
	}

	private static function &getObjValRef(&$obj, $k)
	{
		if (is_array ( $obj ))
			return $obj [$k];
		else
			return $obj->$k;
	}

	private static function getObjVal(&$obj, $k)
	{
		if (is_array ( $obj ))
			return isset ( $obj [$k] ) ? $obj [$k] : null;
		else
			return isset ( $obj->$k ) ? $obj->$k : null;
	}

}
