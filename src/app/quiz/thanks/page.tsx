export default function ThanksPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* ヘッダー */}
      <header className="border-b border-base-200 bg-white/80 backdrop-blur-sm">
        <div className="max-w-2xl mx-auto px-6 flex items-center h-14">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-accent rounded flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m-7.071-2.929l.707-.707m12.728 0l.707.707M3 12h1m16 0h1m-2.929-7.071l-.707.707M6.636 6.636l-.707-.707" />
              </svg>
            </div>
            <span className="font-semibold text-base-800 tracking-tight">CorePoint</span>
          </div>
        </div>
      </header>

      {/* サンクス */}
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center px-6">
          <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-base-900 mb-3">回答ありがとうございました</h1>
          <p className="text-base-500 max-w-sm mx-auto leading-relaxed">
            ご回答は正常に送信されました。<br />結果は担当者より別途ご連絡いたします。
          </p>
          <div className="mt-8 pt-8 border-t border-base-200">
            <p className="text-sm text-base-400">このページは閉じていただいて問題ありません。</p>
          </div>
        </div>
      </div>
    </div>
  );
}
