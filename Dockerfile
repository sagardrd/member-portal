FROM node:18

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

RUN npm install -g serve

EXPOSE 4200

CMD ["serve","-s","dist/member-portal/browser","-l","4200"]