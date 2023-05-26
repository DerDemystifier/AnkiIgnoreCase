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


    it("trims added -- at the end of entry", () => {
        // Setup
        document.body.innerHTML =
        /*html*/`<code id="typeans">
                    <span class="typeGood">Ykjav</span><span class="typeBad">ic</span>
                    <br /><span id="typearrow">↓</span><br />
                    <span class="typeGood">Reykjav</span><span class="typeMissed">ík</span>
                </code>`;

        // Exercise
        ignoreCase();

        // Verify
        expect(document.body.innerHTML).toEqual(/*html*/`<code id="typeans"><span class="typeMissed">-</span><span class="typeMissed">-</span><span class="typeGood">Ykjav</span><span class="typeBad">ic</span><br><span id="typearrow">⇩</span><br><span class="typeBad">Re</span><span class="typeGood">ykjav</span><span class="typeBad">ík</span></code>`);
    });
})