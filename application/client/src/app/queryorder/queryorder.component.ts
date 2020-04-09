// NOTE: This component isn't invoked from the UI application at this time.  
// Provided here in case this functionality is eventually needed in UI
// The api/orders/<orderId> API is invoked directly from URL
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../_services/api.service';

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
  }

  onSubmit() {
    this.submitted = true;

    if (this.messageForm.invalid) {
      return;
    }

    this.api.id = this.messageForm.controls.orderid.value;

    this.api.queryOrder().subscribe(api => {
      this.order = api;
      this.success = true;
      console.log(this.order)
    }, error => {
      this.success = false;
      console.log(JSON.stringify(error));
      alert("Query order failed: " + error['error']['message']);
    });
  }
}
