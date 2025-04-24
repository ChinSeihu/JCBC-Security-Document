"use client";
import { getUserList, useSessionInfo } from "@/lib";
import { getSession } from "next-auth/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const session = useSessionInfo();
  const router = useRouter()
  const from = useSearchParams()?.get('from') || '/home'
  const currentUrl = usePathname()

  useEffect(() => {
    const users = getUserList()
    users.then(console.log)
  }, [])

  useEffect(() => {
    if (session?.user?.sub) router.push(from || currentUrl || '/')
  }, [router, from, currentUrl, session])

  return <main>loading....</main>;
}