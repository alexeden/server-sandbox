import { Injectable } from '@angular/core';
import { Observable, Subject, BehaviorSubject, ConnectableObservable, merge } from 'rxjs';
import { mapTo, map, pluck, filter, switchMap, retryWhen, takeUntil, publishReplay } from 'rxjs/operators';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';

type DotstarMessage = any;
type DotstarMessageWrapper = [ 'event', DotstarMessage ];


@Injectable()
export class DotstarService {
  private readonly url = new Subject<string>();
  private readonly stopSocket = new Subject<any>();
  private readonly retrySocket = new Subject<any>();

  readonly socketError = new Subject<Event>();

  socket: WebSocketSubject<DotstarMessage> | null = null;

  readonly message: ConnectableObservable<DotstarMessage>;
  readonly latestSocket = new BehaviorSubject<WebSocketSubject<DotstarMessageWrapper> | null>(null);

  readonly disconnected = new Subject<any>();


  constructor(

  ) {
    this.message = this.url.pipe(
      switchMap(url => {
        const socket = webSocket<DotstarMessageWrapper>(url);
        this.socket = socket;

        return socket.multiplex(
          () => console.log('multiplex sub!'),
          () => this.disconnected.next(true),
          msg => true
        )
        .pipe(
          retryWhen(error => {
            error.subscribe(this.socketError);
            return this.retrySocket;
          }),
          takeUntil(this.stopSocket)
        );
      }),
      map(wrapped => wrapped[1]),
      publishReplay(500)
    ) as ConnectableObservable<DotstarMessage>;

    this.message.connect();
  }


  disconnect() {
    this.stopSocket.next('disconnect!');
  }

  connect(url = 'ws://127.0.0.1:10138/myo/3?appid=com.myo.ape') {
    this.url.next(url);
  }

  retryConnect() {
    this.retrySocket.next('retrying');
  }

}
