
import os
import shutil
from typing import Any

# import the main window object (mw) from aqt
from aqt import gui_hooks, mw

from .utils import addScriptTag, delete_all_deps, removeScriptTag


__version__ = "1.1.0"

ignoreCase_scriptTag = f"""<script role='ignoreCase' src="_ignoreCase_lt55.min{__version__}.js" onerror="var script=document.createElement('script');script.src='https://derdemystifier.github.io/AnkiIgnoreCase/ignoreCase_lt55.min.js';document.head.appendChild(script);"></script>"""

addon_path = os.path.join(os.path.dirname(os.path.realpath(__file__)))


# Get the config object for your addon
config = mw.addonManager.getConfig(__name__)

media_collection_dir = None


def inspectNoteType(note_type: Any, intent: str):
    # Get the card templates for the model
    card_types = note_type['tmpls']

    updated = False
    for card_type in card_types:
        question_template = card_type['qfmt']
        answer_template = card_type['afmt']
        # if there's no type field anymore or the user wants to uninstall it
        if ("{{type:" not in question_template and ignoreCase_scriptTag in answer_template) or intent == "uninstall":
            updated = True
            card_type['afmt'] = removeScriptTag(card_type['afmt'])
        elif "{{type:" in question_template and ignoreCase_scriptTag not in answer_template:
            updated = True
            card_type['afmt'] = addScriptTag(card_type['afmt'], ignoreCase_scriptTag)

    if updated:
        # Update the model in the collection
        mw.col.models.save(note_type)


def inspectAllNoteTypes(intent: str = "install") -> None:
    # Get the current collection from the main window
    models = mw.col.models.all()
    # Iterate through each model
    for note_type in models:
        inspectNoteType(note_type, intent)


def startupCheck() -> None:
    global media_collection_dir

    media_collection_dir = mw.col.media.dir()
    # Opening JSON config
    if (not config.get('enabled')):
        inspectAllNoteTypes("uninstall")
        delete_all_deps(media_collection_dir, "_ignoreCase")
        return

    if not all((
        os.path.exists(os.path.join(addon_path, "VERSION")),
        os.path.exists(os.path.join(media_collection_dir, f"_ignoreCase_lt55.min{__version__}.js"))
    )):
        setupAddon()

    # Call the function to insert the script tag
    inspectAllNoteTypes()


def setupAddon():
    # setup Media Folder
    path_js = os.path.join(addon_path, "_ignoreCase_lt55.min.js")
    filename_save = f"_ignoreCase_lt55.min{__version__}.js"
    # copy file to media folder after deleting all previous versions
    delete_all_deps(media_collection_dir, "_ignoreCase")
    shutil.copyfile(path_js, os.path.join(media_collection_dir, filename_save))

    # create or replace the VERSION file
    with open(os.path.join(addon_path, "VERSION"), "w") as f:
        f.write(__version__)


# Call the function to check for addon update
gui_hooks.profile_did_open.append(startupCheck)
