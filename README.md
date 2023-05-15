# Open-OTP Library

This is an Open-OTP library that generates and verifies Time-based One-Time Passwords (TOTP) using the HMAC-based One-Time Password (HOTP) algorithm.

## Installation

```
npm install open-otp
```

## Usage

```javascript
import { TOTP, generateSecret } from 'open-otp';

// Generate a new secret key
const secret = generateSecret('TestSite'); // 'KJQWIYXUMZXXEIZGGY3G6JLRRN5SWKCN'

// Create a new TOTP instance
const totp = new TOTP(secret);

// Generate a TOTP
const otp = totp.generateTOTP();

// Verify a TOTP
const verification = totp.verifyTOTP(otp);

console.log(verification);
// Output: { success: true, message: 'TOTP verified' }
```

## API Reference

### TOTP class

This class generates and verifies TOTPs.

#### Constructor

```javascript
new TOTP(secret, window = 0, interval = 30, otpLength = 6, algorithm = 'sha1')
```

Creates a new instance of the TOTP class.

**Parameters**

- `secret` (string): A base32 encoded secret.
- `window` (number, optional): The number of intervals to check before and after the current time. Default is `0`.
- `interval` (number, optional): The interval in seconds. Default is `30`.
- `otpLength` (number, optional): The length of the OTP. Default is `6`.
- `algorithm` (string, optional): The algorithm to use for HMAC. Default is `'sha1'`.

#### generateTOTP method

```javascript
generateTOTP()
```

Generates a TOTP based on the current time.

**Returns**

- `number`: The generated TOTP.

#### verifyTOTP method

```javascript
verifyTOTP(inputOTP)
```

Verifies a TOTP based on the current time.

**Parameters**

- `inputOTP` (string): The input OTP to verify.

**Returns**

- `{ success: boolean, message: string }`: An object with the following properties:
  - `success` (boolean): `true` if the TOTP is valid, `false` otherwise.
  - `message` (string): A message indicating the result of the verification.

#### InvalidSecretError class

This is an error class that is thrown when the input secret is invalid.

### generateSecret function

```javascript
generateSecret(input)
```

Generates a secret key for TOTP.

**Parameters**

- `input` (string, optional): An input string to generate a unique secret for each site.

**Returns**

- `string`: A base32 encoded secret.