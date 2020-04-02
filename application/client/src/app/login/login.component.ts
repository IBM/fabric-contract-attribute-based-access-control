import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService, UserService } from '../_services/index';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  providers: []
})

export class LoginComponent{
  model: any = {};
  loading = false;
  returnUrl: string;

  constructor(
    private router: Router,
    private apiService: ApiService,
    private userService: UserService
  ) { }

  login() {
    console.log("In login ()");
    this.loading = true;

    var user = {
      userid: this.model.userid,
      password: this.model.password,
      usertype: ""
    }

    this.apiService.id = this.model.userid;
    this.apiService.pwd = this.model.password;
    
    this.apiService.getUser().subscribe(res => {
      if (res['errorcode']==0) {
        user.usertype = res['usertype'];
        this.userService.setCurrentUser(user);
        localStorage.setItem('currentUser', JSON.stringify(user));
        if (res['usertype'] == "admin") {
          this.router.navigate(['users']);
        } else {
          this.router.navigate([res['usertype']]);
        }
      } else if (res['errorcode'] == 402) {
        // Enroll user!
        alert(res['errormessage'] + "\n \nPlease make sure that an administrator has registered this user and that the user has enrolled.");
        this.router.navigate(['enroll']);
      } else {
        alert("Either "+res['userid']+" needs to be registered or enrolled before they are able to log in \n \n -OR- \n \n double check the spelling of the userid and password.");
        this.router.navigate(['enroll']);
      }
    }, error => {
      console.log(error);
      alert("Login failed.");
      this.loading = false;
    });
  }
}
