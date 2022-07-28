import { Pipe, PipeTransform } from '@angular/core';
import { Category } from 'src/app/entities/category';
import { search } from 'src/app/entities/user';

@Pipe({
  name: 'search'
})
export class SearchPipe implements PipeTransform {

  transform(value: Category[] | null, text?: string): Category[] | null {
    if (!text) {
      return value;
    }
    text = text.toLowerCase();
    const table = value?.filter(c => search(c, text || ''));
    return table || null;
  }

}
