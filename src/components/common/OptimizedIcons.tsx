// Componente otimizado para ícones mais usados no admin
// Reduz bundle size ao importar apenas ícones específicos

import dynamic from 'next/dynamic';

// Icons mais usados no admin - carregamento otimizado
export const AdminIcons = {
  Home: dynamic(() => import('react-icons/fi').then(mod => ({ default: mod.FiHome })), {
    loading: () => <div className="w-5 h-5 bg-gray-300 rounded animate-pulse" />
  }),
  Plus: dynamic(() => import('react-icons/fi').then(mod => ({ default: mod.FiPlus })), {
    loading: () => <div className="w-5 h-5 bg-gray-300 rounded animate-pulse" />
  }),
  Users: dynamic(() => import('react-icons/fi').then(mod => ({ default: mod.FiUsers })), {
    loading: () => <div className="w-5 h-5 bg-gray-300 rounded animate-pulse" />
  }),
  Briefcase: dynamic(() => import('react-icons/fi').then(mod => ({ default: mod.FiBriefcase })), {
    loading: () => <div className="w-5 h-5 bg-gray-300 rounded animate-pulse" />
  }),
  Link: dynamic(() => import('react-icons/fi').then(mod => ({ default: mod.FiLink })), {
    loading: () => <div className="w-5 h-5 bg-gray-300 rounded animate-pulse" />
  }),
  LogOut: dynamic(() => import('react-icons/fi').then(mod => ({ default: mod.FiLogOut })), {
    loading: () => <div className="w-5 h-5 bg-gray-300 rounded animate-pulse" />
  }),
  Settings: dynamic(() => import('react-icons/fi').then(mod => ({ default: mod.FiSettings })), {
    loading: () => <div className="w-5 h-5 bg-gray-300 rounded animate-pulse" />
  }),
  Save: dynamic(() => import('react-icons/fi').then(mod => ({ default: mod.FiSave })), {
    loading: () => <div className="w-5 h-5 bg-gray-300 rounded animate-pulse" />
  }),
  Edit: dynamic(() => import('react-icons/fi').then(mod => ({ default: mod.FiEdit })), {
    loading: () => <div className="w-5 h-5 bg-gray-300 rounded animate-pulse" />
  }),
  Trash: dynamic(() => import('react-icons/fi').then(mod => ({ default: mod.FiTrash2 })), {
    loading: () => <div className="w-5 h-5 bg-gray-300 rounded animate-pulse" />
  }),
  X: dynamic(() => import('react-icons/fi').then(mod => ({ default: mod.FiX })), {
    loading: () => <div className="w-5 h-5 bg-gray-300 rounded animate-pulse" />
  }),
  Menu: dynamic(() => import('react-icons/fi').then(mod => ({ default: mod.FiMenu })), {
    loading: () => <div className="w-5 h-5 bg-gray-300 rounded animate-pulse" />
  }),
};

// Icons para formulários
export const FormIcons = {
  Eye: dynamic(() => import('react-icons/fi').then(mod => ({ default: mod.FiEye })), {
    loading: () => <div className="w-5 h-5 bg-gray-300 rounded animate-pulse" />
  }),
  EyeOff: dynamic(() => import('react-icons/fi').then(mod => ({ default: mod.FiEyeOff })), {
    loading: () => <div className="w-5 h-5 bg-gray-300 rounded animate-pulse" />
  }),
  User: dynamic(() => import('react-icons/fi').then(mod => ({ default: mod.FiUser })), {
    loading: () => <div className="w-5 h-5 bg-gray-300 rounded animate-pulse" />
  }),
  Mail: dynamic(() => import('react-icons/fi').then(mod => ({ default: mod.FiMail })), {
    loading: () => <div className="w-5 h-5 bg-gray-300 rounded animate-pulse" />
  }),
  Phone: dynamic(() => import('react-icons/fi').then(mod => ({ default: mod.FiPhone })), {
    loading: () => <div className="w-5 h-5 bg-gray-300 rounded animate-pulse" />
  }),
};