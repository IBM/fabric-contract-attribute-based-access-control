import { Injectable } from '@angular/core';
import { HttpClient} from '@angular/common/http';
import { BehaviorSubject, Observable } from '../../../node_modules/rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  id: String = "";
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

  constructor(private httpClient: HttpClient) {}
  getAllStatuses(){
    return this.statuses;
  }

  getAllUsers(){
    return this.httpClient.get(this.baseUrl + '/api/getallusers/');
  }

  isUserEnrolled(){
    return this.httpClient.get(this.baseUrl + '/api/isuserenrolled/' + this.id);
  }

  queryOrder() {
    return this.httpClient.get(this.baseUrl + '/api/queryorder/' + this.id)
  }

  queryOrders(userid, password) {
    this.httpClient.get<any[]>(this.baseUrl + '/api/queryorders?'+"userid=" + userid + "&password=" + password).subscribe (orders => {
      console.log (orders);
      // Add status to each order, based on this.statuses
      for (let i of orders) {
        i.status = this.statuses[i.currentOrderState];
      }
      this.OrdersData.next(orders);
    }, error => {
      console.log(error);
      alert ("Problem getting orders")
    })
  }

  clearOrders(){
    this.OrdersData.next([]);
  }

  deleteOrder(){
    return this.httpClient.delete(this.baseUrl + '/api/deleteorder/' + this.id)
  }

  getOrderHistory() {
     return this.httpClient.get(this.baseUrl + '/api/getorderhistory/' + this.id)
  }

  orderProduct() {
    return this.httpClient.post(this.baseUrl + '/api/orderproduct', this.body)
  }

  receiveOrder() {
    return this.httpClient.put(this.baseUrl + '/api/receiveorder/' + this.id, {})
  }

  assignShipper() {
    return this.httpClient.put(this.baseUrl + '/api/assignshipper/' + this.id + '?shipperid=' + this.shipperid, {})
  }

  createShipment() {
    return this.httpClient.put(this.baseUrl + '/api/createshipment/' + this.id, {})
  }

  transportShipment() {
    return this.httpClient.put(this.baseUrl + '/api/transportshipment/' + this.id, {})
  }

  receiveShipment() {
    return this.httpClient.put(this.baseUrl + '/api/receiveshipment/' + this.id, {})
  }
}
