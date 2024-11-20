import { compareInputToAnswer } from './utils.mjs';

// default config
const addon_config = {
    ignore_case: true,
    ignore_accents: false,
    ignore_punctuations: false,
};

describe('compareInputToAnswer_function', () => {

    it("detects missing letter", () => {
        /**
         * Issue: Case when user misses a letter.
         * User types: aBcde
         * Answer is : abccde
         * Vanilla result: Missing letter is not marked as missed (https://imgur.com/qs9oqFe)
         * Expected result: Missing letter is marked as missed (https://imgur.com/8oZJXKc)
         */

        // Setup
        document.body.innerHTML =
        /*html*/`<code id="typeans">
                    <span class="typeGood">a</span><span class="typeBad">B</span><span class="typeGood">cde</span>
                    <br><span id="typearrow">↓</span><br>
                    <span class="typeGood">a</span><span class="typeMissed">bc</span><span class="typeGood">cde</span>
                </code>`;

        // Exercise
        compareInputToAnswer(addon_config);

        // Verify
        expect(document.body.innerHTML).toEqual(
            /*html*/`<code id="typeans"><span class="typeGood">aBc</span><span class="typeMissed">-</span><span class="typeGood">de</span><br><span id="typearrow">⇩</span><br><span class="typeGood">abc</span><span class="typeBad">c</span><span class="typeGood">de</span></code>`);
    });

    it("doesn't add - in entrySpans directly after typeBad", () => { // because it's ommited from answer too
        /**
         * Issue: Addon shouldn't add - in entrySpans directly after typeBad.
         * User types: ykjavik
         * Answer is : Reykjavík
         * Expected result: Correctly marked letters, but no - is added to entrySpan (https://imgur.com/ekoLvo5)
         */

        // Setup
        document.body.innerHTML =
        /*html*/`<code id="typeans">
        <span class="typeMissed">--</span><span class="typeGood">ykjav</span><span class="typeBad">i</span><span class="typeGood">k</span>
            <br><span id="typearrow">↓</span><br>
        <span class="typeMissed">Re</span><span class="typeGood">ykjav</span><span class="typeMissed">í</span><span class="typeGood">k</span>
        </code>`;

        // Exercise
        compareInputToAnswer(addon_config);

        // Verify
        expect(document.body.innerHTML).toEqual(
            /*html*/`<code id="typeans"><span class="typeMissed">-</span><span class="typeMissed">-</span><span class="typeGood">ykjav</span><span class="typeBad">i</span><span class="typeGood">k</span><br><span id="typearrow">⇩</span><br><span class="typeBad">Re</span><span class="typeGood">ykjav</span><span class="typeBad">í</span><span class="typeGood">k</span></code>`);
    });

    it("doesn't add - in entrySpans, ONLY directly after typeBad", () => {
        /**
         * Issue: Addon shouldn't add - in entrySpans, ONLY directly after typeBad.
         * User types: Indi
         * Answer is : Indi-
         * Expected result: Correctly mark letters (https://imgur.com/PWyW7mA)
         */

        // Setup
        document.body.innerHTML =
        /*html*/`<code id="typeans">
            <span class="typeGood">Indi</span><span class="typeMissed">-</span>
            <br><span id="typearrow">↓</span><br>
            <span class="typeGood">Indi</span><span class="typeBad">-</span>
        </code>`;

        // Exercise
        compareInputToAnswer(addon_config);

        // Verify
        expect(document.body.innerHTML).toEqual(
            /*html*/`<code id="typeans"><span class="typeGood">Indi</span><span class="typeMissed">-</span><br><span id="typearrow">⇩</span><br><span class="typeGood">Indi</span><span class="typeBad">-</span></code>`);
    });

    it("recognizes user-typed hyphens", () => {
        /**
         * Issue: Case when user types hyphen. hyphen can be interpreted as a missing letter too, so it should be marked as green if it's in the answer.
         * User types: A-bc
         * Answer is : a-bc
         * Vanilla result: A is marked red, -bc is marked green (https://imgur.com/knm1AU4)
         * Expected result: a-bc (all green)
         */
        // Setup
        document.body.innerHTML =
        /*html*/`<code id="typeans">
        <span class="typeBad">A</span><span class="typeGood">-bc</span>
        <br><span id="typearrow">↓</span><br>
        <span class="typeMissed">a</span><span class="typeGood">-bc</span>
        </code>`;

        // Exercise
        compareInputToAnswer(addon_config);

        // Verify
        expect(document.body.innerHTML).toEqual(
            /*html*/`<code id="typeans"><span class="typeGood">a</span><span class="typeGood">-bc</span></code>`);
    });

    it("trims the entry and the answer", () => { // to match the answer
        /**
         * Issue: Case when the user types a leading/trailing space, especially when using voice input.
         * User types:  abc
         * Answer is : abc
         * Vanilla result: Leading and trailing spaces are marked as wrong (https://imgur.com/lJ8HqJO)
         * Expected result: All green (https://imgur.com/nbOg6P7)
         */

        // Setup
        document.body.innerHTML =
        /*html*/`<code id="typeans">
        <span class="typeBad"> </span><span class="typeGood">abc</span><span class="typeBad"> </span>
        <br><span id="typearrow">↓</span><br>
        <span class="typeGood">abc</span>
        </code>`;

        // Exercise
        compareInputToAnswer(addon_config);

        // Verify
        expect(document.body.innerHTML).toEqual(
            /*html*/`<code id="typeans"><span class="typeGood">abc</span></code>`);
    });
})
