import os
import re


def delete_all_deps(path: str, prefix: str):
    """Delete all files in a directory that start with a prefix

    Args:
        path (str): the path to the directory
        prefix (str): the prefix of the files to delete
    """
    for file in os.listdir(path):
        if file.startswith(prefix):
            os.remove(os.path.join(path, file))


def addScriptTag(template: str, script_tag: str) -> str:
    """Add a script tag to the end of a template

    Args:
        template (str): the template to add the script tag to
        script_tag (str): the script tag to add

    Returns:
        str: the template with the script tag added
    """
    # This will remove any version of the script tag that is already in the template
    template = removeScriptTag(template)
    template = template + "\n "*10 + script_tag
    return template


def removeScriptTag(template: str) -> str:
    # Using regex, remove any old script tag if it exists
    template = re.sub("<script role='ignoreCase'.+script>", "", template, flags=re.IGNORECASE)
    template = template.strip()
    return template
