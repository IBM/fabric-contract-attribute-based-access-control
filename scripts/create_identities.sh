#! /bin/bash
#
# This script runs through a sample scenario of creating Launches, Payloads 
# It then takes a Payload and Launch through the process
#
echo "What is the IP address for the API server (default is localhost:3000)?"
read API_URL
API_URL=${API_URL:-localhost:3000}
#set -x
# base64 encoded string added for 'admin:adminpw' to authorization header
echo 'curl -X POST "${API_URL}/api/register-user" -H "authorization: Basic YWRtaW46YWRtaW5wdw==" -H "Content-Type: application/json" -d "{\"userid\":\"Walmart\",\"password\":\"Walmart\",\"usertype\":\"retailer\"}"'
curl -X POST "${API_URL}/api/register-user" -H "authorization: Basic YWRtaW46YWRtaW5wdw==" -H "Content-Type: application/json" -d "{\"userid\":\"Walmart\",\"password\":\"Walmart\",\"usertype\":\"retailer\"}"
echo ""
echo ""
echo 'curl -X POST "${API_URL}/api/register-user" -H "authorization: Basic YWRtaW46YWRtaW5wdw==" -H "Content-Type: application/json" -d "{\"userid\":\"HEB\",\"password\":\"HEB\",\"usertype\":\"retailer\"}"'
curl -X POST "${API_URL}/api/register-user" -H "authorization: Basic YWRtaW46YWRtaW5wdw==" -H "Content-Type: application/json" -d "{\"userid\":\"HEB\",\"password\":\"HEB\",\"usertype\":\"retailer\"}"
echo ""
echo ""
echo 'curl -X POST "${API_URL}/api/register-user" -H "authorization: Basic YWRtaW46YWRtaW5wdw==" -H "Content-Type: application/json" -d "{\"userid\":\"GHFarm\",\"password\":\"GHFarm\",\"usertype\":\"producer\"}"'
curl -X POST "${API_URL}/api/register-user" -H "authorization: Basic YWRtaW46YWRtaW5wdw==" -H "Content-Type: application/json" -d "{\"userid\":\"GHFarm\",\"password\":\"GHFarm\",\"usertype\":\"producer\"}"
echo ""
echo ""
echo 'curl -X POST "${API_URL}/api/register-user" -H "authorization: Basic YWRtaW46YWRtaW5wdw==" -H "Content-Type: application/json" -d "{\"userid\":\"ABFarm\",\"password\":\"ABFarm\",\"usertype\":\"producer\"}"'
curl -X POST "${API_URL}/api/register-user" -H "authorization: Basic YWRtaW46YWRtaW5wdw==" -H "Content-Type: application/json" -d "{\"userid\":\"ABFarm\",\"password\":\"ABFarm\",\"usertype\":\"producer\"}"
echo ""
echo ""
echo 'curl -X POST "${API_URL}/api/register-user" -H "authorization: Basic YWRtaW46YWRtaW5wdw==" -H "Content-Type: application/json" -d "{\"userid\":\"FDA\",\"password\":\"FDA\",\"usertype\":\"regulator\"}"'
curl -X POST "${API_URL}/api/register-user" -H "authorization: Basic YWRtaW46YWRtaW5wdw==" -H "Content-Type: application/json" -d "{\"userid\":\"FDA\",\"password\":\"FDA\",\"usertype\":\"regulator\"}"
echo ""
echo ""
echo 'curl -X POST "${API_URL}/api/register-user" -H "authorization: Basic YWRtaW46YWRtaW5wdw==" -H "Content-Type: application/json" -d "{\"userid\":\"Fedex\",\"password\":\"Fedex\",\"usertype\":\"shipper\"}"'
curl -X POST "${API_URL}/api/register-user" -H "authorization: Basic YWRtaW46YWRtaW5wdw==" -H "Content-Type: application/json" -d "{\"userid\":\"Fedex\",\"password\":\"Fedex\",\"usertype\":\"shipper\"}"
echo ""
echo ""
echo 'curl -X POST "${API_URL}/api/register-user" -H "authorization: Basic YWRtaW46YWRtaW5wdw==" -H "Content-Type: application/json" -d "{\"userid\":\"UPS\",\"password\":\"UPS\",\"usertype\":\"shipper\"}"'
curl -X POST "${API_URL}/api/register-user" -H "authorization: Basic YWRtaW46YWRtaW5wdw==" -H "Content-Type: application/json" -d "{\"userid\":\"UPS\",\"password\":\"UPS\",\"usertype\":\"shipper\"}"
echo ""
echo ""
echo 'curl -X POST "${API_URL}/api/register-user" -H "authorization: Basic YWRtaW46YWRtaW5wdw==" -H "Content-Type: application/json" -d "{\"userid\":\"ACustomer\",\"password\":\"ACustomer\",\"usertype\":\"customer\"}"'
curl -X POST "${API_URL}/api/register-user" -H "authorization: Basic YWRtaW46YWRtaW5wdw==" -H "Content-Type: application/json" -d "{\"userid\":\"ACustomer\",\"password\":\"ACustomer\",\"usertype\":\"customer\"}"
