import { useEffect, useRef, useState } from 'react';

export type ActionFeedbackState = 'idle' | 'processing' | 'done';

const MIN_PROCESSING_MS = 500;
const DONE_DISPLAY_MS = 1800;

// Wraps a synchronous (or async) file-generation action with a minimum
// "processing" duration — even when the real work finishes in a few
// milliseconds — so the button always visibly reacts to a tap instead of
// looking inert, which is what was causing people to tap it repeatedly and
// end up with duplicate downloads. While non-idle, run() no-ops on further
// calls, so a second tap during processing can't queue up another export.
export function useActionFeedback() {
  const [state, setState] = useState<ActionFeedbackState>('idle');
  const doneTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (doneTimer.current) clearTimeout(doneTimer.current); }, []);

  const run = async (action: () => void | Promise<void>) => {
    if (state !== 'idle') return;
    setState('processing');
    try {
      const minWait = new Promise((resolve) => setTimeout(resolve, MIN_PROCESSING_MS));
      await Promise.all([Promise.resolve().then(action), minWait]);
      setState('done');
      doneTimer.current = setTimeout(() => setState('idle'), DONE_DISPLAY_MS);
    } catch (e) {
      setState('idle');
      throw e;
    }
  };

  return { state, run };
}
