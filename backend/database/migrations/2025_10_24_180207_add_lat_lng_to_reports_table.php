<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('reports', function (Blueprint $table) {
            if (!Schema::hasColumn('reports', 'lat')) {
                $table->decimal('lat', 10, 6)->nullable();
                $table->index('lat', 'reports_lat_index');
            }

            if (!Schema::hasColumn('reports', 'lng')) {
                $table->decimal('lng', 10, 6)->nullable();
                $table->index('lng', 'reports_lng_index');
            }
        });
    }

    public function down(): void
    {
        Schema::table('reports', function (Blueprint $table) {
            if (Schema::hasColumn('reports', 'lat')) {
                try { $table->dropIndex('reports_lat_index'); } catch (\Throwable $e) {}
            }
            if (Schema::hasColumn('reports', 'lng')) {
                try { $table->dropIndex('reports_lng_index'); } catch (\Throwable $e) {}
            }

            if (Schema::hasColumn('reports', 'lat')) {
                $table->dropColumn('lat');
            }
            if (Schema::hasColumn('reports', 'lng')) {
                $table->dropColumn('lng');
            }
        });
    }
};
