import { Injectable } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly _key: string = '_theme';
  private readonly _color: string = '#24135f'; //800
  private readonly _colorDark: string = '#6948da'; //A700
  private _option = new BehaviorSubject<string>(this.optionSelected());
  private _isDark = new BehaviorSubject<boolean>(false);
  option = this._option.asObservable();
  isDark = this._isDark.asObservable();

  constructor(private meta: Meta) { }

  setThemeOption(option: string): void {
    localStorage.setItem(this._key, btoa(option));
    this._option.next(option);
  }

  setDark(val: boolean): void {
    this._isDark.next(val);
    if (val) {
      this.meta.updateTag({ name: 'theme-color', content: this._colorDark }, );
    } else {
      this.meta.updateTag({ name: 'theme-color', content: this._color });
    }
  }

  private optionSelected(): string {
    const selected = localStorage.getItem(this._key);
    if (selected === null ||
        selected === undefined ||
        selected === '') {
      return ThemeOptions[0].option;
    }
    return ThemeOptions.find(t => t.option === atob(selected))?.option || ThemeOptions[0].option;
  }
}

export interface ThemeOption {
  option: string;
  name: string;
}

export const ThemeOptions: ThemeOption[] = [
  { option: '000', name: 'Automático' },
  { option: '001', name: 'Claro' },
  { option: '002', name: 'Oscuro' }
];
