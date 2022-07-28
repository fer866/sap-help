import { DatePipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'customDate'
})
export class CustomDatePipe extends DatePipe implements PipeTransform {

  transform(value: Date | string | number, format?: string, timezone?: string, locale?: string): string | null;
  transform(value: null | undefined, format?: string, timezone?: string, locale?: string): null;
  transform(value: Date | string | number | null | undefined, format?: string, timezone?: string, locale?: string): string | null;
  transform(value: Date | string | number | null | undefined, format?: string, dayFormat?: string, timezone?: string, locale?: string): string | null {
    const today = new Date();
    today.setHours(0,0,0,0);
    const val = new Date(value || today);
    val.setHours(0,0,0,0);
    const yesterday = new Date(new Date(new Date().setDate(today.getDate() - 1)).setHours(0,0,0,0));
    const tomorrow = new Date(new Date(new Date().setDate(today.getDate() + 1)).setHours(0,0,0,0));

    if (val.valueOf() === today.valueOf()) {
      format = '\'Hoy\'' + (dayFormat || '');
    } else if (val.valueOf() === yesterday.valueOf()) {
      format = '\'Ayer\'' + (dayFormat || '');
    } else if (val.valueOf() === tomorrow.valueOf()) {
      format = '\'Mañana\'' + (dayFormat || '');
    } else if (dayFormat) {
      format = format + dayFormat;
    }
    format = format?.trim();

    return super.transform(value, format, timezone, locale);
  }

}
