import { app } from "../server.js";
import request from "supertest";

afterAll(async () => {
  const client = await app.context.mongo;
  await client.close();
});

test("return stats", async () => {
  // cleanup
  const client = await app.context.mongo;
  await client.db().collection("locations").deleteMany({});
  await client.db().collection("trips").deleteMany({});

  const response = await request(app.callback()).get("/stats");

  expect(response.status).toBe(200);
  expect(response.header["content-type"]).toMatch("application/json");
  expect(response.text).toBe('{"locations":0,"trips":0}');
});

test("return error on persistence error", async () => {
  const client = await app.context.mongo;
  await client.close();

  const response = await request(app.callback()).get("/stats");

  expect(response.status).toBe(400);
  expect(response.header["content-type"]).toMatch("text/plain");
  expect(response.text).toBe("Unable to interact with the database");
});
