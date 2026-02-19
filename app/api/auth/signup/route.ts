import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/turso";
import { hashPassword } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await query("SELECT id FROM users WHERE email = ?", [email]);
    if (existingUser.length > 0) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    }

    const passwordHash = await hashPassword(password);

    // Generate IDs
    const businessId = crypto.randomUUID();
    const userId = crypto.randomUUID();

    // Create business with default values (to be filled during onboarding)
    await query(
      "INSERT INTO businesses (id, name, status) VALUES (?, ?, 'pending')",
      [businessId, "Pending", ]
    );

    // Create user
    await query(
      "INSERT INTO users (id, business_id, email, password_hash, role) VALUES (?, ?, ?, ?, ?)",
      [userId, businessId, email, passwordHash, "owner"]
    );

    return NextResponse.json({
      user: { id: userId, business_id: businessId, email, role: "owner" },
      message: "Account created successfully"
    });
  } catch (error) {
    console.error("Signup error:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ 
      error: "Internal server error", 
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined 
    }, { status: 500 });
  }
}
