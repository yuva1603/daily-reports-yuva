import React, { useState } from 'react';
import { MessageSquare, ExternalLink, Copy, Check, X } from 'lucide-react';
import { Card, Button } from '../common';
import { openWhatsAppDirectly } from '../../utils/formatters';

export const WhatsAppModal = ({ modal, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!modal.isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(modal.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleOpenWhatsApp = () => {
    openWhatsAppDirectly(modal.phoneNumber, modal.text);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <Card className="w-full max-w-lg border border-emerald-500/30 bg-[#0a0d14] space-y-4 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-emerald-400">
            <MessageSquare className="w-5 h-5" />
            <h3 className="text-base font-bold text-white">Send Report via WhatsApp</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300">
          ✅ Report submitted successfully! WhatsApp is ready to send to{' '}
          <strong>{modal.recipientName || 'Recipient'} ({modal.phoneNumber || 'No phone set'})</strong>.
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase tracking-wider">
            <span>Pre-formatted WhatsApp Message</span>
            <button
              onClick={handleCopy}
              className="text-amber-400 hover:text-amber-300 flex items-center gap-1 font-mono normal-case cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied!' : 'Copy Text'}
            </button>
          </div>
          <pre className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 font-mono text-xs whitespace-pre-wrap max-h-56 overflow-y-auto leading-relaxed">
            {modal.text}
          </pre>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-slate-800">
          <Button
            onClick={handleOpenWhatsApp}
            className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 text-slate-950 font-bold gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            Open WhatsApp & Send Now 🚀
          </Button>
          <Button onClick={onClose} variant="secondary" className="sm:w-28">
            Done
          </Button>
        </div>
      </Card>
    </div>
  );
};
