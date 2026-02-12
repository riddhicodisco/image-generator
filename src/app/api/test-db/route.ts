
import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

export async function GET() {
  try {
    console.log("Test DB route hit");
    const count = await prisma.product.count();
    console.log("DB Count:", count);
    return NextResponse.json({ status: "ok", count });
  } catch (error: any) {
    console.error("Test DB error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
