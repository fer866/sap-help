import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[cjfChangePerspective]'
})
export class ChangePerspectiveDirective {

  constructor(private el: ElementRef) { }

  @HostListener('mousemove', ['$event']) onMouseMove(e: MouseEvent) {
    this.update(e);
  }

  @HostListener('mouseleave', ['$event']) onMouseLeave(e: MouseEvent) {
    this.el.nativeElement.style = '';
  }

  private update(e: MouseEvent): void {
    const cordinates = (this.el.nativeElement as HTMLElement).getBoundingClientRect();
    const x = ((cordinates.left + cordinates.right) / 2) - e.clientX;
    const y = ((cordinates.top + cordinates.bottom) / 2) - e.clientY;
    const rX = y / 10;
    const rY = x / 10;
    this.updateTransformStyle(rX, rY);
  }

  private updateTransformStyle(x: number, y: number): void {
    const style = `perspective(300px) rotateX(${x}deg) rotateY(${y}deg) scale3d(1.2,1.2,1.2)`;
    const inner = this.el.nativeElement as HTMLElement;
    inner.style.transform = style;
    inner.style.webkitTransform = style;
  }

}
