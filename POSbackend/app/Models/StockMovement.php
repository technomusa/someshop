<?php

namespace App\Models;

use App\Traits\HasMultiTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StockMovement extends Model
{
    use HasFactory, HasMultiTenant;
    
    protected $fillable = [
        'product_id', 'variation_id', 'type', 'quantity', 
        'reference_id', 'reason', 'user_id', 
        'shop_id', 'from_shop_id', 'to_shop_id'
    ];
    
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
    
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
