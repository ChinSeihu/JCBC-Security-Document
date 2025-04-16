# Use Node.js as the base image
FROM node:22.14.0

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json files
COPY package*.json ./
COPY .env ./
# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Generate Database
RUN npx prisma generate

# Build the Next.js application
# RUN npm run build

# Expose the port the app runs on
EXPOSE 80

# Start the Next.js application
CMD ["npm", "start"]