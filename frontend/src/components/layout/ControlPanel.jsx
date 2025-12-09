import React from 'react';
import { Upload, RefreshCw, Loader2, Download, Trash2, Sparkles, CheckCircle2 } from 'lucide-react';
import { clsx } from 'clsx';
import Button from '../ui/Button';
import Badge from '../ui/Badge';

const ControlPanel = ({ 
  files, 
  selectedId, 
  setSelectedId, 
  updateFile, 
  handleUpscale, 
  handleDelete,
  onUploadClick,
  downloadAll,
  downloadSingle,
}) => {
  return (
    <div className="flex-1 flex p-4 gap-4 bg-[#0b0f19] min-h-0 overflow-hidden">



     
            {/* --- LEFT PANEL: INPUT & SETTINGS --- */}
            <div className="flex-1 flex flex-col bg-[#111827] rounded-xl border border-slate-800/60 overflow-hidden shadow-2xl">
            

            {/* Header */}
            <div className="h-12 flex items-center px-5 border-b border-slate-800 bg-[#1e293b]/30">

                {/* Left Title */}
                <span className="text-sm font-bold text-gray-100 whitespace-nowrap">
                Input & Settings
                </span>

                {/* Upload — takes full remaining space from middle to right */}
                <div 
                onClick={onUploadClick}
                className="ml-6 flex-1 h-10 border-2 border-dashed border-slate-700/50 rounded-lg
                            flex items-center justify-center text-slate-500 
                            hover:text-blue-400 hover:border-blue-500/30 
                            hover:bg-slate-800/30 transition-all cursor-pointer group"
                >
                <span className="text-xs font-medium flex items-center gap-2">
                    <div className="px-2 py-1 bg-slate-800 rounded group-hover:bg-blue-900/30 transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    </div>
                    Drop images here or click to upload
                </span>
                </div>

            </div>
        

        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          

          
          {/* Input File List */}
          {files.map((file) => (
            <div 
              key={file.id}
              onClick={() => setSelectedId(file.id)}
              className={clsx(
                "relative rounded-lg p-3 border transition-all duration-200 group cursor-pointer",
                file.id === selectedId 
                  ? "bg-[#1e293b] border-blue-900/50 shadow-[0_0_15px_rgba(59,130,246,0.1)]" 
                  : "bg-[#0f172a] border-slate-800 hover:border-slate-700"
              )}
            >
              <div className="flex items-center justify-between">
                {/* Thumbnail & Info */}
                <div className="flex items-center gap-3 min-w-[180px]">
                  <img src={file.previewUrl} className="w-12 h-12 rounded object-cover border border-slate-700 bg-black" alt="" />
                  <div>
                    <div className="text-xs font-bold text-gray-200 truncate max-w-[140px]" title={file.name}>{file.name}</div>
                    <div className="text-[10px] text-gray-500 mt-0.5 font-mono">{file.width}x{file.height}</div>
                  </div>
                </div>

                {/* Controls Row */}
                <div className={clsx("flex items-center gap-3", file.status === 'processing' && "opacity-50 pointer-events-none")}>
                  
                  {/* Replace Button */}
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-slate-700 text-[10px] text-gray-400 hover:text-white hover:border-slate-500 hover:bg-slate-800 transition-colors">
                    <RefreshCw className="w-3 h-3" /> <span className="hidden xl:inline">Replace</span>
                  </button>

                  {/* Face Toggle */}
                  <div 
                    className="flex items-center gap-2 px-2 cursor-pointer select-none"
                    onClick={(e) => { e.stopPropagation(); updateFile(file.id, { faceEnhance: !file.faceEnhance }); }}
                  >
                    <span className={clsx("text-[10px] font-medium transition-colors", file.faceEnhance ? "text-blue-400" : "text-gray-500")}>Face</span>
                    <div className={clsx("relative w-8 h-4 rounded-full transition-colors duration-300", file.faceEnhance ? "bg-blue-600" : "bg-slate-700")}>
                      <div className={clsx("absolute top-0.5 w-3 h-3 rounded-full bg-white shadow-sm transition-all duration-300", file.faceEnhance ? "left-4" : "left-0.5")} />
                    </div>
                  </div>

                  {/* Scale Segmented Control */}
                  <div className="flex bg-[#020617] rounded border border-slate-700 overflow-hidden">
                    {[2, 3, 4].map(scale => (
                      <button
                        key={scale}
                        onClick={(e) => { e.stopPropagation(); updateFile(file.id, { scale }); }}
                        className={clsx(
                          "px-3 py-1.5 text-[10px] border-r border-slate-700 last:border-0 transition-all font-medium",
                          file.scale === scale 
                            ? "bg-slate-800 text-blue-400 font-bold shadow-inner" 
                            : "text-gray-500 hover:text-gray-300 hover:bg-slate-800/50"
                        )}
                      >
                        {scale}x
                      </button>
                    ))}
                  </div>

                  {/* Upscale Action Button */}
                  <Button 
                    variant="primary" 
                    className="text-xs px-5 py-2 ml-2 min-w-[90px]"
                    onClick={(e) => { e.stopPropagation(); handleUpscale(file.id); }}
                  >
                    {file.status === 'processing' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Upscale'}
                  </Button>
                </div>
              </div>
              
              {/* Processing Progress Bar Overlay */}
              {file.status === 'processing' && (
                <div className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-blue-600 to-indigo-500 w-full animate-[loading_2s_ease-in-out_infinite]" />
              )}
            </div>
          ))}
          
          {files.length === 0 && (
             <div className="text-center py-10 opacity-30">
               <p className="text-sm">No images added</p>
             </div>
          )}
        </div>
      </div>

      {/* --- RIGHT PANEL: OUTPUT --- */}
      <div className="flex-1 flex flex-col bg-[#111827] rounded-xl border border-slate-800/60 overflow-hidden shadow-2xl">
        <div className="h-12 flex items-center justify-between px-5 border-b border-slate-800 bg-[#1e293b]/30">
          <span className="text-sm font-bold text-gray-100">Output</span>
          {files.some(f => f.status === 'done') && (
            <Button variant="primary" className="text-[10px] px-3 py-1.5 h-7 gap-1.5 bg-blue-600" onClick={downloadAll}>
              <Download className="w-3 h-3" /> Download All
            </Button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar relative bg-[#111827]">
          
          {/* Empty State */}
          {files.filter(f => f.status === 'done').length === 0 && files.filter(f => f.status === 'processing').length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-600 opacity-30 pointer-events-none">
               <Sparkles className="w-16 h-16 mb-4" />
               <span className="text-sm font-medium">Processed images will appear here</span>
            </div>
          )}

          {/* List of Results */}
          {files.map((file) => {
            if (file.status === 'idle') return null;

            return (
              <div 
                key={file.id} 
                onClick={() => setSelectedId(file.id)}
                className={clsx(
                  "bg-[#0f172a] rounded-lg p-3 border flex items-center justify-between transition-all",
                  file.id === selectedId 
                  ? "bg-[#1e293b] border-blue-900/50 shadow-[0_0_15px_rgba(59,130,246,0.1)]" 
                  : "bg-[#0f172a] border-slate-800 hover:border-slate-700",
                  file.status === 'processing' ? "border-slate-800/50 opacity-70" : "border-slate-800 hover:border-slate-700"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img src={file.previewUrl} className="w-12 h-12 rounded object-cover border border-slate-700 bg-black grayscale-[30%]" alt="" />
                    {file.status === 'done' && (
                      <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-0.5 border-2 border-[#0f172a] shadow-sm">
                        <CheckCircle2 className="w-2.5 h-2.5 text-white" />
                      </div>
                    )}
                    {file.status === 'processing' && (
                      <div className="absolute inset-0 bg-black/50 rounded flex items-center justify-center">
                         <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-100 flex items-center gap-2">
                       {file.name} 
                       {file.status === 'done' && <span className="text-[9px] bg-blue-900/40 text-blue-300 px-1.5 rounded border border-blue-900/50">SR</span>}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      {file.status === 'done' ? (
                        <>
                           <span className="text-[10px] text-green-400 font-mono">{file.resultDims.width}x{file.resultDims.height}</span>
                           <span className="text-[10px] text-gray-600">•</span>
                           <span className="text-[10px] text-gray-500">{file.scale}x Upscale</span>
                        </>
                      ) : (
                        <span className="text-[10px] text-blue-400 animate-pulse">Processing...</span>
                      )}
                    </div>
                  </div>
                </div>

                {file.status === 'done' && (
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="danger" 
                      className="text-[10px] px-3 py-1.5 gap-1.5 h-8"
                      onClick={() => handleDelete(file.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" /> <span className="hidden xl:inline">Delete</span>
                    </Button>
                    <Button variant="outline" onClick={() => downloadSingle(file)} className="text-[10px] px-3 py-1.5 gap-1.5 border-slate-600 text-gray-300 h-8">
                      <Download className="w-3.5 h-3.5" /> <span className="hidden xl:inline">Download</span>
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;