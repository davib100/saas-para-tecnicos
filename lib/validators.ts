function clean(value: string): string {
  // Remove todos os caracteres que não são dígitos
  return value ? value.replace(/[^\d]/g, '') : '';
}

/**
 * Valida um número de CPF brasileiro.
 * @param cpf O CPF a ser validado, pode conter máscara.
 * @returns `true` se o CPF for válido, `false` caso contrário.
 */
export function isValidCPF(cpf: string): boolean {
  const cpfClean = clean(cpf);
  if (cpfClean.length !== 11 || /^(\d)\1+$/.test(cpfClean)) {
    return false;
  }
  
  let sum = 0;
  let remainder;

  for (let i = 1; i <= 9; i++) {
    sum = sum + parseInt(cpfClean.substring(i - 1, i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) {
    remainder = 0;
  }
  if (remainder !== parseInt(cpfClean.substring(9, 10))) {
    return false;
  }

  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum = sum + parseInt(cpfClean.substring(i - 1, i)) * (12 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) {
    remainder = 0;
  }
  if (remainder !== parseInt(cpfClean.substring(10, 11))) {
    return false;
  }

  return true;
}

/**
 * Valida um número de CNPJ brasileiro.
 * @param cnpj O CNPJ a ser validado, pode conter máscara.
 * @returns `true` se o CNPJ for válido, `false` caso contrário.
 */
export function isValidCNPJ(cnpj: string): boolean {
  const cnpjClean = clean(cnpj);

  if (
    cnpjClean.length !== 14 ||
    /^(\d)\1+$/.test(cnpjClean)
  ) {
    return false;
  }

  let length = cnpjClean.length - 2;
  let numbers = cnpjClean.substring(0, length);
  const digits = cnpjClean.substring(length);
  let sum = 0;
  let pos = length - 7;

  for (let i = length; i >= 1; i--) {
    sum += parseInt(numbers.charAt(length - i)) * pos--;
    if (pos < 2) {
      pos = 9;
    }
  }
  
  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(0))) {
    return false;
  }

  length = length + 1;
  numbers = cnpjClean.substring(0, length);
  sum = 0;
  pos = length - 7;

  for (let i = length; i >= 1; i--) {
    sum += parseInt(numbers.charAt(length - i)) * pos--;
    if (pos < 2) {
      pos = 9;
    }
  }

  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(1))) {
    return false;
  }

  return true;
}
