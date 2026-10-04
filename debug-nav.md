# Navigation Debug Steps

## Steps to verify Supplier menu appears:

1. **Restart Development Server**:
   ```bash
   cd FRANCHISE-TENANT-ADMIN
   npm run dev
   # or
   yarn dev
   ```

2. **Clear Browser Cache**:
   - Press Ctrl+F5 (hard refresh)
   - Or open DevTools → Application → Storage → Clear storage

3. **Check Console**:
   - Open browser DevTools (F12)
   - Check Console tab for navigation logs
   - Should see: "Navigation items: [number] User role: [role]"

4. **Direct URL Test**:
   - Navigate to: `http://localhost:[port]/suppliers-test`
   - Should show test page if routing works

5. **Check User Role**:
   - Suppliers menu only shows for roles: ['SuperAdmin', 'Admin']
   - Verify current user has correct role

## Expected Navigation Order:
1. Dashboard
2. Franchise Management (group)
3. Subscription Plans
4. **Suppliers** ← Should appear here
5. Payments & Invoices
6. Free Trial Packages
7. Users & Roles
...

## If Still Not Visible:
- Check user authentication
- Verify user role in AppContext
- Check for JavaScript errors in console