import type { TaskList } from "@/api/task";
import { useEffect, useState } from "react";
import * as api from '@/api/task';

export default function TaskLists() {
    const [taskLists, setTaskLists] = useState([] as TaskList[]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchTaskLists = async () => {
        try {
            setLoading(true);
            const response = await api.fetchTaskList()
            console.log('response', response);
            setTaskLists(response.data);
        } catch (err) {
            setError('Failed to fetch tasks');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTaskLists()
    }, [])


    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    if (taskLists.length === 0) {
        return <div>No task lists available</div>;
    }

    return taskLists.map((taskList) => (
        <div key={taskList.id} className="task-list">
            <h3>{taskList.name}</h3>
            <ul>
                {taskList.tasks.map((task) => (
                    <li key={task.id}>{task.title}</li>
                ))}
            </ul>
        </div>
    ));
}
