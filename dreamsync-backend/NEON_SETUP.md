# Neon Database Setup

## Steps to Connect to Neon

1. **Get your Neon connection strings:**
   - Go to [Neon Console](https://console.neon.tech)
   - Select your project
   - Go to "Connection Details"
   - You'll see two connection strings:
     - **Pooled connection** (recommended for application) - Use this for `DATABASE_URL`
     - **Direct connection** (for migrations) - Use this for `DIRECT_URL`

2. **Create a `.env` file in the `dreamsync-backend` directory:**
   ```bash
   cd dreamsync-backend
   ```

   Create `.env` file with:
   ```env
   # Use the pooled connection string for your application
   DATABASE_URL="postgresql://user:password@ep-xxx-xxx-pooler.region.aws.neon.tech/dbname?sslmode=require"
   
   # Use the direct connection string for migrations (optional but recommended)
   DIRECT_URL="postgresql://user:password@ep-xxx-xxx.region.aws.neon.tech/dbname?sslmode=require"
   
   # JWT Secret (change this to a secure random string in production)
   JWT_SECRET="your-secure-jwt-secret-here"
   ```

3. **Quick Setup (run all steps at once):**
   ```bash
   npm run db:setup
   ```

   Or run individually:
   ```bash
   # Generate Prisma Client
   npm run prisma:generate
   
   # Run migrations to set up the database
   npm run prisma:migrate
   ```

4. **Verify connection:**
   ```bash
   npm run prisma:studio
   ```
   This will open Prisma Studio where you can view your database.

## Neon Connection String Format

### Pooled Connection (for DATABASE_URL)
Use the **pooled connection** for your application. It looks like:
```
postgresql://user:password@ep-xxx-xxx-pooler.region.aws.neon.tech/dbname?sslmode=require
```
Note the `-pooler` in the hostname - this enables connection pooling.

### Direct Connection (for DIRECT_URL - optional)
Use the **direct connection** for migrations. It looks like:
```
postgresql://user:password@ep-xxx-xxx.region.aws.neon.tech/dbname?sslmode=require
```

## Important Notes

- **Always use SSL**: Neon requires `?sslmode=require` in the connection string
- **Connection Pooling**: Use the pooled connection for better performance in production
- **Migrations**: If you set `DIRECT_URL`, Prisma will use it for migrations automatically
- **Security**: Never commit your `.env` file to git (it should be in `.gitignore`)

## Troubleshooting

If you get connection errors:
1. Verify your connection strings are correct
2. Check that `sslmode=require` is included
3. Ensure your Neon project is active (not paused)
4. Try using the direct connection for both `DATABASE_URL` and `DIRECT_URL` if pooling causes issues
