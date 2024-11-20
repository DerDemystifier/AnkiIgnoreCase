import { compareInputToAnswer } from './utils.mjs';

const addon_config = window.addon_config;

if (addon_config.enabled) compareInputToAnswer(addon_config);
