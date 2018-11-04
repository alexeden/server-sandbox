import { Component, OnInit, ElementRef } from '@angular/core';
import { CanvasSpace } from 'pts';

@Component({
  selector: 'dotstar-visualizer',
  // templateUrl: './visualizer.component.html',
  template: '',
  styleUrls: ['./visualizer.component.scss'],
})
export class DotstarVisualizerComponent implements OnInit {
  readonly space: CanvasSpace;
  constructor(
    readonly elRef: ElementRef
  ) {
    console.log(this.elRef.nativeElement);
    this.space = new CanvasSpace(this.elRef.nativeElement);
  }

  ngOnInit() {
    this.space.setup({
      bgcolor: '#ffffff',
      resize: true,
      retina: true,
    });
  }

}
