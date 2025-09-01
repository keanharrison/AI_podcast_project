'use client';

import { useState } from 'react';

interface GenerateResponse {
  id: string;
  url: string;
  duration: number;
  size: number;
}

export default function Home() {
  const [input, setInput] = useState('');
  const [inputType, setInputType] = useState<'url' | 'text'>('url');
  const [voice, setVoice] = useState('');
  const [style, setStyle] = useState('');
  const [status, setStatus] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<GenerateResponse | null>(null);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!input.trim()) {
      setError('Please enter some content');
      return;
    }

    const MAX_TEXT_LENGTH = 50000;
    if (inputType === 'text' && input.length > MAX_TEXT_LENGTH) {
      setError(`Text is too long. Maximum ${MAX_TEXT_LENGTH.toLocaleString()} characters allowed.`);
      return;
    }

    setIsGenerating(true);
    setError('');
    setResult(null);
    setStatus('Ingesting content...');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: input.trim(),
          inputType,
          voice: voice || undefined,
          style: style || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Generation failed');
      }

      setStatus('Generating script...');
      // Simulate status updates (in real app, you'd use WebSocket or polling)
      setTimeout(() => setStatus('Synthesizing audio...'), 2000);
      setTimeout(() => setStatus('Stitching audio files...'), 4000);

      const data: GenerateResponse = await response.json();
      setResult(data);
      setStatus('Complete!');
    } catch (err: any) {
      setError(err.message);
      setStatus('');
    } finally {
      setIsGenerating(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              🎙️ AI Podcast Generator
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Transform any URL or text into an engaging AI-generated podcast
            </p>
            <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-800">
                🎭 <strong>Demo Mode Active</strong> - Experience the full UI with mock responses! 
                Add your OpenAI API key to generate real podcasts.
              </p>
            </div>
          </div>

          {/* Main Form */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
            {/* Input Type Toggle */}
            <div className="flex mb-4">
              <button
                onClick={() => setInputType('url')}
                className={`flex-1 py-2 px-4 rounded-l-lg font-medium transition-colors ${
                  inputType === 'url'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                URL
              </button>
              <button
                onClick={() => setInputType('text')}
                className={`flex-1 py-2 px-4 rounded-r-lg font-medium transition-colors ${
                  inputType === 'text'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Text
              </button>
            </div>

            {/* Input Field */}
            <div className="mb-4">
              {inputType === 'url' ? (
                <input
                  type="url"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="https://example.com/article"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isGenerating}
                />
              ) : (
                <div>
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Paste your text content here..."
                    rows={6}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    disabled={isGenerating}
                  />
                  <div className="text-right text-sm text-gray-500 mt-1">
                    {input.length.toLocaleString()}/50,000 characters
                    {input.length > 45000 && (
                      <span className="text-orange-500 ml-2">⚠️ Approaching limit</span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Voice and Style Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Voice Style
                </label>
                <select
                  value={voice}
                  onChange={(e) => setVoice(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isGenerating}
                >
                  <option value="">Default</option>
                  <option value="alloy">Alloy (Neutral)</option>
                  <option value="echo">Echo (Male)</option>
                  <option value="fable">Fable (British)</option>
                  <option value="onyx">Onyx (Deep)</option>
                  <option value="nova">Nova (Female)</option>
                  <option value="shimmer">Shimmer (Soft)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Podcast Style
                </label>
                <select
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isGenerating}
                >
                  <option value="">Default</option>
                  <option value="conversational">Conversational</option>
                  <option value="educational">Educational</option>
                  <option value="news">News Style</option>
                  <option value="casual">Casual Chat</option>
                </select>
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !input.trim()}
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              {isGenerating ? 'Generating...' : 'Generate Podcast'}
            </button>
          </div>

          {/* Status */}
          {status && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-3"></div>
                <span className="text-blue-700 dark:text-blue-300">{status}</span>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
              <span className="text-red-700 dark:text-red-300">❌ {error}</span>
            </div>
          )}

          {/* Result */}
          {result && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-green-800 dark:text-green-300 mb-4">
                ✅ Podcast Generated Successfully!
              </h3>
              
              <div className="mb-4">
                <audio 
                  controls 
                  className="w-full"
                  src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}${result.url}`}
                >
                  Your browser does not support the audio element.
                </audio>
              </div>

              <div className="flex justify-between items-center text-sm text-green-700 dark:text-green-300 mb-4">
                <span>Duration: {formatDuration(result.duration)}</span>
                <span>Size: {formatFileSize(result.size)}</span>
              </div>

              <a
                href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}${result.url}`}
                download={`podcast_${result.id}.mp3`}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                📥 Download MP3
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}