import { Component, HostListener, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterModule, RouterOutlet } from '@angular/router';
import { FirebaseAuthService } from './services/firebase-auth.service';
import { HeaderComponent } from './shared/header/header.component';
import { FirestoreService } from './services/firestore.service';
import { UserService } from './services/user.service';
import { WorkspaceMenuComponent } from "./main/workspace-menu/workspace-menu.component";
import { LoginComponent } from './userManagement/login/login.component';
import { FooterComponent } from "./shared/footer/footer.component";
import { CommonModule } from '@angular/common';
import { HeaderForUsermanagementComponent } from "./shared/header-for-usermanagement/header-for-usermanagement.component";
import { UiService } from './services/ui.service';
import { BreakpointObserverService } from './services/breakpoint-observer.service';
import { MobilePopupComponent } from "./shared/mobile-popup/mobile-popup.component";
import { slideFromBottom } from "./shared/animations";
import { IdleService } from './services/idle.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  animations: [slideFromBottom],
  imports: [RouterModule, RouterOutlet, HeaderComponent, WorkspaceMenuComponent, LoginComponent, FooterComponent, CommonModule, HeaderForUsermanagementComponent, MobilePopupComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'da-bubble';

  idleService = inject(IdleService);
  breakpointService = inject(BreakpointObserverService);
  authService = inject(FirebaseAuthService);
  fireService = inject(FirestoreService);
  userService = inject(UserService);
  uiService = inject(UiService);
  testMode: boolean = false;
  showFooterAndHeader: boolean = false;
  showResponsiveFooter: boolean = false;

  private idleSubscription?: Subscription;

  unsubUsersList;
  unsubChannelList;
  unsubConversationList;

  constructor(private router: Router) {
    this.unsubUsersList = this.fireService.getUsersList();
    this.unsubChannelList = this.fireService.getChannelList();
    this.unsubConversationList = this.fireService.getConversationList();
  }

  private showNoFooterRoutes: string[] = ['/dabubble'];
  private showNoResponsiveFooter: string[] = ['/dabubble', '/registration', '/avatar', '/sendmail', '/resetpwd', '/privacy_policy', '/imprint'];

  ngOnInit(): void {
    this.initIdleWatching();
    this.breakpointService.initObserver();
    this.subLoginState();
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.showFooterAndHeader = this.showNoFooterRoutes.includes(event.urlAfterRedirects);
        this.showResponsiveFooter = this.showNoResponsiveFooter.includes(event.urlAfterRedirects);
      }
    });
  }

  ngOnDestroy(): void {
    this.unsubUsersList();
    this.unsubChannelList();
    this.unsubConversationList();
    if (this.idleSubscription) {
      this.idleSubscription.unsubscribe();
    }
  }

  /**
   * Subscribes to the login state of the user and updates the current user information.
   * 
   * This function listens to changes in the authentication state by subscribing to the `user$` observable.
   * If a user is logged in, it updates the `currentUserSig` signal with the user's email and display name.
   * If no user is logged in, it sets `currentUserSig` to `null`.
   * display username in html: {{ authService.currentUserSig()?.username }}
   */
  subLoginState() {
    this.authService.user$.subscribe(user => {
      if (user) {        
        this.authService.currentUserSig.set({
          email: user.email!,
          username: user.displayName!,
          uid: user.uid!
        })
      } else {
        this.authService.currentUserSig.set(null);
        this.uiService.showEditUserAndLogoutPopup = false;
        this.redirectToLogin();
        this.uiService.closeThreadWindow();
      }
      console.log('currently logged in user:', this.authService.currentUserSig());
    })
  }

  redirectToLogin(){
    if (this.router.url === '/dabubble') {
      this.router.navigate(['']);
    }
  }

  @HostListener('document:click', ['$event'])
  @HostListener('document:mousemove', ['$event'])
  @HostListener('document:keydown', ['$event'])
  @HostListener('document:touchstart', ['$event'])
  onUserAction(): void {
    this.idleService.resetTimer(); // resetet den Timer bei Aktivität
    this.authService.changeLoginState('online', this.userService.getCurrentUser().uid);
}

  initIdleWatching(){
    this.idleSubscription = this.idleService.idleState.subscribe((isIdle) => {
      if (isIdle) {
        console.log('Set User as away');
        this.authService.changeLoginState('away', this.userService.getCurrentUser().uid);
      }
    });
    this.idleSubscription.add(this.idleService.logoutState.subscribe((isidle) => {
      if (isidle) {
        console.log('Log User out');
        
      }
    }))
  }

}
