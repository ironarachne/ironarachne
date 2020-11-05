import * as iarnd from '../random.js'

export function all() {
  return colors().concat(metals())
}

export function colors() {
  return [
    { name: 'azure',
      hexColor: '#0731BA',
      type: 'color'
   }, {
     name: 'gules',
     hexColor: '#D40D02',
     type: 'color'
  }, {
    name: 'vert',
  hexColor: '#0B731B',
type: 'color'
},{
    name: 'sable',
  hexColor: '#000000',
type: 'color'
},{ name:'purpure',
hexColor: '#6131B5',
type: 'color'
}]
}

export function metals() {
  return [{
    name: 'argent',
    hexColor: '#ffffff',
    type: 'metal'
 },{ name: 'Or',
hexColor: '#F0D41F',
type: 'metal'
}]
}

export function contrasts(a, b) {
  if (a.type == b.type) {
    return false
  }

  return true
}

export function random() {
  let tincture = iarnd.item(all())
  return tincture
}

export function randomContrasting(tincture) {
  let result = ''

  if (tincture.type == 'color') {
    result = randomMetal()
  } else {
    result = randomColor()
  }

  return result
}

export function randomMetal() {
  let metal = iarnd.item(metals())
  return metal
}

export function randomColor() {
  let color = iarnd.item(colors())
  return color
}
