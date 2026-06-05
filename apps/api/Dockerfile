FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --fetch-retries=5 --fetch-retry-mintimeout=20000 --fetch-retry-maxtimeout=120000

COPY . .
RUN npx prisma generate

EXPOSE 4000

CMD ["npm", "run", "start:dev"]
