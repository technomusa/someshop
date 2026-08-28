<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class BrandController extends Controller
{
    public function index()
    {
        return Brand::all();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'image' => 'nullable|string', // URL or path
        ]);

        $brand = Brand::create([
            'name' => $validated['name'],
            'slug' => Str::slug($validated['name']),
            'image' => $validated['image'] ?? null,
        ]);

        return response()->json($brand, 201);
    }

    public function show(Brand $brand)
    {
        return $brand;
    }

    public function update(Request $request, Brand $brand)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'image' => 'nullable|string',
        ]);

        if (isset($validated['name'])) {
            $brand->name = $validated['name'];
            $brand->slug = Str::slug($validated['name']);
        }

        if (array_key_exists('image', $validated)) {
            $brand->image = $validated['image'];
        }

        $brand->save();

        return response()->json($brand);
    }

    public function destroy(Brand $brand)
    {
        $brand->delete();
        return response()->noContent();
    }
}
