import { Component, inject, input } from '@angular/core';
import { DateMessages } from '../../../../models/message.class';
import { FormatDateForListPipe } from '../../../../pipes/format-date-for-list.pipe';
import { FirestoreService } from '../../../../services/firestore.service';

@Component({
    selector: 'app-date-divider',
    imports: [FormatDateForListPipe],
    templateUrl: './date-divider.component.html',
    styleUrl: './date-divider.component.scss'
})
export class DateDividerComponent {
  fireService = inject(FirestoreService);

  readonly day = input<DateMessages>({
    date: '',
    messages: []
});

  readonly rootMessage = input(false);

  getTime(){
    if (this.rootMessage()) {
      return this.fireService.getMessageFromId(this.fireService.currentThread.rootMessage).time;
    } else {
      return this.day().messages[0].time;
    }
  }
}
