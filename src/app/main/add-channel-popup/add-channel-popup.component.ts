import { Component, inject } from '@angular/core';
import { UiService } from '../../services/ui.service';
import { FormsModule, NgForm } from '@angular/forms';
import { Channel } from '../../models/channel.class';
import { ChannelService } from '../../services/channel.service';
import { FirebaseAuthService } from '../../services/firebase-auth.service';
import { AddChannelPopup2Component } from "../add-channel-popup-2/add-channel-popup-2.component";
import { UserService } from '../../services/user.service';

@Component({
    selector: 'app-add-channel-popup',
    imports: [FormsModule, AddChannelPopup2Component],
    templateUrl: './add-channel-popup.component.html',
    styleUrl: './add-channel-popup.component.scss'
})
export class AddChannelPopupComponent {
  uiService = inject(UiService);
  channelService = inject(ChannelService);
  authService = inject(FirebaseAuthService);
  userService = inject(UserService);
  newChannel: Channel = new Channel();

  /**
   * When form is valide and submitted,
   * this method adds the new channel to firebase
   * set current user as creator
   * @param ngForm 
   */
  async onSubmit(ngForm: NgForm){
    if (ngForm.valid && ngForm.submitted) {
      this.newChannel.creator = this.addCurrentUserAsChannelCreator();
      this.uiService.openAddChannelPopup2();
    }    
  }

  isChannelNameTaken(){
    return this.channelService.fireService.channels.some(channel => channel.name.trim().toLowerCase() === this.newChannel.name.trim().toLowerCase());
  }

 
  addCurrentUserAsChannelCreator(){
    const currentUser = this.userService.getCurrentUser();
    if (currentUser) {
      return currentUser.uid;
    } else {
      return '';
    }
  }

}
