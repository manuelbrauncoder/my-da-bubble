import { Component, inject } from '@angular/core';
import { FirebaseAuthService } from '../../services/firebase-auth.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';

@Component({
  selector: 'app-registration',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './registration.component.html',
  styleUrl: './registration.component.scss'
})
export class RegistrationComponent {
  authService = inject(FirebaseAuthService);
  router = inject(Router);

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
    privacy: false
  }

  /**
   * Save the data from input fields and save them in the authService.
   * Links to the avatar selection.
   */
  confirm() {
    this.authService.storeRegistrationData(this.regData.email, this.regData.username, this.regData.password);
    this.router.navigate(['/avatar']);
  }

}
