const COLLECTION = process.env.MONGODB_DATABASE || "locations";

export async function handler(ctx) {
  ctx.assert(ctx.method == "POST", 405, "Method Not Allowed");

  const locations = ctx.request.body.locations;
  ctx.assert(locations?.length, 400, "No Locations Found");

  console.log(`Storing ${locations.length} locations`);
  try {
    const client = await ctx.mongo;
    const reply = await client.db().collection(COLLECTION).insertMany(locations);
    console.log(`Stored ${reply.insertedCount} locations`);
  } catch (error) {
    ctx.throw(400, "Unable to store locations");
  }

  if (ctx.request.body.trip) {
    console.log(`TODO: Found unused and not saved trip information`);
    console.log(ctx.request.body.trip);
  }

  ctx.body = {
    result: "ok",
  };
}
