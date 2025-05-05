import { App } from './app';
const app = new App();
(window as any).setup = (): void => { app.setup() };
(window as any).draw = (): void => { app.draw() };
