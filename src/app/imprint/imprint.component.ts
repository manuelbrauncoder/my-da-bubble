import { Component } from '@angular/core';
import { HeaderForUsermanagementComponent } from "../shared/header-for-usermanagement/header-for-usermanagement.component";
import { FooterComponent } from "../shared/footer/footer.component";

@Component({
  selector: 'app-imprint',
  standalone: true,
  imports: [HeaderForUsermanagementComponent, FooterComponent],
  templateUrl: './imprint.component.html',
  styleUrl: './imprint.component.scss'
})
export class ImprintComponent {

}
