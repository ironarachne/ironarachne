const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["android-icon-144x144.png","android-icon-192x192.png","android-icon-36x36.png","android-icon-48x48.png","android-icon-72x72.png","android-icon-96x96.png","apple-icon-114x114.png","apple-icon-120x120.png","apple-icon-144x144.png","apple-icon-152x152.png","apple-icon-180x180.png","apple-icon-57x57.png","apple-icon-60x60.png","apple-icon-72x72.png","apple-icon-76x76.png","apple-icon-precomposed.png","apple-icon.png","browserconfig.xml","favicon-16x16.png","favicon-32x32.png","favicon-96x96.png","favicon.ico","manifest.json","ms-icon-144x144.png","ms-icon-150x150.png","ms-icon-310x310.png","ms-icon-70x70.png"]),
	mimeTypes: {".png":"image/png",".xml":"text/xml",".json":"application/json"},
	_: {
		client: {"start":"_app/immutable/entry/start.mXcyLcur.js","app":"_app/immutable/entry/app.EUjXtYLQ.js","imports":["_app/immutable/entry/start.mXcyLcur.js","_app/immutable/chunks/entry.uDQ30AZ5.js","_app/immutable/chunks/scheduler.5o8iMP-j.js","_app/immutable/chunks/index.BUy5jdpj.js","_app/immutable/entry/app.EUjXtYLQ.js","_app/immutable/chunks/index.EoApDFme.js","_app/immutable/chunks/scheduler.5o8iMP-j.js","_app/immutable/chunks/stores.GNLPr96N.js","_app/immutable/chunks/entry.uDQ30AZ5.js","_app/immutable/chunks/index.BUy5jdpj.js"],"stylesheets":[],"fonts":[],"uses_env_dynamic_public":false},
		nodes: [
			__memo(() => import('./chunks/0-klXaLiWH.js')),
			__memo(() => import('./chunks/1-rNl07qyX.js')),
			__memo(() => import('./chunks/2-xE6w-8wC.js')),
			__memo(() => import('./chunks/3-LCGo5a67.js')),
			__memo(() => import('./chunks/4-BuM5gOPq.js')),
			__memo(() => import('./chunks/5-FDPoHPSE.js')),
			__memo(() => import('./chunks/6-qyWhe6m3.js')),
			__memo(() => import('./chunks/7-3ESZkq9R.js')),
			__memo(() => import('./chunks/8-FhZXHnSn.js')),
			__memo(() => import('./chunks/9-zQi_9iSU.js')),
			__memo(() => import('./chunks/10-EOcXYJ_R.js')),
			__memo(() => import('./chunks/11-5pHQ9sBj.js')),
			__memo(() => import('./chunks/12-C52hEqkO.js')),
			__memo(() => import('./chunks/13-dtzJ2guL.js')),
			__memo(() => import('./chunks/14-ZOlwCOsu.js')),
			__memo(() => import('./chunks/15-LZutX7Lt.js')),
			__memo(() => import('./chunks/16-ihtJAzwN.js')),
			__memo(() => import('./chunks/17-mNgtVuqW.js')),
			__memo(() => import('./chunks/18-gJvu4ARY.js')),
			__memo(() => import('./chunks/19-NJKP4_aX.js')),
			__memo(() => import('./chunks/20-O1P5Lwo8.js')),
			__memo(() => import('./chunks/21-pTROXd_r.js')),
			__memo(() => import('./chunks/22-tCjAn13Y.js')),
			__memo(() => import('./chunks/23-3xTE2YsC.js')),
			__memo(() => import('./chunks/24-F186B7Vz.js')),
			__memo(() => import('./chunks/25-RzXglTi9.js')),
			__memo(() => import('./chunks/26-Pnj1d-rO.js')),
			__memo(() => import('./chunks/27-InmHOppx.js')),
			__memo(() => import('./chunks/28-RF5u_XNB.js')),
			__memo(() => import('./chunks/29-QjzSLsZp.js'))
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
				id: "/star-system",
				pattern: /^\/star-system\/?$/,
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
