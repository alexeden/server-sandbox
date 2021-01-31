import { Injectable } from '@angular/core';
import { BehaviorSubject, fromEvent, Observable } from 'rxjs';
import { map, shareReplay, startWith } from 'rxjs/operators';

// export interface CanvasParams {
// }

// type CanvasParamsUpdate = (params: CanvasParams) => CanvasParams;

@Injectable()
export class CanvasService {
  // private initialCanvasParams: CanvasParams = {
  // };

  readonly canvasRect: Observable<DOMRect>;
  // readonly renderingParams: Observable<CanvasParams>;
  // private readonly paramsUpdate$: Subject<CanvasParamsUpdate>;
  private readonly modelsReady$ = new BehaviorSubject(false);

  constructor(
    private readonly canvas: HTMLCanvasElement
  ) {

    // Canvas params
    // this.paramsUpdate$ = new Subject();
    // this.renderingParams = this.paramsUpdate$.pipe(
    //   scan<CanvasParamsUpdate, CanvasParams>((state, update) => update(state), this.initialCanvasParams),
    //   tap(params => this.initialCanvasParams = params),
    //   startWith(this.initialCanvasParams),
    //   shareReplay(1)
    // );

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

  // updateCanvasParams<K extends keyof CanvasParams>(valueObj: Partial<Pick<CanvasParams, K>>) {
  //   this.paramsUpdate$.next(params => ({
  //     ...params,
  //     ...valueObj,
  //   }));
  // }
}
