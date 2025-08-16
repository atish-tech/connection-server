# Step 1: Use an official Node.js image as the base
FROM node:20-alpine

# Install system dependencies for WebRTC and media processing
RUN apk add --no-cache \
    openssl1.1-compat \
    ffmpeg \
    opus \
    libvpx \
    x264 \
    libogg \
    libvorbis \
    libtheora \
    libwebp \
    alsa-lib \
    pulseaudio \
    dbus \
    && rm -rf /var/cache/apk/*

# Step 2: Set the working directory inside the container
WORKDIR /app

# Step 3: Copy package.json and package-lock.json or pnpm-lock.yaml
COPY package*.json ./
COPY pnpm-lock.yaml ./ 

# Step 4: Install dependencies
RUN npm install -g pnpm
RUN pnpm install --shamefully-hoist

# Step 5: Copy the rest of the application code
COPY . .

# Step 6: Build the application
RUN npm run build

# Step 7: Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Change ownership of the app directory
RUN chown -R nextjs:nodejs /app
USER nextjs

# Step 8: Expose the port the app runs on
EXPOSE 3000

# Health check for container monitoring
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/api/health || exit 1

# Step 9: Define the command to start the application
CMD ["node", ".next/standalone/server.js"]
