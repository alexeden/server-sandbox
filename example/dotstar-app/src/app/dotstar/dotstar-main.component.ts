import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { Subject } from 'rxjs';
import { ROUTES, Route } from '@angular/router';

@Component({
  selector: 'dotstar-main',
  templateUrl: './dotstar-main.component.html',
  styleUrls: ['./dotstar-main.component.scss'],
})
export class DotstarMainComponent implements OnInit, OnDestroy {
  private readonly unsubscribe$ = new Subject<any>();
  readonly dotstarRoutes: Route[];

  constructor(
    @Inject(ROUTES) public injectedRoutes: Route[][]
  ) {
    const dotstarParentRoute = this.injectedRoutes[0].find(r => r.path === 'dotstar');

    if (!dotstarParentRoute) {
      throw new Error(`No parent route wth path "/dotstar" found!`);
    }

    this.dotstarRoutes = (dotstarParentRoute.children || []).filter(r => r.path.length > 0);
  }

  ngOnInit() {
    //
  }

  ngOnDestroy() {
    this.unsubscribe$.next('unsubscribe!');
    this.unsubscribe$.unsubscribe();
  }
}
