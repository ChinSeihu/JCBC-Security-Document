export const getSearchParams = (searchParams: URLSearchParams) => {
    const result: Record<string, any> = {};
    (searchParams?.entries() as any)?.forEach?.((it: string[]) => {
        const [key, value] = it;
        result[key] = value;
    })
    return result;
}