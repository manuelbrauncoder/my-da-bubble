import {
  AfterViewChecked,
  Component,
  ElementRef,
  inject,
  ViewChild,
} from '@angular/core';
import { SingleMessageComponent } from '../single-message/single-message.component';
import { SendMessageComponent } from '../send-message/send-message.component';
import { ConversationService } from '../../../services/conversation.service';
import { FormatDateForListPipe } from '../../../pipes/format-date-for-list.pipe';
import { UserService } from '../../../services/user.service';
import { CommonModule } from '@angular/common';
import { DateDividerComponent } from '../single-message/date-divider/date-divider.component';
import { UiService } from '../../../services/ui.service';
import { UserProfileComponent } from '../../../popups/user-profile/user-profile.component';
import { fadeIn } from "../../../shared/animations";

@Component({
  selector: 'app-direct-message',
  standalone: true,
  animations: [fadeIn],
  imports: [
    SingleMessageComponent,
    SendMessageComponent,
    FormatDateForListPipe,
    CommonModule,
    DateDividerComponent,
    UserProfileComponent,
  ],
  templateUrl: './direct-message.component.html',
  styleUrl: './direct-message.component.scss',
})
export class DirectMessageComponent implements AfterViewChecked {
  conversationService = inject(ConversationService);
  userService = inject(UserService);
  uiService = inject(UiService);

  @ViewChild('conversationMessages') scrollContainer!: ElementRef;

  ngAfterViewChecked(): void {
    this.conversationService.scrollAtStart(this.scrollContainer);
  }

  getUserForChild() {
    if (this.conversationService.isSelfTalking()) {
      return this.userService.getCurrentUser();
    } else {
      return this.conversationService.getConversationPartner();
    }
  }

  togglePopup(){
    if (this.conversationService.isSelfTalking()) {
      this.uiService.toggleCurrentUserPopup()
    } else {
      this.uiService.toggleUserProfile()
    }
  }
}
