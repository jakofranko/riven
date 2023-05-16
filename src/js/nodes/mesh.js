import Node from '../node.js';
import Port from '../port.js';
import { PORT_TYPES } from '../constants.js';

export default function Mesh(id, riven, rect, children, entry, exit) {
  Node.call(this, id, riven, rect);

  this.glyph = '';

  this.name = 'meshnode';

  this.ports.entry = new Port(this, 'entry', PORT_TYPES.entry);
  this.ports.exit = new Port(this, 'exit', PORT_TYPES.exit);

  if (riven.network[entry]) { this.ports.entry.connect(riven.Ø(entry).ports.input); }
  if (riven.network[exit]) { riven.Ø(exit).ports.output.connect(this.ports.exit); }

  this.update = function () {
    const bounds = { x: 0, y: 0 };
    for (const id in this.children) {
      const node = this.children[id];
      bounds.x = node.rect.x > bounds.x ? node.rect.x : bounds.x;
      bounds.y = node.rect.y > bounds.y ? node.rect.y : bounds.y;
    }
    this.rect.w = bounds.x + 8;
    this.rect.h = bounds.y + 6;
  };

  for (const cid in children) {
    children[cid].parent = this;
    this.children.push(children[cid]);
    this.update(); // can upate after this loop I think? No need to upate every time, since the update loop already goes through all children
  }

  // Re-Route SEND/RECEIVE

  this.receive = function (q, origin, route) {
    if (route.id === 'in') {
      this.entry(q, origin, route);
    }
    if (route.id === 'exit') {
      this.exit(q, origin, route);
    }
  };

  this.entry = function (q, origin) {
    const port = this.ports.entry;
    for (const routeId in port.routes) {
      const route = port.routes[routeId];
      if (route) {
        route.host.receive(q, origin, route);
      }
    }
  };

  this.exit = function (q, origin) {
    const port = this.ports.output;
    for (const routeId in port.routes) {
      const route = port.routes[routeId];
      if (route) {
        route.host.receive(q, origin, route);
      }
    }
  };
}
