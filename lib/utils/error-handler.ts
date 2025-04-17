/**
 * Verifica se o erro é um erro de limite de taxa (Too Many Requests)
 */
export function isTooManyRequestsError(error: any): boolean {
  if (!error) return false

  // Verificar a mensagem de erro
  if (typeof error.message === "string") {
    return error.message.includes("Too Many") || error.message.includes("429")
  }

  // Verificar o código de erro
  if (error.code) {
    return error.code === 429 || error.code === "429"
  }

  // Verificar se é uma string
  if (typeof error === "string") {
    return error.includes("Too Many") || error.includes("429")
  }

  return false
}

/**
 * Formata uma mensagem de erro amigável com base no tipo de erro
 */
export function formatErrorMessage(error: any): string {
  if (!error) return "Ocorreu um erro desconhecido"

  if (isTooManyRequestsError(error)) {
    return "Estamos recebendo muitas requisições no momento. Por favor, aguarde um momento e tente novamente."
  }

  if (error.message) {
    return error.message
  }

  if (typeof error === "string") {
    return error
  }

  return "Ocorreu um erro ao processar sua solicitação"
}
