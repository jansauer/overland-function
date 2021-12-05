const LOCATION_COLLECTION = "locations";
const TRIP_COLLECTION = "trips";

export async function ingestHandler(ctx) {
  const client = await ctx.mongo;

  const locations = ctx.request.body.locations;
  ctx.assert(locations?.length, 400, "No Locations Found");

  try {
    console.log(`Storing ${locations.length} locations`);

    const locationReply = await client.db().collection(LOCATION_COLLECTION).insertMany(locations);
    console.log(`Stored ${locationReply.insertedCount} locations`);

    const trip = ctx.request.body.trip;
    if (trip) {
      console.log(`Storing trip information`);

      // rename
      trip.end_location = trip.current_location;
      delete trip.current_location;

      const tripReply = await client
        .db()
        .collection(TRIP_COLLECTION)
        .findOneAndReplace({ start: trip.start }, trip, { upsert: true });
      console.log(`Stored ${tripReply.insertedCount} trips`);
    }

    ctx.body = {
      result: "ok",
    };
  } catch (error) {
    console.error(error);
    ctx.throw(400, "Unable to ingest");
  }
}
