<?php

namespace App\Models;

use App\Traits\HasMultiTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Inventory extends Model
{
    use HasFactory, HasMultiTenant;
    
    protected $fillable = ['product_id', 'variation_id', 'quantity', 'shop_id'];
    
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
    
    public function shop(): BelongsTo
    {
        return $this->belongsTo(Shop::class);
    }
}
