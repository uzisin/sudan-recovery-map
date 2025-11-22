<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Story;
use App\Models\StoryVote;
use Illuminate\Support\Facades\Storage; 

class StoryController extends Controller
{
    // Public: all users can view stories
    public function index()
    {
        return Story::with('user:id,name')
            ->orderBy('id', 'desc')
            ->get();
    }

    // Protected: only logged-in users can add a story
    public function store(Request $request)
    {
        $request->validate([
            'city'  => 'required|string',
            'story' => 'required|string',
            'image' => 'nullable|image',
        ]);

        $path = null;

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('stories', 'public');
        }

        return Story::create([
            'user_id' => auth()->id(),
            'city'    => $request->city,
            'story'   => $request->story,
            'image'   => $path,
        ]);
    }

    // ✅ voting logic: new, remove, switch
    public function vote(Request $request, Story $story)
    {
        $request->validate([
            'type' => 'required|in:up,down',
        ]);

        $userId = auth()->id();

        $vote = StoryVote::where('story_id', $story->id)
                         ->where('user_id', $userId)
                         ->first();

        $newType = $request->type;

        if (!$vote) {
            if ($newType === 'up') {
                $story->votes += 1;
            } else {
                $story->votes -= 1;
            }

            StoryVote::create([
                'story_id' => $story->id,
                'user_id'  => $userId,
                'type'     => $newType,
            ]);

            $userVote = $newType;
        }

        elseif ($vote->type === $newType) {
            if ($newType === 'up') {
                $story->votes -= 1;
            } else {
                $story->votes += 1;
            }

            $vote->delete();
            $userVote = null;
        }

        else {
            if ($newType === 'up') {
                $story->votes += 2;
            } else {
                $story->votes -= 2;
            }

            $vote->update(['type' => $newType]);
            $userVote = $newType;
        }

        $story->save();

        return response()->json([
            'votes'     => $story->votes,
            'user_vote' => $userVote,   // 'up' / 'down' / null
        ]);
    }

    // return user stories 
    public function myStories()
    {
        return Story::where('user_id', auth()->id())
            ->orderBy('id', 'desc')
            ->get();
    }

    // edit story
    public function update(Request $request, Story $story)
    {
        if ($story->user_id !== auth()->id()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $request->validate([
            'city'  => 'required|string',
            'story' => 'required|string',
            'image' => 'nullable|image',
        ]);

        $story->city  = $request->city;
        $story->story = $request->story;

        if ($request->hasFile('image')) {

            // if ($story->image) {
            //     Storage::disk('public')->delete($story->image);
            // }

            $path = $request->file('image')->store('stories', 'public');
            $story->image = $path;
        }

        $story->save();

        return response()->json($story);
    }

    // delete story
    public function destroy(Story $story)
    {
        if ($story->user_id !== auth()->id()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        // if ($story->image) {
        //     Storage::disk('public')->delete($story->image);
        // }

        $story->delete();

        return response()->json(['message' => 'deleted']);
    }
}
