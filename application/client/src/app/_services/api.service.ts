import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders} from '@angular/common/http';
import { UserService } from './user.service';
import { BehaviorSubject, Observable } from '../../../node_modules/rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  id: String = "";
  pwd: String = "";
  shipperid: String = "";
  body: Object;
  options: Object;
  private OrdersData = new BehaviorSubject([]);
  orders$: Observable<any[]> = this.OrdersData.asObservable();

  statuses = {
    1: "ORDER_CREATED",
    2: "ORDER_RECEIVED",
    3: "SHIPMENT_ASSIGNED",
    4: "SHIPMENT_CREATED",
    5: "SHIPMENT_IN_TRANSIT",
    6: "SHIPMENT_RECEIVED",
    7: "ORDER_CLOSED"
  };

  baseUrl = "http://localhost:3000";

  constructor(private httpClient: HttpClient, private userService: UserService) {}

  getAllStatuses(){
    return this.statuses;
  }

  createUserAuthorizationHeader(headers: HttpHeaders) {
    const currentUser = this.userService.getCurrentUser();
    return headers.append('Authorization', 'Basic ' + btoa(currentUser.userid+':'+currentUser.password)); 
  }

  //  This API is used:
  //  for a 'retailer' to get a list of 'producers' when creating an order
  //  for a 'producer' to get a list of 'shippers' when assigning a shipper
  getAllUsers(){
    let headers = new HttpHeaders();
    //
    //  NOTE: an admin identity is needed to invoke this API since it calls the CA methods. 
    headers = headers.append('Authorization', 'Basic ' + btoa('admin:adminpw')); 
    // replace with this line to pass in the current user vs admin
    //headers = this.createUserAuthorizationHeader(headers);
    return this.httpClient.get(this.baseUrl + '/api/users/', {headers:headers});
  }

  // This API is used during login to get the details of specific user trying to log in
  // The 'usertype' is retrieved to set the currentUser for this application
  getUser(){
    let headers = new HttpHeaders();
    //
    //  NOTE: an admin identity is needed to invoke this API since it calls the CA methods. 
    headers = headers.append('Authorization', 'Basic ' + btoa('admin:adminpw')); 
    // replace with this line to pass in the user trying to log in vs admin
    //headers = headers.append('Authorization', 'Basic ' + btoa(this.id+':'+this.pwd)); 
    return this.httpClient.get(this.baseUrl + '/api/users/'+ this.id, {headers:headers});
  }

  // This API checks to see if user credentials exist in Wallet
  isUserEnrolled(){
    let headers = new HttpHeaders();
    headers = this.createUserAuthorizationHeader(headers);
    return this.httpClient.get(this.baseUrl + '/api/is-user-enrolled/' + this.id, {headers:headers});
  }

  // NOTE: This API isn't invoked by the UI application.  It is provided to be invoked by URL only
  // As a result, an admin identity needs to call this

  queryOrder() {
    let headers = new HttpHeaders();
    //headers = this.createUserAuthorizationHeader(headers);
    headers = headers.append('Authorization', 'Basic ' + btoa('admin:adminpw')); 
    return this.httpClient.get(this.baseUrl + '/api/orders/' + this.id, {headers:headers})
  }

  queryOrders() {
    let headers = new HttpHeaders();
    headers = this.createUserAuthorizationHeader(headers);
    this.httpClient.get<any[]>(this.baseUrl + '/api/orders/', {headers:headers}).subscribe (orders => {
      console.log (orders);
      // Add status to each order, based on this.statuses
      for (let i of orders) {
        i.status = this.statuses[i.currentOrderState];
      }
      this.OrdersData.next(orders);
    }, error => {
      console.log(JSON.stringify(error));
      alert("Problem getting orders: " + error['error']['message']);
    })
  }

  clearOrders(){
    this.OrdersData.next([]);
  }

  deleteOrder(){
    let headers = new HttpHeaders();
    headers = this.createUserAuthorizationHeader(headers);
    return this.httpClient.delete(this.baseUrl + '/api/orders/' + this.id, {headers:headers})
  }

  getOrderHistory() {
    let headers = new HttpHeaders();
    headers = this.createUserAuthorizationHeader(headers);
    return this.httpClient.get(this.baseUrl + '/api/order-history/' + this.id, {headers:headers})
  }

  orderProduct() {
    let headers = new HttpHeaders();
    headers = this.createUserAuthorizationHeader(headers);
    return this.httpClient.post(this.baseUrl + '/api/orders', this.body, {headers:headers})
  }

  receiveOrder() {
    let headers = new HttpHeaders();
    headers = this.createUserAuthorizationHeader(headers);
    return this.httpClient.put(this.baseUrl + '/api/receive-order/' + this.id, {} ,{headers:headers})
  }

  assignShipper() {
    let headers = new HttpHeaders();
    headers = this.createUserAuthorizationHeader(headers);
    return this.httpClient.put(this.baseUrl + '/api/assign-shipper/' + this.id + '?shipperid=' + this.shipperid, {} ,{headers:headers})
  }

  createShipment() {
    let headers = new HttpHeaders();
    headers = this.createUserAuthorizationHeader(headers);
    return this.httpClient.put(this.baseUrl + '/api/create-shipment-for-order/' + this.id, {},{headers:headers})
  }

  transportShipment() {
    let headers = new HttpHeaders();
    headers = this.createUserAuthorizationHeader(headers);
    return this.httpClient.put(this.baseUrl + '/api/transport-shipment/' + this.id, {}, {headers:headers})
  }

  receiveShipment() {
    let headers = new HttpHeaders();
    headers = this.createUserAuthorizationHeader(headers);
    return this.httpClient.put(this.baseUrl + '/api/receive-shipment/' + this.id, {}, {headers:headers})
  }
}
