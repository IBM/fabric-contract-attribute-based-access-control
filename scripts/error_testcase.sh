#! /bin/bash
#
# This script runs through a sample scenario of creating Launches, Payloads 
# It then takes a Payload and Launch through the process
#
# base64 encoded string 'YWRtaW46YWRtaW5wdw==' for 'admin:adminpw' added to authorization header
# base64 encoded string 'V2FsbWFydDpXYWxtYXJ0' for 'Walmart:Walmart added to authorization header
# base64 encoded string 'SEVCOkhFQg==' for 'HEB:HEB' added to authorization header
# base64 encoded string 'QUJGYXJtOkFCRmFybQ==' for 'ABFarm:ABFarm' added to authorization header
# base64 encoded string 'R0hGYXJtOkdIRmFybQ==' for 'GHFarm:GHFarm' added to authorization header
# base64 encoded string 'RmVkZXg6RmVkZXg=' for 'Fedex:Fedex' added to authorization header
# base64 encoded string 'VVBTOlVQUw==' for 'UPS:UPS' added to authorization header
# base64 encoded string 'QUN1c3RvbWVyOkFDdXN0b21lcg==' for 'ACustomer:ACustomer' added to authorization header
# base64 encoded string 'VGVzdFVzZXI6VGVzdFVzZXI=' for 'TestUser:TestUser' added to authorization header

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

echo ""
echo "********** Get all identities (Walmart)"
echo ""
curl -X GET -H "authorization: Basic V2FsbWFydDpXYWxtYXJ0" "${API_URL}/api/users/" 
echo ""
echo ""
echo "********* Retailer 'HEB' tries to register a new user"
echo ""
curl -X POST "${API_URL}/api/register-user" -H "authorization: Basic SEVCOkhFQg==" -H "Content-Type: application/json" -d "{\"userid\":\"TestUser\",\"password\":\"TestUser\",\"usertype\":\"retailer\"}"
echo ""
echo ""
echo "********* 'TestUser' tries to enroll themselves before being registered"
echo ""
curl -X POST "${API_URL}/api/enroll-user" -H "authorization: Basic VGVzdFVzZXI6VGVzdFVzZXI=" -H "Content-Type: application/json" -d "{\"usertype\":\"retailer\"}"
echo ""
echo ""
echo "********** Shipper 'Fedex' tries to create order-xxxx"
echo ""
curl -X POST -H "authorization: Basic RmVkZXg6RmVkZXg=" -H "Content-Type: application/json" -d "{\"orderId\":\"order-xxxx\",\"productId\":\"mango\",\"price\":5,\"quantity\":20,\"producerId\":\"ABFarm\",\"retailerId\":\"HEB\"}" "${API_URL}/api/orders/" 
echo ""
echo ""
echo "********* Retailer 'Walmart' creates order-0001"
echo ""
curl -X POST -H "authorization: Basic V2FsbWFydDpXYWxtYXJ0" -H "Content-Type: application/json" -d "{\"orderId\":\"order-0001\",\"productId\":\"tomato\",\"price\":3,\"quantity\":10,\"producerId\":\"GHFarm\",\"retailerId\":\"Walmart\"}" "${API_URL}/api/orders/" 
echo ""
echo ""
echo "********* Retailer 'Walmart' creates order-0001 again, should error that it already exists"
echo ""
curl -X POST -H "authorization: Basic V2FsbWFydDpXYWxtYXJ0" -H "Content-Type: application/json" -d "{\"orderId\":\"order-0001\",\"productId\":\"avocado\",\"price\":3,\"quantity\":10,\"producerId\":\"GHFarm\",\"retailerId\":\"Walmart\"}" "${API_URL}/api/orders/" 
echo ""
echo ""
echo "********** Retailer 'HEB' attempts to view order-0001. Should not be able to"
echo ""
curl -X GET -H "authorization: Basic SEVCOkhFQg==" "${API_URL}/api/orders/order-0001" 
echo ""
echo ""
echo "********** Producer 'ABFarm' tries to receive order-0001 "
echo ""
curl -X PUT -H "authorization: Basic QUJGYXJtOkFCRmFybQ==" "${API_URL}/api/receive-order/order-0001" 
echo ""
echo ""
echo "********** Producer 'GHFarm' receives order-0001 "
echo ""
curl -X PUT -H "authorization: Basic R0hGYXJtOkdIRmFybQ==" "${API_URL}/api/receive-order/order-0001" 
echo ""
echo ""
echo "********** Producer 'GHFarm' tries to receive non existant order-xxxx"
echo ""
curl -X PUT -H "authorization: Basic R0hGYXJtOkdIRmFybQ==" "${API_URL}/api/receive-order/order-xxxx" 
echo ""
echo ""
echo "********** Producer 'UPS' tries to assign order-0001 to shipper 'Fedex'"
echo ""
curl -X PUT -H "authorization: Basic VVBTOlVQUw==" "${API_URL}/api/assign-shipper/order-0001?shipperid=Fedex" 
echo ""
echo ""
echo "********** Producer 'GHFarm' tries to assign order-xxxx to shipper 'UPS'"
echo ""
curl -X PUT -H "authorization: Basic R0hGYXJtOkdIRmFybQ==" "${API_URL}/api/assign-shipper/order-xxxx?shipperid=UPS" 
echo ""
echo ""
echo "********** Producer 'GHFarm' assign order-0001 to shipper 'UPS'"
echo ""
curl -X PUT -H "authorization: Basic R0hGYXJtOkdIRmFybQ==" "${API_URL}/api/assign-shipper/order-0001?shipperid=UPS" 
echo ""
echo ""
echo "********** Shipper 'Fedex' tries to create a shipment for order-0001. Not allowed"
echo ""
curl -X PUT -H "authorization: Basic RmVkZXg6RmVkZXg=" "${API_URL}/api/create-shipment-for-order/order-0001" 
echo ""
echo ""
echo "********** Shipper 'Fedex' tries to creates a shipment for non existant order-xxxx"
echo ""
curl -X PUT -H "authorization: Basic RmVkZXg6RmVkZXg=" "${API_URL}/api/create-shipment-for-order/order-xxxx" 
echo ""
echo ""
echo "********** Shipper 'UPS' creates a shipment for order-0001"
echo ""
curl -X PUT -H "authorization: Basic VVBTOlVQUw==" "${API_URL}/api/create-shipment-for-order/order-0001" 
echo ""
echo ""
echo "********** Shipper 'Fedex' tries to transport non existant order-xxxx"
echo ""
curl -X PUT -H "authorization: Basic RmVkZXg6RmVkZXg=" "${API_URL}/api/transport-shipment/order-xxxx" 
echo ""
echo ""
echo "********** Shipper 'Fedex' tries to transport order-0001"
echo ""
curl -X PUT -H "authorization: Basic RmVkZXg6RmVkZXg=" "${API_URL}/api/transport-shipment/order-0001" 
echo ""
echo ""
echo "********** Shipper 'UPS' transports order-0001"
echo ""
curl -X PUT -H "authorization: Basic VVBTOlVQUw==" "${API_URL}/api/transport-shipment/order-0001" 
echo ""
echo ""
echo "********** Customer 'ACustomer' attempts to view history for order-0001.  Cannot because it is not in the correct state"
echo ""
curl -X GET -H "authorization: Basic QUN1c3RvbWVyOkFDdXN0b21lcg==" "${API_URL}/api/order-history/order-0001" 
echo ""
echo ""
echo "********** Retailer 'HEB' attempts to view history for order-0001."
echo ""
curl -X GET -H "authorization: Basic SEVCOkhFQg==" "${API_URL}/api/order-history/order-0001" 
echo ""
echo ""
echo "********** Producer 'ABFarm' attempts to view history for order-0001."
echo ""
curl -X GET -H "authorization: Basic QUJGYXJtOkFCRmFybQ==" "${API_URL}/api/order-history/order-0001" 
echo ""
echo ""
echo "********** Shipper 'Fedex' attempts to view history for order-0001."
echo ""
curl -X GET -H "authorization: Basic RmVkZXg6RmVkZXg=" "${API_URL}/api/order-history/order-0001" 
echo ""
echo ""
echo "********** Retailer 'HEB' tries to receive the shipment for order-0001"
echo ""
curl -X PUT -H "authorization: Basic SEVCOkhFQg==" "${API_URL}/api/receive-shipment/order-0001" 
echo ""
echo ""
echo "********** Retailer 'HEB' tries to receive the shipment for order-xxxx"
echo ""
curl -X PUT -H "authorization: Basic SEVCOkhFQg==" "${API_URL}/api/receive-shipment/order-xxxx" 
echo ""
echo ""
echo "********** Retailer 'HEB' attempts to delete order-0001"
echo ""
curl -X DELETE -H "authorization: Basic SEVCOkhFQg==" "${API_URL}/api/orders/order-0001" 
echo ""
echo ""
echo "********** Retailer 'HEB' attempts to delete order-xxxx"
echo ""
curl -X DELETE -H "authorization: Basic SEVCOkhFQg==" "${API_URL}/api/orders/order-xxxx" 
echo ""
echo ""
echo "********** Retailer 'Walmart' attempts to delete order-0001"
echo ""
curl -X DELETE -H "authorization: Basic V2FsbWFydDpXYWxtYXJ0" "${API_URL}/api/orders/order-0001" 
echo ""
echo ""
echo "********** Retailer 'Walmart' attempts to view order-0001"
echo ""
curl -X GET -H "authorization: Basic V2FsbWFydDpXYWxtYXJ0" "${API_URL}/api/orders/order-0001" 
echo ""
echo ""

