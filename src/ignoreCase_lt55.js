"use strict";

// Call the function
ignoreCases();


/**
 * Makes comparison case insensitive. For example :
 * MaRRakesh
 * ↓
 * Marrakesh
 * Will be marked all green. So how do we go about doing this ?
 * There are 3 different classes availabe post-comparison : typeGood - green, means the this part matches the correct answer letter for letter. typeBad - red, means you've typed it wrong, typed a when it should be c. typeMissed - yellow, means you forgot a letter.
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


    if (constructLetters(entrySpans).toLowerCase() == constructLetters(answerSpans).toLowerCase()) {
        // If input is exactly the same as the answer, only case different, remove the entry and ↓ and leave the answer marked green!
        const typeArea = document.querySelector(typeAreaSelector);
        answerSpans.forEach(span => span.setAttribute("class", "typeGood"));
        typeArea.innerHTML = answerSpans.map(elem => elem.outerHTML).join('');
    } else {
        // If they're not same, then do a letter-by-letter comparison for the shorter one, if they match (case-less-ly), then light'em up in green.
        for (var i = 0; i < (entrySpans.length < answerSpans.length ? entrySpans : answerSpans).length; i++) {
            // Test case sensitivity using RegEx instead of .toLowerCase(). I believe it's better.
            if (entrySpans[i].innerText.toLowerCase() == answerSpans[i].innerText.toLowerCase()) {
                entrySpans[i].setAttribute("class", "typeGood");
                // Optional, modify the entry's letter to be how it should be as in answer
                // entrySpans[i].innerHTML = answerSpans[i].innerHTML;
                answerSpans[i].setAttribute("class", "typeGood");
            };
        };


        /* The above loop algo only works when Anki positions matching letters in prallel and marking the rest as wrong. 
        This part includes cases in which we compare matching parts of words (3+ letters) that show up later in the entry.
        Example:
        This case will not work with the algo above because the letters, while correct, are not in the same position:
        The Bosnia and the Herzegovina
        ↓
        Bosnia and Herzegovina
        Anki by default marks "Bosnia and" + "Herzegovina" in green and "the" in red. This should also be the case if we wrote "THE BOSNIA AND THE HERZEGOVINA". That's what ↓ is about.

        
        The algorithm is simple: We use the answer as base and start looking in the input for a match, if no match was found, we shift letter from the answer and repeat. If however a match was found, then we mark letters as correct, we update the entry to start from this position on later repeats, and then we continue until the answer's letters are over. Could be better worded that this, sorry!
        */

        /// This the number of letters that must match before we call it a match. Ex. =3 means if a set of 3 letters in input match the exact set in answer, light'em up. Anki AFAIK compares word-by-word. I think parts of words matter too. 
        const matchLength = 3;
        // While there are still letters in the answer to compare.
        while (answerSpans.length) {
            // Clone the input/entry letters for safekeeping. 
            let entrySpansCopy = [...entrySpans];


            // While there are letters in the answer or input to compare, whichever is shorter.
            while (entrySpansCopy.length >= matchLength && answerSpans.length >= matchLength) {
                const firstSetofEntry = entrySpansCopy.slice(0, matchLength);
                const firstSetofAnswer = answerSpans.slice(0, matchLength);
                if (constructLetters(firstSetofEntry).toLowerCase() == constructLetters(firstSetofAnswer).toLowerCase()) {
                    /* if both letters are a match, 
                    1- We mark both of them as Good
                    2- We drop the letter from both input and answer
                    3- We update entrySpans so it doesn't include the dropped letters in later repeats
                    */

                    firstSetofEntry.forEach(span => {
                        span.setAttribute("class", "typeGood");
                    });
                    firstSetofAnswer.forEach(span => {
                        span.setAttribute("class", "typeGood");
                    });

                    entrySpansCopy.shift();
                    entrySpans = [...entrySpansCopy];
                    answerSpans.shift();
                } else {
                    // Letter didn't match the answer's. So drop it to test the next one.
                    entrySpansCopy.shift();
                }
            }
            // Since we're here, this either means the answer is over, so this won't have an effect or the input is over which means no further match for this letter was found, so we need to skip it and move to the next letter.            
            answerSpans.shift();
        }
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