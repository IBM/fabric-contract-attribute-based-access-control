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
    this.loading = true;
    var user = {
      userid: this.model.userid,
      password: this.model.password,
      usertype: ""
    }
    this.apiService.id = this.model.userid;
    this.apiService.getUser().subscribe(res => {
      console.log(res);
      if (res['errorcode']==0) {
        user.usertype = res['usertype'];
        console.log (user)
        this.userService.setCurrentUser(user);

        localStorage.setItem('currentUser', JSON.stringify(user));
        if (res['usertype'] == "admin") {
          this.router.navigate(['users']);
        } else {
          this.router.navigate([res['usertype']]);
        }
      } else if (res['errorcode'] == 402){
        // Enroll user!
        console.log("enroll user");
        alert(res['errormessage'] + "\n \nPlease make sure that an administrator has registered you and that you've enrolled.");
        this.router.navigate(['enroll']);
      } else {
        alert("Either you need to be registered or enrolled first before you are able to log in \n \n -OR- \n \n you should double check the spelling of the userid and password.");
      }
    }, error => {
      console.log(error);
      alert("Login failed.");
      this.loading = false;
    });
  }
}
