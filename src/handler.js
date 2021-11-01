const LOCATION_COLLECTION = "locations";
const TRIP_COLLECTION = "trips";

export async function handler(ctx) {
  const client = await ctx.mongo;

  try {
    const count = await client.db().collection(LOCATION_COLLECTION).countDocuments();
    console.log(`Fount ${count} stored locations`);
  } catch (error) {
    ctx.throw(400, "Unable to interact with the database");
  }

  ctx.assert(ctx.method == "POST", 405, "Method Not Allowed");

  const locations = ctx.request.body.locations;
  ctx.assert(locations?.length, 400, "No Locations Found");

  console.log(`Storing ${locations.length} locations`);
  try {
    const reply = await client.db().collection(LOCATION_COLLECTION).insertMany(locations);
    console.log(`Stored ${reply.insertedCount} locations`);
  } catch (error) {
    ctx.throw(400, "Unable to store locations");
  }

  const trip = ctx.request.body.trip;
  if (trip) {
    console.log(`Storing trip information`);

    // rename
    trip.end_location = trip.current_location;
    delete trip.current_location;

    try {
      const reply = await client
        .db()
        .collection(TRIP_COLLECTION)
        .findOneAndReplace({ start: trip.start }, trip, { upsert: true });
      console.debug(reply);
      console.log("Stored trip information");
    } catch (error) {
      ctx.throw(400, "Unable to store trip information");
    }
  }

  ctx.body = {
    result: "ok",
  };
}
