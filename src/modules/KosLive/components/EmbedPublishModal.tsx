import React, { useState } from 'react';
import { Share2, Copy, CheckCircle2, Globe, Code, Sparkles, ExternalLink } from 'lucide-react';
import { useKosLive } from '../context/KosLiveContext';
import { PageUiSettingsEditor } from './PageUiSettingsEditor';

export const EmbedPublishModal: React.FC = () => {
  const { activeProject } = useKosLive();
  const [copiedType, setCopiedType] = useState<string | null>(null);

  const campaignId = activeProject?.campaignSlug || activeProject?.id || 'demo-living-page';
  const publicUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/live/${campaignId}`;
  
  const iframeCode = `<iframe 
  src="${publicUrl}" 
  width="100%" 
  height="700px" 
  frameborder="0" 
  allow="camera; microphone; autoplay; encrypted-media" 
  style="border-radius: 24px; box-shadow: 0 10px 40px rgba(0,0,0,0.5);"
></iframe>`;

  const conciergeCode = `<!-- KosLive Floating Concierge Widget -->
<script src="${typeof window !== 'undefined' ? window.location.origin : ''}/koslive-concierge.js" 
  data-campaign="${campaignId}" 
  data-position="bottom-left" 
  async>
</script>`;

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4 sm:p-6 font-sans select-none" dir="rtl">
      
      <div className="mb-6 text-right">
        <h2 className="text-xl font-black text-white">הפצה, הגדרות תצוגה בעמוד והטמעה</h2>
        <p className="text-xs text-slate-400">
          קבעו אם ה-UI בעמוד גלוי או נסתר (כברירת מחדל: נסתר), ערכו את הטקסט ליד האווטאר והטמיעו את העמוד החי באתר.
        </p>
      </div>

      <div className="space-y-6">
        {/* אזור עריכת תצוגת ה-UI והאווטאר בעמוד */}
        <PageUiSettingsEditor />
        
        {/* Option 1: Direct Public Link */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl text-right">
          <div className="flex items-center gap-2 mb-2">
            <Globe className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold text-white">קישור ישיר לעמוד החי</h3>
          </div>
          <p className="text-xs text-slate-400 mb-4">
            שתפו קישור זה בוואטסאפ, ברשתות חברתיות או בקמפיינים ממומנים. הגולש יחווה עמוד וידאו אינטראקטיבי במסך מלא.
          </p>
          <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-2xl border border-slate-800">
            <input
              type="text"
              readOnly
              value={publicUrl}
              className="w-full bg-transparent text-xs text-amber-300 font-mono px-2 focus:outline-none"
            />
            <button
              onClick={() => copyToClipboard(publicUrl, 'link')}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shrink-0"
            >
              {copiedType === 'link' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedType === 'link' ? 'הועתק!' : 'העתק קישור'}</span>
            </button>
            <a
              href={publicUrl}
              target="_blank"
              rel="noreferrer"
              className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition"
              title="פתח קישור"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Option 2: Embed as Iframe */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl text-right">
          <div className="flex items-center gap-2 mb-2">
            <Code className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold text-white">הטמעה באמצעות Iframe (קוד HTML)</h3>
          </div>
          <p className="text-xs text-slate-400 mb-4">
            הטמיעו את הנגן האינטראקטיבי בתוך כל אתר אינטרנט קיים (וורדפרס, וויקס, או דף נחיתה).
          </p>
          <div className="relative bg-slate-950 p-3 rounded-2xl border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto">
            <pre dir="ltr">{iframeCode}</pre>
            <button
              onClick={() => copyToClipboard(iframeCode, 'iframe')}
              className="absolute top-2 right-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-1 transition cursor-pointer"
            >
              {copiedType === 'iframe' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedType === 'iframe' ? 'הועתק!' : 'העתק קוד'}</span>
            </button>
          </div>
        </div>

        {/* Option 3: Floating Concierge */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl text-right">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold text-white">קונסיירז' וידאו צף (Floating Avatar Concierge)</h3>
          </div>
          <p className="text-xs text-slate-400 mb-4">
            ווידג'ט צף אלגנטי בפינת המסך שמציג את האווטאר המזמין את הגולשים לשוחח או לקבל עזרה.
          </p>
          <div className="relative bg-slate-950 p-3 rounded-2xl border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto">
            <pre dir="ltr">{conciergeCode}</pre>
            <button
              onClick={() => copyToClipboard(conciergeCode, 'concierge')}
              className="absolute top-2 right-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-1 transition cursor-pointer"
            >
              {copiedType === 'concierge' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedType === 'concierge' ? 'הועתק!' : 'העתק קוד'}</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
