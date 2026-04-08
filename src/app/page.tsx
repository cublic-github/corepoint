import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-7 h-7 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 3v1m0 16v1m-7.071-2.929l.707-.707m12.728 0l.707.707M3 12h1m16 0h1m-2.929-7.071l-.707.707M6.636 6.636l-.707-.707"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-base-900 mb-2">CorePoint</h1>
        <p className="text-base-500 mb-8">
          認知特性ベクトルによるシンクロ率アセスメント
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/quiz"
            className="bg-accent hover:bg-accent-dark text-white px-6 py-2.5 rounded-lg font-medium text-sm transition-colors"
          >
            回答する
          </Link>
          <Link
            href="/admin"
            className="border border-base-200 hover:border-accent text-base-700 hover:text-accent px-6 py-2.5 rounded-lg font-medium text-sm transition-colors"
          >
            管理画面
          </Link>
        </div>
      </div>
    </div>
  );
}
