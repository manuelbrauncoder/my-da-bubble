import { Component, inject, OnInit } from '@angular/core';
import { ChannelService } from '../../services/channel.service';
import { ChannelChatComponent } from "./channel-chat/channel-chat.component";
import { UiService } from '../../services/ui.service';
import { DirectMessageComponent } from './direct-message/direct-message.component';
import { NewMessageComponent } from './new-message/new-message.component';

@Component({
    selector: 'app-chat',
    imports: [ChannelChatComponent, DirectMessageComponent, NewMessageComponent],
    templateUrl: './chat.component.html',
    styleUrl: './chat.component.scss'
})
export class ChatComponent {
  channelService = inject(ChannelService);
  uiService = inject(UiService);

  
}
