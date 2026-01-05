<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class Booking extends Model
{
    protected $fillable = [
        'id',
        'booking_code',
        'user_id',
        'service_id',
        'schedule_id',
        'cleaner_id',
        'address',
        'status',
        'evidence_cleaner',
        'customer_complaint',
        'total_price',
        'customer_complaint_desc'
    ];

    public $incrementing = false;

    protected function casts(): array
    {
        return [
            'total_price' => 'decimal:2',
        ];
    }

    // Status constants
    public const STATUS_PENDING = 'pending';
    public const STATUS_APPROVED = 'approved';
    public const STATUS_ON_PROGRESS = 'on_progress';
    public const STATUS_COMPLETED = 'completed';
    public const STATUS_CANCELED = 'canceled';
    public const STATUS_COMPLAINT = 'complaint';

    // Relationships
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }

    public function schedule(): BelongsTo
    {
        return $this->belongsTo(Schedule::class);
    }

    public function cleaner(): BelongsTo
    {
        return $this->belongsTo(Cleaner::class);
    }

    // Generate booking code
    public static function generateBookingCode(): string
    {
        $date = now()->format('Ymd');
        $random = strtoupper(Str::random(4));
        return "CLN-{$date}-{$random}";
    }

    // Status helpers
    public function isPending(): bool
    {
        return $this->status === self::STATUS_PENDING;
    }

    public function isApproved(): bool
    {
        return $this->status === self::STATUS_APPROVED;
    }

    public function isOnProgress(): bool
    {
        return $this->status === self::STATUS_ON_PROGRESS;
    }

    public function isCompleted(): bool
    {
        return $this->status === self::STATUS_COMPLETED;
    }

    public function isCanceled(): bool
    {
        return $this->status === self::STATUS_CANCELED;
    }

    public function isComplaint(): bool
    {
        return $this->status === self::STATUS_COMPLAINT;
    }

    // Get all valid statuses
    public static function getStatuses(): array
    {
        return [
            self::STATUS_PENDING,
            self::STATUS_APPROVED,
            self::STATUS_ON_PROGRESS,
            self::STATUS_COMPLETED,
            self::STATUS_CANCELED,
            self::STATUS_COMPLAINT,
        ];
    }

    // Scopes
    public function scopeForUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeForCleaner($query, int $cleanerId)
    {
        return $query->where('cleaner_id', $cleanerId);
    }

    public function scopeByStatus($query, string $status)
    {
        return $query->where('status', $status);
    }
}
