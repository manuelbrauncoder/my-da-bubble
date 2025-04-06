import { Component, inject } from '@angular/core';
import { UiService } from '../../services/ui.service';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-workspace-menu-button',
    imports: [CommonModule],
    templateUrl: './workspace-menu-button.component.html',
    styleUrl: './workspace-menu-button.component.scss'
})
export class WorkspaceMenuButtonComponent {
  uiService = inject(UiService);

  showOpenClose(){
    if (this.uiService.showWorkspaceMenu) {
      return 'schließen'
    } else {
      return 'öffnen'
    }
  }
}
