import * as Tincture from './tinctures.js'
import * as Field from './fields.js'

export function generate() {
  let t1 = Tincture.random()
  let t2 = Tincture.randomContrasting(t1)
  let tinctures = []

  let f = Field.random()

  if (f.tinctures === 1) {
    tinctures = [t1]
  } else {
    tinctures = [t1, t2]
  }

  let blazon = Field.renderBlazon(f, tinctures)

  let heraldry = {
    field: f,
    blazon: blazon,
    tinctures: tinctures
  }

  let svg = renderSVG(heraldry)

  return {
    blazon: blazon,
    svg: svg
  }
}

export function renderSVG(heraldry) {
  let shieldSVG = '<svg width="600" height="660"><path fill="#ffffff" stroke="#000000" stroke-width="3" d="M3,3 V260.637C3,369.135,46.339,452.459,99.763,514 C186.238,614.13,300,657,300,657 C300,657,413.762,614.13,500.237,514 C553.661,452.459,597,369.135,597,260.637V3Z"/></svg>'

  let tinctureHexColor = heraldry.tinctures[0].hexColor

  shieldSVG = shieldSVG.replace('#ffffff', tinctureHexColor)

  let svg = shieldSVG

  return svg
}
