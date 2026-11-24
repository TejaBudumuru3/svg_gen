const MAX_RETRIES = 3;
const DELAY_MS = 4000;
const RETRYABLE = [429, 503]
export async function withRetry<T>(
    fn: () => Promise<T>
): Promise<{ result: T, retries: number }> {
    let lastStatusCode: number | undefined;
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        try {
            console.log("API ATTEMPT:", attempt)
            return { result: await fn(), retries: attempt }
        }
        catch (err: any) {
            const status = err.status ?? err.code
            lastStatusCode = status
            if (!RETRYABLE.includes(status)) throw err
            console.log(`found retyable error, retries in ${DELAY_MS * (attempt + 1)}ms`)
            if (RETRYABLE.includes(status) && attempt >= MAX_RETRIES - 1) {
                console.log(err)
            }
            await new Promise(resolve => setTimeout(resolve, DELAY_MS * (attempt + 1)))
        }
    }
    throw new Error(`Status: ${lastStatusCode}; Max retries reached: ${MAX_RETRIES}`)
}