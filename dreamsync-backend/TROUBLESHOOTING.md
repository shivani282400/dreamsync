# 🔧 Troubleshooting Neon Connection

## Your .env File is Set Up ✅

Your `.env` file now has the correct connection string:
```
DATABASE_URL="postgresql://neondb_owner:npg_jLgfaS87ybIC@ep-round-band-ah5v9ep6-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
```

## If You're Getting Connection Errors

### 1. Check if Your Database is Active

Neon free tier databases **pause automatically** after inactivity. You need to:

1. Go to https://console.neon.tech
2. Check if your project shows "Paused" or "Active"
3. If paused, click "Resume" or "Activate"
4. Wait a few seconds for it to wake up

### 2. Try the Direct Connection

Sometimes the pooled connection doesn't work for migrations. Try updating your `.env`:

```env
# Try direct connection (remove -pooler)
DATABASE_URL="postgresql://neondb_owner:npg_jLgfaS87ybIC@ep-round-band-ah5v9ep6.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
```

### 3. Verify Connection String

1. Go to Neon Console
2. Click "Connection Details"
3. Copy the connection string again (it might have changed)
4. Update your `.env` file

### 4. Test Connection Manually

```bash
psql "postgresql://neondb_owner:npg_jLgfaS87ybIC@ep-round-band-ah5v9ep6-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require" -c "SELECT 1;"
```

If this works, the connection string is correct.

### 5. Try Using `prisma db push` Instead

If migrations fail, try:

```bash
npx prisma db push
```

This pushes the schema directly without migrations.

## Once Connected

After the connection works, run:
```bash
npm run db:setup
```

This will create all your tables (User, Dream, Interpretation).
