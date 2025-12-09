// import React from 'react';
// import { Layers } from 'lucide-react';

// export default function Header() {
//   return (
//     <header className="h-16 border-b border-gray-800 flex items-center px-6 bg-[#0b0f19]">
//       <div className="flex items-center gap-2">
//         <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
//           <Layers size={20} />
//         </div>
//         <span className="font-bold text-xl tracking-tight text-white">SuperRes<span className="text-blue-500">.AI</span></span>
//       </div>
//       <div className="ml-auto text-xs text-gray-500 font-mono">
//         v1.0.0 (rrgaire)
//       </div>
//     </header>
//   );
// }


import React from 'react';
import { Layers } from 'lucide-react';

export default function Header({ onUploadClick, fileInputRef, handleUpload }) {
  return (
    <header className="h-16 border-b border-gray-800 flex items-center px-6 bg-[#0b0f19]">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
          <Layers size={20} />
        </div>
        <span className="font-bold text-xl tracking-tight text-white">SuperRes<span className="text-blue-500">.AI</span></span>
      </div>
      <div className="ml-auto text-xs text-gray-500 font-mono">
        v1.0.0 (rrgaire)
      </div>
      
      {/* Hidden file input - this is what was missing! */}
      <input 
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleUpload}
        className="hidden"
      />
    </header>
  );
}