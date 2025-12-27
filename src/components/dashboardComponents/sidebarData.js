import { LayersIcon } from 'lucide-react'
import { GridIcon } from 'lucide-react'
import { HandshakeIcon } from 'lucide-react'
import { LandmarkIcon } from 'lucide-react'
import { HomeIcon } from 'lucide-react'
import { PackageXIcon } from 'lucide-react'
import { Building2Icon } from 'lucide-react'
import { ListTreeIcon } from 'lucide-react'
import { TagsIcon } from 'lucide-react'
import { UsersIcon } from 'lucide-react'
import { UserCogIcon } from 'lucide-react'
import { BoxesIcon } from 'lucide-react'
import { DatabaseIcon } from 'lucide-react'
import { BadgeCheckIcon } from 'lucide-react'
import { BuildingIcon } from 'lucide-react'
import { ScaleIcon } from 'lucide-react'
import { ListIcon } from 'lucide-react'
import { GlobeIcon } from 'lucide-react'
import { PersonStandingIcon } from 'lucide-react'
import {
  LayoutDashboard,
  Monitor,
  HelpCircle,
  Bell,
  Package,
  Palette,
  Settings,
  Wrench,
  UserCog,
  Users,
  MessagesSquare,
  AudioWaveform,
  Command,
  GalleryVerticalEnd,
  SunMedium,
  Shield,
  FileTextIcon,
  BookOpenIcon,
  GroupIcon,
  HammerIcon
} from 'lucide-react'

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
    { title: 'Help Center', url: '/help-center', icon: HelpCircle },
    { title: 'Sign In', url: '/clerk/sign-in' },
    { title: 'Sign Up', url: '/clerk/sign-up' },
    { title: 'User Management', url: '/clerk/user-management' }
  ],
  navGroups: [
    {
      title: 'Main',
      items: [
        {
          title: 'Dashboard',
          icon: LayoutDashboard,
          items: [
            {
              title: 'Docstatus',
              url: '/dashboard/docstatus',
              icon: FileTextIcon
            },
            { title: 'Users', url: '/dashboard/users', icon: Users },
            { title: 'Summary', url: '/dashboard/tasks', icon: SunMedium },
            { title: 'Apps', url: '/apps', icon: Package },
            { title: 'Chats', url: '/chats', badge: '3', icon: MessagesSquare }
          ]
        },
        {
          title: 'Documents',
          icon: FileTextIcon,
          items: [
            {
              title: 'Docs Categories',
              url: '/dashboard/docsCategories',
              icon: LayersIcon
            },
            {
              title: 'Section Category',
              url: '/dashboard/sectionCategory',
              icon: ListIcon
            },
            {
              title: 'NormeLoi',
              url: '/dashboard/NormeLoi',
              icon: ScaleIcon
            },
            {
              title: 'Comm Asset Land',
              url: '/dashboard/commAssetLand',
              icon: LandmarkIcon
            },
            {
              title: 'Permi Construction',
              url: '/dashboard/permiConstruction',
              icon: BuildingIcon
            },
            {
              title: 'Accord Concession',
              url: '/dashboard/accordConcession',
              icon: HandshakeIcon
            },
            {
              title: 'Estate',
              url: '/dashboard/estate',
              icon: HomeIcon
            },
            {
              title: 'Cert Licenses',
              url: '/dashboard/certLicenses',
              icon: BadgeCheckIcon
            },
            {
              title: 'Cargo Damage',
              url: '/dashboard/cargoDamage',
              icon: PackageXIcon
            }
          ]
        },

        {
          title: 'Locations',
          icon: GlobeIcon,
          items: [
            {
              title: 'Country Management',
              url: '/dashboard/locations/countries',
              icon: GlobeIcon
            },
            {
              title: 'Location Entities',
              url: '/dashboard/locations/entities',
              icon: Building2Icon
            },
            {
              title: 'Module Management',
              url: '/dashboard/locations/modules',
              icon: BoxesIcon
            },
            {
              title: 'Section Management',
              url: '/dashboard/locations/sections',
              icon: ListTreeIcon
            }
          ]
        },
        {
          title: 'Accounts',
          icon: UserCogIcon,
          items: [
            {
              title: 'Account Categories',
              url: '/dashboard/AccountCategories',
              icon: TagsIcon
            },
            {
              title: 'Accounts',
              url: '/dashboard/Account',
              icon: UsersIcon
            }
          ]
        },

        {
          title: 'Secured',
          icon: Shield,
          items: [
            { title: 'Sign In', url: '/clerk/sign-in' },
            { title: 'Sign Up', url: '/clerk/sign-up' },
            { title: 'User Management', url: '/clerk/user-management' }
          ]
        }
      ]
    },

    {
      title: 'Other',
      items: [
        {
          title: 'Settings',
          icon: Settings,
          items: [
            { title: 'Profile', url: '/settings', icon: UserCog },
            { title: 'Account', url: '/settings/account', icon: Wrench },
            { title: 'Appearance', url: '/settings/appearance', icon: Palette },
            {
              title: 'Notifications',
              url: '/settings/notifications',
              icon: Bell
            },
            { title: 'Display', url: '/settings/display', icon: Monitor }
          ]
        },
        { title: 'Help Center', url: '/help-center', icon: BookOpenIcon }
      ]
    }
  ]
}
