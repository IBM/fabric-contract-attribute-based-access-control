# Blockchain Full Stack Supply Chain Application Sample

## Overview
This sample demonstrates an end to end blockchain application that is running on Blockchain 2.0 (HLF 1.4).  It offers code pattern examples of:

- User Management Authorization (this does not currently integrate with an Identity Provider)
- Attribute Based Access Control
- Query Strings
- Blockchain and External Event management
- How to bring together Fabric, Fabric Client and a front end UI (Angular)

Note: This sample pattern can either connect to a local instance of Hyperledger Fabric, or to the IBM Blockchain Platform v2.

Audience level : Intermediate Developers

## Architecture Diagram
![Architecture Diagram](images/GenericArchDiagram.png)

## Application Logic Flow

![Application Logic Flow Diagram](images/GenericAppLogicFlow.png)

This project showcases the use of blockchain in the supply chain domain. In this application, we have five participants: a **Producer**, **Shipper**, **Retailer**, **Regulator**, and **Customer**. The scenario is such that:

1) **Retailer** orders a product from a particular **Producer**.  
2) **Producer** accepts the **Order**
3) **Producer** fulfills **Order** by assigning it to a **Shipper**.
4) **Shipper** creates the shipment by adding a tracking number to the **Order**
5) **Shipper** transports the shipment back to the **Retailer**.
6) **Retailer** then accepts the shipment. The Product is now available for a **Customer** to purchase.
7) At this point the **Customer** can trace the **Order** history through the supply chain. This is essentially equivalant to scanning a UPC of a product and tracing it back to a farm.
8) At any point, the **Regulator** has access to all orders in the system to ensure the process is being followed for each product.

## Application Process Flow

![Application Flow Diagram](images/GenericAppFlow.png)

1) The user interacts with an Angular Web UI to update and query the blockchain ledger and state
2) The UI calls Node.js application APIs running on a backend server
3) The Node.js application server calls Fabric SDK APIs https://fabric-sdk-node.github.io/release-1.4/index.html
4) The Fabric SDK interacts with and submits transactions to a deployed IBM Blockchain Platform 2.0 or a Hyperledger Fabric 1.4.1 network

The value of running this network on the IBM Blockchain Platform is that one can easily customize the network infrastructure as needed, whether that is the location of the nodes, the CPU and RAM of the hardware, the endorsement policy needed to reach consensus, or adding new organizations and members to the network.

## Business Network Definition

![Business Network Diagram](images/GenericBNDFlow.png)

### Assets

**Order** contains fields:

   - String *orderId*
   - String *productId*
   - Float *price*
   - Integer *quantity*
   - String *producerId*
   - String *shipperId*
   - String *retailerId*
   - String *modifiedBy*   
   - String *trackingInfo*
   - Enumerated *currentOrderState*
     - ORDER_CREATED: 1
     - ORDER_RECEIVED: 2
     - SHIPMENT_ASSIGNED: 3
     - SHIPMENT_CREATED: 4
     - SHIPMENT_IN_TRANSIT: 5
     - SHIPMENT_RECEIVED: 6
     - ORDER_CLOSED: 7

### Participants

**Retailer** -

  - Places an **Order** to a **Producer** 
  - Receives **Order** from a **Shipper**.

**Producer** -

   - Fulfills an **Order**
   - Assigns to a **Shipper**.

**Shipper** -

  - Creates shipment and transports **Order** assigned by **Producer**.

**Customer** -

  - Queries an **Order** to get the Order Transaction History, essentially tracing it back to origination.

**Regulator** -

  - Moderates all **Orders** in the system to ensure that proper quality and guidelines are being followed.

### Transactions

**1. OrderProduct** - Creates an **Order** asset. *currentOrderState* is changed to ORDER_CREATED.

#### Inputs:

  - *orderId*
  - *productId*
  - *price*
  - *quantity*
  - *producerId*
  - *retailerId*

 #### Access Control:

  - Only a **Retailer** or a **Producer** can invoke this transaction

**2. ReceiveOrder** - Modifies an **Order** asset. *currentOrderState* is changed to ORDER_RECEIVED.

#### Input:

  - valid *orderId*

#### Access Control:

 - Only a **Retailer** can invoke this transaction

**3. AssignShipper** - Modifies an **Order** asset. *currentOrderState* is changed to SHIPMENT_ASSIGNED.

#### Inputs:

  - valid *orderId*
  - valid *shipperId*

#### Access Control:

 - Only a **Retailer** can invoke this transaction

**4. CreateShipment** - Modifies an **Order** asset. *currentOrderState* is changed to SHIPMENT_CREATED.

#### Inputs:

  - valid *orderId*
  - trackingInfo

#### Access Control:

 - Only a **Shipper** can invoke this transaction

**5. TransportShipment** - Modifies an **Order** asset. *currentOrderState* is changed to SHIPMENT_IN_TRANSIT.

#### Input:

  - valid *orderId*

#### Access Control:

 - Only a **Shipper** can invoke this transaction

**6. ReceiveShipment** - Modifies an **Order** asset. *currentOrderState* is changed to SHIPMENT_RECEIVED.

#### Input:

  - valid *orderId*

#### Access Control:

 - Only a **Retailer** can invoke this transaction

**7. DeleteOrder** - Deletes an **Order** asset.

#### Input:

  - valid *orderId*

#### Access Control:

 - Only the originator of the **Order** can invoke this transaction

**8. QueryOrder** - Query an **Order** asset.

#### Input:

  - valid *orderId*

#### Ouput:

  - returns a buffer containing the **Order** details

#### Access Control:

 - Only a **Producer**, **Shipper** or **Retailer** associated with the input *orderId* can invoke this transaction

**9. QueryAllOrders** - Query all **Order** assets.

#### Output:

 - returns an array of **order** assets accessible by current active identity with details in JSON format.

#### Access Control:

 - Only **Orders** associated with the current user will be returned

**10. GetOrderHistory** - Query transaction history of an **Order** asset.

#### Input:

  - valid *orderId*

#### Output:

- returns an array of JSON objects with the transaction history of an **Order**

#### Access Control:

 - If the current user is a **Customer**, the *currentOrderState* must equal ORDER_RECEIVED to invoke this transaction
 - Only a **Producer**, **Shipper** or **Retailer** associated with the input *orderId* can invoke this transaction

**11. getCurrentUserId** - Get the id of the current logged in user.

#### Output:

- a String containing the current user's id
**11. getCurrentUserType** - Get the type of the current logged in user.

#### Output:

- a String containing the current user's type

## Filesystem Organization

- application/:

  + server/server.js - Contains the Node JS code to interact with the backend
  + client/* - Front end Angular UI code

- contract/*:

  + The smart contract files.  VSCode needs to be opened up to this directory to package the smart contract. See https://marketplace.visualstudio.com/items?itemName=IBMBlockchain.ibm-blockchain-platform for more information on running VSCode IDE.

- gateway/:

   + ibp/config.json - Contains information used to run against a running IBM Blockchain 2.0 Service
   + local/config.json - Contains information used to run  against a Hyperledger Fabric 1.4 running locally.

- kube-config/*:

   + files needed to deploy this sample onto an iks cluster

## Running the application from Kube Cluster
We have this application running at \<TBD\> on our IBP Blockchain Service if you just want to play around with it to see what features it has. Several identities have been defined.  Log in as "admin", password "adminpw" to see the registered and enrolled identities.

## Setup for building and running the application from this git code repo
If you want to build the application and run it on your own Blockchain service:
```
git clone git@github.ibm.com:customer-success/Blockchain-GenSupplyChain.git
```

This utilizes the VSCode IDE Blockchain extension to interact with a fabric network:
https://github.com/IBM-Blockchain/blockchain-vscode-extension

#### IBP Platform
- Create a Kubernetes Cluster using the IBM Kubernetes Service
https://cloud.ibm.com/docs/containers?topic=containers-getting-started
- Create an IBM Blockchain service including all relevant components, such as Certificate Authority, MSP (Membership Service Providers), peers, orderers, and channels.
https://cloud.ibm.com/docs/services/blockchain?topic=blockchain-ibp-v2-deploy-iks
- Export the Connection Profile from the IBP instance and save as <git tree>/Blockchain_GenSupplyChain/src/gateway/ibp/fabric_connection.json. For instructions on how to do that on the IBM Blockchain Platform, go [here](https://cloud.ibm.com/docs/services/blockchain/howto?topic=blockchain-ibp-console-app#ibp-console-app-profile). NOTE: to export the IBP connection profile, the smart contract located [here](https://github.ibm.com/customer-success/Blockchain-GenSupplyChain/blob/master/gensupplychainnet%400.0.1.cds) must be installed.

#### Local Fabric
- In the VSCode IDE Blockchain extention  **FABRIC ENVIRONMENTS** pane, click on `Local Fabric` to start a fabric network.
- Connect to the "Local Fabric - Org1" gateway as `admin`.  Right click on the 3 dot menu on the **FABRIC GATEWAYS** pane and `Export Connection Profile` Save this file to <git_tree>/Blockchain-GenSupplychain/src/gateway/local/fabric_connection.json. 

### Start the server side of the application. 
NOTE: This will automatically enroll admin credentials in the directory of the wallet path specified in <git_tree>/Blockchain-GenSupplychain/src/gateway/<local or ibp>/config.json

In a terminal window -
```
cd <git_tree>/BlockchainEnablement/GenSupplychain/src/server
export PORT=<PORT #>          // Defaults to 3000
export PLATFORM= <IBP|LOCAL>  // Defaults to LOCAL
node server.js
```
#### Connect up wallet
- Create a Wallet in VSCode: select the "+" in the **FABRIC WALLETS** section. Choose "Specify an existing filesystem wallet".  Choose the directory of the wallet path specified in <git_tree>/Blockchain-GenSupplyChain/src/gateway/<local or ibp>/config.json.
- Create a gateway for this application: select the "+" in the **FABRIC GATEWAYS** pane. Choose the recently downloaded connection profile when prompted.
- Connect to your new Gateway, will be prompted to connect a wallet, choose the wallet path specified in <git_tree>/Blockchain-GenSupplychain/src/gateway/<local or ibp>/config.json
- Ensure that the contract (.cds file) located in https://github.ibm.com/customer-success/Blockchain-GenSupplyChain has been installed and instantiated via the VSCode Blockchain IDE extension and
is running on a local fabric or the IBP V2 service. See https://marketplace.visualstudio.com/items?itemName=IBMBlockchain.ibm-blockchain-platform for information in installing the VSCode Blockchain IDE extension and tutorials on how to install a smart contract.

### Start the client side applications:

In a separate terminal window -

#### 1) build and install all dependencies:
```
cd <git_tree>/Blockchain-GenSupplychain/src/client/generic-ang
npm install
ng -o serve
```
#### 2) Start the application, http://localhost:4200

### Test Scenario - automatic, using curl against API server
```
cd <git_tree>/Blockchain-GenSupplychain/scripts
./create_identities.sh
./testcase.sh
```
### Test Scenario - Manual, using UI

#### 1) Log in as Admin 

id: admin

password: adminpw

#### 2) Create users

Select the "Create New User" tab and enter the following users:

```
id: GHFarm
password: adminpw
role: producer

id: Walmart
password: adminpw
role: retailer

id: UPS
password: adminpw
role: shipper

id: ACustomer
password: adminpw
role: customer

id: FDA
password: adminpw
role: regulator
```
#### 3) Register each new User
Select the Register tab from the Login screen, enter the ID, password and role of each user.

#### 4) Login as "Walmart", this will enroll the "Walmart" participant and should take you to the Retailer Portal

Create a couple orders:
```
Product ID: corn
Price:        10
Quantity:     10
Producer ID:  GHFarm
```
Click "Create Order"
```  
Product ID: avocado
Price:      5
Quantity:   15
Producer ID:  GHFarm
```
Click "Create Order"

#### 5) Open a separate tab, log in as "GHFarm", this should take you to the Producer Portal

- click on the order
- select the "Accept Order" button for the corn product
- select the "Assign Shipper" button for the corn product
- enter a "UPS"

#### 6) In a separate tab, log in as "UPS", this should take you to the Shipper Portal

- click on the order
- select the "Create Shipment" button for the corn product and enter a tracking number
- select the "Transport Shipment" button for the corn product

#### 7) Back on Retailer Portal

- click on the order
- select the "Receive Shipment" button for the corn product

#### 8) On Producer Portal submit a couple of Price/Quantity Change notifications.
**Note** if Quantity is left blank, this is considered a **Price Change Notification**, otherwise it is considered a **Quantity Change Notification**
```
Product ID:   mango
Price:        4
```
Click "Price/Quantity Change"

- This will generate a **Price Change Notification** and an order will automatically be created since we created a rule that says if mangos drop to $5 or below, order 10 crates.
```
Product ID:   tomato
Price:        2
Quantity:     25
```
Click "Price/Quantity Change"

- This will generate a **Quantity Change Notification** and an order will automatically be created since we created a rule that says if tomatos drop to $5 or below, and there are at least 20 crates available, order 20 crates.

The new orders should appear for designated participants

A Blockchain Event will be generated when an order is created this way.  

External message notifications are sent when order states are changed and Price/Quantity Change notifications are sent.

#### 9) In a separate tab, log in as "FDA", this should take you to the Regulator Portal

- This will bring up a list of all orders
- Clicking on an order will display all of the transaction history of that order

#### 10) In a separate tab, log in as "ACustomer", this should take you to the Customer Portal

- Enter order id for corn (representing a barcode of a particular product with is associated with that order)
- Order transaction history should be displayed

## Helpful links
https://cloud.ibm.com/docs/containers?topic=containers-getting-started

https://fabric-sdk-node.github.io/release-1.4/index.html

https://fabric-sdk-node.github.io/release-1.4/module-fabric-network.html

https://marketplace.visualstudio.com/items?itemName=IBMBlockchain.ibm-blockchain-platform

https://cloud.ibm.com/docs/services/blockchain/howto?topic=blockchain-ibp-console-build-network#ibp-console-build-network

## Contributers

Sowmya Janakiraman

Ann Umberhocker

Kaleen Iwema
