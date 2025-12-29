<?php

namespace App\Http\Requests\Booking;

use Illuminate\Foundation\Http\FormRequest;

class AssignCleanerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'cleaner_id' => ['required', 'exists:cleaners,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'cleaner_id.required' => 'Cleaner wajib dipilih.',
            'cleaner_id.exists' => 'Cleaner tidak ditemukan.',
        ];
    }
}
