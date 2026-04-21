import {
  HandshakeIcon,
  LandmarkIcon,
  HomeIcon,
  PackageXIcon,
  Building2Icon,
  TagsIcon,
  UsersIcon,
  UserCogIcon,
  BadgeCheckIcon,
  BuildingIcon,
  ScaleIcon,
  GlobeIcon,
  HelpCircle,
  AudioWaveform,
  Command,
  GalleryVerticalEnd,
  FileTextIcon,
  DollarSign,
  Network,
  ShoppingCart,
  Settings,
  PieChart,
  ShieldCheck,
  WrenchIcon,
  Pill,
  AlertCircle
} from 'lucide-react'

import { ROLES } from '../../services/permissions'
import { useLanguage } from '../../i18n/LanguageContext'

// Map icon name strings (from backend) to actual Lucide icon components
const ICON_MAP = {
  Scale: ScaleIcon,
  Landmark: LandmarkIcon,
  Home: HomeIcon,
  Building: BuildingIcon,
  Building2: Building2Icon,
  Handshake: HandshakeIcon,
  BadgeCheck: BadgeCheckIcon,
  PackageX: PackageXIcon,
  DollarSign: DollarSign,
  ShoppingCart: ShoppingCart,
  Users: UsersIcon,
  Settings: Settings,
  Network: Network,
  PieChart: PieChart,
  ShieldCheck: ShieldCheck,
  Wrench: WrenchIcon,
  Pill: Pill,
  AlertCircle: AlertCircle,
  FileText: FileTextIcon,
}

/**
 * Resolve an icon name string to a Lucide React component.
 * Falls back to FileTextIcon if not found.
 */
export const resolveIcon = (iconName) => {
  if (!iconName) return FileTextIcon
  return ICON_MAP[iconName] || FileTextIcon
}

export const useSidebarData = () => {
  const { t } = useLanguage()

  return {
    user: {
      name: 'satnaing',
      email: 'satnaingdev@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff'
    },

    teams: [
      { name: t('teams.shadcnAdmin'), logo: Command, plan: t('plans.vite') },
      {
        name: t('teams.acmeInc'),
        logo: GalleryVerticalEnd,
        plan: t('plans.enterprise')
      },
      {
        name: t('teams.acmeCorp'),
        logo: AudioWaveform,
        plan: t('plans.startup')
      }
    ],

    standaloneItems: [
      {
        title: t('sidebar.helpCenter'),
        url: '/help-center',
        icon: HelpCircle,
        roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.AGENT, ROLES.VIEWER]
      },
      {
        title: t('sidebar.signIn'),
        url: '/clerk/sign-in',
        roles: [ROLES.VIEWER]
      },
      {
        title: t('sidebar.signUp'),
        url: '/clerk/sign-up',
        roles: [ROLES.VIEWER]
      },
      {
        title: t('sidebar.userManagement'),
        url: '/clerk/user-management',
        roles: [ROLES.ADMIN]
      }
    ],

    navGroups: [
      {
        title: t('sidebar.main'),
        roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.AGENT],
        items: [
          {
            title: t('sidebar.locations'),
            icon: GlobeIcon,
            roles: [ROLES.ADMIN, ROLES.MANAGER],
            items: [
              {
                title: t('sidebar.countryManagement'),
                url: '/dashboard/locations/countries',
                icon: GlobeIcon,
                roles: [ROLES.ADMIN]
              },
              {
                title: t('sidebar.locationEntities'),
                url: '/dashboard/locations/entities',
                icon: Building2Icon,
                roles: [ROLES.ADMIN, ROLES.MANAGER]
              }
            ]
          },

          {
            title: t('sidebar.accounts'),
            icon: UserCogIcon,
            roles: [ROLES.ADMIN],
            items: [
              {
                title: t('sidebar.accountCategories'),
                url: '/dashboard/AccountCategories',
                icon: TagsIcon,
                roles: [ROLES.ADMIN]
              },
              {
                title: t('sidebar.accountsList'),
                url: '/dashboard/Account',
                icon: UsersIcon,
                roles: [ROLES.ADMIN]
              }
            ]
          },

          {
            title: t('sidebar.documents'),
            icon: FileTextIcon,
            roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.USER],
            permissionGroup: 'documents',
            items: [] // Populated dynamically from user permissions (backend)
          }
        ]
      }
    ]
  }
}
