import { Profile, Session } from "next-auth";
import { getSession, useSession } from "next-auth/react";

export const getSearchParams = (searchParams: URLSearchParams) => {
    const result: Record<string, any> = {};
    (searchParams?.entries() as any)?.forEach?.((it: string[]) => {
        const [key, value] = it;
        result[key] = value;
    })
    return result;
}

interface SessionExtra {
    accessToken: string;
    roles: string[];
    user: Profile 
}

type TSessionInfo = Session & SessionExtra
export const useSessionInfo = (): TSessionInfo => {
    const { data: session } = useSession({ required: true });
    return session as TSessionInfo
}

export const getUserList = async () => {
    const session = await getSession() as TSessionInfo
    console.log(session, '<<getUserList')
    return await fetch('/api/admin/users', {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.error) console.log(data.error);
          else return data;
        })
        .catch((err) => console.log(err));
}

export const getCurrentuser = async () => {
    const session = await getSession() as TSessionInfo
    return { 
        ...(session.user || {}),
        id: session.user.sub as string
    }
}

export const validateUser = async () => {
    const user = await getCurrentuser();
    if (!user?.id) throw new Error('userId is not defined...')
    return user
}