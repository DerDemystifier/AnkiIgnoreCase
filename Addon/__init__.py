
import os
import re

# import the main window object (mw) from aqt
from aqt import gui_hooks, mw

__version__ = "1.0.0"
ignoreCase_scriptTag = """<script role='ignoreCase' src="_ignoreCase.min.js" onerror="var script=document.createElement('script');script.src='https://derdemystifier.github.io/AnkiIgnoreCase/ignoreCase.min.js';document.head.appendChild(script);"></script>"""
addon_path = os.path.join(os.path.dirname(os.path.realpath(__file__)))


# Check if the addon has been updated
def checkAddonUpdate() -> None:
    if not os.path.exists(os.path.join(addon_path, "VERSION")):
        updateVersion()
    else:
        # read the VERSION file
        with open(os.path.join(addon_path, "VERSION"), "r") as f:
            version = f.read()
        # if the version in the file is different from the current version
        if version != __version__:
            updateVersion()


# Call the function to check for addon update
gui_hooks.profile_did_open.append(checkAddonUpdate)


def insertScriptTag() -> None:
    # Get the current collection from the main window
    notes = mw.col.models.all()
    # Iterate through each model
    for note in notes:
        # Get the card templates for the model
        cards = note['tmpls']

        updated = False
        for card in cards:
            res = check4TypeField(card['afmt'])
            # updated or res[0] means that if updated is already True, then it will stay True
            updated, card['afmt'] = updated or res[0], res[1]

        # if updated is True, then the model has been updated
        if updated:
            # Update the model in the collection
            mw.col.models.save(note)


# Call the function to insert the script tag
gui_hooks.profile_did_open.append(insertScriptTag)


def check4TypeField(template: str) -> bool:
    if "{{type:" in template and ignoreCase_scriptTag not in template:
        # Using regex, remove old script tag if it exists
        template = re.sub("<script role='ignoreCase'.+script>", "", template, flags=re.IGNORECASE)
        template = f"{ignoreCase_scriptTag}\n\n" + template
        return True, template
    return False, template


def setup():
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
