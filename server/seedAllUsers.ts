import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { users } from "../shared/schema.js";
import { realAEOs, realSchools, realHeadmasters } from "../client/src/data/realData.js";
import { eq } from "drizzle-orm";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const client = postgres(connectionString);
const db = drizzle(client);

/**
 * Comprehensive seed script to create all user accounts
 * - 1 CEO
 * - 1 DEO
 * - 1 DDEO
 * - 16 AEOs
 * - 16 Headmasters (one per school)
 * - 32 Teachers (two per school)
 */
async function seedAllUsers() {
  console.log("Starting comprehensive user seeding...\n");

  const defaultPassword = "admin123"; // Default password for all users

  try {
    let created = 0;
    let existing = 0;

    // 1. Create CEO account
    console.log("=== Creating CEO Account ===");
    const ceoData = {
      name: "CEO - Chief Executive Officer",
      phoneNumber: "03000000001",
      password: defaultPassword,
      role: "CEO",
      clusterId: null,
      districtId: "district-1",
      schoolId: null,
      schoolName: null,
    };

    const existingCEO = await db.select().from(users).where(eq(users.phoneNumber, ceoData.phoneNumber)).limit(1);
    if (existingCEO.length === 0) {
      await db.insert(users).values(ceoData);
      console.log(`✓ Created: ${ceoData.name} (${ceoData.phoneNumber})`);
      created++;
    } else {
      console.log(`⊘ Already exists: ${ceoData.name} (${ceoData.phoneNumber})`);
      existing++;
    }

    // 2. Create DEO account
    console.log("\n=== Creating DEO Account ===");
    const deoData = {
      name: "DEO - District Education Officer",
      phoneNumber: "03000000002",
      password: defaultPassword,
      role: "DEO",
      clusterId: null,
      districtId: "district-1",
      schoolId: null,
      schoolName: null,
    };

    const existingDEO = await db.select().from(users).where(eq(users.phoneNumber, deoData.phoneNumber)).limit(1);
    if (existingDEO.length === 0) {
      await db.insert(users).values(deoData);
      console.log(`✓ Created: ${deoData.name} (${deoData.phoneNumber})`);
      created++;
    } else {
      console.log(`⊘ Already exists: ${deoData.name} (${deoData.phoneNumber})`);
      existing++;
    }

    // 3. Create DDEO account
    console.log("\n=== Creating DDEO Account ===");
    const ddeoData = {
      name: "DDEO - Deputy District Education Officer",
      phoneNumber: "03000000003",
      password: defaultPassword,
      role: "DDEO",
      clusterId: null,
      districtId: "district-1",
      schoolId: null,
      schoolName: null,
    };

    const existingDDEO = await db.select().from(users).where(eq(users.phoneNumber, ddeoData.phoneNumber)).limit(1);
    if (existingDDEO.length === 0) {
      await db.insert(users).values(ddeoData);
      console.log(`✓ Created: ${ddeoData.name} (${ddeoData.phoneNumber})`);
      created++;
    } else {
      console.log(`⊘ Already exists: ${ddeoData.name} (${ddeoData.phoneNumber})`);
      existing++;
    }

    // 4. Create AEO accounts (16)
    console.log("\n=== Creating AEO Accounts (16) ===");
    for (const aeo of realAEOs) {
      const existingUser = await db.select().from(users).where(eq(users.phoneNumber, aeo.phoneNumber)).limit(1);

      if (existingUser.length === 0) {
        await db.insert(users).values({
          name: aeo.name,
          phoneNumber: aeo.phoneNumber,
          password: defaultPassword,
          role: "AEO",
          clusterId: aeo.clusterId,
          districtId: "district-1",
          schoolId: null,
          schoolName: null,
        });
        console.log(`✓ Created: ${aeo.name} (${aeo.phoneNumber})`);
        created++;
      } else {
        console.log(`⊘ Already exists: ${aeo.name} (${aeo.phoneNumber})`);
        existing++;
      }
    }

    // 5. Create Headmaster accounts (16 - one per school)
    console.log("\n=== Creating Headmaster Accounts (16) ===");
    for (const headmaster of realHeadmasters) {
      const existingUser = await db.select().from(users).where(eq(users.phoneNumber, headmaster.phoneNumber)).limit(1);

      if (existingUser.length === 0) {
        await db.insert(users).values({
          name: headmaster.name,
          phoneNumber: headmaster.phoneNumber,
          password: defaultPassword,
          role: "HEAD_TEACHER",
          clusterId: headmaster.clusterId,
          districtId: headmaster.districtId,
          schoolId: headmaster.schoolId,
          schoolName: headmaster.schoolName,
        });
        console.log(`✓ Created: ${headmaster.name} (${headmaster.phoneNumber})`);
        created++;
      } else {
        console.log(`⊘ Already exists: ${headmaster.name} (${headmaster.phoneNumber})`);
        existing++;
      }
    }

    // 6. Create Teacher accounts (32 - two per school)
    console.log("\n=== Creating Teacher Accounts (32 - 2 per school) ===");
    let teacherPhoneCounter = 1;

    for (const school of realSchools) {
      // Teacher 1 for this school
      const teacher1Phone = `03003${String(teacherPhoneCounter).padStart(6, '0')}`;
      const teacher1Data = {
        name: `Teacher 1 - ${school.name}`,
        phoneNumber: teacher1Phone,
        password: defaultPassword,
        role: "TEACHER",
        clusterId: school.clusterId,
        districtId: school.districtId,
        schoolId: school.code,
        schoolName: school.name,
      };

      const existingTeacher1 = await db.select().from(users).where(eq(users.phoneNumber, teacher1Phone)).limit(1);
      if (existingTeacher1.length === 0) {
        await db.insert(users).values(teacher1Data);
        console.log(`✓ Created: ${teacher1Data.name} (${teacher1Phone})`);
        created++;
      } else {
        console.log(`⊘ Already exists: ${teacher1Data.name} (${teacher1Phone})`);
        existing++;
      }
      teacherPhoneCounter++;

      // Teacher 2 for this school
      const teacher2Phone = `03003${String(teacherPhoneCounter).padStart(6, '0')}`;
      const teacher2Data = {
        name: `Teacher 2 - ${school.name}`,
        phoneNumber: teacher2Phone,
        password: defaultPassword,
        role: "TEACHER",
        clusterId: school.clusterId,
        districtId: school.districtId,
        schoolId: school.code,
        schoolName: school.name,
      };

      const existingTeacher2 = await db.select().from(users).where(eq(users.phoneNumber, teacher2Phone)).limit(1);
      if (existingTeacher2.length === 0) {
        await db.insert(users).values(teacher2Data);
        console.log(`✓ Created: ${teacher2Data.name} (${teacher2Phone})`);
        created++;
      } else {
        console.log(`⊘ Already exists: ${teacher2Data.name} (${teacher2Phone})`);
        existing++;
      }
      teacherPhoneCounter++;
    }

    // Summary
    console.log("\n" + "=".repeat(60));
    console.log("✅ USER SEEDING COMPLETED SUCCESSFULLY!");
    console.log("=".repeat(60));
    console.log(`\n📊 Summary:`);
    console.log(`   • Created: ${created} new accounts`);
    console.log(`   • Existing: ${existing} accounts already present`);
    console.log(`   • Total: ${created + existing} accounts\n`);

    console.log(`🔐 Default Password: ${defaultPassword}`);
    console.log(`   (Users can change their password after first login)\n`);

    console.log("📋 Account Breakdown:");
    console.log("   • 1 CEO");
    console.log("   • 1 DEO");
    console.log("   • 1 DDEO");
    console.log("   • 16 AEOs");
    console.log("   • 16 Headmasters");
    console.log("   • 32 Teachers");
    console.log("   ───────────────");
    console.log("   • 67 Total Users\n");

    console.log("📱 Sample Login Credentials:");
    console.log("   CEO:         03000000001 / admin123");
    console.log("   DEO:         03000000002 / admin123");
    console.log("   DDEO:        03000000003 / admin123");
    console.log("   AEO:         03001000001 / admin123");
    console.log("   Headmaster:  03002000001 / admin123");
    console.log("   Teacher:     03003000001 / admin123\n");

  } catch (error) {
    console.error("\n❌ Error seeding users:", error);
    throw error;
  }
}

// Run the seed function
seedAllUsers()
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
