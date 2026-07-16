'use client';

/**
 * Ilustración de un astronauta perdido en el espacio para la página 404
 * Incluye animaciones sutiles para hacerlo más dinámico
 */
export function LostAstronautIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Estrellas de fondo con animación de parpadeo */}
      <style>
        {`
          @keyframes twinkle {
            0%, 100% { opacity: 0.3; }
            50% { opacity: 1; }
          }
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-8px); }
          }
          .star { animation: twinkle 2s ease-in-out infinite; }
          .star-1 { animation-delay: 0s; }
          .star-2 { animation-delay: 0.5s; }
          .star-3 { animation-delay: 1s; }
          .star-4 { animation-delay: 1.5s; }
          .star-5 { animation-delay: 0.3s; }
          .astronaut { animation: float 4s ease-in-out infinite; }
        `}
      </style>

      {/* Estrellas */}
      <circle className="star star-1" cx="20" cy="30" r="2" fill="currentColor" opacity="0.5" />
      <circle className="star star-2" cx="180" cy="25" r="1.5" fill="currentColor" opacity="0.5" />
      <circle className="star star-3" cx="45" cy="170" r="2" fill="currentColor" opacity="0.5" />
      <circle className="star star-4" cx="165" cy="160" r="1.5" fill="currentColor" opacity="0.5" />
      <circle className="star star-5" cx="150" cy="50" r="2" fill="currentColor" opacity="0.5" />
      <circle className="star star-1" cx="30" cy="100" r="1" fill="currentColor" opacity="0.5" />
      <circle className="star star-3" cx="175" cy="100" r="1" fill="currentColor" opacity="0.5" />

      {/* Grupo del astronauta con animación de flotación */}
      <g className="astronaut" style={{ transformOrigin: 'center' }}>
        {/* Cable de seguridad roto */}
        <path
          d="M60 140 Q40 130, 35 110"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
          opacity="0.4"
          strokeDasharray="5,5"
        />
        
        {/* Mochila/tanque de oxígeno */}
        <rect
          x="85"
          y="95"
          width="30"
          height="40"
          rx="5"
          fill="currentColor"
          opacity="0.2"
        />
        <rect
          x="90"
          y="100"
          width="8"
          height="15"
          rx="2"
          fill="currentColor"
          opacity="0.3"
        />
        <rect
          x="102"
          y="100"
          width="8"
          height="15"
          rx="2"
          fill="currentColor"
          opacity="0.3"
        />

        {/* Cuerpo del traje */}
        <ellipse
          cx="100"
          cy="115"
          rx="25"
          ry="30"
          fill="currentColor"
          opacity="0.15"
          stroke="currentColor"
          strokeWidth="2"
          opacity="0.6"
        />

        {/* Casco */}
        <circle
          cx="100"
          cy="70"
          r="28"
          fill="currentColor"
          opacity="0.1"
          stroke="currentColor"
          strokeWidth="2.5"
        />
        
        {/* Visor del casco */}
        <ellipse
          cx="100"
          cy="72"
          rx="20"
          ry="18"
          fill="currentColor"
          opacity="0.08"
          stroke="currentColor"
          strokeWidth="2"
        />
        
        {/* Reflejo en el visor */}
        <path
          d="M88 62 Q92 58, 98 60"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
          opacity="0.4"
        />

        {/* Cara triste dentro del casco */}
        <circle cx="92" cy="70" r="3" fill="currentColor" opacity="0.5" />
        <circle cx="108" cy="70" r="3" fill="currentColor" opacity="0.5" />
        <path
          d="M92 82 Q100 78, 108 82"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
          opacity="0.5"
        />

        {/* Brazo izquierdo (saludando/pidiendo ayuda) */}
        <path
          d="M75 105 Q55 85, 50 60"
          stroke="currentColor"
          strokeWidth="8"
          strokeLinecap="round"
          fill="none"
          opacity="0.5"
        />
        {/* Mano izquierda */}
        <circle cx="50" cy="58" r="6" fill="currentColor" opacity="0.4" />

        {/* Brazo derecho */}
        <path
          d="M125 110 Q140 120, 150 115"
          stroke="currentColor"
          strokeWidth="8"
          strokeLinecap="round"
          fill="none"
          opacity="0.5"
        />
        {/* Mano derecha */}
        <circle cx="152" cy="114" r="6" fill="currentColor" opacity="0.4" />

        {/* Pierna izquierda */}
        <path
          d="M85 140 Q75 160, 70 175"
          stroke="currentColor"
          strokeWidth="10"
          strokeLinecap="round"
          fill="none"
          opacity="0.5"
        />
        {/* Bota izquierda */}
        <ellipse cx="68" cy="178" rx="8" ry="5" fill="currentColor" opacity="0.4" />

        {/* Pierna derecha */}
        <path
          d="M115 140 Q125 155, 135 170"
          stroke="currentColor"
          strokeWidth="10"
          strokeLinecap="round"
          fill="none"
          opacity="0.5"
        />
        {/* Bota derecha */}
        <ellipse cx="137" cy="173" rx="8" ry="5" fill="currentColor" opacity="0.4" />
      </g>

      {/* Signos de interrogación flotando */}
      <text
        x="155"
        y="45"
        fontSize="16"
        fill="currentColor"
        opacity="0.4"
        fontWeight="bold"
      >
        ?
      </text>
      <text
        x="40"
        y="65"
        fontSize="12"
        fill="currentColor"
        opacity="0.3"
        fontWeight="bold"
      >
        ?
      </text>
    </svg>
  );
}
