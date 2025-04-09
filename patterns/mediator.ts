// Mediator Pattern for UI Components
export interface Component {
  setMediator(mediator: Mediator): void;
  getName(): string;
}

export interface Mediator {
  notify(sender: Component, event: string, data?: any): void;
}

export class UIMediator implements Mediator {
  private components: Map<string, Component> = new Map();

  public registerComponent(component: Component): void {
    this.components.set(component.getName(), component);
    component.setMediator(this);
  }

  public notify(sender: Component, event: string, data?: any): void {
    // Handle different events based on the sender and event type
    switch (event) {
      case "search":
        // Notify search results component
        this.handleSearch(data);
        break;
      case "select-car":
        // Notify car details component
        this.handleCarSelection(data);
        break;
      case "book-car":
        // Notify booking component
        this.handleBooking(data);
        break;
      case "send-message":
        // Notify messaging component
        this.handleMessage(data);
        break;
      case "payment":
        // Notify payment component
        this.handlePayment(data);
        break;
      default:
        console.log(`No handler for event: ${event}`);
    }
  }

  private handleSearch(data: any): void {
    const searchResults = this.components.get("searchResults");
    if (searchResults) {
      // Update search results
      console.log("Updating search results with:", data);
    }
  }

  private handleCarSelection(data: any): void {
    const carDetails = this.components.get("carDetails");
    if (carDetails) {
      // Update car details
      console.log("Updating car details with:", data);
    }
  }

  private handleBooking(data: any): void {
    const booking = this.components.get("booking");
    if (booking) {
      // Update booking
      console.log("Updating booking with:", data);
    }
  }

  private handleMessage(data: any): void {
    const messaging = this.components.get("messaging");
    if (messaging) {
      // Update messaging
      console.log("Updating messaging with:", data);
    }
  }

  private handlePayment(data: any): void {
    const payment = this.components.get("payment");
    if (payment) {
      // Update payment
      console.log("Updating payment with:", data);
    }
  }
}

export abstract class BaseComponent implements Component {
  protected mediator: Mediator | null = null;
  protected name: string;

  constructor(name: string) {
    this.name = name;
  }

  public setMediator(mediator: Mediator): void {
    this.mediator = mediator;
  }

  public getName(): string {
    return this.name;
  }
}