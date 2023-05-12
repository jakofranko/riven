'use strict'

RIVEN.lib.Mesh = function (id, rect, children, entry, exit) {
  Node.call(this, id, RIVEN, rect)

  const PORT_TYPES = { default: 0, input: 1, output: 2, request: 3, answer: 4, entry: 5, exit: 6 }

  this.glyph = ''
  this.name = 'meshnode'

  this.ports.entry = new Port(this, 'entry', PORT_TYPES.entry)
  this.ports.exit = new Port(this, 'exit', PORT_TYPES.exit)

  if (RIVEN.network[entry]) { this.ports.entry.connect(Ø(entry).ports.input) }
  if (RIVEN.network[exit]) { Ø(exit).ports.output.connect(this.ports.exit) }

  this.update = function () {
    const bounds = { x: 0, y: 0 }
    for (const id in this.children) {
      const node = this.children[id]
      bounds.x = node.rect.x > bounds.x ? node.rect.x : bounds.x
      bounds.y = node.rect.y > bounds.y ? node.rect.y : bounds.y
    }
    this.rect.w = bounds.x + 8
    this.rect.h = bounds.y + 6
  }

  for (const cid in children) {
    children[cid].parent = this
    this.children.push(children[cid])
    this.update() // can upate after this loop I think? No need to upate every time, since the update loop already goes through all children
  }

  // Re-Route SEND/RECEIVE

  this.receive = function (q, origin, route) {
    if (route.id === 'in') {
      this.entry(q, origin, route)
    }
    if (route.id === 'exit') {
      this.exit(q, origin, route)
    }
  }

  this.entry = function (q, origin, route) {
    const port = this.ports.entry
    for (const routeId in port.routes) {
      const route = port.routes[routeId]
      if (route) {
        route.host.receive(q, origin, route)
      }
    }
  }

  this.exit = function (q, origin, route) {
    const port = this.ports.output
    for (const routeId in port.routes) {
      const route = port.routes[routeId]
      if (route) {
        route.host.receive(q, origin, route)
      }
    }
  }
}
