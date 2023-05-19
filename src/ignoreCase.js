"use strict";

import { diffChars } from "diff";

ignoreCases();


/**
 * Makes comparison case insensitive. For example :
 * MaRRakesh
 * ↓
 * Marrakesh
 * Will be marked all green. So how do we go about doing this ?
 * There are 3 different classes availabe post-comparison : 
 * <span class="typeGood"></span>   - green, means the this part matches the correct answer letter for letter.
 * <span class="typeBad"></span>    - red, means you've typed it wrong, typed 'a' when it should be 'c'.
 * <span class="typeMissed"></span> - yellow/gray, means you forgot a letter.
 *
 * In previous versions, I used to use my own algo for comparison, but as it started to get more complex, I decided to use a library for it. Now I use the diffChars() function from the jsdiff library, which uses state of the art algorithms to compare strings. It returns an array of objects, each object has a value and a boolean property called added or removed. If added is true, then the value is an addition, if removed is true, then the value is a deletion. If both are false, then it's a common part.
 */
function ignoreCases() {
    // Get all span parts of both entry and answer to be destructed    
    const typeAreaSelector = 'code#typeans';
    const typesSpansSelector = typeAreaSelector + ' > span[class^="type"]';
    // Selects only answer spans
    const answerSpansSelector = typeAreaSelector + ' br ~ span[class^="type"]';

    // Update the spans array after destruction
    let typesSpans = Array.from(document.querySelectorAll(typesSpansSelector));
    let answerSpans = Array.from(document.querySelectorAll(answerSpansSelector));
    // entrySpans contains spans of the entry, which are (All_Spans - Answer_Spans). Sadly, we can't do this using a CSS selector, so we do it JS way
    let entrySpans = typesSpans.filter(x => !answerSpans.includes(x));

    const comparison_area = document.querySelector(typeAreaSelector);

    const full_entry = constructLetters(entrySpans).replace(/-/g, '');
    const full_answer = constructLetters(answerSpans);
    const full_answer_raw = full_answer.normalize("NFD").replace(/[\u0300-\u036f]/g, '').replace(/\&nbsp;/g, '');


    const diff = diffChars(full_entry, full_answer_raw, { ignoreCase: true });

    // diff.length == 1 means that the input is exactly the same as the answer, only case different.
    if (diff.length == 1) {
        // In this case, remove the entry and ↓ and leave the answer marked green!
        answerSpans.forEach(span => span.setAttribute("class", "typeGood"));
        comparison_area.innerHTML = answerSpans.map(elem => elem.outerHTML).join('');
    } else {
        // If they're not same, then reconstruct the entry and answer spans with the new classes based on the diff.

        // These arrays will contain the new spans with the new classes for entry and answer.
        let recon_entrySpans = []
        let recon_answerSpans = []

        // We want to keep track of the original entry, so we can use it in display since diffChars ignores case and normalizes case diffs.
        let full_entry_chars = full_entry.split('');

        diff.forEach((part) => {
            // entry and answer spans have different coloring, so we need to use different classes for each.
            const entry_typeClass = part.added ? 'typeMissed' : part.removed ? 'typeBad' : 'typeGood';
            const answer_typeClass = part.added ? 'typeBad' : part.removed ? 'typeMissed' : 'typeGood';

            let entry_span, answer_span;

            if (entry_typeClass == "typeMissed") {
                entry_span = `<span class="typeMissed">-</span>`.repeat(part.value.length);
            } else {
                // We want to consume the original entry array in display, so we splice it based on how many chars to consume.
                entry_span = `<span class="${entry_typeClass}">${full_entry_chars.splice(0, part.value.length).join("")}</span>`;
            }

            // answer doesn't show - for missed chars, so we don't need to do anything special.
            if (answer_typeClass != "typeMissed") {
                answer_span = `<span class="${answer_typeClass}">${part.value}</span>`;
            }

            recon_entrySpans.push(entry_span);
            recon_answerSpans.push(answer_span);
        });

        // Finally display the new spans in the comparison area.
        comparison_area.innerHTML = `${recon_entrySpans.join("")}<br><span id="typearrow">⇩</span><br>${recon_answerSpans.join("")}`;
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
