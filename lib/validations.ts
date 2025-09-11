import { z } from "zod"

export const clientSchema = z.object({
  name: z
    .string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(100, "Nome deve ter no máximo 100 caracteres")
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, "Nome deve conter apenas letras, espaços, hífens e apostrofes"),
  email: z
    .string()
    .email("Email inválido")
    .optional()
    .or(z.literal(""))
    .transform((val) => (val === "" ? undefined : val)),
  phone: z
    .string()
    .regex(/^($$\d{2}$$\s?)?\d{4,5}-?\d{4}$/, "Telefone deve estar no formato (11) 99999-9999")
    .optional()
    .or(z.literal("")),
  cpf: z
    .string()
    .regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, "CPF deve estar no formato 000.000.000-00")
    .refine((cpf) => validateCPF(cpf), "CPF inválido")
    .optional()
    .or(z.literal("")),
  cnpj: z
    .string()
    .regex(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/, "CNPJ deve estar no formato 00.000.000/0000-00")
    .refine((cnpj) => validateCNPJ(cnpj), "CNPJ inválido")
    .optional()
    .or(z.literal("")),
  address: z.string().max(200, "Endereço deve ter no máximo 200 caracteres").optional(),
  city: z.string().max(100, "Cidade deve ter no máximo 100 caracteres").optional(),
  state: z
    .string()
    .length(2, "Estado deve ter 2 caracteres")
    .regex(/^[A-Z]{2}$/, "Estado deve conter apenas letras maiúsculas")
    .optional()
    .or(z.literal("")),
  zipCode: z
    .string()
    .regex(/^\d{5}-?\d{3}$/, "CEP deve estar no formato 00000-000")
    .optional()
    .or(z.literal("")),
  notes: z.string().max(500, "Observações devem ter no máximo 500 caracteres").optional(),
})

export const productSchema = z.object({
  name: z
    .string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(100, "Nome deve ter no máximo 100 caracteres")
    .trim(),
  brand: z.string().max(50, "Marca deve ter no máximo 50 caracteres").trim().optional(),
  model: z.string().max(50, "Modelo deve ter no máximo 50 caracteres").trim().optional(),
  category: z.string().max(50, "Categoria deve ter no máximo 50 caracteres").trim().optional(),
  description: z.string().max(500, "Descrição deve ter no máximo 500 caracteres").trim().optional(),
  price: z
    .number()
    .min(0, "Preço deve ser positivo")
    .max(999999.99, "Preço deve ser menor que R$ 999.999,99")
    .multipleOf(0.01, "Preço deve ter no máximo 2 casas decimais")
    .optional(),
  cost: z
    .number()
    .min(0, "Custo deve ser positivo")
    .max(999999.99, "Custo deve ser menor que R$ 999.999,99")
    .multipleOf(0.01, "Custo deve ter no máximo 2 casas decimais")
    .optional(),
  stock: z
    .number()
    .int("Estoque deve ser um número inteiro")
    .min(0, "Estoque deve ser positivo")
    .max(999999, "Estoque deve ser menor que 999.999")
    .default(0),
  minStock: z
    .number()
    .int("Estoque mínimo deve ser um número inteiro")
    .min(0, "Estoque mínimo deve ser positivo")
    .max(999999, "Estoque mínimo deve ser menor que 999.999")
    .default(0),
  barcode: z
    .string()
    .regex(/^[0-9]{8,14}$/, "Código de barras deve ter entre 8 e 14 dígitos")
    .optional()
    .or(z.literal("")),
})

export const serviceOrderSchema = z.object({
  clientId: z.string().min(1, "Cliente é obrigatório").uuid("ID do cliente deve ser um UUID válido"),
  equipment: z
    .string()
    .min(2, "Equipamento deve ter pelo menos 2 caracteres")
    .max(100, "Equipamento deve ter no máximo 100 caracteres")
    .trim(),
  brand: z.string().max(50, "Marca deve ter no máximo 50 caracteres").trim().optional(),
  model: z.string().max(50, "Modelo deve ter no máximo 50 caracteres").trim().optional(),
  serialNumber: z.string().max(50, "Número de série deve ter no máximo 50 caracteres").trim().optional(),
  problem: z
    .string()
    .min(10, "Descrição do problema deve ter pelo menos 10 caracteres")
    .max(1000, "Descrição do problema deve ter no máximo 1000 caracteres")
    .trim(),
  priority: z
    .enum(["low", "normal", "high", "urgent"], {
      errorMap: () => ({ message: "Prioridade deve ser baixa, normal, alta ou urgente" }),
    })
    .default("normal"),
  estimatedValue: z
    .number()
    .min(0, "Valor estimado deve ser positivo")
    .max(999999.99, "Valor estimado deve ser menor que R$ 999.999,99")
    .multipleOf(0.01, "Valor estimado deve ter no máximo 2 casas decimais")
    .optional(),
  estimatedDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Data deve estar no formato YYYY-MM-DD")
    .refine((date) => {
      const parsedDate = new Date(date)
      return parsedDate > new Date()
    }, "Data estimada deve ser futura")
    .optional(),
  warrantyDays: z
    .number()
    .int("Dias de garantia deve ser um número inteiro")
    .min(0, "Dias de garantia deve ser positivo")
    .max(3650, "Garantia não pode ser maior que 10 anos")
    .optional(),
  observations: z.string().max(1000, "Observações devem ter no máximo 1000 caracteres").trim().optional(),
})

export const userSchema = z.object({
  name: z
    .string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(100, "Nome deve ter no máximo 100 caracteres")
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, "Nome deve conter apenas letras, espaços, hífens e apostrofes")
    .trim(),
  email: z.string().email("Email inválido").max(100, "Email deve ter no máximo 100 caracteres").toLowerCase().trim(),
  password: z
    .string()
    .min(8, "Senha deve ter pelo menos 8 caracteres")
    .max(100, "Senha deve ter no máximo 100 caracteres")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
      "Senha deve conter pelo menos uma letra minúscula, uma maiúscula, um número e um caractere especial",
    ),
  role: z
    .enum(["admin", "user", "technician"], {
      errorMap: () => ({ message: "Função deve ser admin, usuário ou técnico" }),
    })
    .default("user"),
})

export const loginSchema = z.object({
  email: z.string().email("Email inválido").toLowerCase().trim(),
  password: z.string().min(1, "Senha é obrigatória"),
})

export const companySettingsSchema = z.object({
  autoBackup: z.boolean().default(true),
  backupTime: z
    .string()
    .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Horário deve estar no formato HH:MM")
    .default("02:00"),
  backupRetentionDays: z
    .number()
    .int()
    .min(1, "Retenção deve ser pelo menos 1 dia")
    .max(365, "Retenção não pode ser maior que 365 dias")
    .default(30),
  emailNotifications: z.boolean().default(true),
  smsNotifications: z.boolean().default(false),
  defaultWarrantyDays: z
    .number()
    .int()
    .min(0, "Garantia padrão deve ser positiva")
    .max(3650, "Garantia padrão não pode ser maior que 10 anos")
    .default(90),
  taxRate: z
    .number()
    .min(0, "Taxa deve ser positiva")
    .max(100, "Taxa não pode ser maior que 100%")
    .multipleOf(0.01, "Taxa deve ter no máximo 2 casas decimais")
    .optional(),
  currency: z
    .string()
    .length(3, "Moeda deve ter 3 caracteres")
    .regex(/^[A-Z]{3}$/, "Moeda deve conter apenas letras maiúsculas")
    .default("BRL"),
  timezone: z.string().default("America/Sao_Paulo"),
})

export function formatValidationErrors(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {}

  error.errors.forEach((err) => {
    const path = err.path.join(".")
    if (!errors[path]) {
      // Only keep the first error for each field
      errors[path] = err.message
    }
  })

  return errors
}

export function validateCPF(cpf: string): boolean {
  if (!cpf || typeof cpf !== "string") return false

  const cleanCPF = cpf.replace(/[^\d]/g, "")

  if (cleanCPF.length !== 11 || /^(\d)\1{10}$/.test(cleanCPF)) {
    return false
  }

  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += Number.parseInt(cleanCPF.charAt(i), 10) * (10 - i)
  }

  let remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0
  if (remainder !== Number.parseInt(cleanCPF.charAt(9), 10)) return false

  sum = 0
  for (let i = 0; i < 10; i++) {
    sum += Number.parseInt(cleanCPF.charAt(i), 10) * (11 - i)
  }

  remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0

  return remainder === Number.parseInt(cleanCPF.charAt(10), 10)
}

export function validateCNPJ(cnpj: string): boolean {
  if (!cnpj || typeof cnpj !== "string") return false

  const cleanCNPJ = cnpj.replace(/[^\d]/g, "")

  if (cleanCNPJ.length !== 14 || /^(\d)\1{13}$/.test(cleanCNPJ)) {
    return false
  }

  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  const weights2 = [6, 7, 8, 9, 2, 3, 4, 5, 6, 7, 8, 9]

  let sum = 0
  for (let i = 0; i < 12; i++) {
    sum += Number.parseInt(cleanCNPJ.charAt(i), 10) * weights1[i]
  }

  let remainder = sum % 11
  const digit1 = remainder < 2 ? 0 : 11 - remainder

  if (digit1 !== Number.parseInt(cleanCNPJ.charAt(12), 10)) return false

  sum = 0
  for (let i = 0; i < 13; i++) {
    sum += Number.parseInt(cleanCNPJ.charAt(i), 10) * weights2[i]
  }

  remainder = sum % 11
  const digit2 = remainder < 2 ? 0 : 11 - remainder

  return digit2 === Number.parseInt(cleanCNPJ.charAt(13), 10)
}

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

export type ClientFormData = z.infer<typeof clientSchema>
export type ProductFormData = z.infer<typeof productSchema>
export type ServiceOrderFormData = z.infer<typeof serviceOrderSchema>
export type UserFormData = z.infer<typeof userSchema>
export type LoginFormData = z.infer<typeof loginSchema>
export type CompanySettingsFormData = z.infer<typeof companySettingsSchema>
