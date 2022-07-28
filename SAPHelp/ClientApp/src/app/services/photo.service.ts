import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { PhotoProps, Step } from '../entities/guide';

@Injectable({
  providedIn: 'root'
})
export class PhotoService {
  private _show = new BehaviorSubject<boolean>(false);
  private _props = new BehaviorSubject<PhotoProps>({});
  show = this._show.asObservable();
  props = this._props.asObservable();

  constructor(@Inject(DOCUMENT) private doc: Document) { }

  showImage(x: number, y: number, step: Step): void {
    this._props.next({ x: x, y: y, step: step });
    this._show.next(true);
    this.doc.documentElement.className = 'scrollblock';
  }

  hideImage(): void {
    this._show.next(false);
    this._props.next({});
    this.doc.documentElement.removeAttribute('class');
  }
}
