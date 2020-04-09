FROM node:10

RUN mkdir -p /app
WORKDIR /app

# install and cache app dependencies
COPY ./package.json /app/package.json
RUN npm install --silent
RUN npm install -g @angular/cli@1.7.1

#copy app directory
COPY ./src /app/src
COPY ./e2e /app/e2e
COPY ./Pubnub.png /app/Pubnub.png
COPY ./angular.json /app/angular.json
COPY ./tsconfig.json /app/tsconfig.json
COPY ./tslint.json /app/tslint.json

EXPOSE 4200

# start app
CMD ng serve --host 0.0.0.0 --disableHostCheck
