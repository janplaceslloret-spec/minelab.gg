import React from 'react';

const DiscordWidget = ({ className }) => {
  return (
    <div className={`fixed z-50 group ${className || 'bottom-6 right-6'}`}>
      <a 
        href="https://discord.gg/TS49z4yr" 
        target="_blank" 
        rel="noopener noreferrer"
        className="flex items-center bg-[#1E1F22] hover:bg-[#5865F2] border border-white/10 p-3 rounded-full transition-all duration-300 shadow-lg hover:shadow-[0_0_20px_rgba(88,101,242,0.5)] cursor-pointer overflow-hidden"
      >
        <div className="relative flex items-center justify-center flex-shrink-0">
          <svg className="w-6 h-6 text-white" viewBox="0 0 127.14 96.36" fill="currentColor">
            <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a67.55,67.55,0,0,1-10.87,5.19,77.13,77.13,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.31,60,73.31,53s5-12.74,11.43-12.74S96.33,46,96.22,53,91.08,65.69,84.69,65.69Z"/>
          </svg>
        </div>
        
        {/* Expanded text on hover */}
        <div className="w-0 overflow-hidden group-hover:w-[200px] transition-all duration-300 ease-out flex flex-col items-start px-0 group-hover:px-3 whitespace-nowrap">
          <span className="text-white font-medium text-[11px] leading-tight opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
            Únete a la comunidad de MineLab
          </span>
          <span className="text-white font-bold text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-150">
            Entrar al Discord →
          </span>
        </div>
      </a>
    </div>
  );
};

export default DiscordWidget;
