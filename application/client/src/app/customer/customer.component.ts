import { Component, OnInit } from '@angular/core';
import { UserService } from '../_services/index';

@Component({
  selector: 'app-customer',
  templateUrl: './customer.component.html',
  styleUrls: ['./customer.component.scss'],
  providers: [ ]
})

export class CustomerComponent implements OnInit {

  currentUser: any;

  constructor(private user: UserService) { }

  ngOnInit() {
    this.currentUser = this.user.getCurrentUser();
  }
}
