/**
 * This Service handles different methods for User class
 */

import { inject, Injectable } from '@angular/core';
import { FirestoreService } from './firestore.service';
import { FirebaseAuthService } from './firebase-auth.service';
import { User } from '../models/user.class';
import { Message } from '../models/message.class';
import { SafeUrl } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  fireService = inject(FirestoreService)
  authService = inject(FirebaseAuthService);

  constructor() { }

  getUserData(userUid: string): User {
    const user = this.fireService.users.find(user => user.uid === userUid);
    if (user) {
      return user;
    } else {
      return new User();
    }
  }

  /**
   * 
   * @returns the current logged in User
   */
  getCurrentUser() {
    let currentUser: User = new User;
    if (this.authService.auth.currentUser) {
      const uid = this.authService.auth.currentUser.uid;
      const user = this.fireService.users.find(user => user.uid === uid);
      currentUser = new User(user);
    }
      return currentUser;
  }

  /**
   * 
   * @returns true if the message is from currentUser
   */
  isMessageFromCurrentUser(currentMessage: Message): boolean{
    const currentUser = this.getCurrentUser();
    if (currentUser) {
      if (currentUser.uid === currentMessage.sender) {
        return true;
      }
    }
    return false;
  }

  /**
   * this method returns the img path for the avatar
   * of the current logged in user
   * returns a fallback img if user has no avatar
   */
  getCurrentUsersAvatar(): string {
    if (this.authService.auth.currentUser) {
      const currentUserUid = this.authService.auth.currentUser.uid;
      const user = this.fireService.users.find(user => user.uid === currentUserUid);
      
      if (user && user.avatar) {
        return user.avatar;
      }
    }
    return 'assets/img/chars/profile_placeholder.png';
  }

   /**
   * set user avatar img
   * fallback to placeholder, if no img set
   * @param user 
   * @returns 
   */
   setAvatarImg(user: User){
    if (user.avatar !== '') {
      return user.avatar;
    } else {
      return 'assets/img/chars/profile_placeholder.png';
    }
  }
}
