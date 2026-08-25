import React from 'react';
import { X, Download, FileText, ExternalLink } from 'lucide-react';

interface AttachmentModalProps {
  url: string | null;
  name: string;
  onClose: () => void;
}

export const AttachmentModal: React.FC<AttachmentModalProps> = ({
  url,
  name,
  onClose,
}) => {
  if (!url) return null;

  const isImage = url.startsWith('data:image/') || url.match(/\.(jpeg|jpg|gif|png|webp)($|\?)/i);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2 truncate">
            <FileText className="w-5 h-5 text-indigo-400 flex-shrink-0" />
            <span className="font-bold text-sm truncate">{name}</span>
          </div>
          <div className="flex items-center space-x-2">
            <a
              href={url}
              download={name}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              title="Baixar arquivo"
            >
              <Download className="w-4 h-4" />
            </a>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Viewer */}
        <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-slate-100 min-h-[300px]">
          {isImage ? (
            <img
              src={url}
              alt={name}
              referrerPolicy="no-referrer"
              className="max-h-[70vh] max-w-full object-contain rounded-lg shadow-md"
            />
          ) : (
            <div className="text-center p-8 bg-white rounded-xl shadow-sm border border-slate-200">
              <FileText className="w-16 h-16 text-indigo-500 mx-auto mb-3" />
              <h4 className="text-base font-bold text-slate-800 mb-1">{name}</h4>
              <p className="text-xs text-slate-500 mb-4">Documento em formato PDF ou anexo não-imagem</p>
              <a
                href={url}
                download={name}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Baixar Documento</span>
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
