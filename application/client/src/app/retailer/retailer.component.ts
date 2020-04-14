import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { UserService } from '../_services/index';

@Component({
  selector: 'app-retailer',
  templateUrl: './retailer.component.html',
  styleUrls: ['./retailer.component.scss'],
  providers: [ ]
})

export class RetailerComponent implements OnInit {

  currentUser: any;

  constructor(private user: UserService) { }

  ngOnInit() {
    this.currentUser = this.user.getCurrentUser();
  }
}
