import { Component, Inject } from '@angular/core';
import { ROUTES, Route } from '@angular/router';
import { SocketService } from './socket.service';
import { ClockService } from './clock.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: [ './app.component.scss' ],
})
export class AppComponent {
  readonly dotstarRoutes: Route[];

  constructor(
    @Inject(ROUTES) public injectedRoutes: Route[][],
    readonly socketService: SocketService,
    readonly clock: ClockService
  ) {
    this.dotstarRoutes = this.injectedRoutes[0].filter(route => route.path && route.path.length > 0);
  }
}
