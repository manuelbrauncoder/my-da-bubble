import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { UiService } from '../../services/ui.service';
import { FirestoreService } from '../../services/firestore.service';
import { FirebaseAuthService } from '../../services/firebase-auth.service';
import { UserService } from '../../services/user.service';


@Component({
  selector: 'app-view-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './view-profile.component.html',
  styleUrl: './view-profile.component.scss',
})
export class ViewProfileComponent {
  uiService = inject(UiService);
  firestoreService = inject(FirestoreService);
  authService = inject(FirebaseAuthService);
  userService = inject(UserService);


  /**
   * Closes the view profile popup.
   * This method is called when the user wants to close their profile view.
   */
  closeViewProfile() {
    this.uiService.toggleViewProfile();
  }

/**
   * Opens the edit profile view.
   * This method is called when the user wants to edit their profile.
   */
  editProfile() {
    this.uiService.toggleEditProfile();
    this.uiService.toggleViewProfile();
  }
}