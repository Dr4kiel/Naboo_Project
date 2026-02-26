<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCategoryRequest;
use App\Http\Requests\UpdateCategoryRequest;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class CategoryController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $categories = $request->user()->categories()->orderBy('name')->get();

        return CategoryResource::collection($categories);
    }

    public function store(StoreCategoryRequest $request): CategoryResource
    {
        $category = $request->user()->categories()->create($request->validated());

        return new CategoryResource($category);
    }

    public function show(Request $request, Category $category): CategoryResource
    {
        $this->authorizeOwnership($request, $category);

        return new CategoryResource($category);
    }

    public function update(UpdateCategoryRequest $request, Category $category): CategoryResource
    {
        $this->authorizeOwnership($request, $category);

        $category->update($request->validated());

        return new CategoryResource($category);
    }

    public function destroy(Request $request, Category $category): JsonResponse
    {
        $this->authorizeOwnership($request, $category);

        $category->delete();

        return response()->json(null, 204);
    }

    private function authorizeOwnership(Request $request, Category $category): void
    {
        abort_if($category->user_id !== $request->user()->id, 403);
    }
}
