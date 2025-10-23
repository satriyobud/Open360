const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function resetFeedback() {
  try {
    console.log('🔄 Resetting feedback data...');
    
    // Delete all feedback records
    const deletedFeedbacks = await prisma.feedback.deleteMany({});
    
    console.log(`✅ Deleted ${deletedFeedbacks.count} feedback records`);
    console.log('🎉 Feedback data reset complete!');
    console.log('📊 Other data (users, categories, questions, assignments) preserved');
    
  } catch (error) {
    console.error('❌ Error resetting feedback:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetFeedback();
