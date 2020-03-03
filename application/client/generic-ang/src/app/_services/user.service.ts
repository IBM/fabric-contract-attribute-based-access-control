import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
// import { ApiService } from './api.service'
import { User } from '../_models/user';

@Injectable()
export class UserService {
  // For testing without connecting to a blockchain network
  // users: User[];
  currentUser: User;

  id: String = "";
  body: Object;
  options: Object;

  constructor(private http: HttpClient) {
    // initialize users - for testing without connecting to a blockchain network
    // this.users = [
    //   {"userid": "kai", "password": "test123", "role": "admin"},
    //   {"userid": "producer1", "password": "test123", "role": "producer"},
    //   {"userid": "retailer1", "password": "test123", "role": "retailer"},
    //   {"userid": "shipper1", "password": "test123", "role": "shipper"},
    //   {"userid": "regulator1", "password": "test123", "role": "regulator"},
    //   {"userid": "customer", "password": "test123", "role": "customer"},
    // ];
    //
    // this.currentUser = {
    //   userid: "admin",
    //   password: "adminpw",
    //   approle: "admin"
    // }
    let user = localStorage.getItem('currentUser');
    if(user){
      // For debugging:
      // console.log("user: " + user);
      this.currentUser = JSON.parse(user);
    }
  }

  setCurrentuser(user) {
    this.currentUser = user;
  }

  getCurrentUser(){

    console.log("in getCurrentUseruser, this.currentUser: " + this.currentUser.userid);
    return this.currentUser;
  }

  clearCurrentUser(){
    this.currentUser = null;
  }
}
