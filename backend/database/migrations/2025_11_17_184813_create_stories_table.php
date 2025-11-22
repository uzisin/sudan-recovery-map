<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
{
    Schema::create('stories', function (Blueprint $table) {
        $table->id();
        $table->unsignedBigInteger('user_id');  
        $table->string('city');
        $table->text('story');
        $table->string('image')->nullable();   
        $table->integer('votes')->default(0);
        $table->timestamps();

        $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
    });
}

};
