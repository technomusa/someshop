<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'name', 'slug', 'sku', 'barcode', 'description', 
        'category_id', 'brand_id', 'cost_price', 'selling_price', 
        'tax_rate', 'type', 'image', 'is_active', 'alert_quantity'
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'cost_price' => 'decimal:2',
        'selling_price' => 'decimal:2',
        'tax_rate' => 'decimal:2',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function brand()
    {
        return $this->belongsTo(Brand::class);
    }

    public function variations()
    {
        return $this->hasMany(Variation::class);
    }

    public function inventories()
    {
        return $this->hasMany(Inventory::class);
    }
    
    // Total stock across all variations (if any) or main product
    public function getTotalStockAttribute()
    {
        return $this->inventories()->sum('quantity') + 
               $this->variations()->withSum('inventories', 'quantity')->get()->sum('inventories_sum_quantity');
    }
}
