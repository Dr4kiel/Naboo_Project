<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RecurringTransaction extends Model
{
    protected $fillable = ['user_id', 'category_id', 'amount', 'type', 'description', 'day_of_month', 'is_active'];

    protected $casts = [
        'amount' => 'decimal:2',
        'day_of_month' => 'integer',
        'is_active' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }
}
