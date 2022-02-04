'use strict';

import './styles/reset.scss';
import './styles/main.scss';
import App from './components/App.svelte';

const app = new App({
  target: document.body,
});

export default app;
