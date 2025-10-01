'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  // Validação de senha forte
  const isValidPassword = (password: string): { valid: boolean; message: string } => {
    if (password.length < 8) {
      return { valid: false, message: 'Senha deve ter pelo menos 8 caracteres' };
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return { valid: false, message: 'Senha deve conter pelo menos uma letra minúscula' };
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return { valid: false, message: 'Senha deve conter pelo menos uma letra maiúscula' };
    }
    if (!/(?=.*\d)/.test(password)) {
      return { valid: false, message: 'Senha deve conter pelo menos um número' };
    }
    if (!/(?=.*[@$!%*?&])/.test(password)) {
      return { valid: false, message: 'Senha deve conter pelo menos um caractere especial (@$!%*?&)' };
    }
    return { valid: true, message: '' };
  };

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Verificar se é um callback de reset de senha
        const accessToken = searchParams?.get('access_token');
        const refreshToken = searchParams?.get('refresh_token');
        const type = searchParams?.get('type');

        if (type === 'recovery' && accessToken && refreshToken) {
          // Configurar a sessão com os tokens do callback
          const { data, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (sessionError) {
            console.error('Erro ao configurar sessão:', sessionError);
            setError('Link de recuperação inválido ou expirado');
            setIsLoading(false);
            return;
          }

          if (data.user) {
            // Mostrar formulário para nova senha
            setShowPasswordForm(true);
            setIsLoading(false);
            return;
          }
        }

        // Callback normal de autenticação
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Erro na autenticação:', error);
          setError('Erro na autenticação. Tente novamente.');
          setIsLoading(false);
          return;
        }

        if (data.session?.user) {
          // Login bem-sucedido - redirecionar para o painel
          const { data: profileData } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', data.session.user.id)
            .single();

          if (profileData?.role === 'admin') {
            router.push('/admin');
          } else {
            router.push(`/painel-usuario/${data.session.user.id}`);
          }
        } else {
          // Sem sessão válida
          router.push('/login');
        }
      } catch (error) {
        console.error('Erro no callback:', error);
        setError('Erro inesperado. Tente novamente.');
        setIsLoading(false);
      }
    };

    handleAuthCallback();
  }, [router, searchParams]);

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    const passwordValidation = isValidPassword(newPassword);
    if (!passwordValidation.valid) {
      setError(passwordValidation.message);
      return;
    }

    setIsUpdating(true);
    setError('');

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        console.error('Erro ao atualizar senha:', error);
        setError('Erro ao atualizar senha. Tente novamente.');
        return;
      }

      // Sucesso - redirecionar para login
      alert('Senha atualizada com sucesso! Você será redirecionado para o login.');
      
      // Fazer logout e redirecionar
      await supabase.auth.signOut();
      router.push('/login');
      
    } catch (error) {
      console.error('Erro inesperado:', error);
      setError('Erro inesperado. Tente novamente.');
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-200">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600">Processando...</p>
        </div>
      </div>
    );
  }

  if (showPasswordForm) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-200">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
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
              Nova Senha
            </h1>
            <p className="text-gray-600 text-center">
              Digite sua nova senha abaixo
            </p>
          </div>

          <form onSubmit={handlePasswordUpdate} className="font-inter w-full flex flex-col gap-4">
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Nova senha"
                className="border border-blue-200 rounded-lg p-3 w-full pr-12 focus:ring-2 focus:ring-blue-400 outline-none transition"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                autoFocus
                maxLength={128}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition cursor-pointer"
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

            <input
              type={showPassword ? "text" : "password"}
              placeholder="Confirmar nova senha"
              className="border border-blue-200 rounded-lg p-3 w-full focus:ring-2 focus:ring-blue-400 outline-none transition"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              maxLength={128}
            />

            {/* Critérios de senha */}
            <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded">
              <p className="font-semibold mb-1">Sua senha deve conter:</p>
              <ul className="space-y-1">
                <li className={`flex items-center gap-1 ${newPassword.length >= 8 ? 'text-green-600' : 'text-gray-500'}`}>
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Pelo menos 8 caracteres
                </li>
                <li className={`flex items-center gap-1 ${/(?=.*[a-z])/.test(newPassword) ? 'text-green-600' : 'text-gray-500'}`}>
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Uma letra minúscula
                </li>
                <li className={`flex items-center gap-1 ${/(?=.*[A-Z])/.test(newPassword) ? 'text-green-600' : 'text-gray-500'}`}>
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Uma letra maiúscula
                </li>
                <li className={`flex items-center gap-1 ${/(?=.*\d)/.test(newPassword) ? 'text-green-600' : 'text-gray-500'}`}>
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Um número
                </li>
                <li className={`flex items-center gap-1 ${/(?=.*[@$!%*?&])/.test(newPassword) ? 'text-green-600' : 'text-gray-500'}`}>
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Um caractere especial (@$!%*?&)
                </li>
              </ul>
            </div>

            {error && (
              <div className="text-red-600 text-sm text-center bg-red-50 p-2 rounded">
                {error}
              </div>
            )}

            <button
              type="submit"
              className={`font-poppins rounded-lg py-3 font-semibold transition flex items-center justify-center ${
                isUpdating
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-700 hover:bg-blue-800 text-white'
              }`}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Atualizando...
                </>
              ) : (
                "Atualizar Senha"
              )}
            </button>
          </form>

          <div className="mt-4 text-center">
            <button
              onClick={() => router.push('/login')}
              className="text-gray-600 hover:text-gray-800 text-sm transition flex items-center justify-center gap-1"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Voltar ao login
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-200">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 text-center">
          <div className="text-red-600 mb-4">
            <svg className="w-16 h-16 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Erro na Autenticação</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/login')}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition"
          >
            Voltar ao Login
          </button>
        </div>
      </div>
    );
  }

  return null;
}