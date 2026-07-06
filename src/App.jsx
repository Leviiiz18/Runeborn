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
  const menuItemsRef = useRef(null);
  const logoRef = useRef(null);
  const titleScreenRef = useRef(null);
  const titleBgRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isTitleScreen, setIsTitleScreen] = useState(true);

  // Logo floating animation
  useEffect(() => {
    gsap.to(logoRef.current, {
      y: '+=15', // Float relative to current position
      duration: 3,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    });
  }, []);

  // Title Screen to Main Menu Transition
  useEffect(() => {
    if (!isTitleScreen) {
      // 1. Animate Logo to Top-Left
      gsap.to(logoRef.current, {
        top: '4rem', // top-16
        left: '6rem', // left-24
        xPercent: 0,
        yPercent: 0,
        scale: 1, // Reset to natural scale
        duration: 1.5,
        ease: 'power3.inOut'
      });

      // 2. Fade out Title Screen UI
      gsap.to(titleScreenRef.current, {
        opacity: 0,
        duration: 0.5,
        onComplete: () => {
          if (titleScreenRef.current) titleScreenRef.current.style.display = 'none';
        }
      });

      // 3. Fade in Menu Items
      gsap.fromTo(menuItemsRef.current.children, 
        { opacity: 0, x: -30 }, 
        { opacity: 1, x: 0, duration: 0.8, stagger: 0.15, ease: 'power2.out', delay: 0.8 }
      );

      // 4. Epic Background Crossfade to reveal Portal
      gsap.to(titleBgRef.current, {
        opacity: 0,
        duration: 2.5,
        ease: 'power2.inOut'
      });
    } else {
      // Initial Setup: Center the logo and hide menu items
      gsap.set(logoRef.current, {
        top: '40%',
        left: '50%',
        xPercent: -50,
        yPercent: -50,
        scale: 1.5 // Massive centered logo
      });
      gsap.set(menuItemsRef.current.children, { opacity: 0 });
    }
  }, [isTitleScreen]);

  // Handle Any Key Press
  useEffect(() => {
    const handleStart = () => {
      if (isTitleScreen) setIsTitleScreen(false);
    };
    window.addEventListener('keydown', handleStart);
    window.addEventListener('click', handleStart);
    return () => {
      window.removeEventListener('keydown', handleStart);
      window.removeEventListener('click', handleStart);
    };
  }, [isTitleScreen]);

  const handleMouseMove = (e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 20; // Max 20px offset
    const y = (e.clientY / window.innerHeight - 0.5) * 20;
    setMousePos({ x, y });
  };

  const menuItems = [
    { label: 'PLAY GAME', action: () => navigate('/controller-select') },
    { label: 'COLLECTION', action: () => {} },
    { label: 'LOADOUT', action: () => {} },
    { label: 'SETTINGS', action: () => {} },
    { label: 'QUIT', action: () => {} }
  ];

  return (
    <div 
      className="w-full h-screen relative overflow-hidden bg-black font-display text-white selection:bg-[#c5a059] selection:text-black"
      onMouseMove={handleMouseMove}
    >
      
      {/* Base Interactive Parallax Background (Portal Version) */}
      <div 
        className="absolute inset-[-5%] w-[110%] h-[110%] bg-center bg-cover bg-no-repeat opacity-80 transition-transform duration-300 ease-out"
        style={{ 
          backgroundImage: 'url(/purple_landscape_portal.jpg)', 
          imageRendering: 'pixelated',
          transform: `translate(${-mousePos.x * 2}px, ${-mousePos.y * 2}px) scale(1.05)`
        }}
      ></div>

      {/* Front Interactive Parallax Background (Title Screen Version) */}
      <div 
        ref={titleBgRef}
        className="absolute inset-[-5%] w-[110%] h-[110%] bg-center bg-cover bg-no-repeat opacity-80 transition-transform duration-300 ease-out"
        style={{ 
          backgroundImage: 'url(/purple_landscape.jpg)', 
          imageRendering: 'pixelated',
          transform: `translate(${-mousePos.x * 2}px, ${-mousePos.y * 2}px) scale(1.05)`
        }}
      ></div>
      
      {/* Breathing Forge Glow Overlay */}
      <div 
        className="absolute inset-0 mix-blend-overlay pointer-events-none opacity-40"
        style={{
          background: 'radial-gradient(circle at 70% 50%, rgba(197, 160, 89, 0.8) 0%, transparent 60%)',
          animation: 'forge-pulse 4s infinite alternate ease-in-out'
        }}
      ></div>

      {/* Dense, Multi-layered Ethereal Particles */}
      <div className="absolute inset-[-10%] w-[120%] h-[120%] z-0 pointer-events-none overflow-hidden mix-blend-screen transition-transform duration-300 ease-out"
           style={{ transform: `translate(${-mousePos.x * 3}px, ${-mousePos.y * 3}px)` }}>
        {/* Layer 1: Tiny fast sparks */}
        {[...Array(40)].map((_, i) => (
          <div 
            key={`spark-${i}`}
            className="absolute rounded-full bg-[#c5a059]"
            style={{
              width: Math.random() * 2 + 1 + 'px',
              height: Math.random() * 2 + 1 + 'px',
              boxShadow: `0 0 ${Math.random() * 4 + 2}px #c5a059`,
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
              animation: `float-particle ${Math.random() * 5 + 5}s infinite linear`,
              animationDelay: `-${Math.random() * 10}s`
            }}
          ></div>
        ))}
        
        {/* Layer 2: Larger magical cyan orbs */}
        {[...Array(20)].map((_, i) => (
          <div 
            key={`orb-${i}`}
            className="absolute rounded-full bg-[#00f0ff]"
            style={{
              width: Math.random() * 6 + 2 + 'px',
              height: Math.random() * 6 + 2 + 'px',
              boxShadow: `0 0 ${Math.random() * 15 + 5}px #00f0ff`,
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
              animation: `float-particle-slow ${Math.random() * 15 + 15}s infinite linear`,
              animationDelay: `-${Math.random() * 30}s`
            }}
          ></div>
        ))}
      </div>
      
      {/* Subtle vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0)_20%,rgba(0,0,0,0.8)_100%)] pointer-events-none z-0"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent pointer-events-none z-0"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent pointer-events-none z-0"></div>

      {/* Required Animations */}
      <style>{`
        @keyframes forge-pulse {
          0% { opacity: 0.3; transform: scale(0.95); }
          100% { opacity: 0.7; transform: scale(1.05); }
        }
        @keyframes float-particle {
          0% { transform: translateY(0) translateX(0) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-100vh) translateX(30vw) rotate(360deg); opacity: 0; }
        }
        @keyframes float-particle-slow {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          20% { opacity: 0.5; }
          80% { opacity: 0.5; }
          100% { transform: translateY(-50vh) translateX(-20vw); opacity: 0; }
        }
      `}</style>

      {/* Title Screen UI - Press Any Key */}
      <div ref={titleScreenRef} className="absolute inset-0 z-30 flex flex-col justify-end pb-16 items-center pointer-events-none">
        
        {/* Blinking prompt */}
        <div className="flex items-center gap-6 animate-pulse mb-10">
          <div className="w-2 h-2 rotate-45 bg-[#9333ea] shadow-[0_0_10px_#9333ea]"></div>
          <div className="h-[1px] w-24 bg-gradient-to-r from-transparent to-[#9333ea]"></div>
          <p className="tracking-[0.4em] text-[#d8b4fe] font-bold text-lg drop-shadow-[0_2px_5px_rgba(0,0,0,1)]">PRESS ANY KEY TO BEGIN</p>
          <div className="h-[1px] w-24 bg-gradient-to-l from-transparent to-[#9333ea]"></div>
          <div className="w-2 h-2 rotate-45 bg-[#9333ea] shadow-[0_0_10px_#9333ea]"></div>
        </div>

        {/* Small Utility Icons (Bottom Left) */}
        <div className="absolute bottom-6 left-6 flex gap-4 pointer-events-auto">
          <button className="w-12 h-12 flex items-center justify-center border border-[#c5a059]/30 rounded-md bg-black/60 hover:bg-[#c5a059]/20 hover:border-[#c5a059] transition-all text-xl">⚙️</button>
          <button className="w-12 h-12 flex items-center justify-center border border-[#c5a059]/30 rounded-md bg-black/60 hover:bg-[#c5a059]/20 hover:border-[#c5a059] transition-all text-xl">🏆</button>
          <button className="w-12 h-12 flex items-center justify-center border border-[#c5a059]/30 rounded-md bg-black/60 hover:bg-[#c5a059]/20 hover:border-[#c5a059] transition-all text-xl">📜</button>
        </div>
      </div>

      {/* Floating Logo - Animated dynamically */}
      <div ref={logoRef} className="absolute z-40 flex flex-col items-center pointer-events-none">
        <img 
          src="/logo.png" 
          alt="Runeborn" 
          className="w-full max-w-[350px] drop-shadow-[0_15px_30px_rgba(0,0,0,1)] pointer-events-auto"
        />
      </div>

      {/* Floating Navigation Menu - Bottom Left Corner */}
      <div ref={menuItemsRef} className="absolute bottom-20 left-24 z-20 flex flex-col gap-4 items-start w-full max-w-md pointer-events-none">
        {menuItems.map((item, index) => (
          <button 
            key={index}
            onClick={item.action}
            className="group relative flex items-center justify-start px-6 py-3 overflow-hidden transition-all duration-300 w-full text-left pointer-events-auto"
          >
            {/* Golden ethereal hover glow - originating from the left */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#c5a059]/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-md origin-left"></div>
            
            {/* Text */}
            <span className={`relative z-10 font-bold tracking-[0.3em] transition-all duration-300 transform group-hover:translate-x-3 ${
              index === 0 
                ? 'text-[#e8d098] text-3xl group-hover:text-white drop-shadow-[0_4px_8px_rgba(0,0,0,1)]' 
                : 'text-gray-300 text-xl group-hover:text-[#c5a059] drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]'
            }`}>
              {item.label}
            </span>
            
            {/* Elegant framing accents that appear on hover - sliding from the left */}
            <div className="absolute left-0 right-1/4 bottom-0 h-[1px] bg-gradient-to-r from-[#c5a059] to-transparent opacity-0 group-hover:opacity-100 transform origin-left scale-x-0 group-hover:scale-x-100 transition-all duration-500"></div>
            <div className="absolute left-0 right-1/4 top-0 h-[1px] bg-gradient-to-r from-[#c5a059] to-transparent opacity-0 group-hover:opacity-100 transform origin-left scale-x-0 group-hover:scale-x-100 transition-all duration-500"></div>
          </button>
        ))}
      </div>
      
      {/* Footer Area */}
      <div className="absolute bottom-6 w-full flex justify-center items-center text-gray-500 text-xs tracking-wider z-10 opacity-70">
        <span>© 2026 AETHER FORGE • VERSION 1.0.4</span>
      </div>

    </div>
  );
};

const ControllerSelect = () => {
  const navigate = useNavigate();
  const titleRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(titleRef.current, { y: -50, opacity: 0 }, { y: 0, opacity: 1, duration: 1.5, ease: 'power3.out' });
  }, []);

  const selectController = (type) => {
    navigate('/game-mode', { state: { controller: type } });
  };

  return (
    <div className="w-full h-screen relative overflow-hidden bg-black font-display text-white selection:bg-[#c5a059] selection:text-black flex flex-col items-center">
      
      {/* Base Background (Portal Version) */}
      <div 
        className="absolute inset-[-5%] w-[110%] h-[110%] bg-center bg-cover bg-no-repeat opacity-50"
        style={{ backgroundImage: 'url(/purple_landscape_portal.jpg)' }}
      ></div>
      
      {/* Ethereal Gradients for Legibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/80 z-0 pointer-events-none"></div>

      <div ref={titleRef} className="z-10 mt-20 text-center flex flex-col items-center">
        <h2 className="text-4xl md:text-5xl tracking-[0.3em] text-[#e8d098] drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)]">
          SELECT CONTROLLER
        </h2>
        <div className="flex items-center gap-4 mt-6 opacity-80">
          <div className="h-[1px] w-32 bg-gradient-to-r from-transparent to-[#c5a059]"></div>
          <div className="w-2 h-2 rotate-45 bg-[#c5a059] shadow-[0_0_8px_#c5a059]"></div>
          <div className="h-[1px] w-32 bg-gradient-to-l from-transparent to-[#c5a059]"></div>
        </div>
      </div>

      <button 
        onClick={() => navigate('/')} 
        className="absolute top-10 left-10 z-50 text-gray-400 hover:text-[#e8d098] tracking-[0.2em] flex items-center gap-2 transition-colors duration-300"
      >
        <span>◆</span> BACK
      </button>

      <div className="z-10 flex-1 flex gap-12 justify-center items-center w-full max-w-6xl px-8 pb-20">
        
        {/* Keyboard Option */}
        <div 
          onClick={() => selectController('keyboard')}
          className="group relative w-full max-w-sm h-[32rem] cursor-pointer flex flex-col justify-end overflow-hidden transition-all duration-700 hover:scale-105 border border-[#c5a059]/30 hover:border-[#e8d098] bg-black/60 shadow-[0_0_20px_rgba(0,0,0,0.8)] hover:shadow-[0_0_30px_rgba(197,160,89,0.3)]"
        >
          {/* Artifact Background */}
          <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110 opacity-70 group-hover:opacity-100" style={{ backgroundImage: 'url(/mythic_keyboard.png)' }}></div>
          
          {/* Dark Gradient Overlay for Text Readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent"></div>
          
          {/* Inner Content (Bottom aligned) */}
          <div className="relative z-10 flex flex-col items-center p-8 w-full">
            <h3 className="text-3xl tracking-[0.3em] text-[#e8d098] mb-2 drop-shadow-[0_2px_10px_rgba(0,0,0,1)]">KEYBOARD</h3>
            <div className="h-[1px] w-16 bg-[#c5a059] mb-4"></div>
            <p className="text-gray-300 text-sm leading-relaxed tracking-wider font-body text-center opacity-90 group-hover:opacity-100 transition-opacity drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              Standard movement and Keybind attacks. Optimal for competitive precision.
            </p>
          </div>
        </div>

        {/* Gyro Option */}
        <div 
          onClick={() => selectController('gyro')}
          className="group relative w-full max-w-sm h-[32rem] cursor-pointer flex flex-col justify-end overflow-hidden transition-all duration-700 hover:scale-105 border border-[#00f0ff]/30 hover:border-[#00f0ff] bg-black/60 shadow-[0_0_20px_rgba(0,0,0,0.8)] hover:shadow-[0_0_30px_rgba(0,240,255,0.3)]"
        >
          {/* Artifact Background */}
          <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110 opacity-70 group-hover:opacity-100" style={{ backgroundImage: 'url(/mythic_gyro.png)' }}></div>
          
          {/* Dark Gradient Overlay for Text Readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent"></div>
          
          {/* Inner Content (Bottom aligned) */}
          <div className="relative z-10 flex flex-col items-center p-8 w-full">
            <h3 className="text-3xl tracking-[0.3em] text-[#00f0ff] mb-2 drop-shadow-[0_2px_10px_rgba(0,0,0,1)]">ESP32 GYRO</h3>
            <div className="h-[1px] w-16 bg-[#00f0ff] mb-4"></div>
            <p className="text-gray-300 text-sm leading-relaxed tracking-wider font-body text-center opacity-90 group-hover:opacity-100 transition-opacity drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              Immersive motion-controls via MPU6050 hardware. Step into the arena.
            </p>
          </div>
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

  useEffect(() => {
    gsap.fromTo(titleRef.current, { y: -50, opacity: 0 }, { y: 0, opacity: 1, duration: 1.5, ease: 'power3.out' });
  }, []);

  const selectDiff = (diff) => {
    navigate('/character-select', { state: { controller, mode: 'BOT', diff } });
  };

  return (
    <div className="w-full h-screen relative overflow-hidden bg-black font-display text-white selection:bg-[#c5a059] selection:text-black flex flex-col items-center">
      
      {/* Base Background (Portal Version) */}
      <div 
        className="absolute inset-[-5%] w-[110%] h-[110%] bg-center bg-cover bg-no-repeat opacity-50"
        style={{ backgroundImage: 'url(/purple_landscape_portal.jpg)' }}
      ></div>
      
      {/* Ethereal Gradients for Legibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/80 z-0 pointer-events-none"></div>

      <div ref={titleRef} className="z-10 mt-20 text-center flex flex-col items-center">
        <h2 className="text-4xl md:text-5xl tracking-[0.3em] text-[#e8d098] drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)]">
          SELECT BATTLE
        </h2>
        <div className="flex items-center gap-4 mt-6 opacity-80">
          <div className="h-[1px] w-32 bg-gradient-to-r from-transparent to-[#c5a059]"></div>
          <div className="w-2 h-2 rotate-45 bg-[#c5a059] shadow-[0_0_8px_#c5a059]"></div>
          <div className="h-[1px] w-32 bg-gradient-to-l from-transparent to-[#c5a059]"></div>
        </div>
      </div>

      <button 
        onClick={() => navigate('/controller-select')} 
        className="absolute top-10 left-10 z-50 text-gray-400 hover:text-[#e8d098] tracking-[0.2em] flex items-center gap-2 transition-colors duration-300"
      >
        <span>◆</span> BACK
      </button>

      <div className="z-10 flex-1 flex gap-12 justify-center items-center w-full max-w-6xl px-8 pb-20">
        
        {/* Local PVP Option (Disabled for now) */}
        <div className="group relative w-full max-w-xs h-[28rem] flex flex-col items-center justify-center overflow-hidden opacity-40 border border-[#c5a059]/10 bg-black/40 backdrop-blur-md cursor-not-allowed">
          <div className="relative z-10 flex flex-col items-center p-8 text-center">
            <h3 className="text-xl tracking-[0.3em] text-gray-500 mb-4">LOCAL PVP</h3>
            <p className="text-gray-600 text-xs leading-relaxed tracking-wider font-body">Currently Unavailable</p>
          </div>
        </div>

        {/* VS BOT Option */}
        <div className="flex flex-col items-center gap-4">
          <div className="text-[#c5a059] tracking-[0.4em] text-sm mb-4 opacity-80">VERSUS AI</div>
          <div className="flex gap-6">
            <button onClick={() => selectDiff('easy')} className="group relative w-48 h-64 cursor-pointer flex flex-col items-center justify-center overflow-hidden transition-all duration-700 hover:scale-105 border border-[#c5a059]/20 hover:border-[#00f0ff]/80 bg-black/40 backdrop-blur-md">
              <div className="absolute inset-0 bg-gradient-to-t from-[#00f0ff]/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <h4 className="relative z-10 text-xl tracking-[0.2em] text-[#e8d098] group-hover:text-[#00f0ff] transition-colors">EASY</h4>
            </button>
            <button onClick={() => selectDiff('hard')} className="group relative w-48 h-64 cursor-pointer flex flex-col items-center justify-center overflow-hidden transition-all duration-700 hover:scale-105 border border-[#c5a059]/20 hover:border-[#DC143C]/80 bg-black/40 backdrop-blur-md">
              <div className="absolute inset-0 bg-gradient-to-t from-[#DC143C]/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <h4 className="relative z-10 text-xl tracking-[0.2em] text-[#e8d098] group-hover:text-[#DC143C] transition-colors">HARD</h4>
            </button>
          </div>
        </div>

        {/* Online PVP Option (Disabled for now) */}
        <div className="group relative w-full max-w-xs h-[28rem] flex flex-col items-center justify-center overflow-hidden opacity-40 border border-[#c5a059]/10 bg-black/40 backdrop-blur-md cursor-not-allowed">
          <div className="relative z-10 flex flex-col items-center p-8 text-center">
            <h3 className="text-xl tracking-[0.3em] text-gray-500 mb-4">ONLINE</h3>
            <p className="text-gray-600 text-xs leading-relaxed tracking-wider font-body">Coming Soon</p>
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
    if(char.name.toLowerCase().includes('fire')) { color = '#ff3333'; type = 'Fire'; }
    if(char.name.toLowerCase().includes('water') || char.name.toLowerCase().includes('aqua') || char.name.toLowerCase().includes('priestess')) { color = '#00fbfb'; type = 'Water'; }
    if(char.name.toLowerCase().includes('leaf') || char.name.toLowerCase().includes('ground')) { color = '#00ff00'; type = 'Earth'; }
    if(char.name.toLowerCase().includes('wind')) { color = '#ffffff'; type = 'Wind'; }
    if(char.name.toLowerCase().includes('metal')) { color = '#aaaaaa'; type = 'Metal'; }
    if(char.name.toLowerCase().includes('crystal')) { color = '#ff00ff'; type = 'Crystal'; }

    const portraitName = char.name.split('_').filter(p => !['elementals', 'free', 'v1.0', 'v1.1', 'v1.2', 'v1.3'].includes(p.toLowerCase())).join('_').toLowerCase();
    const portraitPath = `/elementals/${char.name}/${portraitName}.png`;

    return { id: char.name, name: cleanName, type: type, color: color, anims: char.anims, portrait: portraitPath };
  });

  useEffect(() => {
    gsap.fromTo(titleRef.current, { x: -50, opacity: 0 }, { x: 0, opacity: 1, duration: 1.5, ease: 'power3.out' });
    // Default to the first character to match the mockup's immediate display
    if(characters.length > 0 && !selectedChar) setSelectedChar(characters[5] || characters[0]); 
  }, []);

  useEffect(() => {
    if (selectedChar && charRef.current) {
      gsap.fromTo(charRef.current, 
        { scale: 0.95, opacity: 0, filter: 'blur(5px)' }, 
        { scale: 1, opacity: 1, filter: 'blur(0px)', duration: 0.8, ease: 'power2.out' }
      );
    }
  }, [selectedChar]);

  return (
    <div className="w-full h-screen relative overflow-hidden bg-[#0A0A0B] text-white selection:bg-[#c5a059] selection:text-black flex">
      
      {/* Background */}
      <div 
        className="absolute inset-0 w-full h-full bg-center bg-cover bg-no-repeat pointer-events-none z-0"
        style={{ backgroundImage: 'url(/character_select_bg.jpg)' }}
      ></div>
      {/* Heavy side gradients to ensure UI readability while keeping the platform visible */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0B] via-transparent to-[#0A0A0B] opacity-90 pointer-events-none z-0"></div>

      {/* Header removed from absolute positioning, will be moved inside Left Column */}

      {/* Back Button Top-Right */}
      <button 
        onClick={() => navigate('/game-mode')} 
        className="absolute top-12 right-12 z-50 text-gray-400 hover:text-white tracking-[0.2em] text-sm transition-colors duration-300"
      >
        ◆ BACK
      </button>

      {/* LEFT COLUMN - ROSTER */}
      <div className="w-[30%] min-w-[350px] max-w-md h-full relative z-10 pt-16 pb-12 pl-12 flex flex-col">
        
        {/* Header (Moved into document flow to prevent clipping) */}
        <div ref={titleRef} className="flex flex-col gap-1 mb-8">
          <h2 className="text-2xl md:text-3xl tracking-[0.3em] text-gray-400 uppercase" style={{ fontFamily: 'var(--font-display)' }}>
            SELECT FIGHTER
          </h2>
          <div className="h-[2px] w-24 bg-[#c5a059]"></div>
        </div>

        {/* Roster Header Text */}
        <p className="text-gray-400 text-sm mb-6 tracking-widest font-body opacity-80">Choose your hero. The realm awaits.</p>
        
        <div className="flex-1 overflow-y-auto pr-4 scrollbar-hide flex flex-col gap-3">
          {characters.map((char) => (
            <div 
              key={char.id}
              onClick={() => setSelectedChar(char)}
              className={`w-full h-20 cursor-pointer flex items-center px-4 relative overflow-hidden transition-all duration-300 border bg-[#0a0a0a]/80 backdrop-blur-sm group`}
              style={{
                 borderColor: selectedChar?.id === char.id ? char.color : '#222',
                 boxShadow: selectedChar?.id === char.id ? `0 0 20px ${char.color}30, inset 0 0 10px ${char.color}20` : 'none'
              }}
            >
              {/* Active State Background Gradient */}
              <div className="absolute inset-0 opacity-20 pointer-events-none transition-opacity duration-300" style={{ background: selectedChar?.id === char.id ? `linear-gradient(90deg, ${char.color}, transparent)` : 'none' }}></div>
              
              {/* Portrait Image Box */}
              <div 
                className="w-14 h-14 flex-shrink-0 relative z-10 border transition-all duration-300 flex items-center justify-center overflow-hidden" 
                style={{ 
                   borderColor: selectedChar?.id === char.id ? char.color : '#444',
                   backgroundColor: '#050505'
                }}
              >
                 <img src={char.portrait} alt={char.name} className="w-full h-full object-cover" />
              </div>
              
              {/* Name & Class */}
              <div className="ml-4 flex-1 relative z-10 flex flex-col justify-center">
                 <p className="text-lg font-bold tracking-widest uppercase transition-colors duration-300 drop-shadow-md" style={{ fontFamily: 'var(--font-display)', color: selectedChar?.id === char.id ? '#fff' : '#aaa' }}>
                   {char.name}
                 </p>
                 <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em]">{char.type} Class</p>
              </div>

              {/* Element Icon (Right aligned) */}
              <div className="w-8 h-8 flex-shrink-0 relative z-10 ml-2">
                 <img src={`/assets/fragments/fragment_${char.name.toLowerCase()}.png`} alt="Realm Fragment" className="w-full h-full object-cover rounded-full opacity-70 group-hover:opacity-100 transition-opacity border border-gray-800" style={{ filter: selectedChar?.id === char.id ? `drop-shadow(0 0 8px ${char.color})` : 'none' }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Empty Center Space (To push right column to edge) */}
      <div className="flex-1 pointer-events-none"></div>

      {/* CENTER STAGE & LOCK IN (Absolute to Screen for true centering) */}
      {selectedChar && (
        <div className="absolute inset-0 pointer-events-none z-10 flex flex-col items-center justify-center">
          
          <div ref={charRef} className="absolute inset-0">
            {/* Platform Floor Glow (Elliptical) */}
            <div className="absolute bottom-[32%] left-1/2 -translate-x-1/2 w-[40rem] h-28 rounded-[100%] opacity-60 mix-blend-screen blur-3xl transition-colors duration-700" style={{ backgroundColor: selectedChar.color }}></div>
            
            {/* Vertical Flare from Platform */}
            <div className="absolute bottom-[32%] left-1/2 -translate-x-1/2 w-72 h-[30rem] bg-gradient-to-t from-transparent via-current to-transparent opacity-30 mix-blend-screen blur-3xl transition-colors duration-700" style={{ color: selectedChar.color }}></div>
            
            {/* Ambient Backlight Glow behind character */}
            <div className="absolute bottom-[36%] left-1/2 -translate-x-1/2 w-64 h-64 opacity-20 mix-blend-screen blur-3xl rounded-full transition-colors duration-700" style={{ backgroundColor: selectedChar.color }}></div>
            
            {/* Character Sprite (Standing exactly on the platform center) */}
            <div className="absolute bottom-[32%] left-1/2 -translate-x-1/2 transform scale-[1.2] transition-all duration-700" style={{ filter: `drop-shadow(0 0 15px ${selectedChar.color}80)` }}>
              {selectedChar.anims.idle && <SpriteAnimator animData={selectedChar.anims.idle} scale={5} origin="bottom center" />}
            </div>
          </div>

          {/* Big Lock In Button (Absolute bottom center) */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 pointer-events-auto">
            <button 
              onClick={() => navigate('/arena-select', { state: { char: selectedChar, controller, mode, diff } })} 
              className="px-24 py-4 text-xl tracking-[0.4em] font-bold uppercase transition-all relative overflow-hidden group shadow-2xl bg-[#0a0a0a]/90 backdrop-blur-md"
              style={{ borderTop: `1px solid ${selectedChar.color}80`, borderBottom: `1px solid ${selectedChar.color}80` }}
            >
              <div className="absolute inset-0 opacity-10 group-hover:opacity-30 transition-opacity duration-500 pointer-events-none" style={{ backgroundColor: selectedChar.color }}></div>
              <span className="relative z-10 text-white group-hover:text-black transition-colors duration-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">LOCK IN</span>
            </button>
          </div>
        </div>
      )}

      {/* RIGHT COLUMN - DETAILS */}
      <div className="w-[30%] h-full relative z-10 pt-32 pb-12 pr-12 flex flex-col justify-center">
        {selectedChar && (
          <div className="flex flex-col animate-fade-in-right">
            <p className="text-sm tracking-[0.4em] font-bold uppercase mb-2 opacity-80" style={{ color: selectedChar.color }}>
              // {selectedChar.type} CLASS
            </p>
            <h3 className="text-6xl font-bold uppercase tracking-wider text-white mb-8" style={{ fontFamily: 'var(--font-display)', textShadow: `0 0 40px ${selectedChar.color}80` }}>
              {selectedChar.name}
            </h3>
            
            <div className="h-[1px] w-full bg-gray-800 mb-8 relative">
              <div className="absolute left-0 top-0 h-full w-1/3" style={{ backgroundColor: selectedChar.color }}></div>
            </div>
            
            <h4 className="text-lg tracking-widest text-gray-400 mb-4 uppercase">Abilities</h4>
            
            {/* Ability Icons Row */}
            <div className="flex gap-3 mb-8">
               {[
                 { key: 'Q', name: 'Attack 1', icon: '1_atk' },
                 { key: 'E', name: 'Attack 2', icon: '2_atk' },
                 { key: 'X', name: 'Attack 3', icon: '3_atk' },
                 { key: 'C', name: 'Defend', icon: 'defend' },
                 { key: 'Z', name: 'Special', icon: 'sp_atk' }
               ].map((ability) => (
                 <div key={ability.key} className="w-14 h-14 border border-gray-700 bg-[#111] flex flex-col items-center justify-center text-xs text-gray-500 hover:border-white hover:text-white transition-colors cursor-pointer relative group overflow-hidden">
                    <img src={`/assets/icons/${selectedChar.name.toLowerCase()}/${ability.icon}.png`} alt={ability.name} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity mix-blend-screen" />
                    <span className="relative z-10 font-bold bg-black/80 px-1.5 py-0.5 rounded text-white text-[10px] absolute bottom-1">{ability.key}</span>
                    <div className="absolute -bottom-1 left-0 w-full h-[2px] opacity-0 group-hover:opacity-100 transition-opacity z-10" style={{ backgroundColor: selectedChar.color }}></div>
                 </div>
               ))}
            </div>

            <div className="flex items-center gap-4 mb-2">
              <h4 className="text-lg tracking-widest text-gray-400 uppercase">Biography</h4>
              <img src={`/assets/fragments/fragment_${selectedChar.name.toLowerCase()}.png`} alt="Realm Fragment" className="w-8 h-8 object-cover rounded-full border border-gray-700 shadow-[0_0_15px_rgba(0,0,0,0.8)]" style={{ filter: `drop-shadow(0 0 8px ${selectedChar.color})` }} />
            </div>
            <p className="text-sm text-gray-300 leading-relaxed opacity-80 font-body">
              A master of {selectedChar.type} magic, {selectedChar.name} commands the battlefield with devastating elemental precision. 
              Originating from the ancient {selectedChar.type} sanctums, they bend the very fabric of nature to crush their adversaries and protect the sacred runestones.
            </p>
          </div>
        )}
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
