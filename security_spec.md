# Security Specification - Gerenciamento MEI

## 1. Data Invariants
- A User document can only be created/updated by the authenticated user matching the document ID.
- An Account must belong to a valid User (`userId` field matches `auth.uid`).
- A Transaction must belong to a valid User (`userId` field matches `auth.uid`).
- Transactions and Accounts cannot be accessed or modified by anyone other than the owner.
- `balance` in Accounts should only be updated by the owner during account creation or transaction processing.

## 2. The "Dirty Dozen" Payloads
1. **Identity Spoofing**: Attempt to create a user profile with a different ID (`users/other_user_id`).
2. **Account Hijacking**: Attempt to read another user's accounts via a list query.
3. **Transaction Sniffing**: Attempt to read another user's transactions via a list query.
4. **Shadow Account Creation**: Attempt to create an account for another user (`userId: 'stolen_id'`).
5. **Unauthorized Transaction**: Attempt to create a transaction for another user's account.
6. **Immutable Field Attack**: Attempt to change the `userId` of an existing account.
7. **Type Poisoning**: Attempt to set `amount` as a string instead of a number in a transaction.
8. **Size Attack**: Attempt to inject 1MB string into the `description` field.
9. **Relational Sync Break**: Attempt to create a transaction referencing a non-existent `accountId`.
10. **State Shortcut**: Attempt to update an account balance directly without a corresponding transaction (handled as simple update here, but we should restrict who can update what).
11. **PII Leak**: Attempt to read all users' emails via a blanket list query.
12. **ID Poisoning**: Attempt to use `../` or long junk strings as document IDs.

## 3. Test Runner
A `firestore.rules.test.ts` will be created to verify these restrictions.
