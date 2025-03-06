// src/components/AgentList.tsx
import { Agent } from '../types';

interface AgentListProps {
  agents: Agent[];
  selectedAgent: Agent | null;
  setSelectedAgent: (agent: Agent) => void;
}

export function AgentList({ agents, selectedAgent, setSelectedAgent }: AgentListProps) {
  const getTimeSinceLastSeen = (lastSeen: string): string => {
    const seconds = Math.floor((new Date() - new Date(lastSeen)) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
  };

  return (
    <div className="w-1/3 p-4 overflow-auto border-r border-gray-300 bg-white">
      <h2 className="text-lg font-medium mb-4">Connected Agents</h2>
      {agents.length === 0 ? (
        <div className="text-center text-gray-500 mt-8">No agents connected</div>
      ) : (
        <div className="space-y-2">
          {agents.map(agent => (
            <div
              key={agent.id}
              className={`p-3 rounded border cursor-pointer transition-colors ${selectedAgent?.id === agent.id
                  ? 'bg-blue-100 border-blue-300'
                  : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                }`}
              onClick={() => setSelectedAgent(agent)}
            >
              <div className="flex justify-between items-center">
                <h3 className="font-medium">{agent.hostname}</h3>
                <div className={`flex items-center text-sm ${agent.isActive ? 'text-green-600' : 'text-red-600'}`}>
                  {agent.isActive ? 'Active' : 'Inactive'}
                </div>
              </div>
              <div className="mt-1 text-sm text-gray-500">ID: {agent.id.substring(0, 8)}...</div>
              <div className="flex justify-between mt-1 text-sm">
                <span>IP: {agent.ip}</span>
                <span>OS: {agent.os}</span>
              </div>
              <div className="text-xs text-gray-400 mt-1">
                Last seen: {getTimeSinceLastSeen(agent.lastSeen)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
