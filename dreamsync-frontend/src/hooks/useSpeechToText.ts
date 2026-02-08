export function useSpeechToText(onResult: (text: string) => void) {
    const start = () => {
      const SR =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;
  
      if (!SR) {
        alert("Speech recognition not supported");
        return;
      }
  
      const rec = new SR();
      rec.lang = "en-US";
      rec.onresult = (e: any) => {
        onResult(e.results[0][0].transcript);
      };
      rec.start();
    };
  
    return { start };
  }
  