import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PickerComponent, PickerModule } from '@ctrl/ngx-emoji-mart';
import { EmojiComponent } from '@ctrl/ngx-emoji-mart/ngx-emoji';
import { Message } from '../../models/message.class';

@Component({
    selector: 'app-emoji-picker',
    imports: [PickerComponent, PickerModule, EmojiComponent],
    templateUrl: './emoji-picker.component.html',
    styleUrl: './emoji-picker.component.scss'
})
export class EmojiPickerComponent {

  @Input() content: 'send-message' | 'single-message' = 'send-message';
  @Input() currentMessage: Message = new Message();
  @Output() sendEmoji = new EventEmitter<string>();

  addReaction(event: any) {
    if (this.content === 'send-message') {
      this.sendEmojiToParent(event.emoji.native);
    } else {
      this.addEmojiToReactions(event.emoji.colons);
    }
  }

  sendEmojiToParent(emoji: string){
    this.sendEmoji.emit(emoji);
  }

  addEmojiToReactions(emoji: string){
    this.sendEmoji.emit(emoji);
    
  }

  
}
