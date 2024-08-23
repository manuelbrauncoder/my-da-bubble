import { Component, inject } from '@angular/core';
import { FirebaseAuthService } from '../../services/firebase-auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss'
})
export class ResetPasswordComponent {
  authService = inject(FirebaseAuthService);
  router = inject(Router);
  route = inject(ActivatedRoute);

  firstPassword: any = '';
  secondPassword: string = '';
  oobCode: string | null = null;


  ngOnInit() {
    this.oobCode = this.route.snapshot.queryParamMap.get('oobCode');
  }

  isFormValid(): boolean {
    return this.firstPassword.length >= 6 && this.secondPassword.length >= 6 && this.firstPassword === this.secondPassword;
  }

  changePassword() {
    if (this.firstPassword === this.secondPassword) {
      try {
        this.authService.updateUserPassword(this.firstPassword);
        this.router.navigate(['/login']);
      } catch (error) {
        console.error('Error:', error);
      }
    }
  }
}
