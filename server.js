const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOST || 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

// Initialize Next.js
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Import our utilities (using require for server.js)
let socketServer, kafka, redis;

app.prepare().then(async () => {
  try {
    // Create HTTP server
    const server = createServer(async (req, res) => {
      try {
        const parsedUrl = parse(req.url, true);
        await handle(req, res, parsedUrl);
      } catch (err) {
        console.error('Error handling request:', err);
        res.statusCode = 500;
        res.end('Internal Server Error');
      }
    });

    // Only import these after app is prepared to avoid issues with Next.js
    socketServer = require('./utils/socket');
    kafka = require('./utils/kafka');
    redis = require('./utils/redis');
    
    // Initialize Socket.IO server
    socketServer.initializeSocketServer(server);
    
    // Check if KAFKA_AVAILABLE environment variable is set to false
    if (process.env.KAFKA_AVAILABLE === 'false') {
      console.warn('Kafka is not available. Running without Kafka support.');
    } else {
      try {
        // Initialize Kafka
        await kafka.initKafka();
        
        // Subscribe to Kafka topics
        await socketServer.subscribeToKafkaTopics();
        console.log('Successfully connected to Kafka and subscribed to topics');
      } catch (err) {
        console.warn('Failed to initialize Kafka. Continuing without Kafka:', err.message);
      }
    }

    // Start the server
    server.listen(port, (err) => {
      if (err) throw err;
      console.log(`> Ready on http://${hostname}:${port}`);
    });

    // Handle graceful shutdown
    const signals = ['SIGTERM', 'SIGINT'];
    signals.forEach(signal => {
      process.on(signal, async () => {
        console.log(`Received ${signal}, closing server...`);
        try {
          // Close Socket.IO connections
          await socketServer.closeSocketConnections();
          
          // Disconnect Kafka
          await kafka.disconnectKafka().catch(console.error);
          
          console.log('Server gracefully closed');
          process.exit(0);
        } catch (err) {
          console.error('Error during shutdown:', err);
          process.exit(1);
        }
      });
    });
    
  } catch (err) {
    console.error('Failed to initialize server:', err);
    process.exit(1);
  }
});
