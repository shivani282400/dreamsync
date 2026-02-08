# 🔴 URGENT: Fix Your .env File

Your `.env` file still has **placeholder values** instead of your real Neon connection string.

## The Problem

Your `.env` currently has:
```
DATABASE_URL="postgresql://user:password@ep-xxx-xxx-pooler.region.aws.neon.tech/dbname?sslmode=require"
```

This is a **placeholder** - it's not a real database! That's why you're getting the connection error.

## The Solution

### Option 1: If you already have a Neon database

1. **Get your connection string:**
   - Go to https://console.neon.tech
   - Click on your project
   - Click "Connection Details" 
   - Copy the connection string (it will look like):
     ```
     postgresql://neondb_owner:xxxxx@ep-xxx-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require
     ```

2. **Edit your .env file:**
   ```bash
   cd dreamsync-backend
   nano .env
   ```
   
   Replace the entire `DATABASE_URL` line with your real connection string:
   ```env
   DATABASE_URL="postgresql://neondb_owner:YOUR_ACTUAL_PASSWORD@ep-xxx-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require"
   JWT_SECRET="dev-secret-change-me-in-production"
   ```
   
   **Remove the DIRECT_URL line** (it's optional and not needed).

3. **Save and exit:**
   - Press `Ctrl+X`, then `Y`, then `Enter`

4. **Test the connection:**
   ```bash
   npm run db:setup
   ```

### Option 2: If you DON'T have a Neon database yet

1. **Create a free Neon account:**
   - Go to https://neon.tech
   - Sign up (it's free)
   - Create a new project

2. **Get your connection string:**
   - In the Neon dashboard, click "Connection Details"
   - Copy the connection string

3. **Update your .env file** (same as Option 1, step 2)

## Quick Command to Edit

```bash
cd dreamsync-backend
nano .env
```

Then:
- Find the line: `DATABASE_URL="postgresql://user:password@ep-xxx-xxx...`
- Replace it with your REAL connection string from Neon
- Remove the `DIRECT_URL` line
- Save (Ctrl+X, Y, Enter)

## After Fixing

Run:
```bash
npm run db:setup
```

This should work once you have the real connection string!
