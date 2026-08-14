import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Use Binance public API — no rate limit, no CORS
    const [ethRes, bnbRes] = await Promise.all([
      fetch("https://api.binance.com/api/v3/ticker/price?symbol=ETHUSDT"),
      fetch("https://api.binance.com/api/v3/ticker/price?symbol=BNBUSDT"),
      fetch("https://api.binance.com/api/v3/ticker/price?symbol=USDTINR").catch(() => null),
    ]);

    const ethData = await ethRes.json();
    const bnbData = await bnbRes.json();

    // Approximate USD to INR rate
    const usdToInr = 83.5;

    const ethInr = Math.round(parseFloat(ethData.price) * usdToInr);
    const bnbInr = Math.round(parseFloat(bnbData.price) * usdToInr);

    return NextResponse.json({
      ethereum: { inr: ethInr },
      binancecoin: { inr: bnbInr },
    });
  } catch {
    return NextResponse.json({
      ethereum: { inr: 178000 },
      binancecoin: { inr: 58000 },
    });
  }
}