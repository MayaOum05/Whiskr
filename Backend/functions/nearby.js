export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const zip = url.searchParams.get("zip");
  if (!zip) {
    return new Response(JSON.stringify({ error: "Missing ZIP" }), { status: 400 });
  }

  const geoRes = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${zip}&key=${env.GOOGLE_MAPS_API_KEY}`
  );
  const geoData = await geoRes.json();
  if (!geoData.results.length) {
    return new Response(JSON.stringify({ error: "Invalid ZIP code" }), { status: 404 });
  }

  const { lat, lng } = geoData.results[0].geometry.location;

  const nearbyRes = await fetch(
    `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=5000&keyword=vet|groomer&key=${env.GOOGLE_MAPS_API_KEY}`
  );
  const nearbyData = await nearbyRes.json();

  const results = nearbyData.results.map((r) => ({
    name: r.name,
    address: r.vicinity,
    rating: r.rating,
    reviews: r.user_ratings_total,
    price: r.price_level || "N/A",
    types: r.types,
    // Placeholder for Gemini summary
    aiSummary: "(AI summary coming soon)",
  }));

  return new Response(JSON.stringify(results), {
    headers: { "Content-Type": "application/json" },
  });
}
