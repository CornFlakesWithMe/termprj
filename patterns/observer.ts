// Observer Pattern for Notifications
export interface Observer {
  update(data: any): void;
}

export class Subject {
  private observers: Observer[] = [];

  public addObserver(observer: Observer): void {
    const isExist = this.observers.includes(observer);
    if (!isExist) {
      this.observers.push(observer);
    }
  }

  public removeObserver(observer: Observer): void {
    const observerIndex = this.observers.indexOf(observer);
    if (observerIndex !== -1) {
      this.observers.splice(observerIndex, 1);
    }
  }

  public notify(data: any): void {
    for (const observer of this.observers) {
      observer.update(data);
    }
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
      type: "booking",
      userId,
      message,
      relatedId: bookingId,
      timestamp: new Date().toISOString(),
    });
  }

  public sendMessageNotification(userId: string, message: string, messageId: string): void {
    this.notify({
      type: "message",
      userId,
      message,
      relatedId: messageId,
      timestamp: new Date().toISOString(),
    });
  }

  public sendPaymentNotification(userId: string, message: string, paymentId: string): void {
    this.notify({
      type: "payment",
      userId,
      message,
      relatedId: paymentId,
      timestamp: new Date().toISOString(),
    });
  }

  public sendReviewNotification(userId: string, message: string, reviewId: string): void {
    this.notify({
      type: "review",
      userId,
      message,
      relatedId: reviewId,
      timestamp: new Date().toISOString(),
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