<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateStoryVotesTable extends Migration
{
    public function up()
    {
        Schema::create('story_votes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('story_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->enum('type', ['up', 'down']);
            $table->timestamps();

            $table->unique(['story_id', 'user_id']); // كل يوزر يصوت مرة واحدة على القصة دي
        });
    }

    public function down()
    {
        Schema::dropIfExists('story_votes');
    }
}
