/**
 * This Service File is for opening and closing UI Elements
 */
import { BreakpointObserver } from '@angular/cdk/layout';
import { inject, Injectable } from '@angular/core';
import { FirestoreService } from './firestore.service';
import { User } from '../models/user.class';

@Injectable({
  providedIn: 'root'
})
export class UiService {

  observerService = inject(BreakpointObserver);
  fireService = inject(FirestoreService);

  currentDataPath = '';
  currentUidForProfilePopup = '';

  showWorkspaceMenu = true; // workspace menu in main-content
  showDirectMessages = true; // user list in workspace menu
  showChannels = true; // channel list in workspace menu

  showChannelEditPopup = false; // opens in channel-chat-component
  showAddUserToChannelPopup = false;
  showChannelUsersPopup = false;
  showChannelUsersAddUser = false;
  showChannelUsers = true;

  mainContent: 'channelChat' | 'newMessage' | 'directMessage' = 'newMessage';

  showChat = true; // chat window in main-content
  showThread = false; // thread window in main-content
  showAddChannelPopup = false; // add new channel popup
  showAddChannelInlinePopup1 = true; // name and description
  showAddChannelInlinePopup2 = false;  // users
  channelPopup2Searchbar = false // search users for channel

  showEditUserAndLogoutPopup = false;
  showViewProfilePopup = false;
  showEditProfilePopup = false;
  showVerifyPasswordPopup = false;
  showChangeAvatarContainer = false;
  showProfileChangeConfirmationPopup = false;
  showTaggableUsersPopup = false;

  showMobileNavigation = false;
  showMobilePopup = false;

  mobilePopupContent: 'addUser' = 'addUser';
  showUserProfile = false;

  toggleUserProfile(){
    this.showUserProfile = !this.showUserProfile;
  }

  toggleMobilePopup() {
    this.showMobilePopup = !this.showMobilePopup;
  }

  toggleMobileNavigation(){
    this.showMobileNavigation = !this.showMobileNavigation;
  }

  mobileBackBtn(){
    if (this.showThread) {
      this.showThread = false;
      this.showChat = true;
    } else {
      this.showChat = false;
      this.showWorkspaceMenu = true;
      this.showMobileNavigation = false;
    }
  }

  /**
   * set all userChatActive values to false
   */
  userChatNotActive(){
    this.fireService.users.forEach((user) => {
      user.userChatActive = false;
    })
  }

  /**
   * 
   * @param user set chat active to true and
   * other users to false
   */
  hightlightUserChat(user: User){
    this.fireService.users.forEach((userInList) => {
      if (user.uid === userInList.uid) {
        userInList.userChatActive = true;
      } else {
        userInList.userChatActive = false;
      }
    })
  }

  /**
   * set all channelActive values to false
   */
  channelChatNotActive(){
    this.fireService.channels.forEach((channel) => {
      channel.channelActive = false;
    })
  }

  openChatMobile(content: 'channelChat' | 'newMessage' | 'directMessage'){
    this.mainContent = content;
    this.showWorkspaceMenu = false;
    this.showThread = false;
    this.showChat = true;
    this.showMobileNavigation = true;
  }

  openThreadMobile(){
    this.showWorkspaceMenu = false;
    this.showThread = true;
    this.showChat = false;
    this.showMobileNavigation = true;
  }

  openWorkspaceMenuMobile(){
    this.showWorkspaceMenu = true;
    this.showThread = false;
    this.showChat = false;
    this.showMobileNavigation = false;
  }

  closeThreadWindow() {
    this.showThread = false;
  }

  changeMainContent(content: 'channelChat' | 'newMessage' | 'directMessage'){
    this.mainContent = content;
  }

  showAddUserInChannelUser(){
    this.showChannelUsersAddUser = true;
    this.showChannelUsers = false;
  }

  toggleChannelUsersPopup(){
    this.showChannelUsersPopup = !this.showChannelUsersPopup;
    this.showChannelUsersAddUser = false;
    this.showChannelUsers = true;
  }

  toggleAddUserToChannelPopup(){
    if (this.showChannelUsersAddUser) {
      this.toggleChannelUsersPopup();
    } else {
      this.showAddUserToChannelPopup = !this.showAddUserToChannelPopup;
    }
  }

  toggleEditChannelPopup(){
    this.showChannelEditPopup = !this.showChannelEditPopup;
  }

  /**
   * Close Popup for adding Channel Name and Description
   * Open Popup for adding Users to Channel
   */
  openAddChannelPopup2(){
    this.showAddChannelInlinePopup2 = !this.showAddChannelInlinePopup2;
    this.showAddChannelInlinePopup1 = !this.showAddChannelInlinePopup1;
  }


  toggleAddChannelPopup(){
    this.showAddChannelPopup = !this.showAddChannelPopup;
    this.showAddChannelInlinePopup2 = false;
    this.showAddChannelInlinePopup1 = true;
  }

  toggleWorkspaceMenu(){
    this.showWorkspaceMenu = !this.showWorkspaceMenu;
  }

  toggleDirectMessages(){ 
    this.showDirectMessages = !this.showDirectMessages;
  }

  toggleChannels(){
    this.showChannels = !this.showChannels;
  }

  /**
   * Toggles the visibility of the popup for editing the user profile and logging out.
   * Resets other related popups to their hidden state.
   */

  toggleEditUserAndLogoutPopup() {
    this.showEditUserAndLogoutPopup = !this.showEditUserAndLogoutPopup;
    this.showViewProfilePopup = false;
    this.showEditProfilePopup = false;
    this.showVerifyPasswordPopup = false;
    this.showChangeAvatarContainer = false;
  }

  toggleCurrentUserPopup(){
    this.showEditUserAndLogoutPopup = !this.showEditUserAndLogoutPopup
    this.showViewProfilePopup = !this.showViewProfilePopup;
  }

  /**
   * Toggles the visibility of the popup for viewing the user profile.
   */
  toggleViewProfile() {
    this.showViewProfilePopup = !this.showViewProfilePopup;
  }

  /**
   * Toggles the visibility of the popup for editing the user profile.
   */
  toggleEditProfile() {
    this.showEditProfilePopup = !this.showEditProfilePopup;
  }

  /**
   * Toggles the visibility of the container for changing the user's avatar.
   */
  toggleChangeAvatarContainer() {
    this.showChangeAvatarContainer = !this.showChangeAvatarContainer;
  }

  /**
   * Toggles the visibility of the popup for verifying the user's password.
   */
  toggleVerifyPassword() {
    this.showVerifyPasswordPopup = !this.showVerifyPasswordPopup;
  }

  /**
   * Toggles the visibility of the confirmation popup for profile changes.
   * The variable "showProfileChangeConfirmationPopup" will automatically set to false after 4.5 seconds.
   */
  toggleProfileChangeConfirmationPopup() {
    this.showProfileChangeConfirmationPopup = !this.showProfileChangeConfirmationPopup;
    
    setTimeout(() => {
      this.showProfileChangeConfirmationPopup = false;
    }, 3000);
  }

  toggleTaggableUsersPopup() {
    this.showTaggableUsersPopup = !this.showTaggableUsersPopup;
  }



  constructor() { }
}
