import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UiService } from '../../services/ui.service';
import { FirestoreService } from '../../services/firestore.service';
import { FirebaseAuthService } from '../../services/firebase-auth.service';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.class';
import {
  ImageCropperComponent,
  ImageCroppedEvent,
} from 'ngx-image-cropper';
import { FireStorageService } from '../../services/fire-storage.service';

@Component({
    selector: 'app-edit-profile',
    imports: [CommonModule, FormsModule, ImageCropperComponent],
    templateUrl: './edit-profile.component.html',
    styleUrl: './edit-profile.component.scss'
})
export class EditProfileComponent implements OnInit {
  uiService = inject(UiService);
  firestoreService = inject(FirestoreService);
  authService = inject(FirebaseAuthService);
  storageService = inject(FireStorageService);
  userService = inject(UserService);
  currentUsersAvatar = this.userService.getCurrentUsersAvatar();
  selectedAvatar: string = '';
  avatarIsChanged: boolean = false;
  nameIsChanged: boolean = false;
  emailIsChanged: boolean = false;
  selectedFile: File | null = null;
  showCropper = false;
  setCustomAvatar = false;

  updatedUser: User = new User();
  imageChangedEvent: Event | null = null;

  showFormContainer = true;

  editProfileData = {
    name: '',
    email: '',
  };

  doesProfileDataChanged(){
    return this.editProfileData.name !== this.userService.getCurrentUser().username && this.editProfileData.email !== this.userService.getCurrentUser().email;
  }

  fileChangeEvent(event: Event): void {
    this.imageChangedEvent = event;
    this.showCropper = true;
  }

  imageCropped(event: ImageCroppedEvent) {
    this.currentUsersAvatar = event.objectUrl!;
    this.setCustomAvatar = true;
    if (event.blob) {
      this.selectedFile = new File(
        [event.blob],
        `${this.userService.getCurrentUser().username.trim()}.png`,
        { type: 'image/png' }
      );
    }
  }

  /**
   * Initializes the component, setting the current user's name and email.
   * This method is called automatically by Angular when the component is created.
   */
  ngOnInit(): void {
    this.editProfileData.name = this.authService.auth.currentUser?.displayName!;
    this.editProfileData.email = this.authService.auth.currentUser?.email!;
  }

  isGuestUser() {
    return this.userService.getCurrentUser().email === 'guest@da-bubble.com';
  }

  async saveEdit(){
    if (this.userService.getCurrentUser().username !== this.editProfileData.name) {
      await this.saveNewName();
      if (this.userService.getCurrentUser().email === this.editProfileData.email) {
        this.uiService.toggleProfileChangeConfirmationPopup();
        this.closeProfilePopup();
        return;
      }
    }
    if (this.userService.getCurrentUser().email !== this.editProfileData.email) {
      this.authService.newEmailAddress = this.editProfileData.email;
      this.uiService.toggleVerifyPassword();
    } else {
      this.uiService.showEditUserAndLogoutPopup = false;
      this.uiService.showViewProfilePopup = false;
    }
}

  closeProfilePopup() {
    setTimeout(() => {
      this.uiService.showEditUserAndLogoutPopup = false;
      this.uiService.showViewProfilePopup = false;
    }, 3000);
  }

  /**
   * Opens the container for changing the user's avatar.
   * Retrieves the current avatar and displays the avatar selection UI.
   */
  openChangeAvatarContainer() {
    this.currentUsersAvatar = this.userService.getCurrentUsersAvatar();
    this.uiService.toggleChangeAvatarContainer();
    this.showFormContainer = false;
  }

  /**
   * Selects a new avatar for the user and updates the relevant data.
   * Marks the avatar as changed.
   *
   * @param {string} imgPath - The file path of the selected avatar image.
   */
  selectNewAvatar(imgPath: string) {
    this.avatarIsChanged = true;
    this.selectedAvatar = imgPath;
    this.currentUsersAvatar = imgPath;
    this.updatedUser = new User(this.userService.getCurrentUser());
    this.updatedUser.avatar = imgPath;
  }

  /**
   * Closes the avatar change container without saving changes.
   * Resets the avatar to the current user's avatar.
   */
  closeChangeAvatarContainer() {
    this.currentUsersAvatar = this.userService.getCurrentUsersAvatar();
    this.uiService.toggleChangeAvatarContainer();
    this.showFormContainer = true;
  }

  /**
   * Confirms the selected avatar and closes the avatar change container.
   * The avatar is not saved yet at this point.
   */
  async confirmNewSelectedAvatar() {
    if (this.setCustomAvatar) {
      await this.saveCustomAvatar();
    } else if (this.avatarIsChanged) {
      await this.firestoreService.addUser(this.updatedUser);
    }
    this.uiService.toggleChangeAvatarContainer();
    this.showFormContainer = true;
  }

  /**
   * Saves the new avatar if it has been changed.
   * Updates the user data in Firestore.
   */
  async saveCustomAvatar() {
    this.updatedUser = new User(this.userService.getCurrentUser());
    await this.storageService.uploadFile(this.selectedFile!);
    this.updatedUser.avatar = this.storageService.filePath;
    await this.firestoreService.addUser(this.updatedUser);
  }


  /**
   * Saves the new username in Firebase and Firestore.
   * Updates the username in the authentication system.
   */
  async saveNewName() {
    try {
      this.updatedUser = new User(this.userService.getCurrentUser());
      this.updatedUser.username = this.editProfileData.name;
      await this.firestoreService.addUser(this.updatedUser); // Hier könnte ein Fehler auftreten
      await this.authService.updateUsername(this.editProfileData.name); // Oder hier      
    } catch (err) {
      console.error("Error in saveNewName:", err);
    }
  }

  /**
   * Closes the edit profile view and the view profile view.
   */
  closeEditProfile() {
    this.uiService.toggleEditProfile();
  }
}
