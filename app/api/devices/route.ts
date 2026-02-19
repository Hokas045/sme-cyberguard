import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/turso";

export async function GET(request: NextRequest) {
  try {
    // Get business ID (for now, assume first)
    const businesses = await query("SELECT id FROM businesses LIMIT 1");
    if (businesses.length === 0) {
      return NextResponse.json({ error: "No business found" }, { status: 404 });
    }
    
    const businessId = businesses[0].id;
    
    // Get devices for business
    const devices = await query(
      "SELECT id, hostname, os, os_version, agent_version, last_seen, status FROM devices WHERE business_id = ? ORDER BY last_seen DESC",
      [businessId]
    );
    
    return NextResponse.json({ devices });
  } catch (error) {
    console.error("Devices API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
