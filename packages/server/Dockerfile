FROM node:20-alpine

WORKDIR /app

COPY package.json ./
RUN npm install

COPY tsconfig.json ./tsconfig.json
COPY src ./src

RUN npm run build

ENV NODE_ENV=production
ENV PORT=5055
ENV DATABASE_PATH=/app/data/flowlens.db

RUN mkdir -p /app/data

EXPOSE 5055

CMD ["node", "dist/index.js"]
