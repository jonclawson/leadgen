if (typeof globalThis !== 'undefined') (globalThis as any).ngDevMode = false;

import '@angular/platform-server/init';
import { render } from '@analogjs/router/server';

import { App } from './app/app';
import { config } from './app/app.config.server';

export default render(App, config);
