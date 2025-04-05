/**
 * FormatDateForListPipe
 * 
 * Returns 'Heute' or the Date
 * 
 */

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatDateForList',
  standalone: true
})
export class FormatDateForListPipe implements PipeTransform {

  /**
   * if timestamp is today, it returns 'Heute',
   * if is not today it returns the formatted date
   */
  transform(timestamp: number): string {
    const date = new Date(timestamp);
    const today = new Date();

    const isToday =
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();

    if (isToday) {
      return 'Heute';
    }

    const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long' };
    return date.toLocaleDateString('de-DE', options);
  }

  }


