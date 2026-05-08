import React from "react";
import AllModule from "@/components/admin/settings/allModule";
import { moduleServerAPI } from "@/lib/module/moudleServerApi";
async function page() {
  const data = await moduleServerAPI.getModulesAdmin();
  return <AllModule modules={data.modules} />;
}

export default page;
