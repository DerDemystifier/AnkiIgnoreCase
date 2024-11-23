import { compareInputToAnswer } from './utils.mjs';

fetch('_smarterTypeField.config.json')
    .then((response) => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then((addon_config) => {
        if (addon_config.enabled) compareInputToAnswer(addon_config);
    })
    .catch((error) => {
        // Default config if fetch fails
        addon_config = { ignore_case: true, ignore_accents: false, ignore_punctuations: false };
        compareInputToAnswer(addon_config);
        console.error('There has been a problem with your fetch operation:', error);
    });
