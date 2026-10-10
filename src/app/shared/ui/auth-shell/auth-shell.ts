import { Component } from '@angular/core';
import { NexusLogo } from '@shared/ui/nexus-logo/nexus-logo';
import { NodeNetwork } from '@shared/ui/node-network/node-network';

@Component({
  selector: 'app-auth-shell',
  imports: [NexusLogo, NodeNetwork],
  templateUrl: './auth-shell.html',
  styleUrl: './auth-shell.css',
})
export class AuthShell {}
