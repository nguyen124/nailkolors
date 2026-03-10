import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { User } from '../models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _user = signal<User | null>(null);
  currentUser = this._user.asReadonly();

  constructor(private http: HttpClient, private router: Router) {
    const stored = localStorage.getItem('user');
    if (stored) this._user.set(JSON.parse(stored));
  }

  register(data: { name: string; email: string; password: string; phone?: string; role: 'customer' | 'technician' }) {
    return this.http.post<{ token: string; user: User }>('/api/auth/register', data).pipe(
      tap(res => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify(res.user));
        this._user.set(res.user);
      })
    );
  }

  login(email: string, password: string) {
    return this.http.post<{ token: string; user: User }>('/api/auth/login', { email, password }).pipe(
      tap(res => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify(res.user));
        this._user.set(res.user);
      })
    );
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this._user.set(null);
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }
}
