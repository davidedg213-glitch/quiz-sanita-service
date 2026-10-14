export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { getStore } = await import("./server/store");
    const state = globalThis as unknown as { quizExpiryTimer?: ReturnType<typeof setInterval> };
    if (!state.quizExpiryTimer) {
      getStore().expireDue();
      state.quizExpiryTimer = setInterval(() => {
        try { getStore().expireDue(); } catch (error) { console.error("Finalizzazione prove private:", error instanceof Error ? error.message : "errore"); }
      }, 5000);
      state.quizExpiryTimer.unref();
    }
  }
}
