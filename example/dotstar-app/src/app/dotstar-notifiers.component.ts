import { switchMap, map, skip } from 'rxjs/operators';
import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SocketService } from './socket.service';

@Component({
  selector: 'dotstar-socket-notifier',
  template: '',
})
export class SocketNotifierComponent {
  constructor(
    private snackBar: MatSnackBar,
    private dotstar: SocketService
  ) {
    this.dotstar.socketError.pipe(
      map(error =>
        (error instanceof CloseEvent)
        ? this.snackBar.open(`Connection was closed by the server`, 'Reconnect', {
            panelClass: ['bgc-red', 'c-white'],
            duration: 5000,
            verticalPosition: 'top',
          })
        : this.snackBar.open(`Couldn't connect to the device`, 'Retry', {
            panelClass: ['bgc-red', 'c-white'],
            duration: 5000,
            verticalPosition: 'top',
          })
      ),
      switchMap(ref => ref.onAction())
    )
    .subscribe(() => this.dotstar.retryConnect());

    this.dotstar.connected$.pipe(
      skip(1),
      map(connected =>
        connected
        ? this.snackBar.open(`Connected to Dotstar`, '', {
            panelClass: ['bgc-green', 'c-black'],
            duration: 3000,
            verticalPosition: 'top',
          })
        : this.snackBar.open(`Connection closed`, 'Reconnect', {
            duration: 3000,
            verticalPosition: 'top',
          })
      ),
      switchMap(ref => ref.onAction())
    )
    .subscribe(() => this.dotstar.connect());
  }
}
