import bcrypt from "bcryptjs";
import { db } from "./db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";

async function createAdminUser() {
  try {
    // Check if admin user already exists
    const [existingUser] = await db.select().from(users).where(eq(users.username, "admin"));
    
    if (existingUser) {
      console.log("Admin user already exists");
      return;
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash("password123", saltRounds);

    // Create admin user
    const [user] = await db
      .insert(users)
      .values({
        username: "admin",
        password: hashedPassword,
        role: "manager",
      })
      .returning();

    console.log("Admin user created successfully:", {
      id: user.id,
      username: user.username,
      role: user.role,
    });
  } catch (error) {
    console.error("Error creating admin user:", error);
  } finally {
    process.exit(0);
  }
}

createAdminUser();