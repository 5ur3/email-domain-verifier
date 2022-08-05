export { EmailVerificationOptions } from './types/EmailVerificationOptions';
export { EmailVerificationResult } from './types/EmailVerificationResult';
declare const verifyEmailDomain: (emailOrDomain: string, options?: import("./types/EmailVerificationOptions").EmailVerificationOptions) => Promise<import("./types/EmailVerificationResult").EmailVerificationResult>;
export { verifyEmailDomain };
