/*
SPDX-License-Identifier: Apache-2.0
*/

'use strict';

// Fabric smart contract classes
const { Contract, Context} = require('fabric-contract-api');

// supplychainnet specifc classes
const Order = require('./order.js');
const OrderStates = require('./order.js').orderStates;

//  EVENT
const EVENT_TYPE = "bcpocevent";

//  Error codes
const DUPLICATE_ORDER_ID = 101;
const ORDER_ID_NOT_FOUND = 102;

/**
 * A custom context provides easy access to list of all products
 */
class SupplychainContext extends Context {
    constructor() {
        super();
    }
}

/**
 * Define product smart contract by extending Fabric Contract class
 */
class SupplychainContract extends Contract {

    constructor() {
        // Unique namespace when multiple contracts per chaincode file
        super('org.supplychainnet.contract');
    }

    /**
     * Define a custom context for product
    */
    createContext() {
        return new SupplychainContext();
    }

    /**
     * Instantiate to perform any setup of the ledger that might be required.
     * @param {Context} ctx the transaction context
     */
    async init(ctx) {
        // No implementation required with this example
        // It could be where data migration is performed, if necessary
        console.log('Instantiate the contract');
    }

    /**
      * Tx_GetUserRole
      * To be called by application to get the role for a user who is logged in
      *
      * @param {Context} ctx the transaction context
      * @param {String}  args
      * Usage:  Tx_ReceiveOrder ('Order001')
     */
    async Tx_GetUserRole(ctx, args) {
        //  check user id;  if admin, return role = admin;
        //  else return value set for attribute "approle" in certificate;
        console.log ("Tx_GetUserRole():  ctx = " + ctx);

        let userid = this.getCallingUserid(ctx);

        if (userid == "admin") {
            return userid;
        }
        let approle = this.getApprole(ctx);
        console.log ("approle = " + approle);
        return approle;
    }

    /**
     * Tx_OrderProduct
     * To be used by a retailer when he orders a product
     *
     * @param {Context} ctx the transaction context
     * @param {String} orderId
     * @param {String} productId
     * @param {float} price
     * @param {Integer} quantity
     * @param {String} producerId
     * @param {String} retailerId

     * Usage: submitTransaction ('Tx_OrderProduct', 'Order001', 'mango', 100.00, 100, 'farm1', 'walmart')
     * Usage: ["Order100", "mango", "10.00", "102", "farm1", "walmart"]
    */
    async Tx_OrderProduct(ctx, orderId, productId, price, quantity, producerId, retailerId) {

        // Access Control: This transaction should only be invoked by a Producer or Retailer
        let userRole = this.getApprole(ctx);
        if ((userRole != "admin") // admin only has access as a precaution.
            && (userRole != "producer")
            && (userRole != "retailer"))
            throw new Error(`This user does not have access to create an order`);

        // Check if an order already exists with id=orderId
        var orderAsBytes = await ctx.stub.getState(orderId);
        if (orderAsBytes && orderAsBytes.length > 0) {
            throw new Error(`Error Message from Tx_OrderProduct:\nOrder with orderId = ${orderId} already exists.`);
        }

        // Create a new Order object
        let order = Order.createInstance(orderId, productId, price, quantity, producerId, retailerId, this.getCallingUserid (ctx));

        // Change currentOrderState to ORDER_CREATED;
        order.setStateToOrderCreated();
        order.trackingInfo = '';

        // Update ledger
        await ctx.stub.putState(orderId, order.toBuffer());

        // Define and set event
        let orderCreatedEvent = order;
        order.event_type = "createOrder";   //  add the field "event_type" for the event to be processed

        try {
            //await ctx.stub.setEvent(EVENT_TYPE, Buffer.from(JSON.stringify(orderCreatedEvent));
            await ctx.stub.setEvent(EVENT_TYPE, order.toBuffer());
        }
        catch (error) {
            console.log("Error in sending event");
        }
        finally {
            console.log("Attempted to send event = ", Buffer.from(JSON.stringify(orderCreatedEvent)));
        }

        // Must return a serialized order to caller of smart contract
        return order.toBuffer();
    }

    /**
      * Tx_ReceiveOrder
      * To be called by a Producer when an order is received (and he begins to process the order)
      *
      * @param {Context} ctx the transaction context
      * @param {String}  orderId
      * Usage:  Tx_ReceiveOrder ('Order001')
     */
    async Tx_ReceiveOrder(ctx, orderId) {

        // Retrieve the current order using key provided
        var orderAsBytes = await ctx.stub.getState(orderId);
        if (!orderAsBytes || orderAsBytes.length === 0) {
            throw new Error(`Error Message from Tx_ReceiveOrder:\nOrder with orderId = ${orderId} does not exist.`);
        }

        // Convert order so we can modify fields
        var order = Order.deserialize(orderAsBytes);

        // Access Control: This transaction should only be invoked by designated Producer
        let userId = this.getCallingUserid(ctx);
        if ((userId != "admin") // admin only has access as a precaution.
        && (userId != order.producerId))
        throw new Error(`${userId} does not have access to receive order ${orderId}`);

        // Change currentOrderState
        order.setStateToOrderReceived();

        // Track who is invoking this transaction
        order.modifiedBy = this.getCallingUserid (ctx);

        // Update ledger
        await ctx.stub.putState(orderId, order.toBuffer());

        // Must return a serialized order to caller of smart contract
        return order.toBuffer();
    }

    /**
     * Tx_AssignShipper
     *
     * @param {Context} ctx the transaction context
     * @param {String}  orderId
     * @param {String}  newShipperId
     *
     * Usage:  Tx_AssignShipper ('Order001', 'ups')
    */
    async Tx_AssignShipper(ctx, orderId, newShipperId) {

        //  Retrieve the current order using key provided
        var orderAsBytes = await ctx.stub.getState(orderId);
        if (!orderAsBytes || orderAsBytes.length === 0) {
            throw new Error(`Error Message from Tx_AssignShipper:\nOrder with orderId = ${orderId} does not exist.`);
        }

        // Convert order so we can modify fields
        var order = Order.deserialize(orderAsBytes);

        // Access Control: This transaction should only be invoked by designated Producer
        let userId = this.getCallingUserid(ctx);
        if ((userId != "admin") // admin only has access as a precaution.
        && (userId != order.producerId))
        throw new Error(`${userId} does not have access to assign a shipper to order ${orderId}`);

        // Change currentOrderState to SHIPMENT_ASSIGNED;
        order.setStateToShipmentAssigned();
        // Set shipperId
        order.shipperId = newShipperId;
        // Track who is invoking this transaction
        order.modifiedBy = this.getCallingUserid (ctx);

        // Update ledger
        await ctx.stub.putState(orderId, order.toBuffer());

        // Must return a serialized order to caller of smart contract
        return order.toBuffer();
    }

    /**
     * Tx_CreateShipment
     *
     * @param {Context} ctx the transaction context
     * @param {String}  orderId
     * @param {String}  trackingInfo
     * Usage:  Tx_CreateShipment ('Order001', '34590279RKE9D339')
    */
    async Tx_CreateShipment(ctx, orderId, newTrackingInfo) {

        //  NOTE: There is no shipment asset.  A shipment is created for each order.
        //  Shipment is tracked using order asset.

        // Retrieve the current order using key provided
        var orderAsBytes = await ctx.stub.getState(orderId);
        if (!orderAsBytes || orderAsBytes.length === 0) {
            throw new Error(`Error Message from Tx_CreateShipment:\nOrder with orderId = ${orderId} does not exist.`);
        }

        // Convert order so we can modify fields
        var order = Order.deserialize(orderAsBytes);

        // Access Control: This transaction should only be invoked by a designated Shipper
        let userId = this.getCallingUserid(ctx);
        if ((userId != "admin") // admin only has access as a precaution.
        && (userId != order.shipperId))
        throw new Error(`${userId} does not have access to create a shipment for order ${orderId}`);

        // Change currentOrderState to SHIPMENT_CREATED;
        order.setStateToShipmentCreated();
        // Set Tracking info
        order.trackingInfo = newTrackingInfo;
        // Track who is invoking this transaction
        order.modifiedBy = this.getCallingUserid (ctx);

        // Update ledger
        await ctx.stub.putState(orderId, order.toBuffer());

        // Must return a serialized order to caller of smart contract
        return order.toBuffer();
    }

    /**
     * Tx_TransportShipment
     *
     * @param {Context} ctx the transaction context
     * @param {String}  orderId
     *
     * Usage:  Tx_TransportShipment ('Order001')
    */
    async Tx_TransportShipment(ctx, orderId) {

        // Retrieve the current order using key provided
        var orderAsBytes = await ctx.stub.getState(orderId);
        if (!orderAsBytes || orderAsBytes.length === 0) {
            throw new Error(`Error Message from Tx_TransportShipment:\nOrder with orderId = ${orderId} does not exist.`);
        }

        // Retrieve the current order using key provided
        var order = Order.deserialize(orderAsBytes);

        // Access Control: This transaction should only be invoked by designated designated Shipper
        let userId = this.getCallingUserid(ctx);
        if ((userId != "admin") // admin only has access as a precaution.
        && (userId != order.shipperId)) // This transaction should only be invoked by
        throw new Error(`${userId} does not have access to transport shipment for order ${orderId}`);

        // Change currentOrderState to SHIPMENT_IN_TRANSIT;
        order.setStateToShipmentInTransit();
        // Track who is invoking this transaction
        order.modifiedBy = this.getCallingUserid (ctx);

        // Update ledger
        await ctx.stub.putState(orderId, order.toBuffer());

        // Must return a serialized order to caller of smart contract
        return order.toBuffer();
    }

    /**
     * Tx_ReceiveShipment:
     * To be called by Retailer when a shipment (corresponding to orderId) is received.
     *
     * @param {Context} ctx the transaction context
     * @param {String}  orderId
     * Usage:  Tx_ReceiveShipment ('Order001')
    */
    async Tx_ReceiveShipment(ctx, orderId) {

        // Retrieve the current order using key provided
        var orderAsBytes = await ctx.stub.getState(orderId);
        if (!orderAsBytes || orderAsBytes.length === 0) {
            throw new Error(`Error Message from Tx_ReceiveShipment:\nOrder with orderId = ${orderId} does not exist.`);
        }

        // Retrieve the current order using key provided
        var order = Order.deserialize(orderAsBytes);

        // Access Control: This transaction should only be invoked by designated originating Retailer
        let userId = this.getCallingUserid(ctx);
        if ((userId != "admin") // admin only has access as a precaution.
        && (userId != order.retailerId)) // This transaction should only be invoked by
        throw new Error(`${userId} does not have access to receive shipment for order ${orderId}`);

        // Change currentOrderState to SHIPMENT_RECEIVED;
        order.setStateToShipmentReceived();
        // Track who is invoking this transaction
        order.modifiedBy = this.getCallingUserid (ctx);

        // Update ledger
        await ctx.stub.putState(orderId, order.toBuffer());

        // Must return a serialized order to caller of smart contract
        return order.toBuffer();
    }

    /**
     * Tx_QueryOrder
     *
     * @param {Context} ctx the transaction context
     * @param {String}  orderId
     * Usage:  Tx_QueryOrder ('Order001')
     *
    */
    async Tx_QueryOrder(ctx, orderId) {
        console.log("....................................\nTx_QueryOrder: orderId = " + orderId);

        var orderAsBytes = await ctx.stub.getState(orderId);

        //  Set an event (irrespective of whether the order existed or not)
        // define and set EVENT_TYPE
        let queryEvent = {
            type: EVENT_TYPE,
            orderId: orderId,
            desc: "Query Order was executed for " + orderId
        };
        await ctx.stub.setEvent(EVENT_TYPE, Buffer.from(JSON.stringify(queryEvent)));

        if (!orderAsBytes || orderAsBytes.length === 0) {
            throw new Error(`Error Message from Tx_QueryOrder:\nOrder with orderId = ${orderId} does not exist.`);
        }

        // Access Control:
        var order = Order.deserialize(orderAsBytes);
        let userId = this.getCallingUserid(ctx);
        if ((userId != "admin") // admin only has access as a precaution.
            && (userId != order.producerId) // This transaction should only be invoked by
            && (userId != order.retailerId) //     Producer, Retailer, Shipper associated with order
            && (userId != order.shipperId))
        throw new Error(`${userId} does not have access to the details of order ${orderId}`);

        // Return a serialized order to caller of smart contract
        return orderAsBytes;
    }  //  Tx_QueryOrder

    /**
     * Tx_QueryAllOrders
     *   New version of queryorders where ACLs are applied
     * switch on
     * "customer": customer does not have access this api
     * "regulator": return all orders
     * "producer", "shipper","retailer": return the list of orders in which the caller is part of
     * @param {Context} ctx the transaction context
     * @param {String}  args
     * Usage:  Tx_QueryAllOrders ('ALL')
    */
    async Tx_QueryAllOrders(ctx, args) {
        console.log('============= Tx_QueryAllOrders ===========');
        console.log("input, args = " + args);

        let userId = this.getCallingUserid(ctx);
        let approle = this.getApprole(ctx);

        let queryString;
        //  For adding filters in query, usage: {"selector":{"producerId":"farm1"}}

        // Access control done using query strings
        switch (approle) {

            case "regulator": {
                queryString = {
                    "selector": {}  //  no filter;  return all orders
                }
                break;
            }

            case "producer": {
                queryString = {
                    "selector": {
                        "producerId": userId
                    }
                }
                break;
            }
            case "shipper": {
                queryString = {
                    "selector": {
                        "shipperId": userId
                    }
                }
                break;
            }
            case "retailer": {
                queryString = {
                    "selector": {
                        "retailerId": userId
                    }
                }
                break;
            }
            case "customer": {
                throw new Error(`${userId} does not have access to this transaction`);
            }
            default: {
                return [];
            }
        }

        console.log("In Tx_QueryAllOrders:  queryString = " + queryString);
        // Get all orders that meet queryString criteria
        const iterator = await ctx.stub.getQueryResult(JSON.stringify(queryString));
        const allOrders = [];

        // Iterate through them and build an array of JSON objects
        while (true) {
            const order = await iterator.next();
            if (order.value && order.value.value.toString()) {
                console.log(order.value.value.toString('utf8'));

                let Record;

                try {
                    Record = JSON.parse(order.value.value.toString('utf8'));
                } catch (err) {
                    console.log(err);
                    Record = order.value.value.toString('utf8');
                }

                // Add to array of orders
                allOrders.push(Record);
            }

            if (order.done) {
                console.log('end of data');
                await iterator.close();
                console.info(allOrders);
                return allOrders;
            }
        }
    }  //  Tx_QueryAllOrders

    /**
     * Tx_QueryAllOrdersNoACL
     *  This is left in here for development purposes only
     *
     * @param {Context} ctx the transaction context
     * @param {String}  args
     * Usage:  Tx_QueryAllOrdersNoACL ('ALL')
    */
    async Tx_QueryAllOrdersNoACL(ctx, args) {
        console.log('============= Tx_QueryAllOrdersNoACL ===========');
        console.log("input, args = " + args);

        let queryString;
        //  For adding filters in query, usage: {"selector":{"producerId":"farm1"}}

        if (args = 'ALL') {
            queryString = {
                "selector": {}
            }
        } else {
            queryString = {
                "selector": {
                    "status": args
                }
            }
        }

        const iterator = await ctx.stub.getQueryResult(JSON.stringify(queryString));
        const allOrders = [];

        while (true) {
            const order = await iterator.next();
            if (order.value && order.value.value.toString()) {
                console.log(order.value.value.toString('utf8'));

                let Record;

                try {
                    Record = JSON.parse(order.value.value.toString('utf8'));
                } catch (err) {
                    console.log(err);
                    Record = order.value.value.toString('utf8');
                }

                allOrders.push(Record);
            }

            if (order.done) {
                console.log('end of data');
                await iterator.close();
                console.info(allOrders);
                return allOrders;
            }
        }
    }  //  Tx_QueryAllOrdersNoACL

    /**
     * Tx_GetOrderHistory
     *
     * @param {Context} ctx the transaction context
     * @param {String}  args
     * Usage:  Tx_GetOrderHistory ('Order001')
     */

    async Tx_GetOrderHistory(ctx, orderId) {
        console.info('============= Tx_GetOrderHistory ===========');
        console.log("input, orderId = " + orderId);
        if (orderId.length < 1) {
            throw new Error('Incorrect number of arguments. Expecting 1')
        }

        // Retrieve the current order using key provided
        var orderAsBytes = await ctx.stub.getState(orderId);

        if (!orderAsBytes || orderAsBytes.length === 0) {
            throw new Error(`Error Message from Tx_GetOrderHistory:\nOrder with orderId = ${orderId} does not exist.`);
        }

        // Access Control: Only those associated with this order
        // Retrieve the current order using key provided
        var order = Order.deserialize(orderAsBytes);
        let userId = this.getCallingUserid(ctx);
        let approle = this.getApprole(ctx);

        // Access Control:
        if ((userId != "admin")             // admin only has access as a precaution.
            && (approle != "customer")      // Customers can see any order if it's in the correct state
            && (approle != "regulator")     // Regulators can see any order
            && (userId != order.producerId) // Only producer, retailer, shipper associated
            && (userId != order.retailerId) //      with this order can see its details
            && (userId != order.shipperId))
        throw new Error(`${userId} does not have access to order ${orderId}`);

        // Customer can only view order history if order has completed cycle
        if ((approle == "customer") && (order.currentOrderState != OrderStates.SHIPMENT_RECEIVED))
        throw new Error(`Information about order ${orderId} is not available to ${userId} yet`);

        console.info('- start GetHistoryForOrder: %s\n', orderId);

        // Get list of transactions for order
        const iterator = await ctx.stub.getHistoryForKey(orderId);
        const orderHistory = [];

        while (true) {
            let history = await iterator.next();

            if (history.value && history.value.value.toString()) {
                let jsonRes = {};
                jsonRes.TxId = history.value.tx_id;
                jsonRes.IsDelete = history.value.is_delete.toString();
                // Convert Timestamp date
                var d = new Date(0);
                d.setUTCSeconds(history.value.timestamp.seconds.low);
                jsonRes.Timestamp = d.toLocaleString("en-US", { timeZone: "America/Chicago" }) + " CST";
                // Store Order details
                try {
                    jsonRes.Value = JSON.parse(history.value.value.toString('utf8'));
                } catch (err) {
                    console.log(err);
                    jsonRes.Value = history.value.value.toString('utf8');
                }

                // Add to array of transaction history on order
                orderHistory.push(jsonRes);
            }

            if (history.done) {
                console.log('end of data');
                await iterator.close();
                console.info(orderHistory);
                return orderHistory;
            }
        } //  while (true)
    }   //  Tx_GetOrderHistory

    /**
     * Tx_DeleteOrder
     *
     * @param {Context} ctx the transaction context
     * @param {String}  args
     * Usage:  Tx_DeleteOrder ('Order001')
     */

    async Tx_DeleteOrder(ctx, orderId) {

        console.info('============= Tx_DeleteOrder ===========');
        console.log("input, orderId = " + orderId);
        if (orderId.length < 1) {
            throw new Error('Order Id required as input')
        }

        // Retrieve the current order using key provided
        var orderAsBytes = await ctx.stub.getState(orderId);

        if (!orderAsBytes || orderAsBytes.length === 0) {
            throw new Error(`Error Message from Tx_DeleteOrder:\nOrder with orderId = ${orderId} does not exist.`);
        }

        // Access Control: This transaction should only be invoked by designated originating Retailer or Producer
        var order = Order.deserialize(orderAsBytes);
        let userId = this.getCallingUserid(ctx);
        if ((userId != "admin") // admin only has access as a precaution.
        && (userId != order.retailerId) // This transaction should only be invoked by Producer or Retailer of order
        && (userId != order.producerId))
        throw new Error(`${userId} does not have access to delete order ${orderId}`);

        await ctx.stub.deleteState(orderId); //remove the order from chaincode state
      }

    /**
     * getCallingUserid
     *
     * @param {Context} ctx the transaction context
     */
    getCallingUserid (ctx) {

        let id = [];
        id.push ( ctx.clientIdentity.getID());
        var begin = id[0].indexOf("/CN=");
        var end = id[0].lastIndexOf ("::/C=");
        let userid = id[0].substring(begin+4,end);
        return userid;
    }

    /**
     * getApprole
     *
     * @param {Context} ctx the transaction context
     */
    getApprole(ctx) {
        console.log ("getApprole:  ctx = " +ctx);
        console.log ("approle = " + ctx.clientIdentity.getAttributeValue("approle"));
        return (ctx.clientIdentity.getAttributeValue("approle"));
    }
}  //  Class SupplychainContract

module.exports = SupplychainContract;
