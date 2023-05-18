# Ø(Riven)

[Riven](http://wiki.xxiivv.com/Riven) is a bare minimum **flow-based programming framework** (eg: [math](https://rawgit.com/XXIIVV/Riven/master/example.math.html) & [conditional](https://rawgit.com/XXIIVV/Riven/master/example.conditional.html)). Nodes have 2 ways of communicating with each other, one is a `send/receive` pattern, the other, a `request/answer` pattern. Despite its minimal toolset, it can be expanded into a complete [web framework](http://wiki.xxiivv.com/riven.html).

<img src='https://raw.githubusercontent.com/XXIIVV/Riven/master/PREVIEW.png' width="600"/>

## Usage

If you would like to use Riven directly in your browser as-is, simply download `riven.js`, `riven.css`, and `assets/` from the root of this repo into your project, and include those files in the head of your html:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <link rel="stylesheet" type="text/css" href="riven.css"/>
  <script src="riven.js"></script>
  <title>Riven — Math</title>
</head>
<body>
    <script>
        const { Ø, graph, lib } = new Riven();

        <!-- Your Riven application code can go here -->
    </script>
</body>
</html>
```

This will give you access to the `Ø` selector, the `graph` function which will visualize your Riven application, and `lib`, which right now contains the built-in Node varieties. Check out the [examples in the public](https://github.com/jakofranko/riven/tree/master/public) for some Riven application examples. Details on these elements are below.

### As an npm package

This is not implemented yet, but eventually you will be able to install Riven via npm, and then could use it in your app via `import Riven from 'riven';`, and so could be used in modern JavaScript workflows.

## The Ø Selector

You are given a node selection tool `Ø()`. You can type this character with `alt+shift+O`(Alt +0216). If you are on Windows, or cannot easily type this character, you can rename it via JavaScript's destructuring syntax: `const { Ø: R } = new Riven();`, and then use it like `R('selector')`.

### Create a node

`Ø("template").create({ x: 2, y: 2 })` will create a default Node named **template** at x,y coordinates 2,2 (used for graphing).

### Select a node

`Ø("template")` will select the **template** node.

### Connect a node

`Ø("template").connect("parser")` will connect the **template** node to the **parser** node.

You can also connect to **multiple nodes** at once with `Ø("template").connect(["parser","console"])`. The `Ø("template").bind("parser")` will create both a **connection and a syphon** between the 2 nodes.

## Riven flow-based communication

Each of the methods below are available on all nodes.

### `.send()`

`Ø("template").send("hello")` will send *"hello"* to all receiving connected nodes.

### `.receive()`

`Ø("template").receive(q) => {}`, method is triggered by send().

### `.request()`

`Ø("template").request("cake")` will request *"cake"* from all answering connected nodes.

### `.answer()`

`Ø("template").answer("cake")`, method is triggered by request().

### `.bang()`

`Ø("template").bang()`, is a convenience method equivalent to `.send(true)`, will send *true* to all receiving connected nodes, often used to start the application.

### `.signal()`

Looks for a connected node(receiving/answering) with the parameter id, `Ø("template").signal("parser").send("hello")`. Will send *"hello"*, directly to the *parser* node.

## Built-in Node types

These nodes are all provided in Riven's `lib`, and are conventionally accessed like
```js
const { Ø, lib } = new Riven();
const { NodeType } = lib;

Ø('example').create({ x: 4, y: 4 }, NodeType);
```

### Add

The Add node will sum values that are connected to it. If it is sent a payload, it will fire a `request` call to get all the values connected to it, and sum the values, and then `send` the result to nodes it is connected to. If is `request`ed, it will `answer` with the summed values.

If an Add node is sent a numeric payload, it will add that number to the sum.

```js
const {
    Node,
    Add,
    Value,
    Print
} = lib;

// Create nodes
Ø("bang").create({ x: 4, y: 8}, Node);
Ø("add").create({ x: 14, y: 4 }, Add);
Ø("int1").create({ x: 12, y: 8 }, Value, 3);
Ø("int2").create({ x: 16, y: 8 }, Value, 5);
Ø("print_int").create({ x: 20, y: 4 }, Print);

// Connect nodes
Ø("bang").connect(["add"]);
Ø("add").connect(["print_int"]);
Ø("add").syphon(["int1","int2"]);
Ø("print_int").connect(["add2"]);

// Start
Ø("bang").bang(); // Print node receives 8
Ø("bang").send(10); // Print node receives 18

const result = Ø("add").request(); // returns 8
```

Note: Values that are desired to be summed are connected to the Add node via the `syphon` method.

### Subtract

Almost identical to the Add node, except it returns the difference of the gathered values.

```js
const {
    Node,
    Subtract,
    Value,
    Print
} = lib;

// Create nodes
Ø("bang").create({ x: 4, y: 8}, Node);
Ø("sub").create({ x: 14, y: 4 }, Subtract);
Ø("int1").create({ x: 12, y: 8 }, Value, 3);
Ø("int2").create({ x: 16, y: 8 }, Value, 5);
Ø("print_int").create({ x: 20, y: 4 }, Print);

// Connect nodes
Ø("bang").connect(["sub"]);
Ø("sub").connect(["print_int"]);
Ø("sub").syphon(["int1","int2"]);
Ø("print_int").connect(["add2"]);

// Start
Ø("bang").bang(); // Print node receives -2
Ø("bang").send(10); // Print node receives 3

const result = Ø("add").request(); // returns -2
```

Note: with this node, the order that the Value nodes are `syphon`ed matters, as it would with normal subtraction.

### Concat

This node will concat string values together, much like the Add node. When a `send` method is sent to a node that a Concat node is connected to, it will pass a concatination of the string values it syphons to nodes the Concat node is connected to.

```js
const {
    Node,
    Add,
    Value,
    Print,
    Subtract,
    Concat
} = lib;

// Create nodes
Ø("bang").create({x:4,y:8}, Node);
Ø("concat").create({x:14,y:12}, Concat);
Ø("str1").create({x:12,y:16}, Value, "hello");
Ø("str2").create({x:16,y:16}, Value, "world");
Ø("print_str").create({x:20,y:12}, Print);

Ø("bang").connect(["concat"]);
Ø("concat").syphon(["str1","str2"]);
Ø("concat").connect(["print_str"]);

Ø("bang").bang(); // Print node receives "hello world"
```

Note: this node only has a `receive` method

### Value

This node simply holds a single value. It is most often used by being connected via `syphon` to Nodes like Add, Subtract, and Concat that will opperate on them, but don't hold values themselves. See examples above for usage.

### Equals

This node will look for a node with a name equal to the payload. If it does not find one, it will attempt to use a node connected to it named `else`. It will call the `receive` function of the node it finds.

See [the conditional example](https://github.com/jakofranko/riven/blob/master/public/example.conditional.html) for how this node can be used.

### Bang

This is a debug/display node that simply changes it's label by appending `(bang!)` to it if it gets called in the signal flow.

### Console

This is a debug/display node that logs the ID and payload to the console.

### Print

This is a debug/display node that sets its label to the payload sent to it, and then sends the same payload along to any nodes connected to it. It is used extensively in all the examples.

### Mesh

You can group nodes into scopes with `.mesh(pos,[nodes])` to visually group the nodes into a single element that can be moved as one.

```
Ø("template").mesh({x:2,y:2},[
  Ø("parser").create({x:1,y:2}),
  Ø("header").create({x:2,y:3})
])
```

## How to create your own custom Node types

TODO

# That's it!

This framework does nothing else, but it does this well.

Enjoy.

# Note about changes since 2023

@jakofranko's fork of this package seeks to implement a few modernizations, optimizations, improvements, and clarifications while keeping the original spirit of Riven front of mind i.e., to be a simple, pure JavaScript library that does one thing and does it well, without relying on external packages to use. A couple of concessions will be made in order for this to become reusable, but hopefully these can be forgiven.
