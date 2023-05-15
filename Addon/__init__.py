
import os
import re
import shutil
from typing import Any

from anki import hooks
# import the main window object (mw) from aqt
from aqt import gui_hooks, mw
from aqt.utils import showInfo

from .utils import addScriptTag, delete_all_deps, removeScriptTag


__version__ = "1.0.0"

ignoreCase_scriptTag = f"""<script role='ignoreCase' src="_ignoreCase.min{__version__}.js" onerror="var script=document.createElement('script');script.src='https://derdemystifier.github.io/AnkiIgnoreCase/ignoreCase.min.js';document.head.appendChild(script);"></script>"""

addon_path = os.path.join(os.path.dirname(os.path.realpath(__file__)))


# Get the config object for your addon
config = mw.addonManager.getConfig(__name__)

media_collection_dir = None


# Check if the addon has been updated
def checkAddonUpdate() -> None:
    global media_collection_dir

    media_collection_dir = mw.col.media.dir()
    # Opening JSON file
    if (not config.get('enabled')):
        inspectAllNoteTypes("uninstall")
        delete_all_deps(media_collection_dir, "_ignoreCase")
        return

    if not os.path.exists(os.path.join(addon_path, "VERSION")):
        updateVersion()
    else:
        # read the VERSION file
        with open(os.path.join(addon_path, "VERSION"), "r") as f:
            version = f.read()
        # if the version in the file is different from the current version
        if version != __version__:
            updateVersion()

    # Call the function to insert the script tag
    inspectAllNoteTypes()


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


# def inspectCurrentNote(model: Any):
#     note_type = mw.col.models.byName(model.note_type()['name'])
#     # Get the card templates for the model
#     card_types = note_type['tmpls']

#     updated = False
#     for card_type in card_types:
#         question_template = card_type['qfmt']
#         answer_template = card_type['afmt']
#         if "{{type:" in question_template and ignoreCase_scriptTag not in answer_template:
#             updated = True
#             card_type['afmt'] = addScriptTag(card_type['afmt'])
#         elif "{{type:" not in question_template and ignoreCase_scriptTag in answer_template:
#             updated = True
#             card_type['afmt'] = removeScriptTag(card_type['afmt'])

#     if updated:
#         # Update the model in the collection
#         mw.col.models.save(note_type)


# hooks.note_will_flush.append(inspectCurrentNote)


def setup():
    path = os.path.join(addon_path, "_ignoreCase.min.js")
    filename = f"_ignoreCase.min{__version__}.js"

    # copy file to media folder after deleting all previous versions
    delete_all_deps(media_collection_dir, "_ignoreCase")
    shutil.copyfile(path, os.path.join(media_collection_dir, filename))


def updateVersion():
    # run the setup function
    setup()
    # create the VERSION file
    with open(os.path.join(addon_path, "VERSION"), "w") as f:
        f.write(__version__)


# Call the function to check for addon update
gui_hooks.profile_did_open.append(checkAddonUpdate)
