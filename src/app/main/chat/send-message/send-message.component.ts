import { Component, ElementRef, inject, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { Channel } from '../../../models/channel.class';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FirebaseAuthService } from '../../../services/firebase-auth.service';
import { UserService } from '../../../services/user.service';
import { Message } from '../../../models/message.class';
import { Conversation } from '../../../models/conversation.class';
import { Thread } from '../../../models/thread.class';
import { UiService } from '../../../services/ui.service';
import { ChannelService } from '../../../services/channel.service';
import { ConversationService } from '../../../services/conversation.service';
import { ThreadService } from '../../../services/thread.service';
import { PopupTaggableUsersComponent } from '../popup-taggable-users/popup-taggable-users.component';
import { fadeIn } from '../../../shared/animations';
import { FireStorageService } from '../../../services/fire-storage.service';
import { EmojiPickerComponent } from '../../../shared/emoji-picker/emoji-picker.component';
import { ClickOutsideDirective } from '../../../shared/directives/click-outside.directive';
import { AutofocusDirective } from '../../../shared/directives/autofocus.directive';

@Component({
  selector: 'app-send-message',
  standalone: true,
  imports: [CommonModule, FormsModule, PopupTaggableUsersComponent, EmojiPickerComponent, ClickOutsideDirective, AutofocusDirective],
  animations: [fadeIn],
  templateUrl: './send-message.component.html',
  styleUrl: './send-message.component.scss'
})
export class SendMessageComponent implements OnInit, OnChanges {
  authService = inject(FirebaseAuthService);
  userService = inject(UserService);
  storageService = inject(FireStorageService);
  uiService = inject(UiService);
  channelService = inject(ChannelService);
  conversationService = inject(ConversationService);
  threadService = inject(ThreadService);

  @Input() currentRecipient: Conversation | Channel = new Channel;
  @Input() threadMessage = false;
  @Input() newMessage = false;
  @Input() newPlaceholder = '';
  @Input() userUid = '';
  @Input() disableInput = false;

  @ViewChild('textArea') textArea!: ElementRef;

  @ViewChild('uploadInput') uploadInput!: ElementRef;
  fileType: string | null = null;
  selectedFile: File | null = null;
  filePreview: string | ArrayBuffer | null | undefined = null;
  fileErrMsg = '';

  content: string = '';
  data = '';

  showEmojiPicker = false;

  isRecipientChannel(){
    return this.currentRecipient instanceof Channel;
  }

  onKeyDownEnter(event: KeyboardEvent) {
    if (event.key === 'Enter' && !this.isBtnDisabled()) {
      event.preventDefault();      
      this.saveNewMessage();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['currentRecipient']) {
      if (this.textArea) {
        this.setFocus();
      }
    }
  }

  setFocus(){
    this.textArea.nativeElement.focus();
  }

  closeEmojiPicker(){
    this.showEmojiPicker = false;
  }

  toggleEmojiPicker(){
    this.showEmojiPicker = !this.showEmojiPicker;
  }

  addEmojiToInput(emoji: string){
    this.content += emoji;
    this.toggleEmojiPicker();
  }

  /**
   * Angular lifecycle hook - Called when the component is initialized.
   * Copies the current recipient (either Channel or Conversation).
   */
  ngOnInit(): void {
    this.copyRecipient();
  }

  /**
   * Checks if the send button should be disabled.
   * @returns True if the input is disabled or no content/files are provided.
   */
  isBtnDisabled() {
    return this.disableInput || (this.content.trim().length === 0 && this.selectedFile === null);
    
  }

  /**
   * @returns different strings with channel name or user name
   */
  getPlaceholderText() {
    if (this.newMessage) {
      return this.newPlaceholder;
    } else if (this.currentRecipient instanceof Conversation) {
      return `Nachricht an ${this.conversationService.getConversationPartner().username}`;
    } else {
      return `Nachricht an # ${this.currentRecipient.name}`;
    }
  }

  /**
   * Toggles the popup for selecting taggable users.
   */
  showTaggableUsers() {
    this.uiService.toggleTaggableUsersPopup();
  }

  /**
   * Adds a tagged user's username to the message content.
   * @param {string} username - The username of the tagged user.
   */
  displayTaggedUser(username: string) {
    this.content += `@${username} `;
  }

  /**
   * create of copy of User or Channel
   */
  copyRecipient() {
    if (this.currentRecipient instanceof Conversation) {
      this.currentRecipient = new Conversation(this.currentRecipient);
    } else {
      this.currentRecipient = new Channel(this.currentRecipient);
    }
  }

  /**
   * set currentRecipient as new Channel
   * create message object
   * push message to messages array in channel
   * update channel in firestore
   */
  async handleChannelMessage() {
    this.currentRecipient = new Channel(this.currentRecipient as Channel);
    const message = this.createMessage(this.content, this.data);
    if (!this.threadMessage) {
      this.currentRecipient.messages.push(message);
    } else {
      this.createThreadInChannelMessage(message);
    }
    this.setDefaultsAndSyncMessages();
    await this.userService.fireService.addChannel(this.userService.fireService.currentChannel);
  }

  /**
   * Adds a message to a thread in the current channel.
   * @param {Message} message - The message to be added to the thread.
   */
  createThreadInChannelMessage(message: Message) {
    console.log('thread channel message!');
    this.userService.fireService.currentThread.messages.push(message);
    const messageIndex = this.findChannelMessageToUpdate();
    this.userService.fireService.currentChannel.messages[messageIndex].thread = new Thread(this.userService.fireService.currentThread);
  }

  /**
   * set currentRecipient as new Conversation
   * create message object
   * push message to messages array in Conversation
   * update Conversation in firestore
   */
  async handleDirectMessage() {
    this.currentRecipient = new Conversation(this.currentRecipient as Conversation);
    const message = this.createMessage(this.content, this.data);
    if (!this.threadMessage) {
      this.currentRecipient.messages.push(message);
    } else {
      this.createThreadInConversationMessage(message);
    }
    this.setDefaultsAndSyncMessages();    
    await this.userService.fireService.addConversation(this.userService.fireService.currentConversation);
  }

  /**
   * Adds a message to a thread in the current conversation.
   * @param {Message} message - The message to be added to the thread.
   */
  createThreadInConversationMessage(message: Message) {
    this.userService.fireService.currentThread.messages.push(message);
    const messageIndex = this.findConversationMessageToUpdate();
    this.userService.fireService.currentConversation.messages[messageIndex].thread = new Thread(this.userService.fireService.currentThread);
  }

  /**
   * Finds the index of the message to be updated in the current channel.
   * @returns The index of the message to update.
   */
  findChannelMessageToUpdate() {
    return this.userService.fireService.currentChannel.messages.findIndex(message => message.id === this.userService.fireService.currentThread.rootMessage);
  }

  /**
   * Finds the index of the message to be updated in the current conversation.
   * @returns The index of the message to update.
   */
  findConversationMessageToUpdate() {
    return this.userService.fireService.currentConversation.messages.findIndex(message => message.id === this.userService.fireService.currentThread.rootMessage);
  }

  /**
   * @param content from the message
   * @returns a Message Object
   */
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

  /**
   * handle differtent recipients (channel or direct message)
   */
  async saveNewMessage() {
    if (this.selectedFile) {
      await this.storageService.uploadFile(this.selectedFile);
      this.data = this.storageService.filePath;
    }
    if (this.currentRecipient instanceof Channel) {
      await this.handleChannelMessage();
      this.channelService.scrolledToBottomOnStart = false;
    } else {
      await this.handleDirectMessage();
      this.conversationService.scrolledToBottomOnStart = false;
    }
  }

  /**
   * Resets default values after sending a message and syncs message data.
   */
  setDefaultsAndSyncMessages() {
    this.userService.fireService.getMessagesPerDayForThread();
    this.content = '';
    this.data = '';
    this.filePreview = null;
    this.selectedFile = null;
    this.threadService.scrolledToBottomOnStart = false;
    this.redirectToChat();
  }

  /**
   * Redirects the user back to the chat after sending a message.
   */
  redirectToChat() {
    if (!this.newMessage) {
      return;
    } else {
      if (this.currentRecipient instanceof Conversation) {
        this.conversationService.openConversation(this.userUid);
      } else {
        this.channelService.toggleActiveChannel(this.currentRecipient, true);
      }
    }
  }

  clearUploadInput(){
    this.uploadInput.nativeElement.value = '';
    this.filePreview = null;
    this.selectedFile = null;
  }

  onFileSelected(event: Event) {
    this.fileErrMsg = '';
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];
      if (this.selectedFile.size > 500 * 1024) {
        this.clearUploadInput();
        this.fileErrMsg = '*maximale Dateigröße ist 500kb'
      } else {
        this.fileType = this.selectedFile.type;
        this.setFilePreview();
      }
    }
  }

  setFilePreview() {
    const reader = new FileReader();
      reader.onload = (e) => {
        this.filePreview = e.target?.result;
      };
    if (this.fileType!.startsWith('image/')) {
      
      reader.readAsDataURL(this.selectedFile!);
    } else {
      this.filePreview = null;
    }
  }

  /**
   * Sets the ID for the file input based on the message type (thread or chat).
   * @returns The input ID.
   */
  setidforFileInput(){
    if (this.threadMessage) {
      return 'thread';
    } else {
      return 'chat';
    }
  }
}