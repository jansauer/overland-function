import { app } from "../server.js";
import request from "supertest";

afterAll(async () => {
  await app.context.mongo.close();
});

test("return stats", async () => {
  // cleanup
  await app.context.locations.deleteMany({});
  await app.context.trips.deleteMany({});

  // insert sample data
  await app.context.locations.insertOne({ properties: { timestamp: "2021-08-02T13:43:26Z" } });
  await app.context.locations.insertOne({ properties: { timestamp: "2022-01-23T19:03:16Z" } });

  const response = await request(app.callback()).get("/stats");

  expect(response.status).toBe(200);
  expect(response.header["content-type"]).toMatch("application/json");
  expect(response.body).toEqual({
    totalLocations: 2,
    totalTrips: 0,
    latestLocation: "2022-01-23T19:03:16Z",
  });
});

test("return error on persistence error", async () => {
  await app.context.mongo.close();

  const response = await request(app.callback()).get("/stats");

  expect(response.status).toBe(500);
  expect(response.header["content-type"]).toMatch("text/plain");
  expect(response.text).toBe("Internal Server Error");
});
