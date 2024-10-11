import { Component, inject } from '@angular/core';
import { FirebaseAuthService } from '../../services/firebase-auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FireStorageService } from '../../services/fire-storage.service';
import {
  ImageCropperComponent,
  ImageCroppedEvent,
} from 'ngx-image-cropper';
import { HeaderForUsermanagementComponent } from "../../shared/header-for-usermanagement/header-for-usermanagement.component";

@Component({
  selector: 'app-choose-avatar',
  standalone: true,
  imports: [CommonModule, FormsModule, ImageCropperComponent, HeaderForUsermanagementComponent],
  templateUrl: './choose-avatar.component.html',
  styleUrl: './choose-avatar.component.scss',
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
  useFileFromStorage = false;
  showCropper = false;

  regData = this.authService.getStoredRegistrationData();

  imageChangedEvent: Event | null = null;

  hideCropper(){
    this.showCropper = false;
  }


  fileChangeEvent(event: Event): void {
    this.imageChangedEvent = event;
    this.showCropper = true;
  }

  imageCropped(event: ImageCroppedEvent) {
    this.selectedAvatar = event.objectUrl!;
    if (event.blob) {
      this.selectedFile = new File([event.blob], `${this.regData?.username.trim()}.png`, {type: 'image/png'});
      this.useFileFromStorage = true;
    }
  }
  
  async completeRegistration() {
    if (this.regData) {
      try {
        let avatarUrl = this.selectedAvatar;

        if (this.selectedFile) {
          await this.storageService.uploadFile(this.selectedFile);
          avatarUrl = this.storageService.filePath;
        }

        this.authService
          .register(
            this.regData.email,
            this.regData.username,
            this.regData.password,
            avatarUrl
          )
          .subscribe({
            next: () => {
              this.authService.clearStoredRegistrationData();
              this.showPopup = true;

              setTimeout(() => {
                this.router.navigate(['/dabubble']);
              }, 2000);
            },
            error: (err) => {
              if (err.code === 'auth/email-already-in-use') {
                this.registrationFailed = true;
                this.errorMassage = 'Email existiert bereits!';
              } else {
                this.registrationFailed = true;
                this.errorMassage = 'Irgendetwas ist schief gelaufen!';
              }
            },
          });
      } catch (err) {
        console.error('Error during registration or file upload:', err);
        this.registrationFailed = true;
        this.errorMassage = 'Irgendetwas ist schief gelaufen!';
      }
    }
  }
}
