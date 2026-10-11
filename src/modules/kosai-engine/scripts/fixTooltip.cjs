const fs = require('fs');

let content = fs.readFileSync('src/modules/kosai-engine/components/KosaiSettingsBackoffice.tsx', 'utf8');

const oldTooltip = `  return (
    <div className="relative inline-block ml-1 z-10" ref={ref}>
      <button 
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-4 h-4 rounded-full bg-purple-100 text-purple-600 hover:bg-purple-200 transition-colors focus:outline-none"
      >
        <span className="text-[10px] font-black font-serif italic">i</span>
      </button>
      
      {isOpen && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-4 bg-slate-900 text-white text-sm rounded-xl shadow-xl z-20">
          <button 
            onClick={() => setIsOpen(false)}
            className="absolute top-2 right-2 text-slate-400 hover:text-white"
          >
            <X className="w-3 h-3" />
          </button>
          <p className="mt-1 pl-4 leading-relaxed">{text}</p>
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900"></div>
        </div>
      )}
    </div>
  );`;

const newTooltip = `  return (
    <div className="relative inline-block ml-1.5 z-10" ref={ref}>
      <span 
        onClick={() => setIsOpen(!isOpen)}
        className="cursor-pointer text-[11px] font-black text-purple-400 hover:text-purple-600 transition-colors border border-purple-200 hover:border-purple-400 rounded-full w-4 h-4 inline-flex items-center justify-center bg-purple-50/50"
        title="מידע נוסף"
      >
        ?
      </span>
      
      {isOpen && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-56 p-3 bg-purple-900 text-white text-xs rounded-xl shadow-xl z-20 border border-purple-800">
          <p className="leading-relaxed font-medium">{text}</p>
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-purple-900"></div>
        </div>
      )}
    </div>
  );`;

content = content.replace(oldTooltip, newTooltip);

fs.writeFileSync('src/modules/kosai-engine/components/KosaiSettingsBackoffice.tsx', content, 'utf8');
console.log('Fixed tooltip');
