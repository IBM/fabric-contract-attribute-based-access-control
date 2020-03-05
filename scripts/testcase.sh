#! /bin/bash
#
# This script runs through a sample scenario of creating Launches, Payloads 
# It then takes a Payload and Launch through the process
#
# API_URL=${API_URL:-localhost:3000}
echo "What is the IP address for the API server?"
read API_URL

echo "************* Clean out all data"
echo ""
# curl -X POST "${API_URL}/api/reset-demo" -H "accept: application/json"
echo ""
echo ""
set -x
curl -X POST "http://localhost:${PORT}/api/register-user" -H "accept: application/json" -H "Content-Type: application/json" -d "{\"userid\":\"Walmart\",\"password\":\"Walmart\",\"usertype\":\"retailer\"}"
curl -X POST "http://localhost:${PORT}/api/register-user" -H "accept: application/json" -H "Content-Type: application/json" -d "{\"userid\":\"HEB\",\"password\":\"HEB\",\"usertype\":\"retailer\"}"
curl -X POST "http://localhost:${PORT}/api/register-user" -H "accept: application/json" -H "Content-Type: application/json" -d "{\"userid\":\"Farm001\",\"password\":\"Farm001\",\"usertype\":\"producer\"}"
curl -X POST "http://localhost:${PORT}/api/register-user" -H "accept: application/json" -H "Content-Type: application/json" -d "{\"userid\":\"Farm002\",\"password\":\"Farm002\",\"usertype\":\"producer\"}"
curl -X POST "http://localhost:${PORT}/api/register-user" -H "accept: application/json" -H "Content-Type: application/json" -d "{\"userid\":\"FDA\",\"password\":\"FDA\",\"usertype\":\"regulator\"}"
curl -X POST "http://localhost:${PORT}/api/register-user" -H "accept: application/json" -H "Content-Type: application/json" -d "{\"userid\":\"Fedex\",\"password\":\"Fedex\",\"usertype\":\"shipper\"}"
curl -X POST "http://localhost:${PORT}/api/register-user" -H "accept: application/json" -H "Content-Type: application/json" -d "{\"userid\":\"UPS\",\"password\":\"UPS\",\"usertype\":\"shipper\"}"
curl -X POST "http://localhost:${PORT}/api/register-user" -H "accept: application/json" -H "Content-Type: application/json" -d "{\"userid\":\"Customer1\",\"password\":\"Customer1\",\"usertype\":\"customer\"}"

curl -X POST "http://localhost:${PORT}/api/enroll-user" -H "accept: application/json" -H "Content-Type: application/json" -d "{\"userid\":\"Walmart\",\"password\":\"Walmart\",\"usertype\":\"retailer\"}"
curl -X POST "http://localhost:${PORT}/api/enroll-user" -H "accept: application/json" -H "Content-Type: application/json" -d "{\"userid\":\"HEB\",\"password\":\"HEB\",\"usertype\":\"retailer\"}"
curl -X POST "http://localhost:${PORT}/api/enroll-user" -H "accept: application/json" -H "Content-Type: application/json" -d "{\"userid\":\"Farm001\",\"password\":\"Farm001\",\"usertype\":\"producer\"}"
curl -X POST "http://localhost:${PORT}/api/enroll-user" -H "accept: application/json" -H "Content-Type: application/json" -d "{\"userid\":\"Farm002\",\"password\":\"Farm002\",\"usertype\":\"producer\"}"
curl -X POST "http://localhost:${PORT}/api/enroll-user" -H "accept: application/json" -H "Content-Type: application/json" -d "{\"userid\":\"FDA\",\"password\":\"FDA\",\"usertype\":\"regulator\"}"
curl -X POST "http://localhost:${PORT}/api/enroll-user" -H "accept: application/json" -H "Content-Type: application/json" -d "{\"userid\":\"Fedex\",\"password\":\"Fedex\",\"usertype\":\"shipper\"}"
curl -X POST "http://localhost:${PORT}/api/enroll-user" -H "accept: application/json" -H "Content-Type: application/json" -d "{\"userid\":\"UPS\",\"password\":\"UPS\",\"usertype\":\"shipper\"}"
curl -X POST "http://localhost:${PORT}/api/enroll-user" -H "accept: application/json" -H "Content-Type: application/json" -d "{\"userid\":\"Customer1\",\"password\":\"Customer1\",\"usertype\":\"customer\"}"


#**************************************
echo "******* Create Orders"
echo ""
curl -X GET "${API_URL}/api/current-user-id/" 
curl -X GET "${API_URL}/api/login?userid=Walmart&password=Walmart"
curl -X POST "${API_URL}/api/orders/" -H "accept: application/json" -H "Content-Type: application/json" -d "{\"orderId\":\"Order-001\",\"productId\":\"tomato\",\"price\":3,\"quantity\":10,\"producerId\":\"Farm001\",\"retailerId\":\"Walmart\"}"
curl -X GET "${API_URL}/api/orders/" 
curl -X GET "${API_URL}/api/orders/Order-001" 


curl -X GET "${API_URL}/api/login?userid=HEB&password=HEB"
curl -X POST "${API_URL}/api/orders/" -H "accept: application/json" -H "Content-Type: application/json" -d "{\"orderId\":\"Order-002\",\"productId\":\"mango\",\"price\":5,\"quantity\":20,\"producerId\":\"Farm002\",\"retailerId\":\"HEB\"}"
curl -X GET "${API_URL}/api/orders/" 
curl -X GET "${API_URL}/api/orders/Order-002" 
# This user can't see Order-001
curl -X GET "${API_URL}/api/orders/Order-001" 

# Producer logs in and receives order, assigns a shipper
curl -X GET "${API_URL}/api/login?userid=Farm002&password=Farm002"
curl -X GET "${API_URL}/api/current-user-id/" 
curl -X GET "${API_URL}/api/current-user-type/" 

curl -X GET "${API_URL}/api/orders/"
curl -X PUT "${API_URL}/api/receive-order/Order-002" 
curl -X PUT "${API_URL}/api/assign-shipper/Order-002?shipperid=Fedex" 
curl -X GET "${API_URL}/api/orders/Order-002" 

# Shipper logs in to create a shipment by assigning a tracking number and transporting
curl -X GET "${API_URL}/api/login?userid=Fedex&password=Fedex"
curl -X GET "${API_URL}/api/orders/" 
curl -X PUT "${API_URL}/api/create-shipment-for-order/Order-002" 
curl -X PUT "${API_URL}/api/transport-shipment/Order-002" 
curl -X GET "${API_URL}/api/orders/Order-002" 

# Retailer logs back in and receives the shipment
curl -X GET "${API_URL}/api/login?userid=HEB&password=HEB"
curl -X PUT "${API_URL}/api/receive-shipment/Order-002" 

# Customer can view history
curl -X GET "${API_URL}/api/login?userid=Customer1&password=Customer1"
curl -X GET "${API_URL}/api/order-history/Order-002" 

# Regulator can see all orders and their history
curl -X GET "${API_URL}/api/login?userid=FDA&password=FDA"
curl -X GET "${API_URL}/api/orders/" 
curl -X GET "${API_URL}/api/order-history/Order-001" 
curl -X GET "${API_URL}/api/order-history/Order-002" 

curl -X DELETE "${API_URL}/api/orders/Order-001" 
curl -X DELETE "${API_URL}/api/orders/Order-002" 



