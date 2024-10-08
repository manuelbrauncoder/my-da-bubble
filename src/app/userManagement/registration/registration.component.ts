import { Component, inject } from '@angular/core';
import { FirebaseAuthService } from '../../services/firebase-auth.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { FirestoreService } from '../../services/firestore.service';

@Component({
  selector: 'app-registration',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './registration.component.html',
  styleUrl: './registration.component.scss',
})
export class RegistrationComponent {
  authService = inject(FirebaseAuthService);
  firestoreService = inject(FirestoreService);
  router = inject(Router);

  emailInUse = false;

  onKeyDownEnter(event: KeyboardEvent, ngForm: NgForm) {
    if (event.key === 'Enter' && ngForm.valid) {
      event.preventDefault();
      this.confirm();
    }
  }

  regData = {
    username: '',
    email: '',
    password: '',
    privacy: false,
  };

  /**
   * Save the data from input fields and save them in the authService.
   * Links to the avatar selection.
   */
  confirm() {
    if (this.isEmailInUse()) {
      this.emailInUse = true;
    } else {
      this.authService.storeRegistrationData(
        this.regData.email,
        this.regData.username,
        this.regData.password
      );
      this.router.navigate(['/avatar']);
    }
  }

  isEmailInUse() {
    return this.firestoreService.users.some(
      (user) => user.email === this.regData.email
    );
  }
}
