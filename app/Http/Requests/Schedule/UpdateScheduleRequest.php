<?php

namespace App\Http\Requests\Schedule;

use Illuminate\Foundation\Http\FormRequest;

class UpdateScheduleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'date' => ['sometimes', 'date'],
            'start_time' => ['sometimes', 'date_format:H:i'],
            'end_time' => ['sometimes', 'date_format:H:i'],
            'capacity' => ['sometimes', 'integer', 'min:1'],
            'remaining_capacity' => ['sometimes', 'integer', 'min:0'],
            'status' => ['sometimes', 'string', 'in:available,full,unavailable'],
        ];
    }
}
