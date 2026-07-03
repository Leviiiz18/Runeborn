import React, { useEffect, useRef, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import gsap from 'gsap';
import characterData from './characters.json';

// Element Icon SVG Component
const ElementIcon = ({ type, color }) => {
  const props = { 
    stroke: color, 
    fill: "none", 
    strokeWidth: "2", 
    strokeLinecap: "round", 
    strokeLinejoin: "round", 
    className: "w-12 h-12 transition-all duration-300",
    style: { filter: `drop-shadow(0 0 8px ${color})` }
  };
  
  switch(type) {
    case 'Fire': return <svg viewBox="0 0 24 24" {...props}><path d="M12 2c0 0-5 6-5 11a5 5 0 0 0 10 0c0-5-5-11-5-11z"/><path d="M12 10c-2 2-2 5-2 5a2 2 0 0 0 4 0c0-2-2-5-2-5z"/></svg>;
    case 'Water': return <svg viewBox="0 0 24 24" {...props}><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>;
    case 'Earth': return <svg viewBox="0 0 24 24" {...props}><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>;
    case 'Wind': return <svg viewBox="0 0 24 24" {...props}><path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"/></svg>;
    case 'Metal': return <svg viewBox="0 0 24 24" {...props}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>;
    case 'Crystal': return <svg viewBox="0 0 24 24" {...props}><path d="M6 3h12l4 6-10 13L2 9Z"/><path d="M11 3 8 9l4 13"/><path d="M13 3l3 6-4 13"/></svg>;
    default: return <svg viewBox="0 0 24 24" {...props}><circle cx="12" cy="12" r="10"/></svg>;
  }
};

// Helper component to play raw PNG sequences
const SpriteAnimator = ({ animData, scale = 6, flip = false, origin = 'center center' }) => {
  const [frame, setFrame] = useState(1);
  
  useEffect(() => {
    let currentFrame = 1;
    const interval = setInterval(() => {
      currentFrame = (currentFrame % animData.count) + 1;
      setFrame(currentFrame);
    }, 120);
    return () => clearInterval(interval);
  }, [animData]);

  const imagePath = `/${animData.path}/${animData.template.replace('{i}', frame)}`;
  return (
    <img 
      src={imagePath} 
      alt="sprite animation" 
      className="object-contain pointer-events-none relative z-10" 
      style={{ imageRendering: 'pixelated', transform: `scale(${scale}) ${flip ? 'scaleX(-1)' : ''}`, transformOrigin: origin }} 
    />
  );
};

const MainMenu = () => {
  const navigate = useNavigate();
  const containerRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(containerRef.current.children, 
      { x: -50, opacity: 0 }, 
      { x: 0, opacity: 1, duration: 0.8, stagger: 0.2, ease: 'power3.out' }
    );
  }, []);

  return (
    <div className="w-full h-screen relative overflow-hidden bg-black">
      {/* Logo MP4 used as the full background */}
      <video autoPlay loop muted className="absolute inset-0 w-full h-full object-cover">
         <source src="/logo_mp4.mp4" type="video/mp4" />
      </video>
      
      {/* Left Side Menu perfectly positioned without the duplicate text */}
      <div ref={containerRef} className="absolute left-20 top-[60%] transform -translate-y-1/2 z-10 flex flex-col gap-6 w-64 border-l-2 border-[#FFD700]/30 pl-4">
          <button onClick={() => navigate('/controller-select')} className="btn-primary py-4 px-8 text-2xl text-left flex justify-between items-center group relative overflow-hidden">
            <span className="relative z-10">Play</span>
            <span className="relative z-10 opacity-0 group-hover:opacity-100 transition-opacity transform -translate-x-4 group-hover:translate-x-0 duration-300">→</span>
          </button>
          <button className="btn-secondary py-3 px-6 text-xl text-left text-gray-400 hover:text-white transition-colors">Settings</button>
          <button className="btn-secondary py-3 px-6 text-xl text-left text-gray-400 hover:text-white transition-colors">Exit</button>
      </div>
    </div>
  );
};

const ControllerSelect = () => {
  const navigate = useNavigate();
  const titleRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(titleRef.current, { y: -50, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'power2.out' });
  }, []);

  const selectController = (type) => {
    navigate('/game-mode', { state: { controller: type } });
  };

  return (
    <div className="w-full h-screen bg-[#0A0A0B] text-white flex flex-col relative overflow-hidden">
      <img src="/bg.png" alt="Background" className="absolute inset-0 w-full h-full object-cover opacity-30 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0B] via-[#0A0A0B]/60 to-transparent z-0 pointer-events-none"></div>

      <div ref={titleRef} className="z-10 p-10 pt-16 text-center w-full">
        <h2 className="text-5xl uppercase tracking-widest text-gray-500" style={{ fontFamily: 'var(--font-display)' }}>
          Select <span className="text-white">Controller</span>
        </h2>
      </div>

      <button onClick={() => navigate('/')} className="absolute top-10 right-10 btn-secondary py-3 px-8 tracking-widest z-50">
        BACK
      </button>

      <div className="z-10 flex-1 flex gap-12 justify-center items-center p-10 pb-32">
        {/* Keyboard Card */}
        <div 
          onClick={() => selectController('keyboard')}
          className="w-96 h-[28rem] glass-panel cursor-pointer group relative overflow-hidden transition-all duration-500 hover:scale-105 hover:border-[#49C5FF] flex flex-col items-center justify-center border-2 border-gray-700 bg-black/60"
        >
           <div className="absolute inset-0 bg-gradient-to-t from-[#49C5FF]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
           <svg viewBox="0 0 24 24" className="w-32 h-32 mb-8 text-gray-500 group-hover:text-[#49C5FF] transition-colors duration-500 drop-shadow-[0_0_15px_rgba(73,197,255,0.2)]" fill="none" stroke="currentColor" strokeWidth="1"><rect x="2" y="5" width="20" height="14" rx="2" ry="2" /><path d="M6 9h.01M10 9h.01M14 9h.01M18 9h.01M6 12h.01M10 12h.01M14 12h.01M18 12h.01M8 15h8" /></svg>
           <h3 className="text-3xl font-bold uppercase tracking-widest text-[#49C5FF]" style={{ fontFamily: 'var(--font-display)' }}>KEYBOARD</h3>
           <p className="mt-4 text-gray-400 tracking-wider text-sm text-center px-8 opacity-0 group-hover:opacity-100 transition-opacity">Standard WASD movement and Keybind attacks.</p>
        </div>

        {/* Gyro Card */}
        <div 
          onClick={() => selectController('gyro')}
          className="w-96 h-[28rem] glass-panel cursor-pointer group relative overflow-hidden transition-all duration-500 hover:scale-105 hover:border-[#FFD700] flex flex-col items-center justify-center border-2 border-gray-700 bg-black/60"
        >
           <div className="absolute inset-0 bg-gradient-to-t from-[#FFD700]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
           <svg viewBox="0 0 24 24" className="w-32 h-32 mb-8 text-gray-500 group-hover:text-[#FFD700] transition-colors duration-500 drop-shadow-[0_0_15px_rgba(255,215,0,0.2)]" fill="none" stroke="currentColor" strokeWidth="1"><path d="M12 18v.01M12 6v.01M8 12h.01M16 12h.01M5 5h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z" /><path d="M12 12m-3 0a3 3 0 1 0 6 0 3 3 0 1 0 -6 0" /></svg>
           <h3 className="text-3xl font-bold uppercase tracking-widest text-[#FFD700]" style={{ fontFamily: 'var(--font-display)' }}>ESP32 GYRO</h3>
           <p className="mt-4 text-gray-400 tracking-wider text-sm text-center px-8 opacity-0 group-hover:opacity-100 transition-opacity">Immersive motion-controls via MPU6050 hardware.</p>
        </div>
      </div>
    </div>
  );
};

const GameModeSelect = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const controller = location.state?.controller || 'keyboard';
  const titleRef = useRef(null);
  const [selectedMode, setSelectedMode] = useState(null);

  useEffect(() => {
    gsap.fromTo(titleRef.current, { y: -50, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'power2.out' });
  }, []);

  const selectDiff = (diff) => {
    navigate('/character-select', { state: { controller, mode: 'BOT', diff } });
  };

  return (
    <div className="w-full h-screen bg-[#0A0A0B] text-white flex flex-col relative overflow-hidden">
      <img src="/bg.png" alt="Background" className="absolute inset-0 w-full h-full object-cover opacity-30 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0B] via-[#0A0A0B]/60 to-transparent z-0 pointer-events-none"></div>

      <div ref={titleRef} className="z-10 p-10 pt-16 text-center w-full">
        <h2 className="text-5xl uppercase tracking-widest text-gray-500" style={{ fontFamily: 'var(--font-display)' }}>
          Select <span className="text-white">Game Mode</span>
        </h2>
      </div>

      <button onClick={() => navigate('/controller-select')} className="absolute top-10 right-10 btn-secondary py-3 px-8 tracking-widest z-50">
        BACK
      </button>

      <div className="z-10 flex-1 flex gap-8 justify-center items-center p-10 pb-32">
        {/* VS BOT */}
        <div 
          onClick={() => setSelectedMode('BOT')}
          className={`w-80 h-[28rem] glass-panel cursor-pointer group relative overflow-hidden transition-all duration-500 hover:scale-105 hover:border-[#DC143C] flex flex-col items-center justify-center border-2 bg-black/60 ${selectedMode === 'BOT' ? 'border-[#DC143C] scale-105' : 'border-gray-700'}`}
        >
           <div className="absolute inset-0 bg-gradient-to-t from-[#DC143C]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
           {!selectedMode || selectedMode !== 'BOT' ? (
             <>
               <svg viewBox="0 0 24 24" className="w-24 h-24 mb-8 text-gray-500 group-hover:text-[#DC143C] transition-colors duration-500 drop-shadow-[0_0_15px_rgba(220,20,60,0.2)]" fill="none" stroke="currentColor" strokeWidth="1"><path d="M12 2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h0a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zM9 9h6v4H9zM9 13v8M15 13v8" /><path d="M6 13h12" /></svg>
               <h3 className="text-3xl font-bold uppercase tracking-widest text-[#DC143C]" style={{ fontFamily: 'var(--font-display)' }}>VS BOT</h3>
               <p className="mt-4 text-gray-400 tracking-wider text-sm text-center px-8 opacity-0 group-hover:opacity-100 transition-opacity">Fight against the CPU.</p>
             </>
           ) : (
             <div className="flex flex-col items-center gap-6 z-10 fade-in">
               <h3 className="text-2xl font-bold uppercase tracking-widest text-white mb-4" style={{ fontFamily: 'var(--font-display)' }}>Difficulty</h3>
               <button onClick={(e) => { e.stopPropagation(); selectDiff('EASY'); }} className="btn-secondary w-48 py-3 border-[#00ff00] text-[#00ff00] hover:bg-[#00ff00] hover:text-black">EASY</button>
               <button onClick={(e) => { e.stopPropagation(); selectDiff('MEDIUM'); }} className="btn-secondary w-48 py-3 border-[#FFD700] text-[#FFD700] hover:bg-[#FFD700] hover:text-black">MEDIUM</button>
               <button onClick={(e) => { e.stopPropagation(); selectDiff('HARD'); }} className="btn-secondary w-48 py-3 border-[#DC143C] text-[#DC143C] hover:bg-[#DC143C] hover:text-black">HARD</button>
             </div>
           )}
        </div>

        {/* LAN GAME */}
        <div 
          onClick={() => navigate('/character-select', { state: { controller, mode: 'LAN' } })}
          className={`w-80 h-[28rem] glass-panel cursor-pointer group relative overflow-hidden transition-all duration-500 hover:scale-105 hover:border-[#49C5FF] flex flex-col items-center justify-center border-2 bg-black/60 border-gray-700`}
        >
           <div className="absolute inset-0 bg-gradient-to-t from-[#49C5FF]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
           <svg viewBox="0 0 24 24" className="w-24 h-24 mb-8 text-gray-500 group-hover:text-[#49C5FF] transition-colors duration-500 drop-shadow-[0_0_15px_rgba(73,197,255,0.2)]" fill="none" stroke="currentColor" strokeWidth="1"><path d="M12 21a9 9 0 0 0 9-9H3a9 9 0 0 0 9 9z"/><path d="M12 3a9 9 0 0 0-9 9h18a9 9 0 0 0-9-9z"/><path d="M12 12m-3 0a3 3 0 1 0 6 0 3 3 0 1 0 -6 0"/></svg>
           <h3 className="text-3xl font-bold uppercase tracking-widest text-[#49C5FF]" style={{ fontFamily: 'var(--font-display)' }}>LAN GAME</h3>
           <p className="mt-4 text-gray-400 tracking-wider text-sm text-center px-8 opacity-0 group-hover:opacity-100 transition-opacity">Local Area Network match.</p>
        </div>

        {/* ONLINE MULTIPLAYER */}
        <div 
          className="w-80 h-[28rem] glass-panel relative overflow-hidden transition-all duration-500 flex flex-col items-center justify-center border-2 border-gray-800 bg-black/40 opacity-50 cursor-not-allowed"
        >
           <svg viewBox="0 0 24 24" className="w-24 h-24 mb-8 text-gray-700" fill="none" stroke="currentColor" strokeWidth="1"><path d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
           <h3 className="text-2xl font-bold uppercase tracking-widest text-gray-600 text-center" style={{ fontFamily: 'var(--font-display)' }}>ONLINE<br/>MULTIPLAYER</h3>
           <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
             <span className="text-white tracking-widest font-bold border border-white/30 px-6 py-2 bg-black/80 rounded-full text-sm">COMING SOON</span>
           </div>
        </div>
      </div>
    </div>
  );
};

const CharacterSelect = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const controller = location.state?.controller || 'keyboard';
  const mode = location.state?.mode || 'BOT';
  const diff = location.state?.diff || 'MEDIUM';
  const [selectedChar, setSelectedChar] = useState(null);
  const titleRef = useRef(null);
  const charRef = useRef(null);
  
  const characters = Object.values(characterData).map(char => {
    const parts = char.name.split('_');
    const cleanName = parts.length > 1 ? parts[1] : char.name;
    
    let color = '#FFD700';
    let type = 'Elemental';
    if(char.name.toLowerCase().includes('fire')) { color = '#DC143C'; type = 'Fire'; }
    if(char.name.toLowerCase().includes('water') || char.name.toLowerCase().includes('aqua') || char.name.toLowerCase().includes('priestess')) { color = '#00fbfb'; type = 'Water'; }
    if(char.name.toLowerCase().includes('leaf') || char.name.toLowerCase().includes('ground')) { color = '#00ff00'; type = 'Earth'; }
    if(char.name.toLowerCase().includes('wind')) { color = '#ffffff'; type = 'Wind'; }
    if(char.name.toLowerCase().includes('metal')) { color = '#aaaaaa'; type = 'Metal'; }
    if(char.name.toLowerCase().includes('crystal')) { color = '#ff00ff'; type = 'Crystal'; }

    return { id: char.name, name: cleanName, type: type, color: color, anims: char.anims };
  });

  useEffect(() => {
    gsap.fromTo(titleRef.current, { x: -50, opacity: 0 }, { x: 0, opacity: 1, duration: 0.8, ease: 'power2.out' });
  }, []);

  useEffect(() => {
    if (selectedChar && charRef.current) {
      gsap.fromTo(charRef.current, 
        { scale: 0.9, opacity: 0, filter: 'blur(10px)' }, 
        { scale: 1, opacity: 1, filter: 'blur(0px)', duration: 0.6, ease: 'back.out(1.5)' }
      );
    }
  }, [selectedChar]);

  return (
    <div className="w-full h-screen bg-[#0A0A0B] text-white flex flex-col relative overflow-hidden">
      {/* Updated Background to bg.png as requested */}
      <img src="/bg.png" alt="Background" className="absolute inset-0 w-full h-full object-cover opacity-40 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0B] via-[#0A0A0B]/60 to-transparent z-0 pointer-events-none"></div>

      <div ref={titleRef} className="z-10 absolute top-10 left-10">
        <h2 className="text-5xl uppercase tracking-widest text-gray-500" style={{ fontFamily: 'var(--font-display)' }}>
          Select <span className="text-white">Fighter</span>
        </h2>
      </div>

      <button onClick={() => navigate('/')} className="absolute top-10 right-10 btn-secondary py-3 px-8 tracking-widest z-50">
        BACK
      </button>

      {/* Main Content Area */}
      <div className="z-10 flex-1 flex flex-col items-center justify-center w-full h-full pt-10 pb-40">
        
        {selectedChar ? (
          <div className="flex flex-col items-center float-anim z-20">
            <div ref={charRef} className="w-96 h-96 glass-panel flex flex-col justify-between p-8 border-b-4 relative overflow-hidden group" style={{ borderBottomColor: selectedChar.color, boxShadow: `0 0 50px ${selectedChar.color}30` }}>
               
               {/* Ambient Radial Glow */}
               <div className="absolute inset-0 opacity-40 mix-blend-screen transition-opacity group-hover:opacity-60" style={{ background: `radial-gradient(circle at center, ${selectedChar.color}, transparent 70%)` }}></div>
               
               {/* Centered Sprite Animator */}
               <div className="absolute inset-0 flex items-end justify-center pointer-events-none pb-12">
                  {selectedChar.anims.idle && <SpriteAnimator animData={selectedChar.anims.idle} scale={4} origin="bottom center" />}
               </div>
               
               <div className="relative z-10 w-full flex justify-between items-start">
                 <p className="text-xs tracking-[0.3em] uppercase font-bold" style={{ color: selectedChar.color }}>
                   {selectedChar.type}
                 </p>
               </div>

               <div className="relative z-10 w-full text-center mt-auto">
                 <h3 className="text-5xl font-bold uppercase tracking-wider" style={{ fontFamily: 'var(--font-display)', textShadow: `0 0 20px ${selectedChar.color}` }}>
                   {selectedChar.name}
                 </h3>
               </div>
            </div>
            
            <button onClick={() => navigate('/arena-select', { state: { char: selectedChar, controller, mode, diff } })} className="btn-primary mt-8 py-4 px-20 text-2xl tracking-[0.2em] shadow-[0_0_20px_rgba(255,215,0,0.4)] hover:shadow-[0_0_40px_rgba(255,215,0,0.8)] transition-all z-50 relative border-2" style={{ borderColor: selectedChar.color }}>
              CONFIRM SELECTION
            </button>
          </div>
        ) : (
          <div className="text-gray-500 tracking-[0.5em] text-2xl z-20" style={{ fontFamily: 'var(--font-display)' }}>
            AWAITING SELECTION
          </div>
        )}

      </div>

      {/* Bottom Grid */}
      <div className="absolute bottom-12 left-0 w-full flex gap-6 justify-center z-50 flex-wrap px-10">
        {characters.map((char) => (
          <div 
            key={char.id}
            onClick={() => setSelectedChar(char)}
            className={`w-24 h-24 cursor-pointer glass-panel transition-all duration-300 hover:-translate-y-4 flex flex-col items-center justify-center relative overflow-hidden ${selectedChar?.id === char.id ? 'border-2 scale-110 -translate-y-4' : 'hover:border-white/50'}`}
            style={{ 
              borderColor: selectedChar?.id === char.id ? char.color : 'rgba(46, 46, 50, 0.8)',
              boxShadow: selectedChar?.id === char.id ? `0 0 30px ${char.color}40` : 'none'
            }}
          >
            {/* Element Icon Thumbnail */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
               <ElementIcon type={char.type} color={char.color} />
            </div>
            
            <div className="absolute inset-0 opacity-0 hover:opacity-20 transition-opacity duration-300" style={{ backgroundColor: char.color }}></div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ArenaSelect = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const char = location.state?.char;
  const controller = location.state?.controller;
  const mode = location.state?.mode;
  const diff = location.state?.diff;
  const titleRef = useRef(null);
  const [hoveredArena, setHoveredArena] = useState(null);
  
  const arenas = [
    { id: 'water', name: 'Water Arena', video: '/water_arena.mp4', image: '/assets/water_areana.png' },
    { id: 'frozen', name: 'Frozen Ruins', video: '/frozen_arena.mp4', image: '/assets/frozen_arena.png' },
    { id: 'volcano', name: 'Volcanic Fortress', video: '/Static_2D_pixel_art_animation_202607031918.mp4', image: '/assets/arena_volcano.png' }
  ];

  useEffect(() => {
    gsap.fromTo(titleRef.current, { x: -50, opacity: 0 }, { x: 0, opacity: 1, duration: 0.8, ease: 'power2.out' });
  }, []);

  return (
    <div className="w-full h-screen bg-[#0A0A0B] text-white flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 bg-[#0A0A0B] z-0"></div>

      {/* Preload and render all arena videos for smooth crossfading */}
      {arenas.map(arena => (
        <video 
          key={`bg-${arena.id}`}
          src={arena.video} 
          autoPlay 
          loop 
          muted 
          className={`absolute inset-0 w-full h-full object-cover pointer-events-none transition-opacity duration-700 ease-in-out z-0 ${hoveredArena?.id === arena.id ? 'opacity-40' : 'opacity-0'}`}
        ></video>
      ))}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0B] via-[#0A0A0B]/50 to-transparent z-0 pointer-events-none"></div>

      <div ref={titleRef} className="z-10 p-10 pt-16">
        <h2 className="text-5xl uppercase tracking-widest text-gray-500" style={{ fontFamily: 'var(--font-display)' }}>
          Select <span className="text-white">Arena</span>
        </h2>
      </div>

      <div className="z-10 flex-1 flex gap-8 justify-center items-center p-10">
        {arenas.map((arena) => (
          <div 
            key={arena.id}
            onClick={() => navigate('/game', { state: { char, arena, controller, mode, diff } })}
            onMouseEnter={() => setHoveredArena(arena)}
            onMouseLeave={() => setHoveredArena(null)}
            className="w-80 h-96 glass-panel cursor-pointer group relative overflow-hidden transition-all duration-500 hover:scale-105 hover:border-[#FFD700]"
          >
             <video src={arena.video} autoPlay loop muted className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-100 transition-opacity duration-500"></video>
             <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent pointer-events-none"></div>
             <div className="absolute bottom-0 w-full p-6 text-center group-hover:-translate-y-4 transition-transform duration-500 pointer-events-none">
               <h3 className="text-2xl font-bold uppercase tracking-wider text-[#FFD700]" style={{ fontFamily: 'var(--font-display)' }}>
                 {arena.name}
               </h3>
               <p className="mt-2 text-sm text-[#FFD700] opacity-0 group-hover:opacity-100 transition-opacity tracking-[0.2em] uppercase">Select Arena</p>
             </div>
          </div>
        ))}
      </div>
      
      <button onClick={() => navigate('/character-select')} className="absolute top-10 right-10 btn-secondary py-3 px-8 tracking-widest z-50">
        BACK
      </button>
    </div>
  );
};

// Placeholder Game screen where ESP32 integration will occur
const GameScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const iframeRef = useRef(null);

  const char = location.state?.char;
  const arena = location.state?.arena;
  const controller = location.state?.controller || 'keyboard';
  const diff = location.state?.diff || 'MEDIUM';
  const mode = location.state?.mode || 'BOT';

  // Use a fallback if accessed directly
  if (!char || !arena) {
    return (
      <div className="w-full h-screen bg-black flex flex-col items-center justify-center p-20 text-center">
         <h1 className="text-4xl text-white mb-8 font-bold">No Character/Arena Selected</h1>
         <button onClick={() => navigate('/')} className="btn-secondary py-3 px-8">Back to Menu</button>
      </div>
    );
  }

  // Construct iframe URL
  const iframeSrc = `/old_index.html?char=${encodeURIComponent(char.id)}&arena=${encodeURIComponent(arena.video || arena.image)}&diff=${encodeURIComponent(diff)}&controller=${encodeURIComponent(controller)}&mode=${encodeURIComponent(mode)}`;

  return (
    <div className="w-full h-screen bg-black relative overflow-hidden">
      <iframe 
        ref={iframeRef}
        src={iframeSrc} 
        onLoad={() => iframeRef.current?.focus()}
        className="w-full h-full border-none" 
        title="Runeborn Game Engine"
        sandbox="allow-scripts allow-same-origin"
      ></iframe>
      
      {/* Return to Menu Button overlayed on top of the iframe */}
      <button 
        onClick={() => navigate('/')} 
        className="absolute top-4 right-4 btn-secondary py-2 px-6 tracking-widest z-50 bg-black/50 hover:bg-black"
        style={{ zoom: 0.8 }}
      >
        QUIT MATCH
      </button>
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainMenu />} />
        <Route path="/controller-select" element={<ControllerSelect />} />
        <Route path="/game-mode" element={<GameModeSelect />} />
        <Route path="/character-select" element={<CharacterSelect />} />
        <Route path="/arena-select" element={<ArenaSelect />} />
        <Route path="/game" element={<GameScreen />} />
      </Routes>
    </Router>
  );
}
