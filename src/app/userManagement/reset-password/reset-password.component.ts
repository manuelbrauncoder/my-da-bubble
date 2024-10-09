import { Component, inject } from '@angular/core';
import { FirebaseAuthService } from '../../services/firebase-auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Auth, confirmPasswordReset } from '@angular/fire/auth';
import { HeaderForUsermanagementComponent } from "../../shared/header-for-usermanagement/header-for-usermanagement.component";

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderForUsermanagementComponent],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss'
})
export class ResetPasswordComponent {
  private auth = inject(Auth);
  router = inject(Router);
  route = inject(ActivatedRoute);

  firstPassword = '';
  secondPassword = '';
  oobCode = '';
  showPopup = false;


  constructor(){
    this.oobCode = this.route.snapshot.queryParamMap.get('oobCode') || '';
  }
  

  isFormValid(): boolean {
    return this.firstPassword.length >= 6 && this.secondPassword.length >= 6 && this.firstPassword === this.secondPassword;
  }

  resetPassword(oobCode: string, newPassword: string) {
    if (oobCode && newPassword) {
      confirmPasswordReset(this.auth, oobCode, newPassword)
        .then(() => {
          this.confirmpopup();
        })
        .catch((error) => {
          console.log('Fehler beim Zurücksetzen des Passworts.');
        })
    }
  }

  confirmpopup(){
    this.showPopup = true;
        setTimeout(() => {
          this.showPopup = false;
          this.router.navigate(['/']);
        }, 2000);
  }

  
  async changePassword() {
    if (this.isFormValid()) {
      this.resetPassword(this.oobCode, this.firstPassword);
    }
  }

  
}
