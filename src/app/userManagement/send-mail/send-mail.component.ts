import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Auth, sendPasswordResetEmail } from '@angular/fire/auth';
import { from, Observable } from 'rxjs';

@Component({
  selector: 'app-send-mail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './send-mail.component.html',
  styleUrl: './send-mail.component.scss',
})
export class SendMailComponent {
  private auth = inject(Auth);
  email: string = '';
  confirmPopup = false;

  sendMail() {
    this.sendPasswordResetMail(this.email);
  }

  sendPasswordResetMail(email: string): Observable<void> {
    const promise = sendPasswordResetEmail(this.auth, email)
      .then(() => {
        this.confirmPopup = true;
        this.hidePopup();
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.error('Error Code:', errorCode);
        console.error('Error Message:', errorMessage);
      });
      return from(promise);
  }

  hidePopup(){
    setTimeout(() => {
      this.confirmPopup = false;
    }, 3000);
  }
}
