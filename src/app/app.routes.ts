import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () =>
      import('./userManagement/login/login.component').then(
        (m) => m.LoginComponent
      ),
  },
  {
    path: 'dabubble',
    loadComponent: () =>
      import('./main/main-content/main-content.component').then(
        (m) => m.MainContentComponent
      ),
  },
  {
    path: 'registration',
    loadComponent: () =>
      import('./userManagement/registration/registration.component').then(
        (m) => m.RegistrationComponent
      ),
  },
  {
    path: 'avatar',
    loadComponent: () =>
      import('./userManagement/choose-avatar/choose-avatar.component').then(
        (m) => m.ChooseAvatarComponent
      ),
  },
  {
    path: 'sendmail',
    loadComponent: () =>
      import('./userManagement/send-mail/send-mail.component').then(
        (m) => m.SendMailComponent
      ),
  },
  {
    path: 'resetpwd/__/auth/action',
    loadComponent: () =>
      import('./userManagement/reset-password/reset-password.component').then(
        (m) => m.ResetPasswordComponent
      ),
  },
  {
    path: 'privacy_policy',
    loadComponent: () =>
      import('./privacy/privacy.component').then((m) => m.PrivacyComponent),
  },
  {
    path: 'imprint',
    loadComponent: () =>
      import('./imprint/imprint.component').then((m) => m.ImprintComponent),
  }
];
