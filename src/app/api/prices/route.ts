import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Try CoinGecko first
    const res = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=ethereum,binancecoin&vs_currencies=inr",
      { 
        headers: { "Accept": "application/json" },
        next: { revalidate: 300 } 
      }
    );
    
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
    
    // Fallback — hardcoded approximate prices
    return NextResponse.json({
      ethereum: { inr: 178000 },
      binancecoin: { inr: 58000 }
    });
    
  } catch {
    return NextResponse.json({
      ethereum: { inr: 178000 },
      binancecoin: { inr: 58000 }
    });
  }
}