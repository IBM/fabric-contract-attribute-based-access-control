import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { UserService } from '../_services/index';

@Component({
  selector: 'app-regulator',
  templateUrl: './regulator.component.html',
  styleUrls: ['./regulator.component.scss'],
  providers: [ ]
})

export class RegulatorComponent implements OnInit {

  currentUser: any;

  constructor(private user: UserService) { }

  ngOnInit() {
    this.currentUser = this.user.getCurrentUser();
  }
}
