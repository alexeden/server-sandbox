import { Injectable } from '@angular/core';
import { BehaviorSubject, fromEvent, Observable } from 'rxjs';
import { map, shareReplay, startWith } from 'rxjs/operators';

@Injectable()
export class CanvasService {
  readonly canvasRect: Observable<DOMRect>;
  private readonly modelsReady$ = new BehaviorSubject(false);

  constructor(
    private readonly canvas: HTMLCanvasElement
  ) {
    /** Canvas's resize bounding client rectangle */
    this.canvasRect = fromEvent(window, 'resize').pipe(
      startWith(this.canvas),
      map(() => this.canvas.getBoundingClientRect() as DOMRect),
      shareReplay(1)
    );
  }

  start() {
    if (!this.modelsReady$.getValue()) this.modelsReady$.next(true);
  }
}
