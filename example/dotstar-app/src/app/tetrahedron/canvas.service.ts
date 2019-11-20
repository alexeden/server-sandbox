import { Injectable } from '@angular/core';
import { PerspectiveCamera, WebGLRenderer } from 'three';
import { Observable, Subject, BehaviorSubject, fromEvent } from 'rxjs';
import { scan, tap, startWith, shareReplay, map } from 'rxjs/operators';

// tslint:disable-next-line: no-empty-interface
export interface CanvasParams {
}

type CanvasParamsUpdate = (params: CanvasParams) => CanvasParams;

@Injectable()
export class CanvasService {
  private initialCanvasParams: CanvasParams = {
  };

  readonly canvasRect: Observable<DOMRect>;
  private readonly ready: Observable<boolean>;
  readonly renderingParams: Observable<CanvasParams>;
  private readonly paramsUpdate$: Subject<CanvasParamsUpdate>;
  private readonly modelsReady$ = new BehaviorSubject(false);

  constructor(
    private readonly canvas: HTMLCanvasElement
  ) {
    this.ready = this.modelsReady$.asObservable();

    // Canvas params
    this.paramsUpdate$ = new Subject();
    this.renderingParams = this.paramsUpdate$.pipe(
      scan<CanvasParamsUpdate, CanvasParams>((state, update) => update(state), this.initialCanvasParams),
      tap(params => this.initialCanvasParams = params),
      startWith(this.initialCanvasParams),
      shareReplay(1)
    );

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

  updateCanvasParams<K extends keyof CanvasParams>(valueObj: Partial<Pick<CanvasParams, K>>) {
    this.paramsUpdate$.next(params => ({
      ...params,
      ...valueObj,
    }));
  }
}
