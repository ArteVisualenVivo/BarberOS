import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ error: "MercadoPago checkout disabled in this project." }, { status: 404 });
}

