"use client";
import { getUserList, useSessionInfo } from "@/lib";
import { getSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const session = useSessionInfo();
  const router = useRouter()
  const from = useSearchParams()?.get('from') || '/home'
  getSession().then(data => console.log(data, "getSession"))

  useEffect(() => {
    const users = getUserList()
    users.then(console.log)
  }, [])
  console.log(session, '<<<<,session')

  useEffect(() => {
    if (session?.user?.sub) router.push(from || '/')
  }, [router, from, session])

  return <main>loading....</main>;
}