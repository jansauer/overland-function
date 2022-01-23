export async function ingest(ctx) {
  const locations = ctx.request.body.locations;
  ctx.assert(locations?.length, 400, "No Locations Found");
  console.log(`Storing ${locations.length} locations`);

  const locationReply = await ctx.locations.insertMany(locations);
  console.log(`Stored ${locationReply.insertedCount} locations`);

  const trip = ctx.request.body.trip;
  if (trip) {
    console.log(`Storing trip information`);

    // rename
    trip.end_location = trip.current_location;
    delete trip.current_location;

    const tripReply = await ctx.trips.findOneAndReplace({ start: trip.start }, trip, {
      upsert: true,
      sort: { $natural: -1 },
    });
    console.log(`Stored ${tripReply.insertedCount} trips`);
  }

  ctx.body = {
    result: "ok",
  };
}
