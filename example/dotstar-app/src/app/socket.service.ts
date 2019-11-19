import { Injectable } from '@angular/core';
import { Observable, Subject, BehaviorSubject, ConnectableObservable, merge, empty, combineLatest } from 'rxjs';
import { map, switchMap, retryWhen, takeUntil, publishReplay, tap, distinctUntilChanged, sampleTime, scan } from 'rxjs/operators';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { DotstarConstants, Sample } from './lib';
import { DotstarConfig } from 'dotstar-node/dist/types';
import { DotstarDeviceConfigService } from './device-config.service';
import { BufferService } from './buffer.service';


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
export class SocketService {
  private readonly url = new Subject<string>();
  private readonly stopSocket = new Subject<any>();
  private readonly retrySocket = new Subject<any>();

  private readonly txps$ = new BehaviorSubject<number>(DotstarConstants.txpsMin);
  readonly txps: Observable<number>;

  readonly socketError = new Subject<Event>();

  socket: WebSocketSubject<any> | null = null;

  readonly message: ConnectableObservable<DotstarMessage>;
  readonly connected$ = new BehaviorSubject<boolean>(false);

  constructor(
    private configService: DotstarDeviceConfigService,
    private bufferService: BufferService
  ) {
    this.txps = this.txps$.asObservable().pipe(
      map(txps => Math.min(DotstarConstants.txpsMax, Math.max(DotstarConstants.txpsMin, txps)))
    );

    this.message = this.url.pipe(
      switchMap(url => {
        const socket = webSocket<DotstarMessage>(url);
        this.socket = socket;

        return socket.multiplex(
          /* On open */   () => this.connected$.next(true),
          /* On close */  () => this.connected$.next(false),
          /* Filter */    () => true
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


    combineLatest(
      this.connected$.pipe(distinctUntilChanged()),
      this.txps.pipe(distinctUntilChanged())
    )
    .pipe(
      switchMap(([connected, txps]) =>
        !connected
        ? empty()
        : this.bufferService.values.pipe(sampleTime(1000 / txps))
      )
    )
    .subscribe(values => {
      if (this.socket) {
        this.socket.next({ values });
      }
    });

    this.message.connect();
  }

  disconnect() {
    this.stopSocket.next('disconnect!');
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

  setTxps(txps: number) {
    this.txps$.next(txps);
  }
}
