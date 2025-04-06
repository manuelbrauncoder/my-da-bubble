import { Component, inject, OnInit, input } from '@angular/core';
import { ChannelService } from '../../../services/channel.service';
import { UiService } from '../../../services/ui.service';
import { Channel } from '../../../models/channel.class';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../services/user.service';
import { FormsModule } from '@angular/forms';
import { BreakpointObserverService } from '../../../services/breakpoint-observer.service';

@Component({
    selector: 'app-popup-add-user',
    imports: [CommonModule, FormsModule],
    templateUrl: './popup-add-user.component.html',
    styleUrl: './popup-add-user.component.scss'
})
export class PopupAddUserComponent implements OnInit {
  channelService = inject(ChannelService);
  uiService = inject(UiService);
  userService = inject(UserService);
  observerService = inject(BreakpointObserverService);

  readonly shownInMobilePopup = input(false);

  updatedChannel: Channel = new Channel();
  searchInput = '';
  selectedUsers: string[] = [];
  availableUsers: string[] = [];
  usersAlreadyInChannel: string[] = [];

  filteredUsers: string[] = [];

  togglePopup(){
    if (this.observerService.isMobile) {
      this.uiService.toggleMobilePopup();
    } else {
      this.uiService.toggleAddUserToChannelPopup();
    }
  }

  /**
   * copy the current channel to updated channel
   * copy users from current channel to selected users array
   * push the available users in the array
   */
  ngOnInit(): void {
    this.updatedChannel = new Channel(this.channelService.fireService.currentChannel);
    this.usersAlreadyInChannel = [...this.channelService.fireService.currentChannel.users];
    this.availableUsers = this.getAvailableUsers();
  }

  /**
   * Copy the selected users to the updated channel.users
   * save updated channel in firebase
   * set channel as current active channel
   * clear arrays and close popup
   */
  async onSubmit() {
    this.updatedChannel.users = [...this.selectedUsers, ...this.usersAlreadyInChannel];
    await this.channelService.fireService.addChannel(this.updatedChannel);
    this.channelService.toggleActiveChannel(this.updatedChannel, true);
    this.clearArrAndClosePopup();
  }

  clearArrAndClosePopup(){
    this.selectedUsers = [];
    this.availableUsers = [];
    this.togglePopup();
  }


  /**
   * 
   * @returns all users, that are not in the selectedUsers array
   */
  getAvailableUsers() {
    let userIds: string[] = [];
    const users = this.channelService.fireService.users.filter(user => !this.usersAlreadyInChannel.some(selUser => selUser === user.uid));
    users.forEach((user) => {
      userIds.push(user.uid);
    })
    return userIds;
  }

  /**
   * 
   * @returns all avalableUsers or a filtered Array
   */
  searchUsers() {
    this.filteredUsers = [];
    if (!this.searchInput) {
      this.filteredUsers = [];
    } else {
      const searchedUsers = this.availableUsers.filter((uid) =>
        this.userService.getUserData(uid).username.toLowerCase().includes(this.searchInput.toLowerCase()));
      this.filteredUsers = searchedUsers;
     }
  }

  /**
   * select user and remove it from availableUsers array
   * @param user 
   */
  selectUser(userUid: string, filterIndex: number) {
    this.selectedUsers.push(userUid);
    const index = this.availableUsers.findIndex(uid => uid === userUid);
    if (index !== -1) {
      this.availableUsers.splice(index, 1);
      this.filteredUsers.splice(filterIndex, 1);
    }
  }

  /**
   * unselect user and push to availableUsers array
   * @param user 
   * @param index 
   */
  unselectUser(userUid: string, index: number) {
    this.availableUsers.push(userUid);
    this.selectedUsers.splice(index, 1);
  }
}
