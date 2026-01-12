"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import SystemInstructionsEditor from "@/components/SystemInstructionsEditor";
import ChannelManager from "@/components/ChannelManager";
import MemoryViewer from "@/components/MemoryViewer";

export default function Home() {
	const [stats, setStats] = useState({ channelCount: 0, activeConversations: 0 });
	const [loading, setLoading] = useState(true);

	async function fetchStats() {
		try {
			const [channelsRes, memoryRes] = await Promise.all([
				fetch('/api/channels', { cache: 'no-store' }),
				fetch('/api/memory?limit=1&offset=0', { cache: 'no-store' }),
			]);
			const channelsJson = await channelsRes.json();
			const memoryJson = await memoryRes.json();
			setStats({
				channelCount: Array.isArray(channelsJson?.data) ? channelsJson.data.length : 0,
				activeConversations: memoryJson?.pagination?.total ?? (Array.isArray(memoryJson?.data) ? memoryJson.data.length : 0),
			});
		} catch (error) {
			console.error('Error fetching stats:', error);
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		fetchStats();
		// Refresh stats every 30 seconds
		const interval = setInterval(fetchStats, 30000);
		return () => clearInterval(interval);
	}, []);

	return (
		<main className="max-w-7xl mx-auto p-8 space-y-8">
			{/* Header */}
			<div className="mb-8">
				<h1 className="text-4xl font-bold text-slate-900 mb-2">
					Dashboard
				</h1>
				<p className="text-gray-600">Monitor and manage your Discord Copilot bot</p>
			</div>

			{/* Stats Cards and Channel Section - Side by Side */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
				{/* Stats Cards - Stacked Vertically */}
				<div className="flex flex-col gap-4">
					<Card className="bg-orange-500 border-orange-600 shadow-lg">
						<CardHeader>
							<CardTitle className="text-white">Allowed Channels</CardTitle>
							<CardDescription className="text-orange-100">Total channels in allow-list</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="text-4xl font-bold text-white">
								{loading ? "..." : stats.channelCount}
							</div>
						</CardContent>
					</Card>
					<Card className="bg-orange-500 border-orange-600 shadow-lg">
						<CardHeader>
							<CardTitle className="text-white">Active Conversations</CardTitle>
							<CardDescription className="text-orange-100">Total conversation memories</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="text-4xl font-bold text-white">
								{loading ? "..." : stats.activeConversations}
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Channel Management - Horizontal */}
				<div className="lg:col-span-2">
					<Card className="bg-white border-slate-200 h-full">
						<CardHeader className="border-b border-slate-200">
							<CardTitle className="text-slate-900">Channel Management</CardTitle>
							<CardDescription className="text-slate-600">Add or remove allowed channels</CardDescription>
						</CardHeader>
						<CardContent className="pt-6">
							<ChannelManager />
						</CardContent>
					</Card>
				</div>
			</div>

			{/* Memory Section - Full Width */}
			<div className="grid grid-cols-1 gap-6">
				<Card className="bg-white border-slate-200">
					<CardHeader className="border-b border-slate-200">
						<CardTitle className="text-slate-900">Memory Management</CardTitle>
						<CardDescription className="text-slate-600">Inspect and reset conversation memories</CardDescription>
					</CardHeader>
					<CardContent className="pt-6">
						<MemoryViewer />
					</CardContent>
				</Card>
			</div>
		</main>
	);
}