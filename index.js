import crypto from 'crypto';
import base32 from 'thirty-two';

class InvalidSecretError extends Error {
  constructor(message) {
    super(message);
    this.name = 'InvalidSecretError';
  }
}
/**
 * 
 * @param {string} secret base32 encoded secret
 * @param {number} window number of intervals to check before and after current time
 * @param {number} interval interval in seconds
 * @param {number} otpLength length of OTP
 * @param {string} algorithm algorithm to use for HMAC
 * 
 * @description
 *     This class generates and verifies TOTP. The constructor takes in the following parameters: 
 * secret: base32 encoded secret
 * window: number of intervals to check before and after current time
 * interval: interval in seconds
 * otpLength: length of OTP
 * algorithm: algorithm to use for HMAC
 * 
 * @example
 *   const totp = new TOTP(secret);
 *   const otp = totp.generateTOTP();
 *   const test = totp.verifyTOTP(otp);
 * 
 * @throws {InvalidSecretError} Invalid base32 secret
 * @throws {TypeError} Invalid input OTP format
 * 
 * @returns {object} {success: boolean, message: string}
 */
class TOTP {
  constructor(secret, window = 0, interval = 30, otpLength = 6, algorithm = 'sha1') {
    if (!TOTP._isValidSecret(secret)) {
      throw new InvalidSecretError('Invalid base32 secret');
    }

    this.secret = secret;
    this.window = window;
    this.interval = interval;
    this.otpLength = otpLength;
    this.algorithm = algorithm;
  }

  static _isValidSecret(secret) {
    return /^[A-Z2-7]+=*$/.test(secret);
  }

  _generateTOTP(counter) {
    const key = base32.decode(this.secret);
    const buffer = Buffer.alloc(8);
    buffer.writeBigUInt64BE(counter);
    const hmac = crypto.createHmac(this.algorithm, key);
    hmac.update(buffer);
    const digest = hmac.digest();
    const offset = digest[digest.length - 1] & 0xf;
    const binaryCode = (digest[offset] & 0x7f) << 24 |
      (digest[offset + 1] & 0xff) << 16 |
      (digest[offset + 2] & 0xff) << 8 |
      (digest[offset + 3] & 0xff);
    return binaryCode % 10 ** this.otpLength;
  }

  /**
   * @description
   *    This function generates a TOTP based on the current time.
   * 
   * @example
   *   const otp = totp.generateTOTP();
   * @returns {number} OTP
   */
  generateTOTP() {
    const currentTime = Date.now();
    const counter = BigInt(Math.floor(currentTime / 1000 / this.interval));
    return this._generateTOTP(counter);
  }

  /**
   * 
   * @param {string} inputOTP  input OTP to verify
   * @description  This function verifies a TOTP based on the current time. It takes in a string input OTP and returns an object with the following properties:
   * success: boolean
   * message: string
   *
   * @returns {object} {success: boolean, message: string} 
   */
  verifyTOTP(inputOTP) {
    if (typeof inputOTP !== 'string' || !/^\d+$/.test(inputOTP)) {
      throw new TypeError('Invalid input OTP format');
    }

    const currentTime = Date.now();
    const currentCounter = BigInt(Math.floor(currentTime / 1000 / this.interval));
    for (let i = -this.window; i <= this.window; i++) {
      const counter = currentCounter + BigInt(i);
      const otp = this._generateTOTP(counter);
      if (parseInt(inputOTP, 10) === otp) {
        return { success: true, message: 'TOTP verified' };
      }
    }
    return { success: false, message: 'Invalid TOTP' };
  }

}

/**
 * 
 * @param {string} input input string to generate secret
 * @returns {string} base32 encoded secret
 * 
 * @description
 *      This function generates a secret key for TOTP, which is a base32 encoded string. An optional input string can be provided to generate a unique secret for each site.
 * @example 
 *      let secret = generateSecret('TestSite');
 * 
 */
const generateSecret = (input) => {
    let secret = crypto.randomBytes(10).toString('base64');
    if (input) {
        secret += input;
    }
    const encodedSecret = base32.encode(secret);
    return encodedSecret;
}

export {TOTP, generateSecret};