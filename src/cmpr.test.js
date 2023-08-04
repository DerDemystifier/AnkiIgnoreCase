import { ignoreCase } from './utils.mjs';


describe('ignoreCases_function', () => {

    it("detects missing letter", () => {
        // Setup
        document.body.innerHTML =
        /*html*/`<code id="typeans">
                    <span class="typeGood">a</span><span class="typeBad">B</span><span class="typeGood">cde</span>
                    <br><span id="typearrow">↓</span><br>
                    <span class="typeGood">a</span><span class="typeMissed">bc</span><span class="typeGood">cde</span>
                </code>`;

        // Exercise
        ignoreCase();

        // Verify
        expect(document.body.innerHTML).toEqual(
            /*html*/`<code id="typeans"><span class="typeGood">aBc</span><span class="typeMissed">-</span><span class="typeGood">de</span><br><span id="typearrow">⇩</span><br><span class="typeGood">abc</span><span class="typeBad">c</span><span class="typeGood">de</span></code>`);
    });

    it("doesn't add - in entrySpans directly after typeBad", () => { // because it's ommited from answer too
        // Setup
        document.body.innerHTML =
        /*html*/`<code id="typeans">
        <span class="typeMissed">--</span><span class="typeGood">ykjav</span><span class="typeBad">i</span><span class="typeGood">k</span>
            <br><span id="typearrow">↓</span><br>
        <span class="typeMissed">Re</span><span class="typeGood">ykjav</span><span class="typeMissed">í</span><span class="typeGood">k</span>
        </code>`;

        // Exercise
        ignoreCase();

        // Verify
        expect(document.body.innerHTML).toEqual(
            /*html*/`<code id="typeans"><span class="typeMissed">-</span><span class="typeMissed">-</span><span class="typeGood">ykjav</span><span class="typeBad">i</span><span class="typeGood">k</span><br><span id="typearrow">⇩</span><br><span class="typeBad">Re</span><span class="typeGood">ykjav</span><span class="typeBad">í</span><span class="typeGood">k</span></code>`);
    });

    it("doesn't add - in entrySpans, ONLY directly after typeBad", () => {
        /**
         * User types: Indi
         * Answer is:  Indi-
         * Expected result: Missing letter is marked, but no - is added to entrySpan
         */

        // Setup
        document.body.innerHTML =
        /*html*/`<code id="typeans">
            <span class="typeGood">Indi</span><span class="typeMissed">-</span>
            <br><span id="typearrow">↓</span><br>
            <span class="typeGood">Indi</span><span class="typeBad">-</span>
        </code>`;

        // Exercise
        ignoreCase();

        // Verify
        expect(document.body.innerHTML).toEqual(
            /*html*/`<code id="typeans"><span class="typeGood">Indi</span><span class="typeMissed">-</span><br><span id="typearrow">⇩</span><br><span class="typeGood">Indi</span><span class="typeBad">-</span></code>`);
    });

    it("recognizes user-typed hyphens", () => {
        /**
         * User types: A-bc
         * Answer is:  a-bc
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
        ignoreCase();

        // Verify
        expect(document.body.innerHTML).toEqual(
            /*html*/`<code id="typeans"><span class="typeGood">a</span><span class="typeGood">-bc</span></code>`);
    });
})