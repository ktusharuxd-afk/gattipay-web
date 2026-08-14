import { NextResponse } from "next/server";

export async function GET() {
  // Try CoinGecko (server-side — no CORS issue)
  try {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=ethereum,binancecoin&vs_currencies=inr",
      { next: { revalidate: 300 } }
    );
    if (res.ok) {
      const data = await res.json();
      if (data.ethereum?.inr && data.binancecoin?.inr) {
        return NextResponse.json(data);
      }
    }
  } catch {}

  // Try Binance fallback
  try {
    const ethRes = await fetch("https://api.binance.com/api/v3/ticker/price?symbol=ETHUSDT");
    const bnbRes = await fetch("https://api.binance.com/api/v3/ticker/price?symbol=BNBUSDT");
    const ethData = await ethRes.json();
    const bnbData = await bnbRes.json();
    const usdToInr = 83.5;
    const ethPrice = parseFloat(ethData?.price);
    const bnbPrice = parseFloat(bnbData?.price);
    if (ethPrice > 0 && bnbPrice > 0) {
      return NextResponse.json({
        ethereum: { inr: Math.round(ethPrice * usdToInr) },
        binancecoin: { inr: Math.round(bnbPrice * usdToInr) },
      });
    }
  } catch {}

  // Hardcoded fallback
  return NextResponse.json({
    ethereum: { inr: 179000 },
    binancecoin: { inr: 58000 },
  });
}