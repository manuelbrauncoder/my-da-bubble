import { Component, inject, Input } from '@angular/core';
import { User } from '../../models/user.class';
import { UiService } from '../../services/ui.service';
import { ConversationService } from '../../services/conversation.service';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.scss'
})
export class UserProfileComponent {
  @Input() user: User | null = null
  @Input() isPopupInChannel = false;
  uiService = inject(UiService);
  conversationService = inject(ConversationService);

  closeProfile(){
    if (this.isPopupInChannel) {
      this.uiService.toggleUserProfile()
    } else if (this.conversationService.isSelfTalking()){
      this.uiService.toggleViewProfile();
    } else {
      this.uiService.toggleUserProfile()
    }
      
  }

  openDirectMessage(){
    this.conversationService.openConversation(this.user?.uid!);
    this.closeProfile();
  }
}


