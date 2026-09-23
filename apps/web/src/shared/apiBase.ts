// Базовый адрес API. Локально пусто (тот же сервер), на Vercel — тоже пусто (/api там же).
export const API_BASE: string = import.meta.env.VITE_API_BASE ?? ''
