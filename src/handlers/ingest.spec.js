import { app } from "../server.js";
import request from "supertest";

afterAll(async () => {
  await app.context.mongo.close();
});

test("save locations", async () => {
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
  expect(response.body).toEqual({ result: "ok" });

  const findResult = await app.context.locations
    .find({}, { projection: { _id: 0 } })
    .sort({ $natural: -1 })
    .limit(2)
    .toArray();
  expect(findResult).toMatchSnapshot();
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
  const response = await request(app.callback())
    .post("/ingest")
    .send({
      locations: [
        {
          type: "Feature",
        },
      ],
      trip: {
        distance: 28,
        mode: "Bus",
        start: "2022-01-23T18:04:02Z",
        start_location: {
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [9.7258859561318, 52.38420901449808],
          },
          properties: {
            timestamp: "2022-01-23T18:04:02Z",
          },
        },
        current_location: {
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [9.725874185130364, 52.38419436608723],
          },
          properties: {
            timestamp: "2022-01-23T18:05:08Z",
          },
        },
      },
    });

  expect(response.status).toBe(200);
  expect(response.header["content-type"]).toMatch("application/json");
  expect(response.body).toEqual({ result: "ok" });

  const trips = await app.context.trips.findOne(
    {},
    { projection: { _id: 0 }, sort: { $natural: -1 } }
  );
  expect(trips).toMatchSnapshot();
});

test("update existing trip", async () => {
  // prior trip information
  const existing = await app.context.trips.insertOne({
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
  expect(response.body).toEqual({ result: "ok" });

  const updated = await app.context.trips.findOne({ _id: existing.insertedId });
  expect(updated.distance).toBe(502);
  expect(updated.end_location.geometry.coordinates[1]).toBe(51.5029763593054);
  expect(updated.end_location.properties.timestamp).toBe("2021-12-02T09:10:07Z");
});

test("return error on persistence error", async () => {
  await app.context.mongo.close();

  const response = await request(app.callback())
    .post("/ingest")
    .send({
      locations: [
        {
          type: "Feature",
        },
      ],
    });

  expect(response.status).toBe(500);
  expect(response.header["content-type"]).toMatch("text/plain");
  expect(response.text).toBe("Internal Server Error");
});
