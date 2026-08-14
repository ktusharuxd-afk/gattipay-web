import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get("address");

  if (!address) {
    return NextResponse.json({ result: [] });
  }

  try {
    const res = await fetch(
      `https://api.etherscan.io/v2/api?chainid=56&module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=10&sort=desc`
    );
    const data = await res.json();
    
    const response = NextResponse.json(data);
    response.headers.set("Access-Control-Allow-Origin", "*");
    return response;
  } catch {
    return NextResponse.json({ result: [] });
  }
}