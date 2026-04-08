import type { SyncLabel, Vector5 } from "@/types";

/** 重み付きユークリッド距離 */
export function calcDistance(
  userVec: number[],
  targetVec: number[],
  weights: number[]
): number {
  let sum = 0;
  for (let i = 0; i < userVec.length; i++) {
    sum += weights[i] * Math.pow(userVec[i] - targetVec[i], 2);
  }
  return Math.sqrt(sum);
}

/** 重みを正規化（合計が次元数と同じになるよう調整） */
function normalizeWeights(weights: number[]): number[] {
  const sum = weights.reduce((a, b) => a + b, 0);
  if (sum === 0) return weights.map(() => 1);
  const scale = weights.length / sum;
  return weights.map((w) => w * scale);
}

/** シンクロ率を算出 (0〜100) */
export function calcSyncScore(
  userVec: number[],
  targetVec: number[],
  weights: number[]
): number {
  const D = calcDistance(userVec, targetVec, normalizeWeights(weights));
  return Math.round(100 / (1 + 0.016 * D * D));
}

/** 減衰アルゴリズム: 端に近づくほど変化量を抑制 */
export function applyDamping(currentValue: number, delta: number): number {
  const damped = delta * (1 - Math.abs(currentValue - 5) / 5);
  return clamp(currentValue + damped, 0, 10);
}

/** 値を範囲内にクランプ */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** 回答のベクトル加算から最終ベクトルを算出 */
export function calculateFinalVector(
  choiceVectors: Vector5[]
): Vector5 {
  const result: Vector5 = [5.0, 5.0, 5.0, 5.0, 5.0];
  for (const vec of choiceVectors) {
    for (let i = 0; i < 5; i++) {
      result[i] = applyDamping(result[i], vec[i]);
    }
  }
  return result;
}

/** シンクロ率の判定ラベル */
const syncLabels: SyncLabel[] = [
  { min: 90, label: "Synchronized", desc: "阿吽の呼吸。説明不要で本質が伝わる。", cls: "bg-emerald-100 text-emerald-700" },
  { min: 70, label: "Resonant", desc: "共鳴。視点は違うが前提が同じ。議論が建設的に進む。", cls: "bg-accent/10 text-accent" },
  { min: 50, label: "Strained", desc: "要歩み寄り。丁寧な補足がないと意図がズレやすい。", cls: "bg-amber-100 text-amber-700" },
  { min: 30, label: "Disconnected", desc: "断絶。見ているレイヤーが根本的に異なる。", cls: "bg-orange-100 text-orange-700" },
  { min: 0, label: "Void", desc: "虚無。共通言語が皆無。", cls: "bg-red-100 text-red-700" },
];

export function getSyncLabel(score: number): SyncLabel {
  return syncLabels.find((l) => score >= l.min) ?? syncLabels[syncLabels.length - 1];
}

export function getSyncColor(score: number): string {
  if (score >= 90) return "#059669";
  if (score >= 70) return "#0d9488";
  if (score >= 50) return "#d97706";
  if (score >= 30) return "#ea580c";
  return "#dc2626";
}

/** 5次元の表示ラベル定義 */
export const dimLabels = [
  { key: "c1", name: "抽象化", color: "#0d9488", lo: "具象", hi: "抽象" },
  { key: "c2", name: "指向性", color: "#d97706", lo: "マジレス", hi: "ネタ" },
  { key: "c3", name: "合理性", color: "#2563eb", lo: "情緒的", hi: "合理的" },
  { key: "c4", name: "社会的距離", color: "#7c3aed", lo: "傍観", hi: "介入" },
  { key: "c5", name: "言語解像度", color: "#059669", lo: "未変換", hi: "翻訳上手" },
];
