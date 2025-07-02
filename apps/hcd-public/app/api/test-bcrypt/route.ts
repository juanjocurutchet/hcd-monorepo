import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"

export async function GET() {
  try {
    // Test bcrypt functionality
    const testPassword = "admin123"
    const hashedPassword = await bcrypt.hash(testPassword, 10)

    // Verify the hash
    const isValid = await bcrypt.compare(testPassword, hashedPassword)

    return NextResponse.json({
      message: "bcrypt test successful",
      testPassword,
      hashedPassword,
      isValid,
    })
  } catch (error) {
    console.error("Error testing bcrypt:", error)
    return NextResponse.json(
      {
        error: "Error testing bcrypt",
        details: error.message,
        stack: error.stack,
      },
      { status: 500 },
    )
  }
}
