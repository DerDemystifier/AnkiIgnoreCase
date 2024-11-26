import json
import os
import re  # Added import for regex
import shutil
from typing import Any, Dict

from anki.cards import Card
from aqt import gui_hooks, mw
from aqt.addons import AddonMeta, AddonsDialog

from .globals import (
    ADDON_PATH,
    __addon_config__,
    __config_timestamp__,
    __version__,
    media_collection_dir,
)
from .utils import (
    addScriptTag,
    currentTimestamp,
    delete_all_deps,
    readFile,
    removeScriptTag,
    writeToFile,
)


def addon_script_tag() -> str:
    """
    Generates an HTML script tag for the SmarterTypeField addon.

    The script tag includes the role attribute set to 'smarterTypeField',
    the source file with the version number, and a data-config attribute
    with a configuration timestamp.

    Returns:
        str: A formatted HTML script tag as a string.
    """
    return f"""<script role='smarterTypeField' src="_smarterTypeField.min{__version__}.js" data-config="{__config_timestamp__}"></script>"""


def getConfig() -> dict[str, Any]:
    """
    Retrieve the configuration for the addon.
    This function fetches the configuration settings for the addon from Anki's addon manager.
    If the addon manager is not available, it returns an empty dictionary.

    The configuration is loaded from the addon's configuration file (config.json) if it is not already present
    in the addon manager.
    Additionally, it updates the configuration with the enabled status of the addon.

    Returns:
        dict[str, Any]: A dictionary containing the configuration settings for the addon.
    """
    if not mw:
        return {}

    # Fetch the configuration from the addon manager or load the default from the config file
    config = mw.addonManager.getConfig(__name__) or json.loads(
        readFile(os.path.join(ADDON_PATH, "config.json")) or "{}"
    )

    # Update the configuration with the addon 'enabled' status
    config.update({"enabled": mw.addonManager.isEnabled(__name__)})
    return config


def updateConfigFile(config: Dict[str, Any] = {}) -> tuple[dict[str, Any], str]:
    """
    Updates the configuration file for the SmarterTypeField addon.
    Args:
        config (Dict[str, Any], optional): A dictionary containing the configuration settings.
                                           If not provided, the current configuration will be fetched.
    Returns:
        tuple[dict[str, Any], str]: A tuple containing the updated configuration dictionary and the timestamp
                                    of when the configuration was updated.
    Notes:
        - If the config is not provided, it fetches the current configuration using `getConfig()`.
        - The function updates the config with the addon 'enabled' status.
        - Deletes all dependencies related to the previous configuration.
        - Writes the updated configuration to a file with a timestamp.
        - Writes the timestamp to a separate file named "CONFIG_TIMESTAMP".
    """
    if not mw:
        return (config, "")

    if not config:
        config = getConfig()
    else:
        # If config is provided, just update the 'enabled' status
        config.update({"enabled": mw.addonManager.isEnabled(__name__)})

    timestamp = currentTimestamp()
    delete_all_deps(media_collection_dir, "_smarterTypeField.config")

    # update the configuration file with the new configuration
    writeToFile(
        os.path.join(media_collection_dir, f"_smarterTypeField.config{timestamp}.json"),
        json.dumps(config, indent=4),
    )

    # update the configuration timestamp file so JS can fetch the latest config
    writeToFile(
        os.path.join(ADDON_PATH, "CONFIG_TIMESTAMP"),
        timestamp,
    )

    return (config, timestamp)


def inspectNoteType(note_type: Any, intent: str) -> None:
    """
    Inspects and updates the note type templates based on the presence of type fields and script tags.
    Args:
        note_type (Any): The note type object containing card templates.
        intent (str): The intent of the operation, can be "uninstall" or "install".
    Returns:
        None
    """
    global __addon_config__, __config_timestamp__

    # Get the card templates for the model
    card_types = note_type["tmpls"]

    type_pattern = re.compile(r"{{.*type:.+}}", flags=re.IGNORECASE)
    script_tag = "<script role='smarterTypeField'"

    if not mw or not mw.col:
        return

    updated = False
    for card_type in card_types:
        question_template = card_type["qfmt"]  # Question template
        answer_template = card_type["afmt"]  # Answer template

        if (
            script_tag in answer_template
            and not type_pattern.search(question_template)  # or answer_template, no matter
        ) or intent == "uninstall":
            # if there's no type field anymore in the card or the user wants to uninstall it

            updated = True
            card_type["afmt"] = removeScriptTag(card_type["afmt"])
        elif type_pattern.search(question_template) and (
            __version__ not in answer_template
            or (__config_timestamp__ not in answer_template if __config_timestamp__ else True)
        ):
            # Otherwise, if the type field is present but the script tag is not present or is outdated

            updated = True
            card_type["afmt"] = addScriptTag(card_type["afmt"], addon_script_tag())

    if updated:
        # Update the model in the collection
        mw.col.models.save(note_type)


def inspectAllNoteTypes(intent: str = "install") -> None:
    if not mw or not mw.col:
        return

    # Get the current collection from the main window
    models = mw.col.models.all()
    # Iterate through each model
    for note_type in models:
        inspectNoteType(note_type, intent)


def setupAddon():
    global __config_timestamp__
    if not media_collection_dir:
        return

    # setup Media Folder
    path_js = os.path.join(ADDON_PATH, "_smarterTypeField.min.js")
    filename_save = f"_smarterTypeField.min{__version__}.js"

    # copy file to media folder after deleting all previous versions
    delete_all_deps(media_collection_dir, "_ignoreCase")  # Remove this in later versions
    delete_all_deps(media_collection_dir, "_smarterTypeField.min")
    shutil.copyfile(path_js, os.path.join(media_collection_dir, filename_save))

    __addon_config__, __config_timestamp__ = updateConfigFile()


# Call the function to check for addon update
@gui_hooks.profile_did_open.append
def startupCheck() -> None:
    """Executed whenever a user profile has been opened

    Please note that this hook will also be called on profile switches, so if you
    are looking to simply delay an add-on action in a single-shot manner,
    `main_window_did_init` is likely the more suitable choice.
    """
    global __addon_config__, media_collection_dir
    if not mw or not mw.col:
        return

    media_collection_dir = mw.col.media.dir()

    # Check if either the it's a fresh install or a new version
    if not all(
        (
            __config_timestamp__,  # __config_timestamp__ is None if there's no config file found
            os.path.exists(
                os.path.join(media_collection_dir, f"_smarterTypeField.min{__version__}.js")
            ),
        )
    ):
        setupAddon()

    __addon_config__ = getConfig()

    # Call the function to insert the script tag
    inspectAllNoteTypes()


@gui_hooks.card_will_show.append
def inject_addon_config(html: str, card: Card, kind: str) -> str:
    """
    Can modify card text before review/preview.
    """

    # We need to inject the __addon_config__ into the card template so that the JS can access it
    if not mw or not mw.col or not __addon_config__:
        return html

    # kind is either "reviewQuestion" or "reviewAnswer"
    if kind != "reviewAnswer":
        return html

    js_code = f"""
        window.addon_config = {json.dumps(__addon_config__)};
    """
    # Wrap JS code in script tags
    script_element = f"<script>{js_code}</script>"

    # Prepend script to answer HTML
    new_html = script_element + html

    return new_html


@gui_hooks.addons_dialog_did_change_selected_addon.append
def on_addons_dialog_did_change_selected_addon(dialog: AddonsDialog, addon: AddonMeta) -> None:
    """
    Allows doing an action when a single add-on is selected.

    Args:
        dialog (AddonsDialog): The addons dialog instance.
        addon (AddonMeta): Metadata of the selected addon.
    """
    if not mw or not mw.col:
        return

    global __addon_config__, __config_timestamp__

    if __addon_config__ and __addon_config__.get("enabled") != mw.addonManager.isEnabled(__name__):
        __addon_config__, __config_timestamp__ = updateConfigFile()
        inspectAllNoteTypes()


@gui_hooks.addon_config_editor_will_update_json.append
def on_config_save(config_text: str, addon: str) -> str:
    """
    Triggered when the user saves the configuration of the add-on.\n
    Allows changing the text of the json configuration that was received from the user before actually reading it.\n
    For example, you can replace new line in strings by some "\\\\n".

    Args:
        config_text (str): The JSON text of the configuration.
        addon (str): The name of the add-on being configured.
    Returns:
        str: The original configuration text.
    """
    if not mw or not mw.addonManager or addon != __name__:
        return config_text

    # Update the global __addon_config__ variable with the parsed __addon_config__
    global __addon_config__, __config_timestamp__

    __addon_config__, __config_timestamp__ = updateConfigFile(json.loads(config_text))
    inspectAllNoteTypes()

    return config_text


@gui_hooks.addons_dialog_will_delete_addons.append
def on_addons_dialog_will_delete_addons(dialog: AddonsDialog, addon_ids: list[str]) -> None:
    """
    Allows doing an action when the user deletes one or more add-ons.

    Args:
        dialog (AddonsDialog): The addons dialog instance.
        addon_ids (list[str]): List of add-on IDs that will be deleted.
    """
    if not mw or not mw.col or not media_collection_dir:
        raise Exception("SmarterTypeField: An error occurred while uninstalling the addon.")

    if __name__ in addon_ids:
        inspectAllNoteTypes("uninstall")
        delete_all_deps(media_collection_dir, "_smarterTypeField.min")
