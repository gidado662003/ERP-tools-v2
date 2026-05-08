// import { cookies } from "next/headers";
// import { redirect } from "next/navigation";
// import HomePage from "@/components/module/modulePage";
// import { moduleServerAPI } from "@/lib/module/moudleServerApi";

// async function page() {
//   const cookieStore = await cookies();
//   const token = cookieStore.get("erp_token"); // match your actual cookie name

//   if (!token) {
//     redirect(process.env.NEXT_PUBLIC_LARAVEL as string); // or wherever unauthenticated users should go
//   }

//   let data;
//   try {
//     data = await moduleServerAPI.getModules();
//   } catch (err: any) {
//     if (err?.status === 401)
//       redirect(process.env.NEXT_PUBLIC_LARAVEL as string);
//     throw err;
//   }

//   return <HomePage userName={data.userName} modules={data.modules} />;
// }

// export default page;
"use client";

import { useEffect, useState } from "react";
import HomePage from "@/components/module/modulePage";
import { moduleAppAPI } from "@/lib/module/moduleApi"; // client-side version
import { useAuthStore } from "@/lib/store";
import { Module, ModuleListResponse } from "@/lib/module/moduleType";

export default function Page() {
  const { user } = useAuthStore();
  const [data, setData] = useState<ModuleListResponse>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchModules = async () => {
      try {
        const res = await moduleAppAPI.getModules();
        setData(res);
      } catch (err: any) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchModules();
  }, [user]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <HomePage
      userName={data.userName}
      modules={data.modules}
      activity={data.activity}
      stats={data.stats}
    />
  );
}
