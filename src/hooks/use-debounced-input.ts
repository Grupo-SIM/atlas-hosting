"use client";

import { useEffect, useRef, useState } from "react";

/** Native input state updates immediately; consumers receive settled edits. */
export function useDebouncedInput(value: string, onChange: (value: string) => void, delay = 300) {
  const [local, setLocal] = useState(value);
  const callback = useRef(onChange);
  const external = useRef(value);
  callback.current = onChange;

  useEffect(() => {
    if (external.current !== value) {
      external.current = value;
      setLocal(value);
    }
  }, [value]);

  useEffect(() => {
    if (local === value) return;
    const timer = setTimeout(() => callback.current(local), delay);
    return () => clearTimeout(timer);
  }, [local, value, delay]);

  return [local, setLocal] as const;
}
