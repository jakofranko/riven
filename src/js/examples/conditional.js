import Riven from '../riven.js';
import Value from '../nodes/value.js';
import Equals from '../nodes/equals.js';
import Console from '../nodes/console.js';
import Bang from '../nodes/bang.js';

const RIVEN = new Riven();
const Ø = RIVEN.selector.bind(RIVEN);

Ø("val1").create({x:4, y:10}, Value, "blue");
Ø("equals").create({x:10, y:10}, Equals);
Ø("console").create({x:26, y:10}, Console);

Ø("red").create({x:18, y:4}, Bang);
Ø("green").create({x:18, y:8}, Bang);
Ø("blue").create({x:18, y:12}, Bang);
Ø("else").create({x:18, y:16}, Bang);

Ø("val1").connect("equals");
Ø("equals").connect(["red", "green", "blue", "else"]);
Ø("red").connect("console");
Ø("green").connect("console");
Ø("blue").connect("console");
Ø("else").connect("console");


Ø("val1").send("blue");

RIVEN.graph();
