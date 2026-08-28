<?php

namespace App\Models;

use App\Traits\HasShop;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DrawerSession extends Model
{
    use HasFactory, HasShop;

    protected $fillable = [
        'shop_id', 'user_id', 'started_at', 'ended_at', 
        'opening_cash', 'closing_cash', 'actual_cash', 'difference',
        'notes', 'status'
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'ended_at' => 'datetime',
        'opening_cash' => 'decimal:2',
        'closing_cash' => 'decimal:2',
        'actual_cash' => 'decimal:2',
        'difference' => 'decimal:2',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
