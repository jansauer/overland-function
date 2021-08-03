import { app } from "./server.js";
import request from "supertest";

afterAll(async () => {
  const client = await app.context.mongo;
  await client.close();
});

test("save locations", async () => {
  const client = await app.context.mongo;
  const collection = client.db().collection("locations");

  // cleanup
  await collection.deleteMany({});

  const response = await request(app.callback())
    .post("/")
    .send({
      locations: [
        {
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: {
              latitude: 37.3318,
              longitude: -122.030581,
            },
          },
          properties: {
            timestamp: "2015-10-01T08:00:00-0700",
            altitude: 0,
            speed: 4,
            horizontal_accuracy: 30,
            vertical_accuracy: -1,
            motion: ["driving", "stationary"],
            pauses: false,
            activity: "other_navigation",
            desired_accuracy: 100,
            deferred: 1000,
            significant_change: "disabled",
            locations_in_payload: 1,
            device_id: "",
            wifi: "launchpad",
            battery_state: "charging",
            battery_level: 0.89,
          },
        },
        {
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [9.7260200608799909, 52.384053621857021],
          },
          properties: {
            motion: [],
            speed: -1,
            battery_level: 0.76999998092651367,
            device_id: "iphonex",
            altitude: 55,
            battery_state: "unplugged",
            horizontal_accuracy: 65,
            vertical_accuracy: 20,
            timestamp: "2021-08-03T09:44:24Z",
            wifi: "Alderaan Legacy",
          },
        },
      ],
    });

  expect(response.status).toBe(200);
  expect(response.header["content-type"]).toMatch("application/json");
  expect(response.text).toBe('{"result":"ok"}');

  const saved = collection.find({}, { projection: { _id: 0 } });
  expect(await saved.count()).toBe(2);
  await saved.forEach((doc) => expect(doc).toMatchSnapshot());
});

test.each(["GET", "PUT", "DELETE", "OPTIONS", "TRACE", "PATCH"])(
  "return error on %s http methode",
  async (methode) => {
    const response = await request(app.callback())[methode.toLowerCase()]("/");

    expect(response.status).toBe(405);
    expect(response.header["content-type"]).toMatch("text/plain");
    expect(response.text).toBe("Method Not Allowed");
  }
);

test("return error on missing locations", async () => {
  const response = await request(app.callback()).post("/").send({});

  expect(response.status).toBe(400);
  expect(response.header["content-type"]).toMatch("text/plain");
  expect(response.text).toBe("No Locations Found");
});

test("return error on empty locations", async () => {
  const response = await request(app.callback()).post("/").send({
    locations: [],
  });

  expect(response.status).toBe(400);
  expect(response.header["content-type"]).toMatch("text/plain");
  expect(response.text).toBe("No Locations Found");
});

test("return error on persistence error", async () => {
  const client = await app.context.mongo;
  await client.close();

  const response = await request(app.callback())
    .post("/")
    .send({
      locations: [
        {
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: {
              latitude: 37.3318,
              longitude: -122.030581,
            },
          },
          properties: {
            timestamp: "2015-10-01T08:00:00-0700",
            altitude: 0,
            speed: 4,
            horizontal_accuracy: 30,
            vertical_accuracy: -1,
            motion: ["driving", "stationary"],
            pauses: false,
            activity: "other_navigation",
            desired_accuracy: 100,
            deferred: 1000,
            significant_change: "disabled",
            locations_in_payload: 1,
            device_id: "",
            wifi: "launchpad",
            battery_state: "charging",
            battery_level: 0.89,
          },
        },
      ],
    });

  expect(response.status).toBe(400);
  expect(response.header["content-type"]).toMatch("text/plain");
  expect(response.text).toBe("Unable to store locations");
});
