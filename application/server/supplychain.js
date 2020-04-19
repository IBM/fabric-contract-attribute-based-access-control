/*
* Copyright IBM Corp All Rights Reserved
*
* SPDX-License-Identifier: Apache-2.0
*/
'use strict';
const express = require('express');
const utils = require('./utils.js');
const supplychainRouter = express.Router();

// Bring key classes into scope, most importantly Fabric SDK network class
const Order = require('../../contract/lib/order.js');

const STATUS_SUCCESS = 200;
const STATUS_CLIENT_ERROR = 400;
const STATUS_SERVER_ERROR = 500;

//  USER Management Errors
const USER_NOT_ENROLLED = 1000;
const INVALID_HEADER = 1001;

//  application specific errors
const SUCCESS = 0;
const ORDER_NOT_FOUND = 2000;

async function getUsernamePassword(request) {
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
        return utils.setUserContext(request.username, request.password).then((contract) => {
            // Insert txName as args[0]
            args.unshift(txName);
            // Insert contract as args[0]
            args.unshift(contract);
            // .apply applies the list entries as parameters to the called function
            return utils.submitTx.apply("unused", args)
                .then(buffer => {
                    return buffer;
                }, error => {
                    return Promise.reject(error);
                });
        }, error => {
            return Promise.reject(error);
        });
    }
    catch (error) {
        return Promise.reject(error);
    }
}

supplychainRouter.route('/orders').get(function (request, response) {
    submitTx(request, 'queryAllOrders', '')
        .then((queryOrderResponse) => {
            //  response is already a string;  not a buffer
            let orders = queryOrderResponse;
            response.status(STATUS_SUCCESS);
            response.send(orders);
        }, (error) => {
            response.status(STATUS_SERVER_ERROR);
            response.send(utils.prepareErrorResponse(error, STATUS_SERVER_ERROR,
                "There was a problem getting the list of orders."));
        });
});  //  process route orders/

supplychainRouter.route('/orders/:id').get(function (request, response) {
    submitTx(request, 'queryOrder', request.params.id)
        .then((queryOrderResponse) => {
            // process response
            let order = Order.fromBuffer(queryOrderResponse);
            console.log(`order ${order.orderId} : price = ${order.price}, quantity = ${order.quantity}, producer = ${order.producerId}, consumer = ${order.retailerId}, trackingInfo = ${order.trackingInfo}, state = ${order.currentOrderState}`);
            response.status(STATUS_SUCCESS);
            response.send(order);
        }, (error) => {
            response.status(STATUS_SERVER_ERROR);
            response.send(utils.prepareErrorResponse(error, ORDER_NOT_FOUND,
                'Order id, ' + request.params.id +
                ' does not exist or the user does not have access to order details at this time.'));
        });
});

supplychainRouter.route('/orders').post(function (request, response) {
    submitTx(request, 'orderProduct', JSON.stringify(request.body))
        .then((result) => {
            // process response
            console.log('\nProcess orderProduct transaction.');
            let order = Order.fromBuffer(result);
            console.log(`order ${order.orderId} : price = ${order.price}, quantity = ${order.quantity}, producer = ${order.producerId}, consumer = ${order.retailerId}, trackingInfo = ${order.trackingInfo}, state = ${order.currentOrderState}`);
            response.status(STATUS_SUCCESS);
            response.send(order);
        }, (error) => {
            response.status(STATUS_SERVER_ERROR);
            response.send(utils.prepareErrorResponse(error, STATUS_SERVER_ERROR,
                "There was a problem placing the order."));
        });
});


supplychainRouter.route('/order-history/:id').get(function (request, response) {
    submitTx(request, 'getOrderHistory', request.params.id)
        .then((orderHistoryResponse) => {
            console.log('\n>>>Process getOrderHistory response', orderHistoryResponse);
            //  response is already a string;  not a buffer
            //  no need of conversion from buffer to string
            response.status(STATUS_SUCCESS);
            response.send(orderHistoryResponse);
        }, (error) => {
            response.status(STATUS_SERVER_ERROR);
            response.send(utils.prepareErrorResponse(error, STATUS_SERVER_ERROR,
                "There was a problem fetching history for order, ", request.params.id));
        });
});

// Change status to ORDER_RECEIVED
supplychainRouter.route('/receive-order/:id').put(function (request, response) {
    submitTx(request, 'receiveOrder', request.params.id)
        .then((receiveOrderResponse) => {
            // process response
            console.log('Process ReceiveOrder transaction.');
            let order = Order.fromBuffer(receiveOrderResponse);
            console.log(`order ${order.orderId} : state = ${order.currentOrderState}`);
            response.status(STATUS_SUCCESS);
            response.send(order);
        }, (error) => {
            response.status(STATUS_SERVER_ERROR);
            response.send(utils.prepareErrorResponse(error, STATUS_SERVER_ERROR,
                "There was a problem in receiving order, ", request.params.id));
        });

});  //  process route /

// Change status to ORDER_RECEIVED, add name of a shipper to order.
supplychainRouter.route('/assign-shipper/:id').put(function (request, response) {
    submitTx(request, 'assignShipper', request.params.id, request.query.shipperid)
        .then((assignShipperResponse) => {
            console.log('Process AssignShipper transaction.');
            let order = Order.fromBuffer(assignShipperResponse);
            console.log(`order ${order.orderId} : shipper = ${order.shipperId}, state = ${order.currentOrderState}`);
            response.status(STATUS_SUCCESS);
            response.send(order);
        }, (error) => {
            response.status(STATUS_SERVER_ERROR);
            response.send(utils.prepareErrorResponse(error, STATUS_SERVER_ERROR,
                "There was a problem in assigning shipper for order, ", request.params.id));
        });
});  //  process route /

// This changes the status on the order, and adds a ship id
supplychainRouter.route('/create-shipment-for-order/:id').put(function (request, response) {
    submitTx (request, 'createShipment', request.params.id, utils.getRandomNum())
      .then((createShipmentResponse) => {
          console.log('Process CreateShipment transaction.');
          let order = Order.fromBuffer(createShipmentResponse);
          console.log(`order ${order.orderId} : trackingInfo = ${order.trackingInfo}, state = ${order.currentOrderState}`);
          response.status(STATUS_SUCCESS);
          response.send(order);
      }, (error) => {
          response.status(STATUS_SERVER_ERROR);
          response.send(utils.prepareErrorResponse(error, STATUS_SERVER_ERROR,
              "There was a problem in creating shipment for order," + request.params.id));
      });
});  //  process route /

// This changes the status on the order
supplychainRouter.route('/transport-shipment/:id').put(function (request, response) {
    submitTx(request, 'transportShipment', request.params.id)
        .then((transportShipmentResponse) => {
            console.log('Process TransportShipment transaction.');
            let order = Order.fromBuffer(transportShipmentResponse);
            console.log(`order ${order.orderId} : state = ${order.currentOrderState}`);
            response.status(STATUS_SUCCESS);
            response.send(order);
        }, (error) => {
            response.status(STATUS_SERVER_ERROR);
            response.send(utils.prepareErrorResponse(error, STATUS_SERVER_ERROR,
                "There was a problem in initiating shipment for order," + request.params.id));
        });
});  //  process route /

// This changes the status on the order
supplychainRouter.route('/receive-shipment/:id').put(function (request, response) {
    submitTx(request, 'receiveShipment', request.params.id)
        .then((receiveShipmentResponse) => {
            // process response
            console.log('Process ReceiveShipment transaction.');
            let order = Order.fromBuffer(receiveShipmentResponse);
            console.log(`order ${order.orderId} : state = ${order.currentOrderState}`);
            response.status(STATUS_SUCCESS);
            response.send(order);
        }, (error) => {
            response.status(STATUS_SERVER_ERROR);
            response.send(utils.prepareErrorResponse(error, STATUS_SERVER_ERROR,
                "There was a problem in receiving shipment for order," + request.params.id));
        });
});

// Delete designated order with id
//  app.delete('/api/orders/:id', (request, response) => {
//  contract.submitTransaction('deleteOrder', request.params.id)
supplychainRouter.route('/orders/:id').delete(function (request, response) {
    submitTx(request, 'deleteOrder', request.params.id)
        .then((deleteOrderResponse) => {
            // process response
            console.log('Process DeleteOrder transaction.');
            console.log('Transaction complete.');
            response.status(STATUS_SUCCESS);
            response.send(deleteOrderResponse);
        }, (error) => {
            response.status(STATUS_SERVER_ERROR);
            response.send(utils.prepareErrorResponse(error, STATUS_SERVER_ERROR,
                "There was a problem in deleting order, " + request.params.id));
        });
});

////////////////////////////////// User Management APIs ///////////////////////////////////////

//  Purpose:    POST api to register new users with Hyperledger Fabric CA;
//  Note:       After registration, users have to enroll to get certificates
//              to be able to submit transactions to Hyperledger Fabric Peer.
//  Input:      request.body = {username (string), password (string), usertype (string)}
//              usertype = {"admin", "producer", "shipper", "retailer", "customer", "regulator"}
//              An admin identity is required to make this call to CA and
//              should be passed in authorization header.
//  Output:     pwd; If password was "", a generated password is returned in response
//  Usage 1:    "smith", "smithpw", "producer"
//  Usage 2:    "smith", "",        "producer"
supplychainRouter.route('/register-user').post(function (request, response) {
    try {
        let userId = request.body.userid;
        let userPwd = request.body.password;
        let userType = request.body.usertype;

        //  only admin can call this api;  get admin username and pwd from request header
        getUsernamePassword(request)
            .then(request => {
                //  1.  No need to call setUserContext
                //  Fabric CA client is used for register-user;
                //  2.  In this demo application UI, only admin sees the page "Manage Users"
                //  So, it is assumed that only the admin has access to this api
                //  register-user can only be called by a user with admin privileges.

                utils.registerUser(userId, userPwd, userType, request.username).
                    then((result) => {
                        response.status(STATUS_SUCCESS);
                        response.send(result);
                    }, (error) => {
                        response.status(STATUS_CLIENT_ERROR);
                        response.send(utils.prepareErrorResponse(error, STATUS_CLIENT_ERROR,
                            "User, " + userId + " could not be registered. "
                            + "Verify if calling identity has admin privileges."));
                    });
            }, error => {
                response.status(STATUS_CLIENT_ERROR);
                response.send(utils.prepareErrorResponse(error, INVALID_HEADER,
                    "Invalid header;  User, " + userId + " could not be registered."));
            });
    } catch (error) {
        response.status(STATUS_SERVER_ERROR);
        response.send(utils.prepareErrorResponse(error, STATUS_SERVER_ERROR,
            "Internal server error; User, " + userId + " could not be registered."));
    }
});  //  process route register-user

//  Purpose:    To enroll registered users with Fabric CA;
//  A call to enrollUser to Fabric CA generates (and returns) certificates for the given (registered) user;
//  These certificates are need for subsequent calls to Fabric Peers.
//  Input: { userid, password } in header and request.body.usertype
//  Output:  Certificate on successful enrollment
//  Usage:  "smith", "smithpw", "producer"
supplychainRouter.route('/enroll-user/').post(function (request, response) {
    let userType = request.body.usertype;
    //  retrieve username, password of the called from authorization header
    getUsernamePassword(request).then(request => {
        utils.enrollUser(request.username, request.password, userType).then(result => {
            response.status(STATUS_SUCCESS);
            response.send(result);
        }, error => {
            response.status(STATUS_CLIENT_ERROR);
            response.send(utils.prepareErrorResponse(error, STATUS_CLIENT_ERROR,
                "User, " + request.username + " could not be enrolled. Check that user is registered."));
        });
    }), (error => {
        response.status(STATUS_CLIENT_ERROR);
        response.send(utils.prepareErrorResponse(error, INVALID_HEADER,
            "Invalid header;  User, " + request.username + " could not be enrolled."));
    });
});  //  post('/api/enroll-user/', (request, response) )

//  Purpose:    To check if user is enrolled with Fabric CA;
//  Input:  request.params.id = { userid }
//  Iutput:  Certificate on successful enrollment
//  Usage:  ""
/*
app.get('/api/is-user-enrolled/:id', (request, response) => {
*/
supplychainRouter.route('/is-user-enrolled/:id').get(function (request, response) {
    //  only admin can call this api;  But this is not verified here
    //  get admin username and pwd from request header
    //
    getUsernamePassword(request)
        .then(request => {
            let userId = request.params.id;
            utils.isUserEnrolled(userId).then(result => {
                response.status(STATUS_SUCCESS);
                response.send(result);
            }, error => {
                response.status(STATUS_CLIENT_ERROR);
                response.send(utils.prepareErrorResponse(error, STATUS_CLIENT_ERROR,
                  "Error checking enrollment for user, " + request.params.id));
            });
        }, ((error) => {
            response.status(STATUS_CLIENT_ERROR);
            response.send(utils.prepareErrorResponse(error, INVALID_HEADER,
                "Invalid header; Error checking enrollment for user, " + request.params.id));
        }));
})  //  end of is-user-enrolled

//  Purpose: Get list of all users
//  Output:  array of all registered users
//  Usage:  ""
supplychainRouter.route('/users').get(function (request, response) {
    getUsernamePassword(request)
        .then(request => {
            utils.getAllUsers(request.username).then((result) => {
                response.status(STATUS_SUCCESS);
                response.send(result);
            }, (error) => {
                response.status(STATUS_SERVER_ERROR);
                response.send(utils.prepareErrorResponse (error, STATUS_SERVER_ERROR,
                    "Problem getting list of users."));
            });
        }, ((error) => {
            response.status(STATUS_CLIENT_ERROR);
            response.send(utils.prepareErrorResponse(error, INVALID_HEADER,
                "Invalid header;  User, " + request.username + " could not be enrolled."));
        }));
});

supplychainRouter.route('/users/:id').get(function (request, response) {
    //  Get admin username and pwd from request header
    //  Only admin can call this api; this is not verified here;
    //  Possible future enhancement
    getUsernamePassword(request)
        .then(request => {
            utils.isUserEnrolled(request.params.id).then(result1 => {
                if (result1 == true) {
                    utils.getUser(request.params.id, request.username).then((result2) => {
                        response.status(STATUS_SUCCESS);
                        response.send(result2);
                    }, (error) => {
                        response.status(STATUS_SERVER_ERROR);
                        response.send(utils.prepareErrorResponse(error, STATUS_SERVER_ERROR,
                            "Could not get user details for user, " + request.params.id));
                    });
                } else {
                    let error = {};
                    response.status(STATUS_CLIENT_ERROR);
                    response.send(utils.prepareErrorResponse(error, USER_NOT_ENROLLED,
                        "Verify if the user is registered and enrolled."));
                }
            }, error => {
                response.status(STATUS_SERVER_ERROR);
                response.send(utils.prepareErrorResponse(error, STATUS_SERVER_ERROR,
                    "Problem checking for user enrollment."));
            });
        }, ((error) => {
            response.status(STATUS_CLIENT_ERROR);
            response.send(utils.prepareErrorResponse(error, INVALID_HEADER,
                "Invalid header;  User, " + request.params.id + " could not be enrolled."));
        }));
});

module.exports = supplychainRouter;
