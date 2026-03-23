/**
 * API 호출과 최소 지연을 동시에 실행.
 * API가 빨리 끝나도 최소 ms만큼은 기다림.
 * API가 더 오래 걸리면 API 완료 시 바로 반환.
 */
export async function withMinDelay<T>(
  promise: Promise<T>,
  ms: number
): Promise<T> {
  const [result] = await Promise.all([
    promise,
    new Promise((resolve) => setTimeout(resolve, ms)),
  ]);
  return result;
}
