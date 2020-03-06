

# REST API Server for Generic Supplychain Blockchain asset


## Configuration

- Make sure you have a Hyperledger Fabric network up (either local or IBM Blockchain Platform service) and the https://github.ibm.com/customer-success/Blockchain-GenSupplyChain/blob/master/gensupplychainnet%400.0.1.cds chaincode loaded. 

- Download your 'common connection profile' JSON file and copy it into the *server/gateway/local/connection-profile.json. For instructions on how to do that on the IBM Blockchain Platform, see [here](https://cloud.ibm.com/docs/services/blockchain/howto?topic=blockchain-ibp-console-app#ibp-console-app-profile).

- In *server/gateway/\<platform\>/config.json* where *platform* is either *ibp* or *local*, you will need to update the `wallet` field to your desired wallet location. 

- Ensure that the *FABRIC_ENROLL_ID* and *FABRIC_ENROLL_SECRET* environment variables are set with a user that has been registered to the org in the *connection-profile.json*, *client.organization* field. **Hint:** For instructions on how to register an application user/identity on the IBM Blockchain Platform, see [here](https://cloud.ibm.com/docs/services/blockchain/howto?topic=blockchain-ibp-console-app#ibp-console-app-identities).

## Running the server
for development:
```
$ export PORT=<port #>  \\ defaults to 3000
$ npm install
$ npm run dev
```
for production:
```
$ export PORT=<port #>  \\ defaults to 3000
$ npm install
$ npm start
```

Navigate to `http://localhost:$PORT`

## Supported APIs

The following are the supporteed APIs for this application:

#### User Management:
Register a user with the Certificate Authority:
```
curl -X POST "http://localhost:${PORT}/api/register-user" -H "accept: application/json" -H "Content-Type: application/json" -d "{\"userid\":\"<userid>\",\"password\":\"<password>\",\"usertype\":\"<usertype>\"}"
```
Enroll a user into wallet:
```
curl -X POST "http://localhost:${PORT}/api/enroll-user" -H "accept: application/json" -H "Content-Type: application/json" -d "{\"userid\":\"<userid>\",\"password\":\"<password>\",\"usertype\":\"<usertype>\"}"
```
Log in as a specific user (must be registered and enrolled):
```
curl -X GET "http://localhost:${PORT}/api/login?userid=Walmart&password=HEB"
```
Get current user:
```
curl -X GET "http://localhost:${PORT}/api/current-user/" 
```
Get all registered users:
```
curl -X GET "http://localhost:${PORT}/api/users/" 
```
Determine if a user is enrolled
```
curl -X GET "http://localhost:${PORT}/api/is-user-enrolled/<userid>"
```
#### Order Management:
Create an order, status is set to ORDER_CREATED:
```
curl -X POST "http://localhost:${PORT}/api/orders/" -H "accept: application/json" -H "Content-Type: application/json" -d "{\"orderId\":\"Order-001\",\"productId\":\"tomato\",\"price\":3,\"quantity\":10,\"producerId\":\"farm_001\",\"retailerId\":\"Walmart\"}"
```
Get details of a specific order:
```
curl -X GET "http://localhost:${PORT}/api/orders/Order-001"
```
Get all orders associated with current user:
```
curl -X GET "http://localhost:${PORT}/api/orders"
```
Get all orders associated with specific user:
```
curl -X GET "http://localhost:${PORT}/api/orders?userid=HEB&password=HEB"
```
Get order transaction history:
```
curl -X GET "http://localhost:${PORT}/api/orders-history/Order-001"
```
Change order status to ORDER_RECEIVED:
```
curl -X PUT "http://localhost:${PORT}/api/receive-order/Order-001"
```
Assign to a Shipper, status is changed to SHIPMENT_ASSIGNED:
```
curl -X PUT "http://localhost:${PORT}/api/assign-shipper/Order-001?shipperid=Fedex" 
```
Create a shipment for order (assign a tracking #), status is changed to SHIPMENT_CREATED:
```
curl -X PUT "http://localhost:${PORT}/api/create-shipment-for-order/Order-001" 
```
Change order status to SHIPMENT_IN_TRANSIT:
```
curl -X PUT "http://localhost:${PORT}/api/transport-shipment/Order-001" 
```
Change order status to SHIPMENT_RECEIVED:
```
curl -X PUT "http://localhost:${PORT}/api/receive-shipment/Order-001" 
```
Delete order:
```
curl -X DELETE "http://localhost:${PORT}/api/orders/Order-001" 
```

## Testcase scenario

A test case scenario that runs through the process is available at 
https://github.ibm.com/customer-success/Blockchain-GenSupplyChain/blob/master/scripts/testcase.sh

