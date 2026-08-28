<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Business;
use App\Models\Branch;
use App\Models\Shop;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

/**
 * User Management Controller
 * 
 * Handles user creation and management with role-based access control
 * 
 * Rules:
 * - super_admin: Can create any user
 * - admin: Can create managers and employees for their business
 * - manager: Can create employees for their branch
 * - employee: Cannot create users
 */
class UserManagementController extends Controller
{
    /**
     * List users based on role scope
     */
    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', User::class);

        $query = User::with(['business', 'branch', 'shop', 'roles']);

        // Apply role-based filtering
        $user = auth()->user();
        $roleLevel = $user->getRoleLevel();

        switch ($roleLevel) {
            case 'admin':
                $query->where('business_id', $user->business_id);
                break;
            case 'manager':
                $query->where('branch_id', $user->branch_id);
                break;
            case 'employee':
            case 'auditor':
                // Employees and auditors cannot view other users
                return response()->json(['data' => []], 200);
        }

        $users = $query->get(); // Get all users (or use paginate if needed)
        return response()->json([
            'data' => $users
        ]);
    }

    /**
     * Create a new user
     */
    public function store(Request $request): JsonResponse
    {
        $this->authorize('create', User::class);

        $user = auth()->user();
        $roleLevel = $user->getRoleLevel();

        // Determine allowed roles based on current user's role
        $allowedRoles = $this->getAllowedRoles($roleLevel);

        // Check if user can create users
        if (empty($allowedRoles)) {
            return response()->json([
                'message' => 'You do not have permission to create users.'
            ], 403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
            'role' => [
                'required',
                'string',
                Rule::in($allowedRoles),
                function ($attribute, $value, $fail) use ($roleLevel) {
                    // Prevent creating users with the same role as creator
                    if ($value === $roleLevel) {
                        $fail("You cannot create users with the same role as yours ({$roleLevel}).");
                    }
                    // Prevent creating roles above current user's role
                    $roleHierarchy = ['employee' => 1, 'auditor' => 1, 'manager' => 2, 'admin' => 3, 'super_admin' => 4];
                    $currentLevel = $roleHierarchy[$roleLevel] ?? 0;
                    $targetLevel = $roleHierarchy[$value] ?? 0;
                    if ($targetLevel >= $currentLevel) {
                        $fail("You cannot create users with role '{$value}' as it is equal or higher than your role.");
                    }
                }
            ],
            'business_id' => [
                'nullable',
                'exists:businesses,id',
                function ($attribute, $value, $fail) use ($user, $roleLevel) {
                    if ($roleLevel === 'admin' && $value !== $user->business_id) {
                        $fail('You can only create users for your business.');
                    }
                }
            ],
            'branch_id' => [
                'nullable',
                'exists:branches,id',
                function ($attribute, $value, $fail) use ($user, $roleLevel) {
                    if ($roleLevel === 'manager' && $value !== $user->branch_id) {
                        $fail('You can only create users for your branch.');
                    }
                    if ($roleLevel === 'admin' && $value) {
                        // Verify branch belongs to admin's business
                        $branch = Branch::find($value);
                        if ($branch && $branch->business_id !== $user->business_id) {
                            $fail('Branch does not belong to your business.');
                        }
                    }
                }
            ],
            'shop_id' => [
                'nullable',
                'exists:shops,id',
                function ($attribute, $value, $fail) use ($user, $roleLevel, $request) {
                    // Employees must have shop_id
                    if ($request->role === 'employee' && !$value) {
                        $fail('Shop is required for employees.');
                    }
                    if ($value) {
                        // Verify shop belongs to user's scope
                        $shop = Shop::find($value);
                        if ($roleLevel === 'manager' && $shop->branch_id !== $user->branch_id) {
                            $fail('Shop does not belong to your branch.');
                        }
                        if ($roleLevel === 'admin' && $shop->branch->business_id !== $user->business_id) {
                            $fail('Shop does not belong to your business.');
                        }
                    }
                }
            ],
        ]);

        // Auto-assign business_id and branch_id based on role
        if ($roleLevel === 'admin') {
            $validated['business_id'] = $user->business_id;
        }
        if ($roleLevel === 'manager') {
            $validated['business_id'] = $user->business_id;
            $validated['branch_id'] = $user->branch_id;
        }

        // Create user
        $newUser = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'business_id' => $validated['business_id'] ?? null,
            'branch_id' => $validated['branch_id'] ?? null,
            'shop_id' => $validated['shop_id'] ?? null,
        ]);

        // Assign role
        $newUser->assignRole($validated['role']);

        // Send credentials via email (optional)
        // Mail::to($newUser->email)->send(new UserCreatedMail($newUser, $validated['password']));

        return response()->json([
            'message' => 'User created successfully',
            'data' => $newUser->load(['business', 'branch', 'shop', 'roles'])
        ], 201);
    }

    /**
     * Update user
     */
    public function update(Request $request, User $user): JsonResponse
    {
        $this->authorize('update', $user);

        $currentUser = auth()->user();
        $roleLevel = $currentUser->getRoleLevel();

        $allowedRoles = $this->getAllowedRoles($roleLevel);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => ['sometimes', 'email', Rule::unique('users')->ignore($user->id)],
            'password' => 'sometimes|string|min:8|confirmed',
            'role' => [
                'sometimes',
                'string',
                Rule::in($allowedRoles),
                function ($attribute, $value, $fail) use ($roleLevel) {
                    // Prevent assigning the same role as current user
                    if ($value === $roleLevel) {
                        $fail("You cannot assign users the same role as yours ({$roleLevel}).");
                    }
                }
            ],
            'shop_id' => [
                'nullable',
                'exists:shops,id',
                function ($attribute, $value, $fail) use ($currentUser, $roleLevel) {
                    if ($value) {
                        $shop = Shop::find($value);
                        if ($roleLevel === 'manager' && $shop->branch_id !== $currentUser->branch_id) {
                            $fail('Shop does not belong to your branch.');
                        }
                        if ($roleLevel === 'admin' && $shop->branch->business_id !== $currentUser->business_id) {
                            $fail('Shop does not belong to your business.');
                        }
                    }
                }
            ],
        ]);

        // Update user
        if (isset($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        }

        $user->update($validated);

        // Update role if provided
        if (isset($validated['role'])) {
            $user->syncRoles([$validated['role']]);
        }

        return response()->json([
            'message' => 'User updated successfully',
            'data' => $user->load(['business', 'branch', 'shop', 'roles'])
        ]);
    }

    /**
     * Delete user
     */
    public function destroy(User $user): JsonResponse
    {
        $this->authorize('delete', $user);

        $user->delete();

        return response()->json([
            'message' => 'User deleted successfully'
        ]);
    }

    /**
     * Get allowed roles based on current user's role
     * 
     * Rules:
     * - Users cannot create roles above their own
     * - Users cannot create users with their own role (only beneath)
     * - super_admin can create: admin, manager, employee, auditor (NOT super_admin)
     * - admin can create: manager, employee, auditor (NOT admin)
     * - manager can create: employee, auditor (NOT manager)
     * - auditor cannot create users
     * - employee cannot create users
     */
    protected function getAllowedRoles(string $roleLevel): array
    {
        return match ($roleLevel) {
            'super_admin' => ['admin', 'manager', 'employee', 'auditor'], // Cannot create super_admin
            'admin' => ['manager', 'employee', 'auditor'], // Cannot create admin
            'manager' => ['employee', 'auditor'], // Cannot create manager
            'auditor' => [], // Auditors cannot create users
            'employee' => [], // Employees cannot create users
            default => [],
        };
    }

    /**
     * Get available businesses for user creation (admin only)
     */
    public function getAvailableBusinesses(): JsonResponse
    {
        $user = auth()->user();

        if ($user->isSuperAdmin()) {
            $businesses = Business::all();
        } elseif ($user->isAdmin()) {
            $businesses = Business::where('id', $user->business_id)->get();
        } else {
            return response()->json(['data' => []], 200);
        }

        return response()->json(['data' => $businesses]);
    }

    /**
     * Get available branches for user creation
     */
    public function getAvailableBranches(Request $request): JsonResponse
    {
        $user = auth()->user();
        $businessId = $request->input('business_id', $user->business_id);

        if ($user->isSuperAdmin()) {
            $branches = Branch::where('business_id', $businessId)->get();
        } elseif ($user->isAdmin() && $businessId === $user->business_id) {
            $branches = Branch::where('business_id', $businessId)->get();
        } elseif ($user->isManager()) {
            $branches = Branch::where('id', $user->branch_id)->get();
        } else {
            return response()->json(['data' => []], 200);
        }

        return response()->json(['data' => $branches]);
    }

    /**
     * Get available shops for user creation
     */
    public function getAvailableShops(Request $request): JsonResponse
    {
        $user = auth()->user();
        $branchId = $request->input('branch_id', $user->branch_id);

        if ($user->isSuperAdmin()) {
            $shops = Shop::where('branch_id', $branchId)->get();
        } elseif ($user->isAdmin()) {
            // Verify branch belongs to admin's business
            $branch = Branch::find($branchId);
            if ($branch && $branch->business_id === $user->business_id) {
                $shops = Shop::where('branch_id', $branchId)->get();
            } else {
                return response()->json(['data' => []], 200);
            }
        } elseif ($user->isManager() && $branchId === $user->branch_id) {
            $shops = Shop::where('branch_id', $branchId)->get();
        } else {
            return response()->json(['data' => []], 200);
        }

        return response()->json(['data' => $shops]);
    }
}
