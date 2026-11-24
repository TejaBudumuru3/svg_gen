import { mkdirSync, writeFileSync } from "fs";
import { Concepts } from "../lib/concepts";
import { processConcept, type ConceptResult } from "../lib/pipeline";

async function main (){
    const results: ConceptResult[] = []

    mkdirSync("output", { recursive : true})
    for(const concept of Concepts){
        try{ 
            const result = await processConcept(concept)
            results.push(result)
            writeFileSync(`output/concept-${concept.id}.svg`, result.svg);
        }catch(err){
            console.error(`Concept ${concept.id} failed: ${err}`)
        }
    }

    writeFileSync("results.json", JSON.stringify(results, null, 2))
    console.log(`Saved ${results.length} results to results.json`)

}

main()