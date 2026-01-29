"use client";

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { ArrowLeft, CheckCircle, XCircle, RefreshCw, Loader2 } from 'lucide-react';

interface VerificationResult {
  status: 'ok' | 'error';
  attendeeName?: string;
  role?: string;
  error?: string;
  reason?: string;
}

export default function StaffVerifyPage() {
  const router = useRouter();
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [isScanning, setIsScanning] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    if (isScanning && !scannerRef.current) {
      const scanner = new Html5QrcodeScanner(
        "reader",
        { 
          fps: 10, 
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
          facingMode: facingMode,
        },
        /* verbose= */ false
      );

      scanner.render(onScanSuccess, onScanFailure);
      scannerRef.current = scanner;
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(err => console.error("Failed to clear scanner", err));
        scannerRef.current = null;
      }
    };
  }, [isScanning, facingMode]);

  async function onScanSuccess(decodedText: string) {
    console.log(`Code matched = ${decodedText}`);
    
    // Stop scanning while processing
    if (scannerRef.current) {
      await scannerRef.current.pause(true);
    }
    
    setIsScanning(false);
    setIsVerifying(true);
    
    try {
      const response = await fetch('/api/qr/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: decodedText })
      });

      const data = await response.json();
      
      setIsVerifying(false);
      
      if (response.ok && data.status === 'ok') {
        setResult({
          status: 'ok',
          attendeeName: data.attendeeName,
          role: data.role
        });
      } else {
        setResult({ 
          status: 'error', 
          error: data.error || 'Verification failed',
          reason: data.reason
        });
      }
    } catch (err) {
      console.error('Verification error:', err);
      setIsVerifying(false);
      setResult({ status: 'error', error: 'Failed to communicate with server' });
    }
  }

  function onScanFailure(error: any) {
    // Don't log every scan failure
  }

  function resetScanner() {
    setResult(null);
    setIsScanning(true);
    setIsVerifying(false);
    setCameraError(null);
  }

  async function switchCamera() {
    // Clear current scanner
    if (scannerRef.current) {
      await scannerRef.current.clear();
      scannerRef.current = null;
    }
    
    // Toggle facing mode
    setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
    
    // Scanner will restart due to useEffect dependency
  }

  return (
    <div className="min-h-screen bg-[#F5F2F0] pb-6">
      {/* Header with Back Button */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.back()}
              className="p-2 rounded-full hover:bg-zinc-100 transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-[#6B5A4E]" />
            </button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-[#2D1E17]">QR Scanner</h1>
              <p className="text-sm text-[#6B5A4E]">Scan attendee QR codes</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {isVerifying ? (
          <div className="rounded-3xl shadow-lg border-2 bg-gradient-to-br from-zinc-50 to-zinc-100 border-zinc-200 text-center space-y-6 p-8">
            <div className="w-20 h-20 bg-zinc-400 rounded-full flex items-center justify-center mx-auto text-white shadow-lg">
              <Loader2 className="w-12 h-12 animate-spin" />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-zinc-800">Verifying...</h2>
              <p className="text-zinc-600">Checking attendance record</p>
            </div>
          </div>
        ) : isScanning ? (
          <div className="bg-white rounded-3xl shadow-lg border-2 border-zinc-100 overflow-hidden">
            <div className="bg-[#F5F2F0] p-4 border-b border-zinc-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-semibold text-[#2D1E17]">Camera Active</span>
                </div>
                <button
                  onClick={switchCamera}
                  className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-zinc-200 hover:bg-zinc-50 transition-colors text-sm font-medium text-[#2D1E17]"
                >
                  <RefreshCw className="w-4 h-4" />
                  Switch Camera
                </button>
              </div>
            </div>
            <div className="p-6">
              <div id="reader" className="overflow-hidden rounded-2xl"></div>
            </div>
            {cameraError && (
              <div className="p-4 bg-red-50 border-t border-red-100">
                <p className="text-sm text-red-700 text-center">{cameraError}</p>
              </div>
            )}
          </div>
        ) : (
          <div className={`rounded-3xl shadow-lg border-2 text-center space-y-6 p-8 ${
            result?.status === 'ok' 
              ? 'bg-gradient-to-br from-green-50 to-green-100 border-green-200' 
              : 'bg-gradient-to-br from-red-50 to-red-100 border-red-200'
          }`}>
            {result?.status === 'ok' ? (
              <>
                <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto text-white shadow-lg">
                  <CheckCircle className="w-12 h-12" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold text-green-800">✓ Verified!</h2>
                  <div className="bg-white/50 rounded-2xl p-4 space-y-1">
                    <p className="text-xl font-bold text-green-900">{result.attendeeName}</p>
                    <p className="text-sm uppercase tracking-wider text-green-700 font-semibold">
                      {result.role}
                    </p>
                  </div>
                  <p className="text-sm text-green-700">Attendance recorded successfully</p>
                </div>
              </>
            ) : (
              <>
                <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto text-white shadow-lg">
                  <XCircle className="w-12 h-12" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold text-red-800">Verification Failed</h2>
                  <div className="bg-white/50 rounded-2xl p-4">
                    <p className="text-red-700 font-medium">
                      {result?.error || 'Unknown error occurred'}
                    </p>
                    {result?.reason === 'already_checked_in' && (
                      <p className="text-sm text-red-600 mt-2">This person has already been checked in.</p>
                    )}
                  </div>
                </div>
              </>
            )}

            <button 
              onClick={resetScanner}
              className="w-full py-4 px-6 bg-[#2D1E17] text-white rounded-2xl font-bold hover:bg-[#1a1410] transition-all shadow-lg text-lg"
            >
              Scan Next Attendee
            </button>
          </div>
        )}

        {/* Info Footer */}
        <div className="text-center">
          <p className="text-xs text-zinc-400">
            Only authorized staff can perform verification
          </p>
        </div>
      </div>
    </div>
  );
}
