<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Business extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'code',
        'slug',
        'email',
        'phone',
        'address',
        'tax_id',
        'is_active',
        'settings',
        'business_type',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'settings' => 'array',
    ];

    /**
     * Get all branches for this business
     */
    public function branches(): HasMany
    {
        return $this->hasMany(Branch::class);
    }

    /**
     * Get active branches only
     */
    public function activeBranches(): HasMany
    {
        return $this->branches()->where('is_active', true);
    }

    /**
     * Get the main branch
     */
    public function mainBranch(): ?Branch
    {
        return $this->branches()->where('is_main_branch', true)->first();
    }

    /**
     * Get all users in this business
     */
    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    /**
     * Get all shops through branches
     */
    public function shops()
    {
        return Shop::whereHas('branch', function ($query) {
            $query->where('business_id', $this->id);
        });
    }

    /**
     * Check if business is active
     */
    public function isActive(): bool
    {
        return $this->is_active;
    }
}
