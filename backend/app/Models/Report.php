<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Report extends Model
{
    use HasFactory;

    // أسهل حاجة – اسمح بكل الأعمدة
    protected $guarded = [];
    

    /*
    protected $fillable = [
        'user_id',
        'state',
        'area',
        'description',
        'services',
        'lat',
        'lng',
    ];
    */

    protected $casts = [
        'services' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
