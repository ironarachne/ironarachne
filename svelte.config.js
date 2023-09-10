import adapter from "@sveltejs/adapter-node";
import { vitePreprocess } from "@sveltejs/kit/vite";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),

  kit: {
    adapter: adapter(),
  },

  onwarn: (warning, handler) => {
    const { code, frame } = warning;
    if (code === "css-unused-selector") {
      return;
    }

    handler(warning);
  },
};

export default config;
