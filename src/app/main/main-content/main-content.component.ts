import { Component, inject, OnInit } from '@angular/core';
import { WorkspaceMenuComponent } from '../workspace-menu/workspace-menu.component';
import { WorkspaceMenuButtonComponent } from '../workspace-menu-button/workspace-menu-button.component';
import { UiService } from '../../services/ui.service';
import { ChatComponent } from '../chat/chat.component';
import { ThreadComponent } from '../thread/thread.component';
import { AddChannelPopupComponent } from '../add-channel-popup/add-channel-popup.component';
import { fadeIn, toggleWorkspace, toggleThread } from '../../shared/animations';
import { BreakpointObserverService } from '../../services/breakpoint-observer.service';

@Component({
    selector: 'app-main-content',
    animations: [fadeIn, toggleWorkspace, toggleThread],
    imports: [
        WorkspaceMenuComponent,
        WorkspaceMenuButtonComponent,
        ChatComponent,
        ThreadComponent,
        AddChannelPopupComponent,
    ],
    templateUrl: './main-content.component.html',
    styleUrl: './main-content.component.scss'
})
export class MainContentComponent implements OnInit {
  uiService = inject(UiService);
  observerService = inject(BreakpointObserverService);

  ngOnInit(): void {
    this.uiService.changeMainContent('newMessage');
    this.uiService.userChatNotActive();
    this.uiService.channelChatNotActive();
  }
}
