import { switchMap, map } from 'rxjs/operators';
import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material';
import { DotstarService } from './dotstar.service';

@Component({
  selector: 'dotstar-socket-notifier',
  template: '',
})
export class DotstarSocketNotifierComponent {
  constructor(
    private snackBar: MatSnackBar,
    private dotstar: DotstarService
  ) {
    this.dotstar.socketError.pipe(
      map(error =>
        this.snackBar.open(`Couldn't connect to the device`, 'Retry', {
          panelClass: ['bgc-red', 'c-white'],
          duration: 5000,
        })
      ),
      switchMap(ref => ref.onAction())
    )
    .subscribe(() => this.dotstar.retryConnect());
  }
}

// @Component({
//   selector: 'ape-dotstar-paired-notifier',
//   template: '',
// })
// export class MyoPairedNotifierComponent {
//   constructor(
//     private snackBar: MatSnackBar,
//     private dotstar: DotstarService
//   ) {
//     this.dotstar.demuxed.paired.pipe(
//       map(error =>
//         this.snackBar.open(`Device has been paired`, '', {
//           panelClass: ['bgc-blue', 'c-white'],
//           // verticalPosition: 'top',
//           duration: 3000,
//         })
//       )
//     )
//     .subscribe(); // () => this.dotstar.retryConnect());
//   }
// }

// @Component({
//   selector: 'ape-dotstar-disconnected-notifier',
//   template: '',
// })
// export class MyoDisconnectedNotifierComponent {
//   constructor(
//     private snackBar: MatSnackBar,
//     private dotstar: DotstarService
//   ) {
//     this.dotstar.disconnected.pipe(
//       map(() =>
//         this.snackBar.open(`Device was disconnected`, 'Reconnect', {
//           panelClass: ['bgc-blue', 'c-white'],
//           // verticalPosition: 'top',
//           duration: 3000,
//         })
//       ),
//       switchMap(ref => ref.onAction())
//     )
//     .subscribe(() => this.dotstar.connect());
//   }
// }
