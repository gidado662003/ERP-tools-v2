import { useRouter, useSearchParams, usePathname } from "next/navigation";

export const useSetFilter = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  return (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (!value) {
      params.delete(key);
    } else {
      params.set(key, value);
    }

    router.push(`${pathname}?${params.toString()}`);
  };
};
