import { Injectable } from '@angular/core';
import { Observable, Subject, BehaviorSubject, ConnectableObservable, merge } from 'rxjs';
import { mapTo, map, pluck, filter, switchMap, retryWhen, takeUntil, publishReplay } from 'rxjs/operators';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';

enum DotstarMessageType {
  Closed = 'closed',
  Config = 'config',
  Opened = 'opened',
  Values = 'values',
}

interface DotstarValues {
  values: number[];
}

interface DotstarConfig {
  length: number;
}

type DotstarMessage
  = { type: DotstarMessageType.Closed }
  | { type: DotstarMessageType.Config, data: DotstarConfig }
  | { type: DotstarMessageType.Opened }
  | { type: DotstarMessageType.Values, data: DotstarValues };

@Injectable()
export class DotstarService {
  private readonly url = new Subject<string>();
  private readonly stopSocket = new Subject<any>();
  private readonly retrySocket = new Subject<any>();

  readonly socketError = new Subject<Event>();

  socket: WebSocketSubject<DotstarMessage> | null = null;

  readonly message: ConnectableObservable<DotstarMessage>;
  readonly latestSocket = new BehaviorSubject<WebSocketSubject<DotstarMessage> | null>(null);
  private readonly disconnected = new Subject<any>();
  readonly isConnected: Observable<boolean>;


  constructor(

  ) {
    this.message = this.url.pipe(
      switchMap<string, DotstarMessage>(url => {
        const socket = webSocket<DotstarMessage>(url);
        this.socket = socket;

        return socket.multiplex(
          // On open
          () => console.log('multiplex sub!'),
          // On close
          () => this.disconnected.next(true),
          // Message filter
          () => true
        )
        .pipe(
          retryWhen(error => {
            error.subscribe(this.socketError);
            return this.retrySocket;
          }),
          takeUntil(this.stopSocket)
        );
      }),
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
