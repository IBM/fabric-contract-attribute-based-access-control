import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService, UserService } from './../../_services/index';
import { PubNubAngular } from 'pubnub-angular2';
import { MatDialog } from '@angular/material';

@Component({
  selector: 'order-form',
  templateUrl: './order-form.component.html',
  styleUrls: ['./order-form.component.scss'],
  providers: [ PubNubAngular ]
})

export class OrderFormComponent implements OnInit{
  messageForm: FormGroup;
  submitted = false;
  order: Object;
  messages: String[];
  myPubNubInstance: any;
  pubnubChannelName = "priceWatchChannel-gen";
  currentUser: any;
  producerId: String;
  producers: any[];

  constructor(private formBuilder: FormBuilder, private api: ApiService, private user: UserService, public dialog: MatDialog){}

  ngOnInit() {
    this.currentUser = this.user.getCurrentUser();

    this.myPubNubInstance = new PubNubAngular();
    this.messages = [];

    var temp = this.myPubNubInstance.init({
      publishKey: "pub-c-736b3de9-095f-4e98-8734-d6a36c6715a6",
      subscribeKey: "sub-c-8402da08-6ab9-11e9-81d5-56c3556875f9"
    });

    this.myPubNubInstance.subscribe({
      channels: [this.pubnubChannelName],
      withPresence: true,
      triggerEvents: true
    });

    this.myPubNubInstance.getMessage(this.pubnubChannelName, (msg) => {
      //this.messages.push(msg);
      const descStr = this.handleMsg(msg.message.description);
      console.log(descStr);
      this.messages.push(descStr);
      this.api.queryOrders();
      console.log(msg);
    });

    this.getProducers();

    this.messageForm = this.formBuilder.group({
      productid: ['', Validators.required],
      price: ['', Validators.required],
      quantity: ['', Validators.required],
      producerid: ['', Validators.required]
    });

  }

  onSubmit() {
    this.submitted = true;

    if (this.messageForm.invalid) {
      return;
    }

    this.api.body = { orderId: "order"+uuid(),
                      productId: this.messageForm.controls.productid.value,
                      price: this.messageForm.controls.price.value,
                      quantity: this.messageForm.controls.quantity.value,
                      producerId: this.messageForm.controls.producerid.value,
                      retailerId: this.currentUser.userid}

    this.api.orderProduct().subscribe(api => {
      this.order = api
      console.log (this.order);
      this.api.queryOrders();
      alert ("Order Created Successfully!")
    }, error => {
      alert ("Problem creating Order")
    })
  }

  // Get the list of registered Producers
  getProducers() {
    this.producers = [];
    this.api.getAllUsers().subscribe(allUsers => {
      console.log(allUsers);
      var userArray = Object.keys(allUsers).map(function(userIndex){
          let user = allUsers[userIndex];
          // do something with person
          return user;
      });

      for (let u of userArray) {
        if (u['usertype'] == "producer") {
          this.producers.push(u);
        }
      }
      console.log(this.producers);
    }, error => {
      console.log(error);
    });
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
          console.log("message publish at time: + response.timetoken");
        }
      });
  }

  handleMsg (msg) {

      //  Parse the JSON data to a javascript object
      console.log ("messageData"+msg);

      var messageData = JSON.parse(msg);
      let descStr;

      switch (messageData.eventType) {
        case "shipmentCreated":
          descStr = "Shipment created for order " + messageData.orderId;
          console.log(descStr);
          break;
        case "orderReceived":
          descStr = "Order accepted " + messageData.orderId;
          console.log(descStr);
          break;
        case "priceWatch":
          descStr = "Price has changed to $" + messageData.price + " for product " + messageData.productId;
          // Set Rule to order Mangos

          if ((messageData.productId == "mango") && (messageData.price <= 5)) {
            this.api.body = {
              orderId: "order" + uuid(),
              productId: messageData.productId,
              price: messageData.price,
              quantity: 10,
              producerId: messageData.producerId,
              retailerId: "c001"
            }
            this.api.orderProduct().subscribe(api => {
              this.order = api
              console.log(this.order);
              this.api.queryOrders();
            }, error => {
              alert("Problem creating Order")
            })
          }
          break;
        case "quantityWatch":
          descStr = "Quantity of " + messageData.quantity +
            " for product " + messageData.productId +
            " at price of $" + messageData.price + " is now available";
          if ((messageData.productId == "tomato") && (messageData.price <= 5) && (messageData.quantity >= 20)) {
            this.api.body = {
              orderId: "order" + uuid(),
              productId: messageData.productId,
              price: messageData.price,
              quantity: 20,
              producerId: messageData.producerId,
              retailerId: "c001"
            }
            this.api.orderProduct().subscribe(api => {
              this.order = api
              console.log(this.order);
              this.api.queryOrders();
            }, error => {
              alert("Problem creating Order")
            })
          }
          break;
        default:
          descStr = messageData.eventType + " for order " + messageData.orderId;
        break;
      }
    return descStr;
  }
}

function uuid() {
  const s4 = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1)
  return `-${s4()}`
}
