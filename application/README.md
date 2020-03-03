## To run this application:

Ensure that the contract located in https://github.ibm.com/customer-success/BlockchainEnablement/tree/master/GenericSupplychain/src/contract has been install and instantiated via the VSCode Blockchain IDE extension and
is running on a local fabric or the IBP V2 service. See https://marketplace.visualstudio.com/items?itemName=IBMBlockchain.ibm-blockchain-platform for information in installing the VSCode Blockchain IDE extension and tutorials on how to install a smart contract.

### Setup

In the VSCode IDE, issue Shift+Command+P to bring up the command prompt.  Issue the "IBM Blockchain Platform: Export Connection Profile" command.  If you are running a local fabric, save this file to <git_tree>/BlockchainEnablement/GenericSupplychain/src/gateway/local_fabric/local_fabric_connection.json. If you are running against IBP V2, save this file as <git tree>/BlockchainEnablement/GenericSupplychain/src/gateway/ibp/ibp_connection_profile.json.

### Start the server side of the application:

In a terminal window -
```
git clone git@github.ibm.com:customer-success/BlockchainEnablement.git
cd <git_tree>/BlockchainEnablement/GenericSupplychain/src/server
export PORT=<PORT #>          // Defaults to 3000
export PLATFORM= <IBP|LOCAL>  // Defaults to LOCAL
node server.js
```

### Start the client side applications:

In a separate terminal window - 

#### 1) build and install all dependencies:
```
cd <git_tree>/BlockchainEnablement/GenericSupplychain/src/client/generic-ang
npm install
ng -o serve
```
#### 2) start the portal http://localhost:4200
