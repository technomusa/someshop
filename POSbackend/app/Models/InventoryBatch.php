<?php

namespace App\Models;

use App\Traits\HasShop;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InventoryBatch extends Model
{
    use HasFactory, HasShop;

    protected $fillable = [
        'product_id', 'variation_id', 'batch_number', 'quantity', 
        'expiry_date', 'cost_price', 'supplier_id', 'shop_id'
    ];
}
