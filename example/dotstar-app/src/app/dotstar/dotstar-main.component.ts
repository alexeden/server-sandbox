import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';

@Component({
  selector: 'dotstar-main',
  templateUrl: './dotstar-main.component.html',
  styleUrls: ['./dotstar-main.component.scss'],
})
export class DotstarMainComponent implements OnInit, OnDestroy {
  private readonly unsubscribe$ = new Subject<any>();

  ngOnInit() {
    //
  }

  ngOnDestroy() {
    this.unsubscribe$.next('unsubscribe!');
    this.unsubscribe$.unsubscribe();
  }
}
