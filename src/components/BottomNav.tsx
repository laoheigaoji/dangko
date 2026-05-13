import { Link, useLocation } from "react-router-dom";
import { HandHelping, ShoppingCart, User, Calculator } from "lucide-react";

export default function BottomNav() {
  const location = useLocation();

  const hideNavPaths = [
    '/login', 
    '/register',
    '/turnover/', 
    '/buy/', 
    '/profile/publish-turnover', 
    '/profile/publish-buy', 
    '/profile/edit', 
    '/profile/turnover', 
    '/profile/buy',
    '/profile/favorites',
    '/profile/subscriptions',
    '/admin'
  ];
  
  const shouldHide = hideNavPaths.some(path => location.pathname.includes(path) && location.pathname !== '/turnover' && location.pathname !== '/buy' && location.pathname !== '/roi');

  if (shouldHide) return null;

  const navItems = [
    { name: "转让", path: "/", icon: HandHelping },
    { name: "求购", path: "/buy", icon: ShoppingCart },
    { name: "ROI", path: "/roi", icon: Calculator },
    { name: "我的", path: "/profile", icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 flex justify-around pt-1.5 pb-2 z-50 shadow-[0_-4px_16px_rgba(0,0,0,0.03)]">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.name}
            to={item.path}
            className={`flex flex-col items-center flex-1 ${isActive ? "text-[#44a0fe]" : "text-gray-400"}`}
          >
            <Icon size={24} />
            <span className="text-[10px] mt-0.5">{item.name}</span>
          </Link>
        );
      })}
    </div>
  );
}
