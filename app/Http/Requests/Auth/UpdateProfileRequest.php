<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $userId = $this->user()->id;

        return [
            'name' => ['sometimes', 'string', 'max:255'],
            'email' => [
                'sometimes',
                'string',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($userId),
            ],
            'password' => ['sometimes', 'string', 'min:8', 'nullable'],
            'current_password' => ['required_with:password', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.string' => 'Nama harus berupa teks.',
            'email.email' => 'Format email tidak valid.',
            'email.unique' => 'Email sudah terdaftar.',
            'password.min' => 'Password minimal 8 karakter.',
            'current_password.required_with' => 'Password lama wajib diisi jika ingin mengubah password.',
        ];
    }
}

