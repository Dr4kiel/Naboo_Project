<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreRecurringTransactionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'category_id' => [
                'nullable',
                'integer',
                Rule::exists('categories', 'id')->where('user_id', $this->user()->id),
            ],
            'amount' => 'required|numeric|min:0.01',
            'type' => 'required|in:income,expense',
            'description' => 'nullable|string|max:500',
            'day_of_month' => 'required|integer|min:1|max:28',
            'is_active' => 'boolean',
        ];
    }
}
