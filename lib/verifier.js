"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const dns_1 = require("dns");
const net_1 = require("net");
const LRU = require('lru-cache');
const cache = new LRU({ max: 1000, ttl: 24 * 60 * 60 * 1000 });
const verifyEmailDomain = (emailOrDomain, options = {}) => __awaiter(void 0, void 0, void 0, function* () {
    const ensuredOptions = verifier.ensureOptions(options);
    const { mxVerificationSucceed, smtpVerificationSucceed } = yield verifier.verify(verifier.parseDomainFromEmail(emailOrDomain), ensuredOptions);
    if (ensuredOptions.requireSmtpOrMx) {
        return {
            verified: mxVerificationSucceed || (smtpVerificationSucceed !== null && smtpVerificationSucceed !== void 0 ? smtpVerificationSucceed : false),
            mxVerificationSucceed,
            smtpVerificationSucceed
        };
    }
    return {
        verified: (mxVerificationSucceed || ensuredOptions.mxNotRequired) && (smtpVerificationSucceed || ensuredOptions.smtpNotRequired),
        mxVerificationSucceed,
        smtpVerificationSucceed
    };
});
const ensureOptions = (options) => {
    var _a, _b, _c, _d, _e;
    return {
        smtpNotRequired: (_a = ('smtpNotRequired' in options && options.smtpNotRequired)) !== null && _a !== void 0 ? _a : false,
        mxNotRequired: (_b = ('mxNotRequired' in options && options.mxNotRequired)) !== null && _b !== void 0 ? _b : false,
        requireSmtpOrMx: (_c = ('requireSmtpOrMx' in options && options.requireSmtpOrMx)) !== null && _c !== void 0 ? _c : false,
        smtpConnectionTimeout: (_d = options.smtpConnectionTimeout) !== null && _d !== void 0 ? _d : 1000,
        useCache: (_e = options.useCache) !== null && _e !== void 0 ? _e : true
    };
};
const parseDomainFromEmail = (emailOrDomain) => {
    const sepCount = (emailOrDomain.match(/@/g) || []).length;
    if (sepCount === 0) {
        return emailOrDomain;
    }
    return emailOrDomain.split('@')[sepCount];
};
const verify = (domain, options) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    if (options.useCache) {
        const result = cache.get(getCacheKey(domain, options));
        if (result) {
            return result;
        }
    }
    const exchangeServers = yield verifier.getExchangeServers(domain);
    const mxVerificationSucceed = Boolean(exchangeServers.length);
    if ((options.requireSmtpOrMx && mxVerificationSucceed) || options.smtpNotRequired) {
        const result = {
            mxVerificationSucceed
        };
        cache.set(getCacheKey(domain, options), result);
        return result;
    }
    const smtpHosts = verifier.generateSmtpHostList(domain, exchangeServers);
    const smtpVerificationSucceed = yield verifier.isSmtpServerRunning(smtpHosts, (_a = options.smtpConnectionTimeout) !== null && _a !== void 0 ? _a : 1000);
    const result = {
        mxVerificationSucceed,
        smtpVerificationSucceed
    };
    cache.set(getCacheKey(domain, options), result);
    return result;
});
const getCacheKey = (domain, options) => {
    return `${domain}-${options.requireSmtpOrMx}-${options.mxNotRequired}-${options.smtpNotRequired}`;
};
const getExchangeServers = (domain) => {
    return new Promise((resolve, reject) => {
        (0, dns_1.resolveMx)(domain, (err, addresses) => {
            if (err) {
                const expectedErrors = ['ESERVFAIL', 'ENODATA'];
                if (err.code && expectedErrors.includes(err.code)) {
                    return resolve([]);
                }
                return reject(err);
            }
            return resolve(addresses
                .sort((a, b) => a.priority - b.priority)
                .map(a => a.exchange));
        });
    });
};
const generateSmtpHostList = (domain, exchangeServers) => {
    return [...exchangeServers, `smtp.${domain}`, domain];
};
const isSmtpServerRunning = (hosts, timeout) => __awaiter(void 0, void 0, void 0, function* () {
    const portsToCheck = [25, 465, 587, 2525];
    for (const host of hosts) {
        for (const port of portsToCheck) {
            const res = yield verifier.isPortOpen(host, port, timeout);
            if (res) {
                return true;
            }
        }
    }
    return false;
});
const isPortOpen = (host, port, timeout) => {
    return new Promise(function (resolve, reject) {
        const timer = setTimeout(() => {
            resolve(false);
            socket.destroy();
        }, timeout);
        const socket = (0, net_1.createConnection)(port, host, () => {
            clearTimeout(timer);
            resolve(true);
            socket.destroy();
        });
        socket.on('error', function (err) {
            clearTimeout(timer);
            resolve(false);
            socket.destroy();
        });
    });
};
const verifier = {
    verifyEmailDomain,
    ensureOptions,
    parseDomainFromEmail,
    verify,
    getExchangeServers,
    generateSmtpHostList,
    isSmtpServerRunning,
    isPortOpen
};
exports.default = verifier;
