import { app } from "../server.js";
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
    .post("/ingest")
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

  const locations = await collection.find({}, { projection: { _id: 0 } }).toArray();
  expect(locations).toMatchSnapshot();
});

test("return error on missing locations", async () => {
  const response = await request(app.callback()).post("/ingest").send({});

  expect(response.status).toBe(400);
  expect(response.header["content-type"]).toMatch("text/plain");
  expect(response.text).toBe("No Locations Found");
});

test("return error on empty locations", async () => {
  const response = await request(app.callback()).post("/ingest").send({
    locations: [],
  });

  expect(response.status).toBe(400);
  expect(response.header["content-type"]).toMatch("text/plain");
  expect(response.text).toBe("No Locations Found");
});

test("save trip", async () => {
  const client = await app.context.mongo;
  const collection = client.db().collection("trips");

  // cleanup
  await collection.deleteMany({});

  const response = await request(app.callback())
    .post("/ingest")
    .send({
      locations: [
        {
          type: "Feature",
        },
      ],
      trip: {
        distance: 502,
        mode: "Car",
        start: "2021-12-02T09:04:02Z",
        start_location: {
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [7.52318470085059, 51.50297170104519],
          },
          properties: {
            timestamp: "2021-12-02T09:04:02Z",
          },
        },
        current_location: {
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [7.523156745969733, 51.5029763593054],
          },
          properties: {
            timestamp: "2021-12-02T09:10:07Z",
          },
        },
      },
    });

  expect(response.status).toBe(200);
  expect(response.header["content-type"]).toMatch("application/json");
  expect(response.text).toBe('{"result":"ok"}');

  const trips = await collection.find({}, { projection: { _id: 0 } }).toArray();
  expect(trips).toMatchSnapshot();
});

test("update existing trip", async () => {
  const client = await app.context.mongo;
  const collection = client.db().collection("trips");

  // cleanup
  await collection.deleteMany({});

  // prior trip information
  await collection.insert({
    distance: 401,
    mode: "Car",
    start: "2021-12-02T09:04:02Z",
    start_location: {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [7.52318470085059, 51.50297170104519],
      },
      properties: {
        timestamp: "2021-12-02T09:04:02Z",
      },
    },
    end_location: {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [7.523148275207834, 51.50299135135214],
      },
      properties: {
        timestamp: "2021-12-02T09:05:14Z",
      },
    },
  });

  const response = await request(app.callback())
    .post("/ingest")
    .send({
      locations: [
        {
          type: "Feature",
        },
      ],
      trip: {
        distance: 502,
        mode: "Car",
        start: "2021-12-02T09:04:02Z",
        start_location: {
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [7.52318470085059, 51.50297170104519],
          },
          properties: {
            timestamp: "2021-12-02T09:04:02Z",
          },
        },
        current_location: {
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [7.523156745969733, 51.5029763593054],
          },
          properties: {
            timestamp: "2021-12-02T09:10:07Z",
          },
        },
      },
    });

  expect(response.status).toBe(200);
  expect(response.header["content-type"]).toMatch("application/json");
  expect(response.text).toBe('{"result":"ok"}');

  const trips = await collection.find({}, { projection: { _id: 0 } }).toArray();
  expect(trips.length).toBe(1);
  expect(trips[0].distance).toBe(502);
  expect(trips[0].end_location.geometry.coordinates[1]).toBe(51.5029763593054);
  expect(trips[0].end_location.properties.timestamp).toBe("2021-12-02T09:10:07Z");
});

test("return error on persistence error", async () => {
  const client = await app.context.mongo;
  await client.close();

  const response = await request(app.callback())
    .post("/ingest")
    .send({
      locations: [
        {
          type: "Feature",
        },
      ],
    });

  expect(response.status).toBe(400);
  expect(response.header["content-type"]).toMatch("text/plain");
  expect(response.text).toBe("Unable to ingest");
});
