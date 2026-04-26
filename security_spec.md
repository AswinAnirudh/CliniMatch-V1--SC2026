# Security Specification - CliniMatch

## 1. Data Invariants
- **Volunteer**: 
    - `name` must be a string [1-100 chars].
    - `specialty` must be a string [1-100 chars].
    - `location` must be a string [1-100 chars].
    - `availability` must be a string [1-200 chars].
    - Creation is public for this demo (as per current app logic), but should be restricted in production.
- **ClinicNeed**:
    - `description` must be a string [1-1000 chars].
    - `createdAt` must be a server timestamp.

## 2. The "Dirty Dozen" Payloads (Denial Expected)

1. **Identity Spoofing (Volunteer)**: Attempt to create a volunteer with a fake `id`.
2. **Resource Poisoning (Volunteer)**: `name` is a 1MB string.
3. **Ghost Field (Volunteer)**: Including `isAdmin: true` in the profile.
4. **Invalid Type (Volunteer)**: `location` is a boolean.
5. **State Shortcutting (ClinicNeed)**: Attempting to set `createdAt` to a date in the future.
6. **Unauthorized Update (Volunteer)**: User A trying to update User B's profile.
7. **Bypassing Validation**: `specialty` is missing.
8. **PII Leak**: Unauthorized user trying to list all volunteers (if we had private fields).
9. **Relational Sync Failure**: Creating a need without an ID.
10. **ID Poisoning**: Document ID contains malicious characters.
11. **Shadow Update**: `affectedKeys` bypass attempt.
12. **Denial of Wallet**: Massive query without filters (if listing is restricted).

## 3. Red Team Audit Checklist
- [ ] Identity Spoofing blocked?
- [ ] Resource Poisoning blocked?
- [ ] All writes guarded by `isValid[Entity]`?
- [ ] `affectedKeys().hasOnly()` used on updates?
- [ ] No blanket reads?
