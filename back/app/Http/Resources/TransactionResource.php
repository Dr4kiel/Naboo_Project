<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\Transaction */
class TransactionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'          => $this->id,
            'amount'      => $this->amount,
            'type'        => $this->type,
            'description' => $this->description,
            'date'        => $this->date->toDateString(),
            'category'    => new CategoryResource($this->whenLoaded('category')),
            'created_at'  => $this->created_at,
        ];
    }
}
