import { Injectable } from '@angular/core';
import { Observable, Subject, BehaviorSubject, ConnectableObservable, merge, empty, combineLatest } from 'rxjs';
import { map, switchMap, retryWhen, takeUntil, publishReplay, tap, distinctUntilChanged, sampleTime, scan } from 'rxjs/operators';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { DotstarConstants, Sample } from './lib';
import { DotstarConfig } from 'dotstar-node/dist/types';
import { DotstarConfigService } from './dotstar-config.service';
import { DotstarBufferService } from './dotstar-buffer.service';


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

  private readonly fps$ = new BehaviorSubject<number>(DotstarConstants.fpsMin);
  readonly fps: Observable<number>;

  readonly socketError = new Subject<Event>();

  socket: WebSocketSubject<any> | null = null;

  readonly message: ConnectableObservable<DotstarMessage>;
  readonly connected$ = new BehaviorSubject<boolean>(false);

  constructor(
    private configService: DotstarConfigService,
    private bufferService: DotstarBufferService
  ) {
    (window as any).dotstar = this;

    this.fps = this.fps$.asObservable().pipe(
      map(fps => Math.min(DotstarConstants.fpsMax, Math.max(DotstarConstants.fpsMin, fps)))
    );

    this.message = this.url.pipe(
      switchMap<string, DotstarMessage>(url => {
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
      this.fps.pipe(distinctUntilChanged())
    ).pipe(
      switchMap(([connected, fps]) =>
        !connected
        ? empty()
        : this.bufferService.channelValues.pipe(sampleTime(1000 / fps))
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

  setFps(fps: number) {
    this.fps$.next(fps);
  }

  setBroadcastsPerSecond(fps: number) {
    this.fps$.next(fps);
  }
}
