const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Generate a random JWT secret
const jwtSecret = crypto.randomBytes(32).toString('hex');

// Read the docker-compose.yml file
const dockerComposePath = path.join(__dirname, '..', 'docker-compose.yml');
let dockerComposeContent = fs.readFileSync(dockerComposePath, 'utf8');

// Replace JWT_SECRET with a generated one
dockerComposeContent = dockerComposeContent.replace('JWT_SECRET=your_jwt_secret_key', `JWT_SECRET=${jwtSecret}`);

// Write the updated content back to the file
fs.writeFileSync(dockerComposePath, dockerComposeContent);

console.log('Docker setup completed!');
console.log('Generated a random JWT secret for the application');
console.log('\nYou can now start the application with:');
console.log('docker-compose up -d');
console.log('\nTo build fresh containers:');
console.log('docker-compose up -d --build');
