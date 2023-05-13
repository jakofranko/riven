import Riven from '../riven.js';
import Node from '../node.js';
import Print from '../nodes/print.js';
import Value from '../nodes/value.js';
import Add from '../nodes/add.js';
import Concat from '../nodes/concat.js';

const RIVEN = new Riven();
const Ø = RIVEN.selector.bind(RIVEN);

Ø("bang").create({x:4,y:8}, Node);

// Int nodes
Ø("add").create({x:14,y:4}, Add);
Ø("int1").create({x:12,y:8}, Value, 3);
Ø("int2").create({x:16,y:8}, Value, 5);
Ø("print_int").create({x:20,y:4}, Print);

// Str nodes
Ø("concat").create({x:14,y:12}, Concat);
Ø("str1").create({x:12,y:16}, Value, "hello");
Ø("str2").create({x:16,y:16}, Value, "world");
Ø("print_str").create({x:20,y:12}, Print);

Ø("bang").connect(["add","concat"]);
Ø("add").connect(["print_int"]);
Ø("add").syphon(["int1","int2"]);
Ø("concat").syphon(["str1","str2"]);
Ø("concat").connect(["print_str"]);


Ø("bang").bang();

RIVEN.graph();
