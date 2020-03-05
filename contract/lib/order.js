/*
SPDX-License-Identifier: Apache-2.0
*/

'use strict';

// Utility class for ledger state
const State = require('../ledger-api/state.js');

// Enumerate order state values
const orderState = {
    ORDER_CREATED: 1,       // Retailer
    ORDER_RECEIVED: 2,      // Producer
    SHIPMENT_ASSIGNED: 3,   // Producer
    SHIPMENT_CREATED: 4,    // Shipper
    SHIPMENT_IN_TRANSIT: 5, // Shipper
    SHIPMENT_RECEIVED: 6,   // Retailer
    ORDER_CLOSED: 7     // Not currently used
};

/**
 * Order class extends State class
 * Class will be used by application and smart contract to define a Order
 */
class Order extends State {

    constructor(obj) {
        super(Order.getClass(), [obj.orderId]);
        Object.assign(this, obj);
    }

    /*
    Definition:  Class Order:
      {String}  orderId
      {String} productId
      {float}   price
      {Integer} quantity
      {String} producerId
      {String} shipperId
      {String} retailerId
      {Enumerated orderStates} currentOrderState
      {String} modifiedBy
    */

    /**
     * Basic getters and setters
    */
    getId() {
        return this.orderId;
    }
/*  //  should never be called explicitly;
    //  id is set at the time of constructor call.
    setId(newId) {
        this.id = newId;
    }
*/
    /**
     * Useful methods to encapsulate  Order states
     */
    setStateToOrderCreated() {
        this.currentOrderState = orderState.ORDER_CREATED;

    }

    setStateToOrderReceived() {
        this.currentOrderState = orderState.ORDER_RECEIVED;
    }

    setStateToShipmentAssigned() {
        this.currentOrderState = orderState.SHIPMENT_ASSIGNED;
    }

    setStateToShipmentCreated() {
        this.currentOrderState = orderState.SHIPMENT_CREATED;
    }

    setStateToShipmentInTransit() {
        this.currentOrderState = orderState.SHIPMENT_IN_TRANSIT;
    }

    setStateToShipmentReceived() {
        this.currentOrderState = orderState.SHIPMENT_RECEIVED;
    }

    setStateToOrderClosed() {
        this.currentOrderState = orderState.ORDER_CLOSED;
    }

    static fromBuffer(buffer) {
        return Order.deserialize(Buffer.from(JSON.parse(buffer)));
    }

    toBuffer() {
        return Buffer.from(JSON.stringify(this));
    }

    /**
     * Deserialize a state data to  Order
     * @param {Buffer} data to form back into the object
     */
    static deserialize(data) {
        return State.deserializeClass(data, Order);
    }

    /**
     * Factory method to create a order object
     */
    static createInstance(orderId) {
        return new Order({orderId});
    }

    static getClass() {
        return 'org.supplychainnet.order';
    }
}

module.exports = Order;
module.exports.orderStates = orderState;
