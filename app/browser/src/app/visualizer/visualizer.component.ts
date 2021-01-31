import { Component, OnInit, ElementRef, Renderer2, OnDestroy } from '@angular/core';
import { Subject, BehaviorSubject, Observable } from 'rxjs';
import { takeUntil, map, tap, skipWhile } from 'rxjs/operators';
import { CanvasSpace, CanvasForm, Group } from 'pts';
import { transpose } from 'ramda';
import { mapToRange } from '../lib';
import { BufferService } from '../buffer.service';
import { Colors } from 'dotstar-node/dist/colors';

@Component({
  selector: 'dotstar-visualizer',
  templateUrl: './visualizer.component.html',
  styleUrls: ['./visualizer.component.scss'],
})
export class VisualizerComponent implements OnInit, OnDestroy {
  private readonly unsubscribe$ = new Subject<any>();
  private readonly ready$ = new BehaviorSubject(false);

  readonly height = 550;
  readonly padding = 10;
  readonly rgbChannelGroups: Observable<Group[]>;
  readonly space: CanvasSpace;
  readonly form: CanvasForm;
  readonly canvas: HTMLCanvasElement;

  constructor(
    readonly elRef: ElementRef,
    readonly renderer: Renderer2,
    readonly bufferService: BufferService
  ) {
    this.canvas = this.renderer.createElement('canvas');
    this.renderer.setStyle(this.canvas, 'height', `${this.height}px`);
    this.renderer.appendChild(this.elRef.nativeElement, this.canvas);
    this.space = new CanvasSpace(this.canvas, () => this.ready$.next(true)).setup({
      bgcolor: '#424242',
      resize: true,
      retina: true,
    });

    this.form = new CanvasForm(this.space);

    this.rgbChannelGroups = this.bufferService.values.pipe(
      // TODO: Convert this to a scan operator that only creates new points
      // when the buffer length changes (should help performance)
      map(values => {
        const { width, height } = this.space.innerBound;
        return transpose(values).map(channel =>
          Group.fromArray(channel.map((value, i) => [
            mapToRange(0x00, values.length, this.padding, width - this.padding, i),
            mapToRange(0x00, 0xff, height - this.padding, this.padding, value),
          ]))
        );
      })
    );
  }

  ngOnInit() {
    this.rgbChannelGroups.pipe(
      takeUntil(this.unsubscribe$),
      skipWhile(() => !this.ready$.getValue()),
      tap(() => this.space.clear())
    ).subscribe(([ r, g, b ]) => {
      this.form.strokeOnly(`${Colors.Red}`, 2).line(r);
      this.form.strokeOnly(`${Colors.Green}`, 2).line(g);
      this.form.strokeOnly(`${Colors.Blue}`, 2).line(b);
      this.form.fillOnly(`${Colors.Red}`).points(r, 4, 'circle');
      this.form.fillOnly(`${Colors.Green}`).points(g, 4, 'circle');
      this.form.fillOnly(`${Colors.Blue}`).points(b, 4, 'circle');
    });
  }

  ngOnDestroy() {
    this.ready$.unsubscribe();
    this.space.removeAll();
    this.space.stop();
    this.unsubscribe$.next('unsubscribe!');
    this.unsubscribe$.unsubscribe();
  }
}
