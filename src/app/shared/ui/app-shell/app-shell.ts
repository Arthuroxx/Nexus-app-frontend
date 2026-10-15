import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '@features/auth/application/auth.service';
import { NexusLogo } from '@shared/ui/nexus-logo/nexus-logo';
import { NodeNetwork } from '@shared/ui/node-network/node-network';

interface NavItem {
  readonly label: string;
  readonly path: string;
  readonly exact: boolean;
}

const NAV_ITEMS: readonly NavItem[] = [
  { label: 'Home', path: '/inicio', exact: true },
  { label: 'Rutinas', path: '/inicio/rutinas', exact: false },
];

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NexusLogo, NodeNetwork],
  templateUrl: './app-shell.html',
  styleUrl: './app-shell.css',
})
export class AppShell {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly user = this.authService.currentUser;
  protected readonly navItems = NAV_ITEMS;
  protected readonly menuOpen = signal(false);

  protected readonly accountName = computed(() => this.user()?.displayName ?? 'Atleta');

  protected readonly avatarLetter = computed(() => {
    const name = this.accountName().trim();
    return name.length > 0 ? name.charAt(0).toUpperCase() : 'A';
  });

  protected toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  protected closeMenu(): void {
    this.menuOpen.set(false);
  }

  protected signOut(): void {
    this.authService.signOut();
    void this.router.navigate(['/']);
  }
}
