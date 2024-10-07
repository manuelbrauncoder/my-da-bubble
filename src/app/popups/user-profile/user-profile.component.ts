import { Component, inject, Input } from '@angular/core';
import { User } from '../../models/user.class';
import { UiService } from '../../services/ui.service';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.scss'
})
export class UserProfileComponent {
  @Input() user: User | null = null
  uiService = inject(UiService);

  closeProfile(){
    this.uiService.toggleUserProfile()
  }
}


