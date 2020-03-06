#! /bin/bash
#
# This script runs through a sample scenario of creating Launches, Payloads 
# It then takes a Payload and Launch through the process
#
echo "What is the IP address for the API server (default is localhost:3000)?"
read API_URL
API_URL=${API_URL:-http://localhost:3000}


#echo "************* Clean out all data"
#echo ""
# curl -X POST "${API_URL}/api/reset-demo" -H "accept: application/json"
#echo ""
#echo ""
#
#**************************************
echo "Retailer Walmart logs in and create Order-001"
echo ""
curl -X GET "${API_URL}/api/current-user-id/" 
curl -X GET "${API_URL}/api/login?userid=Walmart&password=Walmart"
curl -X POST "${API_URL}/api/orders/" -H "accept: application/json" -H "Content-Type: application/json" -d "{\"orderId\":\"Order-001\",\"productId\":\"tomato\",\"price\":3,\"quantity\":10,\"producerId\":\"Farm001\",\"retailerId\":\"Walmart\"}"
curl -X GET "${API_URL}/api/orders/" 
curl -X GET "${API_URL}/api/orders/Order-001" 

echo "Retailer HEB logs in and create Order-002"
echo ""
curl -X GET "${API_URL}/api/login?userid=HEB&password=HEB"
curl -X POST "${API_URL}/api/orders/" -H "accept: application/json" -H "Content-Type: application/json" -d "{\"orderId\":\"Order-002\",\"productId\":\"mango\",\"price\":5,\"quantity\":20,\"producerId\":\"Farm002\",\"retailerId\":\"HEB\"}"
echo "HEB attempts to view orders associated with them"
echo ""
curl -X GET "${API_URL}/api/orders/" 
#curl -X GET "${API_URL}/api/orders/Order-002" 
echo "HEB attempts to view Order-001. Shouldn't be able to"
echo ""
curl -X GET "${API_URL}/api/orders/Order-001" 

echo  "Producer logs in to view orders associated with them and receives Order-002"
echo ""
curl -X GET "${API_URL}/api/login?userid=Farm002&password=Farm002"
#curl -X GET "${API_URL}/api/current-user-id/" 
#curl -X GET "${API_URL}/api/current-user-type/" 
curl -X GET "${API_URL}/api/orders/"
echo  "Producer receives Order-002 which changes status to ORDER_RECEIVED"
echo ""
curl -X PUT "${API_URL}/api/receive-order/Order-002" 
echo  "Producer assigns a shipper"
echo ""
curl -X PUT "${API_URL}/api/assign-shipper/Order-002?shipperid=Fedex" 
#curl -X GET "${API_URL}/api/orders/Order-002" 

echo " Shipper logs in to view orders associated with them"
echo ""
curl -X GET "${API_URL}/api/login?userid=Fedex&password=Fedex"
curl -X GET "${API_URL}/api/orders/" 
echo " Shipper creates a shipment for Order-002 by assigning a tracking number"
echo ""
curl -X PUT "${API_URL}/api/create-shipment-for-order/Order-002" 
echo "Shipper transports Order-001 by changing status to ORDER_IN_TRANSPORT"
echo ""
curl -X PUT "${API_URL}/api/transport-shipment/Order-002" 
#curl -X GET "${API_URL}/api/orders/Order-002" 

echo "Retailer logs back in to see orders associated with them"
echo ""
curl -X GET "${API_URL}/api/login?userid=HEB&password=HEB"
echo "Retailer receives the shipment for Order-002 by moving status to SHIPMENT_RECEIVED"
echo ""
curl -X PUT "${API_URL}/api/receive-shipment/Order-002" 

echo "Customer can now view history for Order-002, can't view history for Order-001 since it hasn't been produces and shipped back to Retailer"
echo ""
curl -X GET "${API_URL}/api/login?userid=Customer1&password=Customer1"
curl -X GET "${API_URL}/api/order-history/Order-002" 
curl -X GET "${API_URL}/api/order-history/Order-001" 

echo  "Regulator can see all orders and their history"
echo ""
curl -X GET "${API_URL}/api/login?userid=FDA&password=FDA"
curl -X GET "${API_URL}/api/orders/" 
curl -X GET "${API_URL}/api/order-history/Order-001" 
curl -X GET "${API_URL}/api/order-history/Order-002" 

echo "Log in as Retailer Walmart and delete Order-001"
echo ""
curl -X GET "${API_URL}/api/login?userid=Walmart&password=Walmart"
curl -X DELETE "${API_URL}/api/orders/Order-001" 
echo "Log in as Retailer HEB and delete Order-002"
echo ""
curl -X GET "${API_URL}/api/login?userid=HEB&password=HEB"
curl -X DELETE "${API_URL}/api/orders/Order-002" 

