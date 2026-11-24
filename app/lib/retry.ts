const MAX_RETRIES = 2;
const DELAY_MS = 1000;
const RETRYABLE = [429, 503, 504]
export async function withRetry<T>(
    fn: ()=> Promise<T>
): Promise<{ result:T, retries: number }>{
    for(let attempt = 0; attempt < MAX_RETRIES; attempt++){
        try{
            return { result: await fn(), retries: attempt}
        }
        catch(err: any){
            const status = err.code ?? err.status
            if(!RETRYABLE.includes(status)) throw err
            
            await new Promise(resolve => setTimeout(resolve, DELAY_MS))
        }
    }
    throw new Error(`Max retries reached: ${MAX_RETRIES}`)
}