/**
 * This Service handles everything with Firestore Database 
 */

import { inject, Injectable } from '@angular/core';
import { collection, deleteDoc, doc, DocumentChange, DocumentData, Firestore, onSnapshot, query, setDoc } from '@angular/fire/firestore';
import { orderBy } from '@firebase/firestore';
import { User } from '../models/user.class';
import { Channel } from '../models/channel.class';
import { DateMessages, Message, Reaction } from '../models/message.class';
import { Conversation, Participants } from '../models/conversation.class';
import { Thread } from '../models/thread.class';
import { Upload } from '../interfaces/upload.interface';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {
  firestore = inject(Firestore);

  currentChannel: Channel = new Channel();
  currentConversation: Conversation = new Conversation();
  currentThread: Thread = new Thread();
  currentMessage: Message = new Message();
  users: User[] = []; // all users stored here
  channels: Channel[] = []; // all channels stored here
  conversations: Conversation[] = []; // all conversations stored here
  uploadInfos: Upload[] = [];

  messagesPerDay: any = []; // for channels
  messagesPerDayConversation: any = []; // for conversations
  messagesPerDayThread: any = []; // for thread

  constructor() { }

  getMessageFromId(id: string): Message{
    let returnMessage = new Message;
    this.channels.forEach(channel => {
      channel.messages.forEach(message => {
        if (message.id === id) {
          returnMessage = new Message(message);
        } 
      })
    });
    this.conversations.forEach(conversation => {
      conversation.messages.forEach(message => {
        if (message.id === id) {
          returnMessage = new Message(message);
        } 
      })
    })
    return returnMessage;
  }


   getFormattedDate(timestamp: number): string {
    const date = new Date(timestamp);
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  }


/**
 * Organizes messages by the day they were sent.
 * 
 * This function processes all messages in the current channel and groups them by the date they were sent.
 * Each group is represented by a `DateMessages` object, which contains a date and the corresponding list of messages sent on that date.
 * The result is stored in the `messagesPerDay` array, sorted by date.
 * 
 * The function relies on the `getFormattedDate()` method to convert a timestamp from
 * each message into a consistent date string format (`YYYY-MM-DD`).
 * 
 * @param messagesArr currentConversation or currentChannel
 */
  getMessagesPerDay() {
    this.messagesPerDay = [];
    let dayMap = new Map<string, Message[]>();
    this.currentChannel.messages.forEach((message) => {
    let messageDate = this.getFormattedDate(message.time);
    let messages = dayMap.get(messageDate);
    if (!messages) {
      messages = [];
      dayMap.set(messageDate, messages);
    }
    messages.push(message);
    });
    this.messagesPerDay = Array.from(
      dayMap,
      ([date, messages]) => 
        new DateMessages({
          date,
          messages
        })
    );
    
  }

  getMessagesPerDayForConversation() {
    this.messagesPerDayConversation = [];
    let dayMap = new Map<string, Message[]>();
    this.currentConversation.messages.forEach((message) => {
    let messageDate = this.getFormattedDate(message.time);
    let messages = dayMap.get(messageDate);
    if (!messages) {
      messages = [];
      dayMap.set(messageDate, messages);
    }
    messages.push(message);
    });
    this.messagesPerDayConversation = Array.from(
      dayMap,
      ([date, messages]) => 
        new DateMessages({
          date,
          messages
        })
    );
    
  }

  getMessagesPerDayForThread() {
    this.messagesPerDayThread = [];
    let dayMap = new Map<string, Message[]>();
    this.currentThread.messages.forEach((message) => {
    let messageDate = this.getFormattedDate(message.time);
    let messages = dayMap.get(messageDate);
    if (!messages) {
      messages = [];
      dayMap.set(messageDate, messages);
    }
    messages.push(message);
    });
    this.messagesPerDayThread = Array.from(
      dayMap,
      ([date, messages]) => 
        new DateMessages({
          date,
          messages
        })
    );
    
  }

  // ================= Helper Methods ========================

  /**
   * 
   * @param collRef Firebase Collection ID e.g. 'users' for Users
   * @returns the collection reference
   */
  getCollectionRef(collRef: string) {
    return collection(this.firestore, collRef);
  }

  /**
   * 
   * @param collRef Firebase Collection ID
   * @param docId Firebase Document ID
   * @returns the document reference
   */
  getDocumentRef(collRef: string, docId: string) {
    return doc(this.getCollectionRef(collRef), docId);
  }

  /**
   * Logging Changes in Firestore
   * call in onSnapshot method
   * @param change 
   */
  logChanges(change: DocumentChange<DocumentData>) {
    if (change.type === 'added') {
      //console.log('New Data ', change.doc.data());
    }
    if (change.type === 'modified') {
      //console.log('Modified Data: ', change.doc.data());
    }
    if (change.type === 'removed') {
      //console.log('Removed Data: ', change.doc.data());
    }
  }

  /**
   * Do not use for delete User!!
   * delete document from collection with id
   * @param docId document id
   * @param collection collection id
   */
  async deleteDocument(docId: string, collection: string) {
    let docRef = doc(this.getCollectionRef(collection), docId);
    await deleteDoc(docRef).catch((err) => {
      console.log('Error deleting Document', err);
    })
  }

  // ================= Upload Methods ========================

  getUploadList(){
    const uploadsRef = collection(this.firestore, 'uploads');
    return onSnapshot(uploadsRef, (list) => {
      this.uploadInfos = [];
      list.forEach((element) => {
        const upload = this.setUploadObject(element.data());
        this.uploadInfos.push(upload);
      })
    })
  }

  setUploadObject(upload: any): Upload{
    return {
      id: upload.id,
      originalFileName: upload.originalFileName,
      filePath: upload.filePath
    }
  }

  async saveUpload(upload: Upload){
    const id = upload.id;
    const uploadRef = doc(this.firestore, 'uploads', id);
    await setDoc(uploadRef, upload).catch((err) => {
      console.log('errorCode:', err.code);
      console.log('errorMessage:', err.message);
    })
  }

  async deleteUpload(upload: Upload) {
    const uploadRef = doc(this.firestore, 'uploads', upload.id);
    await deleteDoc(uploadRef);
  }


  // ================= User Methods ========================

  /** Call this method in app-components.ts
   *  unsubscribe it with ngOnDestroy
   * 
   * Listen to a firebase collection, realtime updates, unsubscribe it in ngOnDestroy
   * orderBy: is just a example, more options are possible, look in firebase docu.
   * calls the docChanges method for updates in console.log
   *
   * @returns A function to unsubscribe from the Firestore snapshot listener.
   */
  getUsersList() {
    const q = query(this.getCollectionRef('users'), orderBy('username'));
    return onSnapshot(q, (list) => {
      this.users = [];
      list.forEach((element) => {
        const user = this.setUserObject(element.data());
        this.users.push(user);
      });
      list.docChanges().forEach((change) => {
        this.logChanges(change);
      })
    })
  }

  /**
   * This method is for adding and updating User
   * @param user 
   */
  async addUser(user: any) {
    const userid = user.uid;
    const userRef = doc(this.firestore, 'users', userid);
    const userData = this.getCleanUserJson(user);
    await setDoc(userRef, userData).catch((err) => {
      console.log('Error adding User to Firebase', err);
    })
  }

  
  // ================= Channel Methods ========================

  /**
   * Called in app-components.ts for subscribing updates from firestore
   * @returns the channel list from firestore
   */
  getChannelList() {
    const q = query(this.getCollectionRef('channels'), orderBy('name'));
    return onSnapshot(q, (list) => {
      this.channels = [];
      list.forEach((element) => {
        const channel = this.setChannelObject(element.data());
        this.channels.push(channel);
      });
      list.docChanges().forEach((change) => {
        this.logChanges(change);
        const changedChannel = this.setChannelObject(change.doc.data());
        if (changedChannel.id === this.currentChannel.id) {
          this.currentChannel = new Channel(changedChannel);
        }
        this.getMessagesPerDay();
      })
    })
  }

  /**
   * Call this method to add or update a Channel
   */
  async addChannel(channel: any) {
    const channelId = channel.id;
    const channelRef = doc(this.firestore, 'channels', channelId);
    const channelData = this.getCleanChannelJson(channel);
    await setDoc(channelRef, channelData).catch((err) => {
      console.log('Error adding Channel to Firebase', err);
    })
  }

  // ================= Conversation Methods ======================== 

  getConversationList() {
    return onSnapshot(this.getCollectionRef('conversations'), (list) => {
      this.conversations = [];
      list.forEach((element) => {
        const conversation = this.setConversationObject(element.data());
        this.conversations.push(conversation);
      });
      list.docChanges().forEach((change) => {
        this.logChanges(change);
        const changedConversation = this.setConversationObject(change.doc.data());
        if (this.currentConversation.id === changedConversation.id) {
          this.currentConversation = new Conversation(changedConversation);
        }
        this.getMessagesPerDayForConversation();
      })
    })
  }

  /**
   * Call this method to add or update a Conversation
   */
  async addConversation(conversation: any) {
    const conversationId = conversation.id;
    const conversationRef = doc(this.firestore, 'conversations', conversationId);
    const conversationData = this.getCleanConversationJson(conversation);
    await setDoc(conversationRef, conversationData).catch((err)=>{
      console.log('Error adding Conversation to firebase', err);
    })
  }

  // ================= Return Json Methods ========================

  setConversationObject(conversation: any): Conversation {
    return {
      id: conversation.id || '',
      participants: conversation.participants || new Participants,
      messages: conversation.messages || [],
      active: conversation.active || false
    }
  }

  getCleanConversationJson(conversation: Conversation) {
    return {
      id: conversation.id,
      participants: this.getCleanParticipantsJson(conversation.participants),
      messages: conversation.messages.map(message => this.getCleanMessageJson(message))
    }
  }

  getCleanParticipantsJson(participant: Participants) {
    return {
      first: participant.first,
      second: participant.second
    }
  }

  getCleanChannelJson(channel: Channel) {
    return {
      id: channel.id,
      name: channel.name,
      time: channel.time,
      description: channel.description,
      creator: channel.creator,
      users: channel.users,
      messages: channel.messages.map(message => this.getCleanMessageJson(message))
    }
  }

  getCleanMessageJson(message: Message) {
    const cleanMessage: any = {
      id: message.id,
      time: message.time,
      sender: message.sender,
      content: message.content,
      data: message.data,
      reactions: message.reactions.map(reaction => this.getCleanReactionJson(reaction))
    };
    if (message.thread) {
      cleanMessage.thread = this.getCleanThreadJson(message.thread)
    }
    return cleanMessage;
  }

  getCleanReactionJson(reaction: Reaction) {
    return {
      counter: reaction.counter,
      id: reaction.id,
      fromUser: reaction.fromUser
    }
  }

  getCleanThreadJson(thread: Thread) {
    return {
      id: thread.id,
      rootMessage: thread.rootMessage || '',
      messages: thread.messages.map(message => this.getCleanMessageJson(message))
    }
  }

  
  /**
   * 
   * @param user 
   * @returns 
   */
  getCleanUserJson(user: User) {
    return {
      uid: user.uid,
      email: user.email,
      username: user.username,
      avatar: user.avatar,
      status: user.status,
      channelJoinRequestsSent: user.channelJoinRequestsSent || []
    };
  }

  /**
   * Returns a Object with Class Channel
   * used in getChannelList() 
   */
  setChannelObject(channel: any): Channel {
    return {
      id: channel.id || '',
      description: channel.description || '',
      name: channel.name || '',
      time: channel.time || 0,
      creator: channel.creator || '',
      users: channel.users || [],
      messages: channel.messages || [],
      comments: channel.comments || [],
      reactions: channel.reactions || [],
      data: channel.data || [],
      channelActive: channel.channelActive || false
    }
  }

  /**
   * 
   * @param user from firebase collection
   * @param id firebase id
   * @returns a UserInterface Object
   */
  setUserObject(user: any): User {
    return {
      uid: user.uid || '',
      email: user.email || '',
      username: user.username || '',
      createdAt: user.createdAt || 0,
      avatar: user.avatar || '',
      userChatActive: user.userChatActive || false,
      status: user.status || 'offline',
      channelJoinRequestsSent: user.channelJoinRequestsSent
    }
  }
}
