import { resolveMx } from 'dns'
import { createConnection } from 'net'
import { EmailVerificationOptions, EnsuredEmailVerificationOptions } from './types/EmailVerificationOptions'
import { EmailVerificationResult, EmailVerificationDetails } from './types/EmailVerificationResult'

const LRU = require('lru-cache')

const cache = new LRU({ max: 1000, ttl: 24 * 60 * 60 * 1000 })

const verifyEmailDomain = async (emailOrDomain: string, options: EmailVerificationOptions = {}): Promise<EmailVerificationResult> => {
  const ensuredOptions = verifier.ensureOptions(options)

  const {
    mxVerificationSucceed,
    smtpVerificationSucceed
  } = await verifier.verify(verifier.parseDomainFromEmail(emailOrDomain), ensuredOptions)

  if (ensuredOptions.requireSmtpOrMx) {
    return {
      verified: mxVerificationSucceed || (smtpVerificationSucceed ?? false),
      mxVerificationSucceed,
      smtpVerificationSucceed
    }
  }

  return {
    verified: (mxVerificationSucceed || ensuredOptions.mxNotRequired) && (smtpVerificationSucceed || ensuredOptions.smtpNotRequired),
    mxVerificationSucceed,
    smtpVerificationSucceed
  }
}

const ensureOptions = (options: EmailVerificationOptions): EnsuredEmailVerificationOptions => {
  return {
    smtpNotRequired: ('smtpNotRequired' in options && options.smtpNotRequired) ?? false,
    mxNotRequired: ('mxNotRequired' in options && options.mxNotRequired) ?? false,
    requireSmtpOrMx: ('requireSmtpOrMx' in options && options.requireSmtpOrMx) ?? false,
    smtpConnectionTimeout: options.smtpConnectionTimeout ?? 1000,
    useCache: options.useCache ?? true
  }
}

const parseDomainFromEmail = (emailOrDomain: string): string => {
  const sepCount = (emailOrDomain.match(/@/g) || []).length
  if (sepCount === 0) {
    return emailOrDomain
  }
  return emailOrDomain.split('@')[sepCount]
}

const verify = async (domain: string, options: EnsuredEmailVerificationOptions): Promise<EmailVerificationDetails> => {
  if (options.useCache) {
    const result = cache.get(getCacheKey(domain, options))
    if (result) {
      return result as EmailVerificationDetails
    }
  }

  const exchangeServers = await verifier.getExchangeServers(domain)
  const mxVerificationSucceed = Boolean(exchangeServers.length)

  if ((options.requireSmtpOrMx && mxVerificationSucceed) || options.smtpNotRequired) {
    const result = {
      mxVerificationSucceed
    }
    if (mxVerificationSucceed) {
      cache.set(getCacheKey(domain, options), result)
    }
    return result
  }

  const smtpHosts = verifier.generateSmtpHostList(domain, exchangeServers)
  const smtpVerificationSucceed = await verifier.isSmtpServerRunning(smtpHosts, options.smtpConnectionTimeout ?? 1000)

  const result = {
    mxVerificationSucceed,
    smtpVerificationSucceed
  }
  if (result.mxVerificationSucceed && result.smtpVerificationSucceed) {
    cache.set(getCacheKey(domain, options), result)
  }
  return result
}

const getCacheKey = (domain: string, options: EnsuredEmailVerificationOptions): string => {
  return `${domain}-${options.requireSmtpOrMx}-${options.mxNotRequired}-${options.smtpNotRequired}`
}

const getExchangeServers = (domain: string): Promise<string[]> => {
  return new Promise<string[]>((resolve, reject) => {
    resolveMx(domain, (err, addresses) => {
      if (err) {
        const expectedErrors = ['ESERVFAIL', 'ENODATA']
        if (err.code && expectedErrors.includes(err.code)) {
          return resolve([])
        }
        return reject(err)
      }
      return resolve(
        addresses
          .sort((a, b) => a.priority - b.priority)
          .map(a => a.exchange)
      )
    })
  })
}

const generateSmtpHostList = (domain: string, exchangeServers: string[]): string[] => {
  return [...exchangeServers, `smtp.${domain}`, domain]
}

const isSmtpServerRunning = async (hosts: string[], timeout: number): Promise<boolean> => {
  const portsToCheck = [25, 465, 587, 2525]
  for (const host of hosts) {
    for (const port of portsToCheck) {
      const res = await verifier.isPortOpen(host, port, timeout)
      if (res) {
        return true
      }
    }
  }

  return false
}

const isPortOpen = (host: string, port: number, timeout: number): Promise<boolean> => {
  return new Promise<boolean>(function (resolve, reject) {
    const timer = setTimeout(() => {
      resolve(false)
      socket.destroy()
    }, timeout)
    const socket = createConnection(port, host, () => {
      clearTimeout(timer)
      resolve(true)
      socket.destroy()
    })
    socket.on('error', function (err) {
      clearTimeout(timer)
      resolve(false)
      socket.destroy()
    })
  })
}

const verifier = {
  verifyEmailDomain,
  ensureOptions,
  parseDomainFromEmail,
  verify,
  getExchangeServers,
  generateSmtpHostList,
  isSmtpServerRunning,
  isPortOpen
}

export default verifier
