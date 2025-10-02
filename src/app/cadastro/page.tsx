"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { FiEye, FiEyeOff, FiUser, FiMail, FiPhone, FiShield, FiAward, FiBriefcase, FiHome } from "react-icons/fi";
import { supabase } from '@/lib/supabase';
import { formatarTelefone } from '@/utils/formatters';
import { CategoriaUsuario } from '@/types/usuarios';

export default function CadastroPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [nome, setNome] = useState("");
  const [sobrenome, setSobrenome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [categoria, setCategoria] = useState<CategoriaUsuario>('proprietario');
  const [creci, setCreci] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatarTelefone(e.target.value);
    setTelefone(formatted);
  };

  const validateForm = () => {
    if (!nome.trim()) {
      setError("Nome é obrigatório");
      return false;
    }
    if (!sobrenome.trim()) {
      setError("Sobrenome é obrigatório");
      return false;
    }
    if (!telefone.trim()) {
      setError("Telefone é obrigatório");
      return false;
    }
    if (!email.trim()) {
      setError("E-mail é obrigatório");
      return false;
    }
    if (!email.includes("@") || !email.includes(".")) {
      setError("E-mail inválido");
      return false;
    }
    if (password !== confirmPassword) {
      setError("As senhas não coincidem");
      return false;
    }
    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres");
      return false;
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      setError("A senha deve conter pelo menos: 1 letra minúscula, 1 maiúscula e 1 número");
      return false;
    }
    if ((categoria === 'corretor' || categoria === 'imobiliaria') && !creci.trim()) {
      setError("CRECI é obrigatório para corretores e imobiliárias");
      return false;
    }
    if (!acceptTerms) {
      setError("Você deve aceitar os termos de uso");
      return false;
    }
    return true;
  };

  const getPasswordStrength = () => {
    if (!password) return { strength: 0, text: "", color: "" };
    
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    if (strength <= 2) return { strength, text: "Fraca", color: "text-red-500" };
    if (strength <= 4) return { strength, text: "Média", color: "text-yellow-500" };
    return { strength, text: "Forte", color: "text-green-500" };
  };

  const passwordStrength = getPasswordStrength();

  const handleCadastro = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    if (!validateForm()) {
      setIsLoading(false);
      return;
    }

    try {
      // Primeiro, verificar se o e-mail já existe
      const { data: existingUser } = await supabase.auth.getUser();
      if (existingUser) {
        // Se já temos um usuário logado, deslogar primeiro
        await supabase.auth.signOut();
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nome: nome.trim(),
            sobrenome: sobrenome.trim(),
            telefone: telefone.trim(),
            categoria: categoria,
            creci: (categoria === 'corretor' || categoria === 'imobiliaria') ? creci.trim() : null
          }
        }
      });

      if (error) {
        if (error.message.includes("already") || 
            error.message.includes("registered") || 
            error.message.includes("exists") ||
            error.message.includes("User already registered")) {
          setError("Este e-mail já possui uma conta cadastrada. Tente fazer login ou use outro e-mail.");
        } else if (error.message.includes("Invalid email")) {
          setError("E-mail inválido. Verifique se digitou corretamente.");
        } else if (error.message.includes("Password")) {
          setError("Erro na senha. Verifique se atende aos critérios de segurança.");
        } else {
          setError(`Erro no cadastro: ${error.message}`);
        }
      } else if (data.user) {
        setSuccess("Cadastro realizado! Verifique seu e-mail para confirmar sua conta.");
        
        console.log("Usuário criado com sucesso! O perfil será criado automaticamente pelo trigger do banco.");
        
        // O trigger handle_new_user() criará automaticamente o perfil com os dados corretos
        // incluindo role baseado na tabela admin_emails

        // Resetar formulário
        setNome("");
        setSobrenome("");
        setTelefone("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setCreci("");
        setCategoria('proprietario');
        setAcceptTerms(false);

        setTimeout(() => {
          router.push("/login");
        }, 3000);
      } else {
        setError("Erro no cadastro. Tente novamente.");
      }
    } catch (err) {
      console.error("Erro no cadastro:", err);
      setError("Erro inesperado. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = () => {
    return (
      nome.trim() &&
      sobrenome.trim() &&
      telefone.trim() &&
      email.trim() &&
      password === confirmPassword && 
      password.length >= 6 && 
      confirmPassword.length >= 6 &&
      acceptTerms &&
      ((categoria === 'proprietario' || categoria === 'proprietario_com_plano') || creci.trim())
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-200 py-8">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center mx-4">
        <div className="mb-6 flex flex-col items-center">
          <div className="relative w-80 h-20 mb-5">
            <Image
              src="/imovion.webp"
              alt="Imovion Logo"
              fill
              className="object-contain"
              priority
              sizes="320px"
            />
          </div>
          <h1 className="font-poppins text-2xl font-extrabold text-blue-700 mb-1">
            Cadastro de Usuário
          </h1>
          <span className="font-inter text-gray-500 text-sm text-center">
            Crie sua conta para anunciar e gerenciar seus imóveis
          </span>
        </div>

        <form
          onSubmit={handleCadastro}
          className="font-inter w-full flex flex-col gap-4"
        >
          {/* Nome */}
          <div className="relative">
            <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400" size={20} />
            <input
              type="text"
              placeholder="Nome"
              className="border border-blue-200 rounded-lg p-3 pl-12 w-full focus:ring-2 focus:ring-blue-400 outline-none transition"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              disabled={isLoading}
              maxLength={50}
            />
          </div>
          
          {/* Sobrenome */}
          <div className="relative">
            <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400" size={20} />
            <input
              type="text"
              placeholder="Sobrenome"
              className="border border-blue-200 rounded-lg p-3 pl-12 w-full focus:ring-2 focus:ring-blue-400 outline-none transition"
              value={sobrenome}
              onChange={(e) => setSobrenome(e.target.value)}
              required
              disabled={isLoading}
              maxLength={50}
            />
          </div>
          
          {/* Telefone */}
          <div className="relative">
            <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400" size={20} />
            <input
              type="tel"
              placeholder="Telefone: (65) 99999-9999"
              className="border border-blue-200 rounded-lg p-3 pl-12 w-full focus:ring-2 focus:ring-blue-400 outline-none transition"
              value={telefone}
              onChange={handleTelefoneChange}
              required
              disabled={isLoading}
              maxLength={15}
            />
          </div>
          
          {/* E-mail */}
          <div className="relative">
            <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400" size={20} />
            <input
              type="email"
              placeholder="E-mail"
              className="border border-blue-200 rounded-lg p-3 pl-12 w-full focus:ring-2 focus:ring-blue-400 outline-none transition"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              disabled={isLoading}
            />
          </div>
          
          {/* Campo de senha */}
          <div className="relative">
            <FiShield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400" size={20} />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Senha (mínimo 6 caracteres)"
              className="border border-blue-200 rounded-lg p-3 pl-12 pr-12 w-full focus:ring-2 focus:ring-blue-400 outline-none transition"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
              disabled={isLoading}
              minLength={6}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-blue-600 transition"
              disabled={isLoading}
            >
              {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
            </button>
          </div>

          {/* Indicador de força da senha */}
          {password && (
            <div className="text-sm flex items-center gap-2">
              <span className="text-gray-600">Força da senha:</span>
              <span className={passwordStrength.color}>{passwordStrength.text}</span>
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all ${
                    passwordStrength.strength <= 2 ? 'bg-red-500' :
                    passwordStrength.strength <= 4 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${(passwordStrength.strength / 6) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Campo de confirmação de senha */}
          <div className="relative">
            <FiShield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400" size={20} />
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirme a senha"
              className="border border-blue-200 rounded-lg p-3 pl-12 pr-12 w-full focus:ring-2 focus:ring-blue-400 outline-none transition"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
              disabled={isLoading}
              minLength={6}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-blue-600 transition"
              disabled={isLoading}
            >
              {showConfirmPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
            </button>
          </div>

          {/* Validação visual das senhas */}
          {password && confirmPassword && (
            <div className="text-sm">
              {password === confirmPassword ? (
                <span className="text-green-600 flex items-center gap-1">
                  ✓ As senhas coincidem
                </span>
              ) : (
                <span className="text-red-600 flex items-center gap-1">
                  ✗ As senhas não coincidem
                </span>
              )}
            </div>
          )}

          {/* Seleção de Categoria */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Tipo de usuário:
            </label>
            
            {/* Usuário Comum */}
            <label className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
              categoria === 'proprietario' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
            }`}>
              <input
                type="radio"
                name="categoria"
                value="proprietario"
                checked={categoria === 'proprietario'}
                onChange={(e) => setCategoria(e.target.value as CategoriaUsuario)}
                className="sr-only"
                disabled={isLoading}
              />
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                <FiUser className="text-gray-600" size={16} />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">Usuário Comum</p>
                <p className="text-sm text-gray-600">Até 1 imóvel gratuito</p>
              </div>
              {categoria === 'proprietario' && (
                <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              )}
            </label>

            {/* Proprietário com Plano */}
            <label className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
              categoria === 'proprietario_com_plano' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-gray-300'
            }`}>
              <input
                type="radio"
                name="categoria"
                value="proprietario_com_plano"
                checked={categoria === 'proprietario_com_plano'}
                onChange={(e) => setCategoria(e.target.value as CategoriaUsuario)}
                className="sr-only"
                disabled={isLoading}
              />
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center mr-3">
                <FiHome className="text-emerald-600" size={16} />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">Proprietário com Plano</p>
                <p className="text-sm text-gray-600">Até 25 imóveis por plano mensal</p>
              </div>
              {categoria === 'proprietario_com_plano' && (
                <div className="w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              )}
            </label>

            {/* Corretor */}
            <label className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
              categoria === 'corretor' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'
            }`}>
              <input
                type="radio"
                name="categoria"
                value="corretor"
                checked={categoria === 'corretor'}
                onChange={(e) => setCategoria(e.target.value as CategoriaUsuario)}
                className="sr-only"
                disabled={isLoading}
              />
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
                <FiAward className="text-green-600" size={16} />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">Corretor</p>
                <p className="text-sm text-gray-600">Até 50 imóveis por plano</p>
              </div>
              {categoria === 'corretor' && (
                <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              )}
            </label>

            {/* Imobiliária */}
            <label className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
              categoria === 'imobiliaria' ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-gray-300'
            }`}>
              <input
                type="radio"
                name="categoria"
                value="imobiliaria"
                checked={categoria === 'imobiliaria'}
                onChange={(e) => setCategoria(e.target.value as CategoriaUsuario)}
                className="sr-only"
                disabled={isLoading}
              />
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                <FiBriefcase className="text-purple-600" size={16} />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">Imobiliária</p>
                <p className="text-sm text-gray-600">Até 150 imóveis por plano</p>
              </div>
              {categoria === 'imobiliaria' && (
                <div className="w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              )}
            </label>
          </div>

          {/* Campo CRECI */}
          {(categoria === 'corretor' || categoria === 'imobiliaria') && (
            <div className="relative animate-in slide-in-from-top-2 duration-300">
              <FiAward className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400" size={20} />
              <input
                type="text"
                placeholder="CRECI (obrigatório para corretores e imobiliárias)"
                className="border border-blue-200 rounded-lg p-3 pl-12 w-full focus:ring-2 focus:ring-blue-400 outline-none transition"
                value={creci}
                onChange={(e) => setCreci(e.target.value)}
                required={categoria === 'corretor' || categoria === 'imobiliaria'}
                disabled={isLoading}
                maxLength={20}
              />
            </div>
          )}

          {/* Termos de uso */}
          <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <input
              type="checkbox"
              id="terms"
              checked={acceptTerms}
              onChange={() => setAcceptTerms(!acceptTerms)}
              disabled={isLoading}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 mt-1"
            />
            <label htmlFor="terms" className="text-gray-700 text-sm">
              Eu aceito os{" "}
              <Link href="/termos" target="_blank" className="text-blue-600 hover:text-blue-800 underline">
                termos de uso
              </Link>{" "}
              e a{" "}
              <Link href="/privacidade" target="_blank" className="text-blue-600 hover:text-blue-800 underline">
                política de privacidade
              </Link>
            </label>
          </div>

          {/* Mensagens de erro/sucesso */}
          {error && (
            <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded border border-red-200 animate-in slide-in-from-top-2 duration-300">
              {error}
            </div>
          )}
          
          {success && (
            <div className="text-green-600 text-sm text-center bg-green-50 p-3 rounded border border-green-200 animate-in slide-in-from-top-2 duration-300">
              {success}
            </div>
          )}

          {/* Botão de cadastro */}
          <button
            type="submit"
            className="font-poppins bg-blue-700 hover:bg-blue-800 text-white rounded-lg py-3 font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            disabled={isLoading || !isFormValid()}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                Cadastrando...
              </>
            ) : (
              "Criar Conta"
            )}
          </button>
        </form>

        {/* Link para login */}
        <div className="mt-6 text-center w-full">
          <p className="text-gray-600 text-sm">
            Já tem conta?{" "}
            <Link 
              href="/login" 
              className="text-blue-700 hover:text-blue-800 font-semibold underline transition"
            >
              Faça login aqui
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}