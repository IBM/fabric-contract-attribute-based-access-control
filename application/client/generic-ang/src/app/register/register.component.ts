import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../_services/index';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  providers: []
})

export class RegisterComponent{
  model: any = {};
  loading = false;
  types: any[];

  constructor (private router: Router,private authService: AuthService) {
    this.types = ["retailer", "producer", "shipper", "customer", "regulator"];
  }

  register() {
    this.loading = true;
    this.authService.enroll(this.model).subscribe(data => {
      // console.log(data);
      alert("Registration was successful. User can log in to be taken to their portal.");
      this.router.navigate(['/login']);
    }, error => {
      this.loading = false;
      alert("Something went wrong and we were unable to register you correctly." + '\n \n' + "Please be sure that an app administrater has created you in our blockchain app first BEFORE registering.");
    });
  }
}
