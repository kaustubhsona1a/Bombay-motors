# Bombay Motors Security Specification

## 1. Data Invariants
1. **Public Site Settings Access**: Any connection (authenticated or guest) is authorized to perform standard `get` or view operations on the `/site_config/global` document. However, `write` functions are exclusively reserved for verified administrators.
2. **Public Vehicle Catalog Access**: Public users can list/get documents in `/vehicles` collection to view available inventory. Writing/deleting vehicles is locked exclusively to verified administrators.
3. **Public Lead Inbound Submission**: Anyone (authenticated or guest) can submit an inquiry via `create` in the `/leads` collection. However, read (`get`, `list`), modify, or delete operations on leads are strictly restricted to administrators to protect client PII.
4. **User Profile Isolation**: Users can read and write `/users/{userId}` only if they are authenticated as `userId`. Users are strictly prohibited from upgrading their own role to `admin` (Self-Assigned Roles prevention).
5. **Timestamp Temporal Integrity**: All writes (`create`/`update`) that insert or modify timestamps must align `createdAt` and `updatedAt` values to the secure firestore platform clock (`request.time`).
6. **Immutable Field Locks**: Fields like vehicle IDs, lead IDs, and creation dates cannot be mutated after resource initiation.

---

## 2. The "Dirty Dozen" Payloads (Adversarial Tests)

Here are the 12 attack vectors designed to fail the security validations:

### Attack 1: Self-Promoted Admin (Privilege Escalation on User Profile)
- **Path**: `/users/attacker_uid`
- **Method**: `create`
- **Payload**: `{ "uid": "attacker_uid", "email": "attacker@gmail.com", "role": "admin" }`
- **Expected Action**: `PERMISSION_DENIED` (users cannot assign themselves the admin role).

### Attack 2: Poisoned ID (Denial of Wallet / Resource Poisoning in Vehicles)
- **Path**: `/vehicles/very_long_junk_id_12345_67890_abc_def_xyz_over_128_characters`
- **Method**: `create`
- **Payload**: `{ "id": "very_long_junk_id_...", "make": "Audi", "model": "R8", "price": 100 }`
- **Expected Action**: `PERMISSION_DENIED` (ID exceeds 128 characters or fails regex constraints).

### Attack 3: Spoofed Timestamp (Client-time forgery in Vehicle addition)
- **Path**: `/vehicles/v_123`
- **Method**: `create`
- **Payload**: `{ "id": "v_123", "make": "Lexus", "model": "LC500", "price": 95.0, "createdAt": "2020-01-01T00:00:00Z" }`
- **Expected Action**: `PERMISSION_DENIED` (createdAt must be request.time).

### Attack 4: Lead Scraping (PII Leakage attack)
- **Path**: `/leads/lead_456`
- **Method**: `get`
- **Payload**: (None - direct fetch attempt by a random public user)
- **Expected Action**: `PERMISSION_DENIED` (only admins can read leads).

### Attack 5: Rogue Vehicle Modification by Non-Admin
- **Path**: `/vehicles/v_123`
- **Method**: `update`
- **Payload**: `{ "price": 1.0 }` (Unauthorized public user trying to change pricing)
- **Expected Action**: `PERMISSION_DENIED`.

### Attack 6: Bypass Validation Invariant (Adding a vehicle with string as price)
- **Path**: `/vehicles/v_123`
- **Method**: `create`
- **Payload**: `{ "id": "v_123", "make": "Mercedes", "price": "cheap" }`
- **Expected Action**: `PERMISSION_DENIED` (price verification failure - not a number).

### Attack 7: Lead Hijack (Unauthorized modification of status)
- **Path**: `/leads/lead_456`
- **Method**: `update`
- **Payload**: `{ "status": "CLOSED" }` (random visitor trying to close another client's lead)
- **Expected Action**: `PERMISSION_DENIED`.

### Attack 8: Identity Spoofing (Creating user profile for someone else)
- **Path**: `/users/other_user_uid`
- **Method**: `create`
- **Payload**: `{ "uid": "other_user_uid", "email": "victim@gmail.com", "role": "user" }`
- **Expected Action**: `PERMISSION_DENIED` (uid must match request.auth.uid).

### Attack 9: Immutable Field Break (Overwriting createdAt timestamp of a Vehicle)
- **Path**: `/vehicles/v_123`
- **Method**: `update`
- **Payload**: `{ "createdAt": "2030-01-01T00:00:00Z" }`
- **Expected Action**: `PERMISSION_DENIED` (createdAt cannot be altered).

### Attack 10: Anonymous Lead Query/List Scraping
- **Path**: `/leads`
- **Method**: `list`
- **Payload**: (Any query filter)
- **Expected Action**: `PERMISSION_DENIED` (List allows are strictly checked; non-admins get blocked).

### Attack 11: Site Config Modification (Malicious redirect injected in branding)
- **Path**: `/site_config/global`
- **Method**: `update`
- **Payload**: `{ "homeBanner": "https://malicious-website.com" }`
- **Expected Action**: `PERMISSION_DENIED` (must be admin).

### Attack 12: Lead Injection of Giant Payload (Wallet exhaustion)
- **Path**: `/leads/lead_giant`
- **Method**: `create`
- **Payload**: `{ "id": "lead_giant", "customerName": "A...", "notes": "very big string over 5000 chars..." }`
- **Expected Action**: `PERMISSION_DENIED` (fails notes sizing limits).
