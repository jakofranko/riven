import Riven from '../riven.js';

const { Ø, graph, lib } = new Riven();
const {
    Node,
    Add,
    Value,
    Print,
    Subtract,
    Concat
} = lib;

Ø("bang").create({x:4,y:8}, Node);

// Int nodes
Ø("add").create({ x: 14, y: 4 }, Add);
Ø("int1").create({ x: 12, y: 8 }, Value, 3);
Ø("int2").create({ x: 16, y: 8 }, Value, 5);
Ø("print_int").create({ x: 20, y: 4 }, Print);
Ø("add2").create({ x: 26, y: 4 }, Add);
Ø("int3").create({ x: 26, y: 8 }, Value, 22);
Ø("print_int2").create({ x: 32, y: 8 }, Print);
Ø("sub").create({ x: 36, y: 8 }, Subtract);
Ø("int4").create({ x: 36, y: 12 }, Value, 4);
Ø("print_int3").create({ x: 40, y: 8 }, Print);

// Str nodes
Ø("concat").create({x:14,y:12}, Concat);
Ø("str1").create({x:12,y:16}, Value, "hello");
Ø("str2").create({x:16,y:16}, Value, "world");
Ø("print_str").create({x:20,y:12}, Print);

Ø("bang").connect(["add","concat"]);
Ø("add").connect(["print_int"]);
Ø("add").syphon(["int1","int2"]);
Ø("print_int").connect(["add2"]);
Ø("add2").syphon(["int3"]);
Ø("add2").connect(["print_int2"]);
Ø("print_int2").connect(["sub"]);
Ø("sub").connect(["print_int3"]);
Ø("sub").syphon(["int4"]);
Ø("add2").connect(["print_int2"]);
Ø("concat").syphon(["str1","str2"]);
Ø("concat").connect(["print_str"]);


Ø("bang").bang();

graph();
