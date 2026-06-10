import { PageHeader } from "@/components/ui";

export default function Home() {
  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Welcome to the Persistech 360 Admin MVP. Select an option from the sidebar to manage structural data and evaluation cycles."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Organization</h3>
          <p className="mt-2 text-sm text-gray-500">
            Manage Departments, Hierarchy Levels, and Roles before adding users.
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Users</h3>
          <p className="mt-2 text-sm text-gray-500">
            Create users and assign them to departments and roles.
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Cycles & Results</h3>
          <p className="mt-2 text-sm text-gray-500">
            Configure evaluation cycles, generate assignments, and monitor results.
          </p>
        </div>
      </div>
    </div>
  );
}
