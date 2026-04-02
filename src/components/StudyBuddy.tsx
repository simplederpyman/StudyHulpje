import React, { useState } from 'react';
import { Bot, Upload, Send, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { GoogleGenAI } from '@google/genai';

export default function StudyBuddy() {
  const [topic, setTopic] = useState('');
  const [quiz, setQuiz] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generateQuiz = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setError('');
    setQuiz(null);

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) throw new Error("Geen API key gevonden.");

      const ai = new GoogleGenAI({ apiKey });
      
      const prompt = `Maak een korte, leuke meerkeuze quiz (3 vragen) over het volgende onderwerp: "${topic}". 
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

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        }
      });

      if (response.text) {
        setQuiz(JSON.parse(response.text));
      }
    } catch (err: any) {
      console.error(err);
      setError('Er ging iets mis bij het maken van de quiz. Probeer het opnieuw.');
    } finally {
      setLoading(false);
    }
  };

  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);

  const handleAnswer = (qIndex: number, optIndex: number) => {
    if (showResults) return;
    setAnswers(prev => ({ ...prev, [qIndex]: optIndex }));
  };

  const checkAnswers = () => {
    setShowResults(true);
  };

  const resetQuiz = () => {
    setQuiz(null);
    setAnswers({});
    setShowResults(false);
    setTopic('');
  };

  return (
    <div className="bg-white/60 dark:bg-black/40 backdrop-blur-2xl rounded-[2.5rem] p-6 md:p-8 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] border border-white/40 dark:border-white/10 transition-colors duration-500 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-blue-500/20 dark:bg-blue-500/30 p-3 rounded-2xl shadow-inner border border-white/40 dark:border-white/10">
          <Bot className="w-6 h-6 text-blue-700 dark:text-blue-400" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">AI Study Buddy</h2>
      </div>

      {!quiz ? (
        <div className="space-y-4">
          <p className="text-slate-600 dark:text-slate-300 font-medium">
            Waar wil je over overhoord worden? Typ een onderwerp en ik maak een quiz voor je!
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && generateQuiz()}
              placeholder="Bijv. De Franse Revolutie, Fotosynthese..."
              className="flex-1 px-5 py-3 rounded-2xl bg-white/80 dark:bg-black/30 border-2 border-white/60 dark:border-white/10 focus:ring-4 focus:ring-blue-400/30 focus:border-blue-500 dark:focus:border-blue-400 outline-none transition-all shadow-sm placeholder:text-slate-400 dark:placeholder:text-slate-500 font-medium text-slate-800 dark:text-white"
              disabled={loading}
            />
            <button
              onClick={generateQuiz}
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
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{quiz.title}</h3>
            <button onClick={resetQuiz} className="text-sm font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white underline">Nieuwe Quiz</button>
          </div>

          <div className="space-y-8">
            {quiz.questions.map((q: any, qIndex: number) => (
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
          </div>

          {!showResults && Object.keys(answers).length === quiz.questions.length && (
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
    </div>
  );
}
