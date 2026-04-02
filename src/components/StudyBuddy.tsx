import React, { useState } from 'react';
import { Bot, Upload, Send, Loader2, BookOpen, Layers, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { GoogleGenAI } from '@google/genai';
import ReactMarkdown from 'react-markdown';

type Mode = 'quiz' | 'flashcards' | 'info';

export default function StudyBuddy() {
  const [topic, setTopic] = useState('');
  const [mode, setMode] = useState<Mode>('quiz');
  const [count, setCount] = useState(3);
  
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [currentFlashcard, setCurrentFlashcard] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const generateContent = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    setAnswers({});
    setShowResults(false);
    setCurrentFlashcard(0);
    setIsFlipped(false);

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) throw new Error("Geen API key gevonden.");

      const ai = new GoogleGenAI({ apiKey });
      
      let prompt = '';
      if (mode === 'quiz') {
        prompt = `Maak een korte, leuke meerkeuze quiz (${count} vragen) over het volgende onderwerp: "${topic}". 
        Geef het antwoord in strict JSON formaat met deze structuur:
        {
          "title": "Titel van de quiz",
          "questions": [
            {
              "question": "De vraag",
              "options": ["Optie A", "Optie B", "Optie C", "Optie D"],
              "correctAnswerIndex": 0,
              "explanation": "Korte uitleg waarom dit goed is."
            }
          ]
        }`;
      } else if (mode === 'flashcards') {
        prompt = `Maak ${count} flashcards over het volgende onderwerp: "${topic}". 
        Geef het antwoord in strict JSON formaat met deze structuur:
        {
          "title": "Titel van de flashcards",
          "cards": [
            {
              "front": "Term of vraag op de voorkant",
              "back": "Definitie of antwoord op de achterkant"
            }
          ]
        }`;
      } else if (mode === 'info') {
        prompt = `Geef een duidelijke, gestructureerde en boeiende uitleg over het volgende onderwerp: "${topic}".
        Gebruik Markdown opmaak (koppen, opsommingen, vetgedrukt). Zorg dat het makkelijk te lezen is voor een student.
        Geef het antwoord in strict JSON formaat met deze structuur:
        {
          "title": "Titel van de uitleg",
          "content": "De markdown content hier"
        }`;
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        }
      });

      if (response.text) {
        setResult(JSON.parse(response.text));
      }
    } catch (err: any) {
      console.error(err);
      setError('Er ging iets mis. Probeer het opnieuw.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (qIndex: number, optIndex: number) => {
    if (showResults) return;
    setAnswers(prev => ({ ...prev, [qIndex]: optIndex }));
  };

  const checkAnswers = () => {
    setShowResults(true);
  };

  const reset = () => {
    setResult(null);
    setAnswers({});
    setShowResults(false);
    setTopic('');
    setCurrentFlashcard(0);
    setIsFlipped(false);
  };

  return (
    <div className="bg-white/60 dark:bg-black/40 backdrop-blur-2xl rounded-[2.5rem] p-6 md:p-8 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] border border-white/40 dark:border-white/10 transition-colors duration-500 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-blue-500/20 dark:bg-blue-500/30 p-3 rounded-2xl shadow-inner border border-white/40 dark:border-white/10">
          <Bot className="w-6 h-6 text-blue-700 dark:text-blue-400" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">AI Study Buddy</h2>
      </div>

      {!result ? (
        <div className="space-y-6">
          <p className="text-slate-600 dark:text-slate-300 font-medium">
            Waar wil je over leren? Typ een onderwerp en kies wat ik voor je moet maken!
          </p>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setMode('quiz')}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all border-2",
                mode === 'quiz' ? "bg-blue-100 dark:bg-blue-900/40 border-blue-400 text-blue-800 dark:text-blue-300" : "bg-white/50 dark:bg-black/20 border-transparent text-slate-600 dark:text-slate-300 hover:bg-white/80 dark:hover:bg-black/40"
              )}
            >
              <HelpCircle className="w-5 h-5" /> Quiz
            </button>
            <button
              onClick={() => setMode('flashcards')}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all border-2",
                mode === 'flashcards' ? "bg-purple-100 dark:bg-purple-900/40 border-purple-400 text-purple-800 dark:text-purple-300" : "bg-white/50 dark:bg-black/20 border-transparent text-slate-600 dark:text-slate-300 hover:bg-white/80 dark:hover:bg-black/40"
              )}
            >
              <Layers className="w-5 h-5" /> Flashcards
            </button>
            <button
              onClick={() => setMode('info')}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all border-2",
                mode === 'info' ? "bg-green-100 dark:bg-green-900/40 border-green-400 text-green-800 dark:text-green-300" : "bg-white/50 dark:bg-black/20 border-transparent text-slate-600 dark:text-slate-300 hover:bg-white/80 dark:hover:bg-black/40"
              )}
            >
              <BookOpen className="w-5 h-5" /> Uitleg
            </button>
          </div>

          {(mode === 'quiz' || mode === 'flashcards') && (
            <div className="flex items-center gap-4 bg-white/50 dark:bg-black/20 p-4 rounded-2xl border border-white/40 dark:border-white/10">
              <label className="font-bold text-slate-700 dark:text-slate-300">Aantal:</label>
              <div className="flex gap-2">
                {[3, 5, 10].map(num => (
                  <button
                    key={num}
                    onClick={() => setCount(num)}
                    className={cn(
                      "w-10 h-10 rounded-xl font-bold transition-all border-2",
                      count === num ? "bg-slate-800 dark:bg-white text-white dark:text-slate-900 border-slate-800 dark:border-white" : "bg-white/50 dark:bg-black/20 border-transparent text-slate-600 dark:text-slate-300 hover:bg-white/80 dark:hover:bg-black/40"
                    )}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && generateContent()}
              placeholder="Bijv. De Franse Revolutie, Fotosynthese..."
              className="flex-1 px-5 py-3 rounded-2xl bg-white/80 dark:bg-black/30 border-2 border-white/60 dark:border-white/10 focus:ring-4 focus:ring-blue-400/30 focus:border-blue-500 dark:focus:border-blue-400 outline-none transition-all shadow-sm placeholder:text-slate-400 dark:placeholder:text-slate-500 font-medium text-slate-800 dark:text-white"
              disabled={loading}
            />
            <button
              onClick={generateContent}
              disabled={!topic.trim() || loading}
              className="bg-blue-600 dark:bg-blue-500 text-white px-5 py-3 rounded-2xl font-bold hover:bg-blue-700 dark:hover:bg-blue-600 hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:transform-none flex items-center justify-center min-w-[4rem]"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </button>
          </div>
          {error && <p className="text-red-500 text-sm font-medium mt-2">{error}</p>}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{result.title}</h3>
            <button onClick={reset} className="text-sm font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white underline">Nieuw Onderwerp</button>
          </div>

          {mode === 'quiz' && result.questions && (
            <div className="space-y-8">
              {result.questions.map((q: any, qIndex: number) => (
                <div key={qIndex} className="bg-white/50 dark:bg-black/20 p-5 rounded-2xl border border-white/40 dark:border-white/5">
                  <p className="font-bold text-lg text-slate-800 dark:text-white mb-4">{qIndex + 1}. {q.question}</p>
                  <div className="space-y-2">
                    {q.options.map((opt: string, optIndex: number) => {
                      const isSelected = answers[qIndex] === optIndex;
                      const isCorrect = q.correctAnswerIndex === optIndex;
                      
                      let btnClass = "bg-white/70 dark:bg-black/40 border-white/60 dark:border-white/10 text-slate-700 dark:text-slate-200 hover:bg-white/90 dark:hover:bg-black/60";
                      
                      if (showResults) {
                        if (isCorrect) btnClass = "bg-green-100 dark:bg-green-900/40 border-green-400 text-green-800 dark:text-green-300";
                        else if (isSelected && !isCorrect) btnClass = "bg-red-100 dark:bg-red-900/40 border-red-400 text-red-800 dark:text-red-300";
                        else btnClass = "opacity-50 bg-white/30 dark:bg-black/20 border-transparent text-slate-500";
                      } else if (isSelected) {
                        btnClass = "bg-blue-100 dark:bg-blue-900/40 border-blue-400 text-blue-800 dark:text-blue-300 ring-2 ring-blue-400 ring-offset-1 dark:ring-offset-slate-900";
                      }

                      return (
                        <button
                          key={optIndex}
                          onClick={() => handleAnswer(qIndex, optIndex)}
                          disabled={showResults}
                          className={cn(
                            "w-full text-left px-4 py-3 rounded-xl border-2 font-medium transition-all",
                            btnClass
                          )}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                  {showResults && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800/30 text-sm text-blue-800 dark:text-blue-200"
                    >
                      <span className="font-bold">Uitleg:</span> {q.explanation}
                    </motion.div>
                  )}
                </div>
              ))}
              {!showResults && Object.keys(answers).length === result.questions.length && (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={checkAnswers}
                  className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-4 rounded-2xl font-bold text-lg hover:bg-slate-800 dark:hover:bg-slate-200 transition-all shadow-lg"
                >
                  Kijk Na
                </motion.button>
              )}
            </div>
          )}

          {mode === 'flashcards' && result.cards && (
            <div className="flex flex-col items-center">
              <div 
                className="w-full max-w-md aspect-[4/3] perspective-1000 cursor-pointer"
                onClick={() => setIsFlipped(!isFlipped)}
              >
                <motion.div
                  className="w-full h-full relative preserve-3d"
                  animate={{ rotateY: isFlipped ? 180 : 0 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                >
                  {/* Front */}
                  <div className="absolute inset-0 backface-hidden bg-white dark:bg-slate-800 rounded-3xl shadow-xl border-2 border-slate-100 dark:border-slate-700 flex items-center justify-center p-8 text-center">
                    <h4 className="text-2xl font-bold text-slate-800 dark:text-white">
                      {result.cards[currentFlashcard].front}
                    </h4>
                    <p className="absolute bottom-4 text-sm text-slate-400 font-medium">Klik om om te draaien</p>
                  </div>
                  {/* Back */}
                  <div className="absolute inset-0 backface-hidden bg-purple-50 dark:bg-purple-900/20 rounded-3xl shadow-xl border-2 border-purple-200 dark:border-purple-800/50 flex items-center justify-center p-8 text-center [transform:rotateY(180deg)]">
                    <p className="text-xl font-medium text-slate-700 dark:text-slate-200">
                      {result.cards[currentFlashcard].back}
                    </p>
                  </div>
                </motion.div>
              </div>
              
              <div className="flex items-center gap-6 mt-8">
                <button 
                  onClick={() => {
                    setIsFlipped(false);
                    setTimeout(() => setCurrentFlashcard(Math.max(0, currentFlashcard - 1)), 150);
                  }}
                  disabled={currentFlashcard === 0}
                  className="p-3 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-50 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  Vorige
                </button>
                <span className="font-bold text-slate-500">
                  {currentFlashcard + 1} / {result.cards.length}
                </span>
                <button 
                  onClick={() => {
                    setIsFlipped(false);
                    setTimeout(() => setCurrentFlashcard(Math.min(result.cards.length - 1, currentFlashcard + 1)), 150);
                  }}
                  disabled={currentFlashcard === result.cards.length - 1}
                  className="p-3 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-50 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  Volgende
                </button>
              </div>
            </div>
          )}

          {mode === 'info' && result.content && (
            <div className="bg-white/80 dark:bg-black/40 p-6 md:p-8 rounded-3xl border border-white/40 dark:border-white/10 prose prose-slate dark:prose-invert max-w-none">
              <ReactMarkdown>{result.content}</ReactMarkdown>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
