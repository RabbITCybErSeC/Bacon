// src/components/CommandPanel.tsx
import { useState } from 'react';
import { Terminal, Send } from 'lucide-react';
import { Agent, Command } from '../types/Types';

interface CommandPanelProps {
  selectedAgent: Agent | null;
  commandHistory: Command[];
  setCommandHistory: (history: Command[]) => void;
  fetchAgents: () => Promise<void>;
}

const API_BASE_URL = 'http://localhost:8080/api';

export function CommandPanel({ selectedAgent, commandHistory, setCommandHistory, fetchAgents }: CommandPanelProps) {
  const [command, setCommand] = useState<string>('');

  const handleSendCommand = async () => {
    if (!selectedAgent || !command.trim()) return;

    try {
      const response = await fetch(`${API_BASE_URL}/command?id=${selectedAgent.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command }),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      setCommandHistory([{
        id: data.id,
        command,
        timestamp: new Date(),
        status: 'queued',
        output: '',
        agent: selectedAgent.id
      }, ...commandHistory]);

      setCommand('');
      setTimeout(fetchAgents, 500);
    } catch (error) {
      console.error('Error sending command:', error);
    }
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString();
  };

  return (
    <div className="flex-1 flex flex-col p-4 overflow-hidden">
      {selectedAgent ? (
        <>
          <div className="bg-gray-200 p-3 rounded mb-4">
            <h2 className="font-medium">Selected Agent: {selectedAgent.hostname}</h2>
            <div className="text-sm text-gray-600">ID: {selectedAgent.id}</div>
          </div>

          <div className="flex mb-4">
            <div className="flex-1 flex items-center bg-white border border-gray-300 rounded-l px-3">
              <Terminal className="h-5 w-5 text-gray-400 mr-2" />
              <input
                type="text"
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendCommand()}
                placeholder="Enter command to execute..."
                className="flex-1 p-2 outline-none"
              />
            </div>
            <button
              onClick={handleSendCommand}
              disabled={!command.trim()}
              className="bg-blue-600 text-white px-4 py-2 rounded-r flex items-center hover:bg-blue-700 disabled:bg-blue-300"
            >
              <Send className="h-4 w-4 mr-2" /> Send
            </button>
          </div>

          <h3 className="font-medium mb-2">Command History</h3>
          <div className="flex-1 overflow-auto bg-white border border-gray-200 rounded">
            {commandHistory.length === 0 ? (
              <div className="text-center text-gray-500 p-8">
                No commands have been sent yet
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {commandHistory.map(cmd => (
                  <div key={cmd.id} className="p-3">
                    <div className="flex justify-between items-center">
                      <div className="font-mono bg-gray-100 text-sm p-1 rounded">
                        $ {cmd.command}
                      </div>
                      <div className="flex items-center space-x-3 text-sm">
                        <span>{formatTime(cmd.timestamp)}</span>
                        <span className={`px-2 py-1 rounded ${cmd.status === 'success' ? 'bg-green-100 text-green-800' :
                          cmd.status === 'error' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                          {cmd.status}
                        </span>
                      </div>
                    </div>
                    {cmd.output && (
                      <div className="mt-2 bg-black text-green-400 p-2 rounded font-mono text-sm whitespace-pre-wrap">
                        {cmd.output}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="flex items-center justify-center h-full text-gray-500">
          Select an agent from the list to send commands
        </div>
      )}
    </div>
  );
}
