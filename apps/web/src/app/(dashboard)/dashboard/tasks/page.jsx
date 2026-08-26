import TaskList from "@/components/tasks/TaskList";
import TaskFilters from "@/components/tasks/TaskFilters";

export const metadata = { title: "All Tasks" };

export default function AllTasksPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
      <div>
        <h1 className="text-xl font-bold tracking-tight">All Tasks</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Every task across all categories and statuses.
        </p>
      </div>
      <TaskFilters />
      <TaskList />
    </div>
  );
}
