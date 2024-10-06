import { Component, inject, OnInit } from '@angular/core';
import { FirebaseAuthService } from '../../services/firebase-auth.service';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  authService = inject(FirebaseAuthService);
  router = inject(Router);
  loginFailed: boolean = false;
  showStartScreen: boolean = true;
  logoState: 'center' | 'corner' = 'center';

  loginData = {
    email: '',
    password: '',
  };

  ngOnInit() {
    setTimeout(() => {
      this.logoState = 'corner';
      setTimeout(() => {
        this.showStartScreen = false;
      }, 3000);
    }, 1000);
  }

  

  /**
   * Login for user. Checks if email and pwd is in the database
   * and link to the main page.
   */
  async login() {
    this.authService.login(this.loginData.email, this.loginData.password);
  }

  /**
   * Guestlogin. Links to the main page.
   */
  guestLogin() {
    this.authService.guestLogin();
  }

  /**
   * Googlelogin. Uses Method from Authservice. After login links to the main page.
   */
  async googleLogin() {
    try {
      await this.authService.googleLogin();
      this.router.navigate(['/dabubble']);
    } catch (error) {
      console.error('Google login error in LoginComponent:', error);
      this.loginFailed = true;
    }
  }
}
