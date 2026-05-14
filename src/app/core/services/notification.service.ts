import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface Notification {
  message: string;
  type: 'success' | 'error' | 'info';
  id: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationSubject = new Subject<Notification>();
  notifications$ = this.notificationSubject.asObservable();
  private counter = 0;

  showSuccess(message: string) {
    this.addNotification(message, 'success');
  }

  showError(message: string) {
    this.addNotification(message, 'error');
  }

  showInfo(message: string) {
    this.addNotification(message, 'info');
  }

  private addNotification(message: string, type: 'success' | 'error' | 'info') {
    this.notificationSubject.next({
      message,
      type,
      id: this.counter++
    });
  }
}
