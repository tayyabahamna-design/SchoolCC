import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { users } from "../shared/schema.js";
import { realAEOs } from "../client/src/data/realData.js";
import { eq } from "drizzle-orm";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const client = postgres(connectionString);
const db = drizzle(client);

/**
 * Seed script to create user accounts for all AEOs
 * Username: Phone number (e.g., 03001000001)
 * Default password: aeo123 (can be changed later)
 */
async function seedAEOUsers() {
  console.log("Starting AEO user seeding...");

  const defaultPassword = "aeo123"; // Default password for all AEOs

  try {
    for (const aeo of realAEOs) {
      // Check if user already exists
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.phoneNumber, aeo.phoneNumber))
        .limit(1);

      if (existingUser.length > 0) {
        console.log(`User already exists: ${aeo.name} (${aeo.phoneNumber})`);
        continue;
      }

      // Create new user account
      const newUser = await db.insert(users).values({
        name: aeo.name,
        phoneNumber: aeo.phoneNumber,
        password: defaultPassword,
        role: "AEO",
        clusterId: aeo.clusterId,
        districtId: "district-1", // All AEOs are in district-1 for now
        schoolId: null,
        schoolName: null,
      }).returning();

      console.log(`✓ Created user: ${newUser[0].name} (${newUser[0].phoneNumber})`);
    }

    console.log("\n✅ AEO user seeding completed successfully!");
    console.log(`\nTotal AEOs processed: ${realAEOs.length}`);
    console.log(`Default password for all AEOs: ${defaultPassword}`);
    console.log("\nAEO Login Credentials:");
    console.log("========================");
    realAEOs.forEach((aeo, index) => {
      console.log(`${index + 1}. ${aeo.name}`);
      console.log(`   Phone: ${aeo.phoneNumber}`);
      console.log(`   Area: ${aeo.area}`);
      console.log(`   Password: ${defaultPassword}`);
      console.log("");
    });

  } catch (error) {
    console.error("Error seeding AEO users:", error);
    throw error;
  }
}

// Run the seed function
seedAEOUsers()
  .then(async () => {
    console.log("Seed script finished.");
    await client.end();
    process.exit(0);
  })
  .catch(async (error) => {
    console.error("Seed script failed:", error);
    await client.end();
    process.exit(1);
  });
