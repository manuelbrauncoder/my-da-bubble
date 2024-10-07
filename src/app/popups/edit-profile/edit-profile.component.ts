import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UiService } from '../../services/ui.service';
import { FirestoreService } from '../../services/firestore.service';
import { FirebaseAuthService } from '../../services/firebase-auth.service';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.class';


@Component({
  selector: 'app-edit-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-profile.component.html',
  styleUrl: './edit-profile.component.scss',
})
export class EditProfileComponent implements OnInit {
  uiService = inject(UiService);
  firestoreService = inject(FirestoreService);
  authService = inject(FirebaseAuthService);
  userService = inject(UserService);
  currentUsersAvatar = this.userService.getCurrentUsersAvatar();
  selectedAvatar: string = '';
  avatarIsChanged: boolean = false;
  nameIsChanged: boolean = false;
  emailIsChanged: boolean = false;
  selectedFile: File | null = null;

  updatedUser: User = new User();

  editProfileData = {
    name: '',
    email: '',
  };


  /**
   * Initializes the component, setting the current user's name and email.
   * This method is called automatically by Angular when the component is created.
   */
  ngOnInit(): void {
    this.editProfileData.name = this.authService.auth.currentUser?.displayName!;
    this.editProfileData.email = this.authService.auth.currentUser?.email!;
  }

  isGuestUser(){
    return this.userService.getCurrentUser().email === 'guest@da-bubble.com';
  }


  /**
   * Saves the edited profile data if any changes have been made.
   * Handles saving of the new avatar, name, and email.
   *
   * @param {string} newName - The new name entered by the user.
   * @param {string} newEmail - The new email address entered by the user.
   */
  async saveEdit(newName: string, newEmail: string) {
    if (this.avatarIsChanged) {
      this.saveNewAvatar();
      this.uiService.toggleProfileChangeConfirmationPopup();
    } else if (this.nameIsChanged || this.emailIsChanged && !this.authService.loginTooLongAgo) {
      this.saveNewAvatar();
      await this.saveNewName();
      this.saveNewEmailAddress(newEmail);
    }
  }


  /**
   * Placeholder method for uploading a custom profile picture.
   * This method is not yet implemented.
   */
  uploadOwnPicture(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.selectedAvatar = e.target.result;
        this.selectNewAvatar(this.selectedAvatar);
      };
      reader.readAsDataURL(file);
    }
  }


  /**
   * Opens the container for changing the user's avatar.
   * Retrieves the current avatar and displays the avatar selection UI.
   */
  openChangeAvatarContainer() {
    this.currentUsersAvatar = this.userService.getCurrentUsersAvatar();
    this.uiService.toggleChangeAvatarContainer();
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
    console.log(this.updatedUser);
  }


  /**
   * Closes the avatar change container without saving changes.
   * Resets the avatar to the current user's avatar.
   */
  closeChangeAvatarContainer() {
    this.currentUsersAvatar = this.userService.getCurrentUsersAvatar();
    this.uiService.toggleChangeAvatarContainer();
  }


  /**
   * Confirms the selected avatar and closes the avatar change container.
   * The avatar is not saved yet at this point.
   */
  confirmNewSelectedAvatar() {
    this.uiService.toggleChangeAvatarContainer();
  }


  /**
   * Saves the new avatar if it has been changed.
   * Updates the user data in Firestore.
   */
  saveNewAvatar() {
    if (this.avatarIsChanged) {
      this.firestoreService.addUser(this.updatedUser);
      this.avatarIsChanged = false;
      this.closeEditProfile();
    }
  }


  /**
   * Marks the user's name as changed.
   */
  onNameChange() {
    this.nameIsChanged = true;
  }


  /**
   * Saves the new username in Firebase and Firestore.
   * Updates the username in the authentication system.
   */
  async saveNewName() {
    if (this.nameIsChanged) {
      this.updatedUser = new User(this.userService.getCurrentUser());
      this.updatedUser.username = this.editProfileData.name;
      await this.firestoreService.addUser(this.updatedUser);
      this.authService.updateUsername(this.editProfileData.name);
      console.log(this.updatedUser);
      this.nameIsChanged = false;
      this.closeEditProfile();
      this.uiService.toggleProfileChangeConfirmationPopup();
    }
  }


  /**
   * Marks the user's email as changed.
   */
  onEmailChange() {
    this.emailIsChanged = true;
  }


  /**
   * Saves the new email address if it has been changed.
   * Updates the user's email in Firebase Authentication.
   *
   * @param {string} newEmail - The new email address entered by the user.
   */
  saveNewEmailAddress(newEmail: string) {
    if (this.emailIsChanged) {
      this.authService.newEmailAddress = newEmail;
      this.authService.updateUserEmail(newEmail);
      this.emailIsChanged = false;
      this.closeEditProfile();
    }
  }


  /**
   * Closes the edit profile view and the view profile view.
   */
  closeEditProfile() {
    this.uiService.toggleEditProfile();
    this.uiService.toggleViewProfile();
  }
}