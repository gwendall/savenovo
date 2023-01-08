import { useRouter } from "next/router"

const useIsProd = () => {
  const router = useRouter();
  return !router.pathname.includes('localhost') && !router.pathname.includes('dev.');
}

export default useIsProd;