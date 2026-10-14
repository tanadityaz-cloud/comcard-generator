import React, { useState } from 'react';
import { Undo, Redo, Download, Check, ArrowRight } from 'lucide-react';
import { TEMPLATES } from '../data/mockData';
import { TemplateId } from '../types';

interface TemplatesViewProps {
  selectedTemplateId: TemplateId;
  onSelectTemplate: (templateId: TemplateId) => void;
  onOpenExport: () => void;
}

export const TemplatesView: React.FC<TemplatesViewProps> = ({
  selectedTemplateId,
  onSelectTemplate,
  onOpenExport,
}) => {
  const [activeTabTemplate, setActiveTabTemplate] = useState<TemplateId>(selectedTemplateId);

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#F7F6F2]">
      {/* Top App Bar Header */}
      <header className="flex justify-between items-center h-16 px-10 w-full z-30 bg-white border-b border-[#E7E5E0] sticky top-0">
        <div className="flex items-center gap-4">
          <h1 className="font-semibold text-base text-[#171717]">Select a Template</h1>
        </div>

        <div className="flex items-center gap-3">
          <button className="w-8 h-8 flex items-center justify-center rounded-full text-[#6B6B6B] hover:bg-[#FAF9F5] transition-colors">
            <Undo className="w-4 h-4" />
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-full text-[#6B6B6B] hover:bg-[#FAF9F5] transition-colors mr-2">
            <Redo className="w-4 h-4" />
          </button>
          <button className="px-4 py-2 text-xs font-semibold border border-[#E7E5E0] rounded-lg text-[#171717] hover:bg-[#FAF9F5] transition-colors">
            Save
          </button>
          <button
            onClick={onOpenExport}
            className="px-4 py-2 text-xs font-semibold bg-[#171717] text-white rounded-lg flex items-center gap-2 hover:bg-black transition-colors shadow-2xs"
          >
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-10">
        <div className="max-w-6xl mx-auto">
          {/* Header Title Section */}
          <div className="mb-10">
            <h2 className="text-3xl font-serif-display font-medium text-[#171717] mb-2">
              Curated Templates
            </h2>
            <p className="text-[#6B6B6B] text-sm max-w-2xl leading-relaxed">
              Start with a professionally designed layout. Our templates are crafted to highlight your portfolio with editorial precision.
            </p>
          </div>

          {/* Templates 3-Column Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {TEMPLATES.map((tmpl) => {
              const isSelected = activeTabTemplate === tmpl.id;

              return (
                <div
                  key={tmpl.id}
                  className={`group flex flex-col bg-white rounded-2xl overflow-hidden transition-all duration-300 relative ${
                    isSelected
                      ? 'border-2 border-[#171717] shadow-xl'
                      : 'border border-[#E7E5E0] hover:shadow-lg hover:border-[#171717]/50'
                  }`}
                >
                  {/* Selected Active Badge */}
                  {isSelected && (
                    <div className="absolute top-4 right-4 bg-[#171717] text-white w-7 h-7 rounded-full flex items-center justify-center z-10 shadow-md">
                      <Check className="w-4 h-4" />
                    </div>
                  )}

                  {/* Template Card Preview Frame */}
                  <div className="p-6 bg-[#FAF9F5] aspect-[3/4] flex items-center justify-center relative overflow-hidden">
                    <img
                      src={tmpl.previewUrl}
                      alt={tmpl.name}
                      className={`w-full h-full object-cover shadow-xs absolute inset-0 transition-opacity ${
                        isSelected ? 'opacity-100' : 'opacity-90 group-hover:opacity-100'
                      }`}
                    />

                    {/* Hover Action Overlay */}
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-2xs p-4">
                      <button
                        onClick={() => {
                          setActiveTabTemplate(tmpl.id);
                          onSelectTemplate(tmpl.id);
                        }}
                        className={`px-6 py-3 rounded-full font-semibold text-xs transition-all shadow-lg hover:scale-105 ${
                          isSelected
                            ? 'bg-white text-[#171717] border border-[#E7E5E0]'
                            : 'bg-[#171717] text-white'
                        }`}
                      >
                        {isSelected ? 'Edit Currently Selected' : 'Use Template'}
                      </button>
                    </div>
                  </div>

                  {/* Bottom Meta Bar */}
                  <div className="p-5 border-t border-[#E7E5E0] flex justify-between items-center bg-white">
                    <div>
                      <h3 className="font-bold text-sm text-[#171717]">{tmpl.name}</h3>
                      <p className="text-xs text-[#6B6B6B] mt-1">{tmpl.tagline}</p>
                    </div>
                    {!isSelected && (
                      <ArrowRight className="w-5 h-5 text-[#6B6B6B] group-hover:text-[#171717] transition-colors" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
