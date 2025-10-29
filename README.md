# 🏠 Imovion - Plataforma de Imóveis

![Imovion Logo](public/imovion.webp)

> **Encontre seu imóvel ideal com segurança e praticidade**

Plataforma moderna e responsiva para compra, venda e aluguel de imóveis, desenvolvida com Next.js 15 e as mais recentes tecnologias do mercado.

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/luancbf/imovion)

## � Características Principais

### 💡 Funcionalidades Core
- **Busca Avançada**: Filtros inteligentes por localização, preço, tipo de imóvel
- **Anúncios Dinâmicos**: Sistema completo de cadastro e gerenciamento de imóveis
- **Integração APIs**: Suporte a múltiplas APIs de imobiliárias parceiras
- **Autenticação Segura**: Login social e sistema de usuários robusto
- **Painel Administrativo**: Interface completa para gestão de conteúdo

### ⚡ Performance & UX
- **PWA Ready**: Aplicativo web progressivo com cache offline
- **SSR/SSG**: Server-side rendering e geração estática otimizada
- **Code Splitting**: Carregamento sob demanda de componentes
- **Lazy Loading**: Otimização de imagens e componentes
- **Performance Monitoring**: Monitoramento de métricas em tempo real

### � SEO & Marketing
- **Meta Tags Dinâmicas**: SEO otimizado para cada página
- **Schema.org**: Dados estruturados para imóveis
- **Open Graph**: Compartilhamento otimizado em redes sociais
- **Sitemap Automático**: Geração dinâmica de sitemap.xml
- Tracking de conversões e leads
- Templates personalizáveis por corretor

## 🏗️ Arquitetura Técnica

### **Stack Tecnológico**

## 🛠️ Stack Tecnológica

### Frontend
- **Next.js 15** - Framework React com App Router
- **React 19** - Biblioteca de interface do usuário
- **TypeScript** - Tipagem estática
- **Tailwind CSS 4** - Framework CSS utilitário
- **React Hook Form** - Gerenciamento de formulários

### Backend & Infraestrutura
- **Supabase** - Backend-as-a-Service (Auth, Database, Storage)
- **Vercel Analytics** - Monitoramento de performance
- **Service Workers** - Cache e funcionalidades offline

### Desenvolvimento
- **ESLint** - Linting de código
- **Jest** - Framework de testes
- **Prettier** - Formatação de código
- **Husky** - Git hooks

## 🚀 Guia de Instalação

### Pré-requisitos
- **Node.js** 18+ 
- **npm** ou **yarn**
- Conta no **Supabase**
- Conta no **Vercel** (opcional para deploy)

### 1. Clone o Repositório
```bash
git clone https://github.com/luancbf/imovion.git
cd imovion
```

### 2. Instalação de Dependências
```bash
npm install
# ou
yarn install
```

### 3. Configuração de Ambiente
Crie um arquivo `.env.local` na raiz do projeto:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=sua_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_supabase
SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role

# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Analytics (opcional)
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=seu_id_analytics
```

### 4. Configuração do Banco de Dados

#### Supabase Setup
1. Acesse [supabase.com](https://supabase.com)
2. Crie um novo projeto
3. Execute os scripts SQL em `database/schema.sql`
4. Configure as políticas RLS (Row Level Security)

#### Estrutura das Tabelas Principais
```sql
-- Tabela de imóveis
CREATE TABLE imoveis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cidade VARCHAR NOT NULL,
  bairro VARCHAR NOT NULL,
  enderecodetalhado TEXT,
  valor DECIMAL NOT NULL,
  metragem DECIMAL,
  descricao TEXT,
  tipoimovel VARCHAR NOT NULL,
  tiponegocio VARCHAR NOT NULL,
  setornegocio VARCHAR NOT NULL,
  imagens TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_imoveis_cidade ON imoveis(cidade);
CREATE INDEX idx_imoveis_tipo ON imoveis(tipoimovel, tiponegocio);
CREATE INDEX idx_imoveis_valor ON imoveis(valor);
```

### 5. Executar o Projeto
```bash
npm run dev
# ou
yarn dev
```

Acesse [http://localhost:3000](http://localhost:3000) no seu navegador.

## 📁 Estrutura do Projeto

```
imovion/
├── public/                    # Assets estáticos
│   ├── icons/                # Ícones PWA
│   ├── manifest.json         # Manifesto PWA
│   ├── sw.js                # Service Worker
│   └── offline.html          # Página offline
├── src/
│   ├── app/                  # App Router (Next.js 13+)
│   │   ├── api/             # API Routes
│   │   ├── admin/           # Painel administrativo
│   │   ├── imoveis/         # Páginas de imóveis
│   │   └── layout.tsx       # Layout global
│   ├── components/          # Componentes React
│   │   ├── admin/           # Componentes admin
│   │   ├── common/          # Componentes comuns
│   │   └── home/            # Componentes da home
│   ├── hooks/               # React Hooks customizados
│   ├── lib/                 # Bibliotecas e configurações
│   ├── services/            # Serviços de integração
│   ├── types/               # Definições TypeScript
│   └── utils/               # Funções utilitárias
├── jest.config.mjs          # Configuração Jest
└── next.config.ts           # Configuração Next.js
```

## 🔧 Scripts Disponíveis

### Desenvolvimento
```bash
npm run dev          # Servidor de desenvolvimento
npm run build        # Build de produção
npm run start        # Servidor de produção
npm run lint         # Verificar linting
npm run type-check   # Verificar tipos TypeScript
```

### Testes
```bash
npm run test         # Executar testes
npm run test:watch   # Testes em modo watch
npm run test:coverage # Relatório de cobertura
```

## 🏗️ Arquitetura

### Padrões Implementados
- **Componentes Funcionais**: React Hooks e componentes funcionais
- **Code Splitting**: Divisão automática de código por rotas
- **Lazy Loading**: Carregamento sob demanda de componentes pesados
- **Performance First**: Otimizações de bundle e runtime
- **SEO Friendly**: SSR e meta tags dinâmicas

### Fluxo de Dados
```
User Interface → React Components → Hooks → Services → Supabase
                      ↓
                 State Management (React State + Context)
                      ↓
                 Cache Layer (SWR/React Query)
```

### Integração de APIs
O sistema suporta integração com múltiplas APIs de imobiliárias:

```typescript
// Exemplo de integração
interface ApiIntegration {
  name: string;
  baseUrl: string;
  headers: Record<string, string>;
  mappings: FieldMapping;
  sync: {
    interval: number;
    enabled: boolean;
  };
}
```

## � Deploy

### Vercel (Recomendado)
1. Conecte o repositório no [Vercel](https://vercel.com)
2. Configure as variáveis de ambiente
3. Deploy automático a cada push

### Docker
```bash
# Build da imagem
docker build -t imovion .

# Executar container
docker run -p 3000:3000 --env-file .env.local imovion
```

### Variáveis de Produção
```env
# Produção
NEXT_PUBLIC_SITE_URL=https://seudominio.com
NODE_ENV=production

# Banco de Dados
DATABASE_URL=postgresql://...
SUPABASE_SERVICE_ROLE_KEY=...

# Analytics & Monitoring
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=...
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=...
```

## 🧪 Testes

### Estrutura de Testes
```
src/
├── __tests__/          # Testes globais
├── components/
│   └── __tests__/      # Testes de componentes
└── pages/
    └── __tests__/      # Testes de páginas
```

### Executar Testes
```bash
# Todos os testes
npm test

# Testes específicos
npm test -- --testPathPattern=components

# Coverage report
npm run test:coverage
```

## 🤝 Contribuindo

### Setup de Desenvolvimento
```bash
# 1. Fork do repositório
# 2. Clone seu fork
git clone https://github.com/SEU_USUARIO/imovion.git

# 3. Instale dependências
npm install

# 4. Crie uma branch
git checkout -b feature/nova-funcionalidade

# 5. Desenvolva e teste
npm run dev
npm test

# 6. Commit e push
git commit -m "feat: adiciona nova funcionalidade"
git push origin feature/nova-funcionalidade

# 7. Abra um Pull Request
```

### Padrões de Commit
Utilizamos [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: nova funcionalidade
fix: correção de bug
docs: documentação
style: formatação
refactor: refatoração
test: testes
chore: configurações
```

### Code Review Checklist
- [ ] Código segue os padrões ESLint
- [ ] Componentes são tipados com TypeScript
- [ ] Testes unitários incluídos
- [ ] Performance não impactada negativamente
- [ ] SEO e acessibilidade considerados
- [ ] Responsividade testada

## 📊 Performance

### Métricas Atuais
- **Lighthouse Score**: 95+ (Performance, Accessibility, Best Practices, SEO)
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **Time to Interactive**: < 3.5s

### Otimizações Implementadas
- ✅ Lazy loading de imagens e componentes
- ✅ Code splitting por rotas
- ✅ Service Worker para cache
- ✅ Compressão de imagens
- ✅ Bundle size otimizado
- ✅ Critical CSS inline
- ✅ Preconnect para recursos externos

## 🔒 Segurança

### Medidas Implementadas
- **Autenticação JWT** via Supabase
- **Row Level Security** no banco de dados
- **CORS** configurado adequadamente
- **Rate Limiting** em APIs sensíveis
- **Sanitização** de inputs do usuário
- **Headers de segurança** configurados

### Relatórios de Vulnerabilidade
Para reportar vulnerabilidades de segurança, envie um email para: **security@imovion.com**

## 📝 Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 📞 Suporte

### Contato
- **Email**: contato@imovion.com
- **Website**: [https://imovion.vercel.app](https://imovion.vercel.app)
- **GitHub Issues**: [Reportar problema](https://github.com/luancbf/imovion/issues)

### FAQ

**Q: Como adicionar uma nova API de imobiliária?**
A: Acesse o painel admin em `/admin/api-integration` e configure os endpoints e mapeamentos.

**Q: Como customizar o tema?**
A: Edite as variáveis CSS em `src/app/globals.css` ou configure o Tailwind em `tailwind.config.js`.

**Q: O projeto suporta multi-idiomas?**
A: Atualmente suporta apenas português. Internationalization pode ser adicionada via next-intl.

---

<div align="center">
  <p>Desenvolvido com ❤️ por <a href="https://github.com/luancbf">Luan Borges</a></p>
  <p>
    <a href="#-imovion---plataforma-de-imóveis">⬆️ Voltar ao topo</a>
  </p>
</div>
