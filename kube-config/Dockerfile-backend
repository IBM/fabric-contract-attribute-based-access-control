FROM node:10

RUN mkdir -p /application/server \
    -p /application/utils/fabutils \
    -p /contract/lib \
    -p /contract/ledger-api  \
    -p /gateway/ibp
    
WORKDIR /application/server

# install dependencies
COPY ./application/server/package.json /application/server/package.json
#  RUN npm install --silent 
RUN npm install  

#copy files
COPY ./application/server/server.js  /application/server/server.js
COPY ./contract/lib/order.js         /contract/lib/.
COPY ./contract/ledger-api/state.js  /contract/ledger-api/.
COPY ./gateway/ibp/ibp_config.json  /gateway/ibp/ibp_config.json
COPY ./gateway/ibp/ibp_connection_profile.json  /gateway/ibp/ibp_connection_profile.json
# copy enrollUser.js to generate enroll admin user 
# note this is copied into same folder as server.js so that node packages will be available for this
COPY ./utils/fabutils/enrollUser.js /application/server/enrollUser.js 
EXPOSE 3000

# start app
WORKDIR /application/server
CMD node enrollUser.js;  node server.js  
