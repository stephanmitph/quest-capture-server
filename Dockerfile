FROM node:18-alpine AS base
FROM base AS builder
COPY . .

# Build the Next.js application
RUN npm run build
RUN npm run build-capture-server

# Production image, copy all the files and run next
FROM base AS runner

ENV NODE_ENV production

# Install deps needed in production image
RUN apk add --no-cache ffmpeg
RUN apk add --no-cache ffmpeg
RUN apk add --no-cache gawk
RUN npm install pm2 -g

# Create a non-root user to run the app
RUN addgroup --system --gid 1001 group 
RUN adduser --system --uid 1001 sipuser 

# Create directories for file-based storage
RUN mkdir -p /data

# Set the correct permissions
# RUN chown -R sipuser:group /

USER sipuser 

EXPOSE 3000
EXPOSE 8080

ENV PORT 3000
ENV TCP_SERVER_PORT 8080

# CMD ["node", "server.js"]
CMD [ "pm2-runtime", "ecosystem.config.js", "--env", "production" ]

