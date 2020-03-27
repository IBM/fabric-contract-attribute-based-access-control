'use strict';

// Classes for Node Express
const express = require('express');
const app = express();
const cors = require('cors');
const fabricClient = require('./utils.js');
const supplychainRoute = require('./supplychain');


///////////////////////  Express GET, POST handlers   ////////////////////
// Start up the Express functions to listen on server side
app.use(express.json());
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.header("Access-Control-Allow-Methods", "PUT, POST, GET, DELETE, OPTIONS");
    next();
});
app.use(cors());

//  routes defined
app.use('/api', supplychainRoute);

app.get('/', (req, res) => {
    res.send('This is home page !');
});

async function main() {

    try {
        await fabricClient.connectGatewayFromConfig ();
        await fabricClient.events();
    } catch (error) {
        return console.log ('Error in connecting to Fabric network. ', error);
    }

    const port = process.env.PORT || 3000;
    app.listen(port, (error) => {
        if (error) {
            return console.log('Error: ' + err);
        }
        console.log(`Server listening on ${port}`)
    });
}


main();
