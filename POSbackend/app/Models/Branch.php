<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Branch extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'business_id',
        'name',
        'code',
        'location',
        'phone',
        'email',
        'address',
        'is_active',
        'is_main_branch',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'is_main_branch' => 'boolean',
    ];

    /**
     * Get the business this branch belongs to
     */
    public function business(): BelongsTo
    {
        return $this->belongsTo(Business::class);
    }

    /**
     * Get all shops in this branch
     */
    public function shops(): HasMany
    {
        return $this->hasMany(Shop::class);
    }

    /**
     * Get active shops only
     */
    public function activeShops(): HasMany
    {
        return $this->shops()->where('is_active', true);
    }

    /**
     * Get all users in this branch
     */
    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    /**
     * Check if branch is active
     */
    public function isActive(): bool
    {
        return $this->is_active;
    }

    /**
     * Check if this is the main branch
     */
    public function isMainBranch(): bool
    {
        return $this->is_main_branch;
    }
}
