'use strict';

// Classes for Node Express
const express = require('express');
const app = express();
const cors = require('cors');

// Bring key classes into scope, most importantly Fabric SDK network class
const Order = require('../../contract/lib/order.js');

const SUCCESS = 0;
const TRANSACTION_ERROR = 401;
const USER_NOT_ENROLLED = 402;

//  connectionOptions
const utils = require('./utils.js');

//  global variables for pubnub
var pubnubChannelName = "priceWatchChannel-gen";
var bcChannelName = "bcEventsChannel-gen";

var contract;

//const pubnub = require('./pubnub.js').pubnub

console.log("Setting up pubnub...");
var pubnub = utils.pubnubSetup();

console.log("Subscribing...");
pubnub.subscribe({
    channels: [pubnubChannelName, bcChannelName]
});

// Set up and connect to Fabric Gateway
utils.connectGatewayFromConfig().then((gateway_contract) => {

    console.log('Connected to Network.');
    contract = gateway_contract;

    //  Setup events and monitor for events from HLFabric
    utils.events();

}).catch((e) => {
    console.log('Connection exception.');
    console.log(e);
    console.log(e.stack);
    process.exit(-1);
});

///////////////////////  Express GET, POST handlers   ////////////////////
// Start up the Express functions to listen on server side
app.use(express.json());

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "PUT, POST, GET, DELETE, OPTIONS");
    next();
});

app.use(cors());

app.get('/', (req, res) => {
    res.send('This is home page !');
});

app.get('/api', (req, res) => {
    res.send('This is the api home page!');
});

app.post('/api/orders', (req, res) => {

    contract.submitTransaction('orderProduct', JSON.stringify(req.body))
        .then((orderProdResponse) => {
            // process response
            console.log('Process orderProduct transaction.');
            let order = Order.fromBuffer(orderProdResponse);
            console.log(`order ${order.orderId} : price = ${order.price}, quantity = ${order.quantity}, producer = ${order.producerId}, consumer = ${order.retailerId}, trackingInfo = ${order.trackingInfo}, state = ${order.currentOrderState}`);
            order.errorCode = 1;
            res.send(order);
        }, (error) => {
            // handle error if transaction failed
            error.errorCode = 0;
            console.log('Error thrown from tx promise: ', error);
            res.send(error);
        });

});  //  process route /

app.get('/api/orders/:id', (req, res) => {

    let order;

    contract.submitTransaction('queryOrder', req.params.id).then((queryOrderResponse) => {
        // process response
        console.log('Process QueryOrder transaction. ');

        order = Order.fromBuffer(queryOrderResponse);

        console.log(`order ${order.orderId} : price = ${order.price}, quantity = ${order.quantity}, producer = ${order.producerId}, consumer = ${order.retailerId}, trackingInfo = ${order.trackingInfo}, state = ${order.currentOrderState}`);
        console.log('Transaction complete.');
        order.errorCode = 1;
        res.send(order);
    }, (error) => {
        //  handle error if transaction failed
        error.errorCode = 0;
        console.log('Error thrown from tx promise', error);
        res.send(error);
    });
});

app.get('/api/orders', (req, res) => {

    let userid = req.query.userid;
    let password = req.query.password;

    let promises = [];

    if (typeof userid != "undefined") {
        promises.push(Promise.resolve(userid));
    } else {
        console.log("userid is not sent in, get current user")
        promises.push(contract.submitTransaction('getCurrentUserId').then(tmp_userid => {

            // process response from getCurrentUserId: convert to string and remove quotes and
            userid = tmp_userid.toString().slice(1, -1);
            return Promise.resolve(userid);

        }, (error) => {
            //  handle error if transaction failed
            error.errorCode = 0;
            console.log('Error thrown from getCurrentUserId: ', error);
            return ("");
        }));
    }

    Promise.all(promises).then(() => {
        console.log('GET orders, userid = ' + userid + ', pwd = ' + password);
        //  set current user in "contract"
        utils.setUserContext(userid, password)
            .then(gateway_contract => {
                let orders;
                gateway_contract.submitTransaction('queryAllOrders', '')
                    .then((queryOrderResponse) => {
                        // process response
                        orders = queryOrderResponse;
                        orders.errorCode = 1;
                        res.send(orders);
                    }, (error) => {
                        // handle error if transaction failed
                        error.errorCode = 0;
                        console.log('Error thrown from tx promise', error);
                        res.send(error);
                    });
            }, (error) => {
                console.log("Error in setUserContext:  \n " + error);
                res.send(error);
            });
    });
});  //  process route queryorders/

app.get('/api/order-history/:id', (req, res) => {

    // process response
    console.log('Process OrderHistory transaction.');
    contract.submitTransaction('getOrderHistory', req.params.id).then((orderHistoryResponse) => {
        console.log('Transaction complete.');
        res.send(orderHistoryResponse);
    }, (error) => {
        //  handle error if transaction failed
        error.errorCode = 0;
        console.log('Error thrown from tx promise', error);
        res.status(404);
        res.send(error);
    });
});

// Change status to ORDER_RECEIVED
app.put('/api/receive-order/:id', (req, res) => {

    contract.submitTransaction('receiveOrder', req.params.id).then((receiveOrderResponse) => {
        // process response
        console.log('Process ReceiveOrder transaction.');
        let order = Order.fromBuffer(receiveOrderResponse);
        console.log(`order ${order.orderId} : state = ${order.currentOrderState}`);
        order.errorCode = 1;
        res.send(order);
    }, (error) => {
        //  handle error if transaction failed
        error.errorCode = 0;
        console.log('Error thrown from tx promise: ', error);
        res.send(error);
    });

});  //  process route /

// Change status to ORDER_RECEIVED the name of a shipper to the order.
app.put('/api/assign-shipper/:id', (req, res) => {

    contract.submitTransaction('assignShipper', req.params.id, req.query.shipperid).then((assignShipperResponse) => {
        // process response
        console.log('Process AssignShipper transaction.');
        let order = Order.fromBuffer(assignShipperResponse);
        console.log(`order ${order.orderId} : shipper = ${order.shipperId}, state = ${order.currentOrderState}`);
        order.errorCode = 1;
        res.send(order);
    }, (error) => {
        //  handle error if transaction failed
        error.errorCode = 0;
        console.log('Error thrown from tx promise: ', error);
        res.send(error);
    });
});  //  process route /

// This changes the status on the order, and adds a ship id
app.put('/api/create-shipment-for-order/:id', (req, res) => {

    contract.submitTransaction('createShipment', req.params.id, utils.shipId()).then((createShipmentResponse) => {
        // process response
        console.log('Process CreateShipment transaction.');
        let order = Order.fromBuffer(createShipmentResponse);
        console.log(`order ${order.orderId} : trackingInfo = ${order.trackingInfo}, state = ${order.currentOrderState}`);
        order.errorCode = 1;
        res.send(order);
    }, (error) => {
        //  handle error if transaction failed
        error.errorCode = 0;
        console.log('Error thrown from tx promise: ', error);
        res.send(error);
    });
});  //  process route /

// This changes the status on the order
app.put('/api/transport-shipment/:id', (req, res) => {

    contract.submitTransaction('transportShipment', req.params.id).then((transportShipmentResponse) => {
        // process response
        console.log('Process TransportShipment transaction.');
        let order = Order.fromBuffer(transportShipmentResponse);
        console.log(`order ${order.orderId} : state = ${order.currentOrderState}`);
        order.errorCode = 1;
        res.send(order);
    }, (error) => {
        //  handle error if transaction failed
        error.errorCode = 0;
        console.log('Error thrown from tx promise: ', error);
        res.send(error);
    });
});  //  process route /

// This changes the status on the order
app.put('/api/receive-shipment/:id', (req, res) => {

    contract.submitTransaction('receiveShipment', req.params.id).then((receiveShipmentResponse) => {
        // process response
        console.log('Process ReceiveShipment transaction.');
        let order = Order.fromBuffer(receiveShipmentResponse);
        console.log(`order ${order.orderId} : state = ${order.currentOrderState}`);
        order.errorCode = 1;
        res.send(order);
    }, (error) => {
        //  handle error if transaction failed
        error.errorCode = 0;
        console.log('Error thrown from tx promise: ', error);
        res.send(error);
    });
});

// Delete designated order with id
app.delete('/api/orders/:id', (req, res) => {

    contract.submitTransaction('deleteOrder', req.params.id).then((deleteOrderResponse) => {
        // process response
        console.log('Process DeleteOrder transaction.');
        console.log('Transaction complete.');
        res.send(deleteOrderResponse);
    }, (error) => {
        //  handle error if transaction failed
        error.errorCode = 0;
        console.log('Error thrown from tx promise: ', error);
        res.send(error);
    });
});

////////////////////////////////// User Management APIs ///////////////////////////////////////

//  Purpose:    POST api to register new users with Hyperledger Fabric CA;
//  Note:       After registeration, users have to enroll to get certificates
//              to be able to submit transactions to Hyperledger Fabric Peer.
//  Input:      request.body = {username (string), password (string), usertype (string)}
//              usertype = {"admin", "producer", "shipper", "retailer", "customer", "regulator"}
//  Output:     pwd; If password was "", a generated password is returned in response
//  Usage 1:    "smith", "smithpw", "producer"
//  Usage 2:    "smith", "",        "producer"
app.post('/api/register-user/', (request, response) => {
    console.log("\n--------------  api/registeruser --------------------------");
    let userId = request.body.userid;
    let userPwd = request.body.password;
    let userType = request.body.usertype;
    console.log("\n userid: " + userId);
    console.log("\n pwd: " + userPwd);
    console.log("\n usertype: " + userType);

    //  Note: On the UI, only admin sees the page "Manage Users"
    //  So, it is assumed that only the admin has access to this api
    utils.registerUser(userId, userPwd, userType).then((result) => {
        console.log("\n result from registerUser = ", result)
        console.log("\n----------------- api/registeruser --------------------------");
        response.send(result);
    }, (error) => {
        console.log("\n Error returned from registerUser: " + error);
        console.log("\n----------------- api/registeruser --------------------------");
        response.send(error);
    });

});  //  process route register-user

//  Purpose:    To enroll registered users with Fabric CA;
//              A call to enrollUser to Fabric CA generates (and returns) certificates for the given (registered) user;
//              These certificates are need for subsequent calls to Fabric Peers.
//  Input:  request.body = { userid, password, usertype }
//  Iutput:  Certificate on successful enrollment
//  Usage:  "smith", "smithpw", "producer"
app.post('/api/enroll-user/', (req, response) => {

    console.log("\n--------------  api/enrollUser --------------------------");
    let userId = req.body.userid;
    let userPwd = req.body.password;
    let userType = req.body.usertype;

    console.log("\n userId: " + userId);
    console.log("\n userPwd: " + userPwd);
    console.log("\n userType: " + userType);
    console.log("\n---------------------------------------------------");

    utils.enrollUser(userId, userPwd, userType).then(result => {
        console.log("\n result from enrollUser = \n", result)
        console.log("\n----------------- api/enrollUser --------------------------");
        response.send(result);
    }, error => {
        console.log("\n Error returned from enrollUser: \n" + error);
        console.log("\n----------------- api/enrollUser --------------------------");
        response.status(500).send(error.toString());
    });

})  //  end of app.post('/api/enroll-user/', (req, res) )

//  Purpose:    To check if user is enrolled with Fabric CA;
//  Input:  request.params.id = { userid }
//  Iutput:  Certificate on successful enrollment
//  Usage:  ""
app.get('/api/is-user-enrolled/:id', (req, response) => {

    console.log("\n--------------  api/isUserEnrolled --------------------------");
    let userId = req.params.id;

    console.log("\n userid: " + userId);

    utils.isUserEnrolled(userId).then(result => {
        console.log("\n result from isUserEnrolled = \n", result)
        console.log("\n----------------- api/isUserEnrolled --------------------------");
        response.send(result);
    }, error => {
        console.log("\n Error returned from isUserEnrolled: \n" + error);
        console.log("\n----------------- api/isUserEnrolled --------------------------");
        response.status(500).send(error.toString());
    });

})  //  end of app.post('/api/is-user-enrolled/', (req, res) )

app.get('/api/users', (req, res) => {

    utils.getAllUsers().then((result) => {
        // process response
        console.log('Process getAllUsers response');
        //  result.errorCode = 1;
        res.send(result);
    }, (error) => {
        //  handle error if transaction failed
        error.errorCode = 0;
        console.log('Error returned function getAllUsers:  ', error);
        res.send(error);
    });
});

/*
login()
input:  userid, password
output:  userid, password, usertype
response.errorcode:  SUCCESS, USER_NOT_ENROLLED, TRANSACTION_ERROR
response.errormessage:  will have text for error message (edited)
*/
app.get('/api/login', (req, res) => {

    let userId = req.query.userid;
    let userPwd = req.query.password;

    console.log("in api/login. userId: " + userId + ", userPwd: " + userPwd);

    utils.setUserContext(userId, userPwd)
        .then(gateway_contract => {
            // New contract connection
            contract = gateway_contract;
            contract.submitTransaction('getCurrentUserType').then((userType) => {
                console.log("Successfully submitted getCurrentUserType:" + userType);
                var result = {};
                result.errorcode = SUCCESS;   //  SUCCESS = 0
                result.errormessage = "User " + userId + " is enrolled";
                var tmp = userType.toString();
                result.usertype = tmp.substring(1, tmp.length - 1);
                res.send(result);
            }, (error) => {  //  error in transaction submission
                console.log("ERROR in getCurrentUserType:" + error);
                var result = {};
                result.errorcode = TRANSACTION_ERROR;
                result.errormessage = "Error while invoking transaction in smart contract. ", error;
                //result.usertype = "";
                res.send(result);
            });
        }, error => {  //  not enrolled
            var result = {};
            console.log("ERROR in setUserContext:" + error);
            result.errorcode = USER_NOT_ENROLLED;
            result.errormessage = "User is not registered or enrolled. " + error;
            res.send(result);
        });

});

// Retrieve calling user id
app.get('/api/current-user-id', (req, res) => {

    contract.submitTransaction('getCurrentUserId').then((result) => {
        // process response
        console.log('Transaction complete.');
        res.send(result);
    }, (error) => {
        //  handle error if transaction failed
        error.errorCode = 0;
        console.log('Error thrown from tx promise: ', error);
        res.send(error);
    });
});

app.get('/api/current-user-type', (req, res) => {

    contract.submitTransaction('getCurrentUserType').then((result) => {
        // process response
        console.log('Transaction complete.');
        res.send(result);
    }, (error) => {
        //  handle error if transaction failed
        error.errorCode = 0;
        console.log('Error thrown from tx promise: ', error);
        res.send(error);
    });
});

const port = process.env.PORT || 3000;
app.listen(port, (error) => {
    if (error) {
        return console.log('Error: ' + err);
    }
    console.log(`Server listening on ${port}`)
});
