import { Injectable } from '@angular/core';
import { DotstarConfigService } from './dotstar-config.service';
import { Observable, ConnectableObservable, Subject } from 'rxjs';
import { publishReplay, map, switchMap } from 'rxjs/operators';
import { range } from './lib';

type BufferUpdate = (buffer: number[]) => number[];

@Injectable()
export class DotstarBufferService {
  readonly buffer: ConnectableObservable<number[]>;
  private readonly bufferUpdates = new Subject<BufferUpdate>();

  constructor(
    private configService: DotstarConfigService
  ) {
    this.buffer = this.configService.length.pipe(
      map(length => range(0, length).fill(0)),
      // switchMap(buffer =>
      //   this.bufferUpdates.pip
      // ),
      publishReplay(1)
    ) as ConnectableObservable<number[]>;

    this.buffer.connect();
  }

  pushUpdate(update: BufferUpdate) {
    this.bufferUpdates.next(update);
  }
}
