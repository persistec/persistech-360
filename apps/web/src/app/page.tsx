import { DashboardCard, PageHeader } from "@/components/ui";

export default function Home() {
  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Welcome to the Persistech 360 Admin MVP. Select an option from the sidebar to manage structural data and evaluation cycles."
      />

      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        <DashboardCard
          title="Organization"
          description="Manage Departments, Hierarchy Levels, and Roles before adding users."
        />
        <DashboardCard
          title="Users"
          description="Create users and assign them to departments and roles."
        />
        <DashboardCard
          title="Cycles & Results"
          description="Configure evaluation cycles, generate assignments, and monitor results."
        />
      </div>
    </div>
  );
}
