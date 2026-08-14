'use client';

import { useState } from 'react';
import { generateClientFingerprint, FingerprintData } from '@/utils/fingerprint';
import { ShieldAlert, Activity, Server, Fingerprint, Cpu, Monitor, AlertTriangle, MapPin, Type, Radio } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
  const [clientData, setClientData] = useState<FingerprintData | null>(null);
  const [serverData, setServerData] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    setClientData(null);
    setServerData(null);

    try {
      const cData = await generateClientFingerprint();
      setClientData(cData);

      const res = await fetch('/api/fingerprint');
      const sData = await res.json();
      setServerData(sData);
    } catch (err) {
      console.error("Analysis failed", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-cyan-500/30">
      <div className="max-w-7xl mx-auto px-4 py-12">
        
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center justify-center p-3 bg-cyan-500/10 rounded-full mb-6 ring-1 ring-cyan-500/30"
          >
            <ShieldAlert className="w-8 h-8 text-cyan-400" />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 tracking-tight mb-4"
          >
            VPN Detection Engine
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-slate-400 max-w-2xl mx-auto text-lg"
          >
            Advanced browser fingerprinting, network topology analysis, and leak detection to identify anonymization networks.
          </motion.p>
        </div>

        {/* Action Button */}
        <div className="flex justify-center mb-16">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={runAnalysis}
            disabled={isAnalyzing}
            className="relative group overflow-hidden rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 px-8 py-4 font-bold text-white shadow-xl transition-all hover:shadow-cyan-500/25 disabled:opacity-70"
          >
            <span className="relative flex items-center gap-2 text-lg">
              {isAnalyzing ? (
                <Activity className="w-5 h-5 animate-pulse" />
              ) : (
                <Activity className="w-5 h-5" />
              )}
              {isAnalyzing ? 'Analyzing Identity...' : 'Initiate Scan'}
            </span>
          </motion.button>
        </div>

        {/* Results Grid */}
        <AnimatePresence>
          {(clientData || serverData) && (
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              {/* LEFT COLUMN */}
              <div className="space-y-6">
                
                {/* Risk Analysis Panel */}
                {clientData && (clientData.vpnSuspicion.timezoneMismatch || clientData.vpnSuspicion.webrtcLeak) && (
                  <div className="bg-red-950/40 backdrop-blur-xl border border-red-900/50 rounded-2xl p-6 shadow-2xl">
                    <div className="flex items-center gap-3 mb-4 pb-2 border-b border-red-900/50">
                      <AlertTriangle className="w-6 h-6 text-red-500" />
                      <h2 className="text-xl font-bold text-red-400">Anomalies Detected</h2>
                    </div>
                    <div className="space-y-3">
                      {clientData.vpnSuspicion.timezoneMismatch && (
                        <div className="flex gap-2 text-red-200 bg-red-950/50 p-3 rounded-lg border border-red-900/30">
                          <AlertTriangle className="w-5 h-5 shrink-0 text-red-500" />
                          <p className="text-sm"><strong>Timezone Mismatch:</strong> The physical location of your IP address ({clientData.geoIp?.timezone}) does not match your browser's system timezone ({clientData.timezone}). This heavily indicates a VPN or Proxy is altering your IP location.</p>
                        </div>
                      )}
                      {clientData.vpnSuspicion.webrtcLeak && (
                        <div className="flex gap-2 text-red-200 bg-red-950/50 p-3 rounded-lg border border-red-900/30">
                          <AlertTriangle className="w-5 h-5 shrink-0 text-red-500" />
                          <p className="text-sm"><strong>WebRTC IP Leak:</strong> We detected internal or leaked IP addresses via WebRTC ({clientData.webrtcIps.join(', ')}). This can bypass VPN tunnels and reveal your true network identity.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Geolocation & Network Panel */}
                <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 shadow-2xl">
                  <div className="flex items-center gap-3 mb-4 pb-2 border-b border-slate-800">
                    <MapPin className="w-6 h-6 text-green-400" />
                    <h2 className="text-xl font-semibold text-white">Geolocation & Network</h2>
                  </div>
                  {clientData?.geoIp ? (
                    <div className="space-y-3">
                      <DataRow label="Public IP (Client Fetched)" value={clientData.geoIp.ip} highlight />
                      <DataRow label="Location" value={`${clientData.geoIp.city}, ${clientData.geoIp.country}`} />
                      <DataRow label="ISP / Org" value={clientData.geoIp.org} />
                      <DataRow label="IP Timezone" value={clientData.geoIp.timezone} highlight={clientData.vpnSuspicion.timezoneMismatch} />
                      <DataRow label="Browser Timezone" value={clientData.timezone} highlight={clientData.vpnSuspicion.timezoneMismatch} />
                    </div>
                  ) : <SkeletonLoader />}
                </div>

                {/* Server Headers Panel */}
                <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 shadow-2xl">
                  <div className="flex items-center gap-3 mb-4 pb-2 border-b border-slate-800">
                    <Server className="w-6 h-6 text-blue-400" />
                    <h2 className="text-xl font-semibold text-white">Server-Side Headers</h2>
                  </div>
                  {serverData ? (
                    <div className="space-y-3">
                      <DataRow label="Server-Seen IP" value={serverData.ip} />
                      <DataRow label="X-Forwarded-For" value={serverData.headers['x-forwarded-for']} />
                      <DataRow label="X-Real-IP" value={serverData.headers['x-real-ip']} />
                      <div className="mt-4 pt-4 border-t border-slate-800/50">
                        <h3 className="text-sm font-medium text-slate-500 mb-2">Client Hints (sec-ch-ua)</h3>
                        <pre className="text-xs text-cyan-200 bg-slate-950 p-3 rounded-lg overflow-x-auto border border-slate-800/50 font-mono">
                          {serverData.headers['sec-ch-ua']}
                        </pre>
                      </div>
                    </div>
                  ) : <SkeletonLoader />}
                </div>

                {/* WebRTC Panel */}
                <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 shadow-2xl">
                  <div className="flex items-center gap-3 mb-4 pb-2 border-b border-slate-800">
                    <Radio className="w-6 h-6 text-pink-400" />
                    <h2 className="text-xl font-semibold text-white">WebRTC Protocols</h2>
                  </div>
                  {clientData ? (
                    <div className="space-y-3">
                      {clientData.webrtcIps.length > 0 ? (
                         <div className="flex flex-col gap-1">
                           <span className="text-sm font-medium text-slate-500">Leaked IPs</span>
                           <span className="text-sm text-red-400 font-mono font-bold bg-slate-950 p-2 rounded border border-red-900/50">
                             {clientData.webrtcIps.join(', ')}
                           </span>
                         </div>
                      ) : (
                        <p className="text-sm text-slate-400 italic">No WebRTC leaks detected.</p>
                      )}
                    </div>
                  ) : <SkeletonLoader />}
                </div>

              </div>

              {/* RIGHT COLUMN */}
              <div className="space-y-6">
                
                {/* Advanced Fingerprints */}
                <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 shadow-2xl">
                  <div className="flex items-center gap-3 mb-4 pb-2 border-b border-slate-800">
                    <Fingerprint className="w-6 h-6 text-purple-400" />
                    <h2 className="text-xl font-semibold text-white">Browser Fingerprint Engine</h2>
                  </div>
                  {clientData ? (
                    <div className="space-y-3">
                      <DataRow label="Canvas Hash" value={clientData.canvasHash} highlight />
                      <DataRow label="WebGL Vendor" value={clientData.webglVendor} />
                      <DataRow label="WebGL Renderer" value={clientData.webglRenderer} />
                    </div>
                  ) : <SkeletonLoader />}
                </div>

                {/* Hardware */}
                <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 shadow-2xl">
                  <div className="flex items-center gap-3 mb-4 pb-2 border-b border-slate-800">
                    <Cpu className="w-6 h-6 text-amber-400" />
                    <h2 className="text-xl font-semibold text-white">Hardware Leaks</h2>
                  </div>
                  {clientData ? (
                    <div className="space-y-3">
                      <DataRow label="Platform" value={clientData.platform} />
                      <DataRow label="CPU Cores" value={clientData.hardwareConcurrency} />
                      <DataRow label="Device RAM (GB)" value={clientData.deviceMemory} />
                      <DataRow label="Screen" value={clientData.screenResolution} />
                      <DataRow label="Color Depth" value={clientData.colorDepth.toString() + ' bit'} />
                    </div>
                  ) : <SkeletonLoader />}
                </div>

                {/* Fonts */}
                <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 shadow-2xl">
                  <div className="flex items-center gap-3 mb-4 pb-2 border-b border-slate-800">
                    <Type className="w-6 h-6 text-cyan-400" />
                    <h2 className="text-xl font-semibold text-white">Installed Fonts (Sample)</h2>
                  </div>
                  {clientData ? (
                    <div className="flex flex-wrap gap-2">
                      {clientData.fonts.map(font => (
                        <span key={font} className="px-2 py-1 text-xs bg-slate-800 text-slate-300 rounded border border-slate-700">
                          {font}
                        </span>
                      ))}
                      {clientData.fonts.length === 0 && <span className="text-sm text-slate-500">Could not enumerate fonts.</span>}
                    </div>
                  ) : <SkeletonLoader />}
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}

function DataRow({ label, value, highlight = false }: { label: string, value: string | number, highlight?: boolean }) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 py-1 border-b border-slate-800/30 last:border-0">
      <span className="text-sm font-medium text-slate-500">{label}</span>
      <span className={`text-sm font-mono text-right ${highlight ? 'text-cyan-400 font-semibold' : 'text-slate-300'}`}>
        {value}
      </span>
    </div>
  );
}

function SkeletonLoader() {
  return (
    <div className="animate-pulse space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex justify-between items-center border-b border-slate-800/30 pb-2">
          <div className="h-4 bg-slate-800 rounded w-1/3"></div>
          <div className="h-4 bg-slate-800 rounded w-1/2"></div>
        </div>
      ))}
    </div>
  );
}
