import { Component, OnInit } from '@angular/core';
// import { LeapPaintService } from './leap-paint.service';
import { LeapController } from '@app/leap';
import { LeapPaintService } from './leap-paint.service';

@Component({
  templateUrl: './leap-paint.component.html',
  styleUrls: [ './leap-paint.component.scss' ],
})
export class LeapPaintComponent implements OnInit {

  constructor(
    readonly paintService: LeapPaintService,
    readonly controller: LeapController
  ) {
    (window as any).LeapPaintComponent = this;
  }

  ngOnInit() {
  }

}
