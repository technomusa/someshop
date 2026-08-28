<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    public function index()
    {
        // Return hierarchy or flat list? Let's return flat with parent info for now, or simple hierarchy.
        // For POS, simple list is often easier, but hierarchy is good for menu.
        // Let's return top level categories with children loaded.
        return Category::with('children')->whereNull('parent_id')->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'parent_id' => 'nullable|exists:categories,id',
        ]);

        $category = Category::create([
            'name' => $validated['name'],
            'slug' => Str::slug($validated['name']),
            'parent_id' => $validated['parent_id'] ?? null,
        ]);

        return response()->json($category, 201);
    }

    public function show(Category $category)
    {
        return $category->load(['children', 'parent']);
    }

    public function update(Request $request, Category $category)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'parent_id' => 'nullable|exists:categories,id',
        ]);

        if (isset($validated['name'])) {
            $category->name = $validated['name'];
            $category->slug = Str::slug($validated['name']);
        }
        
        if (array_key_exists('parent_id', $validated)) {
            $category->parent_id = $validated['parent_id'];
        }

        $category->save();

        return response()->json($category);
    }

    public function destroy(Category $category)
    {
        $category->delete();
        return response()->noContent();
    }
}
