<h1 align="center">
	SmarterTypeField
</h1>
<h2 align="center">
	Flexible matching for <code>{{type:}}</code> field
</h2>




<p align="center">
    <img src="https://user-images.githubusercontent.com/124774256/221641621-398786be-3589-491e-84fa-3c605af4e61d.png">
</p>

<h3 align="center" style="font-size:2em;">⏬🔽⏬</h3>

<p align="center">
    <img src="https://user-images.githubusercontent.com/124774256/221641707-6180aeac-91a7-47e8-86ee-b009d5c62dc0.png">
</p>

Adds three options to the `{{type:}}` field in Anki.
- `ignore_case` makes the type field ignore case when checking the answer.
- `ignore_accents` allows the type field to disregard accents when checking the answer.
- `ignore_punctuations` makes the type field ignore punctuation marks when checking the answer.
The options can be used together or separately.

## Installation

- #### Automatic install

Simply install [the addon](https://ankiweb.net/shared/info/1371444066) on your AnkiDesktop. The changes made by the addon will apply to both **AnkiDesktop** and **AnkiDroid**.

- #### Manual install

Simply add this line to the Back Template of your Anki Cards.

```html
<script src="https://derdemystifier.github.io/SmarterTypeField/smarterTypeField.min.js"></script>
```



## FAQ

### I want this to work even when I don't have Internet Access.

>If you install the addon. This will apply even when you don't have Internet access. But it won't if you chose manual install; Since the script tag above fetches the script, you will need Internet access. If that's not always available, then:
>1. Copy the content of the file [`smarterTypeField.min.js`](https://derdemystifier.github.io/SmarterTypeField/smarterTypeField.min.js).
>2. Paste it in the Back Template of your Anki card like so:
>```html
><script>
>(()=>{"use strict";!function() ....etc.....
></script>
>```
> _↑ OR ↓_
> 1. Save the content of the file [`smarterTypeField.min.js`](https://derdemystifier.github.io/SmarterTypeField/smarterTypeField.min.js) in the `collection.media` folder as `_smarterTypeField.min.js`.
> 2. Paste this HTML tag in the Back Template of your Anki card like so:
> ```html
> <script role='smarterTypeField' src="_smarterTypeField.min.js"></script>
> ```

### What the Heck is the "Back Template" of my Anki Cards?

>The Back Template is the other side of the flashcard, it's the code that's rendered when you show the answer.
>![](https://user-images.githubusercontent.com/124774256/221641761-32b6d22f-2508-465a-bf50-c29f90e7df5c.png)

### How do I get to this "Back Template"?

>1. Click `Tools` in the Anki Toolbar.
>2. Select the Card that has the `{{type:}}` fields.
>3. Click `Cards` button on the right.
>4. TA DAAAAAA!

### How does this work?

>As you would think, simply compares your input with the answer without matching case and/or accents. So ANKI = Anki. Technically speaking, it injects a script tag to your card templates that have a `{{type:}}` field. It doesn't touch any existing code in the template. The script enables the addon to work both on AnkiDesktop and AnkiDroid.

### How to uninstall?

>Go to Addons->SmarterTypeField->Click "delete addon". This will also automatically clean up the script tag from your cards.
> If you had opted for manual install, then you need to manually uninstall it by retracing manual installation the steps. Basically, delete the `<script>` tag from your card(s).

### Does this work in Anki Version 2.x.xx

>I've tested on Anki Version 2.1.48 and Version 2.1.63. I would assume it to be working in later versions as well. If not, please open a support ticket above, labelled _Issues_.
