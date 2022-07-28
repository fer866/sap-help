import { Pipe, PipeTransform } from '@angular/core';
import { search, UserAccount } from 'src/app/entities/user';

@Pipe({
  name: 'search'
})
export class SearchPipe implements PipeTransform {

  transform(value: UserAccount[] | null, text?: string): UserAccount[] | null {
    if (!text) {
      return value;
    }
    text = text.toLowerCase();
    const table = value?.filter(c => search(c, text || ''));
    return table || null;
  }

}
