import {
  HandshakeIcon,
  LandmarkIcon,
  HomeIcon,
  PackageXIcon,
  Building2Icon,
  ListTreeIcon,
  TagsIcon,
  UsersIcon,
  UserCogIcon,
  BoxesIcon,
  BadgeCheckIcon,
  BuildingIcon,
  ScaleIcon,
  ListIcon,
  GlobeIcon,
  HelpCircle,
  AudioWaveform,
  Command,
  GalleryVerticalEnd,
  FileTextIcon
} from 'lucide-react'

import { ROLES } from '../../services/permissions'
import { useLanguage } from '../../i18n/LanguageContext'

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
              },
              {
                title: t('sidebar.moduleManagement'),
                url: '/dashboard/locations/modules',
                icon: BoxesIcon,
                roles: [ROLES.ADMIN, ROLES.MANAGER]
              },
              {
                title: t('sidebar.sectionManagement'),
                url: '/dashboard/locations/sections',
                icon: ListTreeIcon,
                roles: [ROLES.ADMIN, ROLES.MANAGER]
              }
            ]
          },

          {
            title: t('sidebar.documents'),
            icon: FileTextIcon,
            roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.USER],
            items: [
              {
                title: t('sidebar.docstatus'),
                url: '/dashboard/docstatus',
                icon: FileTextIcon,
                roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.USER]
              },
              {
                title: t('sidebar.sectionCategory'),
                url: '/dashboard/sectionCategory',
                icon: ListIcon,
                roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.USER]
              },
              {
                title: t('sidebar.normeLoi'),
                url: '/dashboard/NormeLoi',
                icon: ScaleIcon,
                roles: [ROLES.ADMIN, ROLES.USER, ROLES.MANAGER]
              },
              {
                title: t('sidebar.commAssetLand'),
                url: '/dashboard/commAssetLand',
                icon: LandmarkIcon,
                roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.USER]
              },
              {
                title: t('sidebar.permiConstruction'),
                url: '/dashboard/permiConstruction',
                icon: BuildingIcon,
                roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.USER]
              },
              {
                title: t('sidebar.accordConcession'),
                url: '/dashboard/accordConcession',
                icon: HandshakeIcon,
                roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.USER]
              },
              {
                title: t('sidebar.estate'),
                url: '/dashboard/estate',
                icon: HomeIcon,
                roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.USER]
              },
              {
                title: t('sidebar.certLicenses'),
                url: '/dashboard/certLicenses',
                icon: BadgeCheckIcon,
                roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.USER]
              },
              {
                title: t('sidebar.cargoDamage'),
                url: '/dashboard/cargoDamage',
                icon: PackageXIcon,
                roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.USER]
              }
            ]
          }
        ]
      }
    ]
  }
}
