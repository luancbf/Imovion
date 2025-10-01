"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import Image from "next/image";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const { loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState("");
  
  // Proteções de segurança
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockTimeRemaining, setBlockTimeRemaining] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [honeypot, setHoneypot] = useState(''); // Campo honeypot para detectar bots

  // Rate limiting - bloquear após 5 tentativas por 15 minutos
  const MAX_ATTEMPTS = 5;
  const BLOCK_DURATION = 15 * 60 * 1000; // 15 minutos

  // Função para log de auditoria de segurança
  const logSecurityEvent = (event: string, details?: Record<string, unknown>) => {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      event,
      details,
      userAgent: navigator.userAgent,
      ip: 'client-side' // Em produção, seria capturado no servidor
    };
    
    // Só mostrar logs em desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[SECURITY] ${event}:`, logEntry);
    }
    
    // Em produção, enviar para servidor de auditoria (implementar conforme necessário)
    // if (process.env.NODE_ENV === 'production') {
    //   sendToAuditServer(logEntry);
    // }
  };

  useEffect(() => {
    // Verificar se há bloqueio ativo
    const blockData = localStorage.getItem('login_block');
    if (blockData) {
      const { attempts, blockedUntil } = JSON.parse(blockData);
      const now = Date.now();
      
      if (blockedUntil && now < blockedUntil) {
        setIsBlocked(true);
        setLoginAttempts(attempts);
        setBlockTimeRemaining(Math.ceil((blockedUntil - now) / 1000));
        
        const interval = setInterval(() => {
          const remaining = Math.ceil((blockedUntil - Date.now()) / 1000);
          if (remaining <= 0) {
            setIsBlocked(false);
            setBlockTimeRemaining(0);
            setLoginAttempts(0);
            localStorage.removeItem('login_block');
            clearInterval(interval);
          } else {
            setBlockTimeRemaining(remaining);
          }
        }, 1000);
        
        return () => clearInterval(interval);
      } else {
        setLoginAttempts(attempts);
        if (blockedUntil) localStorage.removeItem('login_block');
      }
    }
  }, []);

  // Função para validar email
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Função para validar senha (mínimo 6 caracteres)
  const isValidPassword = (password: string) => {
    return password.length >= 6;
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);
    setResetMessage("");

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/auth/callback?redirect_to=/painel-usuario`,
      });

      if (error) {
        setResetMessage(`Erro: ${error.message}`);
      } else {
        setResetMessage("Link de recuperação enviado para seu e-mail!");
        setTimeout(() => {
          setShowForgotPassword(false);
          setResetEmail("");
          setResetMessage("");
        }, 3000);
      }
    } catch {
      setResetMessage("Erro inesperado. Tente novamente.");
    } finally {
      setResetLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Verificar honeypot (campo oculto que bots podem preencher)
    if (honeypot.length > 0) {
      logSecurityEvent('BOT_DETECTED', { honeypotValue: honeypot });
      setError("Erro de segurança detectado.");
      return;
    }
    
    // Verificar se está bloqueado
    if (isBlocked) {
      logSecurityEvent('LOGIN_ATTEMPT_WHILE_BLOCKED', { 
        remainingTime: blockTimeRemaining,
        attempts: loginAttempts 
      });
      setError(`Login bloqueado. Tente novamente em ${Math.ceil(blockTimeRemaining / 60)} minutos.`);
      return;
    }

    // Validações de entrada
    if (!isValidEmail(email)) {
      setError("Por favor, insira um e-mail válido.");
      return;
    }

    if (!isValidPassword(password)) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(), // Normalizar email
        password,
      });

      if (error) {
        // Incrementar tentativas de login
        const newAttempts = loginAttempts + 1;
        setLoginAttempts(newAttempts);
        
        // Log de tentativa falhada
        logSecurityEvent('LOGIN_FAILED', {
          email: email.toLowerCase().trim(),
          attempt: newAttempts,
          errorCode: error.message
        });
        
        // Salvar tentativas no localStorage
        const blockData = {
          attempts: newAttempts,
          blockedUntil: newAttempts >= MAX_ATTEMPTS ? Date.now() + BLOCK_DURATION : null
        };
        localStorage.setItem('login_block', JSON.stringify(blockData));
        
        // Verificar se deve bloquear
        if (newAttempts >= MAX_ATTEMPTS) {
          setIsBlocked(true);
          setBlockTimeRemaining(BLOCK_DURATION / 1000);
          logSecurityEvent('USER_BLOCKED', { email: email.toLowerCase().trim(), attempts: newAttempts });
          setError(`Muitas tentativas falharam. Login bloqueado por 15 minutos.`);
        } else {
          // Mensagens de erro mais seguras (não revelar se email existe)
          const attemptsLeft = MAX_ATTEMPTS - newAttempts;
          setError(`Credenciais inválidas. ${attemptsLeft} tentativa(s) restante(s).`);
        }
        return;
      }

      if (data.user) {
        // Log de login bem-sucedido
        logSecurityEvent('LOGIN_SUCCESS', { 
          userId: data.user.id,
          email: data.user.email
        });
        
        // Reset tentativas em caso de sucesso
        localStorage.removeItem('login_block');
        setLoginAttempts(0);
        
        console.log("Usuário logado:", data.user.id);
        
        // Verificar se o email foi confirmado
        if (!data.user.email_confirmed_at) {
          setError("Por favor, confirme seu e-mail antes de fazer login.");
          await supabase.auth.signOut();
          return;
        }
        
        // Tentar buscar perfil com tratamento melhorado
        let perfil = null;
        let attempts = 0;
        const maxAttempts = 3;

        while (attempts < maxAttempts && !perfil) {
          attempts++;
          
          try {
            const { data: profileData, error: perfilError } = await supabase
              .from("profiles")
              .select("role, nome, email")
              .eq("id", data.user.id)
              .single();

            if (perfilError) {
              console.error(`Tentativa ${attempts} - Erro ao buscar perfil:`, perfilError);
              
              if (attempts === maxAttempts) {
                // Se chegou na última tentativa e perfil não foi criado pelo trigger
                console.error("Perfil não foi criado automaticamente. Verifique o trigger handle_new_user()");
                setError("Erro ao carregar perfil. Tente fazer login novamente.");
                return;
              } else {
                // Aguardar um pouco antes da próxima tentativa
                await new Promise(resolve => setTimeout(resolve, 1000));
              }
            } else {
              perfil = profileData;
            }
          } catch (error) {
            console.error(`Tentativa ${attempts} - Erro inesperado:`, error);
            if (attempts === maxAttempts) {
              setError("Erro de conexão. Redirecionando como usuário comum...");
              router.push("/painel-usuario");
              return;
            }
          }
        }

        if (!perfil) {
          console.log("Não foi possível obter perfil, usando padrão");
          perfil = { role: "user" };
        }

        // Garantir que sempre tenha uma role
        const userRole = perfil.role || "user";
        console.log("Role do usuário:", userRole);

        if (userRole === "admin") {
          router.push("/admin");
        } else {
          router.push("/painel-usuario");
        }
      } else {
        setError("Erro no login. Tente novamente.");
      }
    } catch (error) {
      console.error("Erro no login:", error);
      setError("Erro inesperado. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="mt-2 text-gray-600">Verificando acesso...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-200">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center">
        <div className="mb-6 flex flex-col items-center">
          <Image
            src="/imovion.webp"
            alt="Imovion Logo"
            width={240}
            height={60}
            className="mb-5"
            priority
          />
          <h1 className="font-poppins text-2xl font-extrabold text-blue-700 mb-1">
            Login
          </h1>
          <span className="font-inter text-gray-500 text-sm">
            Acesse sua conta para gerenciar seus imóveis
          </span>
        </div>

        <form
          onSubmit={handleLogin}
          className="font-inter w-full flex flex-col gap-4"
        >
          {/* Campo honeypot oculto para detectar bots */}
          <input
            type="text"
            name="honeypot"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
            style={{ display: 'none' }}
            tabIndex={-1}
            autoComplete="off"
          />
          
          <div>
            <input
              type="email"
              placeholder="E-mail"
              className={`border rounded-lg p-3 w-full focus:ring-2 outline-none transition ${
                isBlocked ? 'border-red-300 bg-red-50' : 'border-blue-200 focus:ring-blue-400'
              }`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              autoComplete="email"
              disabled={isLoading || isBlocked}
              maxLength={100}
            />
          </div>
          
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Senha"
              className={`border rounded-lg p-3 w-full pr-12 focus:ring-2 outline-none transition ${
                isBlocked ? 'border-red-300 bg-red-50' : 'border-blue-200 focus:ring-blue-400'
              }`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              disabled={isLoading || isBlocked}
              maxLength={128}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition"
              disabled={isLoading || isBlocked}
            >
              {showPassword ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                  <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          </div>

          {/* Mostrar tentativas restantes */}
          {loginAttempts > 0 && !isBlocked && (
            <div className="text-amber-600 text-sm text-center bg-amber-50 p-2 rounded flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {MAX_ATTEMPTS - loginAttempts} tentativa(s) restante(s)
            </div>
          )}

          {/* Mostrar bloqueio */}
          {isBlocked && (
            <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded border border-red-200">
              <div className="flex items-center justify-center gap-2 mb-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                Login bloqueado por segurança
              </div>
              Tempo restante: {Math.floor(blockTimeRemaining / 60)}m {blockTimeRemaining % 60}s
            </div>
          )}

          {error && (
            <div className="text-red-600 text-sm text-center bg-red-50 p-2 rounded">
              {error}
            </div>
          )}

          <button
            type="submit"
            className={`font-poppins rounded-lg py-3 font-semibold transition flex items-center justify-center cursor-pointer ${
              isLoading || isBlocked
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-700 hover:bg-blue-800 text-white'
            }`}
            disabled={isLoading || isBlocked}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                Entrando...
              </>
            ) : isBlocked ? (
              <>
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                Login Bloqueado
              </>
            ) : (
              "Entrar"
            )}
          </button>
        </form>

        {/* Link para esqueci a senha */}
        <div className="mt-4 text-center">
          <button
            onClick={() => setShowForgotPassword(true)}
            className="text-blue-700 hover:text-blue-800 font-semibold text-sm underline transition cursor-pointer"
          >
            Esqueci minha senha
          </button>
        </div>

        {/* Link para cadastro */}
        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm">
            Ainda não tem uma conta?{" "}
            <Link
              href="/cadastro"
              className="text-blue-700 hover:text-blue-800 font-semibold underline transition"
            >
              Cadastre-se aqui
            </Link>
          </p>
        </div>
      </div>

      {/* Modal de Esqueci a Senha */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
            <h2 className="font-poppins text-xl font-bold text-blue-700 mb-4 text-center">
              Recuperar Senha
            </h2>
            <p className="text-gray-600 text-sm mb-6 text-center">
              Digite seu e-mail para receber um link de recuperação de senha
            </p>

            <form onSubmit={handlePasswordReset} className="space-y-4">
              <input
                type="email"
                placeholder="Seu e-mail"
                className="border border-blue-200 rounded-lg p-3 w-full focus:ring-2 focus:ring-blue-400 outline-none transition"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                required
                autoFocus
                disabled={resetLoading}
              />

              {resetMessage && (
                <div className={`text-sm text-center p-2 rounded ${
                  resetMessage.includes("Erro") 
                    ? "text-red-600 bg-red-50" 
                    : "text-green-600 bg-green-50"
                }`}>
                  {resetMessage}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(false);
                    setResetEmail("");
                    setResetMessage("");
                  }}
                  className="flex-1 border border-gray-300 text-gray-700 rounded-lg py-3 font-semibold hover:bg-gray-50 transition"
                  disabled={resetLoading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-700 hover:bg-blue-800 text-white rounded-lg py-3 font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  disabled={resetLoading}
                >
                  {resetLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      Enviando...
                    </>
                  ) : (
                    "Enviar Link"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}