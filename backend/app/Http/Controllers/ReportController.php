<?php

namespace App\Http\Controllers;

use App\Models\Report;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ReportController extends Controller
{
    private function canonical(string $s): string
    {
        return (string) Str::of($s)
            ->lower()
            ->ascii()
            ->replace([' ', '-'], '')
            ->value();
    }

    // ======= Store report (no changes) =======
   public function store(Request $request)
{
    $user = auth('sanctum')->user(); 
    if (!$user) {
        return response()->json(['message' => 'Unauthorized'], 401);
    }

    $data = $request->validate([
        'stateName'   => 'required|string|max:100',
        'area'        => 'required|string|max:150',
        'description' => 'nullable|string|max:2000',
        'services'    => 'required|array',
        'lat'         => 'nullable|numeric',
        'lng'         => 'nullable|numeric',
    ]);

    $allowed = ['electricity', 'water', 'health', 'calls_internet', 'security'];
    $services = [];

    foreach ($allowed as $k) {
        $v = $data['services'][$k] ?? null;
        if (is_array($v)) {
            $services[$k] = [
                'level'   => $v['level']   ?? 'unknown',
                'percent' => (int)($v['percent'] ?? 0),
                'note'    => $v['note']    ?? '',
            ];
        }
    }

    $report = Report::create([
        'user_id'     => $user->id, 
        'state'       => $data['stateName'],
        'area'        => $data['area'],
        'description' => $data['description'] ?? null,
        'services'    => $services,
        'lat'         => $data['lat'] ?? null,
        'lng'         => $data['lng'] ?? null,
    ]);

    return response()->json([
        'message' => 'Report saved successfully',
        'id'      => $report->id,
    ], 201);
}


    // ======= Get averages per state + area =======
    public function index()
    {
        $allowed = ['electricity','water','health','calls_internet','security'];

        $all = Report::select('state', 'area', 'services')->get();

        $grouped = [];
        foreach ($all as $r) {
            $stateKey = $this->canonical($r->state);
            $areaKey  = $this->canonical($r->area);

            if (!isset($grouped[$stateKey])) {
                $grouped[$stateKey] = [
                    'display' => $r->state,
                    'count'   => 0,
                    'sum'     => array_fill_keys($allowed, 0),
                    'seen'    => array_fill_keys($allowed, 0),
                    'areas'   => [],
                ];
            }

            // group areas inside state
            if (!isset($grouped[$stateKey]['areas'][$areaKey])) {
                $grouped[$stateKey]['areas'][$areaKey] = [
                    'display' => $r->area,
                    'count'   => 0,
                    'sum'     => array_fill_keys($allowed, 0),
                    'seen'    => array_fill_keys($allowed, 0),
                ];
            }

            $grouped[$stateKey]['count']++;
            $grouped[$stateKey]['areas'][$areaKey]['count']++;

            $srv = is_array($r->services) ? $r->services : [];

            foreach ($allowed as $k) {
                if (isset($srv[$k])) {
                    $percent = (int)($srv[$k]['percent'] ?? 0);
                    $level = $srv[$k]['level'] ?? 'unknown';
                    if ($level === 'ok' && !isset($srv[$k]['percent'])) $percent = 100;
                    if ($level === 'outage' && !isset($srv[$k]['percent'])) $percent = 0;

                    $grouped[$stateKey]['sum'][$k]  += max(0, min(100, $percent));
                    $grouped[$stateKey]['seen'][$k] += 1;

                    // area-level sums
                    $grouped[$stateKey]['areas'][$areaKey]['sum'][$k]  += max(0, min(100, $percent));
                    $grouped[$stateKey]['areas'][$areaKey]['seen'][$k] += 1;
                }
            }
        }

        $out = [];
        foreach ($grouped as $stateKey => $g) {
            // avg per state
            $avg = [];
            foreach ($allowed as $k) {
                $avg[$k] = $g['seen'][$k] > 0
                    ? (int) round($g['sum'][$k] / $g['seen'][$k])
                    : null;
            }

            // build areas list
            $areasList = [];
            foreach ($g['areas'] as $a) {
                $avgA = [];
                foreach ($allowed as $k) {
                    $avgA[$k] = $a['seen'][$k] > 0
                        ? (int) round($a['sum'][$k] / $a['seen'][$k])
                        : null;
                }
                $areasList[] = [
                    'area' => $a['display'],
                    'avg_services' => $avgA,
                    'reports_count' => $a['count'],
                ];
            }

            $out[] = [
                'state'         => $g['display'],
                'state_key'     => $stateKey,
                'avg_services'  => $avg,
                'reports_count' => $g['count'],
                'areas'         => $areasList, // << NEW
            ];
        }


        return response()->json($out);
    }

  // Currunt user reports
public function myReports(Request $request)
{
    $user = $request->user();

    $reports = Report::where('user_id', $user->id)
        ->orderByDesc('created_at')
        ->get();

    return response()->json($reports);
}

// Show one report then check onership
public function show(Request $request, $id)
{
    $user = $request->user();
    $report = Report::findOrFail($id);

    if ($report->user_id !== $user->id) {
        return response()->json(['message' => 'Forbidden'], 403);
    }

    return response()->json($report);
}

// Edit report
public function update(Request $request, $id)
{
    $user = $request->user();
    $report = Report::findOrFail($id);

    if ($report->user_id !== $user->id) {
        return response()->json(['message' => 'Forbidden'], 403);
    }

    $data = $request->validate([
        'stateName'   => 'required|string|max:100',
        'area'        => 'required|string|max:150',
        'description' => 'nullable|string|max:2000',
        'services'    => 'required|array',
        'lat'         => 'nullable|numeric',
        'lng'         => 'nullable|numeric',
    ]);

    $allowed  = ['electricity', 'water', 'health', 'calls_internet', 'security'];
    $services = [];

    foreach ($allowed as $k) {
        $v = $data['services'][$k] ?? null;
        if (is_array($v)) {
            $services[$k] = [
                'level'   => $v['level']   ?? 'unknown',
                'percent' => (int)($v['percent'] ?? 0),
                'note'    => $v['note']    ?? '',
            ];
        }
    }

    $report->update([
        'state'       => $data['stateName'],
        'area'        => $data['area'],
        'description' => $data['description'] ?? null,
        'services'    => $services,
        'lat'         => $data['lat'] ?? null,
        'lng'         => $data['lng'] ?? null,
    ]);

    return response()->json([
        'message' => 'Report updated successfully',
        'report'  => $report,
    ]);
}

// Delete report
public function destroy(Request $request, $id)
{
    $user = $request->user();
    $report = Report::findOrFail($id);

    if ($report->user_id !== $user->id) {
        return response()->json(['message' => 'Forbidden'], 403);
    }

    $report->delete();

    return response()->json(['message' => 'Report deleted successfully']);
}


    

}
