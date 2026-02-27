<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreRecurringTransactionRequest;
use App\Http\Requests\UpdateRecurringTransactionRequest;
use App\Http\Resources\RecurringTransactionResource;
use App\Models\RecurringTransaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class RecurringTransactionController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $recurringTransactions = $request->user()
            ->recurringTransactions()
            ->with('category')
            ->orderBy('day_of_month')
            ->orderByDesc('id')
            ->get();

        return RecurringTransactionResource::collection($recurringTransactions);
    }

    public function store(StoreRecurringTransactionRequest $request): RecurringTransactionResource
    {
        $recurringTransaction = $request->user()->recurringTransactions()->create($request->validated());

        return new RecurringTransactionResource($recurringTransaction->load('category'));
    }

    public function show(Request $request, RecurringTransaction $recurringTransaction): RecurringTransactionResource
    {
        $this->authorizeOwnership($request, $recurringTransaction);

        return new RecurringTransactionResource($recurringTransaction->load('category'));
    }

    public function update(UpdateRecurringTransactionRequest $request, RecurringTransaction $recurringTransaction): RecurringTransactionResource
    {
        $this->authorizeOwnership($request, $recurringTransaction);

        $recurringTransaction->update($request->validated());

        return new RecurringTransactionResource($recurringTransaction->load('category'));
    }

    public function destroy(Request $request, RecurringTransaction $recurringTransaction): JsonResponse
    {
        $this->authorizeOwnership($request, $recurringTransaction);

        $recurringTransaction->delete();

        return response()->json(null, 204);
    }

    private function authorizeOwnership(Request $request, RecurringTransaction $recurringTransaction): void
    {
        abort_if($recurringTransaction->user_id !== $request->user()->id, 403);
    }
}
