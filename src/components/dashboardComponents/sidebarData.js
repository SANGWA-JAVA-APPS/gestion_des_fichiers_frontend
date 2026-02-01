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
import { DollarSign } from 'lucide-react'

import { Network } from 'lucide-react'

import { ShoppingCart } from 'lucide-react'
import { Settings } from 'lucide-react'
import { PieChart } from 'lucide-react'
import { ShieldCheck } from 'lucide-react'
import { ToolCase } from 'lucide-react'
import { Pill } from 'lucide-react'
import { AlertCircle } from 'lucide-react'

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
              // {
              //   title: t('sidebar.moduleManagement'),
              //   url: '/dashboard/locations/modules',
              //   icon: BoxesIcon,
              //   roles: [ROLES.ADMIN, ROLES.MANAGER]
              // },
              // {
              //   title: t('sidebar.sectionManagement'),
              //   url: '/dashboard/locations/sections',
              //   icon: ListTreeIcon,
              //   roles: [ROLES.ADMIN, ROLES.MANAGER]
              // }
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
            items: [
              // {
              //   title: t('sidebar.sectionCategory'),
              //   url: '/dashboard/sectionCategory',
              //   icon: ListIcon,
              //   roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.USER],
              //   permissionCode: 'SECTION_CATEGORY'
              // },
              {
                title: t('sidebar.normeLoi'),
                url: '/dashboard/NormeLoi',
                icon: ScaleIcon,
                roles: [ROLES.ADMIN, ROLES.USER, ROLES.MANAGER],
                permissionCode: 'NORME_LOI'
              },
              {
                title: t('sidebar.commAssetLand'),
                url: '/dashboard/commAssetLand',
                icon: LandmarkIcon,
                roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.USER],
                permissionCode: 'COMM_ASSET_LAND'
              },
              {
                title: t('sidebar.permiConstruction'),
                url: '/dashboard/permiConstruction',
                icon: BuildingIcon,
                roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.USER],
                permissionCode: 'PERMI_CONSTRUCTION'
              },
              {
                title: t('sidebar.accordConcession'),
                url: '/dashboard/accordConcession',
                icon: HandshakeIcon,
                roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.USER],
                permissionCode: 'ACCORD_CONCESSION'
              },
              {
                title: t('sidebar.estate'),
                url: '/dashboard/estate',
                icon: HomeIcon,
                roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.USER],
                permissionCode: 'ESTATE'
              },
              {
                title: t('sidebar.certLicenses'),
                url: '/dashboard/certLicenses',
                icon: BadgeCheckIcon,
                roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.USER],
                permissionCode: 'CERT_LICENSES'
              },
              {
                title: t('sidebar.cargoDamage'),
                url: '/dashboard/cargoDamage',
                icon: PackageXIcon,
                roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.USER],
                permissionCode: 'CARGO_DAMAGE'
              },

              {
                title: t('document.categoryValues.financial'),
                url: '/dashboard/common-doc-details/ORG_FIN',
                icon: DollarSign,
                roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.USER],
                permissionCode: 'DOC_FINANCIAL'
              },
              {
                title: t('document.categoryValues.procurement'),
                url: '/dashboard/common-doc-details/ORG_PROC',
                icon: ShoppingCart,
                roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.USER],
                permissionCode: 'DOC_PROCUREMENT'
              },
              {
                title: t('document.categoryValues.hr'),
                url: '/dashboard/common-doc-details/ORG_HR',
                icon: UsersIcon,
                roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.USER],
                permissionCode: 'DOC_HR'
              },
              {
                title: t('document.categoryValues.technical'),
                url: '/dashboard/common-doc-details/ORG_TECH',
                icon: Settings,
                roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.USER],
                permissionCode: 'DOC_TECHNICAL'
              },
              {
                title: t('document.categoryValues.it'),
                url: '/dashboard/common-doc-details/ORG_IT',
                icon: Network,
                roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.USER],
                permissionCode: 'DOC_IT'
              },
              {
                title: t('document.categoryValues.realEstate'),
                url: '/dashboard/common-doc-details/ORG_RE',
                icon: BuildingIcon,
                roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.USER],
                permissionCode: 'DOC_REAL_ESTATE'
              },
              {
                title: t('document.categoryValues.shareholders'),
                url: '/dashboard/common-doc-details/ORG_SH',
                icon: PieChart,
                roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.USER],
                permissionCode: 'DOC_SHAREHOLDERS'
              },
              {
                title: t('document.categoryValues.legal'),
                url: '/dashboard/common-doc-details/ORG_LEGAL',
                icon: ScaleIcon,
                roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.USER],
                permissionCode: 'DOC_LEGAL'
              },
              {
                title: t('document.categoryValues.quality'),
                url: '/dashboard/common-doc-details/ORG_QUAL',
                icon: BadgeCheckIcon,
                roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.USER],
                permissionCode: 'DOC_QUALITY'
              },
              {
                title: t('document.categoryValues.hse'),
                url: '/dashboard/common-doc-details/ORG_HSE',
                icon: ShieldCheck,
                roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.USER],
                permissionCode: 'DOC_HSE'
              },
              {
                title: t('document.categoryValues.equipment'),
                url: '/dashboard/common-doc-details/ORG_EQUIP',
                icon: ToolCase,
                roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.USER],
                permissionCode: 'DOC_EQUIPMENT'
              },
              {
                title: t('document.categoryValues.drugAlcohol'),
                url: '/dashboard/common-doc-details/ORG_DA',
                icon: Pill,
                roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.USER],
                permissionCode: 'DOC_DRUG_ALCOHOL'
              },
              {
                title: t('document.categoryValues.incident'),
                url: '/dashboard/common-doc-details/ORG_INC',
                icon: AlertCircle,
                roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.USER],
                permissionCode: 'DOC_INCIDENT'
              },
              {
                title: t('document.categoryValues.sop'),
                url: '/dashboard/common-doc-details/ORG_SOP',
                icon: FileTextIcon,
                roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.USER],
                permissionCode: 'DOC_SOP'
              },

              {
                title: 'Suppliers Contracts',
                url: '/dashboard/common_third_party/ORG_SUPP',
                icon: HandshakeIcon,
                roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.USER],
                permissionCode: 'DOC_SUPPLIERS'
              },
              {
                title: 'Rental Assets Contracts',
                url: '/dashboard/common-doc-details/ORG_RENT_CON',
                icon: PackageXIcon,
                roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.USER],
                permissionCode: 'DOC_RENTAL_CONTRACTS'
              },
              {
                title: 'Client Commercial',
                url: '/dashboard/common_third_party/ORG_CLIENT',
                icon: LandmarkIcon,
                roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.USER],
                permissionCode: 'DOC_CLIENT_COMMERCIAL'
              },
              {
                title: 'Rental Assets',
                url: '/dashboard/common_third_party/ORG_RENT_ASSET',
                icon: HomeIcon,
                roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.USER],
                permissionCode: 'DOC_RENTAL_ASSETS'
              }
            ]
          },
          {
            title: 'Settings',
            icon: Settings,
            roles: [ROLES.ADMIN],
            items: [
              {
                title: t('sidebar.docstatus'),
                url: '/dashboard/docstatus',
                icon: FileTextIcon,
                roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.USER],
                permissionCode: 'DOC_STATUS'
              }
            ]
          }
        ]
      }
    ]
  }
}
