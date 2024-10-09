import React, { useState, useEffect } from 'react';
import { Flag, X, Key, Trash2 } from 'lucide-react';

function App() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [newApiKey, setNewApiKey] = useState('');
  const [flaggedTweets, setFlaggedTweets] = useState<{ id: string; text: string }[]>([]);

  useEffect(() => {
    chrome.storage.local.get(['apiKey', 'flaggedTweets'], (result) => {
      setApiKey(result.apiKey || null);
      setFlaggedTweets(result.flaggedTweets || []);
    });
  }, []);

  const handleSaveApiKey = () => {
    chrome.storage.local.set({ apiKey: newApiKey }, () => {
      setApiKey(newApiKey);
      setNewApiKey('');
    });
  };

  const handleClearApiKey = () => {
    chrome.storage.local.remove('apiKey', () => {
      setApiKey(null);
    });
  };

  const handleIgnore = (id: string) => {
    const updatedTweets = flaggedTweets.filter((tweet) => tweet.id !== id);
    setFlaggedTweets(updatedTweets);
    chrome.storage.local.set({ flaggedTweets: updatedTweets });
  };

  const handleBlockAndReport = (id: string) => {
    chrome.runtime.sendMessage({ action: 'blockAndReport', tweetId: id });
    handleIgnore(id);
  };

  if (!apiKey) {
    return (
      <div className="w-96 p-6 bg-gradient-to-br from-purple-600 to-blue-500 text-white rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold mb-6">OnlyHumans</h1>
        <p className="mb-4">Please enter your OpenAI API key to start detecting AI-generated tweets:</p>
        <input
          type="password"
          value={newApiKey}
          onChange={(e) => setNewApiKey(e.target.value)}
          className="w-full p-2 mb-4 rounded text-gray-800"
          placeholder="Enter your API key"
        />
        <button
          onClick={handleSaveApiKey}
          className="w-full py-2 bg-green-500 hover:bg-green-600 rounded font-bold transition duration-200"
        >
          Save API Key
        </button>
      </div>
    );
  }

  return (
    <div className="w-96 p-6 bg-gradient-to-br from-purple-600 to-blue-500 text-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold mb-6">OnlyHumans</h1>
      <div className="mb-6 flex items-center justify-between">
        <p className="flex items-center">
          <Key size={20} className="mr-2" />
          API Key: ••••••••••••
        </p>
        <button
          onClick={handleClearApiKey}
          className="flex items-center bg-red-500 hover:bg-red-600 px-3 py-1 rounded transition duration-200"
        >
          <Trash2 size={16} className="mr-1" /> Clear API Key
        </button>
      </div>
      {flaggedTweets.length === 0 ? (
        <p>No flagged tweets at the moment.</p>
      ) : (
        <ul className="space-y-4">
          {flaggedTweets.map((tweet) => (
            <li key={tweet.id} className="bg-white bg-opacity-10 p-3 rounded shadow">
              <p className="mb-2 text-sm">{tweet.text}</p>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => handleIgnore(tweet.id)}
                  className="px-2 py-1 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 flex items-center transition duration-200"
                >
                  <X size={16} className="mr-1" /> Ignore
                </button>
                <button
                  onClick={() => handleBlockAndReport(tweet.id)}
                  className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 flex items-center transition duration-200"
                >
                  <Flag size={16} className="mr-1" /> Block & Report
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;