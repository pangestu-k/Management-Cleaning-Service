<?php

namespace App\Http\Requests\Booking;

use App\Models\Booking;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateBookingStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $rules = [
            'status' => [
                'required',
                'string',
                Rule::in(Booking::getStatuses()),
            ],
        ];

        // Require evidence image if status is completed
        if ($this->status === 'completed') {
            $rules['evidence_cleaner'] = [
                'required',
                'image',
                'mimes:jpeg,jpg,png',
                'max:2048', // 2MB
            ];
        }

        return $rules;
    }

    public function messages(): array
    {
        return [
            'status.required' => 'Status wajib diisi.',
            'status.in' => 'Status tidak valid.',
            'evidence_cleaner.required' => 'Bukti foto wajib diupload untuk menyelesaikan booking.',
            'evidence_cleaner.image' => 'File harus berupa gambar.',
            'evidence_cleaner.mimes' => 'Format gambar harus jpeg, jpg, atau png.',
            'evidence_cleaner.max' => 'Ukuran gambar maksimal 2MB.',
        ];
    }
}
