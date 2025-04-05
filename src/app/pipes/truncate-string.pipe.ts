/**
 * TruncateStringPipe
 *
 * Truncates a string to a specified length. If the string exceeds the limit,
 * it is shortened to the limit and an ellipsis (default: '...') is appended.
 */


import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'truncateString',
  standalone: true
})
export class TruncateStringPipe implements PipeTransform {

  transform(value: string, limit: number = 10, ellipsis: string = '...'): string {
      if (value.length <= limit) {
        return value;
      }
      return value.substring(0, limit) + ellipsis;
  }

}
