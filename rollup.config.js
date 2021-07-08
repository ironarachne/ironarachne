import svelte from 'rollup-plugin-svelte';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import livereload from 'rollup-plugin-livereload';
import { terser } from 'rollup-plugin-terser';
import svg from 'rollup-plugin-svg-import';
import preprocess from 'svelte-preprocess';
import scss from 'rollup-plugin-scss';
import replace from '@rollup/plugin-replace';

const production = !process.env.ROLLUP_WATCH;
const environmentLabel = production ? 'production' : 'development';

function serve() {
	let server;

	function toExit() {
		if (server) server.kill(0);
	}

	return {
		writeBundle() {
			if (server) return;
			server = require('child_process').spawn('npm', ['run', 'start', '--', '--dev'], {
				stdio: ['ignore', 'inherit', 'inherit'],
				shell: true
			});

			process.on('SIGTERM', toExit);
			process.on('exit', toExit);
		}
	};
}

export default {
	input: 'src/main.ts',
	output: {
		sourcemap: true,
		format: 'iife',
		name: 'app',
		file: 'public/js/bundle.js',
    globals: {
      crypto: 'crypto',
    }
	},
	plugins: [
    replace({
      'process.env.NODE_ENV': JSON.stringify(environmentLabel),
    }),
    typescript(),
		svelte({
			compilerOptions: {
				// enable run-time checks when not in production
				dev: !production
			},
      preprocess: preprocess()
		}),
    scss({
      include: ["/**/*.css", "/**/*.scss", "/**/*.sass"],
      output: "public/css/style.css",
      failOnError: true,
      insert: true
    }),
		// If you have external dependencies installed from
		// npm, you'll most likely need these plugins. In
		// some cases you'll need additional configuration -
		// consult the documentation for details:
		// https://github.com/rollup/plugins/tree/master/packages/commonjs
		resolve({
			browser: true,
			dedupe: ['svelte']
		}),
		commonjs(),
    svg({
      stringify: true
    }),

		// In dev mode, call `npm run start` once
		// the bundle has been generated
		!production && serve(),

		// Watch the `public` directory and refresh the
		// browser on changes when not in production
		!production && livereload('public'),

		// If we're building for production (npm run build
		// instead of npm run dev), minify
		production && terser(),
	],
	watch: {
		clearScreen: false
	}
};
