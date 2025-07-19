import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/hooks/useCurrentUser"
import { useLocation, useNavigate } from "react-router-dom";

export default function HomePage() {
    const { user, logout } = useCurrentUser();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login', { replace: true, state: { from: location } })
    }
    return (
        <div className="flex flex-1/2 gap-2 items-center justify-center">
            <div>{user?.name}</div>
            <Button type="submit" className="z-1 max-sm:hidden inline-block rounded-4xl bg-black px-4 py-2 text-sm/6 font-semibold text-white hover:bg-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600" onClick={handleLogout}>Logout</Button>
        </div>
    )
}
