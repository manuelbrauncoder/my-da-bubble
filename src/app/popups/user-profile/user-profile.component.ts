import { Component, EventEmitter, inject, Input, OnInit, Output, input } from '@angular/core';
import { User } from '../../models/user.class';
import { UiService } from '../../services/ui.service';
import { ConversationService } from '../../services/conversation.service';
import { UserService } from '../../services/user.service';

@Component({
    selector: 'app-user-profile',
    imports: [],
    templateUrl: './user-profile.component.html',
    styleUrl: './user-profile.component.scss'
})
export class UserProfileComponent implements OnInit {
  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() user: User | null = null
  readonly isPopupInChannel = input(false);
  readonly useUiCache = input(false);
  @Output() triggerClose = new EventEmitter<boolean>();
  userService = inject(UserService);
  uiService = inject(UiService);
  conversationService = inject(ConversationService);

  triggerCloseInParent(){
    this.triggerClose.emit();
  }

  closeProfile(){
    if (this.isPopupInChannel()) {
      this.uiService.toggleUserProfile()
    } else if(this.useUiCache()) {
      this.triggerCloseInParent();
    } else if (this.conversationService.isSelfTalking()){
      this.uiService.toggleViewProfile();
    } else {
      this.uiService.toggleUserProfile()
    } 
  }

  ngOnInit(): void {
    if (this.useUiCache()) {
      this.user = this.userService.getUserData(this.uiService.currentUidForProfilePopup);
    }
    
  }

  openDirectMessage(){
    this.conversationService.openConversation(this.user?.uid!);
    this.closeProfile();
  }
}


