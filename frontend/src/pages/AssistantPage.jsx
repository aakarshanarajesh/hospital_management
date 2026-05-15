import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Card from '../components/Card';
import Alert from '../components/Alert';
import { aiAPI } from '../services/api';
import { Bot, Send, User } from 'lucide-react';

export default function AssistantPage() {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: 'Ask about ICU beds, high risk patients, oxygen supply, ventilators, or occupancy.',
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const askAssistant = async (e) => {
    e.preventDefault();
    const trimmedQuestion = question.trim();
    if (!trimmedQuestion) return;

    setMessages((current) => [
      ...current,
      { role: 'user', text: trimmedQuestion },
    ]);
    setQuestion('');
    setError('');
    setLoading(true);

    try {
      const res = await aiAPI.askAssistant(trimmedQuestion);
      setMessages((current) => [
        ...current,
        { role: 'assistant', text: res.data.answer },
      ]);
    } catch (err) {
      setError(err.response?.data?.error || 'Assistant is unavailable');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1">
          <div className="p-4 lg:p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-800">
                Hospital Assistant
              </h1>
              <p className="text-gray-600 mt-2">
                Natural language answers from current hospital data.
              </p>
            </div>

            {error && (
              <Alert message={error} type="error" onClose={() => setError('')} />
            )}

            <Card>
              <div className="h-[520px] flex flex-col">
                <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                  {messages.map((message, index) => {
                    const isUser = message.role === 'user';
                    return (
                      <div
                        key={`${message.role}-${index}`}
                        className={`flex gap-3 ${isUser ? 'justify-end' : ''}`}
                      >
                        {!isUser && (
                          <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0">
                            <Bot size={18} />
                          </div>
                        )}
                        <div
                          className={`max-w-[80%] rounded-lg px-4 py-3 text-sm ${
                            isUser
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {message.text}
                        </div>
                        {isUser && (
                          <div className="w-9 h-9 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center flex-shrink-0">
                            <User size={18} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {loading && (
                    <div className="text-sm text-gray-500">Assistant is checking live data...</div>
                  )}
                </div>

                <form onSubmit={askAssistant} className="mt-4 flex gap-3">
                  <input
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="How many ICU beds are available?"
                    className="flex-1 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-5 py-3 rounded-lg transition"
                  >
                    <Send size={18} />
                    <span>Send</span>
                  </button>
                </form>
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
