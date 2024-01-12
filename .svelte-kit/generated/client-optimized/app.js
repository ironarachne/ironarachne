import * as client_hooks from '../../../src/hooks.client.ts';


export { matchers } from './matchers.js';

export const nodes = [
	() => import('./nodes/0'),
	() => import('./nodes/1'),
	() => import('./nodes/2'),
	() => import('./nodes/3'),
	() => import('./nodes/4'),
	() => import('./nodes/5'),
	() => import('./nodes/6'),
	() => import('./nodes/7'),
	() => import('./nodes/8'),
	() => import('./nodes/9'),
	() => import('./nodes/10'),
	() => import('./nodes/11'),
	() => import('./nodes/12'),
	() => import('./nodes/13'),
	() => import('./nodes/14'),
	() => import('./nodes/15'),
	() => import('./nodes/16'),
	() => import('./nodes/17'),
	() => import('./nodes/18'),
	() => import('./nodes/19'),
	() => import('./nodes/20'),
	() => import('./nodes/21'),
	() => import('./nodes/22'),
	() => import('./nodes/23'),
	() => import('./nodes/24'),
	() => import('./nodes/25'),
	() => import('./nodes/26'),
	() => import('./nodes/27'),
	() => import('./nodes/28'),
	() => import('./nodes/29')
];

export const server_loads = [];

export const dictionary = {
		"/": [2],
		"/arms-manufacturer": [3],
		"/changelog": [4],
		"/chopshop": [5],
		"/culture": [6],
		"/drug": [7],
		"/fantasy/adnd/character": [8],
		"/fantasy/dcc/character": [9],
		"/fantasy/dungeon": [10],
		"/fantasy/equipment": [11],
		"/fantasy/family": [12],
		"/fantasy/merchant": [13],
		"/fantasy/organization": [14],
		"/fantasy/religion": [15],
		"/fantasy/weapon": [16],
		"/heraldry": [17],
		"/language": [18],
		"/navigation": [19],
		"/planet": [20],
		"/region": [21],
		"/species-stats": [22],
		"/spooky-ship": [23],
		"/star-nation": [24],
		"/star-system": [25],
		"/swn/character": [26],
		"/swn/starship": [27],
		"/unchartedworlds/character": [28],
		"/word-generator-cheat-sheet": [29]
	};

export const hooks = {
	handleError: client_hooks.handleError || (({ error }) => { console.error(error) }),

	reroute: (() => {})
};

export { default as root } from '../root.svelte';