import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate
} from 'react-router-dom'
import DashboardLayout from './components/dashboardComponents/DashboardLayout'
import DashboardHome from './components/dashboardComponents/Dashboard'
import StoragePage from './components/dashboardComponents/StoragePage'
import RolesComponent from './components/user/RolesComponent'
import AccountComponent from './components/user/AccountComponent'
import CountryComponent from './components/location/CountryComponent'
import ModulesComponent from './components/location/ModulesComponent'
import SectionsComponent from './components/location/SectionsComponent'
import EntityComponent from './components/location/EntityComponent'
import ProtectedRoutes from './components/dashboardComponents/ProtectedRoute'
import LoginPage from './components/LoginPage'
import AdminDashboard from './components/AdminDashboard'
import { clearAuthData } from './services/authUtils'

// Document components
import {
  DocStatusComponent,
  SectionCategoryComponent,
  NormeLoiComponent,
  CommAssetLandComponent,
  PermiConstructionComponent,
  AccordConcessionComponent,
  EstateComponent,
  CertLicensesComponent,
  CargoDamageComponent,
  LegacyComponent,
  AssEquipmentComponent,
  InductionComponent,
  CompliancePoliciesComponent,
  ArchivedDocuments,
  ExpiringDocuments
} from './components/document'
import CommonDocDetailsComponent from './components/document/CommonDocDetailsComponent'
import CommThirdPartyComponent from './components/document/CommThirdPartyComponent'
import LitigationFollowupComponent from './components/document/LitigationFollowupComponent'
import InsuranceComponent from './components/document/InsuranceComponent'
import ThirdPartyClaimsComponent from './components/document/ThirdPartyClaimsComponent'
import TestRedirection from './components/TestRedirection'
import UsersPage from './components/user/UsersPage'
import { ReportingDashboard } from './components/reporting'

// Pages
export function Users () {
  return <UsersPage />
}

const AdminDashboardRoute = () => {
  const navigate = useNavigate()
  const handleLogout = () => {
    clearAuthData()
    navigate('/login', { replace: true })
  }

  return <AdminDashboard onLogout={handleLogout} />
  // return <TestRedirection onLogout={handleLogout} />
}

export default function App () {
  return (
    <BrowserRouter basename="/ingenzi">
      <Routes>
        <Route path='/login' element={<LoginPage />} />
        <Route path='/' element={<Navigate to='/dashboard' replace />} />

        <Route  path='/dashboard'  element={
            <ProtectedRoutes>
              <DashboardLayout />
              {/* <AdminDashboardRoute/> */}
            </ProtectedRoutes>
          }>
          {/* <Route
          path='/newdashboard/*'
          element={
            <ProtectedRoutes>
              <DashboardLayout />
            </ProtectedRoutes>
          }
        > */}
          <Route path='locations'>
            <Route path='countries' element={<CountryComponent />}  />
            <Route path='entities'  element={<EntityComponent />}   />
            <Route path='modules'   element={<ModulesComponent />}  />
            <Route path='sections'  element={<SectionsComponent />} />
          </Route>
          {/* Default dashboard */}
          <Route index element={<DashboardHome />} />

          {/* Dashboard / Main */}
          <Route path='docstatus' element={<DocStatusComponent />} />
          <Route path='users' element={<Users />} />
          <Route path='archive' element={<ArchivedDocuments />} />
          <Route path='expiry' element={<ExpiringDocuments />} />
          <Route path='reporting' element={<ReportingDashboard />} />
          <Route path='storage' element={<StoragePage />} />

          {/* Documents */}
          <Route path='docsCategories' element={<SectionCategoryComponent />} />
          <Route path='NormeLoi' element={<NormeLoiComponent />} />
          <Route
            path='sectionCategory'
            element={<SectionCategoryComponent />}
          />
          <Route path='commAssetLand' element={<CommAssetLandComponent />} />
          <Route
            path='permiConstruction'
            element={<PermiConstructionComponent />}
          />
          <Route
            path='accordConcession'
            element={<AccordConcessionComponent />}
          />

          <Route
            path='common-doc-details/:sectionCode'
            element={<CommonDocDetailsComponent />}
          />
          <Route
            path='common_third_party/:sectionCode'
            element={<CommThirdPartyComponent />}
          />

          <Route path='estate' element={<EstateComponent />} />
          <Route path='legacy' element={<LegacyComponent />} />
          <Route path='ass-equipment' element={<AssEquipmentComponent />} />
          <Route path='induction' element={<InductionComponent />} />
          <Route path='compliance-policies' element={<CompliancePoliciesComponent />} />
          <Route path='certLicenses' element={<CertLicensesComponent />} />
          <Route path='cargoDamage' element={<CargoDamageComponent />} />

          {/* Risks */}
          <Route path='litigation-followup' element={<LitigationFollowupComponent />} />
          <Route path='insurance' element={<InsuranceComponent />} />
          <Route path='third-party-claims' element={<ThirdPartyClaimsComponent />} />

          {/* Accounts */}
          <Route path='AccountCategories' element={<RolesComponent />} />
          <Route path='Account' element={<AccountComponent />} />

          {/* Location */}

          <Route path='countries' element={<CountryComponent />} />
          <Route path='entities' element={<EntityComponent />} />
          <Route path='modules' element={<ModulesComponent />} />
          <Route path='sections' element={<SectionsComponent />} />

          {/* Other dashboard pages */}
          <Route path='tasks' element={<div>Summary Page</div>} />
          <Route path='apps' element={<div>Apps Page</div>} />
          <Route path='chats' element={<div>Chats Page</div>} />

          {/* Settings */}
          <Route path='settings' element={<div>Profile Settings</div>} />
          <Route
            path='settings/account'
            element={<div>Account Settings</div>}
          />
          <Route
            path='settings/appearance'
            element={<div>Appearance Settings</div>}
          />
          <Route
            path='settings/notifications'
            element={<div>Notification Settings</div>}
          />
          <Route
            path='settings/display'
            element={<div>Display Settings</div>}
          />

          {/* Help */}
          <Route path='help-center' element={<div>Help Center</div>} />

          {/* Clerk / Secured */}
          <Route path='clerk/sign-in' element={<div>Sign In</div>} />
          <Route path='clerk/sign-up' element={<div>Sign Up</div>} />
          <Route
            path='clerk/user-management'
            element={<div>User Management</div>}
          />

          {/* Fallback */}
          <Route path='*' element={<div>404 - Page Not Found</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
