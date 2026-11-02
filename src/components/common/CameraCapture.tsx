import React, { useRef, useState, useEffect } from 'react';
import { Camera, RefreshCw, Upload, X, Check, AlertCircle } from 'lucide-react';

interface CameraCaptureProps {
  photoUrl: string;
  onChange: (url: string) => void;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({ photoUrl, onChange }) => {
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Stop camera when closing
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setIsCameraOpen(false);
  };

  const startCamera = async () => {
    setCameraError(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 480, height: 480, facingMode: 'user' },
      });
      setStream(mediaStream);
      setIsCameraOpen(true);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      console.error('Error accessing webcam', err);
      setCameraError('Unable to access camera. Please check permissions or upload a file.');
    }
  };

  useEffect(() => {
    if (isCameraOpen && videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isCameraOpen, stream]);

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      if (context) {
        canvas.width = video.videoWidth || 400;
        canvas.height = video.videoHeight || 400;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        onChange(dataUrl);
        stopCamera();
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          onChange(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative group">
        <div className="w-28 h-28 rounded-2xl overflow-hidden bg-slate-800 border-2 border-dashed border-slate-700 flex items-center justify-center shadow-lg">
          {photoUrl ? (
            <img
              src={photoUrl}
              alt="Member preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-center p-3 text-slate-500">
              <Camera className="w-8 h-8 mx-auto mb-1 text-slate-400 opacity-60" />
              <span className="text-xs">No Photo</span>
            </div>
          )}
        </div>

        {photoUrl && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute -top-2 -right-2 bg-rose-600 hover:bg-rose-500 text-white p-1 rounded-full shadow-md transition-all"
            title="Remove photo"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 mt-3">
        <button
          type="button"
          onClick={startCamera}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-sm transition"
        >
          <Camera className="w-3.5 h-3.5" />
          Live Camera
        </button>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
        >
          <Upload className="w-3.5 h-3.5" />
          Upload
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {cameraError && (
        <div className="mt-2 text-xs text-rose-400 flex items-center gap-1 max-w-xs text-center">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{cameraError}</span>
        </div>
      )}

      {/* Live Webcam Modal overlay */}
      {isCameraOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-amber-500" />
                <h3 className="font-semibold text-slate-100 text-sm">Live Webcam Capture</h3>
              </div>
              <button
                type="button"
                onClick={stopCamera}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative aspect-square bg-black overflow-hidden flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover scale-x-[-1]"
              />
              <div className="absolute inset-0 pointer-events-none border-2 border-amber-500/30 rounded-full m-8 flex items-center justify-center">
                <span className="text-white/40 text-xs font-mono tracking-wider">ALIGN FACE HERE</span>
              </div>
            </div>

            <div className="p-4 bg-slate-900/90 flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={stopCamera}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={capturePhoto}
                className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20 transition active:scale-95"
              >
                <Camera className="w-4 h-4" />
                Snap Photo
              </button>
            </div>

            <canvas ref={canvasRef} className="hidden" />
          </div>
        </div>
      )}
    </div>
  );
};
