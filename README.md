# <div align="center">AnkiIgnoreCase</div>
## <div align="center">Case insensitivity for `{type:}` field</div>



<p align="center">
    <img src="https://user-images.githubusercontent.com/124774256/221641621-398786be-3589-491e-84fa-3c605af4e61d.png">
</p>

### <div align="center" style="font-size:2em;">⏬🔽⏬</div>

<p align="center">
    <img src="https://user-images.githubusercontent.com/124774256/221641707-6180aeac-91a7-47e8-86ee-b009d5c62dc0.png">
</p>

Simply makes `{type:}` answers case insensitive.


## FAQ

### How do I use this in my cards?

>Simply add this line to the Back Template of your Anki Cards.
>
>```html
><script src="https://derdemystifier.github.io/AnkiIgnoreCase/ignoreCase.min.js"></script>
>```

### I want this to work even when I don't have Internet Access.

>Since the script tag above fetches the script, you need Internet. If that's not always available, then:
>1. Copy the content of the file [`ignoreCase.min.js`](https://derdemystifier.github.io/AnkiIgnoreCase/ignoreCase.min.js).
>2. Paste it in the Back Template of your Anki card like so:
>```html
><script>
>(()=>{"use strict";!function() ....etc.....
></script>
>```

### What the Heck is the "Back Template" of my Anki Cards?

>The Back Template is the other side of the flashcard, it's the code that's rendered when you show the answer. 
>![](https://user-images.githubusercontent.com/124774256/221641761-32b6d22f-2508-465a-bf50-c29f90e7df5c.png)

### How do I get to this "Back Template"?

>1. Click `Tools` in the Anki Toolbar.
>2. Select the Card that has the `{type:}` fields.
>3. Click `Cards` button on the right.
>4. TA DAAAAAA!

### How does this work?

>As you would think, simply compares your input with the answer without matching case. So ANKI ↔ Anki.

### Does this work in Anki Version 2.x.xx

>I've tested on Anki Version 2.1.48. I would assume it to be working in later versions as well. If not, please open a support ticket above, labeled _Issues_.

### Why didn't you simply write an add-on for this?

>Addons aren't available for AnkiDroid, also I don't feel like investing considerable time learning how to write Anki Addons for something so small.