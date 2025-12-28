import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import DashboardLayout from './components/dashboardComponents/DashboardLayout'
import RolesComponent from './components/user/RolesComponent'
import AccountComponent from './components/user/AccountComponent'
import CountryComponent from './components/location/CountryComponent'
import ModulesComponent from './components/location/ModulesComponent'
import SectionsComponent from './components/location/SectionsComponent'
import EntityComponent from './components/location/EntityComponent'
import ProtectedRoutes from './components/dashboardComponents/ProtectedRoute'
import LoginPage from './components/LoginPage'

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
  CargoDamageComponent
} from './components/document'

// Pages
export function Users () {
  return <h2>Users Page</h2>
}

export default function App () {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/login' element={<LoginPage />} />
        <Route
          path='/'
          element={<Navigate to='/dashboard/docstatus' replace />}
        />

        <Route
          path='/dashboard/*'
          element={
            <ProtectedRoutes>
              <DashboardLayout />
            </ProtectedRoutes>
          }
        >
          <Route path='locations'>
            <Route path='countries' element={<CountryComponent />} />
            <Route path='entities' element={<EntityComponent />} />
            <Route path='modules' element={<ModulesComponent />} />
            <Route path='sections' element={<SectionsComponent />} />
          </Route>
          {/* Default redirect */}
          <Route index element={<Navigate to='/docstatus' replace />} />

          {/* Dashboard / Main */}
          <Route path='docstatus' element={<DocStatusComponent />} />
          <Route path='users' element={<Users />} />

          {/* Documents */}
          <Route path='docsCategories' element={<DocStatusComponent />} />
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
          <Route path='estate' element={<EstateComponent />} />
          <Route path='certLicenses' element={<CertLicensesComponent />} />
          <Route path='cargoDamage' element={<CargoDamageComponent />} />

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
