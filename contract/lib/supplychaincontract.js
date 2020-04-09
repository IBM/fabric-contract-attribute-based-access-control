/*
SPDX-License-Identifier: Apache-2.0
*/

'use strict';

// Fabric smart contract classes
const { Contract, Context } = require('fabric-contract-api');

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
     * orderProduct
     * To be used by a retailer when he orders a product
     *
     * @param {Context} ctx the transaction context
     * @param {String} orderId
     * @param {String} productId
     * @param {Float} price
     * @param {Integer} quantity
     * @param {String} producerId
     * @param {String} retailerId

     * Usage: submitTransaction ('orderProduct', 'Order001', 'mango', 100.00, 100, 'farm1', 'walmart')
     * Usage: ["Order100", "mango", "10.00", "102", "farm1", "walmart"]
    */
    async orderProduct(ctx, args) {

        // Access Control: This transaction should only be invoked by a Producer or Retailer
        let userType = await this.getCurrentUserType(ctx);
        

        if ((userType != "admin") && // admin only has access as a precaution.
            (userType != "producer") &&
            (userType != "retailer"))
            throw new Error(`This user does not have access to create an order`);

        const order_details = JSON.parse(args);
        const orderId = order_details.orderId;

        console.log("incoming asset fields: " + JSON.stringify(order_details));
        
        // Check if an order already exists with id=orderId
        var orderAsBytes = await ctx.stub.getState(orderId);
        if (orderAsBytes && orderAsBytes.length > 0) {
            throw new Error(`Error Message from orderProduct. Order with orderId = ${orderId} already exists.`);
        }

        // Create a new Order object
        let order = Order.createInstance(orderId);
        order.productId = order_details.productId;
        order.price = order_details.price.toString();
        order.quantity = order_details.quantity.toString();
        order.producerId = order_details.producerId;
        order.retailerId = order_details.retailerId;
        order.modifiedBy = await this.getCurrentUserId(ctx);
        order.currentOrderState = OrderStates.ORDER_CREATED;
        order.trackingInfo = '';

        // Update ledger
        await ctx.stub.putState(orderId, order.toBuffer());

        // Define and set event
        const event_obj = order;
        event_obj.event_type = "createOrder";   //  add the field "event_type" for the event to be processed
 
        try {
            await ctx.stub.setEvent(EVENT_TYPE, event_obj.toBuffer());
        }
        catch (error) {
            console.log("Error in sending event");
        }
        finally {
            console.log("Attempted to send event = ", order);
        }

        // Must return a serialized order to caller of smart contract
        return order.toBuffer();
    }

    /**
      * receiveOrder
      * To be called by a Producer when an order is received (and he begins to process the order)
      *
      * @param {Context} ctx the transaction context
      * @param {String}  orderId
      * Usage:  receiveOrder ('Order001')
     */
    async receiveOrder(ctx, orderId) {
        console.info('============= receiveOrder ===========');

        if (orderId.length < 1) {
            throw new Error('orderId is required as input')
        }

        // Retrieve the current order using key provided
        var orderAsBytes = await ctx.stub.getState(orderId);
        if (!orderAsBytes || orderAsBytes.length === 0) {
            throw new Error(`Error Message from receiveOrder: Order with orderId = ${orderId} does not exist.`);
        }

        // Convert order so we can modify fields
        var order = Order.deserialize(orderAsBytes);

        // Access Control: This transaction should only be invoked by designated Producer
        let userId = await this.getCurrentUserId(ctx);

        if ((userId != "admin") && // admin only has access as a precaution.
            (userId != order.producerId))
            throw new Error(`${userId} does not have access to receive order ${orderId}`);

        // Change currentOrderState
        order.setStateToOrderReceived();

        // Track who is invoking this transaction
        order.modifiedBy = userId;

        // Update ledger
        await ctx.stub.putState(orderId, order.toBuffer());

        // Must return a serialized order to caller of smart contract
        return order.toBuffer();
    }

    /**
     * assignShipper
     *
     * @param {Context} ctx the transaction context
     * @param {String}  orderId
     * @param {String}  newShipperId
     *
     * Usage:  assignShipper ('Order001', 'UPS')
    */
    async assignShipper(ctx, orderId, newShipperId) {
        console.info('============= assignShipper ===========');

        if (orderId.length < 1) {
            throw new Error('orderId is required as input')
        }

        if (newShipperId.length < 1) {
            throw new Error('shipperId is required as input')
        }

        //  Retrieve the current order using key provided
        var orderAsBytes = await ctx.stub.getState(orderId);
        if (!orderAsBytes || orderAsBytes.length === 0) {
            throw new Error(`Error Message from assignShipper: Order with orderId = ${orderId} does not exist.`);
        }

        // Convert order so we can modify fields
        var order = Order.deserialize(orderAsBytes);

        // Access Control: This transaction should only be invoked by designated Producer
        let userId = await this.getCurrentUserId(ctx);
 
        if ((userId != "admin") && // admin only has access as a precaution.
            (userId != order.producerId))
            throw new Error(`${userId} does not have access to assign a shipper to order ${orderId}`);

        // Change currentOrderState to SHIPMENT_ASSIGNED;
        order.setStateToShipmentAssigned();
        // Set shipperId
        order.shipperId = newShipperId;
        // Track who is invoking this transaction
        order.modifiedBy = userId;

        // Update ledger
        await ctx.stub.putState(orderId, order.toBuffer());

        // Must return a serialized order to caller of smart contract
        return order.toBuffer();
    }

    /**
     * createShipment
     *
     * @param {Context} ctx the transaction context
     * @param {String}  orderId
     * @param {String}  trackingInfo
     * Usage:  createShipment ('Order001', '34590279RKE9D339')
    */
    async createShipment(ctx, orderId, newTrackingInfo) {
        console.info('============= createShipment ===========');

        //  NOTE: There is no shipment asset.  A shipment is created for each order.
        //  Shipment is tracked using order asset.

        if (orderId.length < 1) {
            throw new Error('orderId is required as input')
        }

        if (newTrackingInfo.length < 1) {
            throw new Error('Tracking # is required as input')
        }

        // Retrieve the current order using key provided
        var orderAsBytes = await ctx.stub.getState(orderId);
        if (!orderAsBytes || orderAsBytes.length === 0) {
            throw new Error(`Error Message from createShipment: Order with orderId = ${orderId} does not exist.`);
        }

        // Convert order so we can modify fields
        var order = Order.deserialize(orderAsBytes);

        // Access Control: This transaction should only be invoked by a designated Shipper
        let userId = await this.getCurrentUserId(ctx);
 
        if ((userId != "admin") && // admin only has access as a precaution.
            (userId != order.shipperId))
            throw new Error(`${userId} does not have access to create a shipment for order ${orderId}`);

        // Change currentOrderState to SHIPMENT_CREATED;
        order.setStateToShipmentCreated();
        // Set Tracking info
        order.trackingInfo = newTrackingInfo;
        // Track who is invoking this transaction
        order.modifiedBy = userId;

        // Update ledger
        await ctx.stub.putState(orderId, order.toBuffer());

        // Must return a serialized order to caller of smart contract
        return order.toBuffer();
    }

    /**
     * transportShipment
     *
     * @param {Context} ctx the transaction context
     * @param {String}  orderId
     *
     * Usage:  transportShipment ('Order001')
    */
    async transportShipment(ctx, orderId) {
        console.info('============= transportShipment ===========');

        if (orderId.length < 1) {
            throw new Error('orderId is required as input')
        }

        // Retrieve the current order using key provided
        var orderAsBytes = await ctx.stub.getState(orderId);
        if (!orderAsBytes || orderAsBytes.length === 0) {
            throw new Error(`Error Message from transportShipment: Order with orderId = ${orderId} does not exist.`);
        }

        // Retrieve the current order using key provided
        var order = Order.deserialize(orderAsBytes);

        // Access Control: This transaction should only be invoked by designated designated Shipper
        let userId = await this.getCurrentUserId(ctx);
 
        if ((userId != "admin") // admin only has access as a precaution.
            && (userId != order.shipperId)) // This transaction should only be invoked by
            throw new Error(`${userId} does not have access to transport shipment for order ${orderId}`);

        // Change currentOrderState to SHIPMENT_IN_TRANSIT;
        order.setStateToShipmentInTransit();
        // Track who is invoking this transaction
        order.modifiedBy = userId;

        // Update ledger
        await ctx.stub.putState(orderId, order.toBuffer());

        // Must return a serialized order to caller of smart contract
        return order.toBuffer();
    }

    /**
     * receiveShipment:
     * To be called by Retailer when a shipment (corresponding to orderId) is received.
     *
     * @param {Context} ctx the transaction context
     * @param {String}  orderId
     * Usage:  receiveShipment ('Order001')
    */
    async receiveShipment(ctx, orderId) {
        console.info('============= receiveShipment ===========');

        if (orderId.length < 1) {
            throw new Error('orderId is required as input')
        }

        // Retrieve the current order using key provided
        var orderAsBytes = await ctx.stub.getState(orderId);
        if (!orderAsBytes || orderAsBytes.length === 0) {
            throw new Error(`Error Message from receiveShipment: Order with orderId = ${orderId} does not exist.`);
        }

        // Retrieve the current order using key provided
        var order = Order.deserialize(orderAsBytes);

        // Access Control: This transaction should only be invoked by designated originating Retailer
        let userId = await this.getCurrentUserId(ctx);
 
        if ((userId != "admin") // admin only has access as a precaution.
            && (userId != order.retailerId)) // This transaction should only be invoked by
            throw new Error(`${userId} does not have access to receive shipment for order ${orderId}`);

        // Change currentOrderState to SHIPMENT_RECEIVED;
        order.setStateToShipmentReceived();
        // Track who is invoking this transaction
        order.modifiedBy = userId;

        // Update ledger
        await ctx.stub.putState(orderId, order.toBuffer());

        // Must return a serialized order to caller of smart contract
        return order.toBuffer();
    }

    /**
     * queryOrder
     *
     * @param {Context} ctx the transaction context
     * @param {String}  orderId
     * Usage:  queryOrder ('Order001')
     *
    */
    async queryOrder(ctx, orderId) {
        console.info('============= queryOrder ===========');

        if (orderId.length < 1) {
            throw new Error('orderId is required as input')
        }

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
            throw new Error(`Error Message from queryOrder: Order with orderId = ${orderId} does not exist.`);
        }

        // Access Control:

        var order = Order.deserialize(orderAsBytes);
        let userId = await this.getCurrentUserId(ctx);
 
        if ((userId != "admin") // admin only has access as a precaution.
            && (userId != order.producerId) // This transaction should only be invoked by
            && (userId != order.retailerId) //     Producer, Retailer, Shipper associated with order
            && (userId != order.shipperId))
            throw new Error(`${userId} does not have access to the details of order ${orderId}`);

        // Return a serialized order to caller of smart contract
        return orderAsBytes;
        //return order;
    }

    /**
     * queryAllOrders
     *   New version of queryorders where ACLs are applied
     * 
     * "customer": customer does not have access this api
     * "regulator": return all orders
     * "producer", "shipper","retailer": return the list of orders in which the caller is part of
     * @param {Context} ctx the transaction context
     * @param {String}  args
     * Usage:  queryAllOrders ()
    */
    async queryAllOrders(ctx) {
        console.info('============= getOrderHistory ===========');

        let userId = await this.getCurrentUserId(ctx);
        let userType = await this.getCurrentUserType(ctx);

        //  For adding filters in query, usage: {"selector":{"producerId":"farm1"}}
        let queryString;

        // Access control done using query strings
        switch (userType) {

            case "admin":
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

        console.log("In queryAllOrders: queryString = ");
        console.log(queryString);
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
    }

    /**
     * getOrderHistory
     *
     * @param {Context} ctx the transaction context
     * @param {String}  args
     * Usage:  getOrderHistory ('Order001')
     */

    async getOrderHistory(ctx, orderId) {
        console.info('============= getOrderHistory ===========');
        if (orderId.length < 1) {
            throw new Error('orderId is required as input')
        }
        console.log("input, orderId = " + orderId);

        // Retrieve the current order using key provided
        var orderAsBytes = await ctx.stub.getState(orderId);

        if (!orderAsBytes || orderAsBytes.length === 0) {
            throw new Error(`Error Message from getOrderHistory: Order with orderId = ${orderId} does not exist.`);
        }

        // Access Control: Only those associated with this order
        // Retrieve the current order using key provided
        var order = Order.deserialize(orderAsBytes);
        let userId = await this.getCurrentUserId(ctx);
        let userType = await this.getCurrentUserType(ctx);

        // Access Control:
        if ((userId != "admin")             // admin only has access as a precaution.
            && (userType != "customer")      // Customers can see any order if it's in the correct state
            && (userType != "regulator")     // Regulators can see any order
            && (userId != order.producerId) // Only producer, retailer, shipper associated
            && (userId != order.retailerId) //      with this order can see its details
            && (userId != order.shipperId))
            throw new Error(`${userId} does not have access to order ${orderId}`);

        // Customer can only view order history if order has completed cycle
        if ((userType == "customer") && (order.currentOrderState != OrderStates.SHIPMENT_RECEIVED))
            throw new Error(`Information about order ${orderId} is not available to ${userId} yet. Order status needs to be SHIPMENT_RECEIVED.`);

        console.info('start GetHistoryForOrder: %s', orderId);

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
    }

    /**
     * deleteOrder
     *
     * @param {Context} ctx the transaction context
     * @param {String}  args
     * Usage:  deleteOrder ('Order001')
     */

    async deleteOrder(ctx, orderId) {

        console.info('============= deleteOrder ===========');
        if (orderId.length < 1) {
            throw new Error('Order Id required as input')
        }
        console.log("orderId = " + orderId);

        // Retrieve the current order using key provided
        var orderAsBytes = await ctx.stub.getState(orderId);

        if (!orderAsBytes || orderAsBytes.length === 0) {
            throw new Error(`Error Message from deleteOrder: Order with orderId = ${orderId} does not exist.`);
        }

        // Access Control: This transaction should only be invoked by designated originating Retailer or Producer
        var order = Order.deserialize(orderAsBytes);
        let userId = await this.getCurrentUserId(ctx);

        if ((userId != "admin") // admin only has access as a precaution.
            && (userId != order.retailerId) // This transaction should only be invoked by Producer or Retailer of order
            && (userId != order.producerId))
            throw new Error(`${userId} does not have access to delete order ${orderId}`);

        await ctx.stub.deleteState(orderId); //remove the order from chaincode state
    }

    /**
      * getCurrentUserId
      * To be called by application to get the type for a user who is logged in
      *
      * @param {Context} ctx the transaction context
      * Usage:  getCurrentUserId ()
     */
    async getCurrentUserId(ctx) {

        let id = [];
        id.push(ctx.clientIdentity.getID());
        var begin = id[0].indexOf("/CN=");
        var end = id[0].lastIndexOf("::/C=");
        let userid = id[0].substring(begin + 4, end);
        return userid;
    }

    /**
      * getCurrentUserType
      * To be called by application to get the type for a user who is logged in
      *
      * @param {Context} ctx the transaction context
      * Usage:  getCurrentUserType ()
     */
    async getCurrentUserType(ctx) {

        let userid = await this.getCurrentUserId(ctx);

        //  check user id;  if admin, return type = admin;
        //  else return value set for attribute "type" in certificate;
        if (userid == "admin") {
            return userid;
        }
        return ctx.clientIdentity.getAttributeValue("usertype");
    }
}  //  Class SupplychainContract

module.exports = SupplychainContract;
