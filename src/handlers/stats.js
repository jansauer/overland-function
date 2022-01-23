export async function stats(ctx) {
  const totalLocations = await ctx.locations.countDocuments();
  console.log(`Found ${totalLocations} stored locations`);

  const totalTrips = await ctx.trips.countDocuments();
  console.log(`Found ${totalTrips} stored trips`);

  const latestLocation = await ctx.locations.findOne({}, { sort: { $natural: -1 } });
  console.log(`Found latest location ${JSON.stringify(latestLocation)}`);

  ctx.body = {
    totalLocations,
    totalTrips,
    latestLocation: latestLocation?.properties?.timestamp,
  };
}
