const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["android-icon-144x144.png","android-icon-192x192.png","android-icon-36x36.png","android-icon-48x48.png","android-icon-72x72.png","android-icon-96x96.png","apple-icon-114x114.png","apple-icon-120x120.png","apple-icon-144x144.png","apple-icon-152x152.png","apple-icon-180x180.png","apple-icon-57x57.png","apple-icon-60x60.png","apple-icon-72x72.png","apple-icon-76x76.png","apple-icon-precomposed.png","apple-icon.png","browserconfig.xml","favicon-16x16.png","favicon-32x32.png","favicon-96x96.png","favicon.ico","manifest.json","ms-icon-144x144.png","ms-icon-150x150.png","ms-icon-310x310.png","ms-icon-70x70.png"]),
	mimeTypes: {".png":"image/png",".xml":"application/xml",".ico":"image/vnd.microsoft.icon",".json":"application/json"},
	_: {
		client: {"start":"_app/immutable/entry/start.f9b2ce1c.js","app":"_app/immutable/entry/app.e16851f9.js","imports":["_app/immutable/entry/start.f9b2ce1c.js","_app/immutable/chunks/scheduler.db8c6f43.js","_app/immutable/chunks/singletons.36e6797f.js","_app/immutable/chunks/index.f70cc130.js","_app/immutable/entry/app.e16851f9.js","_app/immutable/chunks/index.78ffd87c.js","_app/immutable/chunks/scheduler.db8c6f43.js"],"stylesheets":[],"fonts":[]},
		nodes: [
			__memo(() => import('./chunks/0-44a4e75c.js')),
			__memo(() => import('./chunks/1-bb1c84fa.js')),
			__memo(() => import('./chunks/2-c726288a.js')),
			__memo(() => import('./chunks/3-a87abb0d.js')),
			__memo(() => import('./chunks/4-c6fe9bff.js')),
			__memo(() => import('./chunks/5-39a5ef7a.js')),
			__memo(() => import('./chunks/6-a6e9df34.js')),
			__memo(() => import('./chunks/7-44e426c3.js')),
			__memo(() => import('./chunks/8-26d9abf4.js')),
			__memo(() => import('./chunks/9-b1f7aa2d.js')),
			__memo(() => import('./chunks/10-63a3e369.js')),
			__memo(() => import('./chunks/11-95561dd9.js')),
			__memo(() => import('./chunks/12-3a954b00.js')),
			__memo(() => import('./chunks/13-3c4ef38f.js')),
			__memo(() => import('./chunks/14-59b2b6df.js')),
			__memo(() => import('./chunks/15-736e016f.js')),
			__memo(() => import('./chunks/16-5da81197.js')),
			__memo(() => import('./chunks/17-7eb6ff05.js')),
			__memo(() => import('./chunks/18-a489d421.js')),
			__memo(() => import('./chunks/19-254a09b4.js')),
			__memo(() => import('./chunks/20-afff3241.js')),
			__memo(() => import('./chunks/21-1aaf2bd4.js')),
			__memo(() => import('./chunks/22-1d7a3e4c.js')),
			__memo(() => import('./chunks/23-35969bca.js')),
			__memo(() => import('./chunks/24-2aa8eb66.js')),
			__memo(() => import('./chunks/25-a6a55eae.js')),
			__memo(() => import('./chunks/26-1fec5851.js')),
			__memo(() => import('./chunks/27-9d7a0bbb.js')),
			__memo(() => import('./chunks/28-4ab94fe0.js')),
			__memo(() => import('./chunks/29-d72c7363.js'))
		],
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
				endpoint: null
			},
			{
				id: "/arms-manufacturer",
				pattern: /^\/arms-manufacturer\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 3 },
				endpoint: null
			},
			{
				id: "/changelog",
				pattern: /^\/changelog\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 4 },
				endpoint: null
			},
			{
				id: "/chopshop",
				pattern: /^\/chopshop\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 5 },
				endpoint: null
			},
			{
				id: "/culture",
				pattern: /^\/culture\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 6 },
				endpoint: null
			},
			{
				id: "/drug",
				pattern: /^\/drug\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 7 },
				endpoint: null
			},
			{
				id: "/fantasy/adnd/character",
				pattern: /^\/fantasy\/adnd\/character\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 8 },
				endpoint: null
			},
			{
				id: "/fantasy/dcc/character",
				pattern: /^\/fantasy\/dcc\/character\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 9 },
				endpoint: null
			},
			{
				id: "/fantasy/dungeon",
				pattern: /^\/fantasy\/dungeon\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 10 },
				endpoint: null
			},
			{
				id: "/fantasy/equipment",
				pattern: /^\/fantasy\/equipment\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 11 },
				endpoint: null
			},
			{
				id: "/fantasy/family",
				pattern: /^\/fantasy\/family\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 12 },
				endpoint: null
			},
			{
				id: "/fantasy/merchant",
				pattern: /^\/fantasy\/merchant\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 13 },
				endpoint: null
			},
			{
				id: "/fantasy/organization",
				pattern: /^\/fantasy\/organization\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 14 },
				endpoint: null
			},
			{
				id: "/fantasy/religion",
				pattern: /^\/fantasy\/religion\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 15 },
				endpoint: null
			},
			{
				id: "/fantasy/weapon",
				pattern: /^\/fantasy\/weapon\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 16 },
				endpoint: null
			},
			{
				id: "/heraldry",
				pattern: /^\/heraldry\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 17 },
				endpoint: null
			},
			{
				id: "/language",
				pattern: /^\/language\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 18 },
				endpoint: null
			},
			{
				id: "/navigation",
				pattern: /^\/navigation\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 19 },
				endpoint: null
			},
			{
				id: "/planet",
				pattern: /^\/planet\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 20 },
				endpoint: null
			},
			{
				id: "/region",
				pattern: /^\/region\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 21 },
				endpoint: null
			},
			{
				id: "/species-stats",
				pattern: /^\/species-stats\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 22 },
				endpoint: null
			},
			{
				id: "/spooky-ship",
				pattern: /^\/spooky-ship\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 23 },
				endpoint: null
			},
			{
				id: "/star-nation",
				pattern: /^\/star-nation\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 24 },
				endpoint: null
			},
			{
				id: "/starsystem",
				pattern: /^\/starsystem\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 25 },
				endpoint: null
			},
			{
				id: "/swn/character",
				pattern: /^\/swn\/character\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 26 },
				endpoint: null
			},
			{
				id: "/swn/starship",
				pattern: /^\/swn\/starship\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 27 },
				endpoint: null
			},
			{
				id: "/unchartedworlds/character",
				pattern: /^\/unchartedworlds\/character\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 28 },
				endpoint: null
			},
			{
				id: "/word-generator-cheat-sheet",
				pattern: /^\/word-generator-cheat-sheet\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 29 },
				endpoint: null
			}
		],
		matchers: async () => {
			
			return {  };
		}
	}
}
})();

const prerendered = new Set([]);

export { manifest, prerendered };
//# sourceMappingURL=manifest.js.map
