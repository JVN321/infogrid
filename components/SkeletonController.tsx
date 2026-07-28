"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PortalData } from "@/data/skeletonData";
import { Code, Eye, RefreshCw, Copy, Check, Sliders, Layers, Smartphone, LayoutDashboard } from "lucide-react";

interface SkeletonControllerProps {
  data: PortalData;
  setData: (newData: PortalData) => void;
  isSkeleton: boolean;
  setIsSkeleton: (val: boolean) => void;
  onReset: () => void;
  is916View: boolean;
  setIs916View: (val: boolean) => void;
}

export const SkeletonController: React.FC<SkeletonControllerProps> = ({
  data,
  setData,
  isSkeleton,
  setIsSkeleton,
  onReset,
  is916View,
  setIs916View,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [jsonInput, setJsonInput] = useState(JSON.stringify(data, null, 2));
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleApplyJson = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      setData(parsed);
      setError(null);
      setIsOpen(false);
    } catch (err: any) {
      setError("Invalid JSON format. Please check your syntax.");
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      {/* Top Floating Control Bar */}
      <div className="fixed top-2 right-2 sm:top-3 sm:right-3 z-50 flex items-center gap-1.5 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-200/90 shadow-md text-xs">
        {/* Link to Admin Page */}
        <Link
          href="/admin"
          className="flex items-center gap-1 px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold rounded-full transition-all shadow-2xs"
          title="Open Admin Dashboard"
        >
          <LayoutDashboard className="w-3 h-3 text-blue-400" />
          <span>Admin Dashboard</span>
        </Link>

        {/* Toggle 9:16 Frame Preview */}
        <button
          onClick={() => setIs916View(!is916View)}
          className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-full transition-all ${
            is916View
              ? "bg-indigo-600 text-white shadow-2xs"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
          title="Toggle 9:16 Aspect Ratio Frame"
        >
          <Smartphone className="w-3 h-3" />
          <span>{is916View ? "9:16 Frame: ON" : "9:16 Mode"}</span>
        </button>

        {/* Toggle Pulse Skeleton state */}
        <button
          onClick={() => setIsSkeleton(!isSkeleton)}
          className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-full transition-all ${
            isSkeleton
              ? "bg-amber-500 text-white shadow-2xs"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          {isSkeleton ? <Layers className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
          <span>{isSkeleton ? "Skeleton ON" : "Skeleton"}</span>
        </button>

        {/* JSON Skeleton Editor Button */}
        <button
          onClick={() => {
            setJsonInput(JSON.stringify(data, null, 2));
            setIsOpen(true);
          }}
          className="flex items-center gap-1 px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold rounded-full transition-all shadow-2xs"
        >
          <Code className="w-3 h-3" />
          <span>Edit Data</span>
        </button>
      </div>

      {/* Slide-over / Modal JSON Editor */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-blue-600" />
                <h3 className="font-extrabold text-slate-900 text-base">
                  Skeleton Placeholder JSON Configuration
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-green-600" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy JSON</span>
                    </>
                  )}
                </button>
                <button
                  onClick={onReset}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reset Defaults</span>
                </button>
              </div>
            </div>

            {/* Modal Body: Editor */}
            <div className="p-6 flex-1 overflow-y-auto">
              <p className="text-xs text-slate-500 mb-3">
                Modify the JSON values below to instantly update the college dashboard text, titles, news cards, events, and badges.
              </p>
              {error && (
                <div className="mb-3 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl">
                  {error}
                </div>
              )}
              <textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                rows={16}
                className="w-full font-mono text-xs p-4 bg-slate-900 text-slate-100 rounded-2xl border border-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none leading-relaxed"
              ></textarea>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyJson}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all"
              >
                Apply Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
