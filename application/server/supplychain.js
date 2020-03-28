'use strict';

// ccRouter.js
'use strict';

const express = require('express');
const fabricClient = require('./utils.js');
const supplychainRouter = express.Router();

// Bring key classes into scope, most importantly Fabric SDK network class
const Order = require('../../contract/lib/order.js');

const SUCCESS = 0;
const TRANSACTION_ERROR = 401;
const USER_NOT_ENROLLED = 402;

async function getUsernamePassword(request) {
    console.log(">>> getUsernamePassword:");
    // check for basic auth header
    if (!request.headers.authorization || request.headers.authorization.indexOf('Basic ') === -1) {
        return new Promise().reject('Missing Authorization Header');  //  status 401
    }

    // get auth credentials
    const base64Credentials = request.headers.authorization.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [username, password] = credentials.split(':');

    //  At this point, username + password could be verified for auth -
    //  but NOT BEING VERIFIED here.  Username and password are
    //  verified with Fabric-Certificate-Authority at enroll-user time.
    //  Once enrolled,
    //  certificate is retrieved from CA and stored in local wallet.
    //  After that, password will not be used.  username will be used
    //  to pick up certificate from the local wallet.

    if (!username || !password) {
        return new Promise().reject('Invalid Authentication Credentials');  //  status 401
    }

    // attach username and password to request object
    request.username = username;
    request.password = password;

    return request;
}

async function submitTx(request, txName, ...args) {
    try {
        //  check header; get username and pwd from request
        //  does NOT verify auth credentials
        await getUsernamePassword(request);
        fabricClient.setUserContext(request.username, request.password).then((contract) => {

            return fabricClient.submitTx(contract, txName, args);
        }, error => {
            return console.log(error);
        });

    }
    catch (error) { return console.log(error); }
}

//app.post('/api/orders', (request, res) => {
//contract.submitTransaction('orderProduct', JSON.stringify(request.body))
supplychainRouter.route('/orders').post(function (request, res) {
    submitTx(request, 'orderProduct', JSON.stringify(request.body))
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
});

//app.get('/api/orders/:id', (request, res) => {
//  contract.submitTransaction('queryOrder', request.params.id)
supplychainRouter.route('/orders/:id').get(function (request, res) {
    let order;
    submitTx(request, 'queryOrder', request.params.id)
        .then((queryOrderResponse) => {
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

//  SJ: TODO:  More change in this api than other functions
//  So, refer to older version of the file for previous version of this function

// app.get('/api/orders', (request, res) => {
//  gateway_contract.submitTransaction('queryAllOrders', '')
supplychainRouter.route('/orders').get(function (request, res) {
    let orders;
    submitTx(request, 'queryAllOrders', '')
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
});  //  process route queryorders/

//app.get('/api/order-history/:id', (request, res) => {
//contract.submitTransaction('getOrderHistory', request.params.id)
supplychainRouter.route('/order-history/:id').get(function (request, res) {
    // process response
    console.log('Process OrderHistory transaction.');
    submitTx(request, 'getOrderHistory', request.params.id)
        .then((orderHistoryResponse) => {
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
//app.put('/api/receive-order/:id', (request, res) => {
//  contract.submitTransaction('receiveOrder', request.params.id)
supplychainRouter.route('/receive-order/:id').put(function (request, res) {
    submitTx(request, 'receiveOrder', request.params.id)
        .then((receiveOrderResponse) => {
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
//  app.put('/api/assign-shipper/:id', (request, res) => {
//  contract.submitTransaction('assignShipper', request.params.id, request.query.shipperid)
supplychainRouter.route('/assign-shipper/:id').put(function (request, res) {
    submitTx(request, 'assignShipper', request.params.id, request.query.shipperid)
        .then((assignShipperResponse) => {
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
// app.put('/api/create-shipment-for-order/:id', (request, res) => {
// contract.submitTransaction('createShipment', request.params.id, fabricClient.shipId())
supplychainRouter.route('/create-shipment-for-order/:id').put(function (request, res) {
    res.send("supplychain.js: route: /create-shipment-for-order/:id:  This route not fixed yet.  ");

    /*  SJ: TODO: fabricClient.shipId()  find replacement for this
      submitTx (request, 'createShipment', request.params.id, fabricClient.shipId())
      .then((createShipmentResponse) => {
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
      */
});  //  process route /

// This changes the status on the order
// app.put('/api/transport-shipment/:id', (request, res) => {
// contract.submitTransaction('transportShipment', request.params.id)
supplychainRouter.route('/transport-shipment/:id').put(function (request, res) {
    submitTx(request, 'transportShipment', request.params.id)
        .then((transportShipmentResponse) => {
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
//  app.put('/api/receive-shipment/:id', (request, res) => {
//  contract.submitTransaction('receiveShipment', request.params.id)
supplychainRouter.route('/receive-shipment/:id').put(function (request, res) {
    submitTx(request, 'receiveShipment', request.params.id)
        .then((receiveShipmentResponse) => {
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
//  app.delete('/api/orders/:id', (request, res) => {
//  contract.submitTransaction('deleteOrder', request.params.id)
supplychainRouter.route('/orders/:id').delete(function (request, res) {
    submitTx(request, 'deleteOrder', request.params.id)
        .then((deleteOrderResponse) => {
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
// app.post('/api/register-user/', (request, response) => {
supplychainRouter.route('/register-user').post(function (request, response) {
    try {
        console.log("\n\n--------------  api/registeruser --------------------------");
        let userId = request.body.userid;
        let userPwd = request.body.password;
        let userType = request.body.usertype;
        console.log("\n userid: " + userId);
        console.log("\n pwd: " + userPwd);
        console.log("\n usertype: " + userType);

        //  only admin can call this api;  get admin username and pwd from request header
        getUsernamePassword(request)
            .then(request => {

                //  1.  No need to call setUserContext
                //  Fabric CA client is used for register-user;
                //  2.  In this demo application UI, only admin sees the page "Manage Users"
                //  So, it is assumed that only the admin has access to this api
                //  register-user can only be called by a user with admin privileges.

                fabricClient.registerUser(userId, userPwd, userType, request.username).
                    then((result) => {
                        response.send(result);
                    }, (error) => {
                        response.send(console.log("\n Error returned from registerUser: " + error));
                    });
            }, error => {
                response.send(console.log("\n Error returned from registerUser: " + error));
            });
    } catch (error) {
        response.send(console.log('\n Unexpected error in /api/register-user: ', error));
    }
});  //  process route register-user

//  Purpose:    To enroll registered users with Fabric CA;
//              A call to enrollUser to Fabric CA generates (and returns) certificates for the given (registered) user;
//              These certificates are need for subsequent calls to Fabric Peers.
//  Input:  request.body = { userid, password, usertype }
//  Iutput:  Certificate on successful enrollment
//  Usage:  "smith", "smithpw", "producer"
//app.post('/api/enroll-user/', (request, response) => {
supplychainRouter.route('/enroll-user/').post(function (request, response) {
    console.log("\n--------------  api/enrollUser --------------------------");
    let userId = request.body.userid;
    let userPwd = request.body.password;
    let userType = request.body.usertype;

    console.log("\n userId: " + userId);
    console.log("\n userPwd: " + userPwd);
    console.log("\n userType: " + userType);
    console.log("\n---------------------------------------------------");

    fabricClient.enrollUser(userId, userPwd, userType).then(result => {
        console.log("\n result from enrollUser = \n", result)
        console.log("\n----------------- api/enrollUser --------------------------");
        response.send(result);
    }, error => {
        console.log("\n Error returned from enrollUser: \n" + error);
        console.log("\n----------------- api/enrollUser --------------------------");
        response.status(500).send(error.toString());
    });

});  //  post('/api/enroll-user/', (request, res) )

//  Purpose:    To check if user is enrolled with Fabric CA;
//  Input:  request.params.id = { userid }
//  Iutput:  Certificate on successful enrollment
//  Usage:  ""
/*
app.get('/api/is-user-enrolled/:id', (request, response) => {
*/
supplychainRouter.route('/is-user-enrolled/:id').get(function (request, res) {
    //  only admin can call this api;  get admin username and pwd from request header
    getUsernamePassword(request)
        .then(request => {
            let userId = request.params.id;
            console.log("\n userid: " + userId);
            fabricClient.isUserEnrolled(userId).then(result => {
                console.log("\n result from is-user-enrolled = \n", result)
                console.log("\n----------------- api/is-user-enrolled --------------------------");
                res.send(result);
            }, error => {
                console.log("\n Error returned from is-user-enrolled: \n" + error);
                console.log("\n----------------- api/is-user-enrolled --------------------------");
                res.status(500).send(error.toString());
            });
        }, ((error) => {
            console.log('Error returned function is-user-enrolled:  ', error);
            res.send(error);
        }));
})  //  end of is-user-enrolled

//  Purpose: Get list of all users
//  Output:  array of all registered users
//  Usage:  ""
//app.get('/api/users', (req, res) => {
supplychainRouter.route('/users').get(function (request, res) {
    getUsernamePassword(request)
        .then(request => {
            fabricClient.getAllUsers(request.username).then((result) => {
                // process response
                console.log('Process getAllUsers response');
                result.errorcode = 0;
                res.send(result);
            }, (error) => {
                //  handle error if transaction failed
                error.errorcode = 1;
                console.log('Error returned function getAllUsers:  ', error);
                res.send(error);
            });
        }, ((error) => {
            console.log('Error returned ', error.url);
            res.send(error);
        }));
});

supplychainRouter.route('/users/:id').get(function (request, res) {
    //  only admin can call this api;  get admin username and pwd from request header
    getUsernamePassword(request)
        .then(request => {
            fabricClient.getUser(request.username).then((result) => {
                // process response
                console.log('Process getUser response');
                result.errorcode = 0;
                res.send(result);
            }, (error) => {
                //  handle error if transaction failed
                error.errorcode = 1;
                console.log('Error returned from: ', error.url);
                res.send(error);
            });
        }, ((error) => {
            console.log('Error returned ', error.url);
            res.send(error);
        }));
});

module.exports = supplychainRouter;
