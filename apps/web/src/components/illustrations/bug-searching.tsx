'use client';

/**
 * Ilustración de un bug/bicho con lupa buscando algo que no encuentra
 * Para cuando una excepción específica no existe
 */
export function BugSearchingIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <style>
        {`
          @keyframes search {
            0%, 100% { transform: rotate(-5deg); }
            50% { transform: rotate(5deg); }
          }
          @keyframes bounce {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-5px); }
          }
          @keyframes blink {
            0%, 90%, 100% { opacity: 1; }
            95% { opacity: 0; }
          }
          .magnifier { animation: search 2s ease-in-out infinite; transform-origin: 130px 90px; }
          .bug-body { animation: bounce 3s ease-in-out infinite; }
          .eye { animation: blink 4s ease-in-out infinite; }
          .eye-right { animation-delay: 0.1s; }
        `}
      </style>

      {/* Huellas de búsqueda en el fondo */}
      <circle cx="30" cy="160" r="4" fill="currentColor" opacity="0.1" />
      <circle cx="45" cy="150" r="3" fill="currentColor" opacity="0.1" />
      <circle cx="55" cy="165" r="3.5" fill="currentColor" opacity="0.1" />
      <circle cx="170" cy="155" r="4" fill="currentColor" opacity="0.1" />
      <circle cx="160" cy="170" r="3" fill="currentColor" opacity="0.1" />

      {/* Signos de interrogación flotando */}
      <text x="25" y="50" fontSize="14" fill="currentColor" opacity="0.3" fontWeight="bold">?</text>
      <text x="170" y="45" fontSize="12" fill="currentColor" opacity="0.25" fontWeight="bold">?</text>
      <text x="50" y="35" fontSize="10" fill="currentColor" opacity="0.2" fontWeight="bold">?</text>

      {/* Grupo del bug con animación */}
      <g className="bug-body" style={{ transformOrigin: 'center' }}>
        {/* Cuerpo del bug - forma ovalada */}
        <ellipse
          cx="85"
          cy="115"
          rx="35"
          ry="28"
          fill="currentColor"
          opacity="0.15"
          stroke="currentColor"
          strokeWidth="2"
        />

        {/* Segmentos del cuerpo */}
        <path
          d="M70 115 Q85 110, 100 115"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
          opacity="0.3"
        />
        <path
          d="M65 105 Q85 100, 105 105"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
          opacity="0.3"
        />

        {/* Cabeza */}
        <circle
          cx="85"
          cy="75"
          r="22"
          fill="currentColor"
          opacity="0.12"
          stroke="currentColor"
          strokeWidth="2"
        />

        {/* Ojos grandes de bug */}
        <circle
          className="eye"
          cx="75"
          cy="72"
          r="8"
          fill="currentColor"
          opacity="0.1"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <circle cx="75" cy="72" r="4" fill="currentColor" opacity="0.5" />
        
        <circle
          className="eye eye-right"
          cx="95"
          cy="72"
          r="8"
          fill="currentColor"
          opacity="0.1"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <circle cx="95" cy="72" r="4" fill="currentColor" opacity="0.5" />

        {/* Cejas preocupadas */}
        <path
          d="M68 62 L78 65"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.5"
        />
        <path
          d="M102 62 L92 65"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.5"
        />

        {/* Boca confundida */}
        <path
          d="M78 85 Q85 82, 92 85"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
          opacity="0.4"
        />

        {/* Antenas */}
        <path
          d="M72 55 Q65 40, 55 35"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
          opacity="0.5"
        />
        <circle cx="54" cy="34" r="4" fill="currentColor" opacity="0.3" />
        
        <path
          d="M98 55 Q105 40, 115 35"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
          opacity="0.5"
        />
        <circle cx="116" cy="34" r="4" fill="currentColor" opacity="0.3" />

        {/* Patas izquierdas */}
        <path
          d="M55 100 Q40 95, 30 85"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
          opacity="0.4"
        />
        <path
          d="M52 115 Q35 115, 25 110"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
          opacity="0.4"
        />
        <path
          d="M55 130 Q40 140, 30 150"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
          opacity="0.4"
        />

        {/* Patas derechas (una sostiene la lupa) */}
        <path
          d="M118 130 Q130 140, 140 150"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
          opacity="0.4"
        />
        <path
          d="M120 115 Q135 115, 145 110"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
          opacity="0.4"
        />
      </g>

      {/* Lupa con animación de búsqueda */}
      <g className="magnifier">
        {/* Pata que sostiene la lupa */}
        <path
          d="M115 100 Q130 85, 140 80"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
          opacity="0.4"
        />
        
        {/* Mango de la lupa */}
        <path
          d="M155 95 L175 120"
          stroke="currentColor"
          strokeWidth="5"
          strokeLinecap="round"
          opacity="0.5"
        />
        
        {/* Aro de la lupa */}
        <circle
          cx="148"
          cy="85"
          r="18"
          fill="currentColor"
          opacity="0.05"
          stroke="currentColor"
          strokeWidth="3"
        />
        
        {/* Brillo en el cristal */}
        <path
          d="M140 78 Q144 74, 150 76"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
          opacity="0.3"
        />

        {/* X dentro de la lupa (no encontrado) */}
        <path
          d="M142 80 L154 92 M154 80 L142 92"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.4"
        />
      </g>
    </svg>
  );
}
