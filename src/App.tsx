import React, { useState, useRef, useEffect } from 'react';
import { Camera, Type, Volume2, AlertCircle, Trash, Copy, Check, Moon, Sun } from 'lucide-react';

function App() {
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversions, setConversions] = useState<{ id: number; text: string; timestamp: string }[]>([]);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    // Check system preference on mount
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }

    // Check if running on HTTPS or localhost
    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
      setError('Camera access requires HTTPS or localhost connection.');
    }
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const startCamera = async () => {
    try {
      // Request camera access with specific constraints for better compatibility
      const constraints = {
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: false
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsStreaming(true);
        setError(null);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Camera access denied. Please enable camera permissions.';
      setError(errorMessage);
      console.error('Error accessing camera:', err);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
        track.enabled = false;
      });
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      streamRef.current = null;
      setIsStreaming(false);
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const handleConvertToText = () => {
    // Simulated text conversion
    const newConversion = {
      id: Date.now(),
      text: "Hello, how are you?", // This would be replaced with actual conversion
      timestamp: new Date().toLocaleTimeString()
    };
    setConversions(prev => [newConversion, ...prev]);
  };

  const handleConvertToSpeech = () => {
    // Placeholder for speech conversion logic
    console.log('Converting to speech...');
  };

  const clearConversions = () => {
    setConversions([]);
  };

  const copyToClipboard = async (text: string, id: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 p-8 transition-colors duration-200">
      <div className="max-w-7xl mx-auto relative">
        <button
          onClick={toggleDarkMode}
          className="absolute right-0 top-0 p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {isDarkMode ? (
            <Sun className="w-6 h-6" />
          ) : (
            <Moon className="w-6 h-6" />
          )}
        </button>

        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-900 dark:text-blue-100 mb-2">Sign Language Converter</h1>
          <p className="text-gray-600 dark:text-gray-400">Convert sign language to text or speech in real-time</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
              <div className="relative aspect-video mb-6 bg-gray-900 rounded-lg overflow-hidden">
                {!isStreaming && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                    <Camera className="w-12 h-12 mb-4" />
                    <button
                      onClick={startCamera}
                      className="bg-blue-500 hover:bg-blue-600 px-6 py-2 rounded-lg transition-colors"
                    >
                      Start Camera
                    </button>
                  </div>
                )}
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className={`w-full h-full object-cover ${!isStreaming ? 'hidden' : ''}`}
                />
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/50 rounded-lg flex items-center text-red-700 dark:text-red-200">
                  <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              <div className="flex gap-4 justify-center">
                <button
                  onClick={handleConvertToText}
                  disabled={!isStreaming}
                  className="flex items-center px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Type className="w-5 h-5 mr-2" />
                  Convert to Text
                </button>
                <button
                  onClick={handleConvertToSpeech}
                  disabled={!isStreaming}
                  className="flex items-center px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Volume2 className="w-5 h-5 mr-2" />
                  Convert to Speech
                </button>
              </div>

              {isStreaming && (
                <div className="mt-6 text-center">
                  <button
                    onClick={stopCamera}
                    className="text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-colors"
                  >
                    Stop Camera
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Conversions</h2>
              {conversions.length > 0 && (
                <button
                  onClick={clearConversions}
                  className="text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                  title="Clear all conversions"
                >
                  <Trash className="w-5 h-5" />
                </button>
              )}
            </div>
            
            {conversions.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Type className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No conversions yet</p>
                <p className="text-sm">Start converting to see the results here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {conversions.map(conversion => (
                  <div
                    key={conversion.id}
                    className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg group relative"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="text-gray-900 dark:text-gray-100">{conversion.text}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{conversion.timestamp}</p>
                      </div>
                      <button
                        onClick={() => copyToClipboard(conversion.text, conversion.id)}
                        className="ml-2 p-2 text-gray-400 dark:text-gray-500 hover:text-blue-500 dark:hover:text-blue-400 transition-colors rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"
                        title="Copy text"
                      >
                        {copiedId === conversion.id ? (
                          <Check className="w-4 h-4 text-green-500 dark:text-green-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;