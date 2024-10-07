/**
 * This service is for handling firebase Authentication
 */

import { inject, Injectable, signal } from '@angular/core';
import {
  Auth,
  AuthErrorCodes,
  createUserWithEmailAndPassword,
  deleteUser,
  EmailAuthProvider,
  GoogleAuthProvider,
  reauthenticateWithCredential,
  signInWithEmailAndPassword,
  signOut,
  updateEmail,
  updateProfile,
  user,
  signInWithPopup,
} from '@angular/fire/auth';
import { from, Observable } from 'rxjs';
import { AuthUser } from '../interfaces/auth-user';
import { FirestoreService } from './firestore.service';
import { UiService } from './ui.service';
import { Router } from '@angular/router';
import { Firestore } from '@angular/fire/firestore';
import { Channel } from '../models/channel.class';
import { IdleService } from './idle.service';

@Injectable({
  providedIn: 'root',
})
export class FirebaseAuthService {
  fireService = inject(FirestoreService);
  provider = new GoogleAuthProvider();
  auth = inject(Auth);
  user$ = user(this.auth);
  uiService = inject(UiService);
  newEmailAddress: string = '';
  updateEmail: boolean = false;
  loginTooLongAgo: boolean = false;
  googleUser: boolean = false;
  guestUser: boolean = false;
  idleService = inject(IdleService);
  showLoginErr = false;
  showConfirmationPopup = false;


  currentUserSig = signal<AuthUser | null | undefined>(undefined);

  constructor(private router: Router, private firestore: Firestore) {}

  /**
   * Stored Data from Registration Form
   */
  private tempRegData: {
    email: string;
    username: string;
    password: string;
  } | null = null;

  storeRegistrationData(email: string, username: string, password: string) {
    this.tempRegData = { email, username, password };
  }

  /**
   * Get the stored data
   */
  getStoredRegistrationData() {
    return this.tempRegData;
  }

  /**
   * Delete the stored data
   */
  clearStoredRegistrationData() {
    this.tempRegData = null;
  }

  /**
   * Google Login with a popup
   * Checks if user is already in the database or not
   * If not then saves a new user. If yes then update the data.
   */
  googleLogin() {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(this.auth, provider)
      .then(async (result) => {
        const user = result.user;
        this.googleUser = true;

        if (user) {
          const userData = {
            uid: user.uid,
            username: user.displayName || 'No Username',
            email: user.email || 'No Email',
            avatar: user.photoURL || 'default-avatar-url',
            status: 'online',
            createdAt: this.getCurrentTimestamp(),
          };

          let userExists = false;

          this.fireService.users.forEach((firestoreUser) => {
            if (user.uid === firestoreUser.uid) {
              this.fireService.addUser(userData);
              userExists = true;
            }
          });

          if (!userExists) {
            this.fireService.addUser(userData);
          }
        }
      })
      .catch((error) => {
        console.error('Google sign-in error:', error);
        this.logout();
      });
  }

  /**
   * Google Login with a redirect
   */
  // googleLoginRedirect() {
  //   const provider = new GoogleAuthProvider();
  //   return signInWithRedirect(this.auth, provider);
  // }

  /**
   * Google login with a redirect to the main page
   */
  // handleGoogleSignInRedirect() {
  //   return getRedirectResult(this.auth)
  //     .then((result) => {
  //       if (result) {
  //         const credential = GoogleAuthProvider.credentialFromResult(result);
  //         const token = credential?.accessToken;
  //         const user = result.user;
  //         console.log(credential, token, user);
  //         this.router.navigate(['/dabubble']);
  //       }
  //     })
  //     .catch((err) => {
  //       const errorCode = err.code;
  //       const errorMessage = err.message;
  //       const email = err.customData.email;
  //       const credential = GoogleAuthProvider.credentialFromError(err);
  //       console.warn(errorCode, errorMessage, email, credential);
  //     });
  // }

  /**
   * Registers a new user with Firebase Authentication.
   *
   * This function creates a new user account with the provided email and password.
   * After successfully registering, it updates the user's profile with the provided username (displayName) and
   * save the new user with the uid in firestore
   *
   * @param {string} email
   * @param {string} username
   * @param {string} password
   * @returns {Observable<void>} An observable that completes when the user is successfully registered and the profile is updated.
   */
  register(
    email: string,
    username: string,
    password: string,
    avatar: string
  ): Observable<void> {
    const promise = createUserWithEmailAndPassword(this.auth, email, password)
      .then((response) => {
        this.handleUserData(response, email, username, avatar);
      })
      .catch((err) => {
        console.error('Error register new User', err);
        throw err;
      });
    return from(promise);
  }

  handleUserData(
    response: any,
    email: string,
    username: string,
    avatar: string
  ) {
    updateProfile(response.user, { displayName: username });
    this.saveNewUserInFirestore(email, username, response.user.uid, avatar);
    this.addNewUserToWelcomeChannel(response.user.uid);
    this.currentUserSig.set({
      email: response.user.email!,
      username: response.user.displayName!,
      uid: response.user.uid!,
    });
  }

  addNewUserToWelcomeChannel(uid: string) {
    const channelIndex = this.fireService.channels.findIndex(
      (channel) => channel.name.toLowerCase() === 'welcome'
    );
    if (channelIndex !== -1) {
      const channel = new Channel(this.fireService.channels[channelIndex]);
      channel.users.push(uid);
      this.fireService.addChannel(channel);
    }
  }

  async saveNewUserInFirestore(
    email: string,
    username: string,
    uid: string,
    avatar: string
  ) {
    let newUser = {
      uid: uid,
      username: username,
      email: email,
      createdAt: this.getCurrentTimestamp(),
      avatar: avatar,
      status: 'online',
    };
    await this.fireService.addUser(newUser);
  }

  getCurrentTimestamp() {
    const now = new Date();
    return now.getTime();
  }

  /**
   * Call this method for updating the username
   * @param newName new username
   */
  updateUsername(newName: string) {
    const currentUser = this.auth.currentUser;
    if (currentUser) {
      updateProfile(currentUser, { displayName: newName })
        .then(() => {
          this.currentUserSig.set({
            username: newName,
            email: currentUser.email!,
            uid: currentUser.uid,
          });
        })
        .catch((err) => {
          console.log('Error updating Username', err);
        });
    }
  }

  /**
   * Logs in a user with Firebase Authentication.
   *
   * If the login is successful, it changes the login state in firestore
   *
   * @returns {Observable<void>} An observable that completes when the login process is successful.
   */
  login(email: string, password: string): Observable<void> {
    const promise = signInWithEmailAndPassword(this.auth, email, password)
      .then((response) => {
        this.changeLoginState('online', response.user.uid);
        this.idleService.startWatching();
        this.router.navigate(['/dabubble']);
      })
      .catch((error) => {
        this.showLoginErr = true;
      });
    return from(promise);
  }

  /**
   * changes login state in firestore
   * call this method after login and logout
   *
   * @param loggedInState true after login, false after logout
   * @param uid
   */
  changeLoginState(userStatus: 'online' | 'offline' | 'away', uid: string) {
    this.fireService.users.forEach((user) => {
      if (uid === user.uid) {
        user.status = userStatus;
        this.fireService.addUser(user);
      }
    });
  }

  /**
   * this method logs out the current user
   * and change the login state in firestore
   * @returns an observable that completes when logout is successful.
   */
  logout(): Observable<void> {
    const currentUserUid = this.currentUserSig()?.uid;
    const promise = signOut(this.auth)
      .then(() => {
        this.changeLoginState('offline', currentUserUid!);
        this.guestUser = false;
        this.googleUser = false;
      })
      .catch((err) => {
        console.log('Error logging User out', err);
      });
    return from(promise);
  }

  /**
   * call this method for guest login
   */
  guestLogin() {
    const guestEmail = 'guest@da-bubble.com';
    const guestPw = '123456';
    this.login(guestEmail, guestPw);
    this.guestUser = true;
    this.idleService.startWatching();
  }

  /**
   * call this method to sign up guest
   * only once needed
   */
  guestSignUp() {
    const guestEmail = 'guest@gmail.com';
    const guestPw = '123456';
    const userName = 'Guest';
    const guestAvatar = './assets/img/chars/profile_placeholder.png';

    this.register(guestEmail, userName, guestPw, guestAvatar);
  }

  /**
   * this method deletes the currently logged in user account.
   * then it deletes the user in firestore
   */
  deleteUserAccount() {
    const currentUser = this.auth.currentUser;
    if (currentUser) {
      deleteUser(currentUser)
        .then(() => {
          console.log('User deleted', currentUser);
          this.deleteUserInFirestore(currentUser.uid);
        })
        .catch((err) => {
          console.log('Error deleting User', err);
        });
    } else {
      console.log('No user is currently logged in.');
    }
  }

  /**
   * deletes the user with uid in firestore
   * @param uid
   */
  deleteUserInFirestore(uid: string) {
    this.fireService.users.forEach((user) => {
      if (uid === user.uid) {
        this.fireService.deleteDocument(user.uid, 'users');
      }
    });
  }

  /**
   * This method is for updating the users email
   * If the last login was too long ago, the user has to be re-authenticate
   * We need a popup, where the user can log in again
   * in this popup, call the reAuthenticateUser() method
   * after that, the user can update his email
   * @param newEmail
   */
  updateUserEmail(newEmail: string) {
    const currentUser = this.auth.currentUser;
    if (currentUser) {
      updateEmail(currentUser, newEmail)
        .then(() => {
          this.handleEmailUpdating(currentUser, newEmail);
        })
        .catch((err) => {
          this.handleUpdateEmailError(err);
        });
    }
  }

  handleEmailUpdating(currentUser: any, newEmail: string) {
    this.uiService.toggleProfileChangeConfirmationPopup();
    this.fireService.users.forEach((user) => {
      if (currentUser.uid === user.uid) {
        user.email = newEmail;
        this.fireService.addUser(user);
      }
    });
  }

  handleUpdateEmailError(err: string) {
    let code = AuthErrorCodes.EMAIL_CHANGE_NEEDS_VERIFICATION;
    if (code) {
      this.loginTooLongAgo = true;
      this.uiService.toggleVerifyPassword();
    }
    console.log(err);
  }

  /**
   * This method is for reauthenticate the user
   */
  reAuthenticateUser(email: string, password: string) {
    const credential = EmailAuthProvider.credential(email, password);
    if (this.auth.currentUser) {
      reauthenticateWithCredential(this.auth.currentUser, credential)
        .then(() => {
          console.log('User reauthenticated', email, password, credential);
          if (this.updateEmail) {
            this.updateUserEmail(this.newEmailAddress);
          }
        })
        .catch((err) => {
          console.warn('Error', err);
        });
    }
  }
}
