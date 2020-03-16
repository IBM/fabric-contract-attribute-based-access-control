#### Deploy to IKS Cluster
  
##### Pre-requisites
- CLIs: ibmcloud, kubectl installed.
- This repository cloned into <INSTALL_DIR>
- Login into ibmcloud and container registry
- set context to your cluster and namespace, (`bc-cncoc` and namespace, gensupplychain)
```
$ ibmcloud login -sso
$ ibmcloud target -o <org_name> -g <resource_group>
$ ibmcloud cr login
$ ibmcloud cs cluster-config --cluster <cluster_name>
$ export KUBECFG=.....
$ kubectl config set-context <cluster_name> --namespace=<namespace>
```
To build image for backend node.js server (dont miss the . at the end!):
```
cd <INSTALL-DIR>/kube-config
cp Dockerfile-backend  <INSTALL-DIR>/Blockchain-GenSupplyChain/application/server/Dockerfile
cd <INSTALL-DIR>/application/server/
ibmcloud cr build -t us.icr.io/<image_registry>/fabclient-gensupplychain:1  .
```
To build image for frondend angular application:
```
cd <INSTALL-DIR>/kube-config
cp Dockerfile-ng <INSTALL-DIR>/Blockchain-GenSupplyChain/application/client/Dockerfile
cd <INSTALL-DIR>/Blockchain-GenSupplyChain/application/client
ibmcloud cr build -t us.icr.io/<image_registry>/bc-generic-ng:1  .
```
To deploy the application:
```
cd <INSTALL-DIR>/Blockchain-GenSupplyChain/kube-config
kubectl apply -f gen-supplychain-deploy.yaml
```
To access the application, expose the services running on port 3000 (backend) and 4200 (frontend application) using a load balancer:
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
The application will be available at <EXTERNAL-IP>:port-number1 where _port-number1_ is the port number dynamically mapped to `port 4200` at which the frontend service is available.  From this output, the application will be available at [http://52.116.150.115:32544](http://52.116.150.115:32544)
  
  
