import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PubNubAngular } from 'pubnub-angular2';
import { ApiService, UserService } from '../_services/index';

@Component({
  selector: 'app-producer',
  templateUrl: './producer.component.html',
  styleUrls: ['./producer.component.scss'],
  providers: [ PubNubAngular ]
})
export class ProducerComponent implements OnInit {

  messageForm: FormGroup;
  messages: any;
  submitted = false;
  order: Object;
  orders: any;
  orderStateArray = ['ORDER_CREATED','ORDER_RECEIVED','SHIPMENT_CREATED','SHIPMENT_IN_TRANSIT','SHIPMENT_RECEIVED','ORDER_CLOSED'];
  myPubNubInstance: any;
  pubnubChannelName = "priceWatchChannel-gen";
  bcChannelName = "bcEventsChannel-gen";

  currentUser: any;

  constructor(private formBuilder: FormBuilder, private api: ApiService, private user: UserService, private cd: ChangeDetectorRef) { }

  ngOnInit() {
    this.currentUser = this.user.getCurrentUser();

    this.messageForm = this.formBuilder.group({
      productid: ['', Validators.required],
      price: ['',Validators.required],
      quantity: ['']
      //, producerid: ['', Validators.required],
    });

    this.myPubNubInstance = new PubNubAngular();
    this.messages = [];

    var temp = this.myPubNubInstance.init({
      publishKey: "pub-c-736b3de9-095f-4e98-8734-d6a36c6715a6",
      subscribeKey: "sub-c-8402da08-6ab9-11e9-81d5-56c3556875f9"
    });
    console.log("returned value from init: " + temp.toString() + ";  " + typeof (temp));

    this.myPubNubInstance.subscribe({
      channels: [this.bcChannelName, this.pubnubChannelName],
      withPresence: true,
      triggerEvents: true
    });

    this.myPubNubInstance.getMessage(this.bcChannelName, (msg) => {
      this.messages.push(msg);
      this.api.queryOrders();
      console.log(msg);
    });

    this.myPubNubInstance.getMessage(this.pubnubChannelName, (msg) => {
      this.api.queryOrders();
      console.log(msg);
    });

    // First time around, don't want error message to appear
    //if (!this.order) { this.order = {errorCode:1};}
  }

  onSubmit() {
    this.submitted = true;

    if (this.messageForm.invalid) {
        return;
    }

    let titleStr = "pubNub Message Title";
    let descStr = "pubNub Message Description";
    console.log (this.messageForm.controls.price.value);
    if ((this.messageForm.controls.quantity.value!=="")&&(this.messageForm.controls.quantity.value!==null)) {
      titleStr = "Quantity Watch Alert";
      descStr = '{"eventType":"quantityWatch","productId":"'+this.messageForm.controls.productid.value
                +'","quantity":'+this.messageForm.controls.quantity.value
                +',"price":'+this.messageForm.controls.price.value
                //+',"producerId":"'+this.messageForm.controls.producerid.value+'"}';
                +',"producerId":"'+this.currentUser.userid+'"}';

   } else {
      titleStr = "Price Watch Alert";
      descStr = '{"eventType":"priceWatch","productId":"' + this.messageForm.controls.productid.value
                +'","price":' + this.messageForm.controls.price.value
                +',"producerId":"' + this.currentUser.userid+'"}';
    }
    this.publishMsg(titleStr, descStr, this.pubnubChannelName);
    alert("Price/Quantity Change message published successfully")
    //if (!this.order) { this.order = {errorCode:0}; }
  }

  publishMsg (msgTitle, msgDescription, channelName) {

    if (this.myPubNubInstance == undefined) {
      console.log("this.myPubNubInstance is undefined");
    }
    if (this.myPubNubInstance.status == undefined) {
      console.log("this.myPubNubInstance.status is undefined");
    }
    console.log(this.myPubNubInstance.status);

    this.myPubNubInstance.publish(
      {
        message: {
          such: 'what is this used for?',
          title: msgTitle,
          description: msgDescription
        },
        channel: channelName
      },
      function (status, response) {
        if (status.error) {
          console.log(status);
        }
        else {
          console.log("message publish at time: "+ response.timetoken);
        }
      });
    }

  recOrderClicked(orderid) {

    this.api.id = orderid;
    console.log (this.api.id)
    this.api.receiveOrder().subscribe(api => {
      this.order = api;
      console.log (this.order);

      let descStr = '{"eventType":"orderReceived","orderId":"'+orderid+'"}';
      this.publishMsg("OrderReceived", descStr, this.pubnubChannelName);

      this.api.queryOrders();
    }, error => {
      alert ("Problem receiving order")
    })
  }

  createShpmtClicked(orderid) {

    this.api.id = orderid;
    console.log (this.api.id)

    this.api.createShipment().subscribe(api => {
      this.order = api
      console.log(this.order)

      // Post message on pubnub for other participants
      let descStr = '{"eventType":"shipmentCreated","orderId":"'+orderid+'"}';
      this.publishMsg("Shipment Created", descStr, this.pubnubChannelName);

      // update local order table
      this.api.queryOrders();
    }, error => {
      alert("Problem creating shipment")
    })
  }

  handleMsg(msg) {
    //  Parse the JSON data to a javascript object
    console.log("messageData" + msg);

    var messageData = JSON.parse(msg);
    let descStr;

    switch (messageData.eventType) {
      case "shipmentReceived":
        descStr = "Shipment received for order " + messageData.orderId;
        console.log(descStr);
        break;
      default:
        descStr = "Pubnub message received";
        break;
    }
    return descStr;
  }

}
