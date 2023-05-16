(() => {
  // src/js/constants.js
  var PORT_TYPES = {
    default: 0,
    input: 1,
    output: 2,
    request: 3,
    answer: 4,
    entry: 5,
    exit: 6
  };

  // src/js/port.js
  function Port(host, id, type = PORT_TYPES.default) {
    this.host = host;
    this.id = id;
    this.type = type;
    this.routes = [];
    this.connect = function(port) {
      if (!port) {
        console.warn(`Unknown port from: ${this.host.id}`);
        return;
      }
      this.routes.push(port);
    };
  }

  // src/js/node.js
  function Node(id, riven, rect = { x: 0, y: 0, w: 2, h: 2 }) {
    this.id = id;
    this.rect = rect;
    this.riven = riven;
    this.parent = null;
    this.children = [];
    this.label = id;
    this.name = this.constructor.name.toLowerCase();
    this.glyph = "M155,65 A90,90 0 0,1 245,155 A90,90 0 0,1 155,245 A90,90 0 0,1 65,155 A90,90 0 0,1 155,65 Z";
    this.ports = {
      input: new Port(this, "in", PORT_TYPES.input),
      output: new Port(this, "out", PORT_TYPES.output),
      answer: new Port(this, "answer", PORT_TYPES.answer),
      request: new Port(this, "request", PORT_TYPES.request)
    };
    this.create = function(pos = { x: 0, y: 0 }, Type, ...params) {
      if (!Type) {
        console.warn(`Unknown NodeType for #${this.id}`);
        return this;
      }
      this.rect = {
        ...this.rect,
        ...pos
      };
      const node = new Type(this.id, this.riven, this.rect, ...params);
      this.riven.add(node);
      return node;
    };
    this.connect = function(q, syphon) {
      if (q instanceof Array) {
        for (const id2 in q) {
          this.connect(q[id2], syphon);
        }
      } else if (this.riven.\u00D8(q)) {
        const port = syphon ? this.ports.request : this.ports.output;
        const target = syphon ? this.riven.\u00D8(q).ports.answer : this.riven.\u00D8(q).ports.input;
        if (!port) {
          console.warn(`Unknown: ${q}`);
          return;
        }
        port.connect(target);
      } else {
        console.warn(`Unknown ${q}`);
      }
    };
    this.syphon = function(q) {
      this.connect(q, true);
    };
    this.bind = function(q) {
      this.connect(q);
      this.syphon(q);
    };
    this.send = function(payload) {
      for (const routeId in this.ports.output.routes) {
        const route = this.ports.output.routes[routeId];
        if (!route) {
          continue;
        }
        route.host.receive(payload, this, route);
      }
    };
    this.receive = function(q, origin, route) {
      const port = this.ports.output;
      for (const routeId in port.routes) {
        const r = port.routes[routeId];
        if (r) {
          route.host.receive(q, origin, route);
        }
      }
    };
    this.bang = function() {
      this.send(true);
    };
    this.request = function(q) {
      const payload = {};
      for (const routeId in this.ports.request.routes) {
        const route = this.ports.request.routes[routeId];
        if (!route) {
          continue;
        }
        const answer = route.host.answer(q, this, route);
        if (!answer) {
          continue;
        }
        payload[route.host.id] = answer;
      }
      return payload;
    };
    this.answer = function(q) {
      return this.request(q);
    };
    this.signal = function(target) {
      for (const portId in this.ports) {
        const port = this.ports[portId];
        for (const routeId in port.routes) {
          const route = port.routes[routeId];
          if (!route || !route.host || route.host.id !== target.toLowerCase()) {
            continue;
          }
          return route.host;
        }
      }
      return null;
    };
  }

  // src/js/nodes/add.js
  function Add(id, riven, rect) {
    Node.call(this, id, riven, rect);
    this.glyph = "M60,60 L60,60 L150,120 L240,120 M60,150 L60,150 L240,150 M60,240 L60,240 L150,180 L240,180";
    this.add = function(initialValue = 0) {
      return Object.values(this.request()).reduce((acc, val) => {
        return acc + val;
      }, initialValue);
    };
    this.receive = function(payload) {
      let p;
      if (typeof payload != "number" && typeof payload != "string") {
        p = null;
      } else {
        p = Number(payload);
      }
      if (Number.isNaN(p)) {
        console.error(`Recieved ${payload} to an Add node, which is not a number`);
        p = null;
      }
      this.send(this.add(p));
    };
    this.answer = function() {
      return this.add();
    };
  }

  // src/js/nodes/subtract.js
  function Subtract(id, riven, rect) {
    Node.call(this, id, riven, rect);
    this.glyph = "M60,150 L60,150 L240,150 M60,180 L60,180 L180,180 M60,120 L60,120 L180,120";
    this.subtract = function(initialValue = 0) {
      return Object.values(this.request()).reduce((acc, val) => {
        return acc - val;
      }, initialValue);
    };
    this.receive = function(payload) {
      let p;
      if (typeof payload != "number" && typeof payload != "string") {
        p = null;
      } else {
        p = Number(payload);
      }
      if (Number.isNaN(p)) {
        console.error(`Recieved ${payload} to an Subtract node, which is not a number`);
        p = null;
      }
      this.send(this.subtract(p));
    };
    this.answer = function() {
      return this.subtract();
    };
  }

  // src/js/nodes/bang.js
  function Bang(id, riven, rect) {
    Node.call(this, id, riven, rect);
    this.glyph = "M60,60 L60,60 L150,120 L240,120 M60,150 L60,150 L240,150 M60,240 L60,240 L150,180 L240,180";
    this.receive = function() {
      this.label = `${this.id}(bang!)`;
      this.send(this);
    };
  }

  // src/js/nodes/concat.js
  function Concat(id, riven, rect) {
    Node.call(this, id, riven, rect);
    this.glyph = "M60,60 L60,60 L150,120 L240,120 M60,150 L60,150 L240,150 M60,240 L60,240 L150,180 L240,180";
    this.receive = function() {
      this.send(Object.values(this.request()).join(" "));
    };
  }

  // src/js/nodes/console.js
  function Console(id, riven, rect) {
    Node.call(this, id, riven, rect);
    this.glyph = "M65,65 L65,65 L245,65 M65,125 L65,125 L245,125 M65,185 L65,185 L245,185 M65,245 L65,245 L245,245 ";
    this.receive = function(q) {
      console.log(this.id, q);
    };
  }

  // src/js/nodes/equals.js
  function Equals(id, riven, rect) {
    Node.call(this, id, riven, rect);
    this.glyph = "M60,60 L60,60 L150,120 L240,120 M60,150 L60,150 L240,150 M60,240 L60,240 L150,180 L240,180";
    this.receive = function(q) {
      (this.signal(q) ? this.signal(q) : this.signal("else")).receive();
    };
  }

  // src/js/nodes/mesh.js
  function Mesh(id, riven, rect, children, entry, exit) {
    Node.call(this, id, riven, rect);
    this.glyph = "";
    this.name = "meshnode";
    this.ports.entry = new Port(this, "entry", PORT_TYPES.entry);
    this.ports.exit = new Port(this, "exit", PORT_TYPES.exit);
    if (riven.network[entry]) {
      this.ports.entry.connect(riven.\u00D8(entry).ports.input);
    }
    if (riven.network[exit]) {
      riven.\u00D8(exit).ports.output.connect(this.ports.exit);
    }
    this.update = function() {
      const bounds = { x: 0, y: 0 };
      for (const id2 in this.children) {
        const node = this.children[id2];
        bounds.x = node.rect.x > bounds.x ? node.rect.x : bounds.x;
        bounds.y = node.rect.y > bounds.y ? node.rect.y : bounds.y;
      }
      this.rect.w = bounds.x + 8;
      this.rect.h = bounds.y + 6;
    };
    for (const cid in children) {
      children[cid].parent = this;
      this.children.push(children[cid]);
      this.update();
    }
    this.receive = function(q, origin, route) {
      if (route.id === "in") {
        this.entry(q, origin, route);
      }
      if (route.id === "exit") {
        this.exit(q, origin, route);
      }
    };
    this.entry = function(q, origin) {
      const port = this.ports.entry;
      for (const routeId in port.routes) {
        const route = port.routes[routeId];
        if (route) {
          route.host.receive(q, origin, route);
        }
      }
    };
    this.exit = function(q, origin) {
      const port = this.ports.output;
      for (const routeId in port.routes) {
        const route = port.routes[routeId];
        if (route) {
          route.host.receive(q, origin, route);
        }
      }
    };
  }

  // src/js/nodes/print.js
  function Print(id, riven, rect) {
    Node.call(this, id, riven, rect);
    this.glyph = "M65,65 L65,65 L245,65 M65,125 L65,125 L245,125 M65,185 L65,185 L245,185 M65,245 L65,245 L245,245 ";
    this.receive = function(q) {
      this.label = `${q}`;
      this.send(q);
    };
  }

  // src/js/nodes/value.js
  function Value(id, riven, rect, val) {
    Node.call(this, id, riven, rect);
    this.glyph = "M60,60 L60,60 L240,60 L240,240 L60,240 Z M240,150 L240,150 L150,150 L150,240";
    this.label = val ? `${this.id}=${val}` : this.id;
    this.answer = function() {
      return val;
    };
  }

  // src/js/riven.js
  function Riven() {
    this.lib = {
      Node,
      Add,
      Subtract,
      Bang,
      Concat,
      Console,
      Equals,
      Mesh,
      Print,
      Value
    };
    this.network = {};
    const self = this;
    this.\u00D8 = function(id) {
      const node = self.network[id];
      if (!node) {
        return new Node(id, self);
      }
      return node;
    };
    this.graph = function() {
      const { network } = self;
      const GRID_SIZE = 20;
      const PORT_TYPES2 = {
        default: 0,
        input: 1,
        output: 2,
        request: 3,
        answer: 4,
        entry: 5,
        exit: 6
      };
      self.el = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      self.el.id = "riven";
      document.body.appendChild(self.el);
      const _routes = Object.keys(network).reduce((acc, val) => {
        return `${acc}${drawRoutes(network[val])}`;
      }, "");
      const _nodes = Object.keys(network).reduce((acc, val) => {
        return `${acc}${drawNode(network[val])}`;
      }, "");
      self.el.innerHTML = `<g id='viewport'><g id='routes'>${_routes}</g><g id='nodes'>${_nodes}</g></g>`;
      function drawRoutes(node) {
        let html = "";
        for (const id in node.ports) {
          const port = node.ports[id];
          for (const routeId in port.routes) {
            const route = port.routes[routeId];
            if (!route) {
              continue;
            }
            html += route ? drawConnection(port, route) : "";
          }
        }
        return html;
      }
      function drawNode(node) {
        const rect = getRect(node);
        return `
        <g class='node ${node.name}' id='node_${node.id}'>
          <rect rx='2' ry='2' x=${rect.x} y=${rect.y - GRID_SIZE / 2} width="${rect.w}" height="${rect.h}" class='${node.children.length === 0 ? "fill" : ""}'/>
          <text x="${rect.x + rect.w / 2 + GRID_SIZE * 0.3}" y="${rect.y + rect.h + GRID_SIZE * 0.2}">${node.label}</text>
          ${drawPorts(node)}
          ${drawGlyph(node)}
        </g>`;
      }
      function drawPorts(node) {
        return Object.keys(node.ports).reduce((acc, val) => {
          return `${acc}${drawPort(node.ports[val])}`;
        }, "");
      }
      function drawGlyph(node) {
        const rect = getRect(node);
        return node.glyph ? `<path class='glyph' transform="translate(${rect.x + GRID_SIZE / 4},${rect.y - GRID_SIZE / 4}) scale(0.1)" d='${node.glyph}'/>` : "";
      }
      function drawPort(port) {
        const pos = port ? getPortPosition(port) : {
          x: 0,
          y: 0
        };
        const r = GRID_SIZE / 6;
        return `<g class='port ${port.id}' id='${port.host.id}_port_${port.id}'><path d='M${pos.x - r},${pos.y} L${pos.x},${pos.y - r} L${pos.x + r},${pos.y} L${pos.x},${pos.y + r} Z'/></g>`;
      }
      function drawConnection(a, b) {
        if (isBidirectional(a.host, b.host)) {
          return a.type !== PORT_TYPES2.output ? drawConnectionBidirectional(a, b) : "";
        }
        if (a.type === PORT_TYPES2.entry) {
          return drawConnectionEntry(a, b);
        }
        if (b.type === PORT_TYPES2.exit) {
          return drawConnectionExit(a, b);
        }
        return a.type === PORT_TYPES2.output || a.type === PORT_TYPES2.output ? drawConnectionOutput(a, b) : drawConnectionRequest(a, b);
      }
      function isBidirectional(a, b) {
        for (const id in a.ports.output.routes) {
          const routeA = a.ports.output.routes[id];
          for (const id2 in a.ports.request.routes) {
            const routeB = a.ports.request.routes[id2];
            if (routeA.host.id === routeB.host.id) {
              return true;
            }
          }
        }
        return false;
      }
      function drawConnectionOutput(a, b) {
        const posA = getPortPosition(a);
        const posB = getPortPosition(b);
        const posM = middle(posA, posB);
        const posC1 = {
          x: (posM.x + (posA.x + GRID_SIZE)) / 2,
          y: posA.y
        };
        const posC2 = {
          x: (posM.x + (posB.x - GRID_SIZE)) / 2,
          y: posB.y
        };
        return `
        <path d="
          M${posA.x},${posA.y} L${posA.x + GRID_SIZE},${posA.y}
          Q${posC1.x},${posC1.y} ${posM.x},${posM.y}
          Q ${posC2.x},${posC2.y} ${posB.x - GRID_SIZE},${posB.y}
          L${posB.x},${posB.y}
        " class='route output'/>`;
      }
      function drawConnectionEntry(a, b) {
        const posA = getPortPosition(a);
        const posB = getPortPosition(b);
        return `
        <path d="
          M${posA.x},${posA.y} L${posA.x + GRID_SIZE},${posA.y}
          L${posA.x + GRID_SIZE},${posA.y}
          L${posA.x + GRID_SIZE},${posB.y}
          L${posB.x},${posB.y}
        " class='route entry'/>`;
      }
      function drawConnectionExit(a, b) {
        const posA = getPortPosition(a);
        const posB = getPortPosition(b);
        return `
        <path d="
          M${posA.x},${posA.y} L${posA.x + GRID_SIZE},${posA.y}
          L${posB.x - GRID_SIZE},${posA.y}
          L${posB.x - GRID_SIZE},${posB.y}
          L${posB.x},${posB.y}
        " class='route exit'/>`;
      }
      function drawConnectionRequest(a, b) {
        const posA = getPortPosition(a);
        const posB = getPortPosition(b);
        return `<path d="
          M${posA.x},${posA.y}
          L${posA.x},${posA.y + GRID_SIZE}
          L${posB.x},${posA.y + GRID_SIZE}
          L${posB.x},${posB.y}
        " class='route request'/>`;
      }
      function drawConnectionBidirectional(a, b) {
        const posA = getPortPosition(a);
        const posB = getPortPosition(b);
        const posM = middle(posA, posB);
        let path = "";
        path += `M${posA.x},${posA.y} L${posA.x},${posA.y + GRID_SIZE} `;
        path += `L${posA.x},${posM.y} L${posB.x},${posM.y}`;
        path += `L${posB.x},${posB.y - GRID_SIZE} L${posB.x},${posB.y}`;
        return `<path d="${path}" class='route bidirectional'/>`;
      }
      function getPortPosition(port) {
        const rect = getRect(port.host);
        let offset = {
          x: 0,
          y: 0
        };
        if (port.type === PORT_TYPES2.output || port.type === PORT_TYPES2.exit) {
          offset = {
            x: rect.w,
            y: rect.h - GRID_SIZE * 1.5
          };
        } else if (port.type === PORT_TYPES2.input || port.type === PORT_TYPES2.entry) {
          offset = {
            x: 0,
            y: GRID_SIZE / 2
          };
        } else if (port.type === PORT_TYPES2.answer) {
          offset = {
            x: GRID_SIZE,
            y: -GRID_SIZE * 0.5
          };
        } else if (port.type === PORT_TYPES2.request) {
          offset = {
            x: rect.w - GRID_SIZE,
            y: rect.h - GRID_SIZE / 2
          };
        }
        return {
          x: rect.x + offset.x,
          y: rect.y + offset.y
        };
      }
      function getRect(node) {
        const w = node.rect.w * GRID_SIZE;
        const h = node.rect.h * GRID_SIZE;
        let x = node.rect.x * GRID_SIZE;
        let y = node.rect.y * GRID_SIZE;
        if (node.parent) {
          const offset = getRect(node.parent);
          x += offset.x;
          y += offset.y;
        }
        return {
          x: x + 2 * GRID_SIZE,
          y: y + 2 * GRID_SIZE,
          w,
          h
        };
      }
      function middle(a, b) {
        return {
          x: (a.x + b.x) / 2,
          y: (a.y + b.y) / 2
        };
      }
      self.cursor = {
        host: null,
        el: document.createElement("cursor"),
        target: null,
        pos: {
          x: 0,
          y: 0
        },
        offset: {
          x: 0,
          y: 0
        },
        origin: null,
        install: function(host) {
          this.host = host;
          this.target = document.getElementById("viewport");
          document.body.appendChild(this.el);
          document.addEventListener("mousedown", (e) => {
            this.touch({
              x: e.clientX,
              y: e.clientY
            }, true);
            e.preventDefault();
          });
          document.addEventListener("mousemove", (e) => {
            this.touch({
              x: e.clientX,
              y: e.clientY
            }, false);
            e.preventDefault();
          });
          document.addEventListener("mouseup", (e) => {
            this.touch({
              x: e.clientX,
              y: e.clientY
            });
            e.preventDefault();
          });
        },
        update: function() {
          this.target.style.transform = `translate(${parseInt(this.offset.x)}px,${parseInt(this.offset.y)}px)`;
          document.body.style.backgroundPosition = `${parseInt(this.offset.x * 0.75)}px ${parseInt(this.offset.y * 0.75)}px`;
        },
        touch: function(pos, click = null) {
          if (click === true) {
            this.origin = pos;
            return;
          }
          if (this.origin) {
            this.offset.x += parseInt(pos.x - this.origin.x);
            this.offset.y += parseInt(pos.y - this.origin.y);
            this.update();
            this.origin = pos;
          }
          if (click === null) {
            this.origin = null;
            return;
          }
          this.pos = pos;
        },
        magnet: function(val) {
          return parseInt(val / GRID_SIZE) * GRID_SIZE + GRID_SIZE / 2;
        }
      };
      self.cursor.install(self);
    };
  }
  Riven.prototype.add = function(node) {
    this.network[node.id] = node;
  };
  var riven_default = Riven;

  // src/js/examples/mesh.js
  var { \u00D8, graph, lib } = new riven_default();
  var {
    Node: Node2,
    Mesh: Mesh2,
    Add: Add2,
    Value: Value2,
    Print: Print2
  } = lib;
  \u00D8("bang").create({ x: 2, y: 2 }, Node2);
  \u00D8("mesh").create({ x: 8, y: 0 }, Mesh2, [
    \u00D8("add").create({ x: 2, y: 0 }, Add2),
    \u00D8("val1").create({ x: 0, y: 4 }, Value2, 5),
    \u00D8("val2").create({ x: 4, y: 4 }, Value2, 10)
  ], "add", "add");
  \u00D8("output").create({ x: 26, y: 6 }, Print2);
  \u00D8("add").syphon(["val1", "val2"]);
  \u00D8("bang").connect("mesh");
  \u00D8("mesh").connect("output");
  \u00D8("bang").send("foo bar");
  graph();
})();
