import { X, AlertTriangle } from 'lucide-react';

interface ImageViewerProps {
  url: string;
  onClose: () => void;
}

export function ImageViewer({ url, onClose }: ImageViewerProps) {
  if (!url) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2000,
        background: 'rgba(10,15,30,0.92)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <button
        onClick={onClose}
        style={{
          position: 'absolute',
          top: '1.5rem',
          right: '1.5rem',
          background: 'rgba(255,255,255,0.15)',
          border: 'none',
          width: '3rem',
          height: '3rem',
          borderRadius: '1.2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: 'white',
          zIndex: 10,
        }}
      >
        <X size={24} />
      </button>

      <div
        style={{ position: 'relative', maxWidth: '95vw', maxHeight: '90vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={url.replace('/upload/', '/upload/w_1200,c_limit,q_auto,f_auto/')}
          alt="Comprobante extendido"
          style={{
            width: 'auto',
            maxHeight: '90vh',
            borderRadius: '1.5rem',
            boxShadow: '0 32px 100px rgba(0,0,0,0.8)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-2.5rem',
            left: '50%',
            transform: 'translateX(-50%)',
            color: 'rgba(255,255,255,0.6)',
            fontSize: '0.75rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            pointerEvents: 'none',
          }}
        >
          <AlertTriangle size={14} /> Haz clic fuera para cerrar
        </div>
      </div>
    </div>
  );
}
