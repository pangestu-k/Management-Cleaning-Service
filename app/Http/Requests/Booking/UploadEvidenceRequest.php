<?php

namespace App\Http\Requests\Booking;

use Illuminate\Foundation\Http\FormRequest;

class UploadEvidenceRequest extends FormRequest
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
            'evidence_cleaner' => ['required', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'evidence_cleaner.required' => 'Evidence wajib diisi.',
            'evidence_cleaner.string' => 'Evidence harus berupa teks.',
        ];
    }
}
