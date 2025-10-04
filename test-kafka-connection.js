const { Kafka } = require('kafkajs');

// Create Kafka client
const kafka = new Kafka({
  clientId: 'connection-server-test',
  brokers: ['localhost:29092'], // Using the external port mapped in docker-compose
});

// Test admin connection
async function testKafkaConnection() {
  const admin = kafka.admin();

  try {
    console.log('Connecting to Kafka...');
    await admin.connect();
    console.log('Connected to Kafka!');

    // List topics
    const topics = await admin.listTopics();
    console.log('Available topics:', topics);

    // Disconnect
    await admin.disconnect();
    console.log('Kafka connection closed');
  } catch (error) {
    console.error('Kafka connection error:', error);
  }
}

// Test producer
async function testKafkaProducer() {
  const producer = kafka.producer();

  try {
    console.log('Connecting producer...');
    await producer.connect();
    console.log('Producer connected!');

    // Create a test topic if it doesn't exist
    const admin = kafka.admin();
    await admin.connect();
    
    const topics = await admin.listTopics();
    if (!topics.includes('test-topic')) {
      await admin.createTopics({
        topics: [
          { topic: 'test-topic', numPartitions: 1, replicationFactor: 1 }
        ],
      });
      console.log('Created test-topic');
    }
    await admin.disconnect();

    // Send a test message
    const result = await producer.send({
      topic: 'test-topic',
      messages: [
        { value: 'Hello Kafka!' },
      ],
    });
    console.log('Message sent:', result);

    // Disconnect
    await producer.disconnect();
    console.log('Producer disconnected');
  } catch (error) {
    console.error('Kafka producer error:', error);
  }
}

// Run the tests
async function runTests() {
  await testKafkaConnection();
  await testKafkaProducer();
}

runTests();
