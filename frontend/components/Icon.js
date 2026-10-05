'use client';
import {
  // Navigation & UI
  Home, Search, MessageCircle, Bell, User, Menu, X, ChevronRight, ArrowRight,
  LogOut, Settings, Plus, Filter, Sliders,
  
  // Actions
  Check, CheckCircle, XCircle, AlertCircle, Clock, Calendar, CalendarCheck,
  CreditCard, Wallet, Send, Trash2, Edit, Eye, EyeOff, Copy, Download, Upload,
  
  // Utilisateurs
  Baby, Users, Heart, Star, Award, Shield, ShieldCheck, BadgeCheck,
  
  // Statuts
  Loader2, Info, ThumbsUp, ThumbsDown, TrendingUp, TrendingDown,
  
  // Paiement
  Smartphone, DollarSign, Receipt, Banknote,
  
  // Lieux
  MapPin, Building, Phone, Mail,
  
  // Divers
  Sparkles, Zap, Lock, Key, PartyPopper, Gift, Crown, Rocket,
} from 'lucide-react';

const ICONS = {
  // Navigation
  home: Home,
  search: Search,
  message: MessageCircle,
  bell: Bell,
  user: User,
  menu: Menu,
  close: X,
  chevronRight: ChevronRight,
  arrowRight: ArrowRight,
  logout: LogOut,
  settings: Settings,
  plus: Plus,
  filter: Filter,
  
  // Actions
  check: Check,
  checkCircle: CheckCircle,
  xCircle: XCircle,
  alert: AlertCircle,
  clock: Clock,
  calendar: Calendar,
  calendarCheck: CalendarCheck,
  creditCard: CreditCard,
  wallet: Wallet,
  send: Send,
  trash: Trash2,
  edit: Edit,
  eye: Eye,
  eyeOff: EyeOff,
  copy: Copy,
  download: Download,
  upload: Upload,
  
  // Utilisateurs
  baby: Baby,
  users: Users,
  heart: Heart,
  star: Star,
  award: Award,
  shield: Shield,
  shieldCheck: ShieldCheck,
  verified: BadgeCheck,
  
  // Statuts
  loader: Loader2,
  info: Info,
  thumbsUp: ThumbsUp,
  thumbsDown: ThumbsDown,
  trendingUp: TrendingUp,
  trendingDown: TrendingDown,
  
  // Paiement
  smartphone: Smartphone,
  dollarSign: DollarSign,
  receipt: Receipt,
  banknote: Banknote,
  
  // Lieux
  mapPin: MapPin,
  building: Building,
  phone: Phone,
  mail: Mail,
  
  // Divers
  sparkles: Sparkles,
  zap: Zap,
  lock: Lock,
  key: Key,
  party: PartyPopper,
  gift: Gift,
  crown: Crown,
  rocket: Rocket,
};

export default function Icon({ name, size = 20, className = '', strokeWidth = 2, ...props }) {
  const IconComponent = ICONS[name];
  
  if (!IconComponent) {
    console.warn(`Icon "${name}" not found`);
    return null;
  }
  
  return (
    <IconComponent
      size={size}
      className={className}
      strokeWidth={strokeWidth}
      {...props}
    />
  );
}

export { ICONS };