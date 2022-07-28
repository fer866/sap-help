import { Pipe, PipeTransform } from '@angular/core';
import { search } from 'src/app/entities/user';

@Pipe({
  name: 'filter'
})
export class FilterPipe implements PipeTransform {

  transform(value: any[] | null | undefined, text?: string): any[] {
    if (!value) {
      return [];
    }
    if (!text) {
      return value;
    }
    return value.filter(v => search(v, text));
  }

}
