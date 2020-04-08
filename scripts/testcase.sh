#! /bin/bash
#
# This script runs through a sample scenario of creating Launches, Payloads 
# It then takes a Payload and Launch through the process
#
echo "What is the IP address for the API server (default is localhost:3000)?"
read API_URL
API_URL=${API_URL:-http://localhost:3000}
echo "Do you want to register identities? [y,n]"
read yn
case $yn in
    [[yY] | [yY][Ee][Ss] )
        echo running ./create_identities.sh
        ./create_identities.sh
    ;;
    [nN] | [n|N][O|o] )
	;;
    *) echo "Invalid input"
    exit 1
    ;;
esac
echo "Do you want to enroll identities? [y,n]"
read yn
case $yn in
    [yY] | [yY][Ee][Ss] )
        echo running ./enroll_identities.sh
        ./enroll_identities.sh
    ;;
    [[nN] | [n|N][O|o] ) 
	;;
    *) echo "Invalid input"
    exit 1
    ;;
esac
echo ""
echo "********** Get all identities (admin)"
# base64 encoded string 'YWRtaW46YWRtaW5wdw==' for 'admin:admin' added to authorization header
echo ""
curl -X GET -H "authorization: Basic YWRtaW46YWRtaW5wdw==" "${API_URL}/api/users/" 
echo ""
echo ""
echo "********* Retailer 'Walmart' creates order-0001"
# base64 encoded string 'V2FsbWFydDpXYWxtYXJ0' for 'Walmart:Walmart' added to authorization header
echo ""
curl -X POST -H "authorization: Basic V2FsbWFydDpXYWxtYXJ0" -H "Content-Type: application/json" -d "{\"orderId\":\"order-0001\",\"productId\":\"tomato\",\"price\":3,\"quantity\":10,\"producerId\":\"GHFarm\",\"retailerId\":\"Walmart\"}" "${API_URL}/api/orders/" 
echo ""
echo "********* Retailer 'Walmart' views their orders"
echo ""
curl -X GET -H "authorization: Basic V2FsbWFydDpXYWxtYXJ0" "${API_URL}/api/orders/" 
echo ""
echo ""
echo "********** Retailer 'HEB' creates order-0002, order-0003"
# base64 encoded string 'SEVCOkhFQg==' for 'HEB:HEB' added to authorization header
echo ""
curl -X POST -H "authorization: Basic SEVCOkhFQg==" -H "Content-Type: application/json" -d "{\"orderId\":\"order-0002\",\"productId\":\"mango\",\"price\":5,\"quantity\":20,\"producerId\":\"ABFarm\",\"retailerId\":\"HEB\"}" "${API_URL}/api/orders/" 
echo ""
echo ""
curl -X POST -H "authorization: Basic SEVCOkhFQg==" -H "Content-Type: application/json" -d "{\"orderId\":\"order-0003\",\"productId\":\"grapes\",\"price\":2,\"quantity\":30,\"producerId\":\"GHFarm\",\"retailerId\":\"HEB\"}" "${API_URL}/api/orders/"
echo ""
echo ""
echo "********** Retailer 'HEB' views all of their orders"
echo ""
curl -X GET -H "authorization: Basic SEVCOkhFQg==" "${API_URL}/api/orders/" 
echo ""
echo ""
echo "********* Retailer 'HEB' views order-0002 specifics"
echo ""
curl -X GET -H "authorization: Basic SEVCOkhFQg==" "${API_URL}/api/orders/order-0002" 
echo ""
echo ""
echo "********** Retailer 'HEB' attempts to view order-0001. Should not be able to"
echo ""
curl -X GET -H "authorization: Basic SEVCOkhFQg==" "${API_URL}/api/orders/order-0001" 
echo ""
echo ""
echo "********** Producer 'ABFarm' lists all orders assigned to them "
# base64 encoded string 'QUJGYXJtOkFCRmFybQ==' for 'ABFarm:ABFarm' added to authorization header
echo ""
curl -X GET -H "authorization: Basic QUJGYXJtOkFCRmFybQ==" "${API_URL}/api/orders/"
echo ""
echo ""
echo "********** Producer 'ABFarm' receives order-0002 which changes status to ORDER_RECEIVED"
echo ""
curl -X PUT -H "authorization: Basic QUJGYXJtOkFCRmFybQ==" "${API_URL}/api/receive-order/order-0002" 
echo ""
echo ""
echo "********** Producer 'ABFarm' assigns to shipper 'Fedex'"
echo ""
curl -X PUT -H "authorization: Basic QUJGYXJtOkFCRmFybQ==" "${API_URL}/api/assign-shipper/order-0002?shipperid=Fedex" 
echo ""
echo ""
echo "********** Shipper 'Fedex' views orders assigned to them"
# base64 encoded string 'RmVkZXg6RmVkZXg=' for 'Fedex:Fedex' added to authorization header
echo ""
curl -X GET -H "authorization: Basic RmVkZXg6RmVkZXg=" "${API_URL}/api/orders/" 
echo ""
echo ""
echo "********** Shipper 'Fedex' creates a shipment for order-0002 by assigning a tracking number"
echo ""
curl -X PUT -H "authorization: Basic RmVkZXg6RmVkZXg=" "${API_URL}/api/create-shipment-for-order/order-0002" 
echo ""
echo ""
echo "********** Shipper 'Fedex' transports Order-0002 by changing status to ORDER_IN_TRANSPORT"
echo ""
curl -X PUT -H "authorization: Basic RmVkZXg6RmVkZXg=" "${API_URL}/api/transport-shipment/order-0002" 
echo ""
echo ""
echo "********** Retailer 'HEB' lists orders associated with them"
echo ""
curl -X GET -H "authorization: Basic SEVCOkhFQg==" "${API_URL}/api/orders/" 
echo ""
echo ""
echo "********** Retailer 'HEB' receives the shipment for order-0002 by moving status to SHIPMENT_RECEIVED"
echo ""
curl -X PUT -H "authorization: Basic SEVCOkhFQg==" "${API_URL}/api/receive-shipment/order-0002" 
echo ""
echo ""
echo "********** Customer 'ACustomer' can now view history for order-0002 since it has been shipped back to the retailer" 
# base64 encoded string 'QUN1c3RvbWVyOkFDdXN0b21lcg==' for 'ACustomer:ACustomer' added to authorization header
echo ""
curl -X GET -H "authorization: Basic QUN1c3RvbWVyOkFDdXN0b21lcg==" "${API_URL}/api/order-history/order-0002" 
echo ""
echo "" 
echo "********** Customer 'ACustomer' attempts to view history for order-0001.  Can not because it is not in the correct state"
echo ""
curl -X GET -H "authorization: Basic QUN1c3RvbWVyOkFDdXN0b21lcg==" "${API_URL}/api/order-history/order-0001" 
echo ""
echo ""
echo "********** Regulator 'FDA' can see all orders and their history"
# base64 encoded string 'RkRBOkZEQQ==' for 'FDA:FDA' added to authorization header
echo ""
curl -X GET -H "authorization: Basic RkRBOkZEQQ==" "${API_URL}/api/orders/" 
echo ""
echo ""
echo "********** Regulator 'FDA' can see history from different retailers"
echo ""
curl -X GET -H "authorization: Basic RkRBOkZEQQ==" "${API_URL}/api/order-history/order-0001" 
echo ""
echo ""
echo "********** Regulator 'FDA' can see history from different retailers"
echo ""
curl -X GET -H "authorization: Basic RkRBOkZEQQ==" "${API_URL}/api/order-history/order-0002" 
echo ""
echo ""
echo "********** Retailer 'Walmart' deletes order-0001"
echo ""
curl -X DELETE -H "authorization: Basic V2FsbWFydDpXYWxtYXJ0" "${API_URL}/api/orders/order-0001" 
echo ""
echo ""
echo "********** Retailer 'HEB' deletes order-0002"
echo ""
curl -X DELETE -H "authorization: Basic SEVCOkhFQg==" "${API_URL}/api/orders/order-0002" 
echo ""
echo ""
echo "********** Retailer 'HEB' deletes order-0003"
echo ""
curl -X DELETE -H "authorization: Basic SEVCOkhFQg==" "${API_URL}/api/orders/order-0003" 

