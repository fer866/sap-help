import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ThemeService } from './theme.service';
import { take } from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class SnackbarService {

  constructor(private snack: MatSnackBar, private theme: ThemeService) { }

  open(message: string, action?: string, noLimit?: boolean, duration?: number): void {
    this.theme.isDark.pipe(take(1)).subscribe(d => {
      const custAction = action ?? 'descartar';
      const cssClass: string | undefined = d ? 'snack-dark' : undefined;
      const time = noLimit ? undefined : duration ?? 7000;
      this.snack.open(message, custAction, { duration: time, panelClass: cssClass });
    });
  }
}
