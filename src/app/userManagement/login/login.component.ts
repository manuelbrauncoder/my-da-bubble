import { Component, inject, OnInit } from '@angular/core';
import { FirebaseAuthService } from '../../services/firebase-auth.service';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HeaderForUsermanagementComponent } from '../../shared/header-for-usermanagement/header-for-usermanagement.component';
import { FooterComponent } from '../../shared/footer/footer.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HeaderForUsermanagementComponent, FooterComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit {
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
      }, 2000);
    }, 1000);
  }

  onKeyDownEnter(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();
        this.login();
    }
  }

  async login() {
      this.authService.login(this.loginData.email, this.loginData.password);
  }

  guestLogin() {
    this.authService.guestLogin();
  }

  
}
