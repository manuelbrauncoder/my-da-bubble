import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { Message } from '../../../../models/message.class';
import { ThreadService } from '../../../../services/thread.service';
import { UserService } from '../../../../services/user.service';
import { UiService } from '../../../../services/ui.service';
import { EmojiComponent } from '@ctrl/ngx-emoji-mart/ngx-emoji';

@Component({
    selector: 'app-reaction-bar',
    imports: [EmojiComponent],
    templateUrl: './reaction-bar.component.html',
    styleUrl: './reaction-bar.component.scss'
})
export class ReactionBarComponent implements OnInit {
  threadService = inject(ThreadService);
  userService = inject(UserService);
  uiService = inject(UiService);

  @Input() threadMessage = false;
  @Input() currentMessage: Message = new Message()
  @Output() triggerAnswer = new EventEmitter<void>();
  @Output() triggerMenuPopup = new EventEmitter<void>();
  @Output() triggerEmojiPicker = new EventEmitter<boolean>();
  @Output() triggerHandleReaction = new EventEmitter<string>();

  ngOnInit(): void {
    this.currentMessage = new Message(this.currentMessage);
  }

  triggerHandleReactionInParent(emoji: string){
    this.triggerHandleReaction.emit(emoji);
  }

  triggerEmojiPickerInParent(){
    this.triggerEmojiPicker.emit();
  }

  triggerMenuPopupInParent() {
    this.triggerMenuPopup.emit();
  }

  triggerAnswerInParent() {
    this.triggerAnswer.emit();
  }



  

  
}
