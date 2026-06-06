import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Shield, Radio, Activity, Server, Play, Square, AlertTriangle, CheckCircle, Wifi, Map, SunMoon, Network } from 'lucide-react';

const API_BASE = 'http://127.0.0.1:8000/api';

export default function App() {
  // Engine State
  const [engineRunning, setEngineRunning] = useState(false);
  const [radarEvents, setRadarEvents] = useState([]);
  const [spiderLogs, setSpiderLogs] = useState([]);
  const [systemStatus, setSystemStatus] = useState('IDLE');
  const [error, setError] = useState(null);

  // Mission Control State
  const [scenario, setScenario] = useState('RANDOM');
  const [spiderIp, setSpiderIp] = useState('192.168.1.100');
  const [uploadStatus, setUploadStatus] = useState('');

  // Poll data from the backend every 2 seconds if the engine is running
  useEffect(() => {
    let interval = null;

    const fetchData = async () => {
      try {
        const [eventsRes, logsRes] = await Promise.all([
          axios.get(`${API_BASE}/radar/events`),
          axios.get(`${API_BASE}/spider/logs`)
        ]);
        setRadarEvents(eventsRes.data);
        setSpiderLogs(logsRes.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching engine data:", err);
        setError("Lost connection to FastAPI Backend. Ensure Uvicorn is running.");
      }
    };

    if (engineRunning) {
      setSystemStatus('RUNNING');
      interval = setInterval(fetchData, 2000);
      fetchData(); // Initial call
    } else {
      setSystemStatus('IDLE');
      if (interval) clearInterval(interval);
    }

    return () => { if (interval) clearInterval(interval); };
  }, [engineRunning]);

  // Handle KML File Upload
  const handleUploadKML = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    setUploadStatus('Uploading...');

    try {
      await axios.post(`${API_BASE}/kml/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUploadStatus('KML Active');
      setTimeout(() => setUploadStatus(''), 3000);
    } catch (err) {
      console.error(err);
      setUploadStatus('Upload Failed');
    }
  };

  // Handle Engine Start based on Selected Scenario
  const handleStartEngine = async () => {
    try {
      let endpoint = `${API_BASE}/radar/start`;
      if (scenario === 'DAY') endpoint = `${API_BASE}/radar/scenario/day`;
      if (scenario === 'NIGHT') endpoint = `${API_BASE}/radar/scenario/night`;

      await axios.post(endpoint);
      setEngineRunning(true);
      setError(null);
    } catch (err) {
      if (err.response && err.response.status === 400) {
        setEngineRunning(true); // Already running
      } else {
        setError(`Failed to start ${scenario} scenario.`);
      }
    }
  };

  const handleStopEngine = async () => {
    try {
      await axios.post(`${API_BASE}/radar/stop`);
      setEngineRunning(false);
      setRadarEvents([]);
    } catch (err) {
      setError("Failed to stop radar engine.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased">
      {/* Top Header Navigation */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Shield className="w-8 h-8 text-emerald-400 animate-pulse" />
          <div>
            <h1 className="text-xl font-bold tracking-wider text-white">SIMCORE C2</h1>
            <p className="text-xs text-slate-400 font-mono">RADAR TRACKING & TRANSMISSION NETWORK</p>
          </div>
        </div>

        {/* Engine Master Controls */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-md bg-slate-950 border border-slate-800 font-mono text-xs">
            <span className={`w-2 h-2 rounded-full ${engineRunning ? 'bg-emerald-500 animate-ping' : 'bg-amber-500'}`}></span>
            <span className="text-slate-300">ENGINE: {systemStatus}</span>
          </div>

          {!engineRunning ? (
            <button
              onClick={handleStartEngine}
              className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-6 py-2 rounded transition-colors text-sm cursor-pointer shadow-lg shadow-emerald-900/20"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>ENGAGE SYSTEM</span>
            </button>
          ) : (
            <button
              onClick={handleStopEngine}
              className="flex items-center space-x-2 bg-rose-600 hover:bg-rose-500 text-white font-medium px-6 py-2 rounded transition-colors text-sm cursor-pointer shadow-lg shadow-rose-900/20"
            >
              <Square className="w-4 h-4 fill-current" />
              <span>ABORT SIMULATION</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="p-6 space-y-6 max-w-[1600px] mx-auto">
        {error && (
          <div className="bg-rose-950/40 border border-rose-800 text-rose-200 px-4 py-3 rounded flex items-center space-x-3 text-sm font-mono">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* NEW: Mission Control Bar */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg flex flex-wrap items-center justify-between gap-6 shadow-sm">
          {/* KML Upload */}
          <div className="flex items-center space-x-3">
            <Map className="w-5 h-5 text-slate-400" />
            <div className="flex flex-col">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Geography Engine</span>
              <div className="flex items-center space-x-2 mt-1">
                <input 
                  type="file" 
                  accept=".kml" 
                  onChange={handleUploadKML} 
                  disabled={engineRunning}
                  className="text-sm font-mono text-slate-300 file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-bold file:bg-slate-800 file:text-cyan-400 hover:file:bg-slate-700 cursor-pointer disabled:opacity-50"
                />
                {uploadStatus && <span className="text-xs font-mono text-emerald-400">{uploadStatus}</span>}
              </div>
            </div>
          </div>

          {/* Scenario Selector */}
          <div className="flex items-center space-x-3">
            <SunMoon className="w-5 h-5 text-slate-400" />
            <div className="flex flex-col">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Scenario Profile</span>
              <select 
                value={scenario} 
                onChange={(e) => setScenario(e.target.value)} 
                disabled={engineRunning}
                className="mt-1 bg-slate-950 border border-slate-800 text-sm font-mono text-slate-200 py-1.5 px-3 rounded focus:border-cyan-500 focus:outline-none disabled:opacity-50"
              >
                <option value="RANDOM">Mode: RANDOM (Default)</option>
                <option value="DAY">Mode: DAY (Low Traffic)</option>
                <option value="NIGHT">Mode: NIGHT (High Uncertainty)</option>
              </select>
            </div>
          </div>

          {/* SPIDER IP Target */}
          <div className="flex items-center space-x-3">
            <Network className="w-5 h-5 text-slate-400" />
            <div className="flex flex-col">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">SPIDER Target IP</span>
              <input 
                type="text" 
                value={spiderIp} 
                onChange={(e) => setSpiderIp(e.target.value)} 
                placeholder="192.168.1.100" 
                className="mt-1 bg-slate-950 border border-slate-800 text-sm font-mono text-emerald-400 py-1.5 px-3 rounded w-40 focus:outline-none focus:border-emerald-500" 
              />
            </div>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg flex items-center space-x-4">
            <Radio className="w-10 h-10 text-indigo-400" />
            <div>
              <p className="text-xs font-mono text-slate-400 uppercase">Active Targets</p>
              <p className="text-2xl font-bold text-white">{radarEvents.length}</p>
            </div>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg flex items-center space-x-4">
            <Wifi className="w-10 h-10 text-emerald-400" />
            <div>
              <p className="text-xs font-mono text-slate-400 uppercase">Target Address</p>
              <p className="text-lg font-bold text-emerald-400 font-mono">{spiderIp}</p>
            </div>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg flex items-center space-x-4">
            <Activity className="w-10 h-10 text-cyan-400" />
            <div>
              <p className="text-xs font-mono text-slate-400 uppercase">Total Transmissions</p>
              <p className="text-2xl font-bold text-white">{spiderLogs.length}</p>
            </div>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg flex items-center space-x-4">
            <Server className="w-10 h-10 text-amber-400" />
            <div>
              <p className="text-xs font-mono text-slate-400 uppercase">Data Sinks</p>
              <p className="text-lg font-bold text-white">PostgreSQL/PostGIS</p>
            </div>
          </div>
        </div>

        {/* Data Stream Workspace */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          
          {/* Panel 1: Live Radar Tracks */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden flex flex-col h-[550px]">
            <div className="bg-slate-850 border-b border-slate-800 px-4 py-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold tracking-wide text-slate-200 uppercase font-mono flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                <span>Live Physics Tracks (PostGIS Feed)</span>
              </h2>
            </div>
            
            <div className="p-4 overflow-y-auto flex-1 font-mono text-xs">
              {radarEvents.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-2">
                  <Radio className="w-8 h-8 opacity-40" />
                  <p>No active feeds. Configure mission and engage system.</p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-slate-400 border-b border-slate-800 pb-2">
                      <th className="pb-2 font-medium">TRACK ID</th>
                      <th className="pb-2 font-medium">TYPE</th>
                      <th className="pb-2 font-medium">COORDINATES</th>
                      <th className="pb-2 font-medium">SPEED</th>
                      <th className="pb-2 font-medium">HEADING</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40">
                    {radarEvents.map((ev, idx) => (
                      <tr key={idx} className="hover:bg-slate-850/50 transition-colors">
                        <td className="py-2.5 text-cyan-400 max-w-[100px] truncate">{ev.track_id}</td>
                        <td className="py-2.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${ev.event_type === 'VEHICLE' ? 'bg-indigo-950 border border-indigo-800 text-indigo-300' : 'bg-teal-950 border border-teal-800 text-teal-300'}`}>
                            {ev.event_type}
                          </span>
                        </td>
                        <td className="py-2.5 text-slate-300">{ev.latitude.toFixed(5)}, {ev.longitude.toFixed(5)}</td>
                        <td className="py-2.5 text-amber-400 font-bold">{ev.speed} km/h</td>
                        <td className="py-2.5 text-slate-400">{ev.direction}°</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Panel 2: SPIDER Transmission Telemetry */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden flex flex-col h-[550px]">
            <div className="bg-slate-850 border-b border-slate-800 px-4 py-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold tracking-wide text-slate-200 uppercase font-mono flex items-center space-x-2">
                <Wifi className="w-4 h-4 text-emerald-400" />
                <span>SPIDER Telemetry (Routing to: {spiderIp})</span>
              </h2>
            </div>
            
            <div className="p-4 overflow-y-auto flex-1 font-mono text-xs space-y-2">
              {spiderLogs.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-2">
                  <Server className="w-8 h-8 opacity-40" />
                  <p>Network logs clear. Waiting for target generation...</p>
                </div>
              ) : (
                spiderLogs.map((log) => (
                  <div 
                    key={log.transmission_id} 
                    className={`p-2.5 rounded border flex items-start justify-between ${log.status === 'SUCCESS' ? 'bg-emerald-950/20 border-emerald-900/60 text-emerald-300' : 'bg-rose-950/20 border-rose-900/60 text-rose-300'}`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-200">TX ID:</span>
                        <span className="text-slate-400 select-all">{log.transmission_id.substring(0, 8)}...</span>
                        <span className="text-slate-500">|</span>
                        <span className="font-bold text-slate-200">EVENT ID:</span>
                        <span className="text-slate-400 select-all">
                          {log.event_id ? `${log.event_id.substring(0, 8)}...` : 'NULL'}
                        </span>
                      </div>
                      <p className="text-[11px] opacity-90 font-sans">
                        {log.response} (Routed to {spiderIp})
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-1.5 uppercase font-bold text-[10px] px-2 py-0.5 rounded bg-slate-950/60 border border-slate-800">
                      {log.status === 'SUCCESS' ? (
                        <>
                          <CheckCircle className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">TRANSMITTED</span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-3 h-3 text-rose-400 animate-pulse" />
                          <span className="text-rose-400">DROPPED</span>
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}