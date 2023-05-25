const { ignoreCases } = require('./ignoreCase.js');
// import { ignoreCases } from './ignoreCase.js';


describe('ignoreCases_function', () => {

    // Tests that the function correctly marks a correct answer with different case as green.
    it("test_ignore_cases_correct_answer_different_case", () => {

        
        // Setup
        document.body.innerHTML = `
            <code id="typeans">
                <span class="typeGood">M</span>
                <span class="typeGood">a</span>
                <span class="typeGood">r</span>
                <span class="typeGood">r</span>
                <span class="typeGood">a</span>
                <span class="typeGood">k</span>
                <span class="typeGood">e</span>
                <span class="typeGood">s</span>
                <span class="typeGood">h</span>
            </code>
            <code id="typeinp">
                <span class="typeGood">m</span>
                <span class="typeGood">A</span>
                <span class="typeGood">r</span>
                <span class="typeGood">r</span>
                <span class="typeGood">a</span>
                <span class="typeGood">k</span>
                <span class="typeGood">e</span>
                <span class="typeGood">S</span>
                <span class="typeGood">H</span>
            </code>
        `;

        // Exercise
        ignoreCases();

        // Verify
        const answerSpans = document.querySelectorAll('code#typeans > span');
        answerSpans.forEach(span => {
            expect(span.classList.contains('typeGood')).toBe(true);
        });
    });
})