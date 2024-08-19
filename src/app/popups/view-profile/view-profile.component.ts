import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { UiService } from '../../services/ui.service';
import { EditProfileComponent } from '../edit-profile/edit-profile.component';
import { FirestoreService } from '../../services/firestore.service';
import { FirebaseAuthService } from '../../services/firebase-auth.service';


@Component({
  selector: 'app-view-profile',
  standalone: true,
  imports: [CommonModule, EditProfileComponent],
  templateUrl: './view-profile.component.html',
  styleUrl: './view-profile.component.scss',
})
export class ViewProfileComponent {
  uiService = inject(UiService);
  firestoreService = inject(FirestoreService);
  authService = inject(FirebaseAuthService);


  closeViewProfile() {
    this.uiService.toggleViewProfile();
  }


  editProfile() {
    this.uiService.toggleEditProfile();
  }
}