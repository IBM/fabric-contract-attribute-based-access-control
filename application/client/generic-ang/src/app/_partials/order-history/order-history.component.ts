import { Component, Input, OnInit, ChangeDetectorRef } from '@angular/core';
// import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from './../../_services/index';
import { PubNubAngular } from 'pubnub-angular2';
// import { DomElementSchemaRegistry } from '@angular/compiler';

@Component({
  selector: 'order-history',
  templateUrl: './order-history.component.html',
  styleUrls: ['./order-history.component.scss'],
  providers: [ PubNubAngular ]
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
        console.log(history);
        this.history = history;
      }, error => {
        alert ("Problem getting order history. Either order doesn't exist or isn't in the ORDER_RECEIVED state");
        console.log(error);
      });
    }
  }

  getHistory(id){
    console.log(id);
    this.api.id = id;
    this.api.getOrderHistory().subscribe(history => {
      console.log(history);
      this.history = history;
    }, error => {
      alert ("Problem getting order history. Either order doesn't exist or isn't in the ORDER_RECEIVED state");
      console.log(error);
    });
  }


}
