import { Injectable } from '@angular/core';
import { LeapController } from '@app/leap';

@Injectable()
export class LeapPaintService {
  constructor(
    readonly controller: LeapController
  ) {
    (window as any).LeapPaintService = this;
  }

}
