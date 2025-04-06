import { Component, inject } from '@angular/core';
import { UiService } from '../../services/ui.service';
import { PopupAddUserComponent } from '../../main/chat/popup-add-user/popup-add-user.component';

@Component({
    selector: 'app-mobile-popup',
    imports: [PopupAddUserComponent],
    templateUrl: './mobile-popup.component.html',
    styleUrl: './mobile-popup.component.scss'
})
export class MobilePopupComponent {
  uiService = inject(UiService);
}
