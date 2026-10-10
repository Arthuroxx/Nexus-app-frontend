import { Component } from '@angular/core';

@Component({
  selector: 'app-nexus-logo',
  template: `
    <div class="brand">
      <svg
        class="nx"
        role="img"
        aria-label="Nexus"
        width="70"
        height="40"
        viewBox="0 0 70 40"
        fill="none"
      >
        <defs>
          <filter id="nxGlow" x="-60%" y="-120%" width="220%" height="340%">
            <feGaussianBlur stdDeviation="2.4" />
          </filter>
        </defs>
        <g
          class="halo"
          stroke="#fff"
          stroke-width="3.4"
          stroke-linecap="round"
          stroke-linejoin="round"
          opacity=".3"
          filter="url(#nxGlow)"
        >
          <path d="M9 34V6l20 28V6" />
          <path d="M37 6l24 28" />
          <path d="M61 6L37 34" />
        </g>
        <g stroke="#fff" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round">
          <path d="M9 34V6l20 28V6" />
          <path d="M37 6l24 28" />
          <path d="M61 6L37 34" />
        </g>
      </svg>

      <svg
        class="dumbbell"
        role="img"
        aria-label="Mancuerna"
        width="40"
        height="17"
        viewBox="0 0 33 14"
        fill="none"
      >
        <defs>
          <filter id="glow2" x="-60%" y="-120%" width="220%" height="340%">
            <feGaussianBlur stdDeviation="1.8" />
          </filter>
        </defs>
        <g stroke="#fff" stroke-linecap="round" stroke-linejoin="round">
          <g class="halo" stroke-width="2.2" opacity=".3" filter="url(#glow2)">
            <path d="M4.5 7h24" />
            <rect x="6.5" y="2" width="3" height="10" rx="1" />
            <rect x="23.5" y="2" width="3" height="10" rx="1" />
            <rect x="2" y="4" width="2.5" height="6" rx=".8" />
            <rect x="28.5" y="4" width="2.5" height="6" rx=".8" />
          </g>
          <g stroke-width="1.4">
            <path d="M4.5 7h24" />
            <rect x="6.5" y="2" width="3" height="10" rx="1" />
            <rect x="23.5" y="2" width="3" height="10" rx="1" />
            <rect x="2" y="4" width="2.5" height="6" rx=".8" />
            <rect x="28.5" y="4" width="2.5" height="6" rx=".8" />
          </g>
        </g>
      </svg>
    </div>
  `,
  styles: `
    :host {
      display: inline-block;
    }

    .brand {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0;
    }

    .nx {
      display: block;
      overflow: visible;
    }

    .dumbbell {
      display: block;
      overflow: visible;
      margin: -2px 0 0;
    }

    .halo {
      animation: hum 5s ease-in-out infinite;
    }

    @keyframes hum {
      0%,
      100% {
        opacity: 0.3;
      }
      50% {
        opacity: 0.44;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .halo {
        animation: none;
      }
    }
  `,
})
export class NexusLogo {}
