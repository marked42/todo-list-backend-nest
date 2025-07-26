import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/hooks/useCurrentUser"
import { useLocation, useNavigate } from "react-router-dom";
import TaskLists from "@/components/task-lists";

export default function HomePage() {
    const { user, signOut } = useCurrentUser();
    const navigate = useNavigate();
    const location = useLocation();

    const handleSignOut = () => {
        signOut();
        navigate('/sign-in', { replace: true, state: { from: location } })
    }

    return (
        <div>
            <div className="flex flex-1/2 gap-2 items-center justify-center">
                <div>{user?.email}</div>
                <Button type="submit" className="z-1 max-sm:hidden inline-block rounded-4xl bg-black px-4 py-2 text-sm/6 font-semibold text-white hover:bg-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600" onClick={handleSignOut}>Logout</Button>
            </div>
            <div>
                <TaskLists />
            </div>
        </div>
    )
}
