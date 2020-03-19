# Deploy to IKS Cluster
  
## Pre-requisites
- CLIs: ibmcloud, kubectl installed.
- This repository cloned into <INSTALL_DIR>

## Login into ibmcloud and container registry
```
$ ibmcloud login -sso
$ ibmcloud target -o <org_name> -g <resource_group>
$ ibmcloud cr login
```
## Set context to your cluster and namespace
For example: `bc-cncoc`, `gensupplychain`
```
$ ibmcloud cs cluster-config --cluster <cluster_name>
$ export KUBECFG=.....
$ kubectl config set-context <cluster_name> --namespace=<namespace>
```
## Build image for backend node.js server 
```
cd <INSTALL-DIR>/kube-config
cp Dockerfile-backend  <INSTALL-DIR>/application/server/Dockerfile
cd <INSTALL-DIR>/application/server/
ibmcloud cr build -t us.icr.io/<image_registry>/fabclient-gensupplychain:1  .
```
Note: don't miss the . at the end!
## Build image for frontend angular client:
```
cd <INSTALL-DIR>/kube-config
cp Dockerfile-ng <INSTALL-DIR>/application/client/Dockerfile
cd <INSTALL-DIR>/application/client
ibmcloud cr build -t us.icr.io/<image_registry>/bc-generic-ng:1  .
```
## Deploy the application
```
cd <INSTALL-DIR>/kube-config
kubectl apply -f gen-supplychain-deploy.yaml
```
## Expose the services 
Expost services to external ports 3000 (backend)and 4200 (frontend application) using a load balancer to access the application
```
kubectl expose deployment  generic-deployment  --type=LoadBalancer --name=generic-app-service
```
To get EXTERNAL-IP address:
```
kubectl get services generic-app-service
```
The output will be of the form:
```
$ kubectl get services generic-app-service
NAME              TYPE           CLUSTER-IP      EXTERNAL-IP      PORT(S)                         AGE
generic-app-service   LoadBalancer   172.21.52.123   52.116.150.115   3000:30158/TCP,4200:32544/TCP   16d
```
## Navigate to application 
The application will be available at <EXTERNAL-IP>:port-number1 where _port-number1_ is the port number dynamically mapped to `port 4200` at which the frontend service is available.  From this output, the application will be available at [http://52.116.150.115:32544](http://52.116.150.115:32544)
  
  
