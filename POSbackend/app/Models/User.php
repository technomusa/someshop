<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, Notifiable, HasRoles;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'business_id',
        'branch_id',
        'shop_id',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Get the business this user belongs to
     */
    public function business()
    {
        return $this->belongsTo(Business::class);
    }

    /**
     * Get the branch this user belongs to
     */
    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }

    /**
     * Get all shops this user has access to (many-to-many)
     */
    public function shops()
    {
        return $this->belongsToMany(Shop::class, 'shop_user');
    }

    /**
     * Get the primary/active shop for this user
     */
    public function shop()
    {
        return $this->belongsTo(Shop::class, 'shop_id');
    }

    public function getShopRole($shopId)
    {
        // Return user's global role (assuming role applies across shops)
        // If you need shop-specific roles, adjust this logic
        return $this->getRoleNames()->first() ?? 'user';
    }

    public function getCurrentDrawerSession()
    {
        // Placeholder for drawer session logic (return null if not found)
        return null;
    }

    /**
     * Check if user is super admin
     */
    public function isSuperAdmin(): bool
    {
        return $this->hasRole('super_admin');
    }

    /**
     * Check if user is business admin
     */
    public function isAdmin(): bool
    {
        return $this->hasRole('admin');
    }

    /**
     * Check if user is branch manager
     */
    public function isManager(): bool
    {
        return $this->hasRole('manager');
    }

    /**
     * Check if user is employee (shop-level)
     */
    public function isEmployee(): bool
    {
        return $this->hasRole('employee');
    }

    /**
     * Check if user is cashier (shop-level)
     */
    public function isCashier(): bool
    {
        return $this->hasRole('cashier');
    }

    /**
     * Check if user is auditor (read-only)
     */
    public function isAuditor(): bool
    {
        return $this->hasRole('auditor');
    }

    /**
     * Get user's role level for scoping
     * Returns: 'super_admin', 'admin', 'manager', 'employee', 'cashier', 'auditor'
     */
    public function getRoleLevel(): string
    {
        if ($this->isSuperAdmin()) {
            return 'super_admin';
        }
        if ($this->isAdmin()) {
            return 'admin';
        }
        if ($this->isManager()) {
            return 'manager';
        }
        if ($this->isAuditor()) {
            return 'auditor';
        }
        if ($this->isCashier()) {
            return 'cashier';
        }
        return 'employee';
    }

    public function getPreferredCurrency()
    {
        return $this->shop?->primary_currency ?? 'USD';
    }

    public function getSalesStatistics()
    {
        return [
            'total_sales' => 0,
            'total_transactions' => 0,
            'average_transaction' => 0,
        ];
    }
}
