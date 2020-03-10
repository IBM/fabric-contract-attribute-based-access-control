# Implement attribute based access control to provide end to end visibility into the supply chain history of a particular product 

This sample demonstrates an end to end blockchain application that connects to Hyperledger Fabric 1.4 or the IBM Blockchain Platform. It implements attribute based access control, user management,
event management, and a Angular front-end UI to interact and query the blockchain ledger. The 
sample takes the user through ordering, shipping, and enlisting the product for the customer to 
purchase. The customer can trace the order history through the supply chain, providing 
end to end visibility. Lastly, a regulator has access to all orders in the system to ensure 
correct practices are followed. 

When the reader has completed this code pattern, they will understand:

- Attribute Based Access Control
- User Management using [Hyperledger Fabric node.js SDK CA Client (FabricCAServices)](hyperledger.github.io/fabric-sdk-node/)
- How to customize queries
- External Event management using [PubNub](https://www.pubnub.com/)
- How to bring together a Hyperledger Fabric network, Fabric Client for user management and a front end UI (Angular)

**Audience level : Intermediate Developers**

### Permissioned blockchains - enabling transparancy and confidentiality

In supply chain, confidentiality is mandatory since some consumers might be given 
discounted rates compared to others. In this scenario, other consumers should not be able to access 
their competitors' rates. Given that Hyperledger Fabric is optimized for a broad range of 
industry use-cases, including supply chain, the open-source framework provides a way to implement 
confidentiality at the chaincode layer using attribute based access control. This example shows you 
how to implement such functionality, by registering each user with a specific attribute, called "usertype".
To jump to the code that does this, go [here](https://github.ibm.com/customer-success/Blockchain-GenSupplyChain/blob/master/application/server/utils.js#L221);
The usertype can be either an admin, a regulator, a producer, a shipper, a retailer, or a 
customer, and is generated when a specific user registers in the application. When that user logs in
successfully, and connects to an instance of the Hyperledger Fabric network, their "usertype" gives them access to certain transactions that have been submitted on the network. For example,
the regulator (such as the FDA) is able to view all transactions on the network in order to reliably audit
the network, but the retailer is only able to view the transactions which they are a part of. Once you
understand how to apply these access control rules, you can apply them to any use-case, and 
start building innovative, secure, blockchain networks. 

When the reader has completed this code pattern, they will understand how to:

1. Implement attribute based access control in Hyperledger Fabric
2. Build a chaincode in which certain users have access to certain transactions
3. Emit events triggered by blockchain transactions
4. Use a Angular UI to interact with a Hyperleder Fabric network

## Architecture Diagram
![Architecture Diagram](images/GenericArchDiagram.png)

## Flow Diagram

![Application Flow Diagram](images/GenericAppFlow.png)

## Flow Description
1) The user interacts with an Angular Web UI to update and query the blockchain ledger and state
2) The UI calls Node.js application APIs running on a backend server
3) The Node.js application server calls Fabric SDK APIs https://fabric-sdk-node.github.io/release-1.4/index.html
4) The Fabric SDK interacts with and submits transactions to a deployed IBM Blockchain Platform 2.0 or a Hyperledger Fabric 1.4.1 network

The value of running this network on the IBM Blockchain Platform is that one can easily customize the network infrastructure as needed, whether that is the location of the nodes, the CPU and RAM of the hardware, the endorsement policy needed to reach consensus, or adding new organizations and members to the network.

# Included components
* [IBM Blockchain Platform Extension for VS Code](https://marketplace.visualstudio.com/items?itemName=IBMBlockchain.ibm-blockchain-platform) is designed to assist users in developing, testing, and deploying smart contracts -- including connecting to Hyperledger Fabric environments.
*	[IBM Blockchain Platform](https://console.bluemix.net/docs/services/blockchain/howto/ibp-v2-deploy-iks.html#ibp-v2-deploy-iks) gives you total control of your blockchain network with a user interface that can simplify and accelerate your journey to deploy and manage blockchain components on the IBM Cloud Kubernetes Service.
*	[IBM Cloud Kubernetes Service](https://www.ibm.com/cloud/container-service) creates a cluster of compute hosts and deploys highly available containers. A Kubernetes cluster lets you securely manage the resources that you need to quickly deploy, update, and scale applications.

## Featured technologies
+ [Hyperledger Fabric v1.4](https://hyperledger-fabric.readthedocs.io) is a platform for distributed ledger solutions, underpinned by a modular architecture that delivers high degrees of confidentiality, resiliency, flexibility, and scalability.
+ [Node.js](https://nodejs.org) is an open source, cross-platform JavaScript run-time environment that executes server-side JavaScript code.
+ [Angular](https://angular.io/) Angular is a platform for building mobile and desktop web applications.

## Prerequisites (Local)
If you want to run this pattern locally, without any Cloud services, then all you need is VSCode and the
IBM Blockchain Platform extension. 
- [Install VSCode version 1.38.0 or greater](https://code.visualstudio.com/download)
- [Install IBM Blockchain Platform Extension for VSCode](https://github.com/IBM-Blockchain/blockchain-vscode-extension)
- [Node v8.x or greater and npm v5.x or greater](https://nodejs.org/en/download/)

# Local installation steps: Hyperledger Fabric 1.4 Deployment using VSCode
1. [Clone the Repo](#step-1-clone-the-repo)
2. [Start the Fabric Runtime](#step-2-start-the-fabric-runtime)
3. [Install Contract](#step-3-install-contract)
4. [Instantiate Contract](#step-4-Instantiate-contract)
5. [Export Connection Details](#step-5-export-connection-details)
6. [Export Local Wallet](#step-6-export-connection-details)
7. [Run the App](#step-7-run-the-app)

## Step 1. Clone the Repo

Git clone this repo onto your computer in the destination of your choice:
```
git clone git@github.ibm.com:customer-success/Blockchain-GenSupplyChain.git
```
## Step 2. Start the Fabric Runtime
- First, we need to go to our IBM Blockchain Extension. Click on the IBM Blockchain icon
  in the left side of VSCode (It looks like a square). 
- Next, start your local fabric by clicking on 
  *Local Fabric* in the **FABRIC ENVIRONMENTS** pane.
  
- Once the runtime is finished starting (this might take a couple of minutes), under *Local Fabric* you should see *Smart Contracts* and a section for both *installed* and *instantiated*.

## Step 3. Install Contract

 Now, let's click on *+ Install* and choose the peer that is available. Then the extension will ask you which package to 
 install. Choose *gensupplychainnet@0.0.1.cds* which is in your root directory which you just cloned.
 
If all goes well, you should get a notification as shown 
 below.

![packageFile](/docs/successInstall.png)


## Step 4. Instantiate Contract
You guessed it. Next, it's time to instantiate. 
 
  Click on *+ Instantiate* 

and then choose *gensupplychainnet@0.0.1*. If prompted, choose
 *mychannel* for the channel to instantiate the contract on. 
Next, the extension will ask you 
 to choose a smart contract and version to instantiate. Click on *gensupplychainnet@0.0.1*.

Next, for the optional function, type in *init*.

Leave the arguments blank, and hit *enter* 
 on your keyboard. 
 
 Select *no* for private data collection configuration file, and *Default* for endorsement policy.  

 This will instantiate the smart contract. You should see the contract 
 under the *instantiated* tab on the left-hand side, as shown in the picture. Note: excuse 
 the version number on the picture.

<p align="center">
  <img src="instantiated.png">
</p>

## Step 5. Export Connection Details
## Step 6. Export Local Wallet
## Step 7. Run the app

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
**12. getCurrentUserType** - Get the type of the current logged in user.

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

### Start Fabric Network

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
NOTE: This will automatically enroll admin credentials in the directory of the wallet path specified in <git_tree>/Blockchain-GenericSupplychain/src/gateway/\<local or ibp\>/config.json

In a terminal window -
```
cd <git_tree>/Blockchain-GenSupplychain/src/server

export PORT=<PORT #>          // Defaults to 3000
export PLATFORM= <IBP|LOCAL>  // Defaults to LOCAL
node server.js
```
### Connect up wallet
- Create a Wallet in VSCode: select the "+" in the **FABRIC WALLETS** section. Choose "Specify an existing filesystem wallet".  Choose the directory of the wallet path specified in <git_tree>/Blockchain-GenericSupplychain/src/gateway/\<local or ibp\>/config.json.
- Create a gateway for this application: select the "+" in the **FABRIC GATEWAYS** pane. Choose the recently downloaded connection profile when prompted.
- Connect to your new Gateway, will be prompted to connect a wallet, choose the wallet path specified in <git_tree>/Blockchain-GenericSupplychain/src/gateway/\<local or ibp\>/config.json
- Ensure that the contract (.cds file) located in https://github.ibm.com/customer-success/Blockchain-GenSupplyChain has been installed and instantiated via the VSCode Blockchain IDE extension and
is running on a local fabric or the IBP V2 service. See https://marketplace.visualstudio.com/items?itemName=IBMBlockchain.ibm-blockchain-platform for information in installing the VSCode Blockchain IDE extension and tutorials on how to install a smart contract.

### Test Scenario - automatic, using curl against API server
```
cd <git_tree>/Blockchain-GenSupplychain/scripts
./create_identities.sh
./testcase.sh
```
### Start the client side applications:

In a separate terminal window -

#### 1) build and install all dependencies:
```
cd <git_tree>/Blockchain-GenSupplychain/src/client/generic-ang
npm install
```
#### 2) Start the application
```
ng -o serve --port 4200
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

#### 4) Start a portal for each user
For each other user open a separate terminal, start the application on a unique port
```
ng -o serve --port 420X
```
#### 4) On first application instance, login as "Walmart", this will enroll the "Walmart" participant and should take you to the Retailer Portal

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

#### 6) On another application instances, log in as "GHFarm", this should take you to the Producer Portal

- click on the order
- select the "Accept Order" button for the corn product
- select the "Assign Shipper" button for the corn product
- enter a "UPS"

#### 6) On another appication instance, log in as "UPS", this should take you to the Shipper Portal

- click on the order
- select the "Create Shipment" button for the corn product and enter a tracking number
- select the "Transport Shipment" button for the corn product

#### 7) Back on the Retailer Portal

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

#### 9) On another appication instance, log in as "FDA", this should take you to the Regulator Portal

- This will bring up a list of all orders
- Clicking on an order will display all of the transaction history of that order

#### 10) On another appication instance, log in as "ACustomer", this should take you to the Customer Portal

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
