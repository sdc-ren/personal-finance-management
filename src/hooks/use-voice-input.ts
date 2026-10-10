"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Hook bọc Web Speech API (SpeechRecognition) cho nhập liệu tiếng Việt.
 *
 * - Ngôn ngữ: vi-VN, chế độ continuous + interim để hiện chữ trực tiếp.
 * - Chrome tự ngắt khi im lặng vài giây -> hook tự nối lại nếu user vẫn muốn nghe.
 * - Gom transcript "final" dồn lại; "interim" chỉ để hiển thị.
 */

interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: ArrayLike<{
    isFinal: boolean;
    0: { transcript: string };
  }>;
}

type RecognitionInstance = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((e: SpeechRecognitionEventLike) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};

function getRecognitionCtor(): (new () => RecognitionInstance) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as Record<string, unknown>;
  const ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
  return (ctor as new () => RecognitionInstance) || null;
}

export type VoiceError = "unsupported" | "mic-denied" | "no-speech" | "network" | null;

interface UseVoiceInputOptions {
  lang?: string;
}

export function useVoiceInput({ lang = "vi-VN" }: UseVoiceInputOptions = {}) {
  const [supported] = useState(() => getRecognitionCtor() !== null);
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const [finalText, setFinalText] = useState("");
  const [error, setError] = useState<VoiceError>(null);

  const recognitionRef = useRef<RecognitionInstance | null>(null);
  const wantListeningRef = useRef(false);
  const finalRef = useRef("");

  const stop = useCallback(() => {
    wantListeningRef.current = false;
    try {
      recognitionRef.current?.stop();
    } catch {
      /* bỏ qua */
    }
    setListening(false);
    setInterim("");
  }, []);

  const start = useCallback(() => {
    const Ctor = getRecognitionCtor();
    if (!Ctor) {
      setError("unsupported");
      return;
    }
    // Dừng instance cũ nếu còn
    try {
      recognitionRef.current?.abort();
    } catch {
      /* bỏ qua */
    }

    const rec = new Ctor();
    rec.lang = lang;
    rec.continuous = true;
    rec.interimResults = true;

    rec.onresult = (e: SpeechRecognitionEventLike) => {
      let interimText = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const transcript = e.results[i][0].transcript;
        if (e.results[i].isFinal) {
          finalRef.current = (finalRef.current + " " + transcript).trim();
          setFinalText(finalRef.current);
        } else {
          interimText += transcript;
        }
      }
      setInterim(interimText);
    };

    rec.onerror = (e: { error: string }) => {
      if (e.error === "not-allowed" || e.error === "service-not-allowed") {
        setError("mic-denied");
        wantListeningRef.current = false;
        setListening(false);
      } else if (e.error === "network") {
        setError("network");
      } else if (e.error === "no-speech") {
        setError("no-speech");
      }
      // "aborted" là do mình tự stop -> bỏ qua
    };

    rec.onend = () => {
      // Chrome tự ngắt sau vài giây im lặng: nối lại nếu user chưa bấm dừng
      if (wantListeningRef.current) {
        try {
          rec.start();
          return;
        } catch {
          /* rơi xuống dưới */
        }
      }
      setListening(false);
      setInterim("");
    };

    recognitionRef.current = rec;
    finalRef.current = "";
    setFinalText("");
    setInterim("");
    setError(null);
    wantListeningRef.current = true;
    try {
      rec.start();
      setListening(true);
    } catch {
      wantListeningRef.current = false;
      setListening(false);
    }
  }, [lang]);

  const reset = useCallback(() => {
    stop();
    finalRef.current = "";
    setFinalText("");
    setInterim("");
    setError(null);
  }, [stop]);

  // Dọn dẹp khi unmount
  useEffect(() => {
    return () => {
      wantListeningRef.current = false;
      try {
        recognitionRef.current?.abort();
      } catch {
        /* bỏ qua */
      }
    };
  }, []);

  return { supported, listening, interim, finalText, error, start, stop, reset };
}

export const VOICE_ERROR_MESSAGE: Record<Exclude<VoiceError, null>, string> = {
  unsupported:
    "Trình duyệt này chưa hỗ trợ nhập giọng nói. Hãy dùng Chrome hoặc Edge trên điện thoại/máy tính.",
  "mic-denied":
    "Chưa được phép dùng micro. Hãy bấm biểu tượng ổ khoá trên thanh địa chỉ để cấp quyền rồi thử lại.",
  "no-speech": "Chưa nghe thấy gì. Hãy nói gần micro hơn rồi thử lại nhé.",
  network: "Cần mạng để nhận diện giọng nói. Kiểm tra kết nối rồi thử lại.",
};
