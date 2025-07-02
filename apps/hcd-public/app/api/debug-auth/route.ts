import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    console.log("Debug auth endpoint called")

    // Get the admin user
    const users = await sql`
      SELECT id, name, email, password, role
      FROM users
      WHERE email = 'admin@hcdlasflores.gob.ar'
    `

    if (users.length === 0) {
      console.log("Admin user not found")
      return NextResponse.json({ error: "Admin user not found" }, { status: 404 })
    }

    const user = users[0]
    console.log("Found user:", user.id, user.email, user.role)

    // Test password against stored hash
    const testPassword = "admin123"
    let isPasswordValid = false

    try {
      isPasswordValid = await bcrypt.compare(testPassword, user.password)
      console.log("Password valid:", isPasswordValid)
      console.log("Stored hash:", user.password)
    } catch (error) {
      console.error("Error comparing password:", error)
      return NextResponse.json(
        {
          error: "Error comparing password",
          details: error instanceof Error ? error.message : "Unknown error",
          storedHash: user.password,
        },
        { status: 500 },
      )
    }

    // Generate a new hash for comparison
    const newHash = await bcrypt.hash(testPassword, 10)
    console.log("New hash generated:", newHash)

    // Update the password if it doesn't match
    if (!isPasswordValid) {
      console.log("Password invalid, updating...")
      await sql`
        UPDATE users
        SET password = ${newHash}
        WHERE id = ${user.id}
      `

      return NextResponse.json({
        message: "Password updated successfully",
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
        passwordInfo: {
          oldHash: user.password,
          newHash: newHash,
          wasValid: isPasswordValid,
        },
      })
    }

    return NextResponse.json({
      message: "Password is already valid",
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      passwordInfo: {
        hash: user.password,
        isValid: isPasswordValid,
      },
    })
  } catch (error) {
    console.error("Error in debug-auth:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
