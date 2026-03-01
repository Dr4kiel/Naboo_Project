<?php

namespace App\Console\Commands;

use App\Services\RecurringTransactionService;
use Carbon\Carbon;
use Carbon\Exceptions\InvalidFormatException;
use Illuminate\Console\Command;

class ProcessRecurringTransactions extends Command
{
    protected $signature = 'recurring:process {--date= : Date Y-m-d, defaults to today}';

    protected $description = 'Generate transactions for active recurring transactions matching the given date';

    public function handle(RecurringTransactionService $service): int
    {
        $dateOption = $this->option('date');

        if ($dateOption !== null) {
            try {
                $date = Carbon::createFromFormat('Y-m-d', $dateOption)->startOfDay();
            } catch (InvalidFormatException $e) {
                $this->error("Invalid date format: \"{$dateOption}\". Expected Y-m-d.");

                return self::FAILURE;
            }
        } else {
            $date = Carbon::today();
        }

        $created = $service->processDate($date);

        $this->info("Done. Created {$created} transaction(s).");

        return self::SUCCESS;
    }
}
