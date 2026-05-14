import { Component, HostListener, ElementRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Auth } from '../auth/services/auth';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, FormsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent implements OnInit {
  isSidebarOpen = true;
  currentLang = 'en';

  // Profile state
  isProfileMenuOpen = false;
  isEditingProfile = false;
  
  firstName = this.getSafeName(localStorage.getItem('firstName'));
  lastName = this.getSafeName(localStorage.getItem('lastName'), true);
  userRole = 'Administrador';
  
  tempFirstName = '';
  tempLastName = '';
  tempRole = '';

  constructor(private eRef: ElementRef, private router: Router, private auth: Auth) {
    if (localStorage.getItem('firstName') === 'null') {
      localStorage.removeItem('firstName');
      this.firstName = 'Usuario';
    }
  }

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`.trim();
  }

  private getSafeName(name: string | null, isLast: boolean = false): string {
    if (!name || name === 'null' || name === 'undefined') return isLast ? '' : 'Usuario';
    return name;
  }

  ngOnInit() {
    this.auth.getProfile().subscribe({
      next: (res: any) => {
        this.firstName = this.getSafeName(res.firstName);
        this.lastName = this.getSafeName(res.lastName, true);
        localStorage.setItem('firstName', this.firstName);
        localStorage.setItem('lastName', this.lastName);
      },
      error: () => this.logout()
    });
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  toggleLanguage() {
    this.currentLang = this.currentLang === 'en' ? 'es' : 'en';
  }

  toggleProfileMenu(event: Event) {
    event.stopPropagation();
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
  }

  openEditProfile() {
    this.tempFirstName = this.firstName;
    this.tempLastName = this.lastName;
    this.tempRole = this.userRole;
    this.isEditingProfile = true;
    this.isProfileMenuOpen = false;
  }

  closeEditProfile() {
    this.isEditingProfile = false;
  }

  saveProfile() {
    if (this.tempFirstName.trim()) {
      this.auth.updateProfile(this.tempFirstName, this.tempLastName).subscribe({
        next: (res: any) => {
          this.firstName = res.firstName;
          this.lastName = res.lastName;
          localStorage.setItem('firstName', this.firstName);
          localStorage.setItem('lastName', this.lastName);
          this.isEditingProfile = false;
        },
        error: (err) => alert('Error al actualizar: ' + (err.error || 'Intenta de nuevo'))
      });
    }
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  @HostListener('document:click', ['$event'])
  clickout(event: Event) {
    if(!this.eRef.nativeElement.contains(event.target)) {
      this.isProfileMenuOpen = false;
    }
  }
}
