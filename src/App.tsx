/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from "react-router-dom";
import BottomNav from "./components/BottomNav";
import Turnover from "./pages/Turnover";
import Buy from "./pages/Buy";
import Profile from "./pages/Profile";
import TurnoverDetail from "./pages/TurnoverDetail";
import BuyDetail from "./pages/BuyDetail";
import PublishTurnover from "./pages/PublishTurnover";
import PublishBuy from "./pages/PublishBuy";
import ProfileEdit from "./pages/ProfileEdit";
import ProfileTurnover from "./pages/ProfileTurnover";
import ProfileFavorites from "./pages/ProfileFavorites";
import ProfileBuy from "./pages/ProfileBuy";
import Admin from "./pages/Admin";

import AdminLogin from "./pages/AdminLogin";
import ProfileSubscriptions from "./pages/ProfileSubscriptions";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ROI from "./pages/ROI";
import Unauthorized from "./pages/Unauthorized";

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-100">
        <Routes>
          <Route path="/" element={<Turnover />} />
          <Route path="/roi" element={<ROI />} />
          <Route path="/turnover/:id" element={<TurnoverDetail />} />
          <Route path="/buy" element={<Buy />} />
          <Route path="/buy/:id" element={<BuyDetail />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/edit" element={<ProfileEdit />} />
          <Route path="/profile/turnover" element={<ProfileTurnover />} />
          <Route path="/profile/buy" element={<ProfileBuy />} />
          <Route path="/profile/favorites" element={<ProfileFavorites />} />
          <Route path="/profile/subscriptions" element={<ProfileSubscriptions />} />
          <Route path="/profile/publish-turnover" element={<PublishTurnover />} />
          <Route path="/profile/publish-buy" element={<PublishBuy />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
        <BottomNav />
      </div>
    </BrowserRouter>
  );
}
