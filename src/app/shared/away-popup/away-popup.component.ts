import { Component } from '@angular/core';

@Component({
    selector: 'app-away-popup',
    imports: [],
    templateUrl: './away-popup.component.html',
    styleUrl: './away-popup.component.scss'
})
export class AwayPopupComponent {
  remainingTime: number = 5 * 60; // 5 Minuten in Sekunden
  countdownText: string = '5 Minuten';

  startCountdown() {
    const interval = setInterval(() => {
      this.remainingTime--;

      if (this.remainingTime <= 0) {
        clearInterval(interval);
        this.countdownText = '< 1 Minute';
      } else if (this.remainingTime > 120) {
        this.countdownText = `${Math.floor(this.remainingTime / 60)} Minuten`;
      } else if (this.remainingTime <= 120 && this.remainingTime > 60) {
        this.countdownText = '1 Minute';
      } else {
        this.countdownText = '< 1 Minute';
      }

    }, 1000);
  }

  constructor() {
    this.startCountdown();
  }
}
