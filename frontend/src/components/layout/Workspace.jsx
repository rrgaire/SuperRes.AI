import React from 'react';
import { Loader2, MousePointer2, Image as ImageIcon } from 'lucide-react';
import Badge from '../ui/Badge';

const Workspace = ({ selectedFile }) => {
  return (
    <div className="h-[45vh] flex border-b border-slate-800 relative bg-[#0f172a]">
      
      {/* LEFT: Low Res Preview */}
      <div className="flex-1 border-r border-slate-800 relative flex items-center justify-center bg-[#020617] overflow-hidden group">
        <div className="absolute top-4 left-4 z-10">
          <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase bg-black/50 px-2 py-1 rounded backdrop-blur-sm border border-white/5">
            Original Bicubic Preview
          </span>
        </div>
        
        {selectedFile ? (
          <img 
            src={selectedFile.previewUrl} 
            alt="Original" 
            className="object-contain w-full h-full p-8 transition-transform duration-200"
          />
        ) : (
           <div className="text-slate-700 flex flex-col items-center">
             <ImageIcon className="w-12 h-12 mb-2 opacity-20" />
             <span className="text-xs font-medium opacity-40">No image selected</span>
           </div>
        )}
      </div>

      {/* RIGHT: Super Res Result */}
      <div className="flex-1 relative flex items-center justify-center bg-[#020617] overflow-hidden">
        <div className="absolute top-4 left-4 z-10">
          <Badge color="blue">Super Resolution Result</Badge>
        </div>
        
        {selectedFile?.status === 'done' ? (
           <img 
             src={selectedFile.resultUrl} 
             alt="Enhanced" 
             className="object-contain w-full h-full p-8 animate-in fade-in duration-500" 
           />
        ) : (
          <div className="text-slate-600 text-sm font-medium flex flex-col items-center gap-3">
             {selectedFile?.status === 'processing' ? (
               <>
                 <div className="relative">
                   <div className="absolute inset-0 bg-blue-500 blur-xl opacity-20 rounded-full"></div>
                   <Loader2 className="w-8 h-8 animate-spin text-blue-500 relative z-10" />
                 </div>
                 <span className="animate-pulse text-blue-400 text-xs tracking-wider uppercase mt-2">Processing image...</span>
               </>
             ) : (
               <>
                 <MousePointer2 className="w-6 h-6 opacity-30" />
                 <span className="opacity-50 text-xs uppercase tracking-wider">Select a file below to preview</span>
               </>
             )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Workspace;