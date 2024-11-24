import os
import re
import time
from typing import Optional


def delete_all_deps(path: str, prefix: str = ""):
    """
    Deletes all files in the specified directory that start with the given prefix.

    Args:
        path (str): The directory path where the files are located.
        prefix (str, optional): The prefix to match files. Defaults to an empty string, which matches all files.

    Raises:
        FileNotFoundError: If the specified directory does not exist.
        PermissionError: If the program does not have permission to delete a file.
    """
    for file in os.listdir(path):
        if file.startswith(prefix):
            os.remove(os.path.join(path, file))


def addScriptTag(template: str, script_tag: str) -> str:
    # This will remove any version of the script tag that is already in the template
    template = removeScriptTag(template)
    template = template + "\n " * 10 + script_tag
    return template


def removeScriptTag(template: str) -> str:
    # Using regex, remove any old script tag if it exists
    template = re.sub(
        "<script role='ignoreCase'.+script>", "", template, flags=re.IGNORECASE
    )  # Remove this in later versions
    template = re.sub("<script role='smarterTypeField'.+script>", "", template, flags=re.IGNORECASE)
    template = template.strip()
    return template


def currentTimestamp() -> str:
    return time.strftime("%Y-%m-%d_%H-%M-%S")


def readFile(path: str) -> Optional[str]:
    if not os.path.exists(path):
        return None

    with open(path) as file:
        return file.read()


def writeToFile(path: str, content: str) -> None:
    with open(path, "w") as f:
        f.write(content)
