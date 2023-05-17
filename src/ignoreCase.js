"use strict";

import { diffChars } from "diff";

// Call the function
ignoreCases();


/**
 * Makes comparison case insensitive. For example :
 * MaRRakesh
 * ↓
 * Marrakesh
 * Will be marked all green. So how do we go about doing this ?
 * There are 3 different classes availabe post-comparison : 
 * typeGood - green, means the this part matches the correct answer letter for letter.
 * typeBad - red, means you've typed it wrong, typed a when it should be c.
 * typeMissed - yellow/gray, means you forgot a letter.
 *
 * The algorithm followed below is simple, I have to destruct the entry and answer to its consituting letter, so that I can compare every letter to the one in the answer. Then I browse every letter between the entry and the answer, if a letter is case insesitively the same as the answer, I mark it as typeGood. For example the answer above will be put this way :
 * <span class="typeGood">Ma</span><span class="typeGood">b</span><span class="typeGood">nbe</span>
 * <span class="typeGood">Dushan</span><span class="typeGood">b</span><span class="typeGood">e</span>
 */
function ignoreCases() {
    // Get all span parts of both entry and answer to be destructed    
    const typeAreaSelector = 'code#typeans';
    const typesSpansSelector = typeAreaSelector + ' > span[class^="type"]';
    // Selects only answer spans
    const answerSpansSelector = typeAreaSelector + ' br ~ span[class^="type"]';

    // Deconstructs all spans in case Anki combines the styling of two or more letters.
    for (let elem of document.querySelectorAll(typesSpansSelector)) {
        destructLetters(elem);
    }

    // Update the spans array after destruction
    let typesSpans = Array.from(document.querySelectorAll(typesSpansSelector));
    let answerSpans = Array.from(document.querySelectorAll(answerSpansSelector));
    // entrySpans contains spans of the entry, which are (All_Spans - Answer_Spans). Sadly, we can't do this using a CSS selector, so we do it JS way
    let entrySpans = typesSpans.filter(x => !answerSpans.includes(x));

    const typeArea = document.querySelector(typeAreaSelector);

    const full_entry = constructLetters(entrySpans).replace(/-/g, '');
    const full_answer = constructLetters(answerSpans);

    const diff = diffChars(full_entry, full_answer, { ignoreCase: true });

    console.log('diff :>> ', diff);

    if (diff.length == 1) {
        // If input is exactly the same as the answer, only case different, remove the entry and ↓ and leave the answer marked green!
        answerSpans.forEach(span => span.setAttribute("class", "typeGood"));
        typeArea.innerHTML = answerSpans.map(elem => elem.outerHTML).join('');
    } else {
        // If they're not same, then do a letter-by-letter comparison for the shorter one, if they match (case-less-ly), then light'em up in green.
        let recon_entrySpans = []
        let recon_answerSpans = []

        let full_entry_chars = full_entry.split('');

        diff.forEach((part) => {
            // green for additions, red for deletions
            // grey for common parts
            const color = part.added ? 'green' : part.removed ? 'red' : 'grey';
            const entry_typeClass = part.added ? 'typeMissed' : part.removed ? 'typeBad' : 'typeGood';
            const answer_typeClass = part.added ? 'typeBad' : part.removed ? 'typeMissed' : 'typeGood';

            let entry_span, answer_span;

            if (entry_typeClass == "typeMissed") {
                entry_span = `<span class="${entry_typeClass}">-</span>`.repeat(part.value.length);
            } else {
                entry_span = `<span class="${entry_typeClass}">${full_entry_chars.splice(0, part.value.length).join("")}</span>`;
            }

            if (answer_typeClass != "typeMissed") {
                answer_span = `<span class="${answer_typeClass}">${part.value}</span>`;
            }

            recon_entrySpans.push(entry_span);
            recon_answerSpans.push(answer_span);
        });
        typeArea.innerHTML = `${recon_entrySpans.join("")}<br><span id="typearrow">⇩</span><br>${recon_answerSpans.join("")}`;
    }


    /**
     * Takes an element and destructs its text into separate elements.
     * <span class="typeGood">ab</span>
     * ↓
     * <span class="typeGood">a</span>
     * <span class="typeGood">b</span>
     * @param {Element} elem Element to destruct.
     */
    function destructLetters(elem) {
        let elemText = elem.innerText;
        for (let i = elemText.length - 1; i >= 0; i--) {
            let new_char_elem = elem.cloneNode(true);
            new_char_elem.innerHTML = elemText[i];
            elem.parentNode.insertBefore(new_char_elem, elem.nextSibling);
        }
        elem.remove();
    }

    /**
     * Takes a NodeList, combines them and returns the resulting .innerText
     * Ex: [<span>H</span>, <span>i</span>, <span>!</span>] => Hi!
     * @param {NodeList} listElems Elements to combine and return innerText of.
     * @returns .innerText of all elements in listElems combined.
     */
    function constructLetters(listElems) {
        return [...listElems].map(elem => elem.innerHTML).join('');
    }
};