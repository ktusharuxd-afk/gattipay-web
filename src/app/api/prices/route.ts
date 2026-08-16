import { NextResponse } from "next/server";

export async function GET() {
  let data = {
    ethereum: { inr: 179000, change24h: 0 },
    binancecoin: { inr: 58000, change24h: 0 },
  };

  try {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=ethereum,binancecoin&vs_currencies=inr&include_24hr_change=true",
      { next: { revalidate: 300 } }
    );
    if (res.ok) {
      const json = await res.json();
      if (json.ethereum?.inr && json.binancecoin?.inr) {
        data = {
          ethereum: { inr: json.ethereum.inr, change24h: json.ethereum.inr_24h_change || 0 },
          binancecoin: { inr: json.binancecoin.inr, change24h: json.binancecoin.inr_24h_change || 0 },
        };
      }
    }
  } catch {}

  if (!data.ethereum.inr || !data.binancecoin.inr) {
    try {
      const ethRes = await fetch("https://api.binance.com/api/v3/ticker/24hr?symbol=ETHUSDT");
      const bnbRes = await fetch("https://api.binance.com/api/v3/ticker/24hr?symbol=BNBUSDT");
      const ethData = await ethRes.json();
      const bnbData = await bnbRes.json();
      const usdToInr = 83.5;
      const ethPrice = parseFloat(ethData?.lastPrice);
      const bnbPrice = parseFloat(bnbData?.lastPrice);
      if (ethPrice > 0 && bnbPrice > 0) {
        data = {
          ethereum: { inr: Math.round(ethPrice * usdToInr), change24h: parseFloat(ethData?.priceChangePercent) || 0 },
          binancecoin: { inr: Math.round(bnbPrice * usdToInr), change24h: parseFloat(bnbData?.priceChangePercent) || 0 },
        };
      }
    } catch {}
  }

  const response = NextResponse.json(data);
  response.headers.set("Access-Control-Allow-Origin", "*");
  return response;
}
