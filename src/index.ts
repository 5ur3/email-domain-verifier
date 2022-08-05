export { EmailVerificationOptions } from './types/EmailVerificationOptions'
export { EmailVerificationResult } from './types/EmailVerificationResult'

import verifier from './verifier'

const verifyEmailDomain = verifier.verifyEmailDomain
export { verifyEmailDomain }