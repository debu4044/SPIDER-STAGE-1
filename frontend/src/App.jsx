import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Shield, Radio, Activity, Server, Play, Square, AlertTriangle, CheckCircle, Wifi, Map, SunMoon, Network, Menu, LayoutDashboard, Sliders, BellDot, MapPinned, Settings, CalendarClock, ActivitySquare, FileOutput } from 'lucide-react';

const API_BASE = 'http://127.0.0.1:8000/api';

// ==========================================
// VIEW 1: SCENARIO BUILDER (Work in Progress)
// ==========================================
// ==========================================
// VIEW 1: SCENARIO BUILDER 
// ==========================================
const ScenarioBuilderView = ({ handleUploadKML, uploadStatus }) => {
  const [formData, setFormData] = useState({
    name: '',
    severity: 'MEDIUM',
    buffer: '0',
    rate: 50,
    sensors: { RADAR: true, PIDS: false, ACS: false, VIDEO_ANALYTICS: false, CCTV_HEALTH: false }
  });

  const handleSensorToggle = (sensor) => {
    setFormData(prev => ({ ...prev, sensors: { ...prev.sensors, [sensor]: !prev.sensors[sensor] } }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      alert("MISSION ABORT: Please provide a Custom Scenario Name.");
      return;
    }
    
    try {
      const response = await axios.post('http://127.0.0.1:8000/api/scenarios/create', formData);
      alert("SUCCESS: " + response.data.message);
      
      // Optional: Clear the form after a successful save
      setFormData({
        name: '', severity: 'MEDIUM', buffer: '0', rate: 50,
        sensors: { RADAR: true, PIDS: false, ACS: false, VIDEO_ANALYTICS: false, CCTV_HEALTH: false }
      });
    } catch (err) {
      if (err.response && err.response.data) {
        alert("ERROR: " + err.response.data.detail);
      } else {
        alert("ERROR: Failed to reach the FastAPI backend.");
      }
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-[1200px] mx-auto">
      <div className="border-b border-slate-800 pb-4 flex justify-between items-end">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <Sliders className="w-6 h-6 text-emerald-400" />
            <span>Scenario Builder</span>
          </h2>
          <p className="text-slate-400 text-sm mt-1">Configure advanced multi-sensor simulations and operational parameters.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: Geography & Basics */}
        <div className="xl:col-span-1 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4 shadow-sm">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-2 border-b border-slate-800 pb-2">
              <Map className="w-4 h-4 text-cyan-400" />
              <span>1. Geography Engine</span>
            </h3>
            <div className="space-y-2">
              <label className="text-xs font-mono text-slate-500 uppercase">Active Simulation Area (KML)</label>
              <div className="flex flex-col space-y-2">
                <input 
                  type="file" accept=".kml,.xml" onChange={handleUploadKML} 
                  className="w-full text-sm font-mono text-slate-300 file:mr-3 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:font-bold file:bg-slate-950 file:text-cyan-400 file:border file:border-slate-800 hover:file:bg-slate-800 cursor-pointer"
                />
                {uploadStatus && <span className="text-xs font-mono text-emerald-400 bg-emerald-950/30 px-2 py-1 rounded border border-emerald-900/50 inline-block w-max">{uploadStatus}</span>}
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed mt-2">Upload a valid KML polygon. All target generation and sensor alerts will be mathematically constrained to this physical boundary.</p>
            </div>
            
            <div className="space-y-2 pt-2">
              <label className="text-xs font-mono text-slate-500 uppercase">Perimeter Buffer Zone</label>
              <select 
                value={formData.buffer} onChange={(e) => setFormData({...formData, buffer: e.target.value})}
                className="w-full bg-slate-950 border border-slate-800 text-sm font-mono text-slate-200 py-2 px-3 rounded focus:border-cyan-500 focus:outline-none"
              >
                <option value="0">Strict Boundary (0m)</option>
                <option value="50">Outer Buffer (50m)</option>
                <option value="100">Outer Buffer (100m)</option>
                <option value="250">Outer Buffer (250m)</option>
                <option value="500">Outer Buffer (500m)</option>
                <option value="1000">Outer Buffer (1000m)</option>
              </select>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Sensor & Event Configuration */}
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-2 border-b border-slate-800 pb-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>2. Subsystem & Threat Configuration</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-mono text-slate-500 uppercase">Custom Scenario Name</label>
                <input 
                  type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g., Nighttime Perimeter Breach" 
                  className="w-full bg-slate-950 border border-slate-800 text-sm font-sans text-slate-200 py-2 px-3 rounded focus:outline-none focus:border-emerald-500" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-mono text-slate-500 uppercase">Default Event Severity</label>
                <select 
                  value={formData.severity} onChange={(e) => setFormData({...formData, severity: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 text-sm font-mono text-slate-200 py-2 px-3 rounded focus:border-emerald-500 focus:outline-none"
                >
                  <option value="INFO">INFO (Log Only)</option>
                  <option value="LOW">LOW (Standard Tracking)</option>
                  <option value="MEDIUM">MEDIUM (Suspicious Activity)</option>
                  <option value="HIGH">HIGH (Confirmed Intrusion)</option>
                  <option value="CRITICAL">CRITICAL (System Breach)</option>
                </select>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-mono text-slate-500 uppercase">Active Sensor Subsystems (Multi-Select)</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {Object.keys(formData.sensors).map((sensor) => (
                  <button
                    key={sensor}
                    onClick={() => handleSensorToggle(sensor)}
                    className={`flex items-center space-x-3 p-3 rounded border text-left transition-colors ${
                      formData.sensors[sensor] 
                      ? 'bg-emerald-950/20 border-emerald-500/50 text-emerald-400' 
                      : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded flex items-center justify-center border ${formData.sensors[sensor] ? 'bg-emerald-500 border-emerald-500' : 'border-slate-600'}`}>
                      {formData.sensors[sensor] && <CheckCircle className="w-3 h-3 text-slate-900" />}
                    </div>
                    <span className="text-xs font-bold tracking-wider">{sensor.replace('_', ' ')}</span>
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-end space-x-4">
             <button onClick={() => setFormData({...formData, name: ''})} className="px-6 py-2 rounded text-sm font-medium text-slate-400 hover:text-white transition-colors">
              Reset Form
            </button>
            <button onClick={handleSave} className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-8 py-2.5 rounded transition-colors text-sm shadow-lg shadow-emerald-900/20">
              <Sliders className="w-4 h-4" />
              <span>SAVE SCENARIO TO POSTGRESQL</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

// ==========================================
// VIEW 2: ALERT GENERATOR (Work in Progress)
// ==========================================
// ==========================================
// VIEW 2: ALERT GENERATOR
// ==========================================
const AlertGeneratorView = () => {
  const [alertData, setAlertData] = useState({
    subsystem: 'PIDS',
    event_type: 'Fence Cut',
    severity: 'HIGH',
    count: 1
  });
  const [statusMsg, setStatusMsg] = useState('');

  // The dynamic dictionaries mapped from Stage 2 Specs
  const sensorEvents = {
    RADAR: ["Human Track", "Vehicle Track", "Track Lost", "Zone Entry"],
    PIDS: ["Fence Climb", "Fence Cut", "Fence Touch", "Digging", "Sensor Fault"],
    ACS: ["Access Granted", "Access Denied", "Door Forced Open", "Controller Offline"],
    VIDEO_ANALYTICS: ["Human Detection", "Vehicle Detection", "Line Crossing", "Loitering"],
    CCTV_HEALTH: ["Camera Offline", "Video Loss", "Storage Full", "Stream Failure"]
  };

  const handleSubsystemChange = (e) => {
    const newSub = e.target.value;
    setAlertData({ ...alertData, subsystem: newSub, event_type: sensorEvents[newSub][0] });
  };

  const handleTrigger = async () => {
    setStatusMsg('Injecting packets...');
    try {
      const response = await axios.post(`${API_BASE}/alerts/trigger`, alertData);
      setStatusMsg(response.data.message);
      setTimeout(() => setStatusMsg(''), 4000);
    } catch (err) {
      setStatusMsg(err.response?.data?.detail || "Network Error");
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-[1000px] mx-auto">
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-xl font-bold text-white flex items-center space-x-2">
          <BellDot className="w-6 h-6 text-rose-400 animate-pulse" />
          <span>Alert Generator</span>
        </h2>
        <p className="text-slate-400 text-sm mt-1">Manually inject single or bulk sensor events directly into the active simulation network.</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 shadow-sm space-y-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-mono text-slate-500 uppercase">Target Subsystem</label>
            <select value={alertData.subsystem} onChange={handleSubsystemChange} className="w-full bg-slate-950 border border-slate-800 text-sm font-bold text-slate-200 py-2.5 px-3 rounded focus:border-rose-500 focus:outline-none">
              {Object.keys(sensorEvents).map(sub => <option key={sub} value={sub}>{sub.replace('_', ' ')}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-mono text-slate-500 uppercase">Specific Event Type</label>
            <select value={alertData.event_type} onChange={(e) => setAlertData({...alertData, event_type: e.target.value})} className="w-full bg-slate-950 border border-slate-800 text-sm font-mono text-slate-300 py-2.5 px-3 rounded focus:border-rose-500 focus:outline-none">
              {sensorEvents[alertData.subsystem].map(ev => <option key={ev} value={ev}>{ev}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-mono text-slate-500 uppercase">Threat Severity</label>
            <select value={alertData.severity} onChange={(e) => setAlertData({...alertData, severity: e.target.value})} className="w-full bg-slate-950 border border-slate-800 text-sm font-mono text-slate-300 py-2.5 px-3 rounded focus:border-rose-500 focus:outline-none">
              <option value="INFO">INFO</option>
              <option value="LOW">LOW</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HIGH">HIGH</option>
              <option value="CRITICAL">CRITICAL</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-mono text-slate-500 uppercase">Bulk Generation Count</label>
            <select value={alertData.count} onChange={(e) => setAlertData({...alertData, count: parseInt(e.target.value)})} className="w-full bg-slate-950 border border-rose-900/50 text-sm font-bold text-rose-400 py-2.5 px-3 rounded focus:border-rose-500 focus:outline-none">
              <option value="1">Single Event (1)</option>
              <option value="10">Small Burst (10)</option>
              <option value="100">Stress Test (100)</option>
              <option value="500">Network Flood (500)</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <span className="text-sm font-mono text-emerald-400">{statusMsg}</span>
          <button onClick={handleTrigger} className="flex items-center space-x-2 bg-rose-600 hover:bg-rose-500 text-white font-bold px-8 py-3 rounded transition-colors text-sm shadow-lg shadow-rose-900/20">
            <BellDot className="w-4 h-4" />
            <span>FIRE MANUAL ALERT</span>
          </button>
        </div>

      </div>
    </div>
  );
};

// ==========================================
// VIEW 3: THE LIVE DASHBOARD (Preserved)
// ==========================================
const DashboardView = ({ engineRunning, systemStatus, error, radarEvents, spiderLogs, scenario, setScenario, spiderIp, setSpiderIp, handleStartEngine, handleStopEngine, handleUploadKML, uploadStatus }) => (
  <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
    {error && (
      <div className="bg-rose-950/40 border border-rose-800 text-rose-200 px-4 py-3 rounded flex items-center space-x-3 text-sm font-mono">
        <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" /><span>{error}</span>
      </div>
    )}

    {/* Legacy Mission Controls (Will move to Scenario Builder later) */}
    <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg flex flex-wrap items-center justify-between gap-6 shadow-sm">
      <div className="flex items-center space-x-3">
        <Map className="w-5 h-5 text-slate-400" />
        <div className="flex flex-col">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Geography Engine</span>
          <div className="flex items-center space-x-2 mt-1">
            <input type="file" accept=".kml,.xml" onChange={handleUploadKML} disabled={engineRunning} className="text-sm font-mono text-slate-300 file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-bold file:bg-slate-800 file:text-cyan-400 hover:file:bg-slate-700 cursor-pointer disabled:opacity-50"/>
            {uploadStatus && <span className="text-xs font-mono text-emerald-400">{uploadStatus}</span>}
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-3">
        <SunMoon className="w-5 h-5 text-slate-400" />
        <div className="flex flex-col">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Scenario Profile</span>
          <select value={scenario} onChange={(e) => setScenario(e.target.value)} disabled={engineRunning} className="mt-1 bg-slate-950 border border-slate-800 text-sm font-mono text-slate-200 py-1.5 px-3 rounded focus:border-cyan-500 focus:outline-none disabled:opacity-50">
            <option value="RANDOM">Mode: RANDOM (Default)</option>
            <option value="DAY">Mode: DAY (Low Traffic)</option>
            <option value="NIGHT">Mode: NIGHT (High Uncertainty)</option>
          </select>
        </div>
      </div>
      <div className="flex items-center space-x-3">
        <Network className="w-5 h-5 text-slate-400" />
        <div className="flex flex-col">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">SPIDER Target IP</span>
          <input type="text" value={spiderIp} onChange={(e) => setSpiderIp(e.target.value)} placeholder="192.168.1.100" className="mt-1 bg-slate-950 border border-slate-800 text-sm font-mono text-emerald-400 py-1.5 px-3 rounded w-40 focus:outline-none focus:border-emerald-500" />
        </div>
      </div>
    </div>

    {/* Metrics */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg flex items-center space-x-4">
        <Radio className="w-10 h-10 text-indigo-400" />
        <div>
          <p className="text-xs font-mono text-slate-400 uppercase">Active Events</p>
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
          <p className="text-lg font-bold text-white">PostGIS Engine</p>
        </div>
      </div>
    </div>

    {/* Data Streams */}
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      {/* Panel 1: Live Events */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden flex flex-col h-[550px]">
        <div className="bg-slate-850 border-b border-slate-800 px-4 py-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold tracking-wide text-slate-200 uppercase font-mono flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            <span>Live Multi-Sensor Events</span>
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
                  <th className="pb-2 font-medium">EVENT ID</th>
                  <th className="pb-2 font-medium">TYPE</th>
                  <th className="pb-2 font-medium">COORDINATES</th>
                  <th className="pb-2 font-medium">SPEED</th>
                  <th className="pb-2 font-medium">HEADING</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {radarEvents.map((ev, idx) => {
                  const isAlert = ev.speed === 0.0;
                  return (
                    <tr key={idx} className="hover:bg-slate-850/50 transition-colors">
                      <td className={`py-2.5 max-w-[100px] truncate ${isAlert ? 'text-rose-400' : 'text-cyan-400'}`}>{ev.track_id}</td>
                      <td className="py-2.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${isAlert ? 'bg-rose-950 text-rose-300 border-rose-800' : ev.event_type.includes('VEHICLE') ? 'bg-indigo-950 text-indigo-300 border-indigo-800' : 'bg-teal-950 text-teal-300 border-teal-800'}`}>
                          {ev.event_type}
                        </span>
                      </td>
                      <td className="py-2.5 text-slate-300">{ev.latitude.toFixed(5)}, {ev.longitude.toFixed(5)}</td>
                      <td className="py-2.5 text-amber-400 font-bold">{ev.speed} km/h</td>
                      <td className="py-2.5 text-slate-400">{ev.direction}°</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Panel 2: SPIDER Telemetry */}
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
              <div key={log.transmission_id} className={`p-2.5 rounded border flex items-start justify-between ${log.status === 'SUCCESS' ? 'bg-emerald-950/20 border-emerald-900/60 text-emerald-300' : log.status === 'FAILED' ? 'bg-rose-950/20 border-rose-900/60 text-rose-300' : 'bg-amber-950/20 border-amber-900/60 text-amber-300'}`}>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-200">PROT:</span>
                    <span className="text-cyan-400 font-bold">{log.protocol}</span>
                    <span className="text-slate-500">|</span>
                    <span className="font-bold text-slate-200">EVENT ID:</span>
                    <span className="text-slate-400 select-all">{log.event_id ? `${log.event_id.substring(0, 8)}...` : 'NULL'}</span>
                  </div>
                  <p className="text-[11px] opacity-90 font-sans">{log.response_code}</p>
                </div>
                <div className="flex items-center space-x-1.5 uppercase font-bold text-[10px] px-2 py-0.5 rounded bg-slate-950/60 border border-slate-800">
                  {log.status === 'SUCCESS' ? (
                    <><CheckCircle className="w-3 h-3 text-emerald-400" /><span className="text-emerald-400">TRANSMITTED</span></>
                  ) : log.status === 'FAILED' ? (
                    <><AlertTriangle className="w-3 h-3 text-rose-400" /><span className="text-rose-400">FAILED</span></>
                  ) : (
                    <><Activity className="w-3 h-3 text-amber-400 animate-spin" /><span className="text-amber-400">RETRIED ({log.retry_count}/3)</span></>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  </div>
);

// ==========================================
// MASTER APP LAYOUT
// ==========================================
export default function App() {
  const [currentView, setCurrentView] = useState('Dashboard');
  
  // Shared Backend State
  const [engineRunning, setEngineRunning] = useState(false);
  const [radarEvents, setRadarEvents] = useState([]);
  const [spiderLogs, setSpiderLogs] = useState([]);
  const [systemStatus, setSystemStatus] = useState('IDLE');
  const [error, setError] = useState(null);
  const [scenario, setScenario] = useState('RANDOM');
  const [spiderIp, setSpiderIp] = useState('192.168.1.100');
  const [uploadStatus, setUploadStatus] = useState('');

  // Main Polling Loop
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
        setError("Lost connection to FastAPI Backend. Ensure Uvicorn is running.");
      }
    };

    if (engineRunning) {
      setSystemStatus('RUNNING');
      interval = setInterval(fetchData, 2000);
      fetchData(); 
    } else {
      setSystemStatus('IDLE');
      if (interval) clearInterval(interval);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [engineRunning]);

  // Global Engine Controls
  const handleUploadKML = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    setUploadStatus('Uploading...');
    try {
      await axios.post(`${API_BASE}/kml/upload`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setUploadStatus('KML Active');
      setTimeout(() => setUploadStatus(''), 3000);
    } catch (err) { setUploadStatus('Upload Failed'); }
  };

  const handleStartEngine = async () => {
    try {
      let endpoint = scenario === 'DAY' ? `${API_BASE}/radar/scenario/day` : scenario === 'NIGHT' ? `${API_BASE}/radar/scenario/night` : `${API_BASE}/radar/start`;
      await axios.post(endpoint);
      setEngineRunning(true);
      setError(null);
    } catch (err) { setError(`Failed to start ${scenario} scenario.`); }
  };

  const handleStopEngine = async () => {
    try {
      await axios.post(`${API_BASE}/radar/stop`);
      setEngineRunning(false);
      setRadarEvents([]);
    } catch (err) { setError("Failed to stop engine."); }
  };

  // Sidebar Menu Configuration based on UI Specs
  const menuItems = [
    { name: 'Scenario Builder', icon: Sliders },
    { name: 'Alert Generator', icon: BellDot },
    { name: 'Map View', icon: MapPinned },
    { name: 'Device Configuration', icon: Settings },
    { name: 'Scheduler', icon: CalendarClock },
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'Stress Test', icon: ActivitySquare },
    { name: 'Reports / Export', icon: FileOutput },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased flex">
      
      {/* LEFT SIDEBAR NAVIGATION */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col hidden md:flex shrink-0">
        <div className="h-16 border-b border-slate-800 flex items-center px-6">
          <Shield className="w-6 h-6 text-emerald-400 mr-2" />
          <span className="font-bold tracking-wider text-lg">SIMCORE</span>
        </div>
        
        <nav className="flex-1 py-4">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.name;
              return (
                <li key={item.name}>
                  <button
                    onClick={() => setCurrentView(item.name)}
                    className={`w-full flex items-center px-6 py-3 text-sm font-medium transition-colors ${
                      isActive 
                        ? 'bg-cyan-950/30 text-cyan-400 border-r-2 border-cyan-400' 
                        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                    }`}
                  >
                    <Icon className={`w-4 h-4 mr-3 ${isActive ? 'text-cyan-400' : 'opacity-70'}`} />
                    {item.name}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* TOP GLOBAL HEADER */}
        <header className="h-16 border-b border-slate-800 bg-slate-900/50 backdrop-blur px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center text-slate-400 md:hidden">
            <Menu className="w-6 h-6" />
          </div>
          <div className="hidden md:block">
            <h1 className="text-sm font-bold text-slate-300 uppercase tracking-widest">{currentView}</h1>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-md bg-slate-950 border border-slate-800 font-mono text-xs">
              <span className={`w-2 h-2 rounded-full ${engineRunning ? 'bg-emerald-500 animate-ping' : 'bg-amber-500'}`}></span>
              <span className="text-slate-300">ENGINE: {systemStatus}</span>
            </div>

            {!engineRunning ? (
              <button onClick={handleStartEngine} className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-4 py-2 rounded transition-colors text-sm shadow-lg shadow-emerald-900/20">
                <Play className="w-4 h-4 fill-current" /><span>ENGAGE SYSTEM</span>
              </button>
            ) : (
              <button onClick={handleStopEngine} className="flex items-center space-x-2 bg-rose-600 hover:bg-rose-500 text-white font-medium px-4 py-2 rounded transition-colors text-sm shadow-lg shadow-rose-900/20">
                <Square className="w-4 h-4 fill-current" /><span>ABORT SIMULATION</span>
              </button>
            )}
          </div>
        </header>

        {/* DYNAMIC VIEW INJECTION */}
        <div className="flex-1 overflow-y-auto bg-slate-950">
          {currentView === 'Dashboard' && (
            <DashboardView 
              engineRunning={engineRunning} systemStatus={systemStatus} error={error} 
              radarEvents={radarEvents} spiderLogs={spiderLogs} 
              scenario={scenario} setScenario={setScenario} 
              spiderIp={spiderIp} setSpiderIp={setSpiderIp} 
              handleStartEngine={handleStartEngine} handleStopEngine={handleStopEngine} 
              handleUploadKML={handleUploadKML} uploadStatus={uploadStatus} 
            />
          )}
          {currentView === 'Scenario Builder' && (
  <ScenarioBuilderView 
    handleUploadKML={handleUploadKML} 
    uploadStatus={uploadStatus} 
  />
)}
          {currentView === 'Alert Generator' && <AlertGeneratorView />}
          
          {/* Fallback for unbuilt menus */}
          {!['Dashboard', 'Scenario Builder', 'Alert Generator'].includes(currentView) && (
            <div className="p-8 flex items-center justify-center h-full text-slate-500">
              <p className="font-mono text-sm border border-slate-800 bg-slate-900 px-4 py-2 rounded">
                [{currentView}] Module Architecture Pending...
              </p>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}