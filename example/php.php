<?php
require dirname ( __FILE__ ) . '/../php/obj_skv_helper.php';

$obj = json_decode ( file_get_contents ( dirname ( __FILE__ ) . '/obj.json' ) );
echo 'original obj:', "\n";
print_r ( $obj );

$simplekv = ObjSkvHelper::obj2simplekv ( $obj );
echo 'simplekv:', "\n";
print_r ( $simplekv );

$newobj = ObjSkvHelper::simplekv2obj ( $simplekv );
echo 'newobj converted back:', "\n";
print_r ( $newobj );

echo 'obj equals newobj: ', "\n";
echo 'obj: ', json_encode ( $obj ), "\n";
echo 'nbj: ', json_encode ( $newobj ), "\n";
var_dump ( $newobj == $obj );