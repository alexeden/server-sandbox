import { Injectable } from '@angular/core';
import { LeapController } from '@app/leap';

@Injectable()
export class LeapPaintService {
  controller = LeapController.create();

}
