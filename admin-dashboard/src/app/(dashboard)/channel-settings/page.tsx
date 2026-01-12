import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ChannelManager from "@/components/ChannelManager";
import MemoryViewer from "@/components/MemoryViewer";

export default function ChannelSettingsPage() {
  return (
    <main className="max-w-7xl mx-auto p-8 space-y-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-400 to-orange-500 bg-clip-text text-transparent mb-2">
          Channel Settings
        </h1>
        <p className="text-gray-600">Manage channels and conversation memory</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card className="bg-white border-gray-200 shadow-sm hover:shadow-md transition-all">
          <CardHeader>
            <CardTitle className="text-orange-600 text-xl">Channel Management</CardTitle>
            <CardDescription className="text-gray-600">
              Add or remove allowed channels
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChannelManager />
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-200 shadow-sm hover:shadow-md transition-all">
          <CardHeader>
            <CardTitle className="text-orange-600 text-xl">Memory Viewer</CardTitle>
            <CardDescription className="text-gray-600">
              Inspect and reset conversation memories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MemoryViewer />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
