import { AfterViewChecked, Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { ChannelService } from '../../../services/channel.service';
import { UiService } from '../../../services/ui.service';
import { UserService } from '../../../services/user.service';
import { PopupAddUserComponent } from "../popup-add-user/popup-add-user.component";
import { PopupEditChannelComponent } from "../popup-edit-channel/popup-edit-channel.component";
import { PopupChannelUsersComponent } from "../popup-channel-users/popup-channel-users.component";
import { SendMessageComponent } from "../send-message/send-message.component";
import { SingleMessageComponent } from "../single-message/single-message.component";
import { FirebaseAuthService } from '../../../services/firebase-auth.service';
import { fadeIn } from "../../../shared/animations";
import { FormatDateForListPipe } from '../../../pipes/format-date-for-list.pipe';
import { CommonModule } from '@angular/common';
import { BreakpointObserverService } from '../../../services/breakpoint-observer.service';
import { DateDividerComponent } from "../single-message/date-divider/date-divider.component";
import { ConversationService } from '../../../services/conversation.service';
import { Message } from '../../../models/message.class';
import { Thread } from '../../../models/thread.class';

@Component({
    selector: 'app-channel-chat',
    animations: [fadeIn],
    imports: [PopupAddUserComponent, PopupEditChannelComponent, PopupChannelUsersComponent, SendMessageComponent, SingleMessageComponent, FormatDateForListPipe, CommonModule, DateDividerComponent],
    templateUrl: './channel-chat.component.html',
    styleUrl: './channel-chat.component.scss'
})
export class ChannelChatComponent implements AfterViewChecked {
  channelService = inject(ChannelService);
  uiService = inject(UiService);
  userService = inject(UserService);
  authService = inject(FirebaseAuthService);
  observerService = inject(BreakpointObserverService);
  conversationService = inject(ConversationService);

  @ViewChild('channelMessages') scrollContainer!: ElementRef;

  toggleAddUserToChannel() {
    if (!this.observerService.isMobile) {
      this.uiService.toggleAddUserToChannelPopup();
    } else {
      this.uiService.mobilePopupContent = 'addUser';
      this.uiService.toggleMobilePopup();
    }
  }

  ngAfterViewChecked(): void {
    this.channelService.scrollAtStart(this.scrollContainer);
  }

  getChannelCreator() {
    if (this.userService.getCurrentUser().uid === this.channelService.fireService.currentChannel.creator) {
      return 'Du hast';
    } else {
      return `${this.userService.getUserData(this.channelService.fireService.currentChannel.creator).username} hat`;
    }
  }

  getDate() {
    const today = new Date();
    const dateToday = today.toLocaleDateString();
    const channelTime = new Date(this.channelService.fireService.currentChannel.time);
    const channelDate = channelTime.toLocaleDateString();
    if (channelDate === dateToday) {
      return 'heute';
    } else {
      return `am ${channelDate}`;
    }
  }

  /**
   * 
   * @returns the uid from channel creator, if he left the channel
   * it returns the uid from first channel member, if the channel has 
   * no members it returns an empty string
   */
  setRecipient() {
    const creatorUid = this.channelService.fireService.currentChannel.creator;
    if (this.channelService.fireService.currentChannel.users.some(u => u === creatorUid)) {
      return creatorUid;
    } else {
      if (this.channelService.fireService.currentChannel.users.length !== 0) {
        return this.channelService.fireService.currentChannel.users[0];
      } else {
        return '';
      }
    }
  }

  /**
   * Sends a Channel join request
   */
  async sendJoinRequest() {
    const requestRecipient = this.setRecipient();
    if (requestRecipient === '') {
      // no members in channel
    } else {
      const userUid = this.userService.getCurrentUser().uid;
      let conversation = this.conversationService.findConversation(userUid, requestRecipient);
      const content = this.createContent(this.userService.getUserData(requestRecipient).username);
      const message = this.createMessage(content);
      if (conversation) {
        conversation.messages.push(message);
        await this.channelService.fireService.addConversation(conversation);
      } else {
        await this.conversationService.createNewConversation(userUid, requestRecipient);
        this.conversationService.fireService.currentConversation.messages.push(message);
      }
      await this.markAsRequestSent();
    }
  }

  setRequestText() {
    if (this.userAlreadySendRequestToChannel()) {
      return 'Beitrittsanfrage gesendet.'
    } else {
      return 'Beitrittsanfrage senden?'
    }
  }

  setSendBtnText(){
    if (this.userAlreadySendRequestToChannel()) {
      return 'Gesendet';
    } else {
      return 'Senden';
    }
  }

  async markAsRequestSent() {
    this.userService.getCurrentUser().channelJoinRequestsSent.push(this.channelService.fireService.currentChannel.id);
    await this.channelService.fireService.addUser(this.userService.getCurrentUser());
    this.setRequestText();
  }

  userAlreadySendRequestToChannel(): boolean {
    return this.userService.getCurrentUser().channelJoinRequestsSent.some(id => id === this.channelService.fireService.currentChannel.id);
  }

  createContent(name: string) {
    return `Hallo ${name}, ich würde gerne zu dem Channel ${this.channelService.fireService.currentChannel.name} eingeladen werden :)`
  }

  createMessage(content: string, data?: string): Message {
    return new Message({
      time: this.authService.getCurrentTimestamp(),
      sender: this.userService.getCurrentUser().uid,
      content: content,
      thread: new Thread,
      data: data || '',
      reactions: []
    });
  }










}
