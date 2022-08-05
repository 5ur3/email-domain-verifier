export declare type EmailVerificationOptions = ({
    mxNotRequired: true;
    smtpNotRequired?: false;
    requireSmtpOrMx?: false;
} | {
    mxNotRequired?: false;
    smtpNotRequired: true;
    requireSmtpOrMx?: false;
} | {
    mxNotRequired?: false;
    smtpNotRequired?: false;
    requireSmtpOrMx: true;
} | {
    mxNotRequired?: false;
    smtpNotRequired?: false;
    requireSmtpOrMx?: false;
}) & {
    smtpConnectionTimeout?: number;
    useCache?: boolean;
};
export interface EnsuredEmailVerificationOptions {
    smtpNotRequired: boolean;
    mxNotRequired: boolean;
    requireSmtpOrMx: boolean;
    smtpConnectionTimeout: number;
    useCache: boolean;
}
