import { Component, inject, Input } from '@angular/core';
import { UiService } from '../../../services/ui.service';
import { ChannelService } from '../../../services/channel.service';
import { UserService } from '../../../services/user.service';
import { FirebaseAuthService } from '../../../services/firebase-auth.service';
import { CommonModule } from '@angular/common';
import { PopupAddUserComponent } from '../popup-add-user/popup-add-user.component';
import { BreakpointObserverService } from '../../../services/breakpoint-observer.service';
import { ConversationService } from '../../../services/conversation.service';
import { UserProfileComponent } from '../../../popups/user-profile/user-profile.component';
import { User } from '../../../models/user.class';

@Component({
  selector: 'app-popup-channel-users',
  standalone: true,
  imports: [CommonModule, PopupAddUserComponent, UserProfileComponent],
  templateUrl: './popup-channel-users.component.html',
  styleUrl: './popup-channel-users.component.scss'
})
export class PopupChannelUsersComponent {
  uiService = inject(UiService);
  channelService = inject(ChannelService);
  userService = inject(UserService);
  authService = inject(FirebaseAuthService);
  observerService = inject(BreakpointObserverService);
  conversationService = inject(ConversationService);
  userForProfilePupup: User | null = null;

  @Input() showInEditChannelPopup = false;

  toggleAddUserToChannel(){
    if (!this.observerService.isMobile) {
      this.uiService.showAddUserInChannelUser();
    } else {
      this.uiService.mobilePopupContent = 'addUser';
      this.uiService.toggleMobilePopup();
    }
  }

  setUserForPopup(uid: string) {
    this.userForProfilePupup = this.userService.getUserData(uid);
    this.uiService.toggleUserProfile();
  }
}
