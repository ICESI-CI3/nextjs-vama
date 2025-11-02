// Tipos para autenticación

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'player' | 'admin';
  total_score: number;
  profile_image?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  access_token: string;
}

export interface LoginResponse extends AuthResponse {}
export interface RegisterResponse extends AuthResponse {}

export interface UpdateUserDto {
  name?: string;
  email?: string;
  profile_image?: string;
}

export interface ChangeRoleDto {
  role: 'player' | 'admin';
}

// Los endpoints para activar/desactivar generalmente no requieren más que el id por URL
// pero si necesitan payload, puede ser este:
export interface ActivateUserDto {
  is_active: true;
}

export interface DeactivateUserDto {
  is_active: false;
}

