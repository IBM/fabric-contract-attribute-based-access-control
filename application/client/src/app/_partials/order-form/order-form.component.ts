import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService, UserService } from './../../_services/index';
import { MatDialog } from '@angular/material';

@Component({
  selector: 'order-form',
  templateUrl: './order-form.component.html',
  styleUrls: ['./order-form.component.scss']
})

export class OrderFormComponent implements OnInit {
  messageForm: FormGroup;
  submitted = false;
  success = false;
  order: Object;
  messages: String[];
  currentUser: any;
  producerId: String;
  producers: any[];

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private api: ApiService,
    private user: UserService,
    public dialog: MatDialog) { }

  ngOnInit() {
    this.currentUser = this.user.getCurrentUser();

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

    this.api.body = {
      orderId: "order-" + uuid(),
      productId: this.messageForm.controls.productid.value,
      price: this.messageForm.controls.price.value,
      quantity: this.messageForm.controls.quantity.value,
      producerId: this.messageForm.controls.producerid.value,
      retailerId: this.currentUser.userid
    }

    this.api.orderProduct().subscribe(api => {
      this.order = api
      console.log(this.order);
      this.api.queryOrders();
      this.success = true;
      //alert ("Order Created Successfully!")
    }, error => {
      this.success = false;
      alert("Problem creating Order: " + error['error']['message'])
    })
  }

  // Get the list of registered Producers
  getProducers() {
    this.producers = [];
    this.api.getAllUsers().subscribe(allUsers => {
      var userArray = Object.keys(allUsers).map(function (userIndex) {
        let user = allUsers[userIndex];
        // do something with person
        return user;
      });

      for (let u of userArray) {
        if (u['usertype'] == "producer") {
          this.producers.push(u);
        }
      }
      console.log("List of Producers: ");
      console.log(this.producers);
    }, error => {
      console.log(JSON.stringify(error));
      alert("Problem getting list of users: " + error['error']['message']);
    });
  }
}

// Generate a random number to create orderId
function uuid() {
  const s4 = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1)
  return `${s4()}`
}

