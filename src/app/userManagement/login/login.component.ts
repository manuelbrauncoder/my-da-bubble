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


  async login() {
    this.authService.login(this.loginData.email, this.loginData.password);
  }

  guestLogin() {
    this.authService.guestLogin();
  }

  
}
