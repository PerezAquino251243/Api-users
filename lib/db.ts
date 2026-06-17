// lib/db.ts
export interface User {
    id: number;
    name: string;
    gmail: string;
    password: string;
    role: string;
    address?: {
        street?: string;
        city?: string;
        number?: number;
    } | null;
}

// Datos iniciales
export let users: User[] = [
    { 
        id: 1, 
        name: 'Juan Pérez', 
        gmail: 'juan@example.com', 
        password: '123456', 
        role: 'admin', 
        address: { street: 'Calle 123', city: 'Madrid', number: 10 } 
    },
    { 
        id: 2, 
        name: 'María López', 
        gmail: 'maria@example.com', 
        password: 'abcdef', 
        role: 'user', 
        address: null 
    },
];

export let nextId = 3;

// Función para obtener el siguiente ID (incrementa y devuelve)
export function getNextId() {
    return nextId++;
}

// Buscar usuario por ID
export function findUserById(id: number): User | undefined {
    return users.find(u => u.id === id);
}

// Buscar índice de usuario por ID
export function findUserIndexById(id: number): number {
    return users.findIndex(u => u.id === id);
}

// Verificar si un gmail ya está registrado (opcionalmente excluyendo un ID)
export function isGmailTaken(gmail: string, excludeId?: number): boolean {
    return users.some(u => u.gmail === gmail && (excludeId === undefined || u.id !== excludeId));
}