import { Component, OnInit } from '@angular/core';
// import { LeapPaintService } from './leap-paint.service';
import { LeapController } from '@app/leap';

@Component({
  templateUrl: './leap-paint.component.html',
  styleUrls: [ './leap-paint.component.scss' ],
  providers: [
    {
      provide: LeapController,
      useFactory: () => LeapController.create(),
    },
  ],
})
export class LeapPaintComponent implements OnInit {

  constructor(
    readonly leap: LeapController
  ) {
    (window as any).LeapPaintComponent = this;
  }

  ngOnInit() {
  }

}
