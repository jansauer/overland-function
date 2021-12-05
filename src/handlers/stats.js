const LOCATION_COLLECTION = "locations";
const TRIP_COLLECTION = "trips";

export async function statsHandler(ctx) {
  const client = await ctx.mongo;

  try {
    const locations = await client.db().collection(LOCATION_COLLECTION).countDocuments();
    console.log(`Fount ${locations} stored locations`);

    const trips = await client.db().collection(TRIP_COLLECTION).countDocuments();
    console.log(`Fount ${trips} stored trips`);

    ctx.body = {
      locations: locations,
      trips: trips,
    };
  } catch (error) {
    console.error(error);
    ctx.throw(400, "Unable to interact with the database");
  }
}
