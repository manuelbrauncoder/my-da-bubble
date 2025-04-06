import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { UiService } from '../../services/ui.service';
import { FirestoreService } from '../../services/firestore.service';
import { FirebaseAuthService } from '../../services/firebase-auth.service';
import { EditProfileComponent } from '../edit-profile/edit-profile.component';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';


@Component({
    selector: 'app-verify-password',
    imports: [CommonModule, FormsModule],
    templateUrl: './verify-password.component.html',
    styleUrl: './verify-password.component.scss'
})
export class VerifyPasswordComponent implements OnInit{
  uiService = inject(UiService);
  firestoreService = inject(FirestoreService);
  authService = inject(FirebaseAuthService);
  userService = inject(UserService);

  verifyPasswordData = {
    name:  '',
    email: '',
    password: ''
  }
  

  /**
   * Initializes the component, setting the current user's name and email.
   * This method is called automatically by Angular when the component is created.
   */
  ngOnInit(): void {
    this.verifyPasswordData.name = this.authService.auth.currentUser?.displayName!;
    this.verifyPasswordData.email = this.authService.auth.currentUser?.email!;
  }


  /**
   * Confirms the user's password for re-authentication.
   * If the password is correct, it allows the user to update their email.
   * Also handles closing the verify password view and toggling the edit profile and logout popups.
   */
  confirmPassword(email: string, password: string) {
    this.authService.updateEmail = true;
    this.authService.reAuthenticateUser(email, password);
    this.closeVerifyPassword();
  }

  
  /**
   * Closes the verify password view.
   * This is typically called after the user has successfully re-authenticated.
   */
  closeVerifyPassword() {
    this.uiService.toggleVerifyPassword();
    this.uiService.showEditProfilePopup = false;
    this.uiService.showViewProfilePopup = false;
  }
}