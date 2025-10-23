const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@company.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@company.com',
      passwordHash: adminPassword,
      role: 'ADMIN'
    }
  });

  // Create employee users
  const employeePassword = await bcrypt.hash('employee123', 10);
  const employee1 = await prisma.user.upsert({
    where: { email: 'employee@company.com' },
    update: {},
    create: {
      name: 'John Employee',
      email: 'employee@company.com',
      passwordHash: employeePassword,
      role: 'EMPLOYEE',
      managerId: admin.id
    }
  });

  const employee2 = await prisma.user.upsert({
    where: { email: 'jane@company.com' },
    update: {},
    create: {
      name: 'Jane Smith',
      email: 'jane@company.com',
      passwordHash: employeePassword,
      role: 'EMPLOYEE',
      managerId: admin.id
    }
  });

  const employee3 = await prisma.user.upsert({
    where: { email: 'bob@company.com' },
    update: {},
    create: {
      name: 'Bob Johnson',
      email: 'bob@company.com',
      passwordHash: employeePassword,
      role: 'EMPLOYEE',
      managerId: employee1.id
    }
  });

  // Create review cycle
  const reviewCycle = await prisma.reviewCycle.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'Q4 2024 Performance Review',
      startDate: new Date('2024-10-01'),
      endDate: new Date('2024-12-31')
    }
  });

  // Create categories
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'Leadership',
        description: 'Leadership and management capabilities'
      }
    }),
    prisma.category.create({
      data: {
        name: 'Communication',
        description: 'Communication skills and effectiveness'
      }
    }),
    prisma.category.create({
      data: {
        name: 'Teamwork',
        description: 'Collaboration and team working abilities'
      }
    }),
    prisma.category.create({
      data: {
        name: 'Problem Solving',
        description: 'Analytical thinking and problem-solving skills'
      }
    })
  ]);

  // Use categories by their array order (they are created in the order specified)
  const leadershipCategory = categories[0];      // id: 1
  const communicationCategory = categories[1];   // id: 2  
  const teamworkCategory = categories[2];        // id: 3
  const problemSolvingCategory = categories[3];  // id: 4

  // Create questions
  const questions = await Promise.all([
    // Leadership questions (5 questions)
    prisma.question.create({
      data: {
        categoryId: leadershipCategory.id,
        text: 'This person demonstrates strong leadership skills and inspires others to perform at their best.'
      }
    }),
    prisma.question.create({
      data: {
        categoryId: leadershipCategory.id,
        text: 'This person effectively delegates tasks and responsibilities to team members.'
      }
    }),
    prisma.question.create({
      data: {
        categoryId: leadershipCategory.id,
        text: 'This person provides clear direction and vision for the team.'
      }
    }),
    prisma.question.create({
      data: {
        categoryId: leadershipCategory.id,
        text: 'This person makes difficult decisions confidently and takes responsibility for outcomes.'
      }
    }),
    prisma.question.create({
      data: {
        categoryId: leadershipCategory.id,
        text: 'This person mentors and develops others to reach their potential.'
      }
    }),
    
    // Communication questions (5 questions)
    prisma.question.create({
      data: {
        categoryId: communicationCategory.id,
        text: 'This person communicates clearly and effectively in both written and verbal forms.'
      }
    }),
    prisma.question.create({
      data: {
        categoryId: communicationCategory.id,
        text: 'This person actively listens to others and responds appropriately to feedback.'
      }
    }),
    prisma.question.create({
      data: {
        categoryId: communicationCategory.id,
        text: 'This person presents information in a clear, organized, and engaging manner.'
      }
    }),
    prisma.question.create({
      data: {
        categoryId: communicationCategory.id,
        text: 'This person adapts their communication style to different audiences and situations.'
      }
    }),
    prisma.question.create({
      data: {
        categoryId: communicationCategory.id,
        text: 'This person provides constructive feedback and handles difficult conversations well.'
      }
    }),
    
    // Teamwork questions (5 questions)
    prisma.question.create({
      data: {
        categoryId: teamworkCategory.id,
        text: 'This person collaborates well with team members and contributes positively to group dynamics.'
      }
    }),
    prisma.question.create({
      data: {
        categoryId: teamworkCategory.id,
        text: 'This person supports and helps colleagues when needed.'
      }
    }),
    prisma.question.create({
      data: {
        categoryId: teamworkCategory.id,
        text: 'This person shares knowledge and resources freely with team members.'
      }
    }),
    prisma.question.create({
      data: {
        categoryId: teamworkCategory.id,
        text: 'This person resolves conflicts constructively and maintains positive relationships.'
      }
    }),
    prisma.question.create({
      data: {
        categoryId: teamworkCategory.id,
        text: 'This person contributes to a positive and inclusive team environment.'
      }
    }),
    
    // Problem Solving questions (5 questions)
    prisma.question.create({
      data: {
        categoryId: problemSolvingCategory.id,
        text: 'This person approaches problems with a systematic and analytical mindset.'
      }
    }),
    prisma.question.create({
      data: {
        categoryId: problemSolvingCategory.id,
        text: 'This person finds creative and effective solutions to complex challenges.'
      }
    }),
    prisma.question.create({
      data: {
        categoryId: problemSolvingCategory.id,
        text: 'This person gathers relevant information before making decisions.'
      }
    }),
    prisma.question.create({
      data: {
        categoryId: problemSolvingCategory.id,
        text: 'This person considers multiple perspectives and alternatives when solving problems.'
      }
    }),
    prisma.question.create({
      data: {
        categoryId: problemSolvingCategory.id,
        text: 'This person learns from mistakes and applies lessons to future situations.'
      }
    })
  ]);

  // Create review assignments
  const assignments = await Promise.all([
    prisma.reviewAssignment.upsert({
      where: { id: 1 },
      update: {},
      create: {
        reviewCycleId: reviewCycle.id,
        reviewerId: employee1.id,
        revieweeId: employee1.id,
        relationType: 'SELF'
      }
    }),
    prisma.reviewAssignment.upsert({
      where: { id: 2 },
      update: {},
      create: {
        reviewCycleId: reviewCycle.id,
        reviewerId: admin.id,
        revieweeId: employee1.id,
        relationType: 'MANAGER'
      }
    }),
    prisma.reviewAssignment.upsert({
      where: { id: 3 },
      update: {},
      create: {
        reviewCycleId: reviewCycle.id,
        reviewerId: employee2.id,
        revieweeId: employee1.id,
        relationType: 'PEER'
      }
    }),
    prisma.reviewAssignment.upsert({
      where: { id: 4 },
      update: {},
      create: {
        reviewCycleId: reviewCycle.id,
        reviewerId: employee3.id,
        revieweeId: employee1.id,
        relationType: 'SUBORDINATE'
      }
    }),
    
    // Jane Smith assignments
    prisma.reviewAssignment.upsert({
      where: { id: 5 },
      update: {},
      create: {
        reviewCycleId: reviewCycle.id,
        reviewerId: employee2.id,
        revieweeId: employee2.id,
        relationType: 'SELF'
      }
    }),
    prisma.reviewAssignment.upsert({
      where: { id: 6 },
      update: {},
      create: {
        reviewCycleId: reviewCycle.id,
        reviewerId: admin.id,
        revieweeId: employee2.id,
        relationType: 'MANAGER'
      }
    }),
    prisma.reviewAssignment.upsert({
      where: { id: 7 },
      update: {},
      create: {
        reviewCycleId: reviewCycle.id,
        reviewerId: employee1.id,
        revieweeId: employee2.id,
        relationType: 'PEER'
      }
    }),
    prisma.reviewAssignment.upsert({
      where: { id: 8 },
      update: {},
      create: {
        reviewCycleId: reviewCycle.id,
        reviewerId: employee3.id,
        revieweeId: employee2.id,
        relationType: 'PEER'
      }
    })
  ]);

  console.log('✅ Database seeded successfully!');
  console.log('👤 Admin user: admin@company.com / admin123');
  console.log('👤 Employee user: employee@company.com / employee123');
  console.log('👤 Employee user: jane@company.com / employee123');
  console.log('👤 Employee user: bob@company.com / employee123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

