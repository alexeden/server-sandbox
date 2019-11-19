import { Component, Inject } from '@angular/core';
import { ROUTES, Route } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: [ './app.component.scss' ],
})
export class AppComponent {
  readonly dotstarRoutes: Route[];

  constructor(
    @Inject(ROUTES) public injectedRoutes: Route[][]
  ) {
    this.dotstarRoutes = this.injectedRoutes[0];
  }
}
