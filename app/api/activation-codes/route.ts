import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/turso";

// GET - List all activation codes for a business
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get("businessId");

    if (!businessId) {
      return NextResponse.json({ error: "Business ID is required" }, { status: 400 });
    }

    const codes = await query(
      `SELECT 
        ac.id,
        ac.code,
        ac.status,
        ac.created_at,
        ac.expires_at,
        ac.used_count,
        ac.max_uses,
        ac.last_used_at,
        ac.revoked_at,
        ac.revoked_reason,
        u.email as created_by_email,
        CASE 
          WHEN ac.status = 'revoked' THEN 'Revoked'
          WHEN ac.expires_at < datetime('now') THEN 'Expired'
          WHEN ac.max_uses > 0 AND ac.used_count >= ac.max_uses THEN 'Limit Reached'
          ELSE 'Active'
        END as effective_status
       FROM activation_codes ac
       LEFT JOIN users u ON ac.created_by = u.id
       WHERE ac.business_id = ?
       ORDER BY ac.created_at DESC`,
      [businessId]
    );

    return NextResponse.json({ codes });
  } catch (error) {
    console.error("Error fetching activation codes:", error);
    return NextResponse.json(
      { error: "Failed to fetch activation codes" },
      { status: 500 }
    );
  }
}

// POST - Generate a new activation code
export async function POST(request: NextRequest) {
  try {
    const { businessId, userId, expiresInDays = 365, maxUses = -1 } = await request.json();

    if (!businessId || !userId) {
      return NextResponse.json(
        { error: "Business ID and User ID are required" },
        { status: 400 }
      );
    }

    const activationCode = generateActivationCode();
    const activationCodeId = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toISOString();

    await query(
      `INSERT INTO activation_codes (id, code, business_id, status, created_by, expires_at, max_uses)
       VALUES (?, ?, ?, 'active', ?, ?, ?)`,
      [activationCodeId, activationCode, businessId, userId, expiresAt, maxUses]
    );

    return NextResponse.json({
      success: true,
      code: activationCode,
      id: activationCodeId,
      expiresAt,
    });
  } catch (error) {
    console.error("Error generating activation code:", error);
    return NextResponse.json(
      { error: "Failed to generate activation code" },
      { status: 500 }
    );
  }
}

// DELETE/PUT - Revoke an activation code
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const codeId = searchParams.get("codeId");
    const userId = searchParams.get("userId");
    const reason = searchParams.get("reason") || "Revoked by user";

    if (!codeId || !userId) {
      return NextResponse.json(
        { error: "Code ID and User ID are required" },
        { status: 400 }
      );
    }

    // Check if code exists and is active
    const existingCode = await query(
      "SELECT id, status FROM activation_codes WHERE id = ?",
      [codeId]
    );

    if (existingCode.length === 0) {
      return NextResponse.json({ error: "Activation code not found" }, { status: 404 });
    }

    if (existingCode[0].status === "revoked") {
      return NextResponse.json(
        { error: "Activation code is already revoked" },
        { status: 400 }
      );
    }

    // Revoke the code
    await query(
      `UPDATE activation_codes 
       SET status = 'revoked', revoked_at = CURRENT_TIMESTAMP, revoked_by = ?, revoked_reason = ?
       WHERE id = ?`,
      [userId, reason, codeId]
    );

    return NextResponse.json({
      success: true,
      message: "Activation code revoked successfully",
    });
  } catch (error) {
    console.error("Error revoking activation code:", error);
    return NextResponse.json(
      { error: "Failed to revoke activation code" },
      { status: 500 }
    );
  }
}

// Generate activation code with format: rax-XXXXXX-XXXX
function generateActivationCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const part1 = Array.from({ length: 6 }, () =>
    chars.charAt(Math.floor(Math.random() * chars.length))
  ).join("");
  const part2 = Array.from({ length: 4 }, () =>
    chars.charAt(Math.floor(Math.random() * chars.length))
  ).join("");
  return `rax-${part1}-${part2}`;
}
