export interface Agent {
  id: string;
  hostname: string;
  ip: string;
  os: string;
  isActive: boolean;
  lastSeen: string;
}

export interface Command {
  id: string;
  command: string;
  timestamp: Date;
  status: 'queued' | 'success' | 'error';
  output: string;
  agent: string;
}
