import * as crypto from 'crypto';

/**
 * Privacy utilities for hashing sensitive data
 */

/**
 * Creates a SHA-256 hash of the input data
 * Used to anonymize file paths and project names
 */
export function getHash(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
}
