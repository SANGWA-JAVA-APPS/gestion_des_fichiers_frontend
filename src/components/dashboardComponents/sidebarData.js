import {
  LayersIcon,
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
        // {
        //   title: 'Dashboard',
        //   icon: LayoutDashboard,
        //   items: [
        //     {
        //       title: 'Docstatus',
        //       url: '/dashboard/docstatus',
        //       icon: FileTextIcon
        //     },
        //     { title: 'Users', url: '#', icon: Users },
        //     { title: 'Summary', url: '#', icon: SunMedium },
        //     { title: 'Apps', url: '#', icon: Package },
        //     { title: 'Chats', url: '#', badge: '3', icon: MessagesSquare }
        //   ]
        // },

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
          title: 'Documents',
          icon: FileTextIcon,
          items: [
            {
              title: 'Docstatus',
              url: '/dashboard/docstatus',
              icon: FileTextIcon
            },
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
        }
      ]
    }
  ]
}
