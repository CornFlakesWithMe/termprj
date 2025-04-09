// Chain of Responsibility Pattern for Password Recovery
export interface SecurityHandler {
  setNext(handler: SecurityHandler): SecurityHandler;
  handle(userId: string, answers: Map<string, string>): Promise<boolean>;
}

export abstract class AbstractSecurityHandler implements SecurityHandler {
  private nextHandler: SecurityHandler | null = null;

  public setNext(handler: SecurityHandler): SecurityHandler {
    this.nextHandler = handler;
    return handler;
  }

  public async handle(userId: string, answers: Map<string, string>): Promise<boolean> {
    if (this.nextHandler) {
      return this.nextHandler.handle(userId, answers);
    }
    
    // If there's no next handler, the chain is complete and successful
    return true;
  }
}

export class SecurityQuestionHandler extends AbstractSecurityHandler {
  private questionIndex: number;
  private userService: any; // This would be your user service to fetch user data

  constructor(questionIndex: number, userService: any) {
    super();
    this.questionIndex = questionIndex;
    this.userService = userService;
  }

  public async handle(userId: string, answers: Map<string, string>): Promise<boolean> {
    // Get the user's security questions
    const user = await this.userService.getUserById(userId);
    
    if (!user || !user.securityQuestions || user.securityQuestions.length <= this.questionIndex) {
      return false;
    }
    
    const question = user.securityQuestions[this.questionIndex];
    const providedAnswer = answers.get(question.question);
    
    // Check if the answer is correct (case-insensitive)
    if (!providedAnswer || providedAnswer.toLowerCase() !== question.answer.toLowerCase()) {
      return false;
    }
    
    // If the answer is correct, continue to the next handler
    return super.handle(userId, answers);
  }
}

export class PasswordRecoveryChain {
  private firstHandler: SecurityHandler | null = null;
  private lastHandler: SecurityHandler | null = null;

  constructor(userService: any, numberOfQuestions: number = 3) {
    // Create handlers for each security question
    for (let i = 0; i < numberOfQuestions; i++) {
      const handler = new SecurityQuestionHandler(i, userService);
      
      if (!this.firstHandler) {
        this.firstHandler = handler;
        this.lastHandler = handler;
      } else if (this.lastHandler) {
        this.lastHandler.setNext(handler);
        this.lastHandler = handler;
      }
    }
  }

  public async verifySecurityAnswers(userId: string, answers: Map<string, string>): Promise<boolean> {
    if (!this.firstHandler) {
      return false;
    }
    
    return this.firstHandler.handle(userId, answers);
  }
}