import { Component, OnInit } from '@angular/core';
import { UserService } from '../_services/index';
import { PubNubAngular } from 'pubnub-angular2';

@Component({
  selector: 'app-customer',
  templateUrl: './customer.component.html',
  styleUrls: ['./customer.component.scss'],
  providers: [ PubNubAngular ]
})

export class CustomerComponent implements OnInit {

  currentUser: any;

  constructor(private user: UserService) { }

  ngOnInit() {
    this.currentUser = this.user.getCurrentUser();
  }
}
