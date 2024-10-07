import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { User } from '../../models/user.class';
import { UiService } from '../../services/ui.service';
import { ConversationService } from '../../services/conversation.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.scss'
})
export class UserProfileComponent implements OnInit {
  @Input() user: User | null = null
  @Input() isPopupInChannel = false;
  @Input() useUiCache = false;
  @Output() triggerClose = new EventEmitter<boolean>();
  userService = inject(UserService);
  uiService = inject(UiService);
  conversationService = inject(ConversationService);

  triggerCloseInParent(){
    this.triggerClose.emit();
  }

  closeProfile(){
    if (this.isPopupInChannel) {
      this.uiService.toggleUserProfile()
    } else if(this.useUiCache) {
      this.triggerCloseInParent();
    } else if (this.conversationService.isSelfTalking()){
      this.uiService.toggleViewProfile();
    } else {
      this.uiService.toggleUserProfile()
    } 
  }

  ngOnInit(): void {
    if (this.useUiCache) {
      this.user = this.userService.getUserData(this.uiService.currentUidForProfilePopup);
    }
    console.log(this.user);
    
  }

  openDirectMessage(){
    this.conversationService.openConversation(this.user?.uid!);
    this.closeProfile();
  }
}


