# Quick Start Guide - Backend Integration

## 🚀 Getting Started

### 1. Start the Backend
```bash
cd POSbackend
php artisan serve --port=8001
```

### 2. Start the Frontend
```bash
cd posfrontend
npm run dev
```

### 3. Login
- **Email:** `admin@store.com`
- **Password:** `password`

## 📦 New Features Available

### Multi-Shop Management
**Location:** Sidebar footer (both mobile & desktop)

**Usage:**
1. Click the shop dropdown in the sidebar
2. Select a different shop
3. System automatically reloads data for the new shop

**Code Example:**
```javascript
import { useShopStore } from "@/lib/shop-store";

const { shops, currentShop, switchShop, loadShops } = useShopStore();

// Load shops
await loadShops();

// Switch shop
await switchShop(shopId);
```

### Cash Drawer Sessions
**Components:** `DrawerOpenDialog`, `DrawerCloseDialog`

**Usage:**
```javascript
import { DrawerOpenDialog, DrawerCloseDialog } from "@/components/settings/drawer-dialogs";
import { useAccountingStore } from "@/lib/accounting-store";

const { openDrawer, closeDrawer, currentSession } = useAccountingStore();

// Open drawer
await openDrawer(100.00); // Opening cash amount

// Close drawer
const result = await closeDrawer(105.50, "End of shift"); // Actual cash, notes
// result.discrepancy will show +5.50 (over) or negative (short)
```

### Product Management
**Enhanced with backend CRUD:**

```javascript
import { usePOSStore } from "@/lib/store";

const { 
  products, 
  loadProducts, 
  addProduct, 
  updateProduct, 
  deleteProduct 
} = usePOSStore();

// Load products
await loadProducts();

// Add product
await addProduct({
  name: "New Product",
  sku: "SKU123",
  selling_price: 99.99,
  cost_price: 50.00,
  category_id: 1,
  brand_id: 1,
  type: "standard"
});

// Update product
await updateProduct(productId, { selling_price: 89.99 });

// Delete product
await deleteProduct(productId);
```

### Inventory Management
**Stock adjustments, receiving, and transfers:**

```javascript
import { useInventoryStore } from "@/lib/inventory-store";

const { 
  adjustInventory, 
  receiveInventory, 
  transferInventory 
} = useInventoryStore();

// Adjust inventory
await adjustInventory(productId, variantId, 10, "Stock count adjustment");

// Receive stock from supplier
await receiveInventory(productId, variantId, 50, supplierId, "Purchase order #123");

// Transfer between shops
await transferInventory(productId, variantId, 20, fromShopId, toShopId, "Rebalancing stock");
```

### Customer Management
**Full CRUD operations:**

```javascript
import { useCustomerStore } from "@/lib/customer-store";

const { 
  customers, 
  loadCustomers, 
  addCustomer, 
  updateCustomer, 
  deleteCustomer 
} = useCustomerStore();

// Load customers
await loadCustomers();

// Add customer
await addCustomer({
  name: "John Doe",
  email: "john@example.com",
  phone: "1234567890"
});

// Update customer
await updateCustomer(customerId, { email: "newemail@example.com" });

// Delete customer
await deleteCustomer(customerId);
```

### Sales & Checkout
**Create sales with proper backend integration:**

```javascript
import { usePOSStore } from "@/lib/store";

const { createSale, loadSales } = usePOSStore();

// Create a sale
await createSale({
  customer_id: 1, // Optional
  items: [
    {
      product_id: 1,
      variation_id: null,
      quantity: 2,
      unit_price: 99.99
    }
  ],
  payments: [
    {
      method: "cash",
      amount: 200.00
    }
  ]
});

// Load sales history
await loadSales();
```

### Supplier Management
**New supplier store:**

```javascript
import { useSupplierStore } from "@/lib/supplier-store";

const { 
  suppliers, 
  loadSuppliers, 
  addSupplier, 
  updateSupplier, 
  deleteSupplier 
} = useSupplierStore();

// Load suppliers
await loadSuppliers();

// Add supplier
await addSupplier({
  name: "ABC Suppliers",
  contact_person: "Jane Smith",
  email: "jane@abc.com",
  phone: "9876543210"
});
```

### Expense Tracking
**Record business expenses:**

```javascript
import { useAccountingStore } from "@/lib/accounting-store";

const { addExpense } = useAccountingStore();

await addExpense({
  title: "Office Supplies",
  amount: 150.00,
  category: "Operations",
  expense_date: "2025-12-11",
  notes: "Printer paper and pens"
});
```

## 🎨 UI Improvements

### Product Grid Enhancements
- ✅ Loading skeletons while fetching data
- ✅ Proper stock display from inventory
- ✅ Backend price handling (selling_price)
- ✅ Category and brand object support
- ✅ Variations support
- ✅ Low stock indicators based on alert_quantity

### Sidebar Enhancements
- ✅ Shop selector integrated
- ✅ Proper logout with backend call
- ✅ User role display
- ✅ Responsive mobile menu

## 🔧 Configuration

### Environment Variables
Create `.env.local` in the frontend root:

```env
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8001/api
```

### Backend Configuration
Ensure your backend `.env` has:

```env
APP_URL=http://127.0.0.1:8001
FRONTEND_URL=http://localhost:3000

# CORS settings in config/cors.php should allow localhost:3000
```

## 📊 Data Flow

### Authentication Flow
```
1. User enters credentials
2. POST /login → Returns { token, user }
3. Token stored in localStorage
4. Token automatically added to all requests
5. On 401 → Clear token and redirect to login
```

### Shop Context Flow
```
1. User logs in
2. GET /user/shops → Returns available shops
3. User selects shop
4. POST /user/switch-shop → Updates user.shop_id
5. Page reloads with new shop context
6. All subsequent requests use new shop_id
```

### Sale Creation Flow
```
1. Add items to cart
2. Select customer (optional)
3. Click checkout
4. POST /sales with items and payments
5. Backend:
   - Creates sale record
   - Creates sale items
   - Deducts inventory
   - Creates stock movements
   - Records payments
6. Returns complete sale with items
7. Frontend clears cart
```

## 🐛 Debugging Tips

### Check API Connection
```javascript
// In browser console
localStorage.getItem('auth_token') // Should show token
```

### View Network Requests
1. Open DevTools → Network tab
2. Filter by "Fetch/XHR"
3. Check request headers for Authorization token
4. Check response status codes

### Common Issues

**401 Unauthorized:**
- Token expired or invalid
- Clear localStorage and login again

**CORS Errors:**
- Check backend CORS configuration
- Ensure frontend URL is in allowed origins

**Data Not Loading:**
- Check console for errors
- Verify backend is running on port 8001
- Check network tab for failed requests

## 📱 Mobile Responsiveness

All new components are fully responsive:
- Shop selector adapts to mobile screens
- Drawer dialogs work on all screen sizes
- Product grid optimized for mobile
- Touch-friendly buttons and interactions

## 🔐 Security Notes

- Tokens stored in localStorage (consider httpOnly cookies for production)
- All API calls require authentication
- Shop context enforced on backend
- User can only access their assigned shops
- Drawer sessions tied to specific users

## 🎯 Next Development Steps

1. **Add more pages:**
   - Reports dashboard
   - Inventory management page
   - Supplier management page
   - Settings page with drawer management

2. **Enhance existing pages:**
   - Products page with full CRUD
   - Customers page with full CRUD
   - Sales history page

3. **Add features:**
   - Barcode scanning
   - Receipt printing
   - Email notifications
   - Real-time stock updates

4. **Performance:**
   - Implement pagination
   - Add caching
   - Optimize re-renders

5. **Testing:**
   - Unit tests for stores
   - Integration tests for API calls
   - E2E tests for critical flows
