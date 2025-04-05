import { Component, inject, Input, OnInit } from '@angular/core';
import { Message, Reaction } from '../../../models/message.class';
import { UiService } from '../../../services/ui.service';
import { FirestoreService } from '../../../services/firestore.service';
import { Thread } from '../../../models/thread.class';
import { UserService } from '../../../services/user.service';
import { CommonModule } from '@angular/common';
import { BreakpointObserverService } from '../../../services/breakpoint-observer.service';
import { ThreadService } from '../../../services/thread.service';
import { ReactionBarComponent } from './reaction-bar/reaction-bar.component';
import { FormsModule, NgForm } from '@angular/forms';
import { Channel } from '../../../models/channel.class';
import { Conversation } from '../../../models/conversation.class';
import { DataDetailViewComponent } from './data-detail-view/data-detail-view.component';
import { fadeIn } from '../../../shared/animations';
import { FireStorageService } from '../../../services/fire-storage.service';
import { EmojiPickerComponent } from '../../../shared/emoji-picker/emoji-picker.component';
import { EmojiComponent } from '@ctrl/ngx-emoji-mart/ngx-emoji';
import { ClickOutsideDirective } from '../../../directives/click-outside.directive';
import { AutofocusDirective } from '../../../directives/autofocus.directive';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { UserProfileComponent } from '../../../popups/user-profile/user-profile.component';

@Component({
  selector: 'app-single-message',
  standalone: true,
  animations: [fadeIn],
  imports: [
    CommonModule,
    ReactionBarComponent,
    FormsModule,
    DataDetailViewComponent,
    EmojiPickerComponent,
    EmojiComponent,
    ClickOutsideDirective,
    AutofocusDirective,
    UserProfileComponent,
  ],
  templateUrl: './single-message.component.html',
  styleUrl: './single-message.component.scss',
})
export class SingleMessageComponent implements OnInit {
  uiService = inject(UiService);
  fireService = inject(FirestoreService);
  userService = inject(UserService);
  observerService = inject(BreakpointObserverService);
  threadService = inject(ThreadService);
  fireStorageService = inject(FireStorageService);

  @Input() currentMessage: Message = new Message();
  @Input() threadMessage: boolean = false;

  showMenuPopup = false;
  editMode = false;
  updatedInChannel = false;
  showDataDetailView = false;
  showEmojiPicker = false;
  showEmojiPickerInEditMode = false;
  editContent = '';
  showReactionPopups: boolean[] = [];
  sanitizedUrl: SafeResourceUrl | null = null;
  showUserProfile = false;

  constructor(private sanitizer: DomSanitizer) {}

  ngOnInit(): void {
    this.currentMessage = new Message(this.currentMessage);
    this.loadSafeUrl();
  }

  openUserProfile() {
    if (this.userService.getCurrentUser().uid === this.currentMessage.sender) {
      this.uiService.toggleCurrentUserPopup();
    } else {
      this.uiService.currentUidForProfilePopup = this.currentMessage.sender;
      this.showUserProfile = true;
    }
  }

  closeUserProfile() {
    this.showUserProfile = false;
  }

  openPdfInNewTab() {
    window.open(`${this.currentMessage.data}`, '_blank');
  }

  loadSafeUrl() {
    this.sanitizedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
      this.currentMessage.data
    );
  }

  handleEditEmoji(emoji: string) {
    this.editContent += emoji;
  }

  toggleEditEmojiPicker() {
    this.showEmojiPickerInEditMode = !this.showEmojiPickerInEditMode;
  }

  clickOutsideEmojiPicker() {
    this.showEmojiPicker = false;
  }

  getReactionFrom(users: string[]) {
    const usernames = users.map(
      (user) => this.userService.getUserData(user).username
    );
    if (usernames.length === 1) {
      return usernames[0];
    } else if (usernames.length === 2) {
      return `${usernames[0]} und ${usernames[1]}`;
    } else {
      const allButLast = users.slice(0, -1).join(', ');
      const lastUser = users[users.length - 1];
      return `${allButLast} und ${lastUser}`;
    }
  }

  isPlural(counter: number) {
    return counter > 1 ? 'haben reagiert' : 'hat reagiert';
  }

  onMouseOver(index: number) {
    this.showReactionPopups[index] = true;
  }

  onMouseLeave(index: number) {
    this.showReactionPopups[index] = false;
  }

  toggleEmojiPicker() {
    this.showEmojiPicker = !this.showEmojiPicker;
  }

  async handleReaction(emoji: string) {
    const reaction = this.createNewReaction(emoji);
    const reactionIndex = this.currentMessage.reactions.findIndex(
      (r) => r.id === emoji
    );
    if (reactionIndex === -1) {
      this.addReactionToMessage(reaction);
    } else {
      const userIndex = this.currentMessage.reactions[
        reactionIndex
      ].fromUser.findIndex((u) => u === this.userService.getCurrentUser().uid);
      if (userIndex === -1) {
        this.increaseReactionCounter(reactionIndex);
      } else {
        this.decreaseReactionCounter(reactionIndex, userIndex);
      }
    }
    await this.saveMesssageWithReaction();
    this.showEmojiPicker = false;
  }

  addReactionToMessage(reaction: Reaction) {
    this.currentMessage.reactions.push(reaction);
  }

  increaseReactionCounter(reactionIndex: number) {
    this.currentMessage.reactions[reactionIndex].counter++;
    this.currentMessage.reactions[reactionIndex].fromUser.push(
      this.userService.getCurrentUser().uid
    );
  }

  decreaseReactionCounter(reactionIndex: number, userIndex: number) {
    this.currentMessage.reactions[reactionIndex].counter--;
    this.currentMessage.reactions[reactionIndex].fromUser.splice(userIndex, 1);
    if (this.currentMessage.reactions[reactionIndex].counter === 0) {
      this.currentMessage.reactions.splice(reactionIndex, 1);
    }
  }

  async saveMesssageWithReaction() {
    await this.handleChannelMessage();
    if (!this.updatedInChannel) {
      await this.handleConversationMessage();
    }
  }

  createNewReaction(emoji: string) {
    return new Reaction({
      counter: 1,
      id: emoji,
      fromUser: new Array(this.userService.getCurrentUser().uid),
    });
  }

  closeDataDetailView() {
    this.showDataDetailView = false;
  }

  openDataDetailView(path: string) {
    this.uiService.currentDataPath = path;
    this.showDataDetailView = true;
  }

  showEditContainer() {
    this.editMode = true;
    this.editContent = this.currentMessage.content;
    this.showMenuPopup = false;
  }

  cancelEditMode() {
    this.editContent = '';
    this.editMode = false;
  }

  async onKeyDownEnter(event: KeyboardEvent) {
    if (event.key === 'Enter' && this.editContent.trim().length > 0) {
      event.preventDefault();
      await this.saveEditedMessage();
    }
  }

  async onSubmit(ngForm: NgForm) {
    if (ngForm.valid && ngForm.submitted) {
      await this.saveEditedMessage();
    }
  }

  async saveEditedMessage() {
    this.currentMessage.content = this.editContent;
    await this.handleChannelMessage();
    if (!this.updatedInChannel) {
      await this.handleConversationMessage();
    }
  }

  /**
   * Handles message update in a channel.
   * Checks if the message is in the channel or in a thread and updates accordingly.
   */
  async handleChannelMessage() {
    const channel = this.fireService.currentChannel;
    const messageIndex = channel.messages.findIndex(
      (chMessage) => chMessage.id === this.currentMessage.id
    );
    if (messageIndex !== -1) {
      await this.updateMessageInChannelList(channel, messageIndex);
      this.updatedInChannel = true;
      return;
    }
    for (let message of channel.messages) {
      if (message.thread) {
        const threadMessageIndex = message.thread.messages.findIndex(
          (m) => m.id === this.currentMessage.id
        );
        if (threadMessageIndex !== -1) {
          await this.updateMessageInChannelThread(
            channel,
            message,
            threadMessageIndex
          );
          this.updatedInChannel = true;
          return;
        }
      }
    }
  }

  /**
   * update the message in thread and save updated channel in firebase
   * @param channel - the channel where the tread exists
   * @param message - the parent message containing the thread
   * @param threadMessageIndex  - the index of the message in thread
   */
  async updateMessageInChannelThread(
    channel: Channel,
    message: Message,
    threadMessageIndex: number
  ) {
    message.thread!.messages[threadMessageIndex] = this.currentMessage;
    await this.fireService.addChannel(channel);
    this.cancelEditMode();
  }

  /**
   * update the message in channel and save channel in firebase
   * @param channel
   * @param messageIndex
   */
  async updateMessageInChannelList(channel: Channel, messageIndex: number) {
    channel.messages[messageIndex] = this.currentMessage;
    await this.fireService.addChannel(channel);
    this.cancelEditMode();
  }

  /**
   * Handles message update in conversation.
   * Checks if the message is in the conversation or in a thread and updates it accordingly.
   * If the message is found in the main conversation messages, it updates it and returns.
   * Otherwise, it checks if the message is part of a thread and updates it there.
   * @returns when conversatin is updated
   */
  async handleConversationMessage() {
    const conversation = this.fireService.currentConversation;
    const messageIndex = conversation.messages.findIndex(
      (m) => m.id === this.currentMessage.id
    );
    if (messageIndex !== -1) {
      await this.updateMessageInConversationList(conversation, messageIndex);
      return;
    }
    for (let message of conversation.messages) {
      if (message.thread) {
        const threadMessageIndex = message.thread.messages.findIndex(
          (m) => m.id === this.currentMessage.id
        );
        if (threadMessageIndex !== -1) {
          await this.updateMessageInConversationThread(
            conversation,
            message,
            threadMessageIndex
          );
        }
      }
    }
  }

  /**
   *
   * @param conversation - The conversation where the thread exists.
   * @param message - The parent message containing the thread.
   * @param threadMessageIndex - The index from the message in the thread.
   */
  async updateMessageInConversationThread(
    conversation: Conversation,
    message: Message,
    threadMessageIndex: number
  ) {
    message.thread!.messages[threadMessageIndex] = this.currentMessage;
    await this.fireService.addConversation(conversation);
    this.cancelEditMode();
  }

  /**
   * Updates the message in the main conversation list and saves the updated conversation in Firebase.
   * @param conversation - The conversation containing the message.
   * @param messageIndex - The index of the message in the conversation.
   */
  async updateMessageInConversationList(
    conversation: Conversation,
    messageIndex: number
  ) {
    conversation.messages[messageIndex] = this.currentMessage;
    await this.fireService.addConversation(conversation);
    this.cancelEditMode();
  }

  toggleMenuPopup() {
    this.showMenuPopup = !this.showMenuPopup;
  }

  months = [
    'Januar',
    'Februar',
    'März',
    'April',
    'Mai',
    'Juni',
    'Juli',
    'August',
    'September',
    'Oktober',
    'November',
    'Dezember',
  ];

  weekdays = [
    'Montag',
    'Dienstag',
    'Mittwoch',
    'Donnerstag',
    'Freitag',
    'Samstag',
    'Sonntag',
  ];

  formatAnswerCount() {
    return this.currentMessage.thread?.messages.length === 1
      ? 'Antwort'
      : 'Antworten';
  }

  getFormattedDate() {
    const date = new Date(this.currentMessage.time);
    const weekday = this.weekdays[date.getDay()];
    const month = this.months[date.getMonth()];
    const day = date.getDate();
    return `${weekday}, ${day} ${month}`;
  }

  /**
   *
   * @param timeStamp unix timestamp
   * @returns formatted time
   */
  getFormattedTime(timeStamp: number) {
    const date = new Date(timeStamp);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')} Uhr`;
    return formattedTime;
  }

  /**
   *
   * @returns formatted time of last answer
   */
  getTimeOfLastAnswer() {
    if (this.currentMessage.thread) {
      if (this.currentMessage.thread.messages.length > 0) {
        return this.getFormattedTime(
          this.currentMessage.thread.messages[
            this.currentMessage.thread.messages.length - 1
          ].time
        );
      }
    }
    return;
  }

  /**
   *
   * @returns true if the messages has answers,
   * false if it has no ansers
   */
  messageHasAnswers() {
    if (this.currentMessage.thread) {
      if (this.currentMessage.thread.messages.length > 0) {
        return true;
      }
    }
    return false;
  }

  /**
   * show thread window with new or existing thread
   * set curent message in fire service with current message from input
   */
  answer() {
    this.threadService.scrolledToBottomOnStart = false;
    this.openThreadWindow();
    if (this.uiService.mainContent === 'directMessage') {
      this.setCurrentThreadForDm();
      this.fireService.currentMessage = new Message(this.currentMessage);
    } else if (this.uiService.mainContent === 'channelChat') {
      this.setCurrentThreadForChannel();
      this.fireService.currentMessage = new Message(this.currentMessage);
    }
  }

  openThreadWindow() {
    if (this.observerService.isMobile) {
      this.uiService.openThreadMobile();
    } else {
      this.uiService.showThread = true;
    }
  }

  /**
   * if the message already has a thread,
   * set this thread as currentThread.
   * if not, create a new Thread and set it
   * as currentThread and save it in firebase
   */
  async setCurrentThreadForChannel() {
    if (this.currentMessage.thread) {
      if (this.currentMessage.thread.messages.length > 0) {
        this.fireService.currentThread = new Thread(this.currentMessage.thread);
        this.fireService.getMessagesPerDayForThread();
      } else {
        this.fireService.currentThread = this.createThread();
        this.currentMessage.thread = this.fireService.currentThread;
        await this.saveUpdatedChannel();
        this.fireService.getMessagesPerDayForThread();
      }
    }
  }

  /**
   * if the message already has a thread,
   * set this thread as currentThread.
   * if not, create a new Thread and set it
   * as currentThread and save it in firebase
   */
  async setCurrentThreadForDm() {
    if (this.currentMessage.thread) {
      if (this.currentMessage.thread.messages.length > 0) {
        this.fireService.currentThread = new Thread(this.currentMessage.thread);
        this.fireService.getMessagesPerDayForThread();
      } else {
        this.fireService.currentThread = this.createThread();
        this.currentMessage.thread = this.fireService.currentThread;
        await this.saveUpdatedConversation();
        this.fireService.getMessagesPerDayForThread();
      }
    }
  }

  /**
   * Create a new thread with currentMessage as root message
   */
  createThread(): Thread {
    return new Thread({
      id: '',
      rootMessage: this.currentMessage.id,
      messages: [],
    });
  }

  async saveUpdatedConversation() {
    const currentMessageId = this.currentMessage.id;
    const updateId = this.fireService.currentConversation.messages.findIndex(
      (message) => message.id === currentMessageId
    );
    this.fireService.currentConversation.messages[updateId] =
      this.currentMessage;
    await this.fireService.addConversation(
      this.fireService.currentConversation
    );
  }

  async saveUpdatedChannel() {
    const currentMessageId = this.currentMessage.id;
    const updateId = this.fireService.currentChannel.messages.findIndex(
      (message) => message.id === currentMessageId
    );
    this.fireService.currentChannel.messages[updateId] = this.currentMessage;
    await this.fireService.addChannel(this.fireService.currentChannel);
  }
}
