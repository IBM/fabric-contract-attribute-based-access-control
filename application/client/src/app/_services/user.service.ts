import { Injectable } from '@angular/core';
import { User } from '../_models/user';

@Injectable()
export class UserService {
  // For testing without connecting to a blockchain network
  // users: User[];
  currentUser: User;

  id: String = "";
  body: Object;
  options: Object;

  constructor() {
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
    //   usertype: "admin"
    // }
    let user = localStorage.getItem('currentUser');
    if (user){
      this.currentUser = JSON.parse(user);
    }
  }

  setCurrentUser(user) {
    this.currentUser = user;
  }

  getCurrentUser() {
    //console.log("in getCurrentUser, this.currentUser: " + this.currentUser.userid);
    return this.currentUser;
  }

  clearCurrentUser() {
    this.currentUser = null;
  }
}
