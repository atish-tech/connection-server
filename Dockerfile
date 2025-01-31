# Step 1: Use an official Node.js image as the base
FROM node:20-alpine

# Install OpenSSL 1.1
RUN apk add --no-cache openssl1.1-compat

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

# Step 7: Expose the port the app runs on
EXPOSE 3000

# Step 8: Define the command to start the application
CMD ["node", ".next/standalone/server.js"]
