#! /bin/bash
#
# This script runs through a sample scenario of creating Launches, Payloads 
# It then takes a Payload and Launch through the process
#
echo "What is the IP address for the API server (default is localhost:3000)?"
read API_URL
API_URL=${API_URL:-localhost:3000}
set -x
# base64 encoded string added for admin:adminpw to authorization header
curl -X POST "${API_URL}/api/register-user" -H "authorization: Basic YWRtaW46YWRtaW5wdw==" -H "Content-Type: application/json" -d "{\"userid\":\"Walmart\",\"password\":\"Walmart\",\"usertype\":\"retailer\"}"
curl -X POST "${API_URL}/api/register-user" -H "authorization: Basic YWRtaW46YWRtaW5wdw==" -H "Content-Type: application/json" -d "{\"userid\":\"HEB\",\"password\":\"HEB\",\"usertype\":\"retailer\"}"
curl -X POST "${API_URL}/api/register-user" -H "authorization: Basic YWRtaW46YWRtaW5wdw==" -H "Content-Type: application/json" -d "{\"userid\":\"GHFarm\",\"password\":\"Farm001\",\"usertype\":\"producer\"}"
curl -X POST "${API_URL}/api/register-user" -H "authorization: Basic YWRtaW46YWRtaW5wdw==" -H "Content-Type: application/json" -d "{\"userid\":\"ABFarm\",\"password\":\"Farm002\",\"usertype\":\"producer\"}"
curl -X POST "${API_URL}/api/register-user" -H "authorization: Basic YWRtaW46YWRtaW5wdw==" -H "Content-Type: application/json" -d "{\"userid\":\"FDA\",\"password\":\"FDA\",\"usertype\":\"regulator\"}"
curl -X POST "${API_URL}/api/register-user" -H "authorization: Basic YWRtaW46YWRtaW5wdw==" -H "Content-Type: application/json" -d "{\"userid\":\"Fedex\",\"password\":\"Fedex\",\"usertype\":\"shipper\"}"
curl -X POST "${API_URL}/api/register-user" -H "authorization: Basic YWRtaW46YWRtaW5wdw==" -H "Content-Type: application/json" -d "{\"userid\":\"UPS\",\"password\":\"UPS\",\"usertype\":\"shipper\"}"
curl -X POST "${API_URL}/api/register-user" -H "authorization: Basic YWRtaW46YWRtaW5wdw==" -H "Content-Type: application/json" -d "{\"userid\":\"ACustomer\",\"password\":\"Customer1\",\"usertype\":\"customer\"}"

curl -X POST "${API_URL}/api/enroll-user" -H "authorization: Basic YWRtaW46YWRtaW5wdw==" -H "Content-Type: application/json" -d "{\"userid\":\"Walmart\",\"password\":\"Walmart\",\"usertype\":\"retailer\"}"
curl -X POST "${API_URL}/api/enroll-user" -H "authorization: Basic YWRtaW46YWRtaW5wdw==" -H "Content-Type: application/json" -d "{\"userid\":\"HEB\",\"password\":\"HEB\",\"usertype\":\"retailer\"}"
curl -X POST "${API_URL}/api/enroll-user" -H "authorization: Basic YWRtaW46YWRtaW5wdw==" -H "Content-Type: application/json" -d "{\"userid\":\"GHFarm\",\"password\":\"Farm001\",\"usertype\":\"producer\"}"
curl -X POST "${API_URL}/api/enroll-user" -H "authorization: Basic YWRtaW46YWRtaW5wdw==" -H "Content-Type: application/json" -d "{\"userid\":\"ABFarm\",\"password\":\"Farm002\",\"usertype\":\"producer\"}"
curl -X POST "${API_URL}/api/enroll-user" -H "authorization: Basic YWRtaW46YWRtaW5wdw==" -H "Content-Type: application/json" -d "{\"userid\":\"FDA\",\"password\":\"FDA\",\"usertype\":\"regulator\"}"
curl -X POST "${API_URL}/api/enroll-user" -H "authorization: Basic YWRtaW46YWRtaW5wdw==" -H "Content-Type: application/json" -d "{\"userid\":\"Fedex\",\"password\":\"Fedex\",\"usertype\":\"shipper\"}"
curl -X POST "${API_URL}/api/enroll-user" -H "authorization: Basic YWRtaW46YWRtaW5wdw==" -H "Content-Type: application/json" -d "{\"userid\":\"UPS\",\"password\":\"UPS\",\"usertype\":\"shipper\"}"
curl -X POST "${API_URL}/api/enroll-user" -H "authorization: Basic YWRtaW46YWRtaW5wdw==" -H "Content-Type: application/json" -d "{\"userid\":\"ACustomer\",\"password\":\"Customer1\",\"usertype\":\"customer\"}"
