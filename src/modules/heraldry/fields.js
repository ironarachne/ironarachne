import * as iarnd from '../random.js'

export function all() {
  return [{
    name: 'plain',
    blazon: 'tincture1',
    tinctures: 1,
    pattern: '<rect x="0" y="0" width="600" height="600" fill="#ffffff"/>'
  },
  {
    name: 'fess',
    blazon: 'per fess tincture1 and tincture2',
    tinctures: 2,
    pattern: '<pattern id="Division" x="0" y="0" width="1" height="1"><rect x="0" y="0" width="600" height="330" fill="#ffffff"/><rect x="0" y="330" width="600" height="330" fill="#00ff00"/></pattern>'
  },
  {
    name: 'pale',
    blazon: 'per pale tincture1 and tincture2',
    tinctures: 2,
    pattern: '<pattern id="Division" x="0" y="0" width="1" height="1"><rect x="0" y="0" width="300" height="660" fill="#ffffff"/><rect x="300" y="0" width="300" height="660" fill="#00ff00"/></pattern>'
  },
  {
    name: 'bend',
    blazon: 'per bend tincture1 and tincture2',
    tinctures: 2,
    pattern: '<pattern id="Division" x="0" y="0" width="1" height="1"><polygon points="0,0 600,660 0,660" fill="#ffffff"/><polygon points="0,0 600,660 600,0" fill="#00ff00"/></pattern>'
  },
  {
    name: 'bend sinister',
    blazon: 'per bend sinister tincture1 and tincture2',
    tinctures: 2,
    pattern: '<pattern id="Division" x="0" y="0" width="1" height="1"><polygon points="0,0 600,0 0,660" fill="#ffffff"/><polygon points="600,0 600,660 0,660" fill="#00ff00"/></pattern>'
  },
  {
    name: 'quarterly',
    blazon: 'quarterly tincture1 and tincture2',
    tinctures: 2,
    pattern: '<pattern id="Division" x="0" y="0" width="1" height="1"><rect x="0" y="0" width="300" height="330" fill="#ffffff"/><rect x="300" y="0" width="300" height="330" fill="#00ff00"/><rect x="300" y="330" width="300" height="330" fill="#ffffff"/><rect x="0" y="330" width="300" height="330" fill="#00ff00"/></pattern>'
  },
  {
    name: 'saltire',
    blazon: 'per saltire tincture1 and tincture2',
    tinctures: 2,
    pattern: '<pattern id="Division" x="0" y="0" width="1" height="1"><polygon points="0,0 600,0 300,330" fill="#ffffff"/><polygon points="600,0 600,660 300,330" fill="#00ff00"/><polygon points="300,330 600,660 0,660" fill="#ffffff"/><polygon points="0,0 300,330 0,660" fill="#00ff00"/></pattern>'
  },
  {
    name: 'chevron',
    blazon: 'per chevron tincture1 and tincture2',
    tinctures: 2,
    pattern: '<pattern id="Division" x="0" y="0" width="1" height="1"><rect x="0" y="0" width="600" height="660" fill="#ffffff"/><polygon points="0,660 300,330 600,660" fill="#00ff00"/></pattern>'
  }]
}

export function random() {
  let options = all()
  let result = iarnd.item(options)
  return result
}

export function renderBlazon(field, tinctures) {
  let blazon = field.blazon

  blazon = blazon.replace('tincture1', tinctures[0].name)

  if (tinctures.length > 1) {
    blazon = blazon.replace('tincture2', tinctures[1].name)
  }

  return blazon
}
