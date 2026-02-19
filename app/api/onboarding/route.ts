import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/turso";

export async function POST(request: NextRequest) {
  try {
    const {
      businessId,
      userId,
      businessName,
      ownerName,
      phone,
      industry,
      heardAboutUs,
      businessSize,
      primaryConcern,
    } = await request.json();

    if (!businessId || !userId || !businessName || !ownerName || !phone) {
      return NextResponse.json(
        { error: "Required fields are missing" },
        { status: 400 }
      );
    }

    // Update business details
    await query(
      `UPDATE businesses 
       SET name = ?, industry = ?, phone = ?, owner_name = ?, status = 'active', updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [businessName, industry, phone, ownerName, businessId]
    );

    // Update user details with onboarding info
    await query(
      `UPDATE users 
       SET full_name = ?, phone = ?, heard_about_us = ?, business_size = ?, 
           primary_concern = ?, onboarding_completed = 1, onboarding_completed_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [ownerName, phone, heardAboutUs, businessSize, primaryConcern, userId]
    );

    // Generate initial activation code for the business
    const activationCode = generateActivationCode();
    const activationCodeId = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(); // 1 year

    await query(
      `INSERT INTO activation_codes (id, code, business_id, status, created_by, expires_at, max_uses)
       VALUES (?, ?, ?, 'active', ?, ?, -1)`,
      [activationCodeId, activationCode, businessId, userId, expiresAt]
    );

    return NextResponse.json({
      success: true,
      message: "Onboarding completed successfully",
      activationCode,
    });
  } catch (error) {
    console.error("Onboarding error:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      {
        error: "Failed to complete onboarding",
        details: process.env.NODE_ENV === "development" ? errorMessage : undefined,
      },
      { status: 500 }
    );
  }
}

// Generate activation code with format: rax-XXXXXX-XXXX
function generateActivationCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const part1 = Array.from({ length: 6 }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join("");
  const part2 = Array.from({ length: 4 }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join("");
  return `rax-${part1}-${part2}`;
}
