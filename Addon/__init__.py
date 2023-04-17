
import os
import re
from typing import Any

from anki import hooks
# import the main window object (mw) from aqt
from aqt import gui_hooks, mw
from aqt.utils import showInfo

__version__ = "1.0.0"
ignoreCase_scriptTag = """<script role='ignoreCase' src="_ignoreCase.min.js" onerror="var script=document.createElement('script');script.src='https://derdemystifier.github.io/AnkiIgnoreCase/ignoreCase.min.js';document.head.appendChild(script);"></script>"""
addon_path = os.path.join(os.path.dirname(os.path.realpath(__file__)))
# Get the config object for your addon
config = mw.addonManager.getConfig(__name__)


# Check if the addon has been updated
def checkAddonUpdate() -> None:
    # Opening JSON file
    if (not config.get('enabled')):
        inspectAllNoteTypes("uninstall")
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
            card_type['afmt'] = addScriptTag(card_type['afmt'])

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

def addScriptTag(template: str) -> str:
    # This will remove any version of the script tag that is already in the template
    template = removeScriptTag(template)
    template = template + "\n "*10 + ignoreCase_scriptTag
    return template


def removeScriptTag(template: str) -> str:
    # Using regex, remove any old script tag if it exists
    template = re.sub("<script role='ignoreCase'.+script>", "", template, flags=re.IGNORECASE)
    template = template.strip()
    return template


def setup():
    _add_file(os.path.join(addon_path, "_ignoreCase.min.js"), "_ignoreCase.min.js")


def uninstall():
    _add_file(os.path.join(addon_path, "_ignoreCase.min.js"), "_ignoreCase.min.js")


def updateVersion():
    # run the setup function
    setup()
    # create the VERSION file
    with open(os.path.join(addon_path, "VERSION"), "w") as f:
        f.write(__version__)


def _add_file(path: str, filename: str):
    if not os.path.isfile(os.path.join(mw.col.media.dir(), filename)):
        mw.col.media.add_file(path)
    else:
        # remove file
        os.remove(os.path.join(mw.col.media.dir(), filename))
        # add file
        mw.col.media.add_file(path)


# Call the function to check for addon update
gui_hooks.profile_did_open.append(checkAddonUpdate)
