import { Component, inject } from '@angular/core';
import { ChannelService } from '../../../services/channel.service';
import { UiService } from '../../../services/ui.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Channel } from '../../../models/channel.class';
import { UserService } from '../../../services/user.service';
import { User } from '../../../models/user.class';
import { PopupChannelUsersComponent } from "../popup-channel-users/popup-channel-users.component";
import { BreakpointObserverService } from '../../../services/breakpoint-observer.service';

@Component({
    selector: 'app-popup-edit-channel',
    imports: [CommonModule, FormsModule, PopupChannelUsersComponent],
    templateUrl: './popup-edit-channel.component.html',
    styleUrl: './popup-edit-channel.component.scss'
})
export class PopupEditChannelComponent {
  channelService = inject(ChannelService);
  uiService = inject(UiService);
  userService = inject(UserService);
  observerService = inject(BreakpointObserverService);

  nameInput = '';
  descriptionInput = '';

  updatedChannel: Channel = new Channel();

  showNameInput = false;
  showDescriptionInput = false;

  isChannelNameTaken(){
    if (this.channelService.fireService.currentChannel.name.trim().toLowerCase() === this.nameInput.trim().toLowerCase()) {
      return false;
    } else if (this.channelService.fireService.channels.some(channel => channel.name.trim().toLowerCase() === this.nameInput.trim().toLowerCase())) {
      return true;
    } else {
      return false;
    }
  }


  /**
   * Remove current User from Channel
   */
  async leaveChannel(){
    let currentUser: User = this.userService.getCurrentUser();
    if (currentUser) {
     const userIndex = this.channelService.fireService.currentChannel.users.findIndex(uid => uid === currentUser.uid);
      this.channelService.fireService.currentChannel.users.splice(userIndex, 1);
      await this.channelService.fireService.addChannel(this.channelService.fireService.currentChannel);
      this.uiService.toggleEditChannelPopup();     
    }
  }

  toggleNameInput(){
    this.showNameInput = !this.showNameInput;
  }

  toggleDescriptionInput(){
    this.showDescriptionInput = !this.showDescriptionInput;
  }

  /**
   * Save new Channel name in firestore
   */
  async saveNewChannelName(){
    this.updatedChannel = new Channel(this.channelService.fireService.currentChannel);
    this.updatedChannel.name = this.nameInput;
    await this.channelService.fireService.addChannel(this.updatedChannel);
    this.channelService.toggleActiveChannel(this.updatedChannel, true);
    this.toggleNameInput();
  }

  /**
   * save new Channel description in firestore
   */
  async saveNewChannelDescription(){
    this.updatedChannel = new Channel(this.channelService.fireService.currentChannel);
    this.updatedChannel.description = this.descriptionInput;
    await this.channelService.fireService.addChannel(this.updatedChannel);
    this.channelService.toggleActiveChannel(this.updatedChannel, true);
    this.toggleDescriptionInput();
  }
}
