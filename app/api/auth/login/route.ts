
import { type NextRequest, NextResponse } from "next/server";
import { loginSchema } from "@/lib/validators";
import { authenticateUser } from "@/lib/server/auth-logic";
import { generateToken } from "@/lib/auth";
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 1. Validar os dados de entrada (email e senha)
    const validatedData = loginSchema.parse(body);

    // 2. Autenticar o usuário usando a nova função centralizada
    // Esta função agora lança erros específicos e amigáveis
    const user = await authenticateUser(validatedData.email, validatedData.password);

    // 3. Gerar o token JWT para o usuário autenticado
    const token = generateToken(user);

    // 4. Retornar o token e os dados do usuário
    return NextResponse.json({
      success: true,
      token,
      user,
    });

  } catch (error) {
    // 5. Capturar qualquer erro lançado durante o processo
    // A mensagem de erro será a que definimos em `authenticateUser`
    const errorMessage = error instanceof Error ? error.message : "Ocorreu um erro inesperado.";
    
    console.error("Login API Error:", errorMessage);

    // Retorna uma resposta de erro clara para o frontend
    return NextResponse.json(
      { success: false, message: errorMessage },
      { status: 401 } // 401 Unauthorized é o status apropriado para falhas de login
    );
  }
}
