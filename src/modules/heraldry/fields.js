import * as iarnd from '../random.js'

export function all() {
  return [{
    name: 'plain',
    blazon: 'tincture1',
    tinctures: 1
  },
  {
    name: 'barry',
    blazon: 'barry tincture1 and tincture2',
    tinctures: 2
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
