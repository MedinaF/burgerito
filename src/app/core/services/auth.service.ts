import { Injectable, Signal, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs';

import { API_BASE_URL } from '../api/api.config';
import { AuthResponseDto, MeResponseDto } from '../api/dtos/auth.dto';
import { mapUserDto } from '../api/mappers/user.mapper';
import { User } from '../models/user.model';

interface Credentials {
  email: string;
  password: string;
}

interface RegisterPayload extends Credentials {
  name: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly storageKey = 'burger-shop-token';
  private readonly userSignal = signal<User | null>(null);
  private readonly tokenSignal = signal<string | null>(null);

  private sessionReady = false;
  private readonly sessionReadyPromise: Promise<void>;
  private resolveSessionReady!: () => void;

  readonly user: Signal<User | null> = this.userSignal.asReadonly();
  readonly isAuthenticated = computed(() => this.userSignal() !== null);

  constructor(private readonly http: HttpClient, private readonly router: Router) {
    this.sessionReadyPromise = new Promise<void>((resolve) => {
      this.resolveSessionReady = resolve;
    });

    this.restoreFromStorage();
  }

  waitForSessionReady(): Promise<void> {
    return this.sessionReadyPromise;
  }

  login(payload: Credentials) {
    return this.http
      .post<AuthResponseDto>(`${API_BASE_URL}/auth/login`, payload)
      .pipe(tap((response) => this.persistSession(response)));
  }

  register(payload: RegisterPayload) {
    return this.http
      .post<AuthResponseDto>(`${API_BASE_URL}/auth/register`, payload)
      .pipe(tap((response) => this.persistSession(response)));
  }

  logout() {
    this.clearSession();
    void this.router.navigate(['/']);
  }

  getToken(): string | null {
    return this.tokenSignal();
  }

  private restoreFromStorage() {
    const storedToken = this.readStorageToken();
    if (!storedToken) {
      this.markSessionReady();
      return;
    }

    this.tokenSignal.set(storedToken);

    this.http.get<MeResponseDto>(`${API_BASE_URL}/auth/me`).subscribe({
      next: ({ user }) => {
        this.userSignal.set(mapUserDto(user));
      },
      error: () => {
        this.clearSession();
        this.markSessionReady();
      },
      complete: () => this.markSessionReady()
    });
  }

  private persistSession(response: AuthResponseDto) {
    const user = mapUserDto(response.user);
    this.userSignal.set(user);
    this.tokenSignal.set(response.token);
    this.writeStorageToken(response.token);
  }

  private clearSession() {
    this.userSignal.set(null);
    this.tokenSignal.set(null);
    this.deleteStorageToken();
  }

  private markSessionReady() {
    if (!this.sessionReady) {
      this.sessionReady = true;
      this.resolveSessionReady();
    }
  }

  private readStorageToken(): string | null {
    if (typeof window === 'undefined') {
      return null;
    }
    return window.localStorage.getItem(this.storageKey);
  }

  private writeStorageToken(token: string) {
    if (typeof window === 'undefined') {
      return;
    }
    window.localStorage.setItem(this.storageKey, token);
  }

  private deleteStorageToken() {
    if (typeof window === 'undefined') {
      return;
    }
    window.localStorage.removeItem(this.storageKey);
  }
}
