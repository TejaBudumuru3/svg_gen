import { generateSVG } from "./gemini";
import { withRetry } from "./retry";
import { runChecks, failureReasons, type Checks } from "./validator";
import type { Concept } from "./concepts";

export interface ConceptResult{
    id: number;
    title: string;
    svg: string;
    model: string;
    inputTokens: number;
    outputTokens: number;
    cost: number;
    validationRetries: number;
    apiRetries: number;
    checks: Checks[];
    passed: boolean;
}

export async function processConcept(concept: Concept): Promise<ConceptResult>{
    let inputTokens = 0;
    let outputTokens = 0;
    let cost = 0;
    let validationRetries = 0;
    let apiRetries = 0;

    let failures: string[] = []
    let svg = "";
    let model = "";
    let checks: Checks[] = []

    for(let attempt = 0; attempt <= 1; attempt++){
        validationRetries = attempt;
        console.log("VALIDATION ATTEMPT: ", attempt)
        const { result, retries } = await withRetry(() => 
            generateSVG({
                title: concept.title,
                text: concept.text,
                details: concept.details,
                failures,
                previousSvg: svg,
            })
        )

        inputTokens += result.inputTokens;
        outputTokens += result.outputTokens;
        model = result.model;
        svg = result.svg;
        cost += result.costUsd;
        apiRetries += retries

        checks = runChecks(svg);
        failures = failureReasons(checks)
        if(failures.length === 0) break;
    }
    const final: ConceptResult = {
        id: concept.id,
        title: concept.title,
        svg,
        model, 
        cost,
        inputTokens,
        outputTokens,
        validationRetries, 
        apiRetries,
        checks,
        passed: failures.length === 0
    }

    const { svg: _svg, ...log } = final;
    console.log(JSON.stringify(log))

    return final
}