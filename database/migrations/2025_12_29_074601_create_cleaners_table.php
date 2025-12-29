<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cleaners', function (Blueprint $table) {
            $table->bigInteger('id')->primary();
            $table->unsignedBigInteger('user_id')->unique();
            $table->string('phone', 20)->nullable();
            $table->string('status', 20)->default('active');
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cleaners');
    }
};
