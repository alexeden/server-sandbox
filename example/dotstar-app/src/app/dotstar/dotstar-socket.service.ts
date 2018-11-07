import { Injectable } from '@angular/core';
import { Observable, Subject, BehaviorSubject, ConnectableObservable, merge } from 'rxjs';
import { map, switchMap, retryWhen, takeUntil, publishReplay, tap } from 'rxjs/operators';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { DotstarConstants, Sample } from './lib';
import { DotstarConfig } from 'dotstar-node/dist/types';
import { DotstarConfigService } from './dotstar-config.service';


enum DotstarMessageType {
  Closed = 'closed',
  Config = 'config',
  Opened = 'opened',
  Values = 'values',
}

interface DotstarValues {
  values: number[];
}

type DotstarMessage
  = { type: DotstarMessageType.Closed }
  | { type: DotstarMessageType.Config, data: DotstarConfig }
  | { type: DotstarMessageType.Opened }
  | { type: DotstarMessageType.Values, data: DotstarValues };

@Injectable()
export class DotstarSocketService {
  private readonly url = new Subject<string>();
  private readonly stopSocket = new Subject<any>();
  private readonly retrySocket = new Subject<any>();

  // BPS: Broadcasts per second
  private readonly bps$ = new BehaviorSubject<number>(DotstarConstants.bpsMin);
  readonly bps: Observable<number>;

  readonly socketError = new Subject<Event>();

  socket: WebSocketSubject<any> | null = null;

  readonly message: ConnectableObservable<DotstarMessage>;
  readonly connected$ = new BehaviorSubject<boolean>(false);

  constructor(
    private configService: DotstarConfigService
  ) {
    (window as any).dotstar = this;

    this.bps = this.bps$.asObservable().pipe(
      map(bps => Math.min(DotstarConstants.bpsMax, Math.max(DotstarConstants.bpsMin, bps)))
    );


    this.message = this.url.pipe(
      switchMap<string, DotstarMessage>(url => {
        const socket = webSocket<DotstarMessage>(url);
        this.socket = socket;

        return socket.multiplex(
          // On open
          () => this.connected$.next(true),
          // On close
          () => this.connected$.next(false),
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
      publishReplay(1)
    ) as ConnectableObservable<DotstarMessage>;

    this.message.connect();
  }

  disconnect() {
    this.stopSocket.next('disconnect!');
  }

  sendSamples(values: Sample[]) {
    if (this.socket) {
      this.socket.next({ values });
    }
  }

  connect(url = DotstarConstants.url) {
    if (!this.connected$.getValue()) {
      const query = this.configService.getConnectionQuery();
      this.url.next(`${url}${query}`);
    }
  }

  retryConnect() {
    this.retrySocket.next('retrying');
  }

  setBroadcastsPerSecond(bps: number) {
    this.bps$.next(bps);
  }
}
