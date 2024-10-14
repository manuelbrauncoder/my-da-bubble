import { Component, inject, OnInit } from '@angular/core';
import { FirebaseAuthService } from '../../services/firebase-auth.service';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HeaderForUsermanagementComponent } from '../../shared/header-for-usermanagement/header-for-usermanagement.component';
import { FooterComponent } from '../../shared/footer/footer.component';
import { fadeInLogin } from "../../shared/animations";
import { BreakpointObserverService } from '../../services/breakpoint-observer.service';
import { MobileFooterComponent } from "../../shared/mobile-footer/mobile-footer.component";

@Component({
  selector: 'app-login',
  standalone: true,
  animations: [fadeInLogin],
  imports: [CommonModule, FormsModule, RouterModule, HeaderForUsermanagementComponent, FooterComponent, MobileFooterComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit {
  authService = inject(FirebaseAuthService);
  breakpointService = inject(BreakpointObserverService);
  router = inject(Router);
  showAnimation = true;
  showContent = false;

  loginData = {
    email: '',
    password: '',
  };

  ngOnInit(): void {
    this.startAnimation();
  }

  startAnimation(){
    setTimeout(() => {
      this.showContent = true;
      this.showAnimation = false;
    }, 2800);
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
