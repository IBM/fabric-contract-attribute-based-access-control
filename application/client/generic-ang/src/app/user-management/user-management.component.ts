import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService, AuthService } from '../_services/index';

import {MatTableDataSource} from '@angular/material/table';
import {animate, state, style, transition, trigger} from '@angular/animations';

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss'],
  providers: [],
})

export class UserManagementComponent implements OnInit{
  newUser: Object;
  roles: any[];

  newUserForm: FormGroup;
  submitted = false;

  allUsers: MatTableDataSource<EditUser[]>;
  columnsToDisplay = ['id', 'approle', 'registered'];

  constructor(private api: ApiService, private auth: AuthService, private formBuilder: FormBuilder){}

  ngOnInit(){
    this.roles = ["retailer", "producer", "shipper", "customer", "regulator"];

    this.newUserForm = this.formBuilder.group({
      id: ['', Validators.required],
      password: ['', Validators.required],
      confirm_password: ['', Validators.required],
      approle: ['', Validators.required]
    });

    // get all users
    this.loadUserList(0);
    
    // First time around, don't want error message to appear
    if (!this.newUser) { this.newUser = {errorCode:1};}
  }

  onSubmit(){
    this.submitted = true;

    if (this.newUserForm.invalid) {
      return;
    }

    if(this.newUserForm.controls.password.value != this.newUserForm.controls.confirm_password.value){
      console.log("the passwords don't match");
      this.newUser = {errorCode:0};
      return;
    }

    var user = {
      userid: this.newUserForm.controls.id.value,
      password: this.newUserForm.controls.password.value,
      approle: this.newUserForm.controls.approle.value,
    }

    this.auth.register(user).subscribe(res => {
      console.log (res);
      // this.newUser = res;
    }, error => {
      console.log(error)
      alert ("Problem creating User")
    })

    if (!this.newUser) { this.newUser = {errorCode:0}; }
  }

  loadUserList(tab) {
    if (tab == 0) {
      this.api.getAllUsers().subscribe(res => {
        // for debugging
        // console.log(res);
        var userArray = Object.keys(res).map(function (userIndex) {
          let user = res[userIndex];
          // do something with person
          return user;
        });
        for (let user of userArray) {
          this.api.id = user.id;
          this.api.isUserEnrolled().subscribe(res => {
            // For debugging
            // console.log(res);
            // NOTE: adding a new user attribute called registered
            user.registered = res;
          }, error => {
            console.log(error);
          });
        }
        this.allUsers = new MatTableDataSource(userArray);
      }, error => {
        console.log(error);
        alert("Problem loading user list.")
      });
    }
  }
}

export interface EditUser {
  id: string;
  approle: string;
}
