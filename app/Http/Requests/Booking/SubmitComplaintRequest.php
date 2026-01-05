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
            'customer_complaint' => [
                'required',
                'image',
                'mimes:jpeg,jpg,png',
                'max:2048', // 2MB
            ],
            'customer_complaint_desc' => [
                'required',
                'string',
                'min:10',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'customer_complaint.required' => 'Foto bukti keluhan wajib diupload.',
            'customer_complaint.image' => 'File harus berupa gambar.',
            'customer_complaint.mimes' => 'Format gambar harus jpeg, jpg, atau png.',
            'customer_complaint.max' => 'Ukuran gambar maksimal 2MB.',
            'customer_complaint_desc.required' => 'Deskripsi keluhan wajib diisi.',
            'customer_complaint_desc.string' => 'Deskripsi harus berupa teks.',
            'customer_complaint_desc.min' => 'Deskripsi minimal 10 karakter.',
        ];
    }
}
