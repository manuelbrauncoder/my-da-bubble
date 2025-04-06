import { Component, EventEmitter, Output, input } from '@angular/core';
import { PickerComponent, PickerModule } from '@ctrl/ngx-emoji-mart';
import { Message } from '../../models/message.class';

@Component({
    selector: 'app-emoji-picker',
    imports: [PickerComponent, PickerModule],
    templateUrl: './emoji-picker.component.html',
    styleUrl: './emoji-picker.component.scss'
})
export class EmojiPickerComponent {

  readonly content = input<'send-message' | 'single-message'>('send-message');
  readonly currentMessage = input<Message>(new Message());
  @Output() sendEmoji = new EventEmitter<string>();

  addReaction(event: any) {
    if (this.content() === 'send-message') {
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
