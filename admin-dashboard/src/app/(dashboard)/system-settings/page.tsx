import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import SystemInstructionsEditor from "@/components/SystemInstructionsEditor";

export default function SystemSettingsPage() {
  return (
    <main className="max-w-7xl mx-auto p-8 space-y-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-400 to-orange-500 bg-clip-text text-transparent mb-2">
          System Settings
        </h1>
        <p className="text-gray-600">Configure global bot behavior and system instructions</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card className="bg-white border-gray-200 shadow-sm hover:shadow-md transition-all">
          <CardHeader>
            <CardTitle className="text-orange-600 text-xl">System Instructions</CardTitle>
            <CardDescription className="text-gray-600">
              Update the global bot behavior and personality
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SystemInstructionsEditor />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
