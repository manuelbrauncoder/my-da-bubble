import { CommonModule } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FirestoreService } from '../../services/firestore.service';
import { Channel } from '../../models/channel.class';
import { UserService } from '../../services/user.service';
import { Message } from '../../models/message.class';
import { User } from '../../models/user.class';
import { ChannelService } from '../../services/channel.service';
import { FilterMessagePipe } from '../../pipes/filter-message.pipe';
import { TruncateStringPipe } from '../../pipes/truncate-string.pipe';
import { ConversationService } from '../../services/conversation.service';
import { Conversation } from '../../models/conversation.class';
import { BreakpointObserverService } from '../../services/breakpoint-observer.service';
import { UiService } from '../../services/ui.service';
import { Thread } from '../../models/thread.class';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [CommonModule, FormsModule, FilterMessagePipe, TruncateStringPipe],
  templateUrl: './search-bar.component.html',
  styleUrl: './search-bar.component.scss'
})
export class SearchBarComponent {
  @Input() showInWorkspaceMenu = false;
  @Input() placeholderText = 'Devspace durchsuchen';

  fireService = inject(FirestoreService);
  userService = inject(UserService);
  channelService = inject(ChannelService);
  conversationService = inject(ConversationService);
  observerService = inject(BreakpointObserverService);
  uiService = inject(UiService);

  channel: Channel = new Channel();

  searchInput = '';

  filteredUsers: User[] = [];
  filteredChannels: Channel[] = [];
  filteredMessages: Message[] = [];

  openThreadWindow() {
    if (this.observerService.isMobile) {
      this.uiService.openThreadMobile();
    } else {
      this.uiService.showThread = true;
    }
  }

  resetSearch() {
    this.searchInput = '';
    this.filteredUsers = [];
    this.filteredChannels = [];
    this.filteredMessages = [];
  }

  redirectToChannel(channel: Channel, messageId?: string) {
    this.channelService.toggleActiveChannel(channel, true);
    this.resetSearch();
    if (messageId) {
      setTimeout(() => {
        this.scrollToMessage(messageId);
      }, 100);
    }
  }

  redirectToConversation(secondUserUid: string, messageId?: string) {
    this.conversationService.openConversation(secondUserUid);
    this.resetSearch();
    if (messageId) {
      setTimeout(() => {
        this.scrollToMessage(messageId);
      }, 100);
    }
  }

  async redirectToThreadInConversation(secondUid: string, messageId: string) {
    await this.conversationService.openConversation(secondUid);
    this.fireService.currentConversation.messages.forEach(message => {
      if (message.thread) {
        message.thread.messages.forEach(tm => {
          if (tm.id === messageId) {
            this.openThreadWindow();
            this.fireService.currentThread = new Thread(message.thread);
            this.fireService.getMessagesPerDayForThread();
            setTimeout(() => {
              this.scrollToMessage(`thread-${messageId}`);
            }, 300);
          }
        });
      }
    })
  }

  async redirectToThreadInChannel(channel: Channel, messageId: string) {
    this.channelService.toggleActiveChannel(channel, false);
    this.fireService.currentChannel.messages.forEach(message => {
      if (message.thread) {
        message.thread.messages.forEach(tm => {
          if (tm.id === messageId) {
            this.openThreadWindow();
            this.fireService.currentThread = new Thread(message.thread);
            this.fireService.getMessagesPerDayForThread();
            setTimeout(() => {
              this.scrollToMessage(`thread-${messageId}`);
            }, 300);
          }
        });
      }
    });
  }

  scrollToMessage(messageId: string) {
    setTimeout(() => {
      const element = document.getElementById(messageId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 300);

  }

  redirectToMessage(message: Message) {
    this.isMessageInChannel(message);  // search message in channel
    this.isMessageInConversation(message);   // search message in conersation
  }

  /**
   * loop over conversations and every message in conversation
   * @param message 
   */
  isMessageInConversation(message: Message) {
    this.fireService.conversations.forEach(conversation => {
      conversation.messages.forEach(m => {
        this.searchMessageInConversation(m, message.id, conversation);
      });
    });
  }

  /**
   * search messageId in thread.messages,
   * if not found, search in thread
   * @param message from array
   * @param messageId to find
   * @param conversation to search for messages
   */
  searchMessageInConversation(message: Message, messageIdToFind: string, conversation: Conversation) {
    const secondUid = this.userService.getCurrentUser().uid === conversation.participants.first ? conversation.participants.second : conversation.participants.first;
    if (message.id === messageIdToFind) {
      this.redirectToConversation(secondUid, `conversation-${messageIdToFind}`);
      return;
    }
    if (message.thread) {
      const matchingThreadMessages = message.thread.messages.filter(tm => tm.id === messageIdToFind);
      if (matchingThreadMessages.length > 0) {
        this.redirectToThreadInConversation(secondUid, messageIdToFind);
        return;
      }
    }
  }

  isMessageInChannel(message: Message) {
    this.fireService.channels.forEach(channel => {
      channel.messages.forEach(m => {
        this.searchMessageInChannel(m, message.id, channel);
      });
    });
  }


  searchMessageInChannel(message: Message, messageIdToFind: string, channel: Channel) {
    if (message.id === messageIdToFind) { // wenn die message in messages gefunden wurde
      this.redirectToChannel(channel, `channel-${messageIdToFind}`);
      console.log('Message is in Channel');
      return; // funktion abbrechen wenn message gefunden wurde
    }
    if (message.thread) {  // message im thread suchen
      const matchingThreadMessages = message.thread.messages.filter(tm => tm.id === messageIdToFind); // sucht die thread messages nach der message ab
      if (matchingThreadMessages.length > 0) {
        this.redirectToThreadInChannel(channel, messageIdToFind);
        console.log('Message in thread');
        return;
      }
    }
  }

  // for search function

  search() {
    const searchTerm = this.searchInput.toLowerCase();
    if (searchTerm) {
      this.resetSearch();
      this.searchUsers(searchTerm);
      this.searchChannels(searchTerm);
      this.searchMessages(searchTerm);
    } else {
      this.resetSearch();
    }
  }

  searchMessages(searchTerm: string) {
    this.fireService.channels.forEach(channel => {
      channel.messages.forEach(message => {
        if (this.isMessageMatching(message, searchTerm)) {
          this.filteredMessages.push(message);
        }
      });
    });
    this.fireService.conversations.forEach(conversation => {
      conversation.messages.forEach(message => {
        if (this.isMessageMatching(message, searchTerm)) {
          this.filteredMessages.push(message);
        }
      });
    });
  }

  isMessageMatching(message: Message, searchTerm: string) {
    if (message.content.toLowerCase().includes(searchTerm)) {
      return true;
    }
    if (message.thread) {
      const matchingThreadMessages = message.thread.messages.filter(threadMessage =>
        threadMessage.content.toLowerCase().includes(searchTerm)
      );
      if (matchingThreadMessages.length > 0) {
        this.filteredMessages.push(...matchingThreadMessages);
      }
    }
    return false;
  }


  searchUsers(searchTerm: string) {
    this.filteredUsers = this.fireService.users
      .filter(user => user.username.toLowerCase().includes(searchTerm) || user.email.toLowerCase().includes(searchTerm))
      .map(user => new User(user));
  }

  searchChannels(searchTerm: string) {
    this.filteredChannels = this.fireService.channels
      .filter(channel => channel.name.toLowerCase().includes(searchTerm))
      .map(channel => new Channel(channel));
  }

  logAll() {
    console.log('Filtered Users:', this.filteredUsers);
    console.log('Filtered Channels:', this.filteredChannels);
    console.log('Filtered Messages:', this.filteredMessages);
  }
}
