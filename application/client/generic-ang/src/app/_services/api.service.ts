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
    return this.httpClient.get(this.baseUrl + '/api/users');
  }

  isUserEnrolled(){
    return this.httpClient.get(this.baseUrl + '/api/is-user-enrolled/' + this.id);
  }

  queryOrder() {
    return this.httpClient.get(this.baseUrl + '/api/orders/' + this.id)
  }

  queryOrders(userid, password) {
    console.log ("In queryOrders: " +userid+", "+password);

    this.httpClient.get<any[]>(this.baseUrl + '/api/orders/?userid='+userid+'&password='+password).subscribe (orders => {
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
    console.log ("deleting order: " + this.baseUrl + '/api/orders/' + this.id)
    return this.httpClient.delete(this.baseUrl + '/api/orders/' + this.id)
  }

  getOrderHistory() {
     return this.httpClient.get(this.baseUrl + '/api/order-history/' + this.id)
  }

  orderProduct() {
    return this.httpClient.post(this.baseUrl + '/api/orders', this.body)
  }

  receiveOrder() {
    return this.httpClient.put(this.baseUrl + '/api/receive-order/' + this.id, {})
  }

  assignShipper() {
    return this.httpClient.put(this.baseUrl + '/api/assign-shipper/' + this.id + '?shipperid=' + this.shipperid, {})
  }

  createShipment() {
    return this.httpClient.put(this.baseUrl + '/api/create-shipment-for-order/' + this.id, {})
  }

  transportShipment() {
    return this.httpClient.put(this.baseUrl + '/api/transport-shipment/' + this.id, {})
  }

  receiveShipment() {
    return this.httpClient.put(this.baseUrl + '/api/receive-shipment/' + this.id, {})
  }
}
