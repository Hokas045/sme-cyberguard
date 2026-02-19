import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/turso";

export async function GET(request: NextRequest) {
  try {
    // Get business ID from authenticated user (for now, assume first)
    const businesses = await query("SELECT id FROM businesses LIMIT 1");
    if (businesses.length === 0) {
      return NextResponse.json({ error: "No business found" }, { status: 404 });
    }
    
    const businessId = businesses[0].id;
    
    // Get counts for dashboard
    const [[deviceCount], [threatCount], [quarantinedCount]] = await Promise.all([
      query("SELECT COUNT(*) as count FROM devices WHERE business_id = ?", [businessId]),
      query("SELECT COUNT(*) as count FROM threat_alerts WHERE business_id = ? AND status = open", [businessId]),
      query("SELECT COUNT(*) as count FROM quarantined_threats WHERE business_id = ? AND status = quarantined", [businessId])
    ]);
    
    const riskScore = await query("SELECT score FROM risk_score_history WHERE business_id = ? ORDER BY recorded_at DESC LIMIT 1", [businessId]);
    
    return NextResponse.json({
      deviceCount: deviceCount.count,
      threatCount: threatCount.count,
      quarantinedCount: quarantinedCount.count,
      riskScore: riskScore.length > 0 ? riskScore[0].score : 0
    });
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
