import { Component, inject } from '@angular/core';
import { FirebaseAuthService } from '../../services/firebase-auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FireStorageService } from '../../services/fire-storage.service';

@Component({
  selector: 'app-choose-avatar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './choose-avatar.component.html',
  styleUrl: './choose-avatar.component.scss'
})
export class ChooseAvatarComponent {
  authService = inject(FirebaseAuthService);
  storageService = inject(FireStorageService);
  router = inject(Router);
  selectedAvatar: string = '';
  avatarIsSelected: boolean = false;
  showPopup: boolean = false;
  registrationFailed: boolean = false;
  errorMassage: String = '';
  selectedFile: File | null = null;

  regData = this.authService.getStoredRegistrationData();

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.selectedAvatar = e.target.result; 
      };
      reader.readAsDataURL(file);
    }
  }

  async completeRegistration() {
    if (this.regData) {
      try {
        let avatarUrl = this.selectedAvatar;
  
        if (this.selectedFile) {
          this.storageService.uploadFile(this.selectedFile);
        }
  
        this.authService.register(this.regData.email, this.regData.username, this.regData.password, avatarUrl).subscribe({
          next: () => {
            this.authService.clearStoredRegistrationData();
            this.showPopup = true;
  
            setTimeout(() => {
              this.router.navigate(['/']);
            }, 2000);
          },
          error: (err) => {
            console.error('Registration failed:', err);
            if (err.code === 'auth/email-already-in-use') {
              this.registrationFailed = true;
              this.errorMassage = 'Email existiert bereits!';
            } else {
              this.registrationFailed = true;
              this.errorMassage = 'Irgendetwas ist schief gelaufen!';
            }
          }
        });
      } catch (err) {
        console.error('Error during registration or file upload:', err);
        this.registrationFailed = true;
        this.errorMassage = 'Irgendetwas ist schief gelaufen!';
      }
    }
  }


}
