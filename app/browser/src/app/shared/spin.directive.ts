import { Directive, ElementRef, Renderer2, Input, OnDestroy } from '@angular/core';

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: '[spin]',
})
export class SpinDirective implements OnDestroy {

  @Input()
  set spin(freq: number) {
    (this.el.nativeElement as HTMLElement).style.setProperty('--speed', `${10 / +freq}s`);
  }

  constructor(
    private el: ElementRef,
    private renderer: Renderer2
  ) {
    this.renderer.addClass(this.el.nativeElement, 'spin');
  }

  ngOnDestroy() {
    this.renderer.removeClass(this.el.nativeElement, 'spin');
  }

}
