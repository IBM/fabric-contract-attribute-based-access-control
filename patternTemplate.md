# Short title

> Use access control in your blockchain smart contracts to streamline supply chain operations

# Long title

> Implement attribute based access control with Hyperledger Fabric to ensure security 
and transparency 

# Author

* Ann Umberhocker <ann.umberhocker@ibm.com>, Horea Porutiu <horea.porutiu@ibm.com>, Sowmya Janakiraman <somya@ibm.com>, Kaleen Iwema

# URLs

### Github repo

> https://github.ibm.com/customer-success/Blockchain-GenSupplyChain


# Summary

This sample demonstrates an end to end blockchain application that connects to Hyperledger Fabric 1.4. It implements attribute based access control, user management,
event management, and a Angular front-end UI to interact and query the blockchain ledger. The 
sample takes the user through ordering, shipping, and enlisting the product for the customer to 
purchase. The customer can trace the order history through the supply chain, providing 
end to end visibility. Lastly, a regulator has access to all orders in the system to ensure 
correct practices are followed. 

# Description

In supply chain, confidentiality is mandatory since some consumers might be given 
discounted rates compared to others. In this scenario, other consumers should not be able to access 
their competitors' rates. Given that Hyperledger Fabric is optimized for a broad range of 
industry use-cases, including supply chain, the open-source framework provides a way to implement 
confidentiality at the chaincode layer using attribute based access control. This example shows you 
how to implement such functionality, by registering each user with a specific attribute, called "usertype".
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
4. Use a Angular UI to interact with a Hyperleder Fabric network

# Technologies

* [Blockchain](https://developer.ibm.com/technologies/blockchain/): A blockchain is a tamper-evident, shared digital ledger that records transactions in a public or private peer-to-peer network. The blockchain acts as a single source of truth, and members in a blockchain network can view only those transactions that are relevant to them.

* [Node.js](https://developer.ibm.com/technologies/node-js/): Node.js is a runtime environment to run JavaScript code outside the browser.

# Flow

<br>
<p align="center">

![flow](https://github.ibm.com/customer-success/Blockchain-GenSupplyChain/blob/master/images/GenericAppFlow.png)

</p>
<br>

# Flow Description
1. The user interacts with an Angular Web UI to update and query the blockchain ledger and state
2. The UI calls Node.js application APIs running on a backend server
3. The Node.js application server calls [Fabric SDK APIs](https://hyperledger.github.io/fabric-sdk-node/) 
4. The Fabric SDK interacts with and submits transactions to a Hyperledger Fabric 1.4.1 network (or a IBM Blockchain Platform 2.0 network)

# Instructions

> Find the detailed steps for this pattern in the [readme file](https://github.ibm.com/customer-success/Blockchain-GenSupplyChain/blob/master/README.md). The steps will show you how to:

1. Clone the Repo
2. Start the Fabric Runtime
3. Install and Instantiate Contract
4. Export Connection Details
5. Export Local Wallet
6. Build and Run the App
7. Submit transactions in the app

# Components and services

+ [Hyperledger Fabric v1.4.1](https://hyperledger-fabric.readthedocs.io) is a platform for distributed ledger solutions, underpinned by a modular architecture that delivers high degrees of confidentiality, resiliency, flexibility, and scalability.
+ [Docker](https://www.docker.com/) Docker is a set of platform as a service products that use OS-level virtualization to deliver software in packages called containers. Containers are isolated from one another and bundle their own software, libraries and config

# Runtimes

* Node.js

# Related IBM Developer content
* [Private Data on IBM Blockchain Platform](https://github.com/IBM/private-data-collections-on-fabric)
* [Coffee supply chain example - blockchainbean](https://github.com/IBM/blockchainbean2)
* [Build a blockchain insurance application](https://github.com/IBM/build-blockchain-insurance-app)

# Related links
* [Chaincode access control](https://hyperledger-fabric.readthedocs.io/en/release-2.0/chaincode4ade.html#chaincode-access-control)
* [IBM Blockchain Platform Extension for VS Code](https://marketplace.visualstudio.com/items?itemName=IBMBlockchain.ibm-blockchain-platform)
* [Hyperledger Fabric SDK for Node.js](https://hyperledger.github.io/fabric-sdk-node/release-1.4/index.html)
* [Build a network tutorial - IBM Blockchain Platform](https://cloud.ibm.com/docs/services/blockchain/howto?topic=blockchain-ibp-console-build-network#ibp-console-build-network)



