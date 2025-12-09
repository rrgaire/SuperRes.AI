import React from 'react';
import { Sliders, Zap, User } from 'lucide-react';

const Controls = ({ settings, setSettings, disabled }) => {
  
  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-8">
      <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
        <Sliders size={20} className="text-primary" />
        <h3 className="font-semibold text-slate-800">Configuration</h3>
      </div>

      {/* 1. Upscale Factor */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-3 flex justify-between">
          <span>Upscale Factor</span>
          <span className="text-primary font-bold bg-blue-50 px-2 rounded">x{settings.outscale}</span>
        </label>
        <div className="grid grid-cols-3 gap-2">
          {[2, 4, 8].map((scale) => (
            <button
              key={scale}
              onClick={() => handleChange('outscale', scale)}
              disabled={disabled}
              className={`py-2 px-4 rounded-lg text-sm font-medium transition-all border ${
                settings.outscale === scale
                  ? 'bg-primary text-white border-primary shadow-md shadow-blue-200'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:bg-slate-50'
              }`}
            >
              x{scale}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Face Enhancement Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-md ${settings.face_enhance ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
              <User size={18} />
            </div>
            <label className="text-sm font-medium text-slate-700">Face Restoration</label>
          </div>
          
          {/* Toggle Switch */}
          <button
            onClick={() => handleChange('face_enhance', !settings.face_enhance)}
            disabled={disabled}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
              settings.face_enhance ? 'bg-green-500' : 'bg-slate-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${
                settings.face_enhance ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* 3. Restoration Strength Slider - Conditional Logic */}
        <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
          settings.face_enhance ? 'max-h-24 opacity-100 pt-2' : 'max-h-0 opacity-50'
        }`}>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div className="flex justify-between text-xs text-slate-500 mb-2">
              <span>Restoration Strength</span>
              <span className="font-mono text-slate-900">{settings.weight}</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={settings.weight}
              onChange={(e) => handleChange('weight', parseFloat(e.target.value))}
              disabled={!settings.face_enhance || disabled}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-green-500 hover:accent-green-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>Original</span>
              <span>Restored</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Controls;