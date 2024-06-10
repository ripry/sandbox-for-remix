import { createExpressApp } from "remix-create-express-app";
import compression from "compression";
import morgan from "morgan";

declare module "@remix-run/node" {
  interface AppLoadContext {}
}

export const app = createExpressApp({
  configure: (app) => {
    app.use(compression());
    app.disable("x-powered-by");
    app.use(morgan("tiny"));
  },
});
