<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DrawerSession;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class AccountingController extends Controller
{
    // Record Expense
    public function storeExpense(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string',
            'amount' => 'required|numeric|min:0',
            'category' => 'nullable|string',
            'expense_date' => 'required|date',
            'notes' => 'nullable|string',
        ]);
        
        $shopId = $request->user()->shop_id;
        if (!$shopId) {
             return response()->json(['error' => 'No active shop context'], 400);
        }

        $expense = \App\Models\Expense::create([
             'shop_id' => $shopId,
             'user_id' => $request->user()->id,
             ...$validated
        ]);
        
        return response()->json($expense, 201);
    }
    
    // Open Register/Drawer
    public function openDrawer(Request $request)
    {
        $shopId = $request->user()->shop_id;
        if (!$shopId) return response()->json(['error' => 'No active shop context'], 400);
        
        // Check if already open
        $existing = DrawerSession::where('shop_id', $shopId)
            ->where('user_id', $request->user()->id)
            ->where('status', 'open')
            ->first();
            
        if ($existing) {
            return response()->json(['error' => 'Drawer already open'], 400);
        }

        $validated = $request->validate(['opening_cash' => 'required|numeric|min:0']);

        $session = DrawerSession::create([
            'shop_id' => $shopId,
            'user_id' => $request->user()->id,
            'started_at' => now(),
            'opening_cash' => $validated['opening_cash'],
            'status' => 'open'
        ]);
        
        return response()->json($session, 201);
    }
    
    // Close Register/Drawer (End of Day Audit)
    public function closeDrawer(Request $request)
    {
        $shopId = $request->user()->shop_id;
        if (!$shopId) return response()->json(['error' => 'No active shop context'], 400);

        $session = DrawerSession::where('shop_id', $shopId)
            ->where('user_id', $request->user()->id)
            ->where('status', 'open')
            ->firstOrFail();

        $validated = $request->validate([
            'actual_cash' => 'required|numeric|min:0',
            'notes' => 'nullable|string'
        ]);

        // Calculate System Totals
        // Sum of CASH payments for this user in this shop since started_at
        $cashSales = \App\Models\Payment::whereHas('sale', function($q) use ($session) {
                $q->where('shop_id', $session->shop_id)
                  ->where('user_id', $session->user_id)
                  ->whereBetween('created_at', [$session->started_at, now()]);
            })
            ->where('method', 'cash')
            ->sum('amount');
            
        $expectedCash = $session->opening_cash + $cashSales;
        $difference = $validated['actual_cash'] - $expectedCash;

        $session->update([
            'ended_at' => now(),
            'closing_cash' => $expectedCash,
            'actual_cash' => $validated['actual_cash'],
            'difference' => $difference,
            'status' => 'closed', // Or 'audited' directly
            'notes' => $validated['notes']
        ]);
        
        return response()->json([
            'session' => $session,
            'system_sales' => $cashSales,
            'discrepancy' => $difference
        ]);
    }
    
    public function mySessions(Request $request)
    {
         return DrawerSession::where('user_id', $request->user()->id)->latest()->paginate(10);
    }
}
