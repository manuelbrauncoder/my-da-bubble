import { Component, inject } from '@angular/core';
import { HeaderForUsermanagementComponent } from "../shared/header-for-usermanagement/header-for-usermanagement.component";
import { FooterComponent } from "../shared/footer/footer.component";
import { Location } from '@angular/common';

@Component({
  selector: 'app-privacy',
  standalone: true,
  imports: [HeaderForUsermanagementComponent, FooterComponent],
  templateUrl: './privacy.component.html',
  styleUrl: './privacy.component.scss'
})
export class PrivacyComponent {

  private location = inject(Location);

  goBack(){
    this.location.back();
  }

}
