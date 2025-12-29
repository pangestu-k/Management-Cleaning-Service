<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Schedule extends Model
{
    protected $fillable = [
        'id',
        'date',
        'start_time',
        'end_time',
        'capacity',
        'remaining_capacity',
        'status',
    ];

    public $incrementing = false;

    protected function casts(): array
    {
        return [
            'date' => 'date',
            'capacity' => 'integer',
            'remaining_capacity' => 'integer',
        ];
    }

    // Status constants
    public const STATUS_AVAILABLE = 'available';
    public const STATUS_FULL = 'full';
    public const STATUS_UNAVAILABLE = 'unavailable';

    // Relationships
    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    // Helpers
    public function isAvailable(): bool
    {
        return $this->status === self::STATUS_AVAILABLE && $this->remaining_capacity > 0;
    }

    public function decrementCapacity(): void
    {
        $this->remaining_capacity--;
        if ($this->remaining_capacity <= 0) {
            $this->status = self::STATUS_FULL;
        }
        $this->save();
    }

    // Scopes
    public function scopeAvailable($query)
    {
        return $query->where('status', self::STATUS_AVAILABLE)
            ->where('remaining_capacity', '>', 0);
    }

    public function scopeUpcoming($query)
    {
        return $query->where('date', '>=', now()->toDateString());
    }
}
