import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { UserService } from '../_services/index';
import { PubNubAngular } from 'pubnub-angular2';

@Component({
  selector: 'app-regulator',
  templateUrl: './regulator.component.html',
  styleUrls: ['./regulator.component.scss'],
  providers: [ PubNubAngular ]
})

export class RegulatorComponent implements OnInit {

  currentUser: any;

  constructor(private user: UserService) { }

  ngOnInit() {
    this.currentUser = this.user.getCurrentUser();
  }
}
