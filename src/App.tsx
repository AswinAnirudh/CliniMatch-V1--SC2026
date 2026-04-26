/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ClinicDashboard from './pages/ClinicDashboard';
import VolunteerRegistration from './pages/VolunteerRegistration';
import { useEffect } from 'react';
import { testFirebaseConnection } from './lib/firebase';

export default function App() {
  useEffect(() => {
    testFirebaseConnection();
  }, []);

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<ClinicDashboard />} />
          <Route path="/register" element={<VolunteerRegistration />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}
