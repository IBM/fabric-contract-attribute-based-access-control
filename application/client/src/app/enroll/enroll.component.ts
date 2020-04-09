import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../_services/index';

@Component({
  selector: 'app-enroll',
  templateUrl: './enroll.component.html',
  styleUrls: ['./enroll.component.scss'],
  providers: []
})

export class EnrollComponent{
  model: any = {};
  loading = false;
  types: any[];

  constructor (private router: Router,private authService: AuthService) {
    this.types = ["retailer", "producer", "shipper", "customer", "regulator"];
  }

  enroll() {
    this.loading = true;
    this.authService.enroll(this.model).subscribe(data => {
      alert("Enrollment was successful. User can log in to be taken to their portal.");
      this.router.navigate(['/login']);
    }, error => {
      console.log(error);
      this.loading = false;
      alert("Something went wrong and we were unable to enroll you correctly." + '\n \n' + "Please be sure that an app administrater has registered you in our blockchain app first BEFORE enrolling.");
    });
  }
}

