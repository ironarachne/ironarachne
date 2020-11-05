const random = require('random')

export function item(items) {
	let item = items[random.int(0, items.length-1)]
	return item
}
