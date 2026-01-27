FROM node:20-alpine

WORKDIR /app

COPY package.json ./
RUN npm install

COPY tsconfig.json postcss.config.js tailwind.config.js index.html ./
COPY public ./public
COPY src ./src

ARG VITE_SERVER_URL=http://localhost:5055
ENV VITE_SERVER_URL=$VITE_SERVER_URL

RUN npm run build
RUN npm install -g serve

EXPOSE 4173
CMD ["serve", "-s", "dist", "-l", "4173"]
