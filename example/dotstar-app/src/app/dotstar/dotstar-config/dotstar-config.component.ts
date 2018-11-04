import { Subject } from 'rxjs';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { DotstarService } from '../dotstar.service';
import { DotstarConstants } from '../lib';
import { FormGroup, FormBuilder } from '@angular/forms';

@Component({
  selector: 'dotstar-config',
  templateUrl: './dotstar-config.component.html',
  styleUrls: ['./dotstar-config.component.scss'],
})
export class DotstarConfigComponent implements OnInit, OnDestroy {
  private readonly unsubscribe$ = new Subject<any>();

  readonly configForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dotstarService: DotstarService
  ) {
    this.configForm = this.fb.group({
      url: this.fb.control(DotstarConstants.url),
      length: this.fb.control(144),
    });
  }

  ngOnInit() {
  }

  disconnect() {
    this.dotstarService.disconnect();
  }

  connect() {
    const { url } = this.configForm.value;
    this.dotstarService.connect(url);
  }

  ngOnDestroy() {
    this.unsubscribe$.next('unsubscribe!');
    this.unsubscribe$.unsubscribe();
  }
}
