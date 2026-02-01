"use client"
import React, { useEffect } from 'react'
import Link from 'next/link'
import { MessageSquare, FileText } from 'lucide-react'
import { useModuleStore } from "../lib/moduleStore"
import { useRouter } from 'next/navigation'

function HomePage() {
    const apps = [
        {
            name: "Chat",
            icon: <MessageSquare className="w-5 h-5" />,
            href: "/chat/chats",
            module: "chat",
            color: "bg-blue-50 border-blue-200 text-blue-700 w-full"
        },
        {
            name: "Internal Requisitions",
            icon: <FileText className="w-5 h-5" />,
            href: "/internal-requisitions/",
            module: "request",
            color: "bg-green-50 border-green-200 text-green-700 w-full"
        }
    ]
    const module = useModuleStore((state) => state.module)
    const setModule = useModuleStore((state) => state.setModule);
    const router = useRouter()

    useEffect(() => {
        switch (module) {
            case "chat":
                router.push("/chat/chats");
                break;

            case "request":
                router.push("/internal-requisitions/");
                break;

            default:
                <Link href={"/"} />

        }
    }, [])
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        Syscodes Tools
                    </h1>
                    <p className="text-gray-600">
                        Select an app
                    </p>
                </div>

                <div className="space-y-4 grid grid-cols-2 gap-4 w-full">
                    {apps.map((app) => (
                        <Link
                            key={app.name}
                            href={app.href}
                            className="block w-full"
                            onClick={() => setModule(app.module)}
                        >
                            <div className={`${app.color}  border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer`}>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white rounded-md">
                                        {app.icon}
                                    </div>
                                    <span className="font-medium">
                                        {app.name}
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default HomePage