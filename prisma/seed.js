const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const Minio = require('minio');
const Redis = require('redis');
const { Kafka } = require('kafkajs');

// Configure Prisma Client with error logging
const prisma = new PrismaClient({
  log: ['warn', 'error'],
  errorFormat: 'pretty',
});

// MinIO client configuration
const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: parseInt(process.env.MINIO_PORT || '9000'),
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
  secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
});

const MINIO_BUCKET_NAME = process.env.MINIO_BUCKET_NAME || 'connection-server';

// Redis client configuration
const redisClient = Redis.createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
});

// Kafka configuration
const kafka = new Kafka({
  clientId: 'connection-server-seed',
  brokers: [process.env.KAFKA_BROKER || 'localhost:29092'],
});

async function initializeMinIO() {
  try {
    console.log('Initializing MinIO...');
    
    // Check if bucket exists
    const bucketExists = await minioClient.bucketExists(MINIO_BUCKET_NAME);
    
    if (!bucketExists) {
      console.log(`Creating MinIO bucket: ${MINIO_BUCKET_NAME}`);
      await minioClient.makeBucket(MINIO_BUCKET_NAME, 'us-east-1');
      
      // Set bucket policy for public read access
      const policy = {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: { AWS: ['*'] },
            Action: ['s3:GetObject'],
            Resource: [`arn:aws:s3:::${MINIO_BUCKET_NAME}/*`]
          }
        ]
      };
      
      await minioClient.setBucketPolicy(MINIO_BUCKET_NAME, JSON.stringify(policy));
      console.log(`MinIO bucket ${MINIO_BUCKET_NAME} created and configured`);
    } else {
      console.log(`MinIO bucket ${MINIO_BUCKET_NAME} already exists`);
    }
    
    // Upload sample files
    const sampleFiles = [
      { name: 'welcome.txt', content: 'Welcome to Connection Server!', type: 'text/plain' },
      { name: 'sample-image.jpg', content: Buffer.from('fake-image-data'), type: 'image/jpeg' },
      { name: 'document.pdf', content: Buffer.from('fake-pdf-data'), type: 'application/pdf' }
    ];
    
    for (const file of sampleFiles) {
      const buffer = Buffer.isBuffer(file.content) ? file.content : Buffer.from(file.content);
      await minioClient.putObject(MINIO_BUCKET_NAME, `samples/${file.name}`, buffer, buffer.length, {
        'Content-Type': file.type
      });
      console.log(`Uploaded sample file: ${file.name}`);
    }
    
  } catch (error) {
    console.error('Error initializing MinIO:', error);
  }
}

async function initializeRedis() {
  try {
    console.log('Initializing Redis...');
    
    await redisClient.connect();
    
    // Set some sample cache data
    await redisClient.set('app:status', 'running');
    await redisClient.set('app:version', '1.0.0');
    await redisClient.set('app:last_seed', new Date().toISOString());
    
    // Set sample user sessions
    const sampleSessions = [
      { userId: 'admin-session', data: JSON.stringify({ role: 'admin', lastLogin: new Date() }) },
      { userId: 'user-session-1', data: JSON.stringify({ role: 'user', lastLogin: new Date() }) },
      { userId: 'user-session-2', data: JSON.stringify({ role: 'user', lastLogin: new Date() }) }
    ];
    
    for (const session of sampleSessions) {
      await redisClient.setEx(`session:${session.userId}`, 3600, session.data);
    }
    
    console.log('Redis initialized with sample data');
    
  } catch (error) {
    console.error('Error initializing Redis:', error);
  } finally {
    await redisClient.quit();
  }
}

async function initializeKafka() {
  try {
    console.log('Initializing Kafka...');
    
    const admin = kafka.admin();
    await admin.connect();
    
    // Create topics
    const topics = [
      'user-events',
      'server-events', 
      'channel-events',
      'message-events',
      'notification-events'
    ];
    
    for (const topic of topics) {
      try {
        await admin.createTopics({
          topics: [{
            topic: topic,
            numPartitions: 1,
            replicationFactor: 1
          }]
        });
        console.log(`Created Kafka topic: ${topic}`);
      } catch (error) {
        if (error.message.includes('Topic already exists')) {
          console.log(`Kafka topic ${topic} already exists`);
        } else {
          throw error;
        }
      }
    }
    
    await admin.disconnect();
    console.log('Kafka topics initialized');
    
  } catch (error) {
    console.error('Error initializing Kafka:', error);
  }
}

async function main() {
  console.log(`Start seeding database and services...`);
  
  try {
    // Initialize external services
    await initializeMinIO();
    await initializeRedis();
    await initializeKafka();
    
    // Random profile images from various sources
    const randomImages = [
      'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&h=150&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1531123897727-8f29e45c30d9?w=150&h=150&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face'
    ];
    
    // Create admin user with random image (or get existing)
    const adminPassword = await bcrypt.hash('admin123', 10);
    const adminImage = randomImages[Math.floor(Math.random() * randomImages.length)];
    
    let adminUser = await prisma.user.findUnique({
      where: { email: 'admin@example.com' }
    });
    
    if (!adminUser) {
      adminUser = await prisma.user.create({
        data: {
          id: uuidv4(),
          userName: 'Admin User',
          email: 'admin@example.com',
          password: adminPassword,
          isVerified: true,
          imageUrl: adminImage
        },
      });
      console.log(`Created admin user: ${adminUser.email} with image: ${adminImage}`);
    } else {
      console.log(`Admin user already exists: ${adminUser.email}`);
    }
    
    // Create test users with more realistic data
    const testPassword = await bcrypt.hash('test123', 10);
    const testUsers = [];

    const userProfiles = [
      { name: 'Alice Johnson', email: 'alice@example.com' },
      { name: 'Bob Smith', email: 'bob@example.com' },
      { name: 'Charlie Brown', email: 'charlie@example.com' },
      { name: 'Diana Prince', email: 'diana@example.com' },
      { name: 'Eve Wilson', email: 'eve@example.com' }
    ];
    
    for (const profile of userProfiles) {
      // Get a random image from the array
      const randomImage = randomImages[Math.floor(Math.random() * randomImages.length)];
      
      let testUser = await prisma.user.findUnique({
        where: { email: profile.email }
      });
      
      if (!testUser) {
        testUser = await prisma.user.create({
          data: {
            id: uuidv4(),
            userName: profile.name,
            email: profile.email,
            password: testPassword,
            isVerified: true,
            imageUrl: randomImage
          },
        });
        console.log(`Created test user: ${testUser.email} with image: ${randomImage}`);
      } else {
        console.log(`Test user already exists: ${testUser.email}`);
      }
      
      testUsers.push(testUser);
    }
    
    // Create multiple servers
    const servers = [];
    const serverData = [
      { name: 'Gaming Community', imageUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=300&h=200&fit=crop' },
      { name: 'Tech Discussion', imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=300&h=200&fit=crop' },
      { name: 'Art & Design', imageUrl: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=300&h=200&fit=crop' },
      { name: 'Music Lovers', imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=200&fit=crop' }
    ];
    
    for (const serverInfo of serverData) {
      const server = await prisma.server.create({
        data: {
          name: serverInfo.name,
          imageUrl: serverInfo.imageUrl,
          inviteCode: uuidv4(),
          adminId: adminUser.id,
        },
      });
      
      servers.push(server);
      console.log(`Created server: ${server.name}`);
    }
    
    // Add members to servers
    for (const server of servers) {
      // Add admin as member
      await prisma.member.create({
        data: {
          userId: adminUser.id,
          serverId: server.id,
          role: 'ADMIN',
        },
      });
      
      // Add some test users as members
      const membersToAdd = testUsers.slice(0, Math.floor(Math.random() * 3) + 2);
      for (const user of membersToAdd) {
        await prisma.member.create({
          data: {
            userId: user.id,
            serverId: server.id,
            role: Math.random() > 0.7 ? 'MODERATOR' : 'GUEST',
          },
        });
      }
      
      console.log(`Added members to server: ${server.name}`);
    }
    
    // Create channels for each server
    const channelTemplates = [
      { name: 'general', type: 'TEXT' },
      { name: 'random', type: 'TEXT' },
      { name: 'announcements', type: 'TEXT' },
      { name: 'voice-chat', type: 'VOICE' },
      { name: 'video-calls', type: 'VIDEO' },
      { name: 'introductions', type: 'TEXT' }
    ];
    
    for (const server of servers) {
      const channelsToCreate = channelTemplates.slice(0, Math.floor(Math.random() * 4) + 3);
      
      for (const channelTemplate of channelsToCreate) {
        const channel = await prisma.channel.create({
          data: {
            name: channelTemplate.name,
            type: channelTemplate.type,
            serverId: server.id,
          },
        });
        
        console.log(`Created channel: ${channel.name} in ${server.name}`);
        
        // Add sample messages to text channels
        if (channel.type === 'TEXT') {
          const sampleMessages = [
            `Welcome to ${channel.name}! 👋`,
            `This is a sample message in ${channel.name}`,
            `Feel free to introduce yourself here!`,
            `What's everyone working on today?`,
            `Great to see you all here! 🎉`
          ];
          
          // Get members for this server
          const serverMembers = await prisma.member.findMany({
            where: { serverId: server.id },
            include: { user: true }
          });
          
          for (let i = 0; i < Math.min(sampleMessages.length, 5); i++) {
            const randomMember = serverMembers[Math.floor(Math.random() * serverMembers.length)];
            await prisma.channelMessage.create({
              data: {
                content: sampleMessages[i],
                memberId: randomMember.id,
                channelId: channel.id,
                type: 'TEXT',
              },
            });
          }
          
          console.log(`Added sample messages to channel: ${channel.name}`);
        }
      }
    }
    
    // Create some sample file messages
    const fileMessages = [
      { name: 'welcome.txt', type: 'TEXT', content: 'Welcome to our server!' },
      { name: 'sample-image.jpg', type: 'IMAGE', content: 'Check out this cool image!' },
      { name: 'document.pdf', type: 'PDF', content: 'Important document shared' }
    ];
    
    for (const fileMessage of fileMessages) {
      const randomServer = servers[Math.floor(Math.random() * servers.length)];
      const textChannels = await prisma.channel.findMany({
        where: { 
          serverId: randomServer.id,
          type: 'TEXT'
        }
      });
      
      if (textChannels.length > 0) {
        const randomChannel = textChannels[Math.floor(Math.random() * textChannels.length)];
        const serverMembers = await prisma.member.findMany({
          where: { serverId: randomServer.id }
        });
        
        if (serverMembers.length > 0) {
          const randomMember = serverMembers[Math.floor(Math.random() * serverMembers.length)];
          await prisma.channelMessage.create({
            data: {
              content: fileMessage.content,
              memberId: randomMember.id,
              channelId: randomChannel.id,
              type: fileMessage.type,
            },
          });
        }
      }
    }
    
    console.log(`Seeding completed successfully!`);
    console.log(`Created:`);
    console.log(`- ${1 + testUsers.length} users`);
    console.log(`- ${servers.length} servers`);
    console.log(`- Multiple channels and messages`);
    console.log(`- MinIO bucket with sample files`);
    console.log(`- Redis cache data`);
    console.log(`- Kafka topics`);
    
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
