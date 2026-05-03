# Data Integrity Management

This document explains the data integrity management system that ensures all users with supervisor and student roles have corresponding records in their respective tables.

## Problem Solved

Previously, users could be assigned supervisor roles without having corresponding records in the `supervisors` table, causing issues like:
- Supervisor profile API returning 404 errors
- Dashboard showing inconsistent data
- Users unable to access supervisor functionality

## Solutions Implemented

### 1. Automatic Startup Check

**Location**: `src/lib/startupCheck.ts`

The application automatically runs data integrity checks when it starts up:

```typescript
// Runs automatically when dashboard loads
runStartupIntegrityCheck();
```

**What it does**:
- Checks for users with supervisor roles but no supervisor records
- Checks for users with student roles but no student records
- Automatically creates missing records with default values
- Logs all actions taken

### 2. Manual Sync API

**Endpoint**: `POST /api/admin/sync-supervisors`

Admins can manually trigger supervisor record synchronization:

```bash
curl -X POST http://localhost:3000/api/admin/sync-supervisors \
  -H "Authorization: Bearer <token>"
```

**Response**:
```json
{
  "success": true,
  "message": "Successfully synced 2 supervisor records",
  "syncedCount": 2
}
```

**Status Check**: `GET /api/admin/sync-supervisors`

Returns users who need supervisor records:
```json
{
  "success": true,
  "usersNeedingSync": 0,
  "users": []
}
```

### 3. Database Script

**Location**: `scripts/syncSupervisors.js`

Manual database synchronization script:

```bash
cd scripts
node syncSupervisors.js
```

### 4. User Creation Protection

**Location**: `src/app/api/admin/create-user/route.ts`

When creating new users with supervisor roles, the system automatically:
- Validates required supervisor fields (department, specialization)
- Creates corresponding supervisor record
- Ensures data consistency from the start

## Default Values for Auto-Created Records

### Supervisor Records
- **Department**: "General"
- **Specialization**: "General" 
- **Academic Rank**: "Lecturer"
- **Max Students**: 10
- **Current Students**: 0
- **Staff ID**: `STAFF{user_id}` (padded to 4 digits)

### Student Records
- **Registration Number**: `REG{user_id}` (padded to 6 digits)
- **Program**: "General"
- **Degree Level**: "Masters"
- **Enrollment Date**: Current date
- **Expected Completion**: 2 years from enrollment

## How to Use

### For Administrators

1. **Check Status**: Visit `GET /api/admin/sync-supervisors` to see if any users need records
2. **Fix Issues**: Call `POST /api/admin/sync-supervisors` to automatically create missing records
3. **Monitor**: Check console logs for startup integrity check results

### For Developers

1. **Automatic Protection**: The system prevents this issue from happening again
2. **Startup Checks**: Every application startup includes integrity verification
3. **Manual Tools**: Use the provided scripts and APIs for manual intervention

## Monitoring

The system provides detailed logging:

```
🚀 Running startup data integrity check...
🔍 Checking supervisor data integrity...
✅ Supervisor data integrity check passed - all supervisor users have records
🔍 Checking student data integrity...
✅ Student data integrity check passed - all student users have records
📊 Integrity check summary:
  - Supervisor issues: 0 (fixed: 0)
  - Student issues: 0 (fixed: 0)
  - Total: 0 issues, 0 fixed
✅ Startup integrity check passed - no issues found
```

## Prevention

This system ensures the issue won't happen again by:

1. **Startup Validation**: Checks on every application start
2. **Creation Validation**: Validates during user creation
3. **Automatic Fixes**: Auto-creates missing records
4. **Manual Tools**: Provides admin tools for manual fixes
5. **Comprehensive Logging**: Tracks all integrity operations

## Future Enhancements

- Add scheduled integrity checks (daily/weekly)
- Email notifications for admins when issues are found
- More sophisticated default value assignment
- Role-specific validation rules
- Audit trail for integrity operations
