"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getResponses,
  getAllQuizzes,
  getTargetPresets,
  getWeightPresets,
  updateQuiz,
  deleteQuiz,
  addQuiz,
  importQuizzes,
  addTargetPreset,
  updateTargetPreset,
  deleteTargetPreset,
  addWeightPreset,
  updateWeightPreset,
  deleteWeightPreset,
} from "@/lib/firestore";
import { calcSyncScore, getSyncLabel, getSyncColor, dimLabels } from "@/lib/scoring";
import type { Quiz, QuizResponse, TargetPreset, WeightPreset, Choice, Vector5 } from "@/types";

type Tab = "users" | "quiz" | "settings";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>("users");
  const [responses, setResponses] = useState<QuizResponse[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [targetPresets, setTargetPresets] = useState<TargetPreset[]>([]);
  const [weightPresets, setWeightPresets] = useState<WeightPreset[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [res, qz, tp, wp] = await Promise.all([
      getResponses(),
      getAllQuizzes(),
      getTargetPresets(),
      getWeightPresets(),
    ]);
    setResponses(res);
    setQuizzes(qz);
    setTargetPresets(tp);
    setWeightPresets(wp);
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    {
      key: "users", label: "回答者一覧",
      icon: <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>,
    },
    {
      key: "quiz", label: "クイズ管理",
      icon: <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>,
    },
    {
      key: "settings", label: "基本設定",
      icon: <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    },
  ];

  const tabTitles: Record<Tab, string> = { users: "回答者一覧", quiz: "クイズ管理", settings: "基本設定" };

  return (
    <div className="min-h-screen">
      {/* サイドバー */}
      <aside className="fixed top-0 left-0 w-56 h-screen bg-white border-r border-base-200 flex flex-col z-40">
        <div className="px-5 h-14 flex items-center border-b border-base-200">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-accent rounded flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m-7.071-2.929l.707-.707m12.728 0l.707.707M3 12h1m16 0h1m-2.929-7.071l-.707.707M6.636 6.636l-.707-.707" /></svg>
            </div>
            <span className="font-semibold text-base-800 tracking-tight text-sm">CorePoint</span>
          </div>
        </div>
        <nav className="py-4 px-2">
          <p className="text-[11px] font-medium text-base-400 uppercase tracking-wider px-3 mb-2">Menu</p>
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-l text-sm font-medium transition-all duration-150 ${
                activeTab === t.key
                  ? "bg-accent/10 text-accent border-r-2 border-accent"
                  : "text-base-600 hover:bg-accent/[0.06]"
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </nav>
        <div className="mt-auto px-4 py-4 border-t border-base-200">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center text-accent text-xs font-semibold">AD</div>
            <div>
              <p className="text-sm font-medium text-base-800">Admin</p>
              <p className="text-xs text-base-400">管理者</p>
            </div>
          </div>
        </div>
      </aside>

      {/* メインコンテンツ */}
      <main className="ml-56 min-h-screen">
        <header className="h-14 border-b border-base-200 bg-white/80 backdrop-blur-sm flex items-center px-6 sticky top-0 z-30">
          <h1 className="text-sm font-semibold text-base-800">{tabTitles[activeTab]}</h1>
        </header>

        {loading ? (
          <div className="p-6 text-base-400">読み込み中...</div>
        ) : (
          <>
            {activeTab === "users" && (
              <UsersTab responses={responses} targetPresets={targetPresets} weightPresets={weightPresets} />
            )}
            {activeTab === "quiz" && (
              <QuizTab quizzes={quizzes} onReload={loadData} />
            )}
            {activeTab === "settings" && (
              <SettingsTab
                targetPresets={targetPresets}
                weightPresets={weightPresets}
                onReload={loadData}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}

// ===== 回答者一覧タブ =====
function UsersTab({
  responses,
  targetPresets,
  weightPresets,
}: {
  responses: QuizResponse[];
  targetPresets: TargetPreset[];
  weightPresets: WeightPreset[];
}) {
  const [selectedTargetId, setSelectedTargetId] = useState("");
  const [selectedWeightId, setSelectedWeightId] = useState("");
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<"date" | "sync">("date");
  const [sortDir, setSortDir] = useState(-1);
  const [detailIdx, setDetailIdx] = useState(-1);

  useEffect(() => {
    if (targetPresets.length > 0 && !selectedTargetId) setSelectedTargetId(targetPresets[0].id);
    if (weightPresets.length > 0 && !selectedWeightId) setSelectedWeightId(weightPresets[0].id);
  }, [targetPresets, weightPresets, selectedTargetId, selectedWeightId]);

  const target = targetPresets.find((p) => p.id === selectedTargetId);
  const weight = weightPresets.find((p) => p.id === selectedWeightId);

  const scored = responses
    .filter((r) => {
      if (!search) return true;
      const s = search.toLowerCase();
      return r.respondentName.toLowerCase().includes(s) || r.respondentEmail.toLowerCase().includes(s);
    })
    .map((r) => ({
      ...r,
      sync: target && weight ? calcSyncScore(r.finalVector.slice(0, 5), target.values, weight.values) : 0,
    }));

  if (sortField === "sync") scored.sort((a, b) => sortDir * (a.sync - b.sync));
  else scored.sort((a, b) => sortDir * (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()));

  const handleSort = (field: "date" | "sync") => {
    if (sortField === field) setSortDir((d) => d * -1);
    else { setSortField(field); setSortDir(-1); }
  };

  const detailUser = detailIdx >= 0 ? scored[detailIdx] : null;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="relative">
          <svg className="w-4 h-4 text-base-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input
            type="text"
            placeholder="名前・メールで検索..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-white border border-base-200 rounded-lg pl-9 pr-4 py-2 text-sm w-64 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30"
          />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-base-400 font-medium">基準:</span>
          <select value={selectedTargetId} onChange={(e) => setSelectedTargetId(e.target.value)} className="bg-white border border-base-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent cursor-pointer">
            {targetPresets.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <select value={selectedWeightId} onChange={(e) => setSelectedWeightId(e.target.value)} className="bg-white border border-base-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent cursor-pointer">
            {weightPresets.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
      </div>

      {(targetPresets.length === 0 || weightPresets.length === 0) && (
        <div className="bg-warm-soft border border-warm/30 rounded-lg p-4 mb-5 text-sm text-warm">
          基本設定タブでターゲットプリセットと重みプリセットを登録してください。
        </div>
      )}

      <div className="bg-white rounded-xl border border-base-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-base-200 bg-base-50/50">
              <th className="text-left text-xs font-medium text-base-400 uppercase tracking-wider px-5 py-3">名前</th>
              <th className="text-left text-xs font-medium text-base-400 uppercase tracking-wider px-5 py-3">メール</th>
              <th className="text-left text-xs font-medium text-base-400 uppercase tracking-wider px-5 py-3 cursor-pointer select-none hover:text-accent" onClick={() => handleSort("date")}>
                回答日 <SortIcon />
              </th>
              <th className="text-left text-xs font-medium text-base-400 uppercase tracking-wider px-5 py-3 cursor-pointer select-none hover:text-accent" onClick={() => handleSort("sync")}>
                Sync Rate <SortIcon />
              </th>
              <th className="text-left text-xs font-medium text-base-400 uppercase tracking-wider px-5 py-3">判定</th>
              <th className="text-left text-xs font-medium text-base-400 uppercase tracking-wider px-5 py-3">ベクトル</th>
            </tr>
          </thead>
          <tbody>
            {scored.map((u, i) => {
              const sl = getSyncLabel(u.sync);
              const color = getSyncColor(u.sync);
              const vecStr = `[${u.finalVector.map((v) => v.toFixed(1)).join(", ")}]`;
              return (
                <tr key={u.id} className="border-b border-base-100 last:border-0 hover:bg-accent/[0.04] cursor-pointer transition-colors" onClick={() => setDetailIdx(i)}>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white" style={{ background: color }}>{u.respondentName[0]}</div>
                      <span className="text-sm font-medium text-base-800">{u.respondentName}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-base-500">{u.respondentEmail}</td>
                  <td className="px-5 py-3.5 text-sm text-base-500">{new Date(u.createdAt).toLocaleDateString("ja-JP")}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-base-100 rounded-full overflow-hidden"><div className="h-full rounded-full" style={{ width: `${u.sync}%`, background: color }} /></div>
                      <span className="text-sm font-semibold" style={{ color }}>{u.sync}%</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5"><span className={`text-xs font-medium px-2 py-1 rounded-full ${sl.cls}`}>{sl.label}</span></td>
                  <td className="px-5 py-3.5">
                    <CopyVectorButton vecStr={vecStr} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex items-start justify-between">
        <span className="text-sm text-base-400">{scored.length} 名の回答者</span>
        <div className="flex gap-4 text-[11px] text-base-400">
          <span><span className="inline-block w-2 h-2 rounded-full bg-emerald-500 mr-1" />90-100% Synchronized（阿吽の呼吸）</span>
          <span><span className="inline-block w-2 h-2 rounded-full bg-accent mr-1" />70-89% Resonant（共鳴）</span>
          <span><span className="inline-block w-2 h-2 rounded-full bg-amber-500 mr-1" />50-69% Strained（要歩み寄り）</span>
          <span><span className="inline-block w-2 h-2 rounded-full bg-orange-500 mr-1" />30-49% Disconnected（断絶）</span>
          <span><span className="inline-block w-2 h-2 rounded-full bg-red-500 mr-1" />0-29% Void（虚無）</span>
        </div>
      </div>

      {/* 詳細パネル */}
      {detailUser && target && weight && (
        <DetailPanel
          user={detailUser}
          targetPresets={targetPresets}
          weightPresets={weightPresets}
          initialTargetId={selectedTargetId}
          initialWeightId={selectedWeightId}
          onClose={() => setDetailIdx(-1)}
        />
      )}
    </div>
  );
}

function SortIcon() {
  return <svg className="w-3 h-3 inline ml-1 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 9l4-4 4 4m0 6l-4 4-4-4" /></svg>;
}

function CopyVectorButton({ vecStr }: { vecStr: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(vecStr);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 text-xs font-mono text-base-500 hover:text-accent bg-base-50 hover:bg-accent/5 px-2 py-1 rounded transition-colors cursor-pointer"
      title="クリックでコピー"
    >
      {copied ? (
        <>
          <svg className="w-3.5 h-3.5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
          <span className="text-accent">Copied</span>
        </>
      ) : (
        <>
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" /></svg>
          <span>{vecStr}</span>
        </>
      )}
    </button>
  );
}

// ===== 詳細パネル =====
function DetailPanel({
  user,
  targetPresets,
  weightPresets,
  initialTargetId,
  initialWeightId,
  onClose,
}: {
  user: QuizResponse & { sync: number };
  targetPresets: TargetPreset[];
  weightPresets: WeightPreset[];
  initialTargetId: string;
  initialWeightId: string;
  onClose: () => void;
}) {
  const [tId, setTId] = useState(initialTargetId);
  const [wId, setWId] = useState(initialWeightId);

  const target = targetPresets.find((p) => p.id === tId);
  const weight = weightPresets.find((p) => p.id === wId);
  const score = target && weight ? calcSyncScore(user.finalVector.slice(0, 5), target.values, weight.values) : 0;
  const sl = getSyncLabel(score);
  const color = getSyncColor(score);
  const circumference = 326.73;
  const offset = circumference - (circumference * score) / 100;

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />
      <div className="fixed top-0 right-0 w-[520px] h-full bg-white border-l border-base-200 z-50 overflow-y-auto animate-slide-in">
        <div className="sticky top-0 bg-white border-b border-base-200 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h3 className="font-semibold text-base-900">{user.respondentName}</h3>
            <p className="text-sm text-base-400">{user.respondentEmail}</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-base-100 rounded-lg transition-colors cursor-pointer">
            <svg className="w-5 h-5 text-base-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="p-6">
          {/* シンクロ率 */}
          <div className="text-center mb-8">
            <p className="text-xs text-base-400 uppercase tracking-wider font-medium mb-3">Sync Rate</p>
            <div className="relative inline-flex items-center justify-center">
              <svg className="w-40 h-40 -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="52" fill="none" stroke="#edeef1" strokeWidth="6" />
                <circle cx="60" cy="60" r="52" fill="none" stroke={color} strokeWidth="6" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} className="transition-all duration-800" />
              </svg>
              <div className="absolute">
                <span className="text-4xl font-bold text-base-900">{score}</span>
                <span className="text-lg text-base-400">%</span>
              </div>
            </div>
            <div className="mt-3">
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${sl.cls}`}>{sl.label}</span>
            </div>
            <p className="text-xs text-base-400 mt-2">{sl.desc}</p>
          </div>

          {/* プリセット切り替え */}
          <div className="bg-base-50 rounded-xl p-4 mb-6">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-base-400 font-medium uppercase tracking-wider block mb-1.5">Target</label>
                <select value={tId} onChange={(e) => setTId(e.target.value)} className="w-full bg-white border border-base-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent cursor-pointer">
                  {targetPresets.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[11px] text-base-400 font-medium uppercase tracking-wider block mb-1.5">Weight</label>
                <select value={wId} onChange={(e) => setWId(e.target.value)} className="w-full bg-white border border-base-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent cursor-pointer">
                  {weightPresets.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* ベクトル */}
          <div className="mb-6">
            <h4 className="text-xs text-base-400 font-medium uppercase tracking-wider mb-4">Vector Breakdown</h4>
            <div className="space-y-4">
              {dimLabels.map((d, i) => (
                <div key={d.key}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-base-600">{d.key}: {d.name}</span>
                    <span className="font-medium" style={{ color: d.color }}>{user.finalVector[i].toFixed(1)}</span>
                  </div>
                  <div className="relative w-full h-2 bg-base-100 rounded-full overflow-hidden">
                    <div className="absolute h-full rounded-full transition-all duration-500" style={{ width: `${user.finalVector[i] * 10}%`, background: d.color }} />
                    {target && <div className="absolute top-0 h-full w-0.5 bg-base-900/30" style={{ left: `${target.values[i] * 10}%` }} title={`Target: ${target.values[i]}`} />}
                  </div>
                  <div className="flex justify-between text-[11px] text-base-400 mt-0.5"><span>{d.lo}</span><span>{d.hi}</span></div>
                </div>
              ))}
            </div>
          </div>

          {/* ターゲット比較 */}
          {target && (
            <div>
              <h4 className="text-xs text-base-400 font-medium uppercase tracking-wider mb-4">Target Comparison</h4>
              <div className="bg-base-50 rounded-xl p-4">
                <div className="grid grid-cols-[1fr_50px_24px_50px] gap-1 items-center text-xs text-base-400 mb-3 font-medium">
                  <span></span><span className="text-center">User</span><span></span><span className="text-center">Target</span>
                </div>
                <div className="space-y-2.5">
                  {dimLabels.slice(0, 5).map((d, i) => {
                    const diff = user.finalVector[i] - target.values[i];
                    return (
                      <div key={d.key} className="grid grid-cols-[1fr_50px_24px_50px] gap-1 items-center">
                        <span className="text-xs text-base-600">{d.name}</span>
                        <span className="text-xs font-medium text-center text-base-800">{user.finalVector[i].toFixed(1)}</span>
                        <span className={`text-[11px] font-medium text-center ${diff > 0 ? "text-accent" : diff < 0 ? "text-warm" : "text-base-400"}`}>
                          {diff > 0 ? "+" : ""}{diff.toFixed(1)}
                        </span>
                        <span className="text-xs text-center text-base-400">{target.values[i].toFixed(1)}</span>
                      </div>
                    );
                  })}
                  {user.finalVector[5] != null && (
                    <div className="grid grid-cols-[1fr_50px_24px_50px] gap-1 items-center border-t border-base-200 pt-2 mt-1">
                      <span className="text-xs text-base-600">{dimLabels[5].name}</span>
                      <span className="text-xs font-medium text-center" style={{ color: dimLabels[5].color }}>{user.finalVector[5].toFixed(1)}</span>
                      <span className="text-[11px] text-center text-base-300">-</span>
                      <span className="text-xs text-center text-base-300">-</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ===== クイズカード（選択肢展開表示） =====
const choiceLabels = ["A", "B", "C", "D", "E"];
const vecShortLabels = ["c1", "c2", "c3", "c4", "c5"];

function QuizCard({
  quiz,
  label,
  variant,
  actions,
}: {
  quiz: Quiz;
  label?: string;
  variant: "active" | "stock";
  actions: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const borderClass = variant === "active" ? "border-accent/30" : "border-base-200 hover:border-base-300";

  return (
    <div className={`bg-white rounded-lg border ${borderClass} transition-all group`}>
      {/* ヘッダー行 */}
      <div className="p-4 flex items-center gap-4">
        {label && (
          <span className="text-xs font-semibold text-accent bg-accent/10 px-2 py-1 rounded shrink-0">{label}</span>
        )}
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 flex-1 text-left cursor-pointer"
        >
          <svg
            className={`w-4 h-4 text-base-400 shrink-0 transition-transform duration-200 ${open ? "rotate-90" : ""}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
          <span className="text-sm font-medium text-base-800">{quiz.question}</span>
        </button>
        <span className="text-xs text-base-400 shrink-0">{quiz.choices.length} 選択肢</span>
        {actions}
      </div>

      {/* 選択肢の展開部分 */}
      {open && (
        <div className="px-4 pb-4 pt-0">
          <div className="border-t border-base-100 pt-3 space-y-1.5">
            {quiz.choices.map((c, i) => (
              <div key={i} className="flex items-start gap-3 py-1.5">
                <span className="text-[11px] font-semibold text-base-400 bg-base-100 w-6 h-6 rounded flex items-center justify-center shrink-0">
                  {choiceLabels[i] ?? i + 1}
                </span>
                <span className="text-sm text-base-700 flex-1">{c.text}</span>
                <span className="text-[11px] text-base-400 font-mono shrink-0">
                  [{c.vector.map((v, j) => `${vecShortLabels[j]}:${v > 0 ? "+" : ""}${v}`).join(", ")}]
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ===== クイズ管理タブ =====
function QuizTab({ quizzes, onReload }: { quizzes: Quiz[]; onReload: () => void }) {
  const [jsonInput, setJsonInput] = useState("");
  const [showImport, setShowImport] = useState(false);
  const [showNewForm, setShowNewForm] = useState(false);

  const activeQuizzes = quizzes.filter((q) => q.isActive).sort((a, b) => a.order - b.order);
  const stockQuizzes = quizzes.filter((q) => !q.isActive);

  const handleToggleActive = async (id: string, activate: boolean) => {
    await updateQuiz(id, { isActive: activate });
    onReload();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("この設問を削除しますか？")) return;
    await deleteQuiz(id);
    onReload();
  };

  const handleImport = async () => {
    try {
      const parsed = JSON.parse(jsonInput);
      if (!Array.isArray(parsed)) throw new Error("配列形式で入力してください");
      await importQuizzes(parsed);
      setJsonInput("");
      setShowImport(false);
      onReload();
    } catch (e) {
      alert(`インポートエラー: ${e instanceof Error ? e.message : e}`);
    }
  };

  const jsonTemplate = `[
  {
    "question": "設問テキストをここに入力",
    "choices": [
      { "text": "選択肢A", "vector": [0.0, 0.0, 0.0, 0.0, 0.0] },
      { "text": "選択肢B", "vector": [0.0, 0.0, 0.0, 0.0, 0.0] },
      { "text": "選択肢C", "vector": [0.0, 0.0, 0.0, 0.0, 0.0] },
      { "text": "選択肢D", "vector": [0.0, 0.0, 0.0, 0.0, 0.0] },
      { "text": "選択肢E", "vector": [0.0, 0.0, 0.0, 0.0, 0.0] }
    ]
  }
]`;

  return (
    <div className="p-6 max-w-4xl">
      {/* 使用中クイズ */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h3 className="font-semibold text-base-800">使用中のクイズ</h3>
            <span className="text-xs font-medium text-white bg-accent px-2 py-0.5 rounded-full">{activeQuizzes.length} 問</span>
          </div>
        </div>
        <div className="space-y-2">
          {activeQuizzes.map((q, i) => (
            <QuizCard key={q.id} quiz={q} label={`Q${i + 1}`} variant="active"
              actions={
                <button onClick={() => handleToggleActive(q.id, false)} className="p-1.5 text-base-400 hover:text-warm hover:bg-warm/5 rounded-lg transition-colors opacity-0 group-hover:opacity-100 cursor-pointer" title="ストックへ戻す">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m6 4.125l2.25 2.25m0 0l2.25 2.25M12 13.875l2.25-2.25M12 13.875l-2.25 2.25M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg>
                </button>
              }
            />
          ))}
          {activeQuizzes.length === 0 && <p className="text-sm text-base-400 py-4">使用中の設問はありません。ストックから追加してください。</p>}
        </div>
      </div>

      {/* ストック */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h3 className="font-semibold text-base-800">登録済みストック</h3>
            <span className="text-xs font-medium text-base-500 bg-base-100 px-2 py-0.5 rounded-full">{stockQuizzes.length} 問</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowImport(!showImport)} className="flex items-center gap-1.5 border border-base-200 hover:border-accent text-base-600 hover:text-accent px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg>
              JSON インポート
            </button>
            <button onClick={() => setShowNewForm(true)} className="flex items-center gap-1.5 bg-accent hover:bg-accent-dark text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
              新規作成
            </button>
          </div>
        </div>

        {/* JSON インポート */}
        {showImport && (
          <div className="bg-white rounded-xl border border-base-200 p-5 mb-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-base-800">JSON 一括インポート</h4>
              <button onClick={() => setShowImport(false)} className="p-1 text-base-400 hover:text-base-600 cursor-pointer">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] text-base-400 font-medium uppercase tracking-wider">Template</label>
                <button onClick={() => navigator.clipboard.writeText(jsonTemplate)} className="text-xs text-accent hover:text-accent-dark transition-colors cursor-pointer">コピー</button>
              </div>
              <pre className="bg-base-900 text-green-400 rounded-lg px-4 py-3 text-xs font-mono overflow-x-auto">{jsonTemplate}</pre>
              <p className="text-[11px] text-base-400 mt-1.5">vector: [c1:抽象化, c2:指向性, c3:合理性, c4:社会的距離, c5:言語解像度]</p>
            </div>
            <textarea
              rows={8}
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              className="w-full bg-base-50 border border-base-200 rounded-lg px-4 py-3 text-xs font-mono text-base-700 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 resize-y"
              placeholder="ここに JSON を貼り付けてください..."
            />
            <div className="flex items-center justify-end mt-3">
              <button onClick={handleImport} className="bg-accent hover:bg-accent-dark text-white text-sm px-4 py-1.5 rounded-lg font-medium transition-colors cursor-pointer">インポート</button>
            </div>
          </div>
        )}

        {/* 新規作成フォーム */}
        {showNewForm && <NewQuizForm onClose={() => setShowNewForm(false)} onReload={onReload} />}

        <div className="space-y-2">
          {stockQuizzes.map((q) => (
            <QuizCard key={q.id} quiz={q} variant="stock"
              actions={
                <div className="flex items-center gap-2">
                  <button onClick={() => handleToggleActive(q.id, true)} className="text-[10px] font-medium text-base-400 bg-base-100 hover:bg-accent/10 hover:text-accent px-2 py-0.5 rounded-full transition-colors cursor-pointer">+ 使用する</button>
                  <button onClick={() => handleDelete(q.id)} className="p-1.5 text-base-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100 cursor-pointer" title="削除">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                  </button>
                </div>
              }
            />
          ))}
          {stockQuizzes.length === 0 && <p className="text-sm text-base-400 py-4">ストックに設問はありません。</p>}
        </div>
      </div>
    </div>
  );
}

// ===== 新規設問作成フォーム =====
function NewQuizForm({ onClose, onReload }: { onClose: () => void; onReload: () => void }) {
  const [question, setQuestion] = useState("");
  const [category, setCategory] = useState("");
  const [choices, setChoices] = useState<Choice[]>(
    Array.from({ length: 5 }, () => ({ text: "", vector: [0, 0, 0, 0, 0] }))
  );
  const [saving, setSaving] = useState(false);

  const updateChoiceText = (i: number, text: string) => {
    const next = [...choices];
    next[i] = { ...next[i], text };
    setChoices(next);
  };

  const updateChoiceVector = (i: number, j: number, val: string) => {
    const next = [...choices];
    const vec = [...next[i].vector] as Vector5;
    vec[j] = parseFloat(val) || 0;
    next[i] = { ...next[i], vector: vec };
    setChoices(next);
  };

  const handleSave = async () => {
    if (!question.trim()) return alert("設問テキストを入力してください");
    setSaving(true);
    await addQuiz({ question, category, choices, isActive: false, order: 999 });
    setSaving(false);
    onClose();
    onReload();
  };

  const labels = ["A", "B", "C", "D", "E"];
  const vecLabels = ["c1", "c2", "c3", "c4", "c5"];

  return (
    <div className="bg-white rounded-xl border border-base-200 p-5 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-medium text-base-800">新規設問作成</h4>
        <button onClick={onClose} className="p-1 text-base-400 hover:text-base-600 cursor-pointer">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
      <div className="space-y-4">
        <div>
          <label className="text-[11px] text-base-400 font-medium uppercase tracking-wider block mb-1">設問テキスト</label>
          <input type="text" value={question} onChange={(e) => setQuestion(e.target.value)} className="w-full border border-base-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent" placeholder="質問を入力..." />
        </div>
        <div>
          <label className="text-[11px] text-base-400 font-medium uppercase tracking-wider block mb-1">カテゴリ</label>
          <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} className="w-full border border-base-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent" placeholder="例: ことばの語源" />
        </div>
        <div>
          <label className="text-[11px] text-base-400 font-medium uppercase tracking-wider block mb-2">選択肢</label>
          {choices.map((c, i) => (
            <div key={i} className="mb-3 p-3 border border-base-100 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-semibold text-accent">{labels[i]}</span>
                <input type="text" value={c.text} onChange={(e) => updateChoiceText(i, e.target.value)} className="flex-1 border border-base-200 rounded px-2 py-1 text-sm focus:outline-none focus:border-accent" placeholder={`選択肢${labels[i]}`} />
              </div>
              <div className="flex gap-2">
                {vecLabels.map((vl, j) => (
                  <div key={vl} className="flex-1">
                    <label className="text-[10px] text-base-400 block mb-0.5">{vl}</label>
                    <input type="number" step="0.5" value={c.vector[j]} onChange={(e) => updateChoiceVector(i, j, e.target.value)} className="w-full border border-base-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-accent" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-end">
          <button onClick={handleSave} disabled={saving} className="bg-accent hover:bg-accent-dark text-white text-sm px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer disabled:opacity-50">
            {saving ? "保存中..." : "保存"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ===== 基本設定タブ =====
function SettingsTab({
  targetPresets,
  weightPresets,
  onReload,
}: {
  targetPresets: TargetPreset[];
  weightPresets: WeightPreset[];
  onReload: () => void;
}) {
  return (
    <div className="p-6 max-w-3xl">
      <PresetSection
        title="ターゲット人物像プリセット"
        presets={targetPresets}
        onAdd={async (name, values) => { await addTargetPreset({ name, values }); onReload(); }}
        onUpdate={async (id, name, values) => { await updateTargetPreset(id, { name, values }); onReload(); }}
        onDelete={async (id) => { await deleteTargetPreset(id); onReload(); }}
      />
      <WeightPresetSection
        presets={weightPresets}
        onAdd={async (name, values) => { await addWeightPreset({ name, values }); onReload(); }}
        onUpdate={async (id, name, values) => { await updateWeightPreset(id, { name, values }); onReload(); }}
        onDelete={async (id) => { await deleteWeightPreset(id); onReload(); }}
      />
    </div>
  );
}

function PresetSection({
  title,
  presets,
  onAdd,
  onUpdate,
  onDelete,
}: {
  title: string;
  presets: (TargetPreset | WeightPreset)[];
  onAdd: (name: string, values: Vector5) => Promise<void>;
  onUpdate: (id: string, name: string, values: Vector5) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formName, setFormName] = useState("");
  const [formValues, setFormValues] = useState<Vector5>([5, 5, 5, 5, 5]);

  const vecLabels = ["c1", "c2", "c3", "c4", "c5"];

  const startEdit = (p: TargetPreset | WeightPreset) => {
    setEditId(p.id);
    setFormName(p.name);
    setFormValues([...p.values] as Vector5);
    setShowForm(true);
  };

  const startAdd = () => {
    setEditId(null);
    setFormName("");
    setFormValues([5, 5, 5, 5, 5]);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!formName.trim()) return;
    if (editId) await onUpdate(editId, formName, formValues);
    else await onAdd(formName, formValues);
    setShowForm(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("削除しますか？")) return;
    await onDelete(id);
  };

  return (
    <div className="bg-white rounded-xl border border-base-200 p-6 mb-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-semibold text-base-800">{title}</h3>
        <button onClick={startAdd} className="flex items-center gap-1.5 text-sm font-medium text-accent hover:text-accent-dark transition-colors cursor-pointer">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
          新規追加
        </button>
      </div>

      {showForm && (
        <div className="border border-accent/30 rounded-lg p-4 mb-4">
          <div className="mb-3">
            <input type="text" value={formName} onChange={(e) => setFormName(e.target.value)} className="w-full border border-base-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent" placeholder="プリセット名" />
          </div>
          <div className="flex gap-2 mb-3">
            {vecLabels.map((vl, i) => (
              <div key={vl} className="flex-1">
                <label className="text-[10px] text-base-400 block mb-0.5">{vl}</label>
                <input type="number" step="0.5" min="0" max="10" value={formValues[i]} onChange={(e) => { const v = [...formValues] as Vector5; v[i] = parseFloat(e.target.value) || 0; setFormValues(v); }} className="w-full border border-base-200 rounded px-2 py-1 text-sm focus:outline-none focus:border-accent" />
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowForm(false)} className="text-sm text-base-500 hover:text-base-700 px-3 py-1.5 cursor-pointer">キャンセル</button>
            <button onClick={handleSave} className="bg-accent hover:bg-accent-dark text-white text-sm px-4 py-1.5 rounded-lg font-medium transition-colors cursor-pointer">{editId ? "更新" : "追加"}</button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {presets.map((p) => (
          <div key={p.id} className="flex items-center justify-between p-4 border border-base-200 rounded-lg hover:border-base-300 transition-colors">
            <div>
              <p className="text-sm font-medium text-base-800">{p.name}</p>
              <p className="text-xs text-base-400 mt-0.5">{vecLabels.map((vl, i) => `${vl}:${p.values[i]}`).join(" ")}</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => startEdit(p)} className="text-base-400 hover:text-accent transition-colors cursor-pointer p-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>
              </button>
              <button onClick={() => handleDelete(p.id)} className="text-base-400 hover:text-red-500 transition-colors cursor-pointer p-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
              </button>
            </div>
          </div>
        ))}
        {presets.length === 0 && <p className="text-sm text-base-400 py-2">プリセットが未登録です。</p>}
      </div>
    </div>
  );
}

// ===== パイチャートSVG =====
const pieColors = ["#0d9488", "#d97706", "#2563eb", "#7c3aed", "#059669"];
const pieDimLabels = ["c1:抽象化", "c2:指向性", "c3:合理性", "c4:社会的距離", "c5:言語解像度"];

function WeightPieChart({ values, size = 80 }: { values: number[]; size?: number }) {
  const total = values.reduce((a, b) => a + b, 0);
  if (total === 0) return null;
  const r = size / 2;
  const cx = r;
  const cy = r;
  const sliceR = r - 2;

  let cumAngle = -Math.PI / 2;
  const slices = values.map((v, i) => {
    const angle = (v / total) * 2 * Math.PI;
    const startX = cx + sliceR * Math.cos(cumAngle);
    const startY = cy + sliceR * Math.sin(cumAngle);
    cumAngle += angle;
    const endX = cx + sliceR * Math.cos(cumAngle);
    const endY = cy + sliceR * Math.sin(cumAngle);
    const large = angle > Math.PI ? 1 : 0;
    const pct = Math.round((v / total) * 100);
    // Label position at mid-angle
    const midAngle = cumAngle - angle / 2;
    const labelR = sliceR * 0.65;
    const lx = cx + labelR * Math.cos(midAngle);
    const ly = cy + labelR * Math.sin(midAngle);
    return { startX, startY, endX, endY, large, color: pieColors[i], pct, lx, ly, angle };
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {slices.map((s, i) => (
        <g key={i}>
          {s.angle >= 2 * Math.PI - 0.01 ? (
            <circle cx={cx} cy={cy} r={sliceR} fill={s.color} />
          ) : (
            <path
              d={`M${cx},${cy} L${s.startX},${s.startY} A${sliceR},${sliceR} 0 ${s.large} 1 ${s.endX},${s.endY} Z`}
              fill={s.color}
            />
          )}
          {s.pct >= 10 && (
            <text x={s.lx} y={s.ly} textAnchor="middle" dominantBaseline="central" fill="white" fontSize={size < 60 ? 8 : 10} fontWeight="600">
              {s.pct}%
            </text>
          )}
        </g>
      ))}
    </svg>
  );
}

// ===== 重みプリセットセクション（パイチャート付き） =====
function WeightPresetSection({
  presets,
  onAdd,
  onUpdate,
  onDelete,
}: {
  presets: WeightPreset[];
  onAdd: (name: string, values: Vector5) => Promise<void>;
  onUpdate: (id: string, name: string, values: Vector5) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formName, setFormName] = useState("");
  const [formValues, setFormValues] = useState<Vector5>([3, 3, 3, 3, 3]);

  const startEdit = (p: WeightPreset) => {
    setEditId(p.id);
    setFormName(p.name);
    setFormValues([...p.values] as Vector5);
    setShowForm(true);
  };

  const startAdd = () => {
    setEditId(null);
    setFormName("");
    setFormValues([3, 3, 3, 3, 3]);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!formName.trim()) return;
    if (editId) await onUpdate(editId, formName, formValues);
    else await onAdd(formName, formValues);
    setShowForm(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("削除しますか？")) return;
    await onDelete(id);
  };

  const total = formValues.reduce((a, b) => a + b, 0);

  return (
    <div className="bg-white rounded-xl border border-base-200 p-6 mb-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-semibold text-base-800">重みプリセット</h3>
        <button onClick={startAdd} className="flex items-center gap-1.5 text-sm font-medium text-accent hover:text-accent-dark transition-colors cursor-pointer">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
          新規追加
        </button>
      </div>

      {showForm && (
        <div className="border border-accent/30 rounded-lg p-5 mb-4">
          <div className="mb-4">
            <input type="text" value={formName} onChange={(e) => setFormName(e.target.value)} className="w-full border border-base-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent" placeholder="プリセット名" />
          </div>
          <div className="flex gap-6 items-center mb-4">
            <WeightPieChart values={formValues} size={120} />
            <div className="flex-1 space-y-2.5">
              {pieDimLabels.map((label, i) => {
                const pct = total > 0 ? Math.round((formValues[i] / total) * 100) : 0;
                return (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: pieColors[i] }} />
                    <span className="text-xs text-base-600 w-24">{label}</span>
                    <input
                      type="range"
                      min={0} max={10} step={1}
                      value={formValues[i]}
                      onChange={(e) => { const v = [...formValues] as Vector5; v[i] = parseFloat(e.target.value) || 0; setFormValues(v); }}
                      className="weight-slider flex-1"
                      style={{ "--thumb-color": pieColors[i], "--track-color": pieColors[i], "--pct": `${formValues[i] * 10}%` } as React.CSSProperties}
                    />
                    <span className="text-xs font-semibold w-10 text-right" style={{ color: pieColors[i] }}>{formValues[i]} ({pct}%)</span>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowForm(false)} className="text-sm text-base-500 hover:text-base-700 px-3 py-1.5 cursor-pointer">キャンセル</button>
            <button onClick={handleSave} className="bg-accent hover:bg-accent-dark text-white text-sm px-4 py-1.5 rounded-lg font-medium transition-colors cursor-pointer">{editId ? "更新" : "追加"}</button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {presets.map((p) => {
          const t = p.values.reduce((a, b) => a + b, 0);
          return (
            <div key={p.id} className="flex items-center gap-4 p-4 border border-base-200 rounded-lg hover:border-base-300 transition-colors">
              <WeightPieChart values={p.values} size={48} />
              <div className="flex-1">
                <p className="text-sm font-medium text-base-800">{p.name}</p>
                <div className="flex gap-2 mt-1">
                  {pieDimLabels.map((label, i) => {
                    const pct = t > 0 ? Math.round((p.values[i] / t) * 100) : 0;
                    return (
                      <span key={i} className="text-[11px] font-medium px-1.5 py-0.5 rounded" style={{ background: pieColors[i] + "18", color: pieColors[i] }}>
                        {label.split(":")[0]}:{pct}%
                      </span>
                    );
                  })}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => startEdit(p)} className="text-base-400 hover:text-accent transition-colors cursor-pointer p-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>
                </button>
                <button onClick={() => handleDelete(p.id)} className="text-base-400 hover:text-red-500 transition-colors cursor-pointer p-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                </button>
              </div>
            </div>
          );
        })}
        {presets.length === 0 && <p className="text-sm text-base-400 py-2">プリセットが未登録です。</p>}
      </div>
    </div>
  );
}
