'use strict';

import { diffChars } from 'diff';

const addon_config = window.addon_config;

/**
 * Makes comparison case insensitive. For example :
 * MaRRakesh
 * ↓
 * Marrakesh
 * Will be marked all green. So how do we go about doing this ?
 * There are 3 different classes availabe post-comparison :
 * <span class="typeGood"></span>   - green, means the this part matches the correct answer letter for letter.
 * <span class="typeBad"></span>    - red, means you've typed it wrong, typed 'a' when it should be 'c'.
 * <span class="typeMissed"></span> - gray, means you forgot a letter.
 *
 * In previous versions, I used to use my own algo for comparison, but as it started to get more complex, I decided to use a library for it. Now I use the diffChars() function from the jsdiff library, which uses state of the art algorithms to compare strings. It returns an array of objects, each object has a value and a boolean property called added or removed. If added is true, then the value is an addition, if removed is true, then the value is a deletion. If both are false, then it's a common part.
 */
function ignoreCase() {
    // if there's no arrow, that means there's no comparison, which means the user hasn't typed anything or got the correct answer.
    if (!document.querySelector('span#typearrow')) return;

    // Get all span parts of both entry and answer to be destructed
    const typeAreaSelector = 'code#typeans';
    const typesSpansSelector = `${typeAreaSelector} > span[class^="type"]`;
    // Selects only answer spans
    const answerSpansSelector = `${typeAreaSelector} br ~ span[class^="type"]`;

    // Update the spans array after destruction
    const typesSpans = [...document.querySelectorAll(typesSpansSelector)];
    const answerSpans = [...document.querySelectorAll(answerSpansSelector)];
    // entrySpans contains spans of the entry, which are (All_Spans - Answer_Spans). It also excludes typeMissed spans from Anki comparison to keep raw user input.
    const entrySpans = typesSpans.filter((x) => !answerSpans.includes(x) && !x.classList.contains('typeMissed'));

    const comparison_area = document.querySelector(typeAreaSelector);

    const full_entry = constructLetters(entrySpans);
    const full_answer = constructLetters(answerSpans);

    let diff = diffChars(full_entry, full_answer, { ignoreCase: true });

    let normalized_entry = null;
    let normalized_answer = null;
    if (addon_config.ignore_accents) {
        // Remove accents from both entry and answer.
        normalized_entry = full_entry.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        normalized_answer = full_answer.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

        diff = diffChars(normalized_entry, normalized_answer, { ignoreCase: true });
    }

    // diff.length === 1 means that the input is exactly the same as the answer, only case different.
    if (diff.length === 1) {
        // In this case, remove the entry and ↓ and leave the answer marked green!
        answerSpans.forEach((span) => span.setAttribute('class', 'typeGood'));
        comparison_area.innerHTML = answerSpans.map((elem) => elem.outerHTML).join('');
    } else {
        // If they're not same, then reconstruct the entry and answer spans with the new classes based on the diff.

        // These arrays will contain the new spans with the new classes for entry and answer.
        let recon_entrySpans = [];
        let recon_answerSpans = [];

        // We want to keep track of the original entry, so we can use it in display since diffChars ignores case and normalizes case diffs.
        let full_entry_chars = full_entry.split('');

        /**
         * This variable keeps track of the length of processed parts so far in the answer, so we can use it to slice the original answer and get the non-normalized part.
         * @type {number}
         */
        let processed_answer_parts_len = 0;

        diff.forEach((part) => {
            // entry and answer spans have different coloring, so we need to use different classes for each.
            const entry_typeClass = part.added ? 'typeMissed' : part.removed ? 'typeBad' : 'typeGood';
            const answer_typeClass = part.added ? 'typeBad' : part.removed ? 'typeMissed' : 'typeGood';

            let entry_span = '',
                answer_span = '';

            if (entry_typeClass === 'typeMissed') {
                if (!last_item_includes(recon_entrySpans, 'typeBad'))
                    // Only add typeMissed if last item is not typeBad, to match better with answerSpans.
                    entry_span = `<span class="typeMissed">-</span>`.repeat(part.value.length);
            } else {
                // We want to consume the original entry array in display, so we splice it based on how many chars to consume.
                entry_span = `<span class="${entry_typeClass}">${full_entry_chars.splice(0, part.value.length).join('')}</span>`;
            }

            // If the part is removed, this means it was found in entry but not in answer
            if (!part.removed) {
                // answer doesn't show '-' for missed chars, so we don't need to do anything special in answer for cases where entry has a char that answer doesn't.

                if (addon_config.ignore_accents) {
                    // slice this part from the original answer to get the non-normalized part.
                    let non_normalized_part = full_answer.slice(processed_answer_parts_len, processed_answer_parts_len + part.value.length);
                    answer_span = `<span class="${answer_typeClass}">${non_normalized_part}</span>`;
                } else {
                    answer_span = `<span class="${answer_typeClass}">${part.value}</span>`;
                }

                // If the part is removed, we don't want to increment the processed_answer_parts_len.
                processed_answer_parts_len += part.value.length;
            }

            recon_entrySpans.push(entry_span);
            recon_answerSpans.push(answer_span);
        });

        // Finally display the new spans in the comparison area.
        comparison_area.innerHTML = `${recon_entrySpans.join('')}<br><span id="typearrow">⇩</span><br>${recon_answerSpans.join('')}`;
    }
}

/**
 * Checks if the last item of the array includes the string.
 * @param {Array<string>} arr_of_strings The array of strings to check the last item of.
 * @param {string} str The string to check if it's included in the last item of the array.
 * @returns {boolean} true if the last item of the array includes the string, false otherwise.
 */
function last_item_includes(arr_of_strings, str) {
    // console.log('arr_of_strings :>> ', arr_of_strings);
    return arr_of_strings.length > 0 && arr_of_strings.at(-1).includes(str);
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
    return [...listElems]
        .map((elem) => elem.innerHTML)
        .join('')
        .trim();
}

export { ignoreCase };
