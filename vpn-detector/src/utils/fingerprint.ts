export interface FingerprintData {
  error?: string;
  userAgent: string;
  language: string;
  platform: string;
  hardwareConcurrency: number | string;
  deviceMemory: number | string;
  colorDepth: number;
  screenResolution: string;
  timezone: string;
  canvasHash: string;
  webglVendor: string;
  webglRenderer: string;
  connection: any;
  fonts: string[];
  webrtcIps: string[];
  geoIp: {
    ip: string;
    city: string;
    country: string;
    timezone: string;
    org: string;
  } | null;
  vpnSuspicion: {
    timezoneMismatch: boolean;
    webrtcLeak: boolean;
  };
}

// 1. Font Fingerprinting
const FONTS_TO_CHECK = [
  "Arial", "Helvetica", "Times New Roman", "Times", "Courier New", "Courier",
  "Verdana", "Georgia", "Palatino", "Garamond", "Bookman", "Comic Sans MS",
  "Trebuchet MS", "Arial Black", "Impact", "Webdings", "Symbol", "Calibri",
  "Cambria", "Candara", "Consolas", "Constantia", "Corbel", "Lucida Grande",
  "Menlo", "Monaco", "Apple Color Emoji", "Segoe UI", "Roboto", "Ubuntu"
];

function getInstalledFonts(): string[] {
  try {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return [];

    const text = "mmmmmmmmmmlli";
  const baseSize = 72;
  
  // Base fonts to compare against
  ctx.font = `${baseSize}px monospace`;
  const baseWidthMono = ctx.measureText(text).width;
  ctx.font = `${baseSize}px sans-serif`;
  const baseWidthSans = ctx.measureText(text).width;
  ctx.font = `${baseSize}px serif`;
  const baseWidthSerif = ctx.measureText(text).width;

  const installed: string[] = [];

  FONTS_TO_CHECK.forEach(font => {
    let detected = false;
    // Check against all fallbacks
    for (const fallback of ['monospace', 'sans-serif', 'serif']) {
      ctx.font = `${baseSize}px "${font}", ${fallback}`;
      const width = ctx.measureText(text).width;
      
      let baseWidth = fallback === 'monospace' ? baseWidthMono : fallback === 'sans-serif' ? baseWidthSans : baseWidthSerif;
      
      if (width !== baseWidth) {
        detected = true;
        break;
      }
    }
    if (detected) installed.push(font);
  });

    return installed;
  } catch (e) {
    return [];
  }
}

// 2. WebRTC Leak Detection
async function getWebRTCIPs(): Promise<string[]> {
  return new Promise((resolve) => {
    const ips: Set<string> = new Set();
    const RTCPeerConnection = window.RTCPeerConnection || (window as any).mozRTCPeerConnection || (window as any).webkitRTCPeerConnection;
    
    if (!RTCPeerConnection) {
      resolve([]);
      return;
    }

    const pc = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
    
    pc.createDataChannel("");
    
    pc.createOffer().then(offer => pc.setLocalDescription(offer)).catch(() => {});

    pc.onicecandidate = (event) => {
      if (!event || !event.candidate) return;
      const parts = event.candidate.candidate.split(' ');
      const ip = parts[4];
      if (ip && ip.match(/^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$/)) {
        ips.add(ip);
      }
    };

    // Timeout after 2 seconds
    setTimeout(() => {
      pc.close();
      resolve(Array.from(ips));
    }, 2000);
  });
}

// Canvas & WebGL Functions
function getCanvasFingerprint(): string {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return 'Not supported';

    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = '#069';
    ctx.fillText('VPN Detection Prototype Canvas Fingerprint', 2, 15);
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
    ctx.fillText('VPN Detection Prototype Canvas Fingerprint', 4, 17);

    return hashString(canvas.toDataURL());
  } catch (e) {
    return 'Error';
  }
}

function getWebGLFingerprint() {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return { vendor: 'Not supported', renderer: 'Not supported' };

    const debugInfo = (gl as WebGLRenderingContext).getExtension('WEBGL_debug_renderer_info');
    if (!debugInfo) return { vendor: 'Unknown', renderer: 'Unknown' };

    return { 
      vendor: (gl as WebGLRenderingContext).getParameter(debugInfo.UNMASKED_VENDOR_WEBGL), 
      renderer: (gl as WebGLRenderingContext).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) 
    };
  } catch (e) {
    return { vendor: 'Error', renderer: 'Error' };
  }
}

function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return hash.toString(16);
}

export async function generateClientFingerprint(): Promise<FingerprintData> {
  try {
    const nav = window.navigator as any;
    const webgl = getWebGLFingerprint();
    let browserTimezone = 'Unknown';
    try {
      browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch (e) {}
    
    // Fetch Geolocation and IP asynchronously
  let geoIp = null;
  try {
    const geoRes = await fetch('https://ipapi.co/json/');
    const geoData = await geoRes.json();
    if (geoData.ip) {
      geoIp = {
        ip: geoData.ip,
        city: geoData.city,
        country: geoData.country_name,
        timezone: geoData.timezone,
        org: geoData.org
      };
    }
  } catch (e) {
    console.error("GeoIP Fetch Failed", e);
  }

  // Await WebRTC detection
  const webrtcIps = await getWebRTCIPs();
  
  // Calculate Suspicions
  let timezoneMismatch = false;
  if (geoIp && geoIp.timezone && geoIp.timezone !== browserTimezone) {
    timezoneMismatch = true;
  }
  
  // WebRTC Leak happens if WebRTC finds an IP and it's not the same as the public IP
  // (Usually WebRTC finds local IPs like 192.168.x.x, but if it finds a public one different from geoIp, it's a huge leak. 
  // Simply finding ANY WebRTC IP while on a strict VPN is often considered a leak).
  let webrtcLeak = webrtcIps.length > 0;

  return {
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform || (navigator as any).userAgentData?.platform || 'Unknown',
    hardwareConcurrency: navigator.hardwareConcurrency || 'Unknown',
    deviceMemory: nav.deviceMemory || 'Unknown',
    colorDepth: window.screen.colorDepth,
    screenResolution: `${window.screen.width}x${window.screen.height} (Ratio: ${window.devicePixelRatio})`,
    timezone: browserTimezone,
    canvasHash: getCanvasFingerprint(),
    webglVendor: webgl.vendor,
    webglRenderer: webgl.renderer,
    connection: nav.connection ? {
      effectiveType: nav.connection.effectiveType,
      downlink: nav.connection.downlink,
      rtt: nav.connection.rtt,
    } : 'Not supported',
    fonts: getInstalledFonts(),
    webrtcIps,
    geoIp,
    vpnSuspicion: {
      timezoneMismatch,
      webrtcLeak
    }
  };
  } catch (err: any) {
    console.error("Fingerprint generation failed", err);
    return {
      error: err.message || "Failed to generate fingerprint",
      userAgent: 'Unknown',
      language: 'Unknown',
      platform: 'Unknown',
      hardwareConcurrency: 'Unknown',
      deviceMemory: 'Unknown',
      colorDepth: 0,
      screenResolution: 'Unknown',
      timezone: 'Unknown',
      canvasHash: 'Unknown',
      webglVendor: 'Unknown',
      webglRenderer: 'Unknown',
      connection: 'Unknown',
      fonts: [],
      webrtcIps: [],
      geoIp: null,
      vpnSuspicion: { timezoneMismatch: false, webrtcLeak: false }
    };
  }
}
