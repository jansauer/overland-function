import Koa from "koa";
import { MongoClient } from "mongodb";
import Router from "koa-router";
import bodyParser from "koa-bodyparser";
import { ingest } from "./handlers/ingest.js";
import { stats } from "./handlers/stats.js";

const PORT = process.env.PORT || 3000;
const URI =
  process.env.MONGODB_URI || "mongodb://root:dev@localhost:27017/overland?authSource=admin";
const LOCATION_COLLECTION = "locations";
const TRIP_COLLECTION = "trips";

const app = new Koa();
const router = new Router();
const client = await MongoClient.connect(URI);

app.context.mongo = client;
app.context.locations = client.db().collection(LOCATION_COLLECTION);
app.context.trips = client.db().collection(TRIP_COLLECTION);

router.get("/", (ctx) => (ctx.body = "OK"));
router.post("/ingest", ingest);
router.get("/stats", stats);

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
