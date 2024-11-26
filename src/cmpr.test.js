import { compareInputToAnswer } from './utils.mjs';

// default config
const addon_config = {
    ignore_case: true,
    ignore_accents: false,
    ignore_punctuations: false,
};

describe('ignore_case tests', () => {
    it('detects missing letter', () => {
        /**
         * Issue: Case when user misses a letter.
         * User types: aBcde
         * Answer is : abccde
         * Vanilla result: Missing letter is not marked as missed (https://imgur.com/qs9oqFe)
         * Expected result: Missing letter is marked as missed (https://imgur.com/8oZJXKc)
         */

        // Setup
        document.body.innerHTML = f(/*html*/ `
            <code id="typeans">
                <span class="typeGood">a</span><span class="typeBad">B</span><span class="typeGood">cde</span>
                    <br><span id="typearrow">↓</span><br>
                <span class="typeGood">a</span><span class="typeMissed">bc</span><span class="typeGood">cde</span>
            </code>`);

        // Exercise
        compareInputToAnswer(addon_config);

        // Verify
        expect(document.body.innerHTML).toEqual(
            f(/*html*/ `
                <code id="typeans">
                    <span class="typeGood">aBc</span><span class="typeMissed">-</span><span class="typeGood">de</span>
                        <br><span id="typearrow">⇩</span><br>
                    <span class="typeGood">abc</span><span class="typeBad">c</span><span class="typeGood">de</span>
                </code>`)
        );
    });

    it("doesn't add - in entrySpans directly after typeBad", () => {
        // because it's ommited from answer too
        /**
         * Issue: Addon shouldn't add - in entrySpans directly after typeBad.
         * User types: ykjavik
         * Answer is : Reykjavík
         * Expected result: Correctly marked letters, but no - is added to entrySpan (https://imgur.com/ekoLvo5)
         */

        // Setup
        document.body.innerHTML = f(/*html*/ `
        <code id="typeans">
            <span class="typeMissed">--</span><span class="typeGood">ykjav</span><span class="typeBad">i</span><span class="typeGood">k</span>
                <br><span id="typearrow">↓</span><br>
            <span class="typeMissed">Re</span><span class="typeGood">ykjav</span><span class="typeMissed">í</span><span class="typeGood">k</span>
        </code>`);

        // Exercise
        compareInputToAnswer(addon_config);

        // Verify
        expect(document.body.innerHTML).toEqual(
            f(/*html*/ `
            <code id="typeans">
                <span class="typeMissed">-</span><span class="typeMissed">-</span><span class="typeGood">ykjav</span><span class="typeBad">i</span><span class="typeGood">k</span>
                    <br><span id="typearrow">⇩</span><br>
                <span class="typeBad">Re</span><span class="typeGood">ykjav</span><span class="typeBad">í</span><span class="typeGood">k</span>
            </code>`)
        );
    });

    it("doesn't add - in entrySpans, ONLY directly after typeBad", () => {
        /**
         * Issue: Addon shouldn't add - in entrySpans, ONLY directly after typeBad.
         * User types: Indi
         * Answer is : Indi-
         * Expected result: Correctly mark letters (https://imgur.com/PWyW7mA)
         */

        // Setup
        document.body.innerHTML = f(/*html*/ `
        <code id="typeans">
            <span class="typeGood">Indi</span><span class="typeMissed">-</span>
                <br><span id="typearrow">↓</span><br>
            <span class="typeGood">Indi</span><span class="typeBad">-</span>
        </code>`);

        // Exercise
        compareInputToAnswer(addon_config);

        // Verify
        expect(document.body.innerHTML).toEqual(
            f(/*html*/ `
            <code id="typeans">
                <span class="typeGood">Indi</span><span class="typeMissed">-</span>
                    <br><span id="typearrow">⇩</span><br>
                <span class="typeGood">Indi</span><span class="typeBad">-</span>
            </code>`)
        );
    });

    it('recognizes user-typed hyphens', () => {
        /**
         * Issue: Case when user types hyphen. hyphen can be interpreted as a missing letter too, so it should be marked as green if it's in the answer.
         * User types: A-bc
         * Answer is : a-bc
         * Vanilla result: A is marked red, -bc is marked green (https://imgur.com/knm1AU4)
         * Expected result: a-bc (all green)
         */
        // Setup
        document.body.innerHTML = f(/*html*/ `
        <code id="typeans">
            <span class="typeBad">A</span><span class="typeGood">-bc</span>
                <br><span id="typearrow">↓</span><br>
            <span class="typeMissed">a</span><span class="typeGood">-bc</span>
        </code>`);

        // Exercise
        compareInputToAnswer(addon_config);

        // Verify
        expect(document.body.innerHTML).toEqual(
            f(/*html*/ `
            <code id="typeans">
                <span class="typeGood">a</span><span class="typeGood">-bc</span>
            </code>`)
        );
    });

    it('trims the entry and the answer', () => {
        // to match the answer
        /**
         * Issue: Case when the user types a leading/trailing space, especially when using voice input.
         * User types:  abc
         * Answer is : abc
         * Vanilla result: Leading and trailing spaces are marked as wrong (https://imgur.com/lJ8HqJO)
         * Expected result: All green (https://imgur.com/nbOg6P7)
         */

        // Setup
        document.body.innerHTML = f(/*html*/ `
        <code id="typeans">
            <span class="typeBad"> </span><span class="typeGood">abc</span><span class="typeBad"> </span>
                <br><span id="typearrow">↓</span><br>
            <span class="typeGood">abc</span>
        </code>`);

        // Exercise
        compareInputToAnswer(addon_config);

        // Verify
        expect(document.body.innerHTML).toEqual(
            f(/*html*/ `
        <code id="typeans">
            <span class="typeGood">abc</span>
        </code>`)
        );
    });
});

describe('ignore_accents tests', () => {
    it('Ignore Accents - Basic Latin', () => {
        /**
         * Issue: Case when there's an accent mismatch.
         * User types: Reykjavik
         * Answer is : Reykjavík
         * Vanilla result: ì is marked as missed
         * Expected result: All green
         */

        addon_config.ignore_accents = true;

        // Setup
        document.body.innerHTML = f(/*html*/ `
        <code id="typeans">
            <span class="typeGood">Reykjav</span><span class="typeBad">i</span><span class="typeGood">c</span>
                <br><span id="typearrow">↓</span><br>
            <span class="typeGood">Reykjav</span><span class="typeMissed">ì</span><span class="typeGood">c</span>
        </code>`);

        // Exercise
        compareInputToAnswer(addon_config);

        // Verify
        expect(document.body.innerHTML).toEqual(
            f(/*html*/ `
        <code id="typeans">
            <span class="typeGood">Reykjav</span><span class="typeGood">ì</span><span class="typeGood">c</span>
        </code>`)
        );
    });

    it('Ignore Accents - Extended Characters', () => {
        /**
         * Issue: Case when there's an accent mismatch or an umlaut.
         * User types: naive
         * Answer is : naïve
         * Vanilla result: ï is marked as missed
         * Expected result: All green
         */

        addon_config.ignore_accents = true;

        // Setup
        document.body.innerHTML = f(/*html*/ `
        <code id="typeans">
            <span class="typeGood">na</span><span class="typeBad">i</span><span class="typeGood">ve</span>
                <br><span id="typearrow">↓</span><br>
            <span class="typeGood">na</span><span class="typeMissed">ï</span><span class="typeGood">ve</span>
        </code>`);

        // Exercise
        compareInputToAnswer(addon_config);

        // Verify
        expect(document.body.innerHTML).toEqual(
            f(/*html*/ `
        <code id="typeans">
            <span class="typeGood">na</span><span class="typeGood">ï</span><span class="typeGood">ve</span>
        </code>`)
        );
    });

    it('Ignore Accents - Mixed Case and Accents', () => {
        /**
         * Issue: Case when an accent mismatch occurs in a mixed case word.
         * User types: Éxample
         * Answer is : example
         * Vanilla result: É is marked as missed
         * Expected result: All green
         */

        addon_config.ignore_case = true;
        addon_config.ignore_accents = true;

        // Setup
        document.body.innerHTML = f(/*html*/ `
        <code id="typeans">
            <span class="typeBad">É</span><span class="typeGood">xample</span>
                <br><span id="typearrow">↓</span><br>
            <span class="typeMissed">e</span><span class="typeGood">xample</span>
        </code>`);

        // Exercise
        compareInputToAnswer(addon_config);

        // Verify
        expect(document.body.innerHTML).toEqual(
            f(/*html*/ `
        <code id="typeans">
            <span class="typeGood">e</span><span class="typeGood">xample</span>
        </code>`)
        );
    });

    it('Ignore Accents - Multiple Accents in a String', () => {
        /**
         * Issue: Case when there are multiple accent mismatches.
         * User types: eleve
         * Answer is : élève
         * Vanilla result: é and è are marked as missed
         * Expected result: All green
         */

        addon_config.ignore_accents = true;

        // Setup
        document.body.innerHTML = f(/*html*/ `
        <code id="typeans">
            <span class="typeBad">e</span><span class="typeGood">l</span><span class="typeBad">e</span><span class="typeGood">ve</span>
                <br><span id="typearrow">↓</span><br>
            <span class="typeMissed">é</span><span class="typeGood">l</span><span class="typeMissed">è</span><span class="typeGood">ve</span>
        </code>`);

        // Exercise
        compareInputToAnswer(addon_config);

        // Verify
        expect(document.body.innerHTML).toEqual(
            f(/*html*/ `
        <code id="typeans">
            <span class="typeGood">é</span><span class="typeGood">l</span><span class="typeGood">è</span><span class="typeGood">ve</span>
        </code>`)
        );
    });

    it('Ignore Accents - Non-Latin Scripts', () => {
        /**
         * Issue: Case when there are accent mismatches in non-Latin scripts.
         * User types: Toi thich lap trinh
         * Answer is : Tôi thích lập trình
         * Vanilla result: é and è are marked as missed
         * Expected result: All green
         */

        addon_config.ignore_accents = true;

        // Setup
        document.body.innerHTML = f(/*html*/ `
        <code id="typeans">
            <span class="typeGood">T</span><span class="typeBad">o</span><span class="typeGood">i th</span><span class="typeBad">i</span><span class="typeGood">ch l</span><span class="typeBad">a</span><span class="typeGood">p tr</span><span class="typeBad">i</span><span class="typeGood">nh</span>
                <br><span id="typearrow">↓</span><br>
            <span class="typeGood">T</span><span class="typeMissed">ô</span><span class="typeGood">i th</span><span class="typeMissed">í</span><span class="typeGood">ch l</span><span class="typeMissed">ậ</span><span class="typeGood">p tr</span><span class="typeMissed">ì</span><span class="typeGood">nh</span>
        </code>`);

        // Exercise
        compareInputToAnswer(addon_config);

        // Verify
        expect(document.body.innerHTML).toEqual(
            f(/*html*/ `
        <code id="typeans">
            <span class="typeGood">T</span><span class="typeGood">ô</span><span class="typeGood">i th</span><span class="typeGood">í</span><span class="typeGood">ch l</span><span class="typeGood">ậ</span><span class="typeGood">p tr</span><span class="typeGood">ì</span><span class="typeGood">nh</span>
        </code>`)
        );
    });
});

/**
 * Removes whitespace between HTML tags and trims the string.
 *
 * @param {string} s - The input string containing HTML.
 * @returns {string} - The processed string with no whitespace between tags and trimmed.
 */
const f = (s) => s.replace(/>\s+</g, '><').trim();
