import { Component, Input, OnInit } from '@angular/core';
import { ApiService } from './../../_services/index';

@Component({
  selector: 'order-history',
  templateUrl: './order-history.component.html',
  styleUrls: ['./order-history.component.scss']
})

export class OrderHistoryComponent implements OnInit{
  history: any;
  displayedColumns: string[] = ['ProductId', 'ModifiedBy', 'CurrentOrderState', 'Timestamp'];
  @Input() orderId: string;
  statuses: any;

  constructor(private api: ApiService){}
  ngOnInit(){
    this.statuses = this.api.getAllStatuses();

    if (this.orderId) {
      console.log("OrderId: "+this.orderId);
      this.api.id = this.orderId;
      this.api.getOrderHistory().subscribe(history => {
        //console.log(history);
        this.history = history;
      }, error => {
        console.log(JSON.stringify(error));
        alert("Problem getting order history: " + error['error']['message']);
      });
    }
  }

  getHistory(id){
    console.log(id);
    this.api.id = id;
    this.api.getOrderHistory().subscribe(history => {
      //console.log(history);
      this.history = history;
    }, error => {
      console.log(JSON.stringify(error));
      alert("Problem getting order history: " + error['error']['message']);
    });
  }


}
