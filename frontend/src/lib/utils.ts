import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, parseISO } from "date-fns"
import { fr } from "date-fns/locale"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date, formatStr: string = "dd/MM/yyyy"): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return format(dateObj, formatStr, { locale: fr })
}

export function formatDateTime(date: string | Date): string {
  return formatDate(date, "dd/MM/yyyy 'à' HH:mm")
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('fr-FR').format(num)
}

export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

export function getStatusColor(status: string): string {
  const statusColors: Record<string, string> = {
    // Invoice statuses
    draft: 'bg-neutral-100 text-neutral-700',
    sent: 'bg-blue-100 text-blue-700',
    partially_paid: 'bg-yellow-100 text-yellow-700',
    paid: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
    
    // Payment statuses
    pending: 'bg-yellow-100 text-yellow-700',
    completed: 'bg-green-100 text-green-700',
    failed: 'bg-red-100 text-red-700',
    refunded: 'bg-purple-100 text-purple-700',
    
    // General statuses
    active: 'bg-green-100 text-green-700',
    inactive: 'bg-red-100 text-red-700',
  }
  
  return statusColors[status] || 'bg-neutral-100 text-neutral-700'
}

export function getStatusLabel(status: string): string {
  const statusLabels: Record<string, string> = {
    // Invoice statuses
    draft: 'Brouillon',
    sent: 'Envoyée',
    partially_paid: 'Partiellement payée',
    paid: 'Payée',
    cancelled: 'Annulée',
    
    // Payment statuses
    pending: 'En attente',
    completed: 'Complété',
    failed: 'Échoué',
    refunded: 'Remboursé',
    
    // Payment methods
    cash: 'Espèces',
    check: 'Chèque',
    bank_transfer: 'Virement bancaire',
    mobile_money: 'Mobile Money',
    orange_money: 'Orange Money',
    wave: 'Wave',
    free_money: 'Free Money',
    credit_card: 'Carte de crédit',
    
    // User roles
    superuser: 'Superutilisateur',
    admin: 'Administrateur',
    doctor: 'Docteur',
    secretary: 'Secrétaire',
    accountant: 'Comptable',
    
    // General
    active: 'Actif',
    inactive: 'Inactif',
  }
  
  return statusLabels[status] || status
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export function generateAccessKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export function generatePassword(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export function validateAccessKey(key: string): boolean {
  return /^[A-Z0-9]{12}$/.test(key)
}

export function validatePassword(password: string): boolean {
  return /^[a-z0-9]{8}$/.test(password)
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

export function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || ''
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^(\+221|00221)?[0-9]{9}$/
  return phoneRegex.test(phone.replace(/\s/g, ''))
}

export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.startsWith('221')) {
    return `+${cleaned.substring(0, 3)} ${cleaned.substring(3, 5)} ${cleaned.substring(5, 8)} ${cleaned.substring(8)}`
  }
  if (cleaned.length === 9) {
    return `${cleaned.substring(0, 2)} ${cleaned.substring(2, 5)} ${cleaned.substring(5, 7)} ${cleaned.substring(7)}`
  }
  return phone
}

export function getAgeFromBirthDate(birthDate: string): number {
  const today = new Date()
  const birth = new Date(birthDate)
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  
  return age
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}
