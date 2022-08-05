import verifier from '../src/verifier'
import { anyString, anything, reset, spy, when, verify, deepEqual, anyNumber } from 'ts-mockito'
import { EmailVerificationOptions } from '../lib/index'
import { expect } from 'chai'

describe('EmailDomainVerifier', () => {
  let verifierMock: typeof verifier

  beforeEach(() => {
    verifierMock = spy(verifier)
  })

  afterEach(() => {
    reset(verifierMock)
  })

  describe('#verifyEmailDomain', () => {
    let ensuredOptions: any
    let emailVerificationsDetails: any
    const parsedEmailDomain = 'parsedEmail@domain'

    beforeEach(() => {
      ensuredOptions = {
        smtpNotRequired: false,
        mxNotRequired: false,
        requireSmtpOrMx: false,
        smtpConnectionTimeout: 1000,
        useCache: false
      }
      emailVerificationsDetails = {
        mxVerificationSucceed: true,
        smtpVerificationSucceed: true
      }

      when(verifierMock.ensureOptions(anything()))
        .thenReturn(ensuredOptions)
      when(verifierMock.verify(anyString(), anything()))
        .thenResolve(emailVerificationsDetails)
      when(verifierMock.parseDomainFromEmail(anyString()))
        .thenReturn(parsedEmailDomain)
    })

    it('Calls verifier.ensureOptions with provided options', async () => {
      const options: EmailVerificationOptions = {
        requireSmtpOrMx: true,
        smtpConnectionTimeout: 2000
      }

      await verifier.verifyEmailDomain('', options)

      verify(verifierMock.ensureOptions(deepEqual(options)))
        .once()
    })

    it('Calls verifier.verify with ensured options', async () => {
      await verifier.verifyEmailDomain('', {})

      verify(verifierMock.verify(anything(), deepEqual(ensuredOptions)))
        .once()
    })

    it('Calls verifier.parseDomainFromEmail with provided email', async () => {
      const email = 'username@anyemail.domain'

      await verifier.verifyEmailDomain(email, {})

      verify(verifierMock.parseDomainFromEmail(email))
        .once()
    })

    it('Calls verifier.verify with parsed email domain', async () => {
      await verifier.verifyEmailDomain('', {})

      verify(verifierMock.verify(parsedEmailDomain, anything()))
        .once()
    })

    describe('When options === {}', () => {
      describe('Returns { verified: true } when both check succeed', () => {
        for (let i = 0; i < (1 << 2); i++) {
          const mxSucceed = Boolean(i & 1)
          const smtpSucceed = Boolean(i & 2)

          const expectedResult = mxSucceed && smtpSucceed
          it(`Returns { verified: ${expectedResult} } when mxVerificationSucceed === ${mxSucceed} and smtpVerificationSucceed === ${smtpSucceed}`, async () => {
            emailVerificationsDetails.mxVerificationSucceed = mxSucceed
            emailVerificationsDetails.smtpVerificationSucceed = smtpSucceed

            const res = await verifier.verifyEmailDomain('', {})

            expect(res).deep.equal({
              verified: expectedResult,
              mxVerificationSucceed: mxSucceed,
              smtpVerificationSucceed: smtpSucceed
            })
          })
        }
      })
    })

    describe('When options.mxNotRequired === true', () => {
      beforeEach(() => {
        ensuredOptions.mxNotRequired = true
      })

      describe('Returns { verified: true } when smtp check succeed', () => {
        for (let i = 0; i < (1 << 2); i++) {
          const mxSucceed = Boolean(i & 1)
          const smtpSucceed = Boolean(i & 2)

          const expectedResult = smtpSucceed
          it(`Returns { verified: ${expectedResult} } when mxVerificationSucceed === ${mxSucceed} and smtpVerificationSucceed === ${smtpSucceed}`, async () => {
            emailVerificationsDetails.mxVerificationSucceed = mxSucceed
            emailVerificationsDetails.smtpVerificationSucceed = smtpSucceed

            const res = await verifier.verifyEmailDomain('', {})

            expect(res).deep.equal({
              verified: expectedResult,
              mxVerificationSucceed: mxSucceed,
              smtpVerificationSucceed: smtpSucceed
            })
          })
        }
      })
    })

    describe('When options.smtpNotRequired === true', () => {
      beforeEach(() => {
        ensuredOptions.smtpNotRequired = true
      })

      describe('Returns { verified: true } when mx check succeed', () => {
        for (let i = 0; i < (1 << 2); i++) {
          const mxSucceed = Boolean(i & 1)
          const smtpSucceed = Boolean(i & 2)

          const expectedResult = mxSucceed
          it(`Returns { verified: ${expectedResult} } when mxVerificationSucceed === ${mxSucceed} and smtpVerificationSucceed === ${smtpSucceed}`, async () => {
            emailVerificationsDetails.mxVerificationSucceed = mxSucceed
            emailVerificationsDetails.smtpVerificationSucceed = smtpSucceed

            const res = await verifier.verifyEmailDomain('', {})

            expect(res).deep.equal({
              verified: expectedResult,
              mxVerificationSucceed: mxSucceed,
              smtpVerificationSucceed: smtpSucceed
            })
          })
        }
      })
    })

    describe('When options.requireSmtpOrMx === true', () => {
      beforeEach(() => {
        ensuredOptions.requireSmtpOrMx = true
      })

      describe('Returns { verified: true } when either check succeed', () => {
        for (let i = 0; i < (1 << 2); i++) {
          const mxSucceed = Boolean(i & 1)
          const smtpSucceed = Boolean(i & 2)

          const expectedResult = mxSucceed || smtpSucceed
          it(`Returns { verified: ${expectedResult} } when mxVerificationSucceed === ${mxSucceed} and smtpVerificationSucceed === ${smtpSucceed}`, async () => {
            emailVerificationsDetails.mxVerificationSucceed = mxSucceed
            emailVerificationsDetails.smtpVerificationSucceed = smtpSucceed

            const res = await verifier.verifyEmailDomain('', {})

            expect(res).deep.equal({
              verified: expectedResult,
              mxVerificationSucceed: mxSucceed,
              smtpVerificationSucceed: smtpSucceed
            })
          })
        }
      })
    })
  })

  describe('#ensureOptions', () => {
    it('Transforms options correctly', () => {
      const res = verifier.ensureOptions({ mxNotRequired: true, smtpConnectionTimeout: 2000, useCache: false })
      expect(res).deep.equal({
        smtpNotRequired: false,
        mxNotRequired: true,
        requireSmtpOrMx: false,
        smtpConnectionTimeout: 2000,
        useCache: false
      })
    })

    it('Sets smtpConnectionTimeout to default value if not provided', () => {
      const { smtpConnectionTimeout } = verifier.ensureOptions({})

      expect(smtpConnectionTimeout).equal(1000)
    })

    it('Sets useCache to true if not provided', () => {
      const { useCache } = verifier.ensureOptions({})

      expect(useCache).equal(true)
    })
  })

  describe('#parseDomainFromEmail', () => {
    it('Returns original string if it has no "@"', () => {
      expect(verifier.parseDomainFromEmail('test')).equal('test')
    })
    it('Returns email domain if real email is provided', () => {
      expect(verifier.parseDomainFromEmail('test@domain.com')).equal('domain.com')
      expect(verifier.parseDomainFromEmail('wrong@email@domain1.com')).equal('domain1.com')
    })
  })

  describe('#verify', () => {
    let exchangeServers: string[]
    let smtpHosts: string[]
    let smtpVerificationSucceed: boolean

    beforeEach(() => {
      exchangeServers = ['mx1.domain.com', 'mx2.domain.com']
      smtpHosts = [...exchangeServers, 'smtp.domain.com']
      smtpVerificationSucceed = true

      when(verifierMock.getExchangeServers(anyString()))
        .thenResolve(exchangeServers)
      when(verifierMock.generateSmtpHostList(anyString(), anything()))
        .thenReturn(smtpHosts)
      when(verifierMock.isSmtpServerRunning(anything(), anyNumber()))
        .thenResolve(smtpVerificationSucceed)
    })

    it('Calls verifier.getExchangeServers', async () => {
      const domain = 'domain.com'

      await verifier.verify(domain, {} as any)

      verify(verifierMock.getExchangeServers(domain))
        .once()
    })

    describe('Checks smtp only if needed', () => {
      for (let i = 0; i < (1 << 3); i++) {
        const requireSmtpOrMx = Boolean(i & 1)
        const mxVerificationSucceed = Boolean(i & 2)
        const smtpNotRequired = Boolean(i & 4)

        if (requireSmtpOrMx && smtpNotRequired) {
          continue
        }

        const smtpShouldBeChecked = (requireSmtpOrMx && !mxVerificationSucceed) ||
          (!requireSmtpOrMx && !smtpNotRequired)

        it(`${smtpShouldBeChecked ? 'Checks' : "Doesn't check"} smtp when requireSmtpOrMx === ${requireSmtpOrMx} and mxVerificationSucceed === ${mxVerificationSucceed} and smtpNotRequired === ${smtpNotRequired}`, async () => {
          if (!mxVerificationSucceed) {
            exchangeServers.splice(0, exchangeServers.length)
          }
          const res = await verifier.verify('', { requireSmtpOrMx, smtpNotRequired } as any)

          verify(verifierMock.isSmtpServerRunning(anything(), anyNumber()))
            .times(smtpShouldBeChecked ? 1 : 0)
          expect(res.smtpVerificationSucceed).equal(smtpShouldBeChecked ? true : undefined)
        })
      }
    })

    it('Calls verifier.generateSmtpHostList', async () => {
      const domain = 'domain.com'

      await verifier.verify(domain, {} as any)

      verify(verifierMock.generateSmtpHostList(domain, deepEqual(exchangeServers)))
        .once()
    })

    it('Calls verifier.isSmtpServerRunning', async () => {
      await verifier.verify('', {} as any)

      verify(verifierMock.isSmtpServerRunning(deepEqual(smtpHosts), 1000))
        .once()
    })

    it('Returns { mxVerificationSucceed === false } when exchange servers not found', async () => {
      exchangeServers.splice(0, exchangeServers.length)

      expect((await verifier.verify('', {} as any)).mxVerificationSucceed).equal(false)
    })

    it('Returns { mxVerificationSucceed === true } when exchange servers found', async () => {
      expect((await verifier.verify('', {} as any)).mxVerificationSucceed).equal(true)
    })

    it('Returns { smtpVerificationSucceed === false } when running smtp server not found', async () => {
      when(verifierMock.isSmtpServerRunning(anything(), anyNumber()))
        .thenResolve(false)

      expect((await verifier.verify('', {} as any)).smtpVerificationSucceed).equal(false)
    })

    it('Returns { smtpVerificationSucceed === false } when running smtp server found', async () => {
      expect((await verifier.verify('', {} as any)).smtpVerificationSucceed).equal(true)
    })
  })

  describe('#generateSmtpHostList', () => {
    it('Generates correct list', () => {
      const domain = 'domain.com'
      const exchangeServers = ['mx1.domain.com', 'mx2.domain.com']

      const res = verifier.generateSmtpHostList(domain, exchangeServers)

      expect(res).deep.equal([...exchangeServers, 'smtp.domain.com', 'domain.com'])
    })
  })

  describe('#isSmtpServerRunning', () => {
    const hosts = ['host1', 'host2']
    const ports = [25, 465, 587, 2525]
    const timeout = 1000

    it('Calls verifier.isPortOpen for each host-port combination', async () => {
      when(verifierMock.isPortOpen(anyString(), anyNumber(), anyNumber()))
        .thenResolve(false)

      await verifier.isSmtpServerRunning(hosts, timeout)

      verify(verifierMock.isPortOpen(anyString(), anyNumber(), anyNumber()))
        .times(hosts.length * ports.length)
      for (const host of hosts) {
        for (const port of ports) {
          verify(verifierMock.isPortOpen(host, port, timeout))
            .once()
        }
      }
    })

    it('Returns false when every smtp server not found', async () => {
      when(verifierMock.isPortOpen(anyString(), anyNumber(), anyNumber()))
        .thenResolve(false)

      const res = await verifier.isSmtpServerRunning(hosts, timeout)

      expect(res).equal(false)
    })

    it('Returns true when at least one smtp server is found', async () => {
      when(verifierMock.isPortOpen(anyString(), anyNumber(), anyNumber()))
        .thenResolve(false)
      when(verifierMock.isPortOpen('host2', 587, anyNumber()))
        .thenResolve(true)

      const res = await verifier.isSmtpServerRunning(hosts, timeout)

      expect(res).equal(true)
    })
  })
})
