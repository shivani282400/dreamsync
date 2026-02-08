# 🚀 Quick Start: Connect to Neon Database

## Step 1: Get Your Neon Connection String

1. Go to [Neon Console](https://console.neon.tech)
2. Select your project (or create one)
3. Click on "Connection Details"
4. Copy the **connection string** (it looks like):
   ```
   postgresql://user:password@ep-xxx-xxx.region.aws.neon.tech/neondb?sslmode=require
   ```

## Step 2: Update Your .env File

Open `dreamsync-backend/.env` and update it with your actual Neon connection string:

```env
DATABASE_URL="postgresql://your-actual-neon-connection-string-here?sslmode=require"
JWT_SECRET="your-secure-random-secret-here"
```

**Important**: 
- Replace the entire connection string with your actual Neon connection string
- Keep the `?sslmode=require` at the end
- Make sure there are no extra spaces or quotes

## Step 3: Set Up Database

Run this command to create all tables:

```bash
cd dreamsync-backend
npm run db:setup
```

This will:
1. Generate Prisma Client
2. Run migrations to create User, Dream, and Interpretation tables

## Step 4: Verify Connection

Open Prisma Studio to view your database:

```bash
npm run prisma:studio
```

## Step 5: Start Backend

```bash
npm run dev
```

Your authentication is now connected to Neon! 🎉

## Troubleshooting

**If you get connection errors:**
- Double-check your connection string in `.env`
- Make sure `?sslmode=require` is included
- Verify your Neon project is active (not paused)
- Try the connection string from Neon dashboard directly

**If migrations fail:**
- Make sure your database is accessible
- Check that the connection string is correct
- Try running `npm run prisma:generate` first, then `npm run prisma:migrate`
