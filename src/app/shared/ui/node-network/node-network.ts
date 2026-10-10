import { Component, DestroyRef, ElementRef, NgZone, afterNextRender, inject } from '@angular/core';

interface NetworkNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

interface Point {
  x: number;
  y: number;
}

const LINK_DISTANCE = 150;
const CURSOR_DISTANCE = 200;
const CURSOR_LINK_ALPHA = 0.55;
const NODE_LINK_ALPHA = 0.16;
const MAX_NODES = 90;
const MIN_NODES = 34;
const NODE_AREA_DIVISOR = 15000;
const MAX_DEVICE_PIXEL_RATIO = 2;
const SMALL_NODE_RADIUS = 1.3;
const LARGE_NODE_RADIUS = 2.4;

@Component({
  selector: 'canvas[appNetworkBackground]',
  template: '',
  styles: `
    :host {
      position: fixed;
      inset: 0;
      display: block;
      width: 100%;
      height: 100%;
      z-index: 0;
    }
  `,
})
export class NodeNetwork {
  private readonly canvas = inject(ElementRef).nativeElement as HTMLCanvasElement;
  private readonly destroyRef = inject(DestroyRef);
  private readonly zone = inject(NgZone);

  private context: CanvasRenderingContext2D | null = null;
  private nodes: NetworkNode[] = [];
  private width = 0;
  private height = 0;
  private frameId = 0;
  private pointer: Point | null = null;
  private reducedMotion = false;

  constructor() {
    afterNextRender(() => this.start());
  }

  private start(): void {
    this.context = this.canvas.getContext('2d');
    if (!this.context) {
      return;
    }

    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.size();

    window.addEventListener('resize', this.size, { passive: true });
    window.addEventListener('pointermove', this.onPointerMove, { passive: true });
    window.addEventListener('pointerleave', this.onPointerLeave, { passive: true });

    if (this.reducedMotion) {
      this.draw();
    } else {
      this.zone.runOutsideAngular(() => {
        this.frameId = requestAnimationFrame(this.loop);
      });
    }

    this.destroyRef.onDestroy(() => {
      window.removeEventListener('resize', this.size);
      window.removeEventListener('pointermove', this.onPointerMove);
      window.removeEventListener('pointerleave', this.onPointerLeave);
      cancelAnimationFrame(this.frameId);
    });
  }

  private readonly onPointerMove = (event: PointerEvent): void => {
    this.pointer = { x: event.clientX, y: event.clientY };
  };

  private readonly onPointerLeave = (): void => {
    this.pointer = null;
  };

  private readonly size = (): void => {
    const dpr = Math.min(window.devicePixelRatio || 1, MAX_DEVICE_PIXEL_RATIO);
    const width = this.canvas.clientWidth;
    const height = this.canvas.clientHeight;

    if (width === 0 || height === 0) {
      return;
    }

    this.width = width;
    this.height = height;
    this.canvas.width = Math.floor(width * dpr);
    this.canvas.height = Math.floor(height * dpr);

    this.context?.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.seed();
  };

  private seed(): void {
    const target = (this.width * this.height) / NODE_AREA_DIVISOR;
    const count = Math.round(Math.min(MAX_NODES, Math.max(MIN_NODES, target)));

    this.nodes = Array.from({ length: count }, () => ({
      x: Math.random() * this.width,
      y: Math.random() * this.height,
      vx: (Math.random() - 0.5) * 0.28,
      vy: (Math.random() - 0.5) * 0.28,
      radius: Math.random() < 0.5 ? SMALL_NODE_RADIUS : LARGE_NODE_RADIUS,
    }));
  }

  private readonly loop = (): void => {
    this.frameId = requestAnimationFrame(this.loop);
    this.advance();
    this.draw();
  };

  private advance(): void {
    for (const node of this.nodes) {
      node.x += node.vx;
      node.y += node.vy;

      if (node.x <= 0 || node.x >= this.width) {
        node.vx *= -1;
        node.x = Math.min(Math.max(node.x, 0), this.width);
      }
      if (node.y <= 0 || node.y >= this.height) {
        node.vy *= -1;
        node.y = Math.min(Math.max(node.y, 0), this.height);
      }
    }
  }

  private draw(): void {
    const context = this.context;
    if (!context) {
      return;
    }

    context.clearRect(0, 0, this.width, this.height);

    for (let i = 0; i < this.nodes.length; i += 1) {
      const node = this.nodes[i];

      for (let j = i + 1; j < this.nodes.length; j += 1) {
        const other = this.nodes[j];
        const distance = Math.hypot(node.x - other.x, node.y - other.y);

        if (distance < LINK_DISTANCE) {
          const alpha = NODE_LINK_ALPHA * (1 - distance / LINK_DISTANCE);
          context.strokeStyle = `rgba(160, 184, 255, ${alpha.toFixed(3)})`;
          context.lineWidth = 1;
          context.beginPath();
          context.moveTo(node.x, node.y);
          context.lineTo(other.x, other.y);
          context.stroke();
        }
      }
    }

    const pointer = this.pointer;
    if (pointer) {
      for (const node of this.nodes) {
        const distance = Math.hypot(node.x - pointer.x, node.y - pointer.y);

        if (distance < CURSOR_DISTANCE) {
          const alpha = CURSOR_LINK_ALPHA * (1 - distance / CURSOR_DISTANCE);
          context.strokeStyle = `rgba(255, 255, 255, ${alpha.toFixed(3)})`;
          context.lineWidth = 1;
          context.beginPath();
          context.moveTo(node.x, node.y);
          context.lineTo(pointer.x, pointer.y);
          context.stroke();
        }
      }
    }

    context.fillStyle = 'rgba(255, 255, 255, 0.6)';
    for (const node of this.nodes) {
      context.beginPath();
      context.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
      context.fill();
    }
  }
}
