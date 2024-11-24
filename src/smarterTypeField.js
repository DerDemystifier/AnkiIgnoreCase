import { compareInputToAnswer } from './utils.mjs';

if (window.addon_config) {
    if (window.addon_config.enabled) compareInputToAnswer(addon_config);
} else {
    // grab data-config attached to the script tag
    const script = document.currentScript;
    const config_timestamp = script.getAttribute('data-config');

    fetch(`_smarterTypeField.config${config_timestamp}.json`)
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
}
