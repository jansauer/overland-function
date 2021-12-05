import Koa from "koa";
import { MongoClient } from "mongodb";
import Router from "koa-router";
import bodyParser from "koa-bodyparser";
import { ingestHandler } from "./handlers/ingest.js";
import { statsHandler } from "./handlers/stats.js";

const PORT = process.env.PORT || 3000;
const URI =
  process.env.MONGODB_URI || "mongodb://root:dev@localhost:27017/overland?authSource=admin";

const app = new Koa();
const router = new Router();

app.context.mongo = MongoClient.connect(URI);

router.get("/", (ctx) => (ctx.body = "OK"));
router.post("/ingest", ingestHandler);
router.get("/stats", statsHandler);

app
  .use(bodyParser({ enableTypes: ["json"] }))
  .use(router.routes())
  .use(router.allowedMethods());

/* istanbul ignore next */
if (process.env.NODE_ENV != "test") {
  app.listen(PORT, () => {
    console.log(`🚀 The function is up an running on port ${PORT}`);
  });
}

export { app };
