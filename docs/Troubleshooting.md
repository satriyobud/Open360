# Troubleshooting Guide

## Common Issues

### Port Already in Use

**Error**: `EADDRINUSE: address already in use :::5100`

**Solution**:
```bash
# Kill processes on ports 5100 and 5200
lsof -ti:5100 | xargs kill -9 2>/dev/null || true
lsof -ti:5200 | xargs kill -9 2>/dev/null || true

# Then restart
npm run dev
```

### Database Connection Error

**Error**: `Failed to connect to database`

**Solutions**:
1. Ensure MySQL is running:
   - **Linux**: `sudo systemctl start mysql`
   - **Mac**: `brew services start mysql`
   - **Windows**: Start MySQL service

2. Verify database exists:
   ```bash
   mysql -u root -p -e "SHOW DATABASES LIKE '360_feedback';"
   ```

3. Check `.env` file credentials match your MySQL setup

4. Test connection:
   ```bash
   mysql -u root -p -e "USE 360_feedback; SELECT 1;"
   ```

### Invalid Date Display

**Issue**: Dates show as "Invalid Date" in tables

**Solution**: This was fixed in the code. Make sure you have the latest version.

### Authentication Errors

**Issue**: "Token expired" or "Unauthorized"

**Solutions**:
1. Clear browser localStorage
2. Logout and login again
3. Check JWT_SECRET in `.env` matches between restarts

### Frontend Won't Connect to Backend

**Issue**: API calls fail with CORS or connection errors

**Solutions**:
1. Verify backend is running on port 5100
2. Check `frontend/src/services/api.ts` has correct API URL
3. In development, ensure proxy is set in `frontend/package.json`

### Database Tables Missing

**Issue**: "Table does not exist" errors

**Solution**: Tables are created automatically on first server start. If missing:
1. Ensure database exists: `CREATE DATABASE 360_feedback;`
2. Restart backend server
3. Or run seed script: `cd backend && node scripts/seed.js`

## Getting More Help

- Check the browser console for error messages
- Check backend terminal logs
- Review [[Installation Guide]] for setup steps
- Open an issue on GitHub with error details

