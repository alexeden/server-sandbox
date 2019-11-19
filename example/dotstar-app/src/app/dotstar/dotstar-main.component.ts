import { Component, Inject } from '@angular/core';
import { ROUTES, Route } from '@angular/router';

@Component({
  selector: 'dotstar-main',
  templateUrl: './dotstar-main.component.html',
  styleUrls: ['./dotstar-main.component.scss'],
})
export class DotstarMainComponent {
  readonly dotstarRoutes: Route[];

  constructor(
    @Inject(ROUTES) public injectedRoutes: Route[][]
  ) {
    const dotstarParentRoute = this.injectedRoutes[0].find(r => r.path === 'dotstar');
    if (!dotstarParentRoute) throw new Error(`No parent route wth path "/dotstar" found!`);
    this.dotstarRoutes = (dotstarParentRoute.children || []).filter(r => r.path!.length > 0);
  }
}
