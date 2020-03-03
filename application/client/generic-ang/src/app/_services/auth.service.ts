import { Injectable } from '@angular/core';
import { HttpClient} from '@angular/common/http';
// import { BehaviorSubject, Observable } from '../../../node_modules/rxjs';
import { User } from '../_models/user';
import { ApiService } from './api.service';
import { UserService } from './user.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Use if testing without connecting to a blockchain service
  // users: User[];

  constructor(private httpClient: HttpClient,private api: ApiService, private userService: UserService, private router: Router) {
    // get all users in fake database. Use if testing without connecting to a blockchain service
    // this.users = userService.getAll();
  }

  register(user){
    // console.log("Inside Register: "+user);
    return this.httpClient.post('http://localhost:3000/api/registeruser', user);
  }

  enroll(user){
    // console.log("Inside Enroll: "+user);
    return this.httpClient.post('http://localhost:3000/api/enrolluser', user);
  }

  login(userid: string, password: string) {
    // console.log("Inside Login: "+userid);
    return this.httpClient.get('http://localhost:3000/api/login?'+"userid=" + userid + "&password=" + password);
  }

  logout() {
    this.api.clearOrders();
    // remove user from local storage to log user out
    this.userService.clearCurrentUser();
    localStorage.removeItem('currentUser');
    this.router.navigate(['/login']);
  }

}
