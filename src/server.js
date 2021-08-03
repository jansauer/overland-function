import Koa from "koa";
import { MongoClient } from "mongodb";
import bodyParser from "koa-bodyparser";
import { handler } from "./handler.js";

const PORT = process.env.PORT || 3000;
const URI = process.env.MONGODB_URI || "mongodb://mongo:development@localhost:27017/indiweb?authSource=admin";

const app = new Koa();
app.context.mongo = MongoClient.connect(URI);
app.use(bodyParser({ enableTypes: ["json"] }));
app.use(handler);

/* istanbul ignore next */
if (process.env.NODE_ENV != "test") {
  app.listen(PORT, () => {
    console.log(`🚀 The function is up an running on port ${PORT}`);
  });
}

export { app };
