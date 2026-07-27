import { NextResponse } from "next/server";
import { createLabel } from "@/lib/actions/labels";

export async function POST(request: Request) {
  try {
    const { name, color } = await request.json();
    if (!name || !color) {
      return NextResponse.json({ error: "Missing name or color" }, { status: 400 });
    }
    const label = await createLabel(name, color);
    return NextResponse.json(label);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
