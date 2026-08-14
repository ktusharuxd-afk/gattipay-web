import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get("address");

  if (!address) {
    return NextResponse.json({ result: [] });
  }

  try {
    const res = await fetch(
      `https://api.bscscan.com/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=10&sort=desc`
    );
    const data = await res.json();
    
    if (data.status === "1" && Array.isArray(data.result)) {
      const response = NextResponse.json(data);
      response.headers.set("Access-Control-Allow-Origin", "*");
      return response;
    }
  } catch {}

  // Fallback — return empty
  const response = NextResponse.json({ result: [] });
  response.headers.set("Access-Control-Allow-Origin", "*");
  return response;
}