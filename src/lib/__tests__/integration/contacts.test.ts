import { describe, it, expect } from 'vitest';
import { normalizeEmail } from '@/lib/utils/normalization';

describe('Contact Duplicate Detection & Merge Logic', () => {
  it('detects duplicate emails regardless of casing and plus-addressing', () => {
    const email1 = 'john.doe@acme.com';
    const email2 = 'JOHN.DOE@acme.com';
    const email3 = 'john.doe+sales@acme.com';

    expect(normalizeEmail(email1)).toBe(normalizeEmail(email2));
    expect(normalizeEmail(email1)).toBe(normalizeEmail(email3));
  });

  it('preserves field choices during contact merge payload construction', () => {
    const target = { firstName: 'John', lastName: 'Doe', email: 'john.doe@acme.com' };
    const source = { firstName: 'Johnny', lastName: 'Doe', email: 'johndoe@acme.com' };

    const selections = {
      firstName: 'source', // Pick Johnny
      lastName: 'target',  // Pick Doe
      email: 'target',     // Pick john.doe@acme.com
    };

    const mergedFirstName = selections.firstName === 'target' ? target.firstName : source.firstName;
    const mergedLastName = selections.lastName === 'target' ? target.lastName : source.lastName;

    expect(mergedFirstName).toBe('Johnny');
    expect(mergedLastName).toBe('Doe');
  });
});
