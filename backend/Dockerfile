# Multi-stage build: compile with full devDependencies, ship only the
# production output + prod deps in the final image.
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist

# Don't run as root inside the container.
USER node

EXPOSE 3000
CMD ["node", "dist/main.js"]
