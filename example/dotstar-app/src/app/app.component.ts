import { Component, Inject } from '@angular/core';
import { ROUTES, Route } from '@angular/router';
import { SocketService } from './socket.service';
import { AnimationClockService } from './animation-clock.service';

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
    readonly clock: AnimationClockService
  ) {
    this.dotstarRoutes = this.injectedRoutes[0];
  }
}
