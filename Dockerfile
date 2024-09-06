# Build stage
FROM node:18 AS builder
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production stage
FROM node:18
WORKDIR /usr/src/app
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules ./node_modules
EXPOSE 8001
CMD ["node", "main.js"]



# # Use an official Node.js runtime as a parent image
# FROM node:18
# # Set the working directory in the container
# WORKDIR /usr/src/app
# # Copy package.json and package-lock.json to the working directory
# COPY package*.json ./

# RUN npm install
# # Copy the rest of your application code to the working directory
# COPY . .
# EXPOSE 8001
# CMD ["node", "main.js"]
