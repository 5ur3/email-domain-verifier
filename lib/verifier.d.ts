import { EmailVerificationOptions, EnsuredEmailVerificationOptions } from './types/EmailVerificationOptions';
import { EmailVerificationResult, EmailVerificationDetails } from './types/EmailVerificationResult';
declare const verifier: {
    verifyEmailDomain: (emailOrDomain: string, options?: EmailVerificationOptions) => Promise<EmailVerificationResult>;
    ensureOptions: (options: EmailVerificationOptions) => EnsuredEmailVerificationOptions;
    parseDomainFromEmail: (emailOrDomain: string) => string;
    verify: (domain: string, options: EnsuredEmailVerificationOptions) => Promise<EmailVerificationDetails>;
    getExchangeServers: (domain: string) => Promise<string[]>;
    generateSmtpHostList: (domain: string, exchangeServers: string[]) => string[];
    isSmtpServerRunning: (hosts: string[], timeout: number) => Promise<boolean>;
    isPortOpen: (host: string, port: number, timeout: number) => Promise<boolean>;
};
export default verifier;
