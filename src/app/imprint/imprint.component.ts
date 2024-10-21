import { Component, inject } from '@angular/core';
import { HeaderForUsermanagementComponent } from "../shared/header-for-usermanagement/header-for-usermanagement.component";
import { FooterComponent } from "../shared/footer/footer.component";
import { Location } from '@angular/common';

@Component({
  selector: 'app-imprint',
  standalone: true,
  imports: [HeaderForUsermanagementComponent, FooterComponent],
  templateUrl: './imprint.component.html',
  styleUrl: './imprint.component.scss'
})
export class ImprintComponent {

  private location = inject(Location);

  goBack(){
    this.location.back();
  }

}
