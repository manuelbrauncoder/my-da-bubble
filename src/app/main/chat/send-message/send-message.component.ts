import {
  Component,
  ElementRef,
  inject,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewChild,
  input
} from '@angular/core';
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
import { fadeIn } from '../../../shared/animations';
import { FireStorageService } from '../../../services/fire-storage.service';
import { EmojiPickerComponent } from '../../../shared/emoji-picker/emoji-picker.component';
import { ClickOutsideDirective } from '../../../directives/click-outside.directive';
import { AutofocusDirective } from '../../../directives/autofocus.directive';
import { User } from '../../../models/user.class';

@Component({
    selector: 'app-send-message',
    imports: [
        CommonModule,
        FormsModule,
        EmojiPickerComponent,
        ClickOutsideDirective,
        AutofocusDirective,
    ],
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

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() currentRecipient: Conversation | Channel = new Channel();
  readonly threadMessage = input(false);
  readonly newMessage = input(false);
  readonly newPlaceholder = input('');
  readonly userUid = input('');
  readonly disableInput = input(false);

  @ViewChild('textArea') textArea!: ElementRef;

  @ViewChild('uploadInput') uploadInput!: ElementRef;
  fileType: string | null = null;
  selectedFile: File | null = null;
  filePreview: string | ArrayBuffer | null | undefined = null;
  fileErrMsg = '';

  content: string = '';
  data = '';

  showEmojiPicker = false;

  taggedUsers: string[] = [];
  taggedChannels: string[] = [];

  /**
   * show all available users
   */
  toggleTagged() {
    this.content += '@';
    this.search();
    this.setFocus()
  }

  clearTaggedArrays() {
    this.taggedChannels = [];
    this.taggedUsers = [];
  }

  /**
   * Replaces the last '@' search term in the content with the selected username,
   * or appends the username if no search term is found.
   */
  setTaggedUser(username: string) {
    const searchTerm = this.getTermAfterAt(this.content);
    if (searchTerm) {
      const updatedContent = this.content.replace(
        this.getTermAfterAt(this.content),
        username + ' '
      );
      this.content = updatedContent;
    } else {
      this.content += `${username}`;
    }
    this.setFocus();
    this.clearTaggedArrays();
  }

  /**
   * Replaces the last '#' search term in the content with the selected channelname,
   * or appends the username if no search term is found.
   */
  setTaggedChannel(channelName: string) {
    const searchTerm = this.getTermAfterHash(this.content);
    if (searchTerm) {
      const updatedContent = this.content.replace(
        this.getTermAfterHash(this.content),
        channelName + ' '
      );
      this.content = updatedContent;
    } else {
      this.content += `${channelName} `;
    }
    this.setFocus();
    this.clearTaggedArrays();
  }

  /**
   * search for channels and users
   */
  search() {
    this.clearTaggedArrays();
    const searchTerm = this.content.toLowerCase();
    if (this.hasTaggedTermForUsers(searchTerm)) {
      const userTerm = this.getTermAfterAt(searchTerm);
      this.searchUsers(userTerm);
    }
    if (this.hasTaggedTermForChannels(searchTerm)) {
      const channelTerm = this.getTermAfterHash(searchTerm);
      this.searchChannels(channelTerm);
    }
  }

  /**
   * get the searchterm without @
   */
  getTermAfterAt(term: string): string {
    const atIndex = term.lastIndexOf('@');
    return atIndex !== -1 ? term.substring(atIndex + 1).trim() : '';
  }

  /**
   * get the searchterm without #
   */
  getTermAfterHash(term: string): string {
    const hashIndex = term.lastIndexOf('#');
    return hashIndex !== -1 ? term.substring(hashIndex + 1).trim() : '';
  }

  /**
   * Filters users based on the provided search term and adds matching usernames
   * to the `taggedUsers` array.
   */
  searchUsers(searchTerm: string) {
    const users: User[] = this.userService.fireService.users.filter((u) =>
      u.username.toLowerCase().trim().includes(searchTerm)
    );
    const userNames = users.map((u) => `${u.username}`);
    this.taggedUsers = [...this.taggedUsers, ...userNames];
  }

  /**
   * Filters channels based on the provided search term and adds matching channelnames
   * to the `taggedChannels` array.
   */
  searchChannels(searchTerm: string) {
    const channels: Channel[] = this.userService.fireService.channels.filter(
      (ch) => ch.name.toLowerCase().trim().includes(searchTerm)
    );
    const channelNames = channels.map((ch) => `${ch.name}`);
    this.taggedChannels = [...this.taggedChannels, ...channelNames];
  }

  hasTaggedTermForUsers(searchTerm: string) {
    return searchTerm.includes('@');
  }

  hasTaggedTermForChannels(searchTerm: string) {
    return searchTerm.includes('#');
  }

  isRecipientChannel() {
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

  setFocus() {
    this.textArea.nativeElement.focus();
  }

  closeEmojiPicker() {
    this.showEmojiPicker = false;
  }

  toggleEmojiPicker() {
    this.showEmojiPicker = !this.showEmojiPicker;
  }

  addEmojiToInput(emoji: string) {
    this.content += emoji;
    this.toggleEmojiPicker();
  }

  ngOnInit(): void {
    this.copyRecipient();
  }

  /**
   * Checks if the send button should be disabled.
   * @returns True if the input is disabled or no content/files are provided.
   */
  isBtnDisabled() {
    return (
      this.disableInput() ||
      (this.content.trim().length === 0 && this.selectedFile === null)
    );
  }

  /**
   * @returns different strings with channel name or user name
   */
  getPlaceholderText() {
    if (this.newMessage()) {
      return this.newPlaceholder();
    } else if (this.currentRecipient instanceof Conversation) {
      return `Nachricht an ${
        this.conversationService.getConversationPartner().username
      }`;
    } else {
      return `Nachricht an # ${this.currentRecipient.name}`;
    }
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
    if (!this.threadMessage()) {
      this.currentRecipient.messages.push(message);
    } else {
      this.createThreadInChannelMessage(message);
    }
    this.setDefaultsAndSyncMessages();
    await this.userService.fireService.addChannel(
      this.userService.fireService.currentChannel
    );
  }

  /**
   * Adds a message to a thread in the current channel.
   * @param {Message} message - The message to be added to the thread.
   */
  createThreadInChannelMessage(message: Message) {
    this.userService.fireService.currentThread.messages.push(message);
    const messageIndex = this.findChannelMessageToUpdate();
    this.userService.fireService.currentChannel.messages[messageIndex].thread =
      new Thread(this.userService.fireService.currentThread);
  }

  /**
   * set currentRecipient as new Conversation
   * create message object
   * push message to messages array in Conversation
   * update Conversation in firestore
   */
  async handleDirectMessage() {
    this.currentRecipient = new Conversation(
      this.currentRecipient as Conversation
    );
    const message = this.createMessage(this.content, this.data);
    if (!this.threadMessage()) {
      this.currentRecipient.messages.push(message);
    } else {
      this.createThreadInConversationMessage(message);
    }
    this.setDefaultsAndSyncMessages();
    await this.userService.fireService.addConversation(
      this.userService.fireService.currentConversation
    );
  }

  /**
   * Adds a message to a thread in the current conversation.
   * @param {Message} message - The message to be added to the thread.
   */
  createThreadInConversationMessage(message: Message) {
    this.userService.fireService.currentThread.messages.push(message);
    const messageIndex = this.findConversationMessageToUpdate();
    this.userService.fireService.currentConversation.messages[
      messageIndex
    ].thread = new Thread(this.userService.fireService.currentThread);
  }

  /**
   * Finds the index of the message to be updated in the current channel.
   * @returns The index of the message to update.
   */
  findChannelMessageToUpdate() {
    return this.userService.fireService.currentChannel.messages.findIndex(
      (message) =>
        message.id === this.userService.fireService.currentThread.rootMessage
    );
  }

  /**
   * Finds the index of the message to be updated in the current conversation.
   * @returns The index of the message to update.
   */
  findConversationMessageToUpdate() {
    return this.userService.fireService.currentConversation.messages.findIndex(
      (message) =>
        message.id === this.userService.fireService.currentThread.rootMessage
    );
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
      thread: new Thread(),
      data: data || '',
      reactions: [],
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
    if (!this.newMessage()) {
      return;
    } else {
      if (this.currentRecipient instanceof Conversation) {
        this.conversationService.openConversation(this.userUid());
      } else {
        this.channelService.toggleActiveChannel(this.currentRecipient, true);
      }
    }
  }

  clearUploadInput() {
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
        this.fileErrMsg = '*maximale Dateigröße ist 500kb';
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
  setidforFileInput() {
    if (this.threadMessage()) {
      return 'thread';
    } else {
      return 'chat';
    }
  }
}
