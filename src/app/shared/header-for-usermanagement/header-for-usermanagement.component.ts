import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterModule } from '@angular/router';

@Component({
  selector: 'app-header-for-usermanagement',
  standalone: true,
  imports: [RouterModule, CommonModule, RouterLink],
  templateUrl: './header-for-usermanagement.component.html',
  styleUrl: './header-for-usermanagement.component.scss'
})
export class HeaderForUsermanagementComponent {
  showHeaderLink = true;
  private router = inject(Router)

  private headerRoute = ['/registration', '/avatar', '/sendmail', '/resetpwd', '/privacy_policy', '/imprint'];

  constructor(){
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.showHeaderLink = !this.headerRoute.includes(event.urlAfterRedirects);
      }
    });
  }
}
