/**
 * Prisma Database Seed Script
 *
 * This script populates the database with demo data for development and testing.
 * Run with: npm run db:seed
 */

import { PrismaClient } from "@prisma/client";
import { getDemoUsers } from "../src/lib/db/seed-data/users";
import {
  getDemoTrips,
  getDemoBudgets,
  getDemoCollaborators,
  getDemoTags,
} from "../src/lib/db/seed-data/trips";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...\n");

  // Clear existing data (in development only)
  if (process.env.NODE_ENV === "development") {
    console.log("🗑️  Clearing existing data...");

    // Delete in reverse order of dependencies
    await prisma.tag.deleteMany();
    await prisma.budget.deleteMany();
    await prisma.tripCollaborator.deleteMany();
    await prisma.trip.deleteMany();
    await prisma.passwordResetToken.deleteMany();
    await prisma.verificationToken.deleteMany();
    await prisma.session.deleteMany();
    await prisma.account.deleteMany();
    await prisma.user.deleteMany();

    console.log("✅ Cleared existing data\n");
  }

  // Seed Users
  console.log("👥 Seeding users...");
  const users = await getDemoUsers();

  for (const userData of users) {
    await prisma.user.create({
      data: userData,
    });
    console.log(`   ✓ Created user: ${userData.email}`);
  }
  console.log(`✅ Created ${users.length} users\n`);

  // Seed Trips
  console.log("✈️  Seeding trips...");
  const trips = getDemoTrips();

  for (const tripData of trips) {
    await prisma.trip.create({
      data: tripData,
    });
    console.log(`   ✓ Created trip: ${tripData.name}`);
  }
  console.log(`✅ Created ${trips.length} trips\n`);

  // Seed Budgets
  console.log("💰 Seeding budgets...");
  const budgets = getDemoBudgets();

  for (const budgetData of budgets) {
    await prisma.budget.create({
      data: budgetData,
    });
    console.log(`   ✓ Created budget for trip: ${budgetData.tripId}`);
  }
  console.log(`✅ Created ${budgets.length} budgets\n`);

  // Seed Collaborators
  console.log("🤝 Seeding collaborators...");
  const collaborators = getDemoCollaborators();

  for (const collabData of collaborators) {
    await prisma.tripCollaborator.create({
      data: collabData,
    });
    console.log(
      `   ✓ Added collaborator to trip: ${collabData.tripId}`
    );
  }
  console.log(`✅ Created ${collaborators.length} collaborations\n`);

  // Seed Tags
  console.log("🏷️  Seeding tags...");
  const tags = getDemoTags();

  for (const tagData of tags) {
    await prisma.tag.create({
      data: tagData,
    });
  }
  console.log(`✅ Created ${tags.length} tags\n`);

  console.log("🎉 Database seeding completed successfully!\n");
  console.log("Demo accounts:");
  console.log("  - admin@wanderplan.com (password: password123)");
  console.log("  - traveler@wanderplan.com (password: password123)");
  console.log("  - agent@wanderplan.com (password: password123)\n");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:");
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
