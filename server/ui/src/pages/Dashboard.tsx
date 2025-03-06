import { useState, useEffect, useCallback } from 'react';
import { Loader2, Server, Clock, RefreshCw } from 'lucide-react';
import { AgentList } from '../components/AgentList';
import { CommandPanel } from '../components/CommandPanel.tsx';
import { Agent, Command } from '../types/Types';

const API_BASE_URL = 'http://localhost:8080/api';

export default function AgentDashboard() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [commandHistory, setCommandHistory] = useState<Command[]>([]);
  const [refreshInterval, setRefreshInterval] = useState<number>(10);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const fetchAgents = useCallback(async () => {
    setRefreshing(true);
    try {
      const response = await fetch(`${API_BASE_URL}/agents`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data: Agent[] = await response.json();
      setAgents(data);

      if (selectedAgent) {
        const updatedAgent = data.find(a => a.id === selectedAgent.id);
        if (updatedAgent) setSelectedAgent(updatedAgent);
      }

      setLastRefresh(new Date());
    } catch (error) {
      console.error('Error fetching agents:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedAgent]);

  useEffect(() => {
    fetchAgents();
    const interval = setInterval(fetchAgents, refreshInterval * 1000);
    return () => clearInterval(interval);
  }, [fetchAgents, refreshInterval]);

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2">Loading agent data...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen max-h-screen bg-gray-100">
      <header className="bg-blue-600 text-white p-4 shadow-md">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold flex items-center">
            <Server className="mr-2" /> Agent Management Dashboard
          </h1>
          <div className="flex items-center space-x-2">
            <span className="text-sm">Auto-refresh: </span>
            <select
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
              className="text-black rounded text-sm p-1"
            >
              <option value="5">5s</option>
              <option value="10">10s</option>
              <option value="30">30s</option>
              <option value="60">60s</option>
            </select>
            <button
              onClick={fetchAgents}
              className="flex items-center bg-blue-700 py-1 px-3 rounded hover:bg-blue-800"
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
        <div className="text-sm mt-1 flex items-center">
          <Clock className="h-4 w-4 mr-1" />
          Last updated: {formatTime(lastRefresh)} | {agents.length} agents found
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <AgentList
          agents={agents}
          selectedAgent={selectedAgent}
          setSelectedAgent={setSelectedAgent}
        />
        <CommandPanel
          selectedAgent={selectedAgent}
          commandHistory={commandHistory}
          setCommandHistory={setCommandHistory}
          fetchAgents={fetchAgents}
        />
      </div>
    </div>
  );
}
