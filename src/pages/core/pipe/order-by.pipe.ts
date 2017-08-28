// Angular
import { Pipe, PipeTransform } from '@angular/core';

// For performance reason, this pipe should not be used. Instead the result should be sorted in the component
// with lodash for example.

@Pipe({
  name: 'snOrderBy'
})
export class OrderByPipe implements PipeTransform {
  _prop: string;
  _order: string = 'ASC';

  constructor() {
  }

  transform(array: string[], arg: string): string[] {
    if (arg.indexOf('-') === 0) {
      this._order = 'DESC';
      this._prop = arg.substr(1, arg.length - 1);
    } else {
      this._prop = arg;
    }

    array.sort((a: any, b: any) => {
      if (a[this._prop] < b[this._prop]) {
        return this._order === 'ASC' ? -1 : 1;
      } else if (a[this._prop] > b[this._prop]) {
        return this._order === 'ASC' ? 1 : -1;
      } else {
        return 0;
      }
    });
    return array;
  }
}
