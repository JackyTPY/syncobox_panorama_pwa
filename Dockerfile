FROM node:lts-alpine as build-stage

ARG VUE_APP_BUILD_MODE
ARG NPM_TOKEN


ENV NPM_TOKEN=$NPM_TOKEN
ENV VUE_APP_BUILD_MODE=$VUE_APP_BUILD_MODE

RUN echo  "$VUE_APP_BUILD_MODE"
# RUN echo  "$NPM_TOKEN"
# make the 'app' folder the current working directory
WORKDIR /app

COPY .npmrc .npmrc

RUN cat .npmrc

# copy both 'package.json' and 'package-lock.json' (if available)
COPY package*.json ./

# install project dependencies

RUN npm config set '//pkgs.dev.azure.com/webimrd/WeBIM_Artifact_Test/_packaging/panorama-map/npm/registry/:_password' "${NPM_TOKEN}"

RUN npm config set '//pkgs.dev.azure.com/webimrd/WeBIM_Artifact_Test/_packaging/panorama-map/npm/:_password' "${NPM_TOKEN}"

RUN npm install

RUN rm -f .npmrc

# copy project files and folders to the current working directory (i.e. 'app' folder)
COPY . .

# RUN cat .eslintrc.js
# RUN ls -la .

# build app for production with minification
RUN npm run build

FROM nginx:stable-alpine as production-stage

COPY panorara-pwa.nginx.conf /etc/nginx/conf.d/default.conf

WORKDIR /app
COPY --from=build-stage /app/dist .

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
