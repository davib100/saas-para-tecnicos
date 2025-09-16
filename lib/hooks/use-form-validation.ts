
"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { z } from "zod"
import { formatValidationErrors } from "@/lib/validators"

interface UseFormValidationOptions<T> {
  schema: z.ZodSchema<T>
  onSubmit: (data: T) => Promise<void> | void
}

interface UseFormValidationReturn<T> {
  data: Partial<T>
  errors: Record<string, string>
  isSubmitting: boolean
  isValid: boolean
  setValue: (field: keyof T, value: any) => void
  setData: (data: Partial<T>) => void
  handleSubmit: (e: React.FormEvent) => Promise<void>
  reset: () => void
  validateField: (field: keyof T) => boolean
}

export function useFormValidation<T extends Record<string, any>>({
  schema,
  onSubmit,
}: UseFormValidationOptions<T>): UseFormValidationReturn<T> {
  const [data, setDataState] = useState<Partial<T>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const setValue = useCallback(
    (field: keyof T, value: any) => {
      setDataState((prev) => ({ ...prev, [field]: value }))

      // Clear error for this field when user starts typing
      if (errors[field as string]) {
        setErrors((prev) => {
          const newErrors = { ...prev }
          delete newErrors[field as string]
          return newErrors
        })
      }
    },
    [errors],
  )

  const setData = useCallback((newData: Partial<T>) => {
    setDataState(newData)
    setErrors({})
  }, [])

  const validateField = useCallback(
    (field: keyof T): boolean => {
      const result = schema.safeParse(data);
      if (result.success) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field as string];
          return newErrors;
        });
        return true;
      }

      const validationErrors = formatValidationErrors(result.error);
      const fieldError = validationErrors[field as string];

      if (fieldError) {
        setErrors((prev) => ({ ...prev, [field as string]: fieldError }));
        return false;
      } else {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field as string];
          return newErrors;
        });
        return true;
      }
    },
    [data, schema],
  )

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setIsSubmitting(true)

      try {
        const validatedData = schema.parse(data)
        await onSubmit(validatedData)
        setErrors({})
      } catch (error) {
        if (error instanceof z.ZodError) {
          const validationErrors = formatValidationErrors(error)
          setErrors(validationErrors)
        } else {
          console.error("[v0] Form submission error:", error)
          setErrors({ _form: "Erro ao enviar formulário. Tente novamente." })
        }
      } finally {
        setIsSubmitting(false)
      }
    },
    [data, schema, onSubmit],
  )

  const reset = useCallback(() => {
    setDataState({})
    setErrors({})
    setIsSubmitting(false)
  }, [])

  const isValid = Object.keys(errors).length === 0 && Object.keys(data).length > 0

  return {
    data,
    errors,
    isSubmitting,
    isValid,
    setValue,
    setData,
    handleSubmit,
    reset,
    validateField,
  }
}
