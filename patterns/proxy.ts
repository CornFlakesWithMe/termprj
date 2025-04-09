// Proxy Pattern for Payment Integration
export interface PaymentService {
  processPayment(amount: number, fromUserId: string, toUserId: string): Promise<PaymentResult>;
  getBalance(userId: string): Promise<number>;
  getTransactionHistory(userId: string): Promise<Transaction[]>;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  error?: string;
}

export interface Transaction {
  id: string;
  fromUserId: string;
  toUserId: string;
  amount: number;
  status: "pending" | "completed" | "failed";
  timestamp: string;
}

// Real payment service (would connect to actual payment provider in production)
export class RealPaymentService implements PaymentService {
  async processPayment(amount: number, fromUserId: string, toUserId: string): Promise<PaymentResult> {
    // In a real implementation, this would connect to a payment gateway
    console.log(`Processing payment of $${amount} from user ${fromUserId} to user ${toUserId}`);
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simulate successful payment
    return {
      success: true,
      transactionId: `txn_${Date.now()}`,
    };
  }

  async getBalance(userId: string): Promise<number> {
    // In a real implementation, this would fetch the balance from a database
    console.log(`Fetching balance for user ${userId}`);
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Return a mock balance
    return 1000;
  }

  async getTransactionHistory(userId: string): Promise<Transaction[]> {
    // In a real implementation, this would fetch transactions from a database
    console.log(`Fetching transaction history for user ${userId}`);
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Return mock transactions
    return [
      {
        id: "txn_1",
        fromUserId: userId,
        toUserId: "user_2",
        amount: 100,
        status: "completed",
        timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      },
      {
        id: "txn_2",
        fromUserId: "user_3",
        toUserId: userId,
        amount: 150,
        status: "completed",
        timestamp: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
      },
    ];
  }
}

// Proxy for payment service with caching, logging, and security checks
export class PaymentServiceProxy implements PaymentService {
  private realService: PaymentService;
  private balanceCache: Map<string, { balance: number; timestamp: number }> = new Map();
  private transactionCache: Map<string, { transactions: Transaction[]; timestamp: number }> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

  constructor(service: PaymentService) {
    this.realService = service;
  }

  async processPayment(amount: number, fromUserId: string, toUserId: string): Promise<PaymentResult> {
    // Log the payment attempt
    console.log(`Payment attempt: $${amount} from ${fromUserId} to ${toUserId}`);
    
    // Validate the payment
    if (amount <= 0) {
      return { success: false, error: "Invalid amount" };
    }
    
    // Check if user has sufficient balance
    try {
      const balance = await this.getBalance(fromUserId);
      if (balance < amount) {
        return { success: false, error: "Insufficient funds" };
      }
      
      // Process the payment
      const result = await this.realService.processPayment(amount, fromUserId, toUserId);
      
      // If payment was successful, invalidate the balance cache
      if (result.success) {
        this.balanceCache.delete(fromUserId);
        this.balanceCache.delete(toUserId);
        this.transactionCache.delete(fromUserId);
        this.transactionCache.delete(toUserId);
      }
      
      return result;
    } catch (error) {
      console.error("Payment processing error:", error);
      return { success: false, error: "Payment processing failed" };
    }
  }

  async getBalance(userId: string): Promise<number> {
    // Check if we have a cached balance that's still valid
    const cachedData = this.balanceCache.get(userId);
    const now = Date.now();
    
    if (cachedData && now - cachedData.timestamp < this.CACHE_TTL) {
      console.log(`Using cached balance for user ${userId}`);
      return cachedData.balance;
    }
    
    // If not cached or expired, get from real service
    const balance = await this.realService.getBalance(userId);
    
    // Update cache
    this.balanceCache.set(userId, { balance, timestamp: now });
    
    return balance;
  }

  async getTransactionHistory(userId: string): Promise<Transaction[]> {
    // Check if we have cached transactions that are still valid
    const cachedData = this.transactionCache.get(userId);
    const now = Date.now();
    
    if (cachedData && now - cachedData.timestamp < this.CACHE_TTL) {
      console.log(`Using cached transactions for user ${userId}`);
      return cachedData.transactions;
    }
    
    // If not cached or expired, get from real service
    const transactions = await this.realService.getTransactionHistory(userId);
    
    // Update cache
    this.transactionCache.set(userId, { transactions, timestamp: now });
    
    return transactions;
  }
}