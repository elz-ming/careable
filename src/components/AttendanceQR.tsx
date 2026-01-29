"use client";

import { useState } from 'react';
import { QrCode, X, Download, Loader2 } from 'lucide-react';

interface AttendanceQRProps {
  registrationId: string;
  eventTitle: string;
  compact?: boolean; // New prop for icon-only display
  themeColor?: string; // Theme color for styling
}

export default function AttendanceQR({ registrationId, eventTitle, compact = false, themeColor = '#E89D71' }: AttendanceQRProps) {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  async function generateQR() {
    if (qrCode) {
      setIsOpen(true);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/qr/issue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registrationId })
      });
      const data = await res.json();
      if (data.qrCode) {
        setQrCode(data.qrCode);
        setIsOpen(true);
      } else {
        alert(data.error || 'Failed to generate QR code');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred while generating the QR code');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {compact ? (
        <button 
          onClick={generateQR}
          disabled={loading}
          className="p-2.5 rounded-lg hover:bg-opacity-10 disabled:opacity-50 transition-all active:scale-95 shrink-0"
          style={{
            backgroundColor: `${themeColor}15`,
            color: themeColor
          }}
          aria-label="Show Entry QR Code"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <QrCode className="w-5 h-5" />
          )}
        </button>
      ) : (
        <button 
          onClick={generateQR}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 text-white rounded-xl font-bold hover:opacity-90 disabled:opacity-50 transition-all shadow-lg active:scale-95"
          style={{
            backgroundColor: themeColor,
            boxShadow: `0 10px 25px -5px ${themeColor}40`
          }}
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Generating QR Code...
            </>
          ) : (
            <>
              <QrCode className="w-5 h-5" />
              Show Entry QR Code
            </>
          )}
        </button>
      )}

      {isOpen && qrCode && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)}
        >
          <div 
            className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-6 shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-xl text-[#2D1E17]">Entry Ticket</h3>
                <p className="text-xs text-[#6B5A4E] mt-0.5">Show this to staff</p>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-full hover:bg-zinc-100 transition-colors"
                aria-label="Close"
              >
                <X className="h-5 w-5 text-[#6B5A4E]" />
              </button>
            </div>
            
            {/* QR Code Display */}
            <div className="bg-gradient-to-br from-zinc-50 to-white rounded-2xl p-6 flex flex-col items-center space-y-4 border-2 border-zinc-100 shadow-inner">
              <img 
                src={qrCode} 
                alt="Attendance QR Code" 
                className="w-full aspect-square rounded-xl shadow-md"
              />
              <div className="text-center space-y-1">
                <p className="font-bold text-[#2D1E17] text-lg line-clamp-2">{eventTitle}</p>
                <div className="inline-block px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold uppercase tracking-wider">
                  Single Use Only
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700 leading-relaxed">
              <p className="font-semibold mb-1">📱 How to use:</p>
              <ol className="list-decimal list-inside space-y-1 text-xs">
                <li>Show this QR code to staff at the entrance</li>
                <li>They will scan it to mark your attendance</li>
                <li>Keep your brightness high for best results</li>
              </ol>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button 
                onClick={() => setIsOpen(false)}
                className="flex-1 py-3 bg-zinc-100 text-[#2D1E17] rounded-xl font-bold hover:bg-zinc-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
