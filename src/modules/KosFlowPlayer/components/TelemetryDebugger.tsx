import React, { useState } from 'react';
import { Terminal, ChevronDown, ChevronUp, RefreshCw, Layers, Radio, Sparkles } from 'lucide-react';
import { usePlayerMachine } from '../context/PlayerMachineContext';
import { useFlowPlayerModule } from '../context/ModuleContext';

export const TelemetryDebugger: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const {
    campaign,
    currentNodeId,
    history,
    sessionId,
    events,
    lastIntentResult,
    transitionTo,
    resetSession,
  } = usePlayerMachine();

  const { db, geminiApiKey, databaseId } = useFlowPlayerModule();

  return (
    <div className="fixed bottom-4 left-4 z-50 font-mono text-xs" dir="ltr">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center space-x-2 bg-slate-900/90 hover:bg-slate-800 text-emerald-400 border border-emerald-500/40 px-3 py-2 rounded-xl shadow-2xl backdrop-blur-md transition-all active:scale-95"
      >
        <Terminal className="w-4 h-4" />
        <span className="font-bold">Telemetry & State</span>
        <span className="bg-emerald-950 text-emerald-300 px-1.5 py-0.5 rounded text-[10px]">
          {events.length} events
        </span>
        {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
      </button>

      {/* Expanded Panel */}
      {isOpen && (
        <div className="mt-2 w-96 max-h-[500px] bg-slate-950/95 border border-slate-800 rounded-2xl shadow-2xl backdrop-blur-xl overflow-hidden flex flex-col text-slate-300 animate-fade-in-up">
          {/* Header */}
          <div className="p-3 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span className="font-bold text-white text-xs">Live Telemetry Inspector</span>
            </div>
            <button
              onClick={resetSession}
              title="Reset Session"
              className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Status Indicators */}
          <div className="p-3 bg-slate-900/40 border-b border-slate-800/80 space-y-1.5 text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-500">Firestore:</span>
              <span className={db ? 'text-emerald-400 font-semibold' : 'text-amber-400'}>
                {db ? `Connected (${databaseId || 'aioffice'})` : 'Offline / Standalone'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Gemini AI:</span>
              <span className={geminiApiKey ? 'text-indigo-400 font-semibold' : 'text-slate-500'}>
                {geminiApiKey ? 'API Key Active' : 'Fallback Rules'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Session ID:</span>
              <span className="text-slate-300 font-mono text-[10px] truncate max-w-[200px]">{sessionId}</span>
            </div>
            <div className="flex justify-between items-center pt-1">
              <span className="text-slate-500">Current Node:</span>
              <span className="bg-indigo-950 text-indigo-300 border border-indigo-700/50 px-2 py-0.5 rounded font-bold">
                {currentNodeId}
              </span>
            </div>
          </div>

          {/* Quick Node Transition Override */}
          <div className="p-3 border-b border-slate-800 bg-slate-900/20">
            <div className="text-[10px] text-slate-400 mb-1.5 flex items-center space-x-1">
              <Layers className="w-3 h-3" />
              <span>Manual State Jump:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {Object.keys(campaign.states).map((nodeId) => (
                <button
                  key={nodeId}
                  onClick={() => transitionTo(nodeId, 'node_transition', { reason: 'debugger_jump' })}
                  className={`px-2 py-1 rounded text-[10px] font-semibold transition-all ${
                    currentNodeId === nodeId
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                  }`}
                >
                  {nodeId}
                </button>
              ))}
            </div>
          </div>

          {/* Last Intent Result */}
          {lastIntentResult && (
            <div className="p-2.5 bg-indigo-950/40 border-b border-indigo-900/40 text-[11px]">
              <div className="flex items-center space-x-1 text-indigo-300 font-semibold mb-1">
                <Sparkles className="w-3 h-3 text-yellow-400" />
                <span>Last Gemini Intent:</span>
              </div>
              <div className="text-white font-bold">"{lastIntentResult.intent}"</div>
              {lastIntentResult.rawText && (
                <div className="text-[10px] text-slate-400 truncate">Input: {lastIntentResult.rawText}</div>
              )}
            </div>
          )}

          {/* Events Stream */}
          <div className="flex-1 p-3 overflow-y-auto max-h-52 space-y-2">
            <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-1">
              Telemetry Stream ({events.length})
            </div>
            {events.length === 0 ? (
              <div className="text-slate-600 text-[11px] text-center py-4">No events recorded yet</div>
            ) : (
              events
                .slice()
                .reverse()
                .map((ev, idx) => (
                  <div key={idx} className="p-2 bg-slate-900/70 border border-slate-800/80 rounded-lg text-[10px]">
                    <div className="flex justify-between items-center text-slate-400 mb-1">
                      <span className="font-bold text-emerald-400">{ev.type}</span>
                      <span>{new Date(ev.timestamp).toLocaleTimeString()}</span>
                    </div>
                    {ev.from && ev.to && (
                      <div className="text-slate-300">
                        {ev.from} ➔ <span className="text-indigo-300 font-semibold">{ev.to}</span>
                      </div>
                    )}
                    {ev.transcript && (
                      <div className="text-yellow-300/80 truncate">Speech: "{ev.transcript}"</div>
                    )}
                    {ev.latencyMs && (
                      <div className="text-slate-500 text-[9px]">AI Latency: {ev.latencyMs}ms</div>
                    )}
                  </div>
                ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};