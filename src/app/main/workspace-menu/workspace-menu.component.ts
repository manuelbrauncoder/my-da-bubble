import { Component, inject } from '@angular/core';
import { FirebaseAuthService } from '../../services/firebase-auth.service';
import { CommonModule } from '@angular/common';
import { UiService } from '../../services/ui.service';
import { FirestoreService } from '../../services/firestore.service';
import { ChannelService } from '../../services/channel.service';
import { UserService } from '../../services/user.service';
import { ConversationService } from '../../services/conversation.service';
import { BreakpointObserverService } from '../../services/breakpoint-observer.service';
import { SearchBarComponent } from '../../shared/search-bar/search-bar.component';
import { Channel } from '../../models/channel.class';
import { fadeIn, toggleConversations } from "../../shared/animations";

@Component({
  selector: 'app-workspace-menu',
  standalone: true,
  animations: [fadeIn, toggleConversations],
  imports: [CommonModule, SearchBarComponent],
  templateUrl: './workspace-menu.component.html',
  styleUrl: './workspace-menu.component.scss'
})
export class WorkspaceMenuComponent {
  authService = inject(FirebaseAuthService);
  uiService = inject(UiService);
  fireService = inject(FirestoreService);
  channelService = inject(ChannelService);
  userService = inject(UserService);
  conversationService = inject(ConversationService);
  observerService = inject(BreakpointObserverService);

  openNewMessage() {
    this.uiService.changeMainContent('newMessage');
    this.uiService.channelChatNotActive();
    this.uiService.userChatNotActive();
    this.closeWorkspaceMenuInTablet();
  }

  closeWorkspaceMenuInTablet() {
    if (this.observerService.isTablet) {
      this.uiService.showWorkspaceMenu = false;
    }
  }

  toggleChannels(channel: Channel){
    this.channelService.toggleActiveChannel(channel, true);
    this.closeWorkspaceMenuInTablet();
  }

  openConversation(uid: string){
    this.conversationService.openConversation(uid);
    this.closeWorkspaceMenuInTablet();
  }

  openAddChannelPopup(){
    this.uiService.toggleAddChannelPopup();
    this.closeWorkspaceMenuInTablet();
  }
 
}
