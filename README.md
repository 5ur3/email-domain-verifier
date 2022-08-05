# email-domain-verifier

An npm package that verifies email domains via dns mx records and attempting smtp connection

## Installation
```bash
npm install email-domain-verifier --save
```

## Usage

```typescript
import { verifyEmailDomain } from 'email-domain-verifier'


await verifyEmailDomain('mailbox@gmail.com', { requireSmtpOrMx: true })
//  {
//    verified: true,
//    mxVerificationSucceed: true,
//    smtpVerificationSucceed: undefined
//  }

await verifyEmailDomain('mailbox@garbage.domain', { requireSmtpOrMx: true })
//  {
//    verified: false,
//    mxVerificationSucceed: false,
//    smtpVerificationSucceed: false
//  }
```

### Options
```typescript
{
  mxNotRequired?: boolean,         // Verify via smtp connection check only 
                                   // Mx records would still be resolved for smtp check
                                   // default: false

  smtpNotRequired?: boolean,       // Verify via dns mx records check only
                                   // default: false

  requireSmtpOrMx?: boolean,       // Require at least one check to succeed
                                   // default: false

  smtpConnectionTimeout?: number,  // Timeout for smtp connection in milliseconds
                                   // default: 1000

  useCache?: boolean               // Use in-memory lru cache
                                   // default: true
}
```

### Details
#### Cache
* Simple in-memory lru cache
* Verification with ```{ useCache: false }``` updates cache, but doesn't fetch it
* Max cache size is 1000 and ttl is 24 hours
#### Smtp check
* Conducted via attempting tcp connection to popular smtp ports
* Ports list is ```[ 24, 456, 587, 2525 ]```
* The check is successful if at least one of these ports is open on any of the mail exchange servers
* In addition to mail exchange servers, these ports are scanned on ``` `${domain}` and `smtp.${domain}` ```
#### Mx check
* The check is successful if domain has at least one mx record

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License
[MIT](https://choosealicense.com/licenses/mit/)
