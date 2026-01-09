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

export const sidebarData = {
  user: {
    name: 'satnaing',
    email: 'satnaingdev@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff'
  },

  teams: [
    { name: 'Shadcn Admin', logo: Command, plan: 'Vite + ShadcnUI' },
    { name: 'Acme Inc', logo: GalleryVerticalEnd, plan: 'Enterprise' },
    { name: 'Acme Corp.', logo: AudioWaveform, plan: 'Startup' }
  ],

  standaloneItems: [
    {
      title: 'Help Center',
      url: '/help-center',
      icon: HelpCircle,
      roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.AGENT, ROLES.VIEWER]
    },
    {
      title: 'Sign In',
      url: '/clerk/sign-in',
      roles: [ROLES.VIEWER]
    },
    {
      title: 'Sign Up',
      url: '/clerk/sign-up',
      roles: [ROLES.VIEWER]
    },
    {
      title: 'User Management',
      url: '/clerk/user-management',
      roles: [ROLES.ADMIN]
    }
  ],

  navGroups: [
    {
      title: 'Main',
      roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.AGENT],
      items: [
        {
          title: 'Accounts',
          icon: UserCogIcon,
          roles: [ROLES.ADMIN],
          items: [
            {
              title: 'Account Categories',
              url: '/dashboard/AccountCategories',
              icon: TagsIcon,
              roles: [ROLES.ADMIN]
            },
            {
              title: 'Accounts',
              url: '/dashboard/Account',
              icon: UsersIcon,
              roles: [ROLES.ADMIN]
            }
          ]
        },

        {
          title: 'Locations',
          icon: GlobeIcon,
          roles: [ROLES.ADMIN, ROLES.MANAGER],
          items: [
            {
              title: 'Country Management',
              url: '/dashboard/locations/countries',
              icon: GlobeIcon,
              roles: [ROLES.ADMIN]
            },
            {
              title: 'Location Entities',
              url: '/dashboard/locations/entities',
              icon: Building2Icon,
              roles: [ROLES.ADMIN, ROLES.MANAGER]
            },
            {
              title: 'Module Management',
              url: '/dashboard/locations/modules',
              icon: BoxesIcon,
              roles: [ROLES.ADMIN, ROLES.MANAGER]
            },
            {
              title: 'Section Management',
              url: '/dashboard/locations/sections',
              icon: ListTreeIcon,
              roles: [ROLES.ADMIN, ROLES.MANAGER]
            }
          ]
        },

        {
          title: 'Documents',
          icon: FileTextIcon,
          roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.USER],
          items: [
            {
              title: 'Docstatus',
              url: '/dashboard/docstatus',
              icon: FileTextIcon,
              roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.USER]
            },
            {
              title: 'Section Category',
              url: '/dashboard/sectionCategory',
              icon: ListIcon,
              roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.USER]
            },
            {
              title: 'NormeLoi',
              url: '/dashboard/NormeLoi',
              icon: ScaleIcon,
              roles: [ROLES.ADMIN, ROLES.USER, ROLES.MANAGER]
            },
            {
              title: 'Comm Asset Land',
              url: '/dashboard/commAssetLand',
              icon: LandmarkIcon,
              roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.USER]
            },
            {
              title: 'Permi Construction',
              url: '/dashboard/permiConstruction',
              icon: BuildingIcon,
              roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.USER]
            },
            {
              title: 'Accord Concession',
              url: '/dashboard/accordConcession',
              icon: HandshakeIcon,
              roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.USER]
            },
            {
              title: 'Estate',
              url: '/dashboard/estate',
              icon: HomeIcon,
              roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.USER]
            },
            {
              title: 'Cert Licenses',
              url: '/dashboard/certLicenses',
              icon: BadgeCheckIcon,
              roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.USER]
            },
            {
              title: 'Cargo Damage',
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
