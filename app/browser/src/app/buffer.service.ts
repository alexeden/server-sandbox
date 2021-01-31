import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, empty } from 'rxjs';
import { share, switchAll } from 'rxjs/operators';
import { Sample } from './lib';

@Injectable()
export class BufferService {
  private readonly selectedBufferStream$ = new BehaviorSubject<Observable<Sample[]>>(empty());
  readonly values: Observable<Sample[]>;

  constructor() {
    this.values = this.selectedBufferStream$.asObservable().pipe(
      switchAll(),
      share()
    );
  }

  resetBufferStream() {
    this.selectedBufferStream$.next(empty());
  }

  setBufferStream(stream: Observable<Sample[]>) {
    this.selectedBufferStream$.next(stream);
  }
}
