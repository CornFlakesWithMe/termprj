import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

interface ResetToken {
  token: string;
  userId: string;
  expiresAt: Date;
}

interface ResetTokenState {
  tokens: ResetToken[];
  
  // Actions
  generateToken: (userId: string) => string;
  verifyToken: (token: string) => { isValid: boolean; userId?: string };
  removeToken: (token: string) => void;
  cleanupExpiredTokens: () => void;
}

export const useResetTokenStore = create<ResetTokenState>((set, get) => ({
  tokens: [],
  
  generateToken: (userId: string) => {
    const token = uuidv4();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // Token expires in 1 hour
    
    set(state => ({
      tokens: [...state.tokens, { token, userId, expiresAt }],
    }));
    
    return token;
  },
  
  verifyToken: (token: string) => {
    const { tokens } = get();
    const resetToken = tokens.find(t => t.token === token);
    
    if (!resetToken) {
      return { isValid: false };
    }
    
    if (new Date() > resetToken.expiresAt) {
      // Remove expired token
      get().removeToken(token);
      return { isValid: false };
    }
    
    return { isValid: true, userId: resetToken.userId };
  },
  
  removeToken: (token: string) => {
    set(state => ({
      tokens: state.tokens.filter(t => t.token !== token),
    }));
  },
  
  cleanupExpiredTokens: () => {
    const now = new Date();
    set(state => ({
      tokens: state.tokens.filter(token => token.expiresAt > now),
    }));
  },
})); 