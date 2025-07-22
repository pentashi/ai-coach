import React, { useState, useEffect, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function ChatWithCoach() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(true);
  const beep = useRef(new Audio('/beep.mp3'));
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognitionRef = useRef(null);
  const messagesEndRef = useRef(null);
  const API_URL = 'http://localhost:4000';

  useEffect(() => {
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    if (!SpeechRecognition || isSafari) {
      setVoiceSupported(false);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const speak = (text) => {
    if ('speechSynthesis' in window) {
      if (speechSynthesis.speaking) speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const voices = speechSynthesis.getVoices();
      utterance.voice = voices.find((v) => v.lang.includes('en')) || null;
      utterance.pitch = 1.1;
      utterance.rate = 1;
      speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    if (!voiceSupported) return;

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.lang = 'en-US';
    recognitionRef.current.interimResults = false;
    recognitionRef.current.maxAlternatives = 1;

    recognitionRef.current.onstart = () => {
      if (speechSynthesis.speaking) speechSynthesis.cancel();
      setIsListening(true);
    };

    recognitionRef.current.onend = () => setIsListening(false);

    recognitionRef.current.onerror = (event) => {
      console.error('SpeechRecognition error:', event.error);
      setIsListening(false);
    };

    recognitionRef.current.onresult = (event) => {
      const voiceText = event.results[0][0].transcript;
      setInput(voiceText);
      handleSend(voiceText, true);
    };
  }, [voiceSupported]);

  const handleSend = (message = input, fromVoice = false) => {
    if (!message.trim()) return;

    if (!fromVoice) {
      setMessages((prev) => [...prev, { sender: 'user', text: message }]);
    }

    fetch(`${API_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (fromVoice) {
          speak(data.reply);
        } else {
          setMessages((prev) => [...prev, { sender: 'coach', text: data.reply }]);
        }
      })
      .catch(() => {
        const failMsg = {
          sender: 'coach',
          text: 'Sorry, something went wrong.',
        };
        setMessages((prev) => [...prev, failMsg]);
        if (fromVoice) speak(failMsg.text);
      });

    setInput('');
  };

  const startListening = () => {
    if (!voiceSupported || !recognitionRef.current) {
      alert('Voice input is not supported on this browser. Try Chrome on Android.');
      return;
    }

    if (isListening) return;

    if (speechSynthesis.speaking) speechSynthesis.cancel();

    beep.current.play().catch(() => console.warn('Beep blocked'));
    recognitionRef.current.start();
  };

  return (
    <div className="container py-4" style={{ minHeight: '100vh', backgroundColor: '#121212', color: '#fff' }}>
      <div className="card shadow-lg bg-dark text-white border-0 mb-3" style={{ minHeight: '70vh' }}>
        <div className="card-body overflow-auto" style={{ maxHeight: '70vh' }}>
          {messages.map((msg, idx) => (
            <div key={idx} className={`d-flex ${msg.sender === 'user' ? 'justify-content-end' : 'justify-content-start'} mb-2`}>
              <div
                className={`rounded px-3 py-2 ${msg.sender === 'user' ? 'bg-info text-dark' : 'bg-secondary'}`}
                style={{ maxWidth: '80%', wordBreak: 'break-word', fontSize: '1rem' }}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {isListening && (
            <div className="text-center text-info fw-bold mb-2" style={{ animation: 'pulse 1.5s infinite' }}>
              🎤 Listening...
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="input-group">
        <input
          type="text"
          className="form-control bg-dark text-white border-info"
          placeholder="Ask your coach..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <button className="btn btn-info fw-bold" onClick={() => handleSend()}>
          Send
        </button>
        <button
          className="btn btn-outline-light"
          onClick={startListening}
          disabled={!voiceSupported}
          title="Voice Input"
        >
          🎤
        </button>
      </div>

      <style>{`
        @keyframes pulse {
          0% { opacity: 0.4; }
          50% { opacity: 1; }
          100% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}
