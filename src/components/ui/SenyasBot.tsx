'use client';

export default function SenyasBot({ size = 120 }: { size?: number }) {
  return (
    <div style={{ width: size, height: size * (460 / 680) }} aria-hidden="true">
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 680 460"
        xmlns="http://www.w3.org/2000/svg"
      >
        <style>{`
          .bot-body { animation: bot-float 3s ease-in-out infinite; transform-box: view-box; transform-origin: 340px 240px; }
          .bot-left { animation: bot-wave 1.4s ease-in-out infinite; transform-box: view-box; transform-origin: 250px 240px; }
          .bot-right { animation: bot-bounce 2s ease-in-out infinite; transform-box: view-box; transform-origin: 430px 240px; }
          .bot-eyes { animation: bot-blink 4.5s ease-in-out infinite; transform-box: view-box; transform-origin: 340px 232px; }
          .bot-tip { animation: bot-pulse 2s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
          .bot-halo { animation: bot-glow 3s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
          .bot-spark { animation: bot-twinkle 2.5s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
          .bot-spark-2 { animation-delay: 0.6s; }
          .bot-spark-3 { animation-delay: 1.2s; }
          .bot-spark-4 { animation-delay: 1.8s; }
          .bot-spark-5 { animation-delay: 0.3s; }
          .bot-spark-6 { animation-delay: 0.9s; }

          @keyframes bot-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
          @keyframes bot-wave { 0%, 100% { transform: rotate(-18deg); } 50% { transform: rotate(18deg); } }
          @keyframes bot-bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
          @keyframes bot-blink { 0%, 92%, 100% { transform: scaleY(1); } 94%, 96% { transform: scaleY(0.06); } }
          @keyframes bot-pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.6; transform: scale(1.4); } }
          @keyframes bot-glow { 0%, 100% { opacity: 0.32; transform: scale(1); } 50% { opacity: 0.55; transform: scale(1.05); } }
          @keyframes bot-twinkle { 0%, 100% { opacity: 0.3; transform: scale(0.7); } 50% { opacity: 0.9; transform: scale(1.2); } }
        `}</style>

        <ellipse className="bot-halo" cx="340" cy="240" rx="180" ry="170" fill="#ffb3c6" opacity="0.18"/>

        <circle className="bot-spark" cx="150" cy="120" r="3" fill="#ffb3c6"/>
        <circle className="bot-spark bot-spark-2" cx="540" cy="100" r="4" fill="#ffb3c6"/>
        <circle className="bot-spark bot-spark-3" cx="120" cy="380" r="3" fill="#ffb3c6"/>
        <circle className="bot-spark bot-spark-4" cx="580" cy="370" r="3.5" fill="#ffb3c6"/>
        <circle className="bot-spark bot-spark-5" cx="200" cy="60" r="2.5" fill="#ffb3c6"/>
        <circle className="bot-spark bot-spark-6" cx="500" cy="60" r="2" fill="#ffb3c6"/>

        <ellipse cx="340" cy="425" rx="105" ry="9" fill="#000000" opacity="0.1"/>

        <g className="bot-body">
          <line x1="340" y1="150" x2="340" y2="110" stroke="#ffb3c6" strokeWidth="4" strokeLinecap="round"/>
          <circle className="bot-tip" cx="340" cy="100" r="11" fill="#ffb3c6"/>
          <circle cx="336" cy="96" r="3.5" fill="#ffffff" opacity="0.9"/>

          <rect x="250" y="150" width="180" height="180" rx="45" fill="#ffb3c6"/>
          <rect x="262" y="160" width="155" height="22" rx="11" fill="#ffffff" opacity="0.28"/>

          <rect x="270" y="195" width="140" height="90" rx="22" fill="#fff0f5"/>

          <g className="bot-eyes">
            <ellipse cx="305" cy="232" rx="11" ry="13" fill="#2d1b2e"/>
            <circle cx="308" cy="228" r="3.5" fill="#ffffff"/>
            <ellipse cx="375" cy="232" rx="11" ry="13" fill="#2d1b2e"/>
            <circle cx="378" cy="228" r="3.5" fill="#ffffff"/>
          </g>

          <path d="M 318 260 Q 340 275 362 260" stroke="#2d1b2e" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round"/>

          <ellipse cx="285" cy="252" rx="9" ry="6" fill="#ff8fa8" opacity="0.55"/>
          <ellipse cx="395" cy="252" rx="9" ry="6" fill="#ff8fa8" opacity="0.55"/>

          <rect x="285" y="300" width="110" height="18" rx="9" fill="#fff0f5"/>
          <circle cx="305" cy="309" r="3" fill="#ff8fa8"/>
          <circle cx="320" cy="309" r="3" fill="#ff8fa8" opacity="0.6"/>
          <circle cx="340" cy="309" r="3" fill="#ff8fa8" opacity="0.4"/>
          <circle cx="360" cy="309" r="3" fill="#ff8fa8" opacity="0.6"/>
          <circle cx="375" cy="309" r="3" fill="#ff8fa8"/>
        </g>

        <g className="bot-left">
          <line x1="250" y1="240" x2="200" y2="280" stroke="#ffb3c6" strokeWidth="10" strokeLinecap="round"/>
          <circle cx="195" cy="285" r="9" fill="#ff8fa8"/>
          <ellipse cx="180" cy="300" rx="28" ry="32" fill="#ffb3c6"/>
          <rect x="158" y="265" width="11" height="32" rx="5.5" fill="#ffb3c6"/>
          <rect x="172" y="258" width="11" height="38" rx="5.5" fill="#ffb3c6"/>
          <rect x="186" y="258" width="11" height="38" rx="5.5" fill="#ffb3c6"/>
          <rect x="200" y="265" width="11" height="32" rx="5.5" fill="#ffb3c6"/>
          <ellipse cx="212" cy="295" rx="8" ry="11" fill="#ffb3c6" transform="rotate(28 212 295)"/>
          <ellipse cx="178" cy="306" rx="11" ry="6" fill="#ffffff" opacity="0.28"/>
        </g>

        <g className="bot-right">
          <line x1="430" y1="240" x2="480" y2="280" stroke="#ffb3c6" strokeWidth="10" strokeLinecap="round"/>
          <circle cx="485" cy="285" r="9" fill="#ff8fa8"/>
          <ellipse cx="500" cy="300" rx="28" ry="32" fill="#ffb3c6"/>
          <rect x="485" y="240" width="12" height="60" rx="6" fill="#ffb3c6"/>
          <rect x="503" y="240" width="12" height="60" rx="6" fill="#ffb3c6"/>
          <ellipse cx="478" cy="306" rx="7" ry="9" fill="#ffb3c6"/>
          <ellipse cx="522" cy="306" rx="7" ry="9" fill="#ffb3c6"/>
          <ellipse cx="475" cy="292" rx="9" ry="6" fill="#ffb3c6"/>
          <ellipse cx="500" cy="310" rx="11" ry="6" fill="#ffffff" opacity="0.28"/>
        </g>
      </svg>
    </div>
  );
}