import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { UiConstants } from './lib';
import { map } from 'rxjs/operators';

@Injectable()
export class DotstarUiConfigService {
  private readonly fps$ = new BehaviorSubject<number>(10);
  readonly fps: Observable<number>;

  constructor(

  ) {
    this.fps = this.fps$.asObservable().pipe(
      map(fps => Math.min(UiConstants.fpsMin, Math.max(UiConstants.fpsMax, fps)))
    );
  }



}
