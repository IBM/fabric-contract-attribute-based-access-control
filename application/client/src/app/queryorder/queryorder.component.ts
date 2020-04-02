// NOTE: This component isn't invoked from the UI application at this time.  Provided here in case this functionality is needed
// The api/orders/<orderId> API is invoked directly from URL
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../_services/api.service';
import { AngularWaitBarrier } from 'blocking-proxy/built/lib/angular_wait_barrier';

@Component({
  selector: 'app-contact',
  templateUrl: './queryorder.component.html',
  styleUrls: ['./queryorder.component.scss']
})
export class QueryorderComponent implements OnInit {

  messageForm: FormGroup;
  submitted = false;
  success = false;
  order: Object;

  constructor(private formBuilder: FormBuilder, private api: ApiService) { }

  ngOnInit() {

    this.messageForm = this.formBuilder.group({
      orderid: ['', Validators.required]
    });

    // First time around, don't want error message to appear
    if (!this.order) { this.order = { errorCode: 0 }; }
  }

  onSubmit() {
    this.submitted = true;

    if (this.messageForm.invalid) {
      return;
    }

    this.api.id = this.messageForm.controls.orderid.value;

    this.api.queryOrder().subscribe(api => {
      this.order = api;
      this.order["errorCode"] = 0;
      console.log(this.order)
    }, error => {
      this.order = { errorCode: 1 };
      console.log("Error Querying order",error);
      //alert("Error Querying order");
    });

    if (!this.order) { this.order = { errorCode: 1 }; }
  }
}
