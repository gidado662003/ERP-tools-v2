import HomePage from "@/components/module/modulePage";
import { moduleAppAPI } from "@/lib/module//moduleApi";

async function page() {
  const data = await moduleAppAPI.getModules();
  const userName = data.userName;
  const modules = data.modules;
  return <HomePage userName={userName} modules={modules} />;
}

export default page;
