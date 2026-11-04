/**
 * next build の最中か。
 * ISR のページは、作り直しが例外で終われば Next が前の正常なページを残すので、実行中は読めなければ投げる。
 * ビルドのときだけは投げずに代わりの表示で通す（データベースが無い環境でもビルドできるように）
 */
export function isBuildPhase(): boolean {
  return process.env.NEXT_PHASE === "phase-production-build";
}
