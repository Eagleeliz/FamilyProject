import { Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth.store';

import PublicLayout from '@/components/layout/PublicLayout';
import UserLayout from '@/components/dashboard/user/UserLayout';
import AdminLayout from '@/components/dashboard/admin/AdminLayout';

import Landing from '@/pages/public/Landing';
import Search from '@/pages/public/Search';
import About from '@/pages/public/About';
import Contact from '@/pages/public/Contact';
import FamilyPreview from '@/pages/public/FamilyPreview';

import Login from '@/pages/auth/Login';
import Register from '@/pages/auth/Register';

import MyFamilies from '@/pages/dashboard/user/MyFamilies';
import FamilyTree from '@/pages/dashboard/user/FamilyTree';

import MyProfile from '@/pages/dashboard/user/MyProfile';
import Relatives from '@/pages/dashboard/user/Relatives';

import Overview from '@/pages/dashboard/admin/Overview';
import AllUsers from '@/pages/dashboard/admin/AllUsers';
import AllFamilies from '@/pages/dashboard/admin/AllFamilies';
import Moderation from '@/pages/dashboard/admin/Moderation';

import ProtectedRoute from '@/components/common/ProtectedRoute';
import AdminRoute from '@/components/common/AdminRoute';

function App() {
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const isLoading = useAuthStore((state) => state.isLoading);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-primary">Loading...</div>
      </div>
    );
  }

  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Landing />} />
        <Route path="/search" element={<Search />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/families/:id/preview" element={<FamilyPreview />} />
      </Route>

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<UserLayout />}>
          <Route path="/dashboard" element={<MyFamilies />} />
          <Route path="/dashboard/family/:id" element={<FamilyTree />} />
          <Route path="/dashboard/search" element={<Search />} />

          <Route path="/dashboard/person/:id/relatives" element={<Relatives />} />
          <Route path="/dashboard/profile" element={<MyProfile />} />
        </Route>
      </Route>

      <Route element={<AdminRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<Overview />} />
          <Route path="/admin/users" element={<AllUsers />} />
          <Route path="/admin/families" element={<AllFamilies />} />
          <Route path="/admin/moderation" element={<Moderation />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
