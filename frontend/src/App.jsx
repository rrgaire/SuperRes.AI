// import React, { useState, useRef } from 'react';
// import Header from './components/layout/Header';
// import Workspace from './components/layout/Workspace';
// import ControlPanel from './components/layout/ControlPanel';

// export default function App() {
//   const [files, setFiles] = useState([]);
//   const [selectedId, setSelectedId] = useState(null);
//   const fileInputRef = useRef(null);

//   // Helper 1: Get dimensions from a raw File object (Input)
//   const getImageDimensions = (file) => {
//     return new Promise((resolve) => {
//       const img = new Image();
//       img.onload = () => resolve({ width: img.width, height: img.height });
//       img.onerror = () => resolve({ width: 0, height: 0 });
//       img.src = URL.createObjectURL(file);
//     });
//   };

//   // Helper 2: Get dimensions from a Blob URL (Output)
//   const getUrlDimensions = (url) => {
//     return new Promise((resolve) => {
//       const img = new Image();
//       img.onload = () => resolve({ width: img.width, height: img.height });
//       img.src = url;
//     });
//   };

//   const handleUpload = async (e) => {
//     if (!e.target.files) return;
    
//     const newFiles = await Promise.all(Array.from(e.target.files).map(async (file) => {
//       const dims = await getImageDimensions(file);
//       return {
//         id: Math.random().toString(36).substr(2, 9),
//         file,
//         name: file.name,
//         previewUrl: URL.createObjectURL(file),
//         width: dims.width,
//         height: dims.height,
//         status: 'idle',
//         scale: 2,
//         faceEnhance: false,
//         resultUrl: null,
//         resultDims: null,
//         error: null
//       };
//     }));

//     setFiles((prev) => [...prev, ...newFiles]);
//     if (!selectedId && newFiles.length > 0) {
//       setSelectedId(newFiles[0].id);
//     }
//     // Reset input
//     e.target.value = '';
//   };

//   const updateFile = (id, updates) => {
//     setFiles(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
//   };

//   const handleDelete = (id) => {
//     setFiles(prev => prev.filter(f => f.id !== id));
//     if (selectedId === id) setSelectedId(null);
//   };

//   // const downloadAll = () => {
//   //     files.filter(f => f.status === 'done').forEach(file => {
//   //       const a = document.createElement('a');
//   //       a.href = file.resultUrl;
//   //       a.download = `upscaled_${file.name}`;
//   //       document.body.appendChild(a);
//   //       a.click();
//   //       document.body.removeChild(a);
//   //     });
//   // };

//   // const downloadSingle = (file) => {
//   //   const a = document.createElement('a');
//   //   a.href = file.resultUrl;
//   //   a.download = `upscaled_${file.name}`;
//   //   document.body.appendChild(a);
//   //   a.click();
//   //   document.body.removeChild(a);
//   // };


//   const handleUpscale = async (id) => {
//     const fileObj = files.find(f => f.id === id);
//     if (!fileObj) return;

//     // 1. Update UI to processing state
//     updateFile(id, { status: 'processing', error: null });
//     setSelectedId(id); 

//     const formData = new FormData();
//     formData.append('file', fileObj.file);
//     formData.append('outscale', fileObj.scale);
//     formData.append('face_enhance', fileObj.faceEnhance);
//     // Defaults for parameters not currently in your UI state
//     formData.append('only_center_face', 'false');
//     formData.append('weight', 1.0);

//     try {
//       // Ensure your backend is running on port 8000
//       const response = await fetch('http://localhost:8000/api/enhance', {
//         method: 'POST',
//         body: formData,
//       });

//       if (!response.ok) {
//         const errData = await response.json().catch(() => ({}));
//         throw new Error(errData.detail || 'Server error during upscaling');
//       }

//       // 3. Convert response blob to URL
//       const blob = await response.blob();
//       if (blob.size === 0) throw new Error("Received empty image from server");
      
//       const resultUrl = URL.createObjectURL(blob);

//       // 4. Calculate new dimensions from the result image
//       // (This proves to the user that the image is actually larger)
//       const newDims = await getUrlDimensions(resultUrl);

//       // 5. Update State with Success
//       updateFile(id, { 
//         status: 'done', 
//         resultUrl: resultUrl,
//         resultDims: newDims 
//       });
      

//     } catch (err) {
//       console.error("Upscale failed:", err);
//       updateFile(id, { 
//         status: 'error', 
//         error: err.message || "Connection failed" 
//       });
//     }
//   };


//   const downloadAll = () => {
//     files.filter(f => f.status === 'done').forEach(file => {
//       const a = document.createElement('a');
//       a.href = file.resultUrl;
//       a.download = `upscaled_${file.name}`;
//       document.body.appendChild(a);
//       a.click();
//       document.body.removeChild(a);
//     });
//   };

//   const downloadSingle = (file) => {
//     const a = document.createElement('a');
//     a.href = file.resultUrl;
//     a.download = `upscaled_${file.name}`;
//     document.body.appendChild(a);
//     a.click();
//     document.body.removeChild(a);
//   };

//   const selectedFile = files.find(f => f.id === selectedId);

//   return (
//     <div className="bg-[#0b0f19] text-gray-300 font-sans h-screen flex flex-col overflow-hidden selection:bg-blue-500 selection:text-white">
      
//       <Header 
//         onUploadClick={() => fileInputRef.current?.click()}
//         fileInputRef={fileInputRef}
//         handleUpload={handleUpload}
//       />

//       <Workspace 
//         selectedFile={selectedFile} 
//       />

//       <ControlPanel 
//           files={files}
//           selectedId={selectedId}
//           setSelectedId={setSelectedId}
//           updateFile={updateFile}
//           handleUpscale={handleUpscale}
//           handleDelete={handleDelete}
//           onUploadClick={() => fileInputRef.current?.click()}
//           downloadAll={downloadAll}
//           downloadSingle={downloadSingle}
//         />

//     </div>
//   );
// }

import React, { useState, useRef } from 'react';
import Header from './components/layout/Header';
import Workspace from './components/layout/Workspace';
import ControlPanel from './components/layout/ControlPanel';

export default function App() {
  const [files, setFiles] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const fileInputRef = useRef(null);

  // Helper 1: Get dimensions from a raw File object (Input)
  const getImageDimensions = (file) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.width, height: img.height });
      img.onerror = () => resolve({ width: 0, height: 0 });
      img.src = URL.createObjectURL(file);
    });
  };

  // Helper 2: Get dimensions from a Blob URL (Output)
  const getUrlDimensions = (url) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.width, height: img.height });
      img.src = url;
    });
  };

  const handleUpload = async (e) => {
    if (!e.target.files) return;
    
    const newFiles = await Promise.all(Array.from(e.target.files).map(async (file) => {
      const dims = await getImageDimensions(file);
      return {
        id: Math.random().toString(36).substr(2, 9),
        file,
        name: file.name,
        previewUrl: URL.createObjectURL(file),
        width: dims.width,
        height: dims.height,
        status: 'idle',
        scale: 2,
        faceEnhance: false,
        resultUrl: null,
        resultDims: null,
        error: null
      };
    }));

    setFiles((prev) => [...prev, ...newFiles]);
    if (!selectedId && newFiles.length > 0) {
      setSelectedId(newFiles[0].id);
    }
    // Reset input
    e.target.value = '';
  };

  const updateFile = (id, updates) => {
    setFiles(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const handleDelete = (id) => {
    setFiles(prev => prev.filter(f => f.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const handleUpscale = async (id) => {
    const fileObj = files.find(f => f.id === id);
    if (!fileObj) return;

    // 1. Update UI to processing state
    updateFile(id, { status: 'processing', error: null });
    setSelectedId(id); 

    const formData = new FormData();
    formData.append('file', fileObj.file);
    
    // Debug: Log what we're sending
    console.log('Upscaling with settings:', {
      scale: fileObj.scale,
      faceEnhance: fileObj.faceEnhance,
      filename: fileObj.name
    });
    
    // Log FormData contents
    for (let pair of formData.entries()) {
      console.log(pair[0] + ': ' + pair[1]);
    }

    try {
      // Build URL with query parameters instead of FormData
      const url = new URL('/api/enhance', window.location.origin);
      url.searchParams.append('outscale', fileObj.scale.toString());
      url.searchParams.append('face_enhance', fileObj.faceEnhance.toString());
      url.searchParams.append('only_center_face', 'false');
      url.searchParams.append('weight', '0.5');
      
      console.log('Request URL:', url.toString());
      
      // Ensure your backend is running on port 8000
      const response = await fetch(url.toString(), {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || 'Server error during upscaling');
      }

      // 3. Convert response blob to URL
      const blob = await response.blob();
      if (blob.size === 0) throw new Error("Received empty image from server");
      
      const resultUrl = URL.createObjectURL(blob);
      console.log("Image URL created:", resultUrl); 

      const newDims = await getUrlDimensions(resultUrl);

      // 5. Update State with Success
      updateFile(id, { 
        status: 'done', 
        resultUrl: resultUrl,
        resultDims: newDims 
      });
      
      console.log('Upscale complete. New dimensions:', newDims);

    } catch (err) {
      console.error("Upscale failed:", err);
      updateFile(id, { 
        status: 'error', 
        error: err.message || "Connection failed" 
      });
    }
  };


  const downloadAll = () => {
    files.filter(f => f.status === 'done').forEach(file => {
      const a = document.createElement('a');
      a.href = file.resultUrl;
      a.download = `upscaled_${file.name}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    });
  };

  const downloadSingle = (file) => {
    const a = document.createElement('a');
    a.href = file.resultUrl;
    a.download = `upscaled_${file.name}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const selectedFile = files.find(f => f.id === selectedId);

  return (
    <div className="bg-[#0b0f19] text-gray-300 font-sans h-screen flex flex-col overflow-hidden selection:bg-blue-500 selection:text-white">
      
      <Header 
        onUploadClick={() => fileInputRef.current?.click()}
        fileInputRef={fileInputRef}
        handleUpload={handleUpload}
      />

      <Workspace 
        selectedFile={selectedFile} 
      />

      <ControlPanel 
          files={files}
          selectedId={selectedId}
          setSelectedId={setSelectedId}
          updateFile={updateFile}
          handleUpscale={handleUpscale}
          handleDelete={handleDelete}
          onUploadClick={() => fileInputRef.current?.click()}
          downloadAll={downloadAll}
          downloadSingle={downloadSingle}
        />

    </div>
  );
}