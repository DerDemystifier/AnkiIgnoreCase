import os
import time
from typing import Any, Union

from aqt import mw

from .utils import readFile, writeToFile, currentTimestamp

ADDON_PATH = os.path.join(os.path.dirname(os.path.realpath(__file__)))

VERSION_FILE = os.path.join(ADDON_PATH, "VERSION")
CONFIG_TIMESTAMP_FILE = os.path.join(ADDON_PATH, "CONFIG_TIMESTAMP")


def updateVersionFile() -> None:
    writeToFile(VERSION_FILE, currentTimestamp())


updateVersionFile()

media_collection_dir = None
if mw and mw.col:
    media_collection_dir = mw.col.media.dir()


__version__: Union[str, None] = readFile(VERSION_FILE)
__config_timestamp__: Union[str, None] = readFile(CONFIG_TIMESTAMP_FILE)

__addon_config__: Union[dict[str, Any], None] = None
