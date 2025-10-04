const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

// Configure Prisma Client with error logging
const prisma = new PrismaClient({
  log: ['warn', 'error'],
  errorFormat: 'pretty',
});

async function main() {
  console.log(`Start seeding database...`);
  
  try {
    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    const adminUser = await prisma.user.create({
      data: {
        id: uuidv4(),
        userName: 'Admin User',
        email: 'admin@example.com',
        password: adminPassword,
        isVerified: true,
        imageUrl: ''
      },
    });
    
    console.log(`Created admin user: ${adminUser.email}`);
    
    // Create test users
    const testPassword = await bcrypt.hash('test123', 10);
    const testUsers = [];
    
    for (let i = 1; i <= 3; i++) {
      const testUser = await prisma.user.create({
        data: {
          id: uuidv4(),
          userName: `Test User ${i}`,
          email: `test${i}@example.com`,
          password: testPassword,
          isVerified: true,
          imageUrl: ''
        },
      });
      
      testUsers.push(testUser);
      console.log(`Created test user: ${testUser.email}`);
    }
    
    // Create a sample server
    const server = await prisma.server.create({
      data: {
        name: 'Sample Server',
        imageUrl: '',
        inviteCode: uuidv4(),
        adminId: adminUser.id,
      },
    });
    
    console.log(`Created server: ${server.name}`);
    
    // Add admin as member of the server
    const adminMember = await prisma.member.create({
      data: {
        userId: adminUser.id,
        serverId: server.id,
        role: 'ADMIN',
      },
    });
    
    console.log(`Added admin as member to the server`);
    
    // Add test users as members
    for (const user of testUsers) {
      await prisma.member.create({
        data: {
          userId: user.id,
          serverId: server.id,
          role: 'GUEST',
        },
      });
    }
    
    console.log(`Added test users as members to the server`);
    
    // Create sample channels
    const channelTypes = ['TEXT', 'VOICE', 'VIDEO'];
    const channelNames = ['general', 'random', 'introductions'];
    
    for (let i = 0; i < channelNames.length; i++) {
      const channel = await prisma.channel.create({
        data: {
          name: channelNames[i],
          type: channelTypes[i % channelTypes.length],
          serverId: server.id,
        },
      });
      
      console.log(`Created channel: ${channel.name}`);
      
      // Add some messages to text channels
      if (channel.type === 'TEXT') {
        // Generate sample messages from different members
        for (let j = 0; j < 5; j++) {
          const message = await prisma.channelMessage.create({
            data: {
              content: `This is a sample message ${j + 1} in ${channel.name}`,
              memberId: j % 2 === 0 ? adminMember.id : testUsers[0].id,
              channelId: channel.id,
              type: 'TEXT',
            },
          });
        }
        
        console.log(`Added sample messages to channel: ${channel.name}`);
      }
    }
    
    console.log(`Seeding completed successfully`);
  } catch (error) {
    console.error(`Error during seeding:`, error);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
