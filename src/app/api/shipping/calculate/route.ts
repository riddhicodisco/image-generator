import { NextRequest, NextResponse } from "next/server";
import { calculateMeeshoShipping } from "@/lib/shipping/calc";

export async function POST(request: NextRequest) {
  try {
    const { weight, zone } = await request.json();

    if (weight === undefined || !zone) {
      return NextResponse.json({ error: "Missing weight or zone" }, { status: 400 });
    }

    const result = calculateMeeshoShipping(Number(weight), zone);

    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    console.error("Calculation error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
