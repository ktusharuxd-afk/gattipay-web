import { NextResponse } from "next/server";

export async function GET() {
  let data = { ethereum: { inr: 179000 }, binancecoin: { inr: 58000 } };

  try {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=ethereum,binancecoin&vs_currencies=inr",
      { next: { revalidate: 300 } }
    );
    if (res.ok) {
      const json = await res.json();
      if (json.ethereum?.inr && json.binancecoin?.inr) {
        data = json;
      }
    }
  } catch {}

  if (!data.ethereum.inr || !data.binancecoin.inr) {
    try {
      const ethRes = await fetch("https://api.binance.com/api/v3/ticker/price?symbol=ETHUSDT");
      const bnbRes = await fetch("https://api.binance.com/api/v3/ticker/price?symbol=BNBUSDT");
      const ethData = await ethRes.json();
      const bnbData = await bnbRes.json();
      const usdToInr = 83.5;
      const ethPrice = parseFloat(ethData?.price);
      const bnbPrice = parseFloat(bnbData?.price);
      if (ethPrice > 0 && bnbPrice > 0) {
        data = {
          ethereum: { inr: Math.round(ethPrice * usdToInr) },
          binancecoin: { inr: Math.round(bnbPrice * usdToInr) },
        };
      }
    } catch {}
  }

  const response = NextResponse.json(data);
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "GET");
  return response;
}