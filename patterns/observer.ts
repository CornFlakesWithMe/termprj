// Observer Pattern for Notifications
import { Notification } from "@/types";

interface Observer {
  update(notification: Notification): void;
}

class Subject {
  private observers: Observer[] = [];

  public attach(observer: Observer): void {
    this.observers.push(observer);
  }

  public detach(observer: Observer): void {
    const index = this.observers.indexOf(observer);
    if (index !== -1) {
      this.observers.splice(index, 1);
    }
  }

  public notify(notification: Notification): void {
    this.observers.forEach((observer) => observer.update(notification));
  }
}

export class NotificationCenter extends Subject {
  private static instance: NotificationCenter | null = null;

  private constructor() {
    super();
  }

  public static getInstance(): NotificationCenter {
    if (!NotificationCenter.instance) {
      NotificationCenter.instance = new NotificationCenter();
    }
    return NotificationCenter.instance;
  }

  public sendBookingNotification(userId: string, message: string, bookingId: string): void {
    this.notify({
      id: Date.now().toString(),
      type: "booking",
      title: "New Booking",
      message,
      userId,
      relatedId: bookingId,
      read: false,
      createdAt: new Date().toISOString(),
    });
  }

  public sendMessageNotification(userId: string, message: string, messageId: string): void {
    this.notify({
      id: Date.now().toString(),
      type: "message",
      title: "New Message",
      message,
      userId,
      relatedId: messageId,
      read: false,
      createdAt: new Date().toISOString(),
    });
  }

  public sendPaymentNotification(userId: string, message: string, paymentId: string): void {
    this.notify({
      id: Date.now().toString(),
      type: "payment",
      title: "Payment Update",
      message,
      userId,
      relatedId: paymentId,
      read: false,
      createdAt: new Date().toISOString(),
    });
  }

  public sendReviewNotification(userId: string, message: string, reviewId: string): void {
    this.notify({
      id: Date.now().toString(),
      type: "review",
      title: "New Review",
      message,
      userId,
      relatedId: reviewId,
      read: false,
      createdAt: new Date().toISOString(),
    });
  }
}

export class NotificationObserver implements Observer {
  private userId: string;
  private callback: (data: any) => void;

  constructor(userId: string, callback: (data: any) => void) {
    this.userId = userId;
    this.callback = callback;
  }

  public update(data: any): void {
    // Only process notifications for this user
    if (data.userId === this.userId) {
      this.callback(data);
    }
  }
}