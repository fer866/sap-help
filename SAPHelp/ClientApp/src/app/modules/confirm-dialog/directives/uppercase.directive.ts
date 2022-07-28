import { Directive, HostListener } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: 'input[type=text][cjfUppercase]'
})
export class UppercaseDirective {

  constructor(private ctrl: NgControl) { }

  @HostListener('input', ['$event']) onInput(e: Event) {
    const value = (e.target as HTMLInputElement)?.value;
    if (value) {
      this.ctrl.control?.setValue(value.toUpperCase());
    }
  }
}
