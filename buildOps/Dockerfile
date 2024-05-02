###################
# BUILD FOR LOCAL DEVELOPMENT
###################

FROM node:18-alpine AS node-with-updated-npm

RUN npm update -g npm

FROM node-with-updated-npm as development

WORKDIR /usr/src/app

COPY --chown=node:node package*.json ./

COPY --chown=node:node prisma ./prisma

RUN npm ci --maxsockets=1

COPY --chown=node:node . .

USER node

###################
# BUILD FOR PRODUCTION
###################

FROM node-with-updated-npm AS build

WORKDIR /usr/src/app
RUN mkdir -p ./uploads

COPY --chown=node:node --from=development /usr/src/app/ .
COPY --chown=node:node package*.json ./
# override .env with that from va-docker
# COPY --chown=node:node --from=va-docker-envs .env ./.env

# Leverage @nestjs/cli
RUN npm run build

# Clean devDependencies
RUN npm ci --no-audit --maxsockets=1 --omit=dev && npm cache clean --force

ENV NODE_ENV production

USER node

###################
# PRODUCTION
###################

FROM node-with-updated-npm AS production

WORKDIR /usr/src/app

COPY --from=build --chown=node:node /usr/src/app/uploads ./uploads
COPY --from=build --chown=node:node /usr/src/app/package*.json ./
COPY --from=build --chown=node:node /usr/src/app/prisma ./prisma
COPY --from=build --chown=node:node /usr/src/app/node_modules ./node_modules
COPY --from=build --chown=node:node /usr/src/app/dist ./dist

# WORKDIR /usr/src/app

EXPOSE 3344

CMD [ "node", "dist/src/main.js" ]
# CMD [ "npm", "run","start:dev" ]
