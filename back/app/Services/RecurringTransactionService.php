<?php

namespace App\Services;

use App\Models\RecurringTransaction;
use App\Models\Transaction;
use Carbon\Carbon;

class RecurringTransactionService
{
    public function processDate(Carbon $date): int
    {
        $created = 0;

        RecurringTransaction::query()
            ->where('is_active', true)
            ->where('day_of_month', $date->day)
            ->get()
            ->each(function (RecurringTransaction $recurring) use ($date, &$created): void {
                // Deduplication: skip if already processed this month
                if (
                    $recurring->last_processed_at !== null
                    && $recurring->last_processed_at->year === $date->year
                    && $recurring->last_processed_at->month === $date->month
                ) {
                    return;
                }

                Transaction::create([
                    'user_id' => $recurring->user_id,
                    'category_id' => $recurring->category_id,
                    'amount' => $recurring->amount,
                    'type' => $recurring->type,
                    'description' => $recurring->description,
                    'date' => $date->toDateString(),
                ]);

                $recurring->update(['last_processed_at' => $date]);
                $created++;
            });

        return $created;
    }
}
