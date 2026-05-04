import { PrismaClient, PersonalityType } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();
  try {
    console.log('--- Database Connection Test ---');
    
    // Find any user
    const user = await prisma.user.findFirst();
    if (!user) {
      console.log('No users found in database.');
      return;
    }

    console.log('Found user:', user.email);
    console.log('Current profile data:');
    console.log({
      name: user.name,
      age_group: user.age_group,
      personality_type: user.personality_type,
      goals: user.goals,
      notifications_enabled: user.notifications_enabled,
      reminders_enabled: user.reminders_enabled,
      weekly_insights_enabled: user.weekly_insights_enabled,
      marketing_emails_enabled: user.marketing_emails_enabled,
    });

    // Test update (optional, but good for verification)
    console.log('\n--- Testing Update ---');
    const updatedUser = await prisma.user.update({
      where: { email: user.email },
      data: {
        marketing_emails_enabled: !user.marketing_emails_enabled, // Toggle it
      }
    });

    console.log('Successfully toggled marketing_emails_enabled to:', updatedUser.marketing_emails_enabled);
    console.log('--- Test Completed Successfully ---');
    
  } catch (e) {
    console.error('Test Failed with Error:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
