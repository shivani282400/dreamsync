export function useSpeech() {
    const speak = (text: string) => {
      if (!window.speechSynthesis) return;
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 0.9;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(u);
    };
  
    const stop = () => {
      window.speechSynthesis.cancel();
    };
  
    return { speak, stop };
  }
  