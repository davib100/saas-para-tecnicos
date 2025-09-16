
import { z } from "zod"

export function cpfValidation(cpf: string): boolean {
  if (!cpf || typeof cpf !== "string") return false
  const cleanCPF = cpf.replace(/[^\d]/g, "")
  if (cleanCPF.length !== 11 || /^(\d)\1{10}$/.test(cleanCPF)) {
    return false
  }
  
  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i), 10) * (10 - i)
  }
  let remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0
  if (remainder !== parseInt(cleanCPF.charAt(9), 10)) return false
  
  sum = 0
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i), 10) * (11 - i)
  }
  remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0
  return remainder === parseInt(cleanCPF.charAt(10), 10)
}

export function cnpjValidation(cnpj: string): boolean {
  if (!cnpj || typeof cnpj !== "string") return false
  const cleanCNPJ = cnpj.replace(/[^\d]/g, "")
  if (cleanCNPJ.length !== 14 || /^(\d)\1{13}$/.test(cleanCNPJ)) {
    return false
  }
  
  let size = cleanCNPJ.length - 2
  let numbers = cleanCNPJ.substring(0, size)
  const digits = cleanCNPJ.substring(size)
  let sum = 0
  let pos = size - 7
  
  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers.charAt(size - i), 10) * pos--
    if (pos < 2) pos = 9
  }
  
  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11)
  if (result !== parseInt(digits.charAt(0), 10)) return false
  
  size += 1
  numbers = cleanCNPJ.substring(0, size)
  sum = 0
  pos = size - 7
  
  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers.charAt(size - i), 10) * pos--
    if (pos < 2) pos = 9
  }
  
  result = sum % 11 < 2 ? 0 : 11 - (sum % 11)
  return result === parseInt(digits.charAt(1), 10)
}

export const ClientObjectSchema = z.object({
  tipo: z.enum(['PF', 'PJ']),
  documento: z.string().min(1, "Documento é obrigatório"),
  nome: z.string().min(1, "Nome é obrigatório"),
  inscricaoEstadual: z.string().optional(),
  telefone: z.string().min(1, "Telefone é obrigatório"),
  cep: z.string().min(1, "CEP é obrigatório"),
  rua: z.string().min(1, "Rua é obrigatória"),
  numero: z.string().min(1, "Número é obrigatório"),
  complemento: z.string().optional(),
  bairro: z.string().min(1, "Bairro é obrigatório"),
  cidade: z.string().min(1, "Cidade é obrigatória"),
  estado: z.string().min(1, "Estado é obrigatório"),
  consentimentoFoto: z.boolean().optional(),
  observacoes: z.string().optional(),
  criarOS: z.boolean().optional(),
  descricaoProblema: z.string().optional(),
  tipoMaquina: z.string().optional(),
  marca: z.string().optional(),
  modelo: z.string().optional(),
  dataEntrada: z.string().optional(),
  valorEstimado: z.string().optional(),
});

export const ClientSchema = ClientObjectSchema.superRefine((data, ctx) => {
  if (data.tipo === 'PF') {
    if (!cpfValidation(data.documento)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "CPF inválido",
        path: ['documento'],
      })
    }
  } else {
    if (!cnpjValidation(data.documento)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "CNPJ inválido",
        path: ['documento'],
      })
    }
    if (!data.inscricaoEstadual) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Inscrição Estadual é obrigatória para PJ",
        path: ['inscricaoEstadual'],
      })
    }
  }
})

export const productSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").max(100).trim(),
  brand: z.string().max(50).trim().optional(),
  model: z.string().max(50).trim().optional(),
  category: z.string().max(50).trim().optional(),
  description: z.string().max(500).trim().optional(),
  price: z.number().min(0).max(999999.99).multipleOf(0.01).optional(),
  cost: z.number().min(0).max(999999.99).multipleOf(0.01).optional(),
  stock: z.number().int().min(0).max(999999).default(0),
  minStock: z.number().int().min(0).max(999999).default(0),
  barcode: z.string().regex(/^[0-9]{8,14}$/, "Código de barras deve ter entre 8 e 14 dígitos").optional().or(z.literal("")), 
})

export const serviceOrderSchema = z.object({
  clientId: z.string().min(1, "Cliente é obrigatório").uuid("ID do cliente deve ser um UUID válido"),
  equipment: z.string().min(2, "Equipamento deve ter pelo menos 2 caracteres").max(100).trim(),
  brand: z.string().max(50).trim().optional(),
  model: z.string().max(50).trim().optional(),
  serialNumber: z.string().max(50).trim().optional(),
  problem: z.string().min(10, "Descrição do problema deve ter pelo menos 10 caracteres").max(1000).trim(),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
  estimatedValue: z.number().min(0).max(999999.99).multipleOf(0.01).optional(),
  estimatedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  warrantyDays: z.number().int().min(0).max(3650).optional(),
  observations: z.string().max(1000).trim().optional(),
})

export const userSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").max(100),
  email: z.string().email("Email inválido").max(100).toLowerCase().trim(),
  password: z.string().min(8, "Senha deve ter pelo menos 8 caracteres").max(100),
  role: z.enum(['admin', 'user', 'technician']).default('user'),
})

export const loginSchema = z.object({
  email: z.string().email("Email inválido").toLowerCase().trim(),
  password: z.string().min(1, "Senha é obrigatória"),
})

export function formatCPF(cpf: string): string {
  const clean = cpf.replace(/[^\d]/g, "")
  return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
}

export function formatCNPJ(cnpj: string): string {
  const clean = cnpj.replace(/[^\d]/g, "")
  return clean.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5")
}

export function formatPhone(phone: string): string {
  const clean = phone.replace(/[^\d]/g, "")
  if (clean.length === 10) {
    return clean.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3")
  }
  if (clean.length === 11) {
    return clean.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3")
  }
  return phone
}

export function formatValidationErrors(
  error: z.ZodError,
): Record<string, string> {
  const errors: Record<string, string> = {}
  for (const issue of error.issues) {
    const key = issue.path.join(".")
    if (!errors[key]) {
      errors[key] = issue.message
    }
  }
  return errors
}


export type ClientFormData = z.infer<typeof ClientSchema>
export type ProductFormData = z.infer<typeof productSchema>
export type ServiceOrderFormData = z.infer<typeof serviceOrderSchema>
export type UserFormData = z.infer<typeof userSchema>
export type LoginFormData = z.infer<typeof loginSchema>
