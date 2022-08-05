interface EmailVerificationSuccess {
    verified: true;
}
interface EmailVerificationFailure {
    verified: false;
}
export interface EmailVerificationDetails {
    mxVerificationSucceed: boolean;
    smtpVerificationSucceed?: boolean;
}
export declare type EmailVerificationResult = (EmailVerificationSuccess | EmailVerificationFailure) & EmailVerificationDetails;
export {};
