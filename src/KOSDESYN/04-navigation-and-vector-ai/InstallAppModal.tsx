import React, { useState } from 'react';
import {
  Smartphone,
  X,
  ShieldCheck,
  ExternalLink,
  Copy,
  Check,
  QrCode,
  Info
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { usePWAInstall } from '../utils/usePWAInstall';
import { sound } from '../utils/audio';
import { KosunVectorIcon } from './KosunLogo';
import { getTerminology } from '../../KOSUN2026/factory/pageTerminologyDictionary';

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  archetypeId?: string;
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({
  isOpen,
  onClose,
  archetypeId = 'saas',
}) => {
  const { isInstallable, installPWA } = usePWAInstall();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const appUrl =
    typeof window !== 'undefined' && window.location.origin.includes('run.app')
      ? window.location.origin
      : 'https://ais-pre-mukxnlmf6xqvm7m5cle43q-48180437223.europe-west2.run.app';

  const handleCopyLink = () => {
    sound.playPop();
    navigator.clipboard.writeText(appUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleOpenDirect = () => {
    sound.playPop();
    window.open(appUrl, '_blank');
  };

  const handleDirectInstall = async () => {
    sound.playPop();
    const success = await installPWA();
    if (success) {
      sound.playFanfare();
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[#070913]/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200 text-[#F0F4FF]"
      onClick={onClose}
    >
      <div
        className="bg-[#0D0E1F] rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#1A2B4C] relative space-y-4 max-h-[92vh] overflow-y-auto animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 rounded-full text-[#F0F4FF]/50 hover:text-white hover:bg-[#1A2B4C] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <KosunVectorIcon size={44} />
          <div>
            <h3 className="text-base sm:text-lg font-black text-white leading-tight font-['Orbitron',sans-serif]">
              {getTerminology('install_modal_title', archetypeId)}
            </h3>
            <p className="text-xs text-[#00F0FF] mt-0.5">
              {getTerminology('install_modal_subtitle', archetypeId)}
            </p>
          </div>
        </div>

        {/* Info callout */}
        <div className="p-4 bg-[#12162B] border border-[#1A2B4C] rounded-2xl text-xs sm:text-sm text-[#F0F4FF]/80 space-y-1.5 leading-relaxed">
          <div className="flex items-center gap-2 font-bold text-[#00F0FF]">
            <Info className="w-4 h-4 shrink-0 text-[#00F0FF]" />
            <span>{getTerminology('install_modal_callout_title', archetypeId)}</span>
          </div>
          <p className="text-xs text-[#F0F4FF]/70">
            {getTerminology('install_modal_callout_desc', archetypeId)}
          </p>
        </div>

        {/* Step 1: Open direct link */}
        <div className="p-4 bg-[#070913] border border-[#1A2B4C] rounded-2xl space-y-3">
          <span className="text-sm font-bold text-white block">
            {getTerminology('install_modal_step1_title', archetypeId)}
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenDirect}
              className="flex-1 min-h-[44px] py-2.5 px-4 bg-gradient-to-r from-[#00F0FF] to-[#00A3FF] hover:brightness-110 active:scale-98 text-[#070913] rounded-full text-xs sm:text-sm font-black flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(0,240,255,0.3)] transition-all cursor-pointer"
            >
              <ExternalLink className="w-4 h-4" />
              <span>{getTerminology('install_modal_open_direct_btn', archetypeId)}</span>
            </button>

            <button
              onClick={handleCopyLink}
              title={getTerminology('install_modal_copy_tooltip', archetypeId)}
              className="p-3 bg-[#1A2B4C] border border-[#1A2B4C] hover:border-[#00F0FF]/50 rounded-full text-sm font-medium text-[#00F0FF] flex items-center gap-1 cursor-pointer transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-[#00F0FF]" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          {copied && (
            <p className="text-xs text-[#00F0FF] font-medium text-center animate-in fade-in">
              {getTerminology('install_modal_copied_msg', archetypeId)}
            </p>
          )}

          {/* QR Code */}
          <div className="pt-2 border-t border-[#1A2B4C] flex flex-col items-center justify-center text-center space-y-2">
            <span className="text-xs text-[#F0F4FF]/60 font-medium flex items-center gap-1.5">
              <QrCode className="w-4 h-4 text-[#00F0FF]" />
              <span>{getTerminology('install_modal_qr_label', archetypeId)}</span>
            </span>

            <div className="p-3 bg-white rounded-2xl shadow-md inline-block">
              <QRCodeSVG
                value={appUrl}
                size={140}
                level="M"
                includeMargin={false}
              />
            </div>
          </div>
        </div>

        {/* Step 2: Install instructions */}
        <div className="p-4 bg-[#070913] border border-[#1A2B4C] rounded-2xl space-y-2 text-xs sm:text-sm text-[#F0F4FF]/80">
          <span className="font-bold text-white block">
            {getTerminology('install_modal_step2_title', archetypeId)}
          </span>
          <ol className="list-decimal list-inside space-y-1 text-[#F0F4FF]/75 pr-1 text-xs">
            <li>{getTerminology('install_modal_chrome_instr', archetypeId)}</li>
            <li>{getTerminology('install_modal_safari_instr', archetypeId)}</li>
          </ol>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-[#1A2B4C]">
          <div className="flex items-center gap-1.5 text-xs text-[#00F0FF]">
            <ShieldCheck className="w-4 h-4" />
            <span>התקנה עצמאית ומאובטחת</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#1A2B4C] hover:bg-[#1A2B4C]/80 text-white rounded-full text-xs font-bold transition-all cursor-pointer"
          >
            {getTerminology('quick_capture_close_btn', archetypeId)}
          </button>
        </div>
      </div>
    </div>
  );
};
