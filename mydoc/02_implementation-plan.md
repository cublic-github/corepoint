# CorePoint 動的実装 作業計画

## 技術スタック

| レイヤー | 技術 |
|----------|------|
| フロントエンド | Next.js (App Router) + TypeScript + Tailwind CSS |
| バックエンド | Next.js API Routes (Route Handlers) |
| データベース | Firebase Firestore |
| 認証 | Firebase Authentication |
| ホスティング | Vercel（想定） |

---

## Phase 1: プロジェクト基盤セットアップ

### 1-1. Next.js プロジェクト初期化
- `npx create-next-app@latest` で App Router + TypeScript + Tailwind CSS のプロジェクト作成
- デザイントークン（カラー、フォント）を `tailwind.config.ts` に移植
- Google Fonts（Fira Sans + Noto Sans JP）の設定

### 1-2. Firebase セットアップ
- Firebase プロジェクトの作成（コンソール上）
- `firebase` SDK のインストール
- `lib/firebase.ts` に初期化コードを配置
- 環境変数（`.env.local`）の設定:
  - `NEXT_PUBLIC_FIREBASE_API_KEY`
  - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
  - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
  - etc.

### 1-3. Firestore データ構造設計

```
firestore/
├── quizzes/                    # クイズ設問コレクション
│   └── {quizId}/
│       ├── question: string           # 設問テキスト
│       ├── category: string           # カテゴリラベル
│       ├── choices: [                 # 選択肢配列 (5択)
│       │     { text: string, vector: [c1, c2, c3, c4, c5] }
│       │   ]
│       ├── isActive: boolean          # 使用中フラグ
│       ├── order: number              # 表示順
│       └── createdAt: timestamp
│
├── responses/                  # 回答データコレクション
│   └── {responseId}/
│       ├── respondentName: string
│       ├── respondentEmail: string
│       ├── answers: [                 # 各問の回答インデックス
│       │     { quizId: string, choiceIndex: number }
│       │   ]
│       ├── finalVector: [c1, c2, c3, c4, c5]  # 算出済みベクトル
│       ├── createdAt: timestamp
│       └── sessionId: string          # 重複防止用
│
├── targetPresets/              # ターゲット人物像プリセット
│   └── {presetId}/
│       ├── name: string
│       ├── values: [c1, c2, c3, c4, c5]
│       └── order: number
│
└── weightPresets/              # 重みプリセット
    └── {presetId}/
        ├── name: string
        ├── values: [w1, w2, w3, w4, w5]
        └── order: number
```

---

## Phase 2: 回答画面の動的実装

### 2-1. ページ構成

| パス | 内容 |
|------|------|
| `/quiz` | 回答者情報入力フォーム（名前・メール、任意） → クイズ開始 |
| `/quiz/thanks` | 完了画面 |

### 2-2. 実装タスク

1. **クイズデータ取得**
   - Firestore から `isActive: true` の設問を `order` 順で取得
   - クライアントコンポーネントで状態管理（現在の問番号、選択状態、回答履歴）

2. **回答フロー UI**
   - プログレスバー（動的に問数に応じて計算）
   - 選択肢カードの選択/解除
   - 「次の質問へ」ボタン → 次の設問へ遷移（アニメーション付き）
   - 最終問の場合は「回答を送信」に変更

3. **ベクトル算出ロジック** (`lib/scoring.ts`)
   - 初期ベクトル `[5.0, 5.0, 5.0, 5.0, 5.0]`
   - 各回答の vector を加算（減衰アルゴリズム適用）
   - クランプ処理 `0.0〜10.0`

4. **回答データ送信**
   - Firestore の `responses` コレクションに保存
   - 算出済み `finalVector` も一緒に保存
   - セッションID で重複送信防止

5. **サンクス画面**
   - モックのデザインを再現

### 2-3. 回答者情報の入力フォーム
- クイズ開始前に「メールアドレス」「名前（ニックネーム可）」の入力フォームを表示
- どちらも **任意入力**（未入力でもクイズに進める）
- 未入力時のフォールバック: 名前 → `"匿名"` / メール → `"test@example.com"`

---

## Phase 3: 管理画面の動的実装

### 3-1. ページ構成

| パス | 内容 |
|------|------|
| `/admin` | 管理画面（回答者一覧がデフォルト表示） |
| `/admin/login` | 管理者ログイン |

### 3-2. 認証
- 現時点では認証なし（管理画面はそのままアクセス可能）
- 将来的に認証を追加できるよう、レイアウト単位でガードを差し込める構造にしておく

### 3-3. 実装タスク

#### A. 回答者一覧タブ

1. **ユーザーテーブル**
   - Firestore `responses` コレクションからリアルタイム取得
   - ターゲットプリセット・重みプリセットの選択に応じてシンクロ率を再計算
   - ソート機能（回答日 / Sync Rate）
   - 検索フィルタ（名前・メール）

2. **ユーザー詳細パネル（右スライド）**
   - シンクロ率リングチャート
   - 個別のプリセット切り替え
   - 5次元ベクトルのバーチャート
   - ターゲットとの比較表示

#### B. クイズ管理タブ

1. **使用中クイズ一覧**
   - `isActive: true` の設問を `order` 順で表示
   - ドラッグ&ドロップで並び替え（`order` フィールドを更新）
   - 編集モーダル（設問テキスト + 選択肢 + ベクトル値の編集）
   - ストックへ戻す（`isActive: false` に更新）

2. **登録済みストック**
   - `isActive: false` の設問一覧
   - 「+使用する」で有効化
   - 編集・削除

3. **JSON一括インポート**
   - テンプレートのコピー機能
   - JSON パース → バリデーション → Firestore に一括書き込み

4. **新規設問作成**
   - モーダルまたは別ページで設問テキスト + 5択（各選択肢にベクトル値）を入力

#### C. 基本設定タブ

1. **ターゲット人物像プリセット CRUD**
   - 一覧表示 / 新規追加 / 編集 / 削除
   - 各プリセットの name + values[5] を管理

2. **重みプリセット CRUD**
   - 同上

---

## Phase 4: 共通ロジック・ユーティリティ

### 4-1. スコアリングモジュール (`lib/scoring.ts`)

```typescript
// 共通で使う計算ロジック
export function calcSyncScore(userVec: number[], targetVec: number[], weights: number[]): number
export function getSyncLabel(score: number): { label: string; desc: string }
export function applyDamping(currentValue: number, delta: number): number
export function clamp(value: number, min: number, max: number): number
```

### 4-2. Firestore ヘルパー (`lib/firestore.ts`)

```typescript
// CRUD 操作をまとめたヘルパー
export async function getActiveQuizzes(): Promise<Quiz[]>
export async function submitResponse(data: ResponseData): Promise<void>
export async function getResponses(): Promise<Response[]>
export async function getPresets(): Promise<{ targets: TargetPreset[], weights: WeightPreset[] }>
// ... etc
```

### 4-3. 型定義 (`types/index.ts`)

```typescript
export interface Quiz { id: string; question: string; category: string; choices: Choice[]; isActive: boolean; order: number }
export interface Choice { text: string; vector: [number, number, number, number, number] }
export interface Response { id: string; respondentName: string; respondentEmail: string; answers: Answer[]; finalVector: number[]; createdAt: Date }
export interface TargetPreset { id: string; name: string; values: [number, number, number, number, number] }
export interface WeightPreset { id: string; name: string; values: [number, number, number, number, number] }
```

---

## 作業の優先順位（推奨）

| 順番 | 作業 | 理由 |
|------|------|------|
| 1 | Phase 1: 基盤セットアップ | 全ての土台 |
| 2 | Phase 4: 共通ロジック・型定義 | 画面実装で使うため先に用意 |
| 3 | Phase 2: 回答画面 | エンドユーザー向け。管理画面より構造がシンプル |
| 4 | Phase 3: 管理画面 | 回答データが存在する状態で開発・テストできる |

---

## 決定事項

1. **回答者の識別方法**: 回答開始前にメールアドレス + 名前（ニックネーム可）の入力フォームを表示。ただし未入力でも次に進めるようにし、未入力時は「匿名」等のフォールバック値を自動設定する。
2. **管理者認証**: 認証なし。管理画面は認証不要でアクセス可能とする（将来的に追加可能な設計にしておく）。
3. **Firebase プロジェクト**: 新規作成済み。そちらを使用する。
4. **デプロイ先**: Vercel
