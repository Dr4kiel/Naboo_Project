<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTransactionRequest;
use App\Http\Requests\UpdateTransactionRequest;
use App\Http\Resources\TransactionResource;
use App\Models\Transaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class TransactionController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $transactions = $request->user()
            ->transactions()
            ->with('category')
            ->orderByDesc('date')
            ->orderByDesc('id')
            ->get();

        return TransactionResource::collection($transactions);
    }

    public function store(StoreTransactionRequest $request): TransactionResource
    {
        $transaction = $request->user()->transactions()->create($request->validated());

        return new TransactionResource($transaction->load('category'));
    }

    public function show(Request $request, Transaction $transaction): TransactionResource
    {
        $this->authorizeOwnership($request, $transaction);

        return new TransactionResource($transaction->load('category'));
    }

    public function update(UpdateTransactionRequest $request, Transaction $transaction): TransactionResource
    {
        $this->authorizeOwnership($request, $transaction);

        $transaction->update($request->validated());

        return new TransactionResource($transaction->load('category'));
    }

    public function destroy(Request $request, Transaction $transaction): JsonResponse
    {
        $this->authorizeOwnership($request, $transaction);

        $transaction->delete();

        return response()->json(null, 204);
    }

    private function authorizeOwnership(Request $request, Transaction $transaction): void
    {
        abort_if($transaction->user_id !== $request->user()->id, 403);
    }
}
