import Riven from '../riven.js';
import Node from '../node.js';
import Print from '../nodes/print.js';
import Value from '../nodes/value.js';
import Add from '../nodes/add.js';
import Mesh from '../nodes/mesh.js';

const RIVEN = new Riven();
const Ø = RIVEN.selector.bind(RIVEN);

Ø("bang").create({x:2,y:2}, Node);
Ø("mesh").create({x:8,y:0}, Mesh, [
    Ø("add").create({x:2,y:0}, Add),
    Ø("val1").create({x:0,y:4}, Value, 5),
    Ø("val2").create({x:4,y:4}, Value, 10),
], "add", "add");
Ø("output").create({x:26,y:6}, Print);
Ø("add").syphon(["val1","val2"]);
Ø("bang").connect("mesh");
Ø("mesh").connect("output");

Ø("bang").send("foo bar");
RIVEN.graph();
