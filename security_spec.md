# Security Specification - Kids Learning App

## 1. Data Invariants
- A `UserProfile` must be owned by the user (`userId == auth.uid`).
- `WordProgress` can only be created/updated by the parent user.
- Streaks and Stars cannot be modified arbitrarily without valid learning events (though rules can only enforce field types and ownership strictly).
- `lastLoginDate` and `lastRewardClaimed` must be valid timestamps.
- Immutability: `userId` in `UserProfile` cannot change.

## 2. The Dirty Dozen Payloads (Rejection Tests)

1. **Identity Spoofing**: Attempt to create a `UserProfile` with a different `userId` than `auth.uid`.
2. **Resource Poisoning**: Large junk string in `displayName`.
3. **Streak Inflation**: Huge integer in `currentStreak`.
4. **PII Leak**: Unauthorized user trying to read `users/{otherUid}`.
5. **Shadow Update**: Adding `isPremium: true` to a profile update.
6. **Orphaned Progress**: Creating a `WordProgress` record for a non-existent word ID (format check).
7. **Timestamp Fraud**: Providing a future date for `lastLoginDate`.
8. **Negative Economy**: Setting `coins` to -100.
9. **Bulk Scrape**: Unauthorized list query on `/users`.
10. **Admin Escalation**: Attempting to set `role: 'admin'` in profile.
11. **Outcome Bypass**: Marking a word as `isMastered: true` without sufficient `accuracy`.
12. **System Field Injection**: Overwriting a system-managed `lastPracticed` with a client string.

## 3. Test Runner Concept
The tests will verify that `PERMISSION_DENIED` is returned for all the above.
