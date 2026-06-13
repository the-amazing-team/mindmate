import { PrismaClient } from "@prisma/client";

async function main() {
  const prisma = new PrismaClient();
  try {
    console.log("--- Insights Data Test ---");

    // Find any user
    const user = await prisma.user.findFirst();
    if (!user) {
      console.log("No users found in database.");
      return;
    }

    console.log("Testing for user:", user.email);

    // Check insights
    const insights = await prisma.insight.findMany({
      where: { user_id: user.id },
      orderBy: { created_at: "desc" },
    });

    console.log(`Found ${insights.length} insights.`);
    if (insights.length > 0) {
      insights.forEach((ins, i) => {
        console.log(`\nInsight ${i + 1}:`);
        console.log(`Summary: ${ins.summary}`);
        console.log(`Recommendation: ${ins.recommendation}`);
      });
    } else {
      console.log("No insights found for this user.");
      console.log("Checking if there are any journal entries to generate insights from...");
      const entries = await prisma.journalEntry.findMany({
        where: { user_id: user.id },
      });
      console.log(`Found ${entries.length} journal entries.`);
    }

    console.log("\n--- Test Completed ---");
  } catch (e) {
    console.error("Test Failed:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
