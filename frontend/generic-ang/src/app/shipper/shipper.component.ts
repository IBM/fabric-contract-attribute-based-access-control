import { Component, OnInit } from '@angular/core';
import { UserService } from '../_services/index';

@Component({
  selector: 'app-shipper',
  templateUrl: './shipper.component.html',
  styleUrls: ['./shipper.component.scss']
})

export class ShipperComponent implements OnInit {
  
  currentUser: any;

  constructor(private user: UserService) { }

  ngOnInit() {
    this.currentUser = this.user.getCurrentUser();
  }
}
