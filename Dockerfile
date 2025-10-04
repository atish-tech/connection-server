FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install dependencies for init script
RUN apk add --no-cache netcat-openbsd

# Install dependencies first (for better caching)
COPY package*.json ./
RUN npm ci

# Install Babel dependencies for TS support in scripts
RUN npm install --save-dev @babel/register @babel/preset-env @babel/preset-typescript

# Copy project files
COPY . .

# Make init script executable
RUN chmod +x docker-init.sh

# Generate Prisma client
RUN npx prisma generate

# Set environment variables
ENV PORT 3000

# Skip build in development mode
ENV NODE_ENV development

# Expose port
EXPOSE 3000

# Use init script to ensure services are available
ENTRYPOINT ["./docker-init.sh"]

# Start the application in development mode
CMD ["npm", "run", "dev:server"]
