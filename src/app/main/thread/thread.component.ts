import { AfterViewChecked, Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { FirestoreService } from '../../services/firestore.service';
import { SingleMessageComponent } from "../chat/single-message/single-message.component";
import { SendMessageComponent } from "../chat/send-message/send-message.component";
import { UiService } from '../../services/ui.service';
import { FormatDateForListPipe } from '../../pipes/format-date-for-list.pipe';
import { DateMessages, Message } from '../../models/message.class';
import { ThreadService } from '../../services/thread.service';
import { DateDividerComponent } from "../chat/single-message/date-divider/date-divider.component";
import { BreakpointObserverService } from '../../services/breakpoint-observer.service';

@Component({
    selector: 'app-thread',
    imports: [SingleMessageComponent, SendMessageComponent, FormatDateForListPipe, DateDividerComponent],
    templateUrl: './thread.component.html',
    styleUrl: './thread.component.scss'
})
export class ThreadComponent implements AfterViewChecked {
  fireService = inject(FirestoreService);
  uiService = inject(UiService);
  threadService = inject(ThreadService);
  observerService = inject(BreakpointObserverService);

  @ViewChild('threadMessages') scrollContainer!: ElementRef;

 

  closeThread(){
    if (this.observerService.isMobile) {
      this.uiService.mobileBackBtn()
    } else {
      this.uiService.closeThreadWindow();
    }
  }

  ngAfterViewChecked(): void {
    this.threadService.scrollAtStart(this.scrollContainer);
  }

  formatAnswerCount(){
    return this.fireService.currentThread.messages.length === 1 ?  'Antwort' : 'Antworten';
  }

  compareDate(messageDate: DateMessages){
    const rootDate = this.fireService.getFormattedDate(this.fireService.getMessageFromId(this.fireService.currentThread.rootMessage).time);
    if (messageDate.date === rootDate) {
      return true;
    } else {
      return false;
    }
  }
}
