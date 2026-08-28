<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SaleItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'sale_id', 'product_id', 'variation_id', 
        'product_name', 'quantity', 'unit_price', 
        'subtotal', 'tax_amount', 'discount_amount', 'total_price'
    ];
    
    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
