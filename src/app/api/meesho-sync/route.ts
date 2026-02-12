import { NextRequest, NextResponse } from "next/server";
import { syncMeeshoCharge } from "@/lib/meesho/meeshoSync";

export async function POST(request: NextRequest) {
  try {
    const { hash, charge } = await request.json();

    if (!hash || charge === undefined) {
      return NextResponse.json({ error: "Missing hash or charge" }, { status: 400 });
    }

    const product = await syncMeeshoCharge(hash, charge);

    return NextResponse.json({
      message: "Synchronized with Meesho successfully",
      product,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    console.error("Meesho sync error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
