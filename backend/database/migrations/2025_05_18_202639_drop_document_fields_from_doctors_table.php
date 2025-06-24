<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('doctors', function (Blueprint $table) {
            $table->dropColumn('medical_license_path');
            $table->dropColumn('degree_certificate_path');
            $table->dropColumn('id_proof_path');
        });
    }

    public function down(): void
    {
        Schema::table('doctors', function (Blueprint $table) {
            $table->string('medical_license_path')->nullable()->after('profile_photo');
            $table->string('degree_certificate_path')->nullable()->after('medical_license_path');
            $table->string('id_proof_path')->nullable()->after('degree_certificate_path');
        });
    }
};