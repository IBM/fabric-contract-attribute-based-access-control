import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
// import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from './../../_services/index';
import { PubNubAngular } from 'pubnub-angular2';
// import { DomElementSchemaRegistry } from '@angular/compiler';

@Component({
  selector: 'price-change',
  templateUrl: './price-change.component.html',
  styleUrls: ['./price-change.component.scss'],
  providers: [ PubNubAngular ]
})

export class PriceChangeComponent{}
