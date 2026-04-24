import {
  ArrowLeft,
  ArrowRight,
  Bell,
  Building2,
  CircleAlert,
  CircleCheckBig,
  CircleHelp,
  CirclePlus,
  CircleUserRound,
  CreditCard,
  Eye,
  EyeOff,
  Globe,
  Grid2x2,
  Heart,
  History,
  House,
  Info,
  Landmark,
  LayoutDashboard,
  LockKeyhole,
  LogOut,
  Mail,
  MapPin,
  Minus,
  Package2,
  PencilLine,
  Plus,
  ReceiptText,
  Search,
  Settings,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Star,
  StarHalf,
  Trash2,
  TriangleAlert,
  Truck,
  type LucideIcon,
  UserRound,
  Users,
  Wallet,
  WalletCards,
  X,
} from 'lucide-react'
import { Link } from 'react-router-dom'

const iconMap: Record<string, LucideIcon> = {
  account_balance: Landmark,
  account_balance_wallet: Wallet,
  account_circle: CircleUserRound,
  add: Plus,
  add_circle: CirclePlus,
  add_shopping_cart: ShoppingCart,
  architecture: Building2,
  arrow_back: ArrowLeft,
  arrow_forward: ArrowRight,
  category: Grid2x2,
  check_circle: CircleCheckBig,
  close: X,
  credit_card: CreditCard,
  dashboard: LayoutDashboard,
  delete: Trash2,
  edit: PencilLine,
  error: CircleAlert,
  favorite: Heart,
  group: Users,
  help: CircleHelp,
  history: History,
  home: House,
  info: Info,
  inventory_2: Package2,
  local_shipping: Truck,
  location_on: MapPin,
  lock: LockKeyhole,
  logout: LogOut,
  mail: Mail,
  museum: Landmark,
  notifications: Bell,
  payments: WalletCards,
  person: UserRound,
  public: Globe,
  receipt_long: ReceiptText,
  remove: Minus,
  search: Search,
  settings: Settings,
  shopping_bag: ShoppingBag,
  shopping_cart: ShoppingCart,
  star: Star,
  star_half: StarHalf,
  task_alt: CircleCheckBig,
  verified: CircleCheckBig,
  verified_user: ShieldCheck,
  villa: House,
  visibility: Eye,
  visibility_off: EyeOff,
  warning: TriangleAlert,
}

export function MaterialIcon({
  name,
  className = '',
  fill = false,
}: {
  name: string
  className?: string
  fill?: boolean
}) {
  const Icon = iconMap[name] ?? CircleHelp

  return (
    <Icon
      aria-hidden="true"
      className={`inline-block align-middle ${className}`.trim()}
      size="1em"
      strokeWidth={1.85}
      style={fill ? { fill: 'currentColor' } : undefined}
    />
  )
}

export function LoadingScreen({ label }: { label: string }) {
  return (
    <section className="mx-auto max-w-screen-2xl px-6 py-8 md:px-8">
      <div className="rounded-[24px] border border-slate-200 bg-white/85 p-6 shadow-sm backdrop-blur">
        <div className="flex items-center gap-3">
          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-slate-400" />
          <p className="text-sm font-semibold text-slate-600">{label}</p>
        </div>
        <div className="mt-5 space-y-3">
          <div className="h-3 w-1/3 animate-pulse rounded-full bg-slate-200" />
          <div className="h-3 w-full animate-pulse rounded-full bg-slate-100" />
          <div className="h-3 w-2/3 animate-pulse rounded-full bg-slate-100" />
        </div>
      </div>
    </section>
  )
}

export function MessageCard({
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
}: {
  title: string
  description: string
  actionLabel?: string
  actionHref?: string
  onAction?: () => void
}) {
  return (
    <section className="mx-auto max-w-screen-xl px-6 py-16 md:px-8">
      <div className="rounded-[28px] border border-black/5 bg-white p-10 shadow-[0_20px_60px_rgba(42,52,57,0.08)]">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
          Notice
        </p>
        <h1 className="mt-4 font-['Manrope'] text-3xl font-extrabold tracking-tight text-slate-900">
          {title}
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-500">{description}</p>
        {actionLabel ? (
          actionHref ? (
            <Link
              className="mt-8 inline-flex items-center rounded-xl bg-[#545f73] px-6 py-3 font-['Manrope'] text-sm font-bold tracking-tight text-white transition hover:opacity-90"
              to={actionHref}
            >
              {actionLabel}
            </Link>
          ) : (
            <button
              className="mt-8 inline-flex items-center rounded-xl bg-[#545f73] px-6 py-3 font-['Manrope'] text-sm font-bold tracking-tight text-white transition hover:opacity-90"
              type="button"
              onClick={onAction}
            >
              {actionLabel}
            </button>
          )
        ) : null}
      </div>
    </section>
  )
}

export function StatusPill({
  children,
  tone = 'neutral',
}: {
  children: string
  tone?: 'neutral' | 'success' | 'warning' | 'danger' | 'brand'
}) {
  const toneClass =
    tone === 'success'
      ? 'bg-emerald-100 text-emerald-700'
      : tone === 'warning'
        ? 'bg-amber-100 text-amber-700'
        : tone === 'danger'
          ? 'bg-rose-100 text-rose-700'
          : tone === 'brand'
            ? 'bg-[#d8e3fb] text-[#475266]'
            : 'bg-slate-100 text-slate-500'

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] ${toneClass}`}
    >
      {children}
    </span>
  )
}
