import HomePage from "@/components/module/modulePage";
import { moduleServerAPI } from "@/lib/module/moudleServerApi";

async function page() {
  const data = await moduleServerAPI.getModules();
  const userName = data.userName;
  const modules = data.modules;
  return <HomePage userName={userName} modules={modules} />;
}

export default page;
