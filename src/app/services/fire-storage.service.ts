/**
 * This Service handles up- and downloads to Firebase Storage
 */

import { inject, Injectable } from '@angular/core';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  Storage,
} from '@angular/fire/storage';
import { v4 as uuidv4 } from 'uuid';
import { Upload } from '../interfaces/upload.interface';
import { FirestoreService } from './firestore.service';

@Injectable({
  providedIn: 'root',
})
export class FireStorageService {
  private storage = inject(Storage)
  private firestoreService = inject(FirestoreService);
  public filePath = '';

  async uploadFile(file: File) {
    const fileRef = ref(this.storage, `uploads/${file.name}`);
  
    try {
      // Zuerst die Datei hochladen
      const snapshot = await uploadBytes(fileRef, file);
      
      // Jetzt den Download-Link nach erfolgreichem Upload abrufen
      this.filePath = await getDownloadURL(fileRef);
  
      // Objekt für Firestore erstellen und speichern
      const upload = this.createUploadObject(snapshot.metadata.name, this.filePath);
      this.firestoreService.saveUpload(upload);
    } catch (err) {
      console.log('Error uploading File', err);
    }
  }

  createUploadObject(title: string, path: string): Upload{
    return {
      id: uuidv4(),
      originalFileName: title,
      filePath: path
    }
  }

  isFilePdf(fileName: string) {
    const extension = fileName.split('.').pop()?.toLowerCase() as string;
    return extension === 'pdf';
  }

  deleteFile(fileName: string){
    const fileRef = ref(this.storage, `${fileName}`);
    deleteObject(fileRef)
      .then(() => {
        this.deleteFileInFirestore(`${fileName}`);
        console.log('deleted');
      })
      .catch((err) => {
        console.log('Error deleting file:', err, fileName);
      })
  }

  async deleteFileInFirestore(fileName: string){
    const uploadIndex = this.firestoreService.uploadInfos.findIndex(upload => upload.filePath === fileName);
    await this.firestoreService.deleteUpload(this.firestoreService.uploadInfos[uploadIndex]);
  }

  
  /**
   * Downloads a file from Firebase Storage given a file path
   * @param filePath to the file in firebase storage
   */
  async downloadFile(filePath: string) {
    try {
      const url = await getDownloadURL(ref(this.storage, filePath));
      const blob = await this.fetchBlob(url);
      this.downloadBlob(blob, `${this.getFileName(filePath)}`);
    } catch (error) {
      console.error('Fehler beim Abrufen der Datei:', error);
    }
  }

  getFileName(filePath: string) {
    const uploadIndex = this.firestoreService.uploadInfos.findIndex(upload => upload.filePath === filePath);
    return this.firestoreService.uploadInfos[uploadIndex].originalFileName;
  }
  
  /**
   * Fetches the blob from a given URL
   * @param url 
   * @returns 
   */
  private fetchBlob(url: string): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.responseType = 'blob';
      xhr.onload = () => resolve(xhr.response);
      xhr.onerror = () => reject(new Error('Fehler beim Abrufen des Blobs'));
      xhr.open('GET', url);
      xhr.send();
    });
  }
  
  
  /**
   * Initiates the download of the given blob as a file
   * @param blob 
   * @param fileName 
   */
  private downloadBlob(blob: Blob, fileName: string): void {
    const link = document.createElement('a');
    const objectURL = URL.createObjectURL(blob);
    link.href = objectURL;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(objectURL);
  }
}
