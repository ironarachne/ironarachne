
import root from '../root.svelte';
import { set_building } from '__sveltekit/environment';
import { set_assets } from '__sveltekit/paths';
import { set_private_env, set_public_env } from '../../../node_modules/@sveltejs/kit/src/runtime/shared-server.js';

export const options = {
	app_template_contains_nonce: false,
	csp: {"mode":"auto","directives":{"upgrade-insecure-requests":false,"block-all-mixed-content":false},"reportOnly":{"upgrade-insecure-requests":false,"block-all-mixed-content":false}},
	csrf_check_origin: true,
	track_server_fetches: false,
	embedded: false,
	env_public_prefix: 'PUBLIC_',
	env_private_prefix: '',
	hooks: null, // added lazily, via `get_hooks`
	preload_strategy: "modulepreload",
	root,
	service_worker: false,
	templates: {
		app: ({ head, body, assets, nonce, env }) => "<!DOCTYPE html>\n<html lang=\"en\">\n\t<head>\n\t\t<meta charset=\"utf-8\" />\n\t\t<link rel=\"icon\" href=\"" + assets + "/favicon.ico\" />\n\t\t<meta name=\"viewport\" content=\"width=device-width\" />\n\t\t" + head + "\n\t</head>\n\t<body data-sveltekit-preload-data=\"hover\">\n\t\t<div style=\"display: contents\">" + body + "</div>\n\t</body>\n</html>\n",
		error: ({ status, message }) => "<!DOCTYPE html>\n<html lang=\"en\">\n\t<head>\n\t\t<meta charset=\"utf-8\" />\n\t\t<link rel=\"icon\" href=\"%sveltekit.assets%/favicon.ico\" />\n\t\t<meta name=\"viewport\" content=\"width=device-width\" />\n\t\t%sveltekit.head%\n\n        <style lang=\"scss\" global>\n            @import \"styles/reset.scss\";\n            @import \"styles/main.scss\";\n        </style>\n\t</head>\n\t<body data-sveltekit-preload-data=\"hover\">\n\t\t<div style=\"display: contents\">\n            <h1>Error Code: " + status + "</h1>\n            <p>Oops, something broke.</p>\n            <p>" + message + "</p>\n        </div>\n\t</body>\n</html>\n"
	},
	version_hash: "1b6b0l1"
};

export function get_hooks() {
	return import("../../../src/hooks.server.ts");
}

export { set_assets, set_building, set_private_env, set_public_env };
