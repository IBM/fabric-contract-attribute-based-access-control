import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { EnrollComponent } from './enroll/enroll.component';
import { CustomerComponent } from './customer/customer.component';
import { ProducerComponent } from './producer/producer.component';
import { QueryorderComponent } from './queryorder/queryorder.component';
import { RegulatorComponent } from './regulator/regulator.component';
import { RetailerComponent } from './retailer/retailer.component';
import { ShipperComponent } from './shipper/shipper.component';
import { UserManagementComponent } from './user-management/user-management.component';

import { AuthGuard } from './_guards/auth.guard';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'enroll', component: EnrollComponent },
  // Main Pages
  { path: 'customer', component: CustomerComponent, canActivate: [AuthGuard] },
  { path: 'producer', component: ProducerComponent, canActivate: [AuthGuard] },
  { path: 'queryorder', component: QueryorderComponent },
  { path: 'regulator', component: RegulatorComponent, canActivate: [AuthGuard] },
  { path: 'retailer', component: RetailerComponent, canActivate: [AuthGuard] },
  { path: 'shipper', component: ShipperComponent, canActivate: [AuthGuard] },
  { path: 'users', component: UserManagementComponent, canActivate: [AuthGuard] },

  // otherwise redirect to login
  { path: '**', redirectTo: '/login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
