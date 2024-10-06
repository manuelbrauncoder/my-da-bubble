import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { UiService } from '../../../../services/ui.service';
import { FireStorageService } from '../../../../services/fire-storage.service';
import { FirestoreService } from '../../../../services/firestore.service';

@Component({
  selector: 'app-data-detail-view',
  standalone: true,
  imports: [],
  templateUrl: './data-detail-view.component.html',
  styleUrl: './data-detail-view.component.scss',
})
export class DataDetailViewComponent {
  uiService = inject(UiService);
  fireStorageService = inject(FireStorageService);
  firestoreService = inject(FirestoreService);

  @Input() data = '';
  @Output() closeDetailView = new EventEmitter<boolean>();

  triggerCloseDetailViewInParent() {
    this.closeDetailView.emit();
  }

  async downloadFile() {
    await this.fireStorageService.downloadFile(this.data);
    
  }
}
