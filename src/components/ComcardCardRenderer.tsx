import React, { forwardRef } from 'react';
import { Comcard, TemplateId } from '../types';
import { OrlandLogo } from './OrlandLogo';

interface ComcardCardRendererProps {
  comcard: Comcard;
  scale?: number;
  className?: string;
  isExporting?: boolean;
}

export const ComcardCardRenderer = forwardRef<HTMLDivElement, ComcardCardRendererProps>(
  ({ comcard, scale = 1, className = '', isExporting = false }, ref) => {
    const {
      displayName,
      name,
      stats,
      contact,
      visibleStats,
      templateId,
      accentColor = '#171717',
      photos,
      experience,
    } = comcard;

    const hasExperience = Boolean(
      experience?.showOnCard && experience?.items && experience.items.length > 0
    );
    const experienceItems = experience?.items || [];
    const experienceHeadline = experience?.headline || 'Selected Credits & Experience';

    // Bulletproof photo renderer:
    // 1. absolute inset-0 prevents the image from ever expanding or breaking the parent flex/grid frame
    // 2. crop offsets are converted from the 256x320 crop modal coordinates to percentages so they are 100% responsive and identical in any container size
    // 3. transform translate then scale with center origin matches PhotoCropModal exactly
    const renderPhoto = (
      photo: { url: string; zoom?: number; cropX?: number; cropY?: number },
      altText: string,
      aspectClass: string = 'aspect-[3/4]',
      extraWrapperClass: string = ''
    ) => {
      const zoom = Math.max(0.5, Math.min(3, photo?.zoom || 1));
      const cropX = photo?.cropX || 0;
      const cropY = photo?.cropY || 0;
      // In PhotoCropModal, reference frame is 256px wide by 320px tall
      const xPercent = (cropX / 256) * 100;
      const yPercent = (cropY / 320) * 100;

      return (
        <div className={`relative overflow-hidden bg-[#F5F4F0] select-none ${aspectClass} ${extraWrapperClass}`}>
          {photo?.url ? (
            <div className="absolute inset-0 w-full h-full overflow-hidden flex items-center justify-center pointer-events-none">
              <img
                src={photo.url}
                alt={altText}
                className="w-full h-full object-cover block pointer-events-none select-none transition-transform duration-100"
                style={{
                  transform: `translate(${xPercent}%, ${yPercent}%) scale(${zoom})`,
                  transformOrigin: 'center center',
                }}
                crossOrigin="anonymous"
                referrerPolicy="no-referrer"
                draggable={false}
              />
            </div>
          ) : (
            <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center text-[#747878] p-3 text-center border border-dashed border-[#C4C7C7]">
              <span className="material-symbols-outlined text-xl mb-1">add_a_photo</span>
              <span className="text-[10px]">Photo Slot</span>
            </div>
          )}
        </div>
      );
    };

    // Filter active visible stats
    const activeStats = [
      visibleStats.height && { label: 'HEIGHT', value: stats.height },
      visibleStats.weight && { label: 'WEIGHT', value: stats.weight },
      visibleStats.bust && { label: 'BUST', value: stats.bust },
      visibleStats.waist && { label: 'WAIST', value: stats.waist },
      visibleStats.hips && { label: 'HIPS', value: stats.hips },
      visibleStats.shoeSize && { label: 'SHOES', value: stats.shoeSize },
      visibleStats.clothingSize && { label: 'SUIT/DRESS', value: stats.clothingSize },
      visibleStats.hair && { label: 'HAIR', value: stats.hair },
      visibleStats.eyes && { label: 'EYES', value: stats.eyes },
    ].filter(Boolean) as { label: string; value: string }[];

    const baseWidth = 595;
    const baseHeight = 842;
    const scaledWidth = Math.round(baseWidth * scale);
    const scaledHeight = Math.round(baseHeight * scale);

    return (
      <div
        className={`relative shrink-0 flex items-center justify-center transition-all ${className}`}
        style={{
          width: `${scaledWidth}px`,
          height: `${scaledHeight}px`,
        }}
      >
        <div
          ref={ref}
          id="comcard-printable-area"
          className="bg-white text-[#1b1c1a] shadow-2xl relative overflow-hidden select-none"
          style={{
            width: `${baseWidth}px`,
            height: `${baseHeight}px`,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            position: 'absolute',
            top: 0,
            left: 0,
          }}
        >
        {/* ==================== TEMPLATE 1: CLASSIC STANDARD ==================== */}
        {templateId === 'classic' && (
          <div className="w-full h-full p-6 flex flex-col justify-between bg-[#FAF9F5] border border-[#E7E5E0] box-border">
            {/* Header / Agency Bar */}
            <div className="flex justify-between items-center pb-2 border-b border-[#E7E5E0] shrink-0">
              <div className="flex items-center gap-2">
                {contact.agency?.toUpperCase().includes('ORLAND') ? (
                  <div className="w-36 h-7 flex items-center">
                    <OrlandLogo width="100%" height="auto" />
                  </div>
                ) : (
                  <span className="font-bold text-[13px] tracking-[0.2em] uppercase text-[#171717]">
                    {contact.agency || 'ORLAND MANAGEMENT'}
                  </span>
                )}
              </div>
              <div className="text-[9px] tracking-[0.15em] text-[#6B6B6B] font-medium uppercase">
                MODEL COMPOSITE CARD
              </div>
            </div>

            {/* Main Visual Content (Hero Left + 4-Grid Right) - Fixed Height to prevent overflow */}
            <div className="grid grid-cols-12 gap-3.5 my-2.5 h-[525px] shrink-0">
              {/* Left Main Hero Image (5 cols) */}
              <div className="col-span-5 h-full rounded-xs overflow-hidden border border-[#E7E5E0] shadow-2xs">
                {renderPhoto(photos.main, 'Main Portrait', 'h-full w-full')}
              </div>

              {/* Right 4-Photo Portfolio Grid (7 cols) */}
              <div className="col-span-7 grid grid-cols-2 grid-rows-2 gap-2.5 h-full">
                <div className="h-full rounded-xs overflow-hidden border border-[#E7E5E0] shadow-2xs">
                  {renderPhoto(photos.grid1, 'Portfolio 1', 'h-full w-full')}
                </div>
                <div className="h-full rounded-xs overflow-hidden border border-[#E7E5E0] shadow-2xs">
                  {renderPhoto(photos.grid2, 'Portfolio 2', 'h-full w-full')}
                </div>
                <div className="h-full rounded-xs overflow-hidden border border-[#E7E5E0] shadow-2xs">
                  {renderPhoto(photos.grid3, 'Portfolio 3', 'h-full w-full')}
                </div>
                <div className="h-full rounded-xs overflow-hidden border border-[#E7E5E0] shadow-2xs">
                  {renderPhoto(photos.grid4, 'Portfolio 4', 'h-full w-full')}
                </div>
              </div>
            </div>

            {/* Bottom Section: Name & Measurements Grid & Contact */}
            <div className="pt-2.5 border-t border-[#E7E5E0] flex flex-col gap-2.5 bg-white p-3.5 rounded-xs border shadow-2xs shrink-0">
              <div className="flex justify-between items-end">
                <div>
                  <h2 className="text-xl font-bold font-serif-display tracking-tight text-[#171717]">
                    {displayName || name || 'SARAH PUTRI'}
                  </h2>
                  <p className="text-[9.5px] tracking-[0.15em] text-[#6B6B6B] uppercase font-semibold">
                    {comcard.nationality} {comcard.gender} • {comcard.age} YRS
                  </p>
                </div>
                <div className="text-right text-[10px] text-[#6B6B6B] font-mono">
                  {contact.instagram && <div>{contact.instagram}</div>}
                  {contact.phone && <div>{contact.phone}</div>}
                </div>
              </div>

              {/* Stats Table Grid */}
              <div className="grid grid-cols-4 gap-1.5 pt-1.5 border-t border-[#E7E5E0] text-[9.5px]">
                {activeStats.slice(0, 8).map((stat, idx) => (
                  <div key={idx} className="bg-[#FAF9F5] p-1.5 rounded-xs border border-[#E7E5E0]/60">
                    <span className="block text-[#747878] font-bold text-[7.5px] tracking-wider uppercase">
                      {stat.label}
                    </span>
                    <span className="font-semibold text-[#171717] truncate block">{stat.value}</span>
                  </div>
                ))}
              </div>

              {/* Optional Experience Strip */}
              {hasExperience && (
                <div className="pt-1.5 border-t border-[#E7E5E0] flex items-center gap-2 text-[8.5px] text-[#555]">
                  <span className="font-bold text-[#171717] tracking-wider uppercase shrink-0">
                    {experienceHeadline}:
                  </span>
                  <span className="truncate font-medium text-[#444]">
                    {experienceItems.join(' • ')}
                  </span>
                </div>
              )}

              {/* Footer Agency Contact */}
              <div className="flex justify-between items-center text-[8.5px] text-[#747878] pt-1">
                <span>{contact.email || 'booking@agency.com'}</span>
                <span>{contact.website || 'www.agency.com'}</span>
              </div>
            </div>
          </div>
        )}

        {/* ==================== TEMPLATE 2: EDITORIAL ==================== */}
        {templateId === 'editorial' && (
          <div className="w-full h-full p-6 flex flex-col justify-between bg-white border border-[#E7E5E0] box-border">
            {/* Header */}
            <div className="flex justify-between items-center pb-2 shrink-0">
              {contact.agency?.toUpperCase().includes('ORLAND') ? (
                <div className="w-36 h-7 flex items-center">
                  <OrlandLogo width="100%" height="auto" />
                </div>
              ) : (
                <span className="font-playfair text-xs tracking-widest uppercase font-semibold text-[#171717]">
                  {contact.agency || 'ORLAND EDITORIAL'}
                </span>
              )}
              <span className="text-[9px] tracking-widest text-[#6B6B6B] uppercase font-medium">
                PORTFOLIO
              </span>
            </div>

            {/* Editorial Hero Frame with Overlay Title */}
            <div className="relative rounded-xs overflow-hidden border border-[#171717] h-[400px] shadow-sm mb-2.5 shrink-0">
              {renderPhoto(photos.main, 'Editorial Hero', 'h-full w-full')}
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/20 flex flex-col justify-between p-5 text-white pointer-events-none">
                <div className="text-right text-[10px] tracking-widest uppercase opacity-90">
                  {comcard.nationality} • {comcard.age} YRS
                </div>
                <div>
                  <div className="text-[9px] tracking-[0.25em] uppercase text-[#DCC174] font-semibold mb-1">
                    THE ART OF EDITORIAL
                  </div>
                  <h1 className="text-3xl font-playfair font-medium tracking-tight text-white drop-shadow-md">
                    {displayName || name || 'SARAH PUTRI'}
                  </h1>
                </div>
              </div>
            </div>

            {/* 3 Portfolio Accent Thumbnails */}
            <div className="grid grid-cols-3 gap-2.5 mb-2.5 h-[155px] shrink-0">
              <div className="rounded-xs overflow-hidden border border-[#E7E5E0] flex flex-col h-full">
                <div className="flex-1 min-h-0 overflow-hidden">
                  {renderPhoto(photos.grid1, 'Editorial Shot 1', 'h-full w-full')}
                </div>
                <div className="p-1 text-center bg-[#FAF9F5] text-[8px] font-medium text-[#6B6B6B] uppercase tracking-wider border-t border-[#E7E5E0] shrink-0">
                  Portrait
                </div>
              </div>
              <div className="rounded-xs overflow-hidden border border-[#E7E5E0] flex flex-col h-full">
                <div className="flex-1 min-h-0 overflow-hidden">
                  {renderPhoto(photos.grid2, 'Editorial Shot 2', 'h-full w-full')}
                </div>
                <div className="p-1 text-center bg-[#FAF9F5] text-[8px] font-medium text-[#6B6B6B] uppercase tracking-wider border-t border-[#E7E5E0] shrink-0">
                  Editorial
                </div>
              </div>
              <div className="rounded-xs overflow-hidden border border-[#E7E5E0] flex flex-col h-full">
                <div className="flex-1 min-h-0 overflow-hidden">
                  {renderPhoto(photos.grid3, 'Editorial Shot 3', 'h-full w-full')}
                </div>
                <div className="p-1 text-center bg-[#FAF9F5] text-[8px] font-medium text-[#6B6B6B] uppercase tracking-wider border-t border-[#E7E5E0] shrink-0">
                  Commercial
                </div>
              </div>
            </div>

            {/* Editorial Bottom Specs Bar */}
            <div className="border-t-2 border-[#171717] pt-2.5 bg-[#FAF9F5] p-3 rounded-xs flex flex-col gap-2 shrink-0">
              <div className="flex flex-wrap justify-between items-center text-[9.5px] font-medium text-[#171717] gap-y-1">
                {activeStats.map((stat, idx) => (
                  <span key={idx} className="whitespace-nowrap">
                    <strong className="text-[#6B6B6B] text-[7.5px] uppercase tracking-wider mr-1">
                      {stat.label}:
                    </strong>
                    {stat.value}
                  </span>
                ))}
              </div>
              {/* Optional Experience Strip */}
              {hasExperience && (
                <div className="pt-1.5 border-t border-[#E7E5E0] flex items-center gap-2 text-[8.5px]">
                  <span className="font-bold text-[#171717] tracking-wider uppercase shrink-0">
                    {experienceHeadline}:
                  </span>
                  <span className="truncate italic font-serif text-[#444]">
                    {experienceItems.join(' • ')}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center pt-1.5 border-t border-[#E7E5E0] text-[8.5px] text-[#6B6B6B]">
                <span>{contact.instagram || '@model_portfolio'}</span>
                <span>{contact.phone || contact.email || 'booking@agency.com'}</span>
              </div>
            </div>
          </div>
        )}

        {/* ==================== TEMPLATE 3: MINIMALIST ==================== */}
        {templateId === 'minimal' && (
          <div className="w-full h-full p-7 flex flex-col justify-between bg-[#FAF9F5] box-border">
            {/* Header Tabs Navigation Simulation */}
            <div className="flex justify-between items-center text-[10px] text-[#6B6B6B] border-b border-[#E7E5E0] pb-2.5 shrink-0">
              <div className="font-mono tracking-widest text-[#171717] font-semibold flex items-center gap-2">
                {contact.agency?.toUpperCase().includes('ORLAND') ? (
                  <div className="w-32 h-6 flex items-center">
                    <OrlandLogo width="100%" height="auto" />
                  </div>
                ) : (
                  contact.agency || 'ORLAND MANAGEMENT'
                )}
              </div>
              <div className="flex gap-4">
                <span className="underline font-medium text-[#171717]">Portfolio</span>
                <span>Specs</span>
                <span>Contact</span>
              </div>
            </div>

            {/* Minimal High Impact Center Visual */}
            <div className="my-auto py-1 flex flex-col items-center shrink-0">
              <div className={`w-[320px] ${hasExperience ? 'h-[385px]' : 'h-[430px]'} bg-white p-2.5 shadow-sm border border-[#E7E5E0] rounded-xs mb-3`}>
                {renderPhoto(photos.main, 'Minimal Portrait', 'w-full h-full')}
              </div>

              <div className="text-center max-w-sm">
                <h1 className="text-2xl font-serif-display font-normal text-[#171717] tracking-wider uppercase mb-0.5">
                  {displayName || name || 'SARAH PUTRI'}
                </h1>
                <p className="text-[10px] text-[#6B6B6B] font-mono tracking-widest mb-1.5">
                  (Ref. MODEL-2026-{comcard.id.slice(-3).toUpperCase()})
                </p>

                {/* Clean Specs String */}
                <div className="text-[10.5px] text-[#171717] space-y-0.5 font-sans-ui">
                  <p>
                    <strong>Height:</strong> {stats.height}
                    {visibleStats.weight && stats.weight && (
                      <>
                        {' • '}
                        <strong>Weight:</strong> {stats.weight}
                      </>
                    )}
                    {' • '}
                    <strong>Bust:</strong> {stats.bust}
                  </p>
                  <p>
                    <strong>Waist:</strong> {stats.waist} • <strong>Hips:</strong> {stats.hips}
                  </p>
                  <p>
                    <strong>Shoes:</strong> {stats.shoeSize} • <strong>Hair:</strong> {stats.hair} •{' '}
                    <strong>Eyes:</strong> {stats.eyes}
                  </p>
                </div>

                {/* Optional Experience Strip */}
                {hasExperience && (
                  <div className="pt-2 border-t border-[#E7E5E0] text-[9px] text-center text-[#555] max-w-sm mt-2">
                    <span className="font-bold text-[#171717] tracking-wider uppercase mr-1">
                      {experienceHeadline}:
                    </span>
                    <span className="italic font-serif text-[#444]">
                      {experienceItems.join(' • ')}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Minimal Footer */}
            <div className="pt-3 border-t border-[#E7E5E0] flex justify-between items-center text-[9px] text-[#6B6B6B] font-mono shrink-0">
              <div>{contact.phone || '+1 (555) 019-2831'}</div>
              <div>{contact.email || 'contact@minimalist.com'}</div>
              <div>{contact.instagram || '@minimal_model'}</div>
            </div>
          </div>
        )}

        {/* ==================== TEMPLATE 4: VOGUE HAUTE COUTURE ==================== */}
        {templateId === 'vogue_haute' && (
          <div className="w-full h-full p-6 flex flex-col justify-between bg-[#111111] text-[#FAF9F5] border-4 border-[#C9A227]/40 relative overflow-hidden box-border">
            {/* Top Luxury Gold Header */}
            <div className="flex justify-between items-center border-b border-[#C9A227]/30 pb-2.5 shrink-0">
              <div className="flex items-center gap-2">
                {contact.agency?.toUpperCase().includes('ORLAND') ? (
                  <div className="w-36 h-7 flex items-center">
                    <OrlandLogo width="100%" height="auto" />
                  </div>
                ) : (
                  <span className="font-serif-display font-bold text-xs tracking-[0.25em] text-[#E6B83B] uppercase">
                    {contact.agency || 'ORLAND HAUTE COUTURE'}
                  </span>
                )}
              </div>
              <span className="text-[8px] tracking-[0.3em] text-[#C9A227] uppercase font-mono">
                PARIS • MILAN • TOKYO
              </span>
            </div>

            {/* Main Vogue Hero Image */}
            <div className={`relative rounded-xs overflow-hidden border border-[#C9A227]/40 ${hasExperience ? 'h-[345px]' : 'h-[380px]'} shadow-2xl my-2 shrink-0`}>
              {renderPhoto(photos.main, 'Vogue Hero', 'h-full w-full')}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/30 p-4 flex flex-col justify-between pointer-events-none">
                <div className="text-right text-[9px] tracking-[0.25em] text-[#E6B83B] uppercase font-serif">
                  HAUTE COUTURE ISSUE
                </div>
                <div>
                  <div className="text-[9px] tracking-[0.3em] uppercase text-[#D4A737] font-mono mb-0.5">
                    OFFICIAL MODEL COMPOSITE
                  </div>
                  <h1 className="text-3xl font-serif-display font-medium text-white tracking-wide">
                    {displayName || name || 'SARAH PUTRI'}
                  </h1>
                </div>
              </div>
            </div>

            {/* 4 Portfolio Thumbnails Grid */}
            <div className={`grid grid-cols-4 gap-2 my-2 ${hasExperience ? 'h-[125px]' : 'h-[140px]'} shrink-0`}>
              <div className="rounded-xs overflow-hidden border border-[#C9A227]/30 h-full">
                {renderPhoto(photos.grid1, 'Vogue Shot 1', 'h-full w-full')}
              </div>
              <div className="rounded-xs overflow-hidden border border-[#C9A227]/30 h-full">
                {renderPhoto(photos.grid2, 'Vogue Shot 2', 'h-full w-full')}
              </div>
              <div className="rounded-xs overflow-hidden border border-[#C9A227]/30 h-full">
                {renderPhoto(photos.grid3, 'Vogue Shot 3', 'h-full w-full')}
              </div>
              <div className="rounded-xs overflow-hidden border border-[#C9A227]/30 h-full">
                {renderPhoto(photos.grid4, 'Vogue Shot 4', 'h-full w-full')}
              </div>
            </div>

            {/* Gold Specs Card Grid */}
            <div className="bg-[#1A1A1A] border border-[#C9A227]/40 p-2.5 rounded-xs space-y-2 shrink-0">
              <div className="grid grid-cols-4 gap-1.5 text-[9px]">
                {activeStats.slice(0, 8).map((stat, idx) => (
                  <div key={idx} className="bg-black/50 p-1.5 rounded-xs border border-[#C9A227]/20">
                    <span className="block text-[#C9A227] font-mono text-[8px] tracking-wider uppercase">
                      {stat.label}
                    </span>
                    <span className="font-semibold text-white truncate block">{stat.value}</span>
                  </div>
                ))}
              </div>

              {/* Optional Experience Strip */}
              {hasExperience && (
                <div className="pt-1.5 border-t border-[#C9A227]/30 flex items-center gap-2 text-[8.5px] font-mono">
                  <span className="font-bold text-[#E6B83B] tracking-wider uppercase shrink-0">
                    {experienceHeadline}:
                  </span>
                  <span className="truncate text-white/90">
                    {experienceItems.join(' • ')}
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center text-[8.5px] text-[#A3A3A3] pt-1 border-t border-[#C9A227]/20 font-mono">
                <span>{contact.instagram || '@vogue_model'}</span>
                <span>{contact.email || 'booking@agency.com'}</span>
                <span>{contact.phone || '+1 (555) 019-2831'}</span>
              </div>
            </div>
          </div>
        )}

        {/* ==================== TEMPLATE 5: RUNWAY & COMMERCIAL ==================== */}
        {templateId === 'runway_bold' && (
          <div className="w-full h-full p-6 flex flex-col justify-between bg-white text-[#171717] border border-[#E7E5E0] box-border">
            {/* Top Bold Banner */}
            <div className="bg-[#171717] text-white p-3 rounded-xs flex justify-between items-center shrink-0">
              <div>
                <span className="text-[9px] tracking-[0.25em] text-[#D4A737] font-mono block uppercase">
                  CASTING COMPOSITE
                </span>
                <h2 className="text-lg font-bold font-sans-ui tracking-tight uppercase">
                  {displayName || name || 'SARAH PUTRI'}
                </h2>
              </div>
              <div className="text-right">
                {contact.agency?.toUpperCase().includes('ORLAND') ? (
                  <div className="w-32 h-6 flex items-center justify-end">
                    <OrlandLogo width="100%" height="auto" variant="light" />
                  </div>
                ) : (
                  <span className="font-bold text-xs tracking-widest uppercase text-white">
                    {contact.agency || 'RUNWAY AGENCY'}
                  </span>
                )}
              </div>
            </div>

            {/* Asymmetric Split Layout: Left Hero (7 cols) + Right Vertical Stack (5 cols) */}
            <div className={`grid grid-cols-12 gap-3 my-2.5 ${hasExperience ? 'h-[470px]' : 'h-[500px]'} shrink-0`}>
              <div className="col-span-7 h-full rounded-xs overflow-hidden border border-[#171717]">
                {renderPhoto(photos.main, 'Runway Main', 'h-full w-full')}
              </div>
              <div className="col-span-5 grid grid-rows-3 gap-2.5 h-full">
                <div className="h-full rounded-xs overflow-hidden border border-[#E7E5E0]">
                  {renderPhoto(photos.grid1, 'Runway 1', 'h-full w-full')}
                </div>
                <div className="h-full rounded-xs overflow-hidden border border-[#E7E5E0]">
                  {renderPhoto(photos.grid2, 'Runway 2', 'h-full w-full')}
                </div>
                <div className="h-full rounded-xs overflow-hidden border border-[#E7E5E0]">
                  {renderPhoto(photos.grid3, 'Runway 3', 'h-full w-full')}
                </div>
              </div>
            </div>

            {/* High Impact Spec Badges Grid */}
            <div className="border-2 border-[#171717] p-2.5 rounded-xs bg-[#FAF9F5] shrink-0">
              <div className="grid grid-cols-3 gap-2 text-[10px] font-mono mb-1.5">
                {activeStats.slice(0, 6).map((stat, idx) => (
                  <div key={idx} className="bg-white p-1.5 rounded-xs border border-[#E7E5E0] shadow-2xs">
                    <span className="block text-[#6B6B6B] font-bold text-[8px] uppercase tracking-wider">
                      {stat.label}
                    </span>
                    <span className="font-bold text-[#171717] text-[10px] truncate block">{stat.value}</span>
                  </div>
                ))}
              </div>

              {/* Optional Experience Strip */}
              {hasExperience && (
                <div className="py-1 border-t border-[#E7E5E0] flex items-center gap-2 text-[8.5px] font-mono text-[#171717]">
                  <span className="font-bold text-[#171717] tracking-wider uppercase shrink-0">
                    {experienceHeadline}:
                  </span>
                  <span className="truncate font-semibold text-[#444]">
                    {experienceItems.join(' • ')}
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center text-[9px] text-[#171717] font-semibold pt-1 border-t border-[#E7E5E0]">
                <span>INSTA: {contact.instagram || '@runway'}</span>
                <span>TEL: {contact.phone || '+1 (555) 019-2831'}</span>
                <span>WEB: {contact.website || 'agency.com'}</span>
              </div>
            </div>
          </div>
        )}

        {/* ==================== TEMPLATE 6: CINEMATIC FILM STRIP ==================== */}
        {templateId === 'cinema_film' && (
          <div className="w-full h-full p-6 flex flex-col justify-between bg-[#0F0F11] text-white border border-[#2A2A2A] box-border">
            {/* Top Film Studio Bar */}
            <div className="flex justify-between items-center pb-2.5 border-b border-[#2A2A2A] shrink-0">
              <div className="flex items-center gap-2">
                {contact.agency?.toUpperCase().includes('ORLAND') ? (
                  <div className="w-36 h-7 flex items-center">
                    <OrlandLogo width="100%" height="auto" />
                  </div>
                ) : (
                  <span className="font-serif-display font-bold text-xs tracking-widest text-[#E6B83B] uppercase">
                    {contact.agency || 'CINEMA TALENT'}
                  </span>
                )}
              </div>
              <div className="text-[8.5px] font-mono text-[#D4A737] tracking-widest uppercase">
                35MM FILM ACTING COMPOSITE
              </div>
            </div>

            {/* Letterboxed Main Film Hero */}
            <div className={`relative rounded-xs overflow-hidden border-y-4 border-[#D4A737] ${hasExperience ? 'h-[310px]' : 'h-[340px]'} my-2 shadow-2xl shrink-0`}>
              {renderPhoto(photos.main, 'Cinema Hero', 'h-full w-full')}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent p-4 flex flex-col justify-end pointer-events-none">
                <h1 className="text-2xl font-serif-display font-medium text-white tracking-wide">
                  {displayName || name || 'SARAH PUTRI'}
                </h1>
                <p className="text-[9px] text-[#D4A737] font-mono tracking-widest uppercase">
                  TALENT & ACTING PORTFOLIO
                </p>
              </div>
            </div>

            {/* Film Negative Frame Row */}
            <div className={`bg-[#18181B] p-2 border border-[#2A2A2A] rounded-xs my-1 ${hasExperience ? 'h-[135px]' : 'h-[145px]'} flex flex-col justify-between shrink-0`}>
              <div className="text-[8px] font-mono text-[#6B6B6B] flex justify-between px-1 mb-1 shrink-0">
                <span>KODAK PORTRA 400</span>
                <span>SAFETY FILM ▲ 24A</span>
              </div>
              <div className="grid grid-cols-4 gap-2 flex-1 min-h-0">
                <div className="border border-[#3F3F46] rounded-xs overflow-hidden h-full">
                  {renderPhoto(photos.grid1, 'Film 1', 'h-full w-full')}
                </div>
                <div className="border border-[#3F3F46] rounded-xs overflow-hidden h-full">
                  {renderPhoto(photos.grid2, 'Film 2', 'h-full w-full')}
                </div>
                <div className="border border-[#3F3F46] rounded-xs overflow-hidden h-full">
                  {renderPhoto(photos.grid3, 'Film 3', 'h-full w-full')}
                </div>
                <div className="border border-[#3F3F46] rounded-xs overflow-hidden h-full">
                  {renderPhoto(photos.grid4, 'Film 4', 'h-full w-full')}
                </div>
              </div>
            </div>

            {/* Golden Illuminated Spec Sheet */}
            <div className="bg-[#18181C] border border-[#D4A737]/40 p-2.5 rounded-xs text-[10px] font-mono text-zinc-300 shrink-0">
              <div className="grid grid-cols-4 gap-1.5 mb-1.5">
                {activeStats.slice(0, 8).map((stat, idx) => (
                  <div key={idx} className="bg-black/40 p-1 rounded-xs border border-[#3F3F46]">
                    <span className="block text-[#D4A737] text-[8px]">{stat.label}</span>
                    <span className="font-semibold text-white text-[9px] truncate block">{stat.value}</span>
                  </div>
                ))}
              </div>

              {/* Optional Experience Strip */}
              {hasExperience && (
                <div className="py-1 border-t border-[#2A2A2A] flex items-center gap-2 text-[8.5px] font-mono text-[#D4A737]">
                  <span className="font-bold text-[#E6B83B] tracking-wider uppercase shrink-0">
                    {experienceHeadline}:
                  </span>
                  <span className="truncate text-zinc-300">
                    {experienceItems.join(' • ')}
                  </span>
                </div>
              )}

              <div className="flex justify-between text-[8.5px] text-[#A1A1AA] pt-1 border-t border-[#2A2A2A]">
                <span>{contact.email || 'acting@agency.com'}</span>
                <span>{contact.phone || '+1 (555) 019-2831'}</span>
                <span>{contact.instagram || '@cinema_talent'}</span>
              </div>
            </div>
          </div>
        )}

        {/* ==================== TEMPLATE 7: NOIR MONOCHROME ==================== */}
        {templateId === 'noir_monochrome' && (
          <div className="w-full h-full p-6 flex flex-col justify-between bg-[#F8F8F8] text-[#111111] border-2 border-[#111111] box-border">
            {/* Minimal High-Contrast Header */}
            <div className="flex justify-between items-baseline border-b-2 border-[#111111] pb-2 shrink-0">
              <h1 className="text-xl font-serif-display font-black tracking-tight text-[#111111] uppercase">
                {displayName || name || 'SARAH PUTRI'}
              </h1>
              <div>
                {contact.agency?.toUpperCase().includes('ORLAND') ? (
                  <div className="w-32 h-6 flex items-center justify-end">
                    <OrlandLogo width="100%" height="auto" variant="dark" />
                  </div>
                ) : (
                  <span className="font-mono text-xs font-bold tracking-widest uppercase">
                    {contact.agency || 'NOIR MANAGEMENT'}
                  </span>
                )}
              </div>
            </div>

            {/* Noir Dual Split: Left Hero + Right 3 Vertical Shots */}
            <div className={`grid grid-cols-12 gap-3.5 my-2.5 ${hasExperience ? 'h-[470px]' : 'h-[500px]'} shrink-0`}>
              <div className="col-span-6 h-full border-2 border-[#111111] overflow-hidden grayscale">
                {renderPhoto(photos.main, 'Noir Hero', 'h-full w-full')}
              </div>
              <div className="col-span-6 grid grid-rows-3 gap-2.5 h-full">
                <div className="h-full border border-[#111111] overflow-hidden grayscale">
                  {renderPhoto(photos.grid1, 'Noir 1', 'h-full w-full')}
                </div>
                <div className="h-full border border-[#111111] overflow-hidden grayscale">
                  {renderPhoto(photos.grid2, 'Noir 2', 'h-full w-full')}
                </div>
                <div className="h-full border border-[#111111] overflow-hidden grayscale">
                  {renderPhoto(photos.grid3, 'Noir 3', 'h-full w-full')}
                </div>
              </div>
            </div>

            {/* Geometric Noir Hairline Specs Grid */}
            <div className="border-t-2 border-[#111111] pt-2 shrink-0">
              <div className="grid grid-cols-4 gap-2 text-[9px] font-mono uppercase mb-2">
                {activeStats.map((stat, idx) => (
                  <div key={idx} className="border-b border-[#111111] pb-1">
                    <span className="text-[#666666] text-[8px] block font-bold">{stat.label}</span>
                    <span className="font-bold text-[#111111] truncate block">{stat.value}</span>
                  </div>
                ))}
              </div>

              {/* Optional Experience Strip */}
              {hasExperience && (
                <div className="py-1 border-t border-[#111111] flex items-center gap-2 text-[8.5px] font-mono uppercase text-[#111111] mb-1.5">
                  <span className="font-bold tracking-wider shrink-0">
                    {experienceHeadline}:
                  </span>
                  <span className="truncate font-semibold text-[#333]">
                    {experienceItems.join(' • ')}
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center text-[8.5px] font-mono pt-1 text-[#444444]">
                <span>EMAIL: {contact.email || 'noir@agency.com'}</span>
                <span>INSTA: {contact.instagram || '@noir_model'}</span>
                <span>TEL: {contact.phone || '+1 (555) 019-2831'}</span>
              </div>
            </div>
          </div>
        )}

        {/* ==================== TEMPLATE 8: STUDIO POLAROID SNAPSHOT ==================== */}
        {templateId === 'polaroid_studio' && (
          <div className="w-full h-full p-6 flex flex-col justify-between bg-[#F7F4EB] text-[#222222] border border-[#E2DDD0] box-border">
            {/* Header Stamp */}
            <div className="flex justify-between items-center pb-2 border-b border-[#E2DDD0] shrink-0">
              <div className="flex items-center gap-2">
                {contact.agency?.toUpperCase().includes('ORLAND') ? (
                  <div className="w-36 h-7 flex items-center">
                    <OrlandLogo width="100%" height="auto" />
                  </div>
                ) : (
                  <span className="font-serif-display font-bold text-xs tracking-widest text-[#222222] uppercase">
                    {contact.agency || 'STUDIO POLAROID'}
                  </span>
                )}
              </div>
              <span className="bg-[#EAE4D5] text-[#555555] px-2.5 py-0.5 rounded-full text-[8.5px] font-mono font-semibold">
                SNAP CASTING CARD
              </span>
            </div>

            {/* Polaroid Frames Grid */}
            <div className={`grid grid-cols-12 gap-3 my-2 ${hasExperience ? 'h-[465px]' : 'h-[500px]'} items-center shrink-0`}>
              {/* Main Polaroid Card Left */}
              <div className={`col-span-6 ${hasExperience ? 'h-[430px]' : 'h-[460px]'} bg-white p-2.5 pb-4 rounded-xs border border-[#E2DDD0] shadow-md transform -rotate-1 flex flex-col`}>
                <div className="flex-1 min-h-0 overflow-hidden rounded-xs border border-[#F0EBE1]">
                  {renderPhoto(photos.main, 'Polaroid Main', 'h-full w-full')}
                </div>
                <div className="mt-2 text-center font-serif italic text-sm font-bold text-[#111111] shrink-0">
                  {displayName || name || 'Sarah Putri'}
                </div>
              </div>

              {/* Right Side 3 Polaroid Cards */}
              <div className={`col-span-6 grid grid-cols-2 grid-rows-2 gap-2.5 ${hasExperience ? 'h-[430px]' : 'h-[460px]'}`}>
                <div className="bg-white p-1.5 pb-3 rounded-xs border border-[#E2DDD0] shadow-sm transform rotate-1 flex flex-col">
                  <div className="flex-1 min-h-0 overflow-hidden rounded-xs">
                    {renderPhoto(photos.grid1, 'Polaroid 1', 'h-full w-full')}
                  </div>
                </div>
                <div className="bg-white p-1.5 pb-3 rounded-xs border border-[#E2DDD0] shadow-sm transform -rotate-2 flex flex-col">
                  <div className="flex-1 min-h-0 overflow-hidden rounded-xs">
                    {renderPhoto(photos.grid2, 'Polaroid 2', 'h-full w-full')}
                  </div>
                </div>
                <div className="bg-white p-1.5 pb-3 rounded-xs border border-[#E2DDD0] shadow-sm transform rotate-1 col-span-2 flex flex-col">
                  <div className="flex-1 min-h-0 overflow-hidden rounded-xs">
                    {renderPhoto(photos.grid3, 'Polaroid 3', 'h-full w-full')}
                  </div>
                </div>
              </div>
            </div>

            {/* Polaroid Bottom Notes Spec Card */}
            <div className="bg-white p-3 rounded-xs border border-[#E2DDD0] shadow-xs shrink-0">
              <div className="grid grid-cols-4 gap-1.5 text-[9px] font-mono text-[#333333] mb-1.5">
                {activeStats.slice(0, 8).map((stat, idx) => (
                  <div key={idx} className="bg-[#FAF8F3] p-1.5 rounded-xs border border-[#EAE4D5]">
                    <span className="block text-[#888888] text-[7.5px] font-semibold">{stat.label}</span>
                    <span className="font-bold text-[#111111] text-[9px] truncate block">{stat.value}</span>
                  </div>
                ))}
              </div>

              {/* Optional Experience Strip */}
              {hasExperience && (
                <div className="py-1 border-t border-[#EAE4D5] flex items-center gap-2 text-[8.5px] font-mono text-[#333] mb-1">
                  <span className="font-bold text-[#111111] tracking-wider uppercase shrink-0">
                    {experienceHeadline}:
                  </span>
                  <span className="truncate font-serif italic text-[#555]">
                    {experienceItems.join(' • ')}
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center text-[8.5px] font-mono text-[#666666] pt-1 border-t border-[#EAE4D5]">
                <span>{contact.instagram || '@polaroid_snap'}</span>
                <span>{contact.phone || '+1 (555) 019-2831'}</span>
                <span>{contact.email || 'studio@agency.com'}</span>
              </div>
            </div>
          </div>
        )}

        {/* ==================== TEMPLATE 9: PARISIAN ATELIER ==================== */}
        {templateId === 'paris_atelier' && (
          <div className="w-full h-full p-6 flex flex-col justify-between bg-[#FDFBF7] text-[#1E1B18] border border-[#E8DFD3] box-border relative">
            {/* Paris Header */}
            <div className="flex justify-between items-center pb-2.5 border-b border-[#D8C7B0] shrink-0">
              <div className="flex items-center gap-2">
                {contact.agency?.toUpperCase().includes('ORLAND') ? (
                  <div className="w-36 h-7 flex items-center">
                    <OrlandLogo width="100%" height="auto" />
                  </div>
                ) : (
                  <span className="font-playfair text-xs tracking-[0.2em] uppercase font-bold text-[#1E1B18]">
                    {contact.agency || 'ATELIER PARIS'}
                  </span>
                )}
              </div>
              <div className="text-right">
                <span className="text-[8px] font-mono tracking-[0.25em] text-[#A68962] uppercase block">
                  BUREAU PARIS • HAUTE COUTURE
                </span>
                <span className="text-[7.5px] text-[#7A7165] font-serif italic">
                  Édition Spéciale Défilé
                </span>
              </div>
            </div>

            {/* Parisian Asymmetric Layout: Left Hero (55%) + Right 3 Looks Stack (45%) */}
            <div className={`grid grid-cols-12 gap-3.5 my-2 ${hasExperience ? 'h-[475px]' : 'h-[505px]'} shrink-0`}>
              {/* Left Elegant Tall Hero */}
              <div className="col-span-7 h-full border border-[#D8C7B0] p-1.5 bg-white shadow-xs rounded-xs flex flex-col">
                <div className="flex-1 min-h-0 overflow-hidden rounded-xs">
                  {renderPhoto(photos.main, 'Parisian Hero', 'h-full w-full')}
                </div>
                <div className="pt-2 px-1 flex justify-between items-baseline shrink-0">
                  <h2 className="font-playfair text-base font-bold text-[#1E1B18] tracking-tight">
                    {displayName || name || 'SARAH PUTRI'}
                  </h2>
                  <span className="text-[8px] font-mono tracking-widest text-[#A68962] uppercase">
                    PORTRAIT PRINCIPAL
                  </span>
                </div>
              </div>

              {/* Right 3 Looks */}
              <div className="col-span-5 grid grid-rows-3 gap-2 h-full">
                <div className="h-full border border-[#D8C7B0] p-1 bg-white rounded-xs flex flex-col">
                  <div className="flex-1 min-h-0 overflow-hidden rounded-xs">
                    {renderPhoto(photos.grid1, 'Look Runway', 'h-full w-full')}
                  </div>
                  <span className="text-[7.5px] font-mono text-[#7A7165] uppercase text-center pt-0.5 shrink-0">
                    I. Défilé / Silhouette
                  </span>
                </div>
                <div className="h-full border border-[#D8C7B0] p-1 bg-white rounded-xs flex flex-col">
                  <div className="flex-1 min-h-0 overflow-hidden rounded-xs">
                    {renderPhoto(photos.grid2, 'Look Editorial', 'h-full w-full')}
                  </div>
                  <span className="text-[7.5px] font-mono text-[#7A7165] uppercase text-center pt-0.5 shrink-0">
                    II. Éditorial / Beauté
                  </span>
                </div>
                <div className="h-full border border-[#D8C7B0] p-1 bg-white rounded-xs flex flex-col">
                  <div className="flex-1 min-h-0 overflow-hidden rounded-xs">
                    {renderPhoto(photos.grid3, 'Look Profile', 'h-full w-full')}
                  </div>
                  <span className="text-[7.5px] font-mono text-[#7A7165] uppercase text-center pt-0.5 shrink-0">
                    III. Profil & Allure
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Atelier Specs & Seals */}
            <div className="bg-[#FAF4EC] border border-[#E0D3C1] p-2.5 rounded-xs flex flex-col gap-1.5 shrink-0">
              <div className="grid grid-cols-4 gap-2 text-[9px]">
                {activeStats.slice(0, 8).map((stat, idx) => (
                  <div key={idx} className="bg-white/80 p-1.5 rounded-xs border border-[#E8DFD3]">
                    <span className="block text-[#A68962] font-mono text-[7.5px] tracking-wider uppercase">
                      {stat.label}
                    </span>
                    <span className="font-serif font-bold text-[#1E1B18] text-[9.5px] truncate block">
                      {stat.value}
                    </span>
                  </div>
                ))}
              </div>

              {/* Optional Experience Strip */}
              {hasExperience && (
                <div className="py-1 border-t border-[#E8DFD3] flex items-center gap-2 text-[8.5px] font-serif text-[#1E1B18]">
                  <span className="font-bold tracking-wider uppercase text-[#A68962] font-mono shrink-0">
                    {experienceHeadline}:
                  </span>
                  <span className="truncate italic text-[#4A433A]">
                    {experienceItems.join(' • ')}
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center text-[8.5px] text-[#7A7165] pt-1 border-t border-[#E8DFD3] font-serif">
                <span>Contact: {contact.email || 'paris@orlandmanagement.com'}</span>
                <span>{contact.instagram || '@paris_atelier'}</span>
                <span>Tél: {contact.phone || '+33 1 42 68 55 00'}</span>
              </div>
            </div>
          </div>
        )}

        {/* ==================== TEMPLATE 10: MILAN RUNWAY ==================== */}
        {templateId === 'milan_runway' && (
          <div className="w-full h-full p-6 flex flex-col justify-between bg-white text-[#111111] border-2 border-[#111111] box-border">
            {/* Milan Bold Header */}
            <div className="flex justify-between items-center pb-2.5 border-b-2 border-[#111111] shrink-0">
              <div>
                <span className="text-[8px] font-mono tracking-[0.25em] text-[#991B1B] uppercase font-bold block">
                  MILANO MODA DONNA • OFFICIAL COMP
                </span>
                <h1 className="text-xl font-bold font-sans-ui tracking-tight uppercase text-[#111111]">
                  {displayName || name || 'SARAH PUTRI'}
                </h1>
              </div>
              <div className="text-right">
                {contact.agency?.toUpperCase().includes('ORLAND') ? (
                  <div className="w-32 h-6 flex items-center justify-end">
                    <OrlandLogo width="100%" height="auto" variant="dark" />
                  </div>
                ) : (
                  <span className="font-mono text-xs font-black tracking-widest uppercase text-[#111111]">
                    {contact.agency || 'MILANO MODELS'}
                  </span>
                )}
                <span className="text-[8px] font-mono text-[#666666] block">VIA MONTENAPOLEONE</span>
              </div>
            </div>

            {/* Twin Hero Split (Top) + 3 Detail Thumbs (Bottom) */}
            <div className={`my-2 flex flex-col gap-2 ${hasExperience ? 'h-[475px]' : 'h-[510px]'} shrink-0`}>
              {/* Twin Heroes: Runway Full-Length + Intense Portrait */}
              <div className={`grid grid-cols-2 gap-2.5 ${hasExperience ? 'h-[320px]' : 'h-[345px]'} shrink-0`}>
                <div className="h-full border-2 border-[#111111] overflow-hidden relative">
                  {renderPhoto(photos.main, 'Runway Full Body', 'h-full w-full')}
                  <div className="absolute top-2 left-2 bg-[#111111] text-white px-2 py-0.5 text-[7.5px] font-mono font-bold tracking-wider uppercase">
                    RUNWAY LOOK
                  </div>
                </div>
                <div className="h-full border-2 border-[#111111] overflow-hidden relative">
                  {renderPhoto(photos.grid1, 'Beauty Headshot', 'h-full w-full')}
                  <div className="absolute top-2 left-2 bg-[#991B1B] text-white px-2 py-0.5 text-[7.5px] font-mono font-bold tracking-wider uppercase">
                    BEAUTY CLOSE-UP
                  </div>
                </div>
              </div>

              {/* 3 Detail Lower Shots */}
              <div className={`grid grid-cols-3 gap-2.5 ${hasExperience ? 'h-[145px]' : 'h-[155px]'} shrink-0`}>
                <div className="h-full border border-[#111111] overflow-hidden">
                  {renderPhoto(photos.grid2, 'Editorial Detail', 'h-full w-full')}
                </div>
                <div className="h-full border border-[#111111] overflow-hidden">
                  {renderPhoto(photos.grid3, 'Movement Shot', 'h-full w-full')}
                </div>
                <div className="h-full border border-[#111111] overflow-hidden">
                  {renderPhoto(photos.grid4, 'Commercial Profile', 'h-full w-full')}
                </div>
              </div>
            </div>

            {/* Milan Spec Table */}
            <div className="bg-[#FAF9F6] border-2 border-[#111111] p-2.5 shrink-0">
              <div className="grid grid-cols-4 gap-1.5 text-[9px] font-mono uppercase mb-1.5">
                {activeStats.slice(0, 8).map((stat, idx) => (
                  <div key={idx} className="bg-white border border-[#E5E5E5] p-1 text-center">
                    <span className="text-[7.5px] text-[#777777] font-bold block">{stat.label}</span>
                    <span className="font-bold text-[#111111] text-[9.5px] truncate block">{stat.value}</span>
                  </div>
                ))}
              </div>

              {/* Optional Experience Strip */}
              {hasExperience && (
                <div className="py-1 border-t border-[#E5E5E5] flex items-center gap-2 text-[8.5px] font-mono uppercase text-[#111111] mb-1">
                  <span className="font-bold text-[#991B1B] tracking-wider shrink-0">
                    {experienceHeadline}:
                  </span>
                  <span className="truncate font-bold text-[#333]">
                    {experienceItems.join(' • ')}
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center text-[8.5px] font-mono font-semibold pt-1 border-t border-[#E5E5E5] text-[#333333]">
                <span>BOOKING: {contact.email || 'milano@orlandmanagement.com'}</span>
                <span>TEL: {contact.phone || '+39 02 8905 1234'}</span>
                <span>{contact.instagram || '@milan_runway'}</span>
              </div>
            </div>
          </div>
        )}

        {/* ==================== TEMPLATE 11: TOKYO NEO MODERNIST ==================== */}
        {templateId === 'tokyo_neo' && (
          <div className="w-full h-full p-6 flex flex-col justify-between bg-[#F4F4F5] text-[#18181B] border border-[#D4D4D8] box-border relative overflow-hidden">
            {/* Tokyo Architectural Header */}
            <div className="flex justify-between items-center pb-2.5 border-b-2 border-[#18181B] shrink-0">
              <div className="flex items-center gap-2">
                {contact.agency?.toUpperCase().includes('ORLAND') ? (
                  <div className="w-36 h-7 flex items-center">
                    <OrlandLogo width="100%" height="auto" variant="dark" />
                  </div>
                ) : (
                  <span className="font-mono text-xs font-black tracking-widest uppercase">
                    {contact.agency || 'ORLAND TOKYO'}
                  </span>
                )}
                <span className="text-[8px] bg-[#18181B] text-white px-1.5 py-0.5 rounded-xs font-mono">
                  東京 DIVISION
                </span>
              </div>
              <div className="text-right text-[8.5px] font-mono text-[#71717A] tracking-wider uppercase">
                MODEL COMPOSITE / GINZA
              </div>
            </div>

            {/* Asymmetrical 4-Frame Matrix */}
            <div className={`grid grid-cols-12 gap-2.5 my-2 ${hasExperience ? 'h-[475px]' : 'h-[505px]'} shrink-0`}>
              {/* Large Neo Hero (7 cols) */}
              <div className="col-span-7 h-full bg-white border border-[#18181B] p-1.5 flex flex-col">
                <div className="flex-1 min-h-0 overflow-hidden">
                  {renderPhoto(photos.main, 'Tokyo Main', 'h-full w-full')}
                </div>
                <div className="pt-2 px-1 flex justify-between items-center shrink-0 font-mono">
                  <h2 className="text-base font-bold text-[#18181B] tracking-tight uppercase">
                    {displayName || name || 'SARAH PUTRI'}
                  </h2>
                  <span className="text-[8px] text-[#A1A1AA]">ID: #{comcard.id.slice(-4).toUpperCase()}</span>
                </div>
              </div>

              {/* Right 3 Structural Looks (5 cols) */}
              <div className="col-span-5 grid grid-rows-3 gap-2 h-full">
                <div className="h-full bg-white border border-[#18181B] p-1 overflow-hidden">
                  {renderPhoto(photos.grid1, 'Tokyo Look 1', 'h-full w-full')}
                </div>
                <div className="h-full bg-white border border-[#18181B] p-1 overflow-hidden">
                  {renderPhoto(photos.grid2, 'Tokyo Look 2', 'h-full w-full')}
                </div>
                <div className="h-full bg-white border border-[#18181B] p-1 overflow-hidden">
                  {renderPhoto(photos.grid3, 'Tokyo Look 3', 'h-full w-full')}
                </div>
              </div>
            </div>

            {/* Modern Monospace Specs Strip */}
            <div className="bg-[#18181B] text-white p-2.5 rounded-xs space-y-1.5 shrink-0">
              <div className="grid grid-cols-4 gap-2 text-[9px] font-mono">
                {activeStats.slice(0, 8).map((stat, idx) => (
                  <div key={idx} className="bg-white/10 p-1 rounded-xs border border-white/10">
                    <span className="text-[7.5px] text-[#A1A1AA] uppercase block">{stat.label}</span>
                    <span className="font-semibold text-white truncate block">{stat.value}</span>
                  </div>
                ))}
              </div>

              {/* Optional Experience Strip */}
              {hasExperience && (
                <div className="py-1 border-t border-white/10 flex items-center gap-2 text-[8.5px] font-mono text-zinc-300">
                  <span className="font-bold text-white tracking-wider uppercase shrink-0">
                    {experienceHeadline}:
                  </span>
                  <span className="truncate text-zinc-400">
                    {experienceItems.join(' • ')}
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center text-[8.5px] font-mono text-[#A1A1AA] pt-1 border-t border-white/10">
                <span>{contact.email || 'tokyo@orlandmanagement.com'}</span>
                <span>{contact.instagram || '@tokyo_neo'}</span>
                <span>{contact.phone || '+81 3 5555 0192'}</span>
              </div>
            </div>
          </div>
        )}

        {/* ==================== TEMPLATE 12: NORDIC PURE MINIMAL ==================== */}
        {templateId === 'nordic_clean' && (
          <div className="w-full h-full p-8 flex flex-col justify-between bg-white text-[#18181B] border border-[#E4E4E7] box-border">
            {/* Nordic Subtle Header */}
            <div className="flex justify-between items-baseline pb-3 border-b border-[#F4F4F5] shrink-0">
              <div className="flex items-center gap-3">
                {contact.agency?.toUpperCase().includes('ORLAND') ? (
                  <div className="w-32 h-6 flex items-center">
                    <OrlandLogo width="100%" height="auto" />
                  </div>
                ) : (
                  <span className="text-xs font-semibold tracking-[0.2em] uppercase text-[#18181B]">
                    {contact.agency || 'NORDIC MODELS'}
                  </span>
                )}
              </div>
              <div className="text-[8.5px] font-mono tracking-widest text-[#A1A1AA] uppercase">
                COPENHAGEN • STOCKHOLM
              </div>
            </div>

            {/* Serene Nordic Trio Composition: Center Large (7 cols) + 2 Side Studies (5 cols) */}
            <div className={`my-2 grid grid-cols-12 gap-3.5 ${hasExperience ? 'h-[475px]' : 'h-[505px]'} shrink-0`}>
              {/* Primary Large Nordic Study */}
              <div className="col-span-7 h-full rounded-xs overflow-hidden border border-[#F4F4F5] shadow-2xs">
                {renderPhoto(photos.main, 'Nordic Primary Study', 'h-full w-full')}
              </div>

              {/* 2 Balanced Secondary Studies */}
              <div className="col-span-5 grid grid-rows-2 gap-3 h-full">
                <div className="h-full rounded-xs overflow-hidden border border-[#F4F4F5] shadow-2xs">
                  {renderPhoto(photos.grid1, 'Nordic Study 2', 'h-full w-full')}
                </div>
                <div className="h-full rounded-xs overflow-hidden border border-[#F4F4F5] shadow-2xs">
                  {renderPhoto(photos.grid2, 'Nordic Study 3', 'h-full w-full')}
                </div>
              </div>
            </div>

            {/* Minimalist Lower Typography & Measurements */}
            <div className="pt-2 border-t border-[#F4F4F5] flex flex-col gap-1.5 shrink-0">
              <div className="flex justify-between items-end">
                <div>
                  <h1 className="text-xl font-serif-display font-medium text-[#18181B] tracking-wide mb-1">
                    {displayName || name || 'SARAH PUTRI'}
                  </h1>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-[9.5px] text-[#52525B]">
                    {activeStats.slice(0, 6).map((stat, idx) => (
                      <span key={idx}>
                        <strong className="text-[#A1A1AA] font-normal mr-1">{stat.label}</strong>
                        {stat.value}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="text-right text-[8.5px] font-mono text-[#71717A] space-y-0.5">
                  <div>{contact.instagram || '@nordic.model'}</div>
                  <div>{contact.email || 'cph@orlandmanagement.com'}</div>
                </div>
              </div>

              {/* Optional Experience Strip */}
              {hasExperience && (
                <div className="pt-1.5 border-t border-[#F4F4F5] flex items-center gap-2 text-[8.5px] text-[#52525B]">
                  <span className="font-semibold text-[#18181B] uppercase tracking-wider text-[7.5px] shrink-0">
                    {experienceHeadline}:
                  </span>
                  <span className="truncate text-[#71717A] italic font-serif">
                    {experienceItems.join(' • ')}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================== TEMPLATE 13: IMG & PRIDE DIGIS (EXACT IMAGE 1) ==================== */}
        {templateId === 'img_digis' && (
          <div className="w-full h-full p-7 flex flex-col justify-between bg-white text-[#111111] box-border select-none">
            {/* Top Bar: Massive Bold Model Name & Top Measurements / Agency */}
            <div className="flex justify-between items-start pb-2.5 shrink-0">
              <div>
                <h1 className="text-6xl font-black font-sans-ui tracking-tighter text-[#111111] uppercase leading-none">
                  {displayName || name || 'GRACE'}
                </h1>
                <p className="text-[8.5px] tracking-[0.25em] text-[#777777] uppercase font-bold mt-1.5">
                  DIGITAL CASTING COMPOSITE
                </p>
              </div>

              {/* Right Side Compact Measurements (Exact match with Image 1) */}
              <div className="text-right font-sans-ui text-[9px] font-bold text-[#111111] leading-tight uppercase tracking-wider space-y-0.5">
                {visibleStats.height && stats.height && (
                  <div>HEIGHT {stats.height.split('/')[0].trim()}</div>
                )}
                {visibleStats.shoeSize && stats.shoeSize && (
                  <div>SHOES {stats.shoeSize.split('/')[0].trim()}</div>
                )}
                {visibleStats.hair && stats.hair && (
                  <div>{stats.hair.toUpperCase()}</div>
                )}
                {visibleStats.eyes && stats.eyes && (
                  <div>{stats.eyes.toUpperCase()}</div>
                )}
                {visibleStats.bust && stats.bust && (
                  <div>BUST {stats.bust.split('/')[0].trim()}</div>
                )}
                {visibleStats.waist && stats.waist && (
                  <div>WAIST {stats.waist.split('/')[0].trim()}</div>
                )}
                {visibleStats.hips && stats.hips && (
                  <div>HIPS {stats.hips.split('/')[0].trim()}</div>
                )}
              </div>
            </div>

            {/* Asymmetric 4-Digi Grid (Exact match with Image 1: Left 2 stacked, Right hero close-up + bottom look) */}
            <div className="grid grid-cols-12 gap-3.5 my-1.5 h-[530px] shrink-0">
              {/* Left Column: 2 Stacked Digi Looks (waist-up + full-length) */}
              <div className="col-span-5 grid grid-rows-2 gap-3.5 h-full">
                <div className="h-full overflow-hidden bg-[#F5F4F0] border border-neutral-100">
                  {renderPhoto(photos.grid1, 'Half Body Digi', 'h-full w-full')}
                </div>
                <div className="h-full overflow-hidden bg-[#F5F4F0] border border-neutral-100">
                  {renderPhoto(photos.grid2, 'Full Length Digi', 'h-full w-full')}
                </div>
              </div>

              {/* Right Column: Hero Close-Up Face + Mid Look / Seated */}
              <div className="col-span-7 grid grid-rows-2 gap-3.5 h-full">
                <div className="h-full overflow-hidden bg-[#F5F4F0] border border-neutral-100">
                  {renderPhoto(photos.main, 'Digi Close-Up Portrait', 'h-full w-full')}
                </div>
                <div className="h-full overflow-hidden bg-[#F5F4F0] border border-neutral-100">
                  {renderPhoto(photos.grid3, 'Digi Profile / Sitting', 'h-full w-full')}
                </div>
              </div>
            </div>

            {/* Optional Experience Strip */}
            {hasExperience && (
              <div className="py-1 px-3 bg-[#FAF9F6] border border-[#EBE8DF] text-[8.5px] font-sans-ui text-[#222222] shrink-0 my-1 flex items-center gap-2">
                <span className="font-black tracking-wider text-[#111111] uppercase shrink-0">
                  {experienceHeadline}:
                </span>
                <span className="truncate font-medium text-[#444444]">
                  {experienceItems.join(' • ')}
                </span>
              </div>
            )}

            {/* Bottom Agency Contact & Address Block (Exact match with Image 1) */}
            <div className="pt-2 border-t border-[#111111] flex justify-between items-end text-[9px] font-sans-ui text-[#111111] shrink-0">
              <div className="flex items-center gap-2">
                {contact.agency?.toUpperCase().includes('ORLAND') ? (
                  <div className="w-32 h-6 flex items-center">
                    <OrlandLogo width="100%" height="auto" />
                  </div>
                ) : (
                  <span className="font-black text-xs tracking-wider uppercase text-[#111111]">
                    {contact.agency || 'PRIDE MODELS'}
                  </span>
                )}
                {contact.instagram && (
                  <span className="text-[#666666] font-mono text-[8.5px]">{contact.instagram}</span>
                )}
              </div>

              {/* Right Address & Booking Info (Exact Style of IMG Sydney) */}
              <div className="text-right font-black text-[8.5px] leading-tight tracking-wider uppercase">
                <div>19 MARTIN PL</div>
                <div>25TH FLOOR</div>
                <div>SYDNEY, NSW 2000</div>
                <div className="text-[#555555] font-semibold mt-0.5">
                  {contact.website ? contact.website.toUpperCase() : 'IMGMODELS.COM'}
                </div>
                <div className="text-[#555555] font-semibold">
                  {contact.phone || '02.9285.8000'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== TEMPLATE 14: SELECT LONDON 6-SHOT (EXACT IMAGE 2) ==================== */}
        {templateId === 'select_six' && (
          <div className="w-full h-full p-5 pl-2 flex flex-row bg-white text-[#111111] box-border select-none">
            {/* Left Vertical Agency Brand Margin (Exact match with Image 2) */}
            <div className="w-14 flex flex-col justify-between items-center py-2 pr-2 border-r border-[#E5E5E5] shrink-0 select-none">
              {/* Select Model Management Vertical Branding */}
              <div className="flex flex-col items-center gap-4 pt-1">
                <div
                  className="font-serif-display font-black text-3xl text-[#111111] tracking-tighter"
                  style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
                >
                  Select
                </div>
                <div
                  className="font-sans-ui text-[7px] tracking-[0.35em] font-black uppercase text-[#222222]"
                  style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
                >
                  MODEL MANAGEMENT
                </div>
              </div>

              {/* Vertical Web & London Agency Address */}
              <div
                className="font-mono text-[6.5px] tracking-wider text-[#777777] uppercase pb-1"
                style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
              >
                {contact.website || 'www.selectmodel.com'} / 77 St Martin's Ln, London WC2N 4AA / Tel {contact.phone || '020 7299 1322'}
              </div>
            </div>

            {/* Right Main Body: Model Name Header + 2x3 6-Photo Matrix + Specs */}
            <div className="flex-1 flex flex-col justify-between pl-4 h-full">
              {/* Top Header: Model Name (ARCHIE style) */}
              <div className="flex justify-end items-center pb-1 shrink-0">
                <h1 className="font-sans-ui font-light text-3xl tracking-[0.35em] uppercase text-[#111111]">
                  {displayName || name || 'ARCHIE'}
                </h1>
              </div>

              {/* 6-Photo Progression Grid: 2 columns x 3 rows (540px fixed height for clean fit) */}
              <div className="grid grid-cols-2 grid-rows-3 gap-2 h-[560px] my-1 shrink-0">
                {/* Row 1: Headshots (Frontal + 3/4) */}
                <div className="h-full overflow-hidden bg-[#F5F4F0] border border-neutral-100">
                  {renderPhoto(photos.main, 'Frontal Headshot', 'h-full w-full')}
                </div>
                <div className="h-full overflow-hidden bg-[#F5F4F0] border border-neutral-100">
                  {renderPhoto(photos.grid1, 'Angle Headshot', 'h-full w-full')}
                </div>

                {/* Row 2: Mid Shots (Frontal + 3/4) */}
                <div className="h-full overflow-hidden bg-[#F5F4F0] border border-neutral-100">
                  {renderPhoto(photos.grid2, 'Mid Shot Front', 'h-full w-full')}
                </div>
                <div className="h-full overflow-hidden bg-[#F5F4F0] border border-neutral-100">
                  {renderPhoto(photos.grid3, 'Mid Shot Angle', 'h-full w-full')}
                </div>

                {/* Row 3: Full Length Shots (Frontal + 3/4) */}
                <div className="h-full overflow-hidden bg-[#F5F4F0] border border-neutral-100">
                  {renderPhoto(photos.grid4, 'Full Length Front', 'h-full w-full')}
                </div>
                <div className="h-full overflow-hidden bg-[#F5F4F0] border border-neutral-100">
                  {renderPhoto(photos.grid5 || photos.main, 'Full Length Angle', 'h-full w-full')}
                </div>
              </div>

              {/* Optional Experience Strip */}
              {hasExperience && (
                <div className="py-1 px-2.5 bg-[#FAF9F5] border border-[#E7E5E0] text-[8px] font-sans-ui text-[#222222] shrink-0 my-0.5 flex items-center gap-2">
                  <span className="font-bold uppercase tracking-wider text-[#111111] shrink-0">
                    {experienceHeadline}:
                  </span>
                  <span className="truncate text-[#555555]">
                    {experienceItems.join(' • ')}
                  </span>
                </div>
              )}

              {/* Bottom Specs Table (Exact match with Image 2) */}
              <div className="pt-2 border-t border-[#E5E5E5] flex justify-between items-center text-[9.5px] font-sans-ui text-[#111111] shrink-0 font-medium">
                <div className="space-y-0.5">
                  {visibleStats.height && stats.height && (
                    <div>Height {stats.height}</div>
                  )}
                  {visibleStats.bust && stats.bust && (
                    <div>Chest {stats.bust}</div>
                  )}
                </div>

                <div className="space-y-0.5">
                  {visibleStats.waist && stats.waist && (
                    <div>Waist {stats.waist}</div>
                  )}
                  {visibleStats.hips && stats.hips && (
                    <div>Hips {stats.hips}</div>
                  )}
                </div>

                <div className="space-y-0.5">
                  {visibleStats.hair && stats.hair && (
                    <div>Hair {stats.hair}</div>
                  )}
                  {visibleStats.eyes && stats.eyes && (
                    <div>Eyes {stats.eyes}</div>
                  )}
                </div>

                <div className="space-y-0.5">
                  {visibleStats.shoeSize && stats.shoeSize && (
                    <div>Shoes {stats.shoeSize}</div>
                  )}
                  {visibleStats.clothingSize && stats.clothingSize && (
                    <div>Suit {stats.clothingSize}</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    );
  }
);

ComcardCardRenderer.displayName = 'ComcardCardRenderer';
