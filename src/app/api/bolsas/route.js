import { getBolsas } from "../functions/select";

export async function GET() {
  try {
    const bolsas = await getBolsas();
    return new Response(JSON.stringify(bolsas), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching bolsas:", error);
    return new Response(JSON.stringify({ error: "Error fetching bolsas" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}