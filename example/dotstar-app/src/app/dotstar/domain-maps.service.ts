import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export enum Domain {
  Canvas = 'canvas',
  Dotstar = 'dotstar',
  Leap = 'leap',
}

type Range = [ number, number ];

interface DomainSpace {
  space: Domain;
  x: Range;
  y: Range;
  z: Range;
}



@Injectable()
export class DomainMapService {
  private readonly updates$ = new Subject<DomainSpace>();

  constructor() {
    // this.updates$.pipe()
  }

  updateDomainSpace(space: Domain, x: Range = [0, 0], y: Range = [0, 0], z: Range = [0, 0]) {
    this.updates$.next({ space, x, y, z });
  }
}
