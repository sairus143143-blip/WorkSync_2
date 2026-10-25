import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { PublicOnlyRoute } from './components/auth/PublicOnlyRoute';
import { RoleRoute } from './components/auth/RoleRoute';
import { AppLayout } from './components/layout/AppLayout';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { ActivityProvider } from './contexts/ActivityContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { ToastProvider } from './contexts/ToastContext';
import { EmployeesProvider } from './contexts/EmployeesContext';
import { OrganizationProvider } from './contexts/OrganizationContext';
import { UsersProvider } from './contexts/UsersContext';
import { AttendanceProvider } from './contexts/AttendanceContext';
import { ProjectsProvider } from './contexts/ProjectsContext';
import { TasksProvider } from './contexts/TasksContext';
import { ProgressReportsProvider } from './contexts/ProgressReportsContext';
import type { AccessDeniedProps } from './pages/AccessDenied';
import { Attendance } from './pages/Attendance';
import { ActivityLogs } from './pages/ActivityLogs';
import { Dashboard } from './pages/Dashboard';
import { DataManagement } from './pages/DataManagement';
import { Employees } from './pages/Employees';
import { ForgotPassword } from './pages/ForgotPassword';
import { Login } from './pages/Login';
import { SignUp } from './pages/SignUp';
import { NotFound } from './pages/NotFound';
import { Notifications } from './pages/Notifications';
import { Positions } from './pages/Positions';
import { Productivity } from './pages/Productivity';
import { Profile } from './pages/Profile';
import { ProjectDetails } from './pages/ProjectDetails';
import { Projects } from './pages/Projects';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';
import { Tasks } from './pages/Tasks';
import { EmployeeTasks } from './pages/EmployeeTasks';
import { MyReports } from './pages/MyReports';
import { WeeklyReports } from './pages/WeeklyReports';
import { Users } from './pages/Users';

interface AppProps {
  /** Prototype control: management pages (Employees, Positions, Attendance, Projects) fail their first load so error states can be reviewed. */
  simulateLoadErrors?: boolean;
}

// The Employee Portal doesn't exist yet, so its button returns to the dashboard.
const projectsDenied: AccessDeniedProps = {
  title: 'Access Restricted',
  description: 'You do not have permission to access Project Management.',
  actionLabel: 'Go to Employee Portal',
  actionTo: '/dashboard'
};

export function App({ simulateLoadErrors = false }: AppProps) {
  return (
    <MotionConfig reducedMotion="user">
      <BrowserRouter>
        <UsersProvider>
          <OrganizationProvider>
            <EmployeesProvider>
              <AuthProvider>
                <SettingsProvider>
                  <NotificationProvider>
                    <ActivityProvider>
                      <AttendanceProvider>
                        <ProjectsProvider>
                          <TasksProvider>
                           <ProgressReportsProvider>
            <ToastProvider>
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
                <Route path="/sign-up" element={<PublicOnlyRoute><SignUp /></PublicOnlyRoute>} />
                <Route path="/forgot-password" element={<PublicOnlyRoute><ForgotPassword /></PublicOnlyRoute>} />

                <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/users" element={<RoleRoute allow={['admin']}><Users /></RoleRoute>} />
                  <Route
                                path="/employees"
                                element={<RoleRoute allow={['admin']}><Employees simulateLoadError={simulateLoadErrors} /></RoleRoute>} />
                              
                  <Route
                                path="/positions"
                                element={<RoleRoute allow={['admin']}><Positions simulateLoadError={simulateLoadErrors} /></RoleRoute>} />
                              
                  <Route
                                path="/attendance"
                                element={<RoleRoute allow={['admin']}><Attendance simulateLoadError={simulateLoadErrors} /></RoleRoute>} />
                              
                  <Route
                                path="/projects"
                                element={<RoleRoute allow={['admin']} denied={projectsDenied}><Projects simulateLoadError={simulateLoadErrors} /></RoleRoute>} />
                              
                  <Route
                                path="/projects/:projectId"
                                element={<RoleRoute allow={['admin']} denied={projectsDenied}><ProjectDetails simulateLoadError={simulateLoadErrors} /></RoleRoute>} />
                              
                  <Route path="/tasks" element={<RoleRoute allow={['admin']}><Tasks /></RoleRoute>} />
                                   <Route path="/my-tasks" element={<RoleRoute allow={['employee']}><EmployeeTasks /></RoleRoute>} />
                                   <Route path="/my-reports" element={<RoleRoute allow={['employee']}><MyReports /></RoleRoute>} />
                                   <Route path="/weekly-reports" element={<RoleRoute allow={['admin']}><WeeklyReports /></RoleRoute>} />
                  <Route path="/productivity" element={<RoleRoute allow={['admin']}><Productivity /></RoleRoute>} />
                  <Route path="/reports" element={<RoleRoute allow={['admin']}><Reports /></RoleRoute>} />
                  <Route path="/notifications" element={<Notifications />} />
                  <Route path="/activity-logs" element={<RoleRoute allow={['admin']}><ActivityLogs /></RoleRoute>} />
                  <Route path="/settings" element={<RoleRoute allow={['admin']}><Settings /></RoleRoute>} />
                  <Route path="/data-management" element={<RoleRoute allow={['admin']}><DataManagement /></RoleRoute>} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="*" element={<NotFound />} />
                </Route>
              </Routes>
            </ToastProvider>
                           </ProgressReportsProvider>
                          </TasksProvider>
                        </ProjectsProvider>
                      </AttendanceProvider>
                    </ActivityProvider>
                </NotificationProvider>
                </SettingsProvider>
              </AuthProvider>
            </EmployeesProvider>
          </OrganizationProvider>
        </UsersProvider>
      </BrowserRouter>
    </MotionConfig>);

}
