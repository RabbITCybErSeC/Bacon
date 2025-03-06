import React, { useState, useEffect, useCallback } from 'react';
import { Loader2, Terminal, Send, RefreshCw, Server, Clock, CheckCircle, XCircle } from 'lucide-react';

const API_BASE_URL = 'http://localhost:8080/api';

export default function AgentDashboard() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [command, setCommand] = useState('');
  const [commandHistory, setCommandHistory] = useState([]);
  const [refreshInterval, setRefreshInterval] = useState(10);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);

  const fetchAgents = useCallback(async () => {
    setRefreshing(true);
    try {
      const response = await fetch(`${API_BASE_URL}/agents`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setAgents(data);

      // If currently selected agent exists in new data, update it
      if (selectedAgent) {
        const updatedAgent = data.find(a => a.id === selectedAgent.id);
        if (updatedAgent) {
          setSelectedAgent(updatedAgent);
        }
      }

      setLastRefresh(new Date());
    } catch (error) {
      console.error('Error fetching agents:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedAgent]);

  // Initial fetch and setup refresh interval
  useEffect(() => {
    fetchAgents();

    const interval = setInterval(() => {
      fetchAgents();
    }, refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [fetchAgents, refreshInterval]);

  const handleSendCommand = async () => {
    if (!selectedAgent || !command.trim()) return;

    try {
      const response = await fetch(`${API_BASE_URL}/command?id=${selectedAgent.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ command }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setCommandHistory(prev => [{
        id: data.id,
        command,
        timestamp: new Date(),
        status: 'queued',
        output: '',
        agent: selectedAgent.id
      }, ...prev]);

      setCommand('');

      // Refresh agents to see updated queue
      setTimeout(fetchAgents, 500);
    } catch (error) {
      console.error('Error sending command:', error);
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString();
  };

  const getTimeSinceLastSeen = (lastSeen) => {
    const seconds = Math.floor((new Date() - new Date(lastSeen)) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
  };

  if (loading) {
    return (
      <div className= "flex items-center justify-center h-screen" >
      <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2" > Loading agent data...</span>
          </div>
    );
  }

  return (
    <div className= "flex flex-col h-screen max-h-screen bg-gray-100" >
    <header className="bg-blue-600 text-white p-4 shadow-md" >
      <div className="flex justify-between items-center" >
        <h1 className="text-2xl font-bold flex items-center" >
          <Server className="mr-2" /> Agent Management Dashboard
            </h1>
            < div className = "flex items-center space-x-2" >
              <span className="text-sm" > Auto - refresh: </span>
                < select
  value = { refreshInterval }
  onChange = {(e) => setRefreshInterval(Number(e.target.value))
}
className = "text-black rounded text-sm p-1"
  >
  <option value="5" > 5s </option>
    < option value = "10" > 10s </option>
      < option value = "30" > 30s </option>
        < option value = "60" > 60s </option>
          </select>
          < button
onClick = { fetchAgents }
className = "flex items-center bg-blue-700 py-1 px-3 rounded hover:bg-blue-800"
disabled = { refreshing }
  >
  <RefreshCw className={ `h-4 w-4 mr-1 ${refreshing ? 'animate-spin' : ''}` } />
Refresh
  </button>
  </div>
  </div>
  < div className = "text-sm mt-1 flex items-center" >
    <Clock className="h-4 w-4 mr-1" />
      Last updated: { formatTime(lastRefresh) } | { agents.length } agents found
        </div>
        </header>

        < div className = "flex flex-1 overflow-hidden" >
          {/* Agent List Panel */ }
          < div className = "w-1/3 p-4 overflow-auto border-r border-gray-300 bg-white" >
            <h2 className="text-lg font-medium mb-4" > Connected Agents </h2>

{
  agents.length === 0 ? (
    <div className= "text-center text-gray-500 mt-8" > No agents connected </div>
          ) : (
    <div className= "space-y-2" >
    {
      agents.map(agent => (
        <div 
                  key= { agent.id } 
                  className = {`p-3 rounded border cursor-pointer transition-colors ${selectedAgent?.id === agent.id
          ? 'bg-blue-100 border-blue-300'
          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
          }`}
  onClick = {() => setSelectedAgent(agent)
}
                >
  <div className="flex justify-between items-center" >
    <h3 className="font-medium" > { agent.hostname } </h3>
      < div className = {`flex items-center text-sm ${agent.isActive ? 'text-green-600' : 'text-red-600'}`}>
      {
        agent.isActive
          ? <><CheckCircle className="h-4 w-4 mr-1" /> Active</ > 
                        : <> <XCircle className="h-4 w-4 mr-1" /> Inactive </>}
</div>
  </div>
  < div className = "mt-1 text-sm text-gray-500" > ID: { agent.id.substring(0, 8) }...</div>
    < div className = "flex justify-between mt-1 text-sm" >
      <span>IP: { agent.ip } </span>
        < span > OS: { agent.os } </span>
          </div>
          < div className = "text-xs text-gray-400 mt-1" >
            Last seen: { getTimeSinceLastSeen(agent.lastSeen) }
</div>
  </div>
              ))}
</div>
          )}
</div>

{/* Command Panel */ }
<div className="flex-1 flex flex-col p-4 overflow-hidden" >
{
  selectedAgent?(
            <>
  <div className="bg-gray-200 p-3 rounded mb-4" >
    <h2 className="font-medium" > Selected Agent: { selectedAgent.hostname } </h2>
      < div className = "text-sm text-gray-600" > ID: { selectedAgent.id } </div>
        </div>

{/* Command Input */ }
<div className="flex mb-4" >
  <div className="flex-1 flex items-center bg-white border border-gray-300 rounded-l px-3" >
    <Terminal className="h-5 w-5 text-gray-400 mr-2" />
      <input
                    type="text"
value = { command }
onChange = {(e) => setCommand(e.target.value)}
onKeyDown = {(e) => e.key === 'Enter' && handleSendCommand()}
placeholder = "Enter command to execute..."
className = "flex-1 p-2 outline-none"
  />
  </div>
  < button
onClick = { handleSendCommand }
disabled = {!command.trim()}
className = "bg-blue-600 text-white px-4 py-2 rounded-r flex items-center hover:bg-blue-700 disabled:bg-blue-300"
  >
  <Send className="h-4 w-4 mr-2" /> Send
    </button>
    </div>

{/* Command History */ }
<h3 className="font-medium mb-2" > Command History </h3>
  < div className = "flex-1 overflow-auto bg-white border border-gray-200 rounded" >
    {
      commandHistory.length === 0 ? (
        <div className= "text-center text-gray-500 p-8" >
        No commands have been sent yet
        </ div >
                ) : (
  <div className= "divide-y divide-gray-200" >
  {
    commandHistory.map(cmd => (
      <div key= { cmd.id } className = "p-3" >
      <div className="flex justify-between items-center" >
    <div className="font-mono bg-gray-100 text-sm p-1 rounded" >
    $ { cmd.command }
    </div>
    < div className = "flex items-center space-x-3 text-sm" >
    <span>{ formatTime(cmd.timestamp)
  } </span>
  < span className = {`px-2 py-1 rounded ${cmd.status === 'success' ? 'bg-green-100 text-green-800' :
    cmd.status === 'error' ? 'bg-red-100 text-red-800' :
      'bg-yellow-100 text-yellow-800'
    }`}>
      { cmd.status }
      </span>
      </div>
      </div>
{
  cmd.output && (
    <div className="mt-2 bg-black text-green-400 p-2 rounded font-mono text-sm whitespace-pre-wrap" >
      { cmd.output }
      </div>
                        )
}
</div>
                    ))}
</div>
                )}
</div>
  </>
          ) : (
  <div className= "flex items-center justify-center h-full text-gray-500" >
  Select an agent from the list to send commands
    </div>
          )}
</div>
  </div>
  </div>
  );
}
