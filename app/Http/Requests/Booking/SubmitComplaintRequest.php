<?php

namespace App\Http\Requests\Booking;

use Illuminate\Foundation\Http\FormRequest;

class SubmitComplaintRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'customer_complaint' => ['required', 'string', 'min:10'],
        ];
    }

    public function messages(): array
    {
        return [
            'customer_complaint.required' => 'Keluhan wajib diisi.',
            'customer_complaint.string' => 'Keluhan harus berupa teks.',
            'customer_complaint.min' => 'Keluhan minimal 10 karakter.',
        ];
    }
}
