# Genesis - ChatGPT VSCode Extension

This is a Visual Studio Code extension called Genesis which integrates OpenAI's API to help answer questions and generate code right within your editor.

## Features

* Ask questions directly to OpenAI's ChatGPT from your editor
* Responds with code in various languages, according to the context of your current file
* Useful context menu options including "Explain this", "Explain this file", "Refactor this" and "Refactor this file"
* GPT-3 responses adapted to the selected language
* Customizable settings to choose from different AI models

## How to use

1. Install the Genesis extension on your Visual Studio Code.
2. Open a file and write code in your language of choice.
3. Press `Cmd + Shift + A` (Mac) or `Ctrl + Shift + A` (Windows/Linux) to activate the extension. Alternatively, right-click to access "Explain this", "Explain this file", "Refactor this", and "Refactor this file" options.
4. In the input box that appears at the top, type in the question you'd like to ask ChatGPT. For example, you might ask it to "create a function that adds two numbers".
5. Press `Enter` to send your question. ChatGPT will respond with suitable code for your question, which will be inserted at your current position in the editor.

## Settings

There are a few settings you can adjust to customize the behavior of the extension:

* `genesis.model`: Sets the ChatGPT model to be used. Default value is 'gpt-3.5-turbo', but you can also choose 'gpt-4'.
* `genesis.alwaysAskModel`: If set to true, will always ask which model to use each time you activate the extension. Default value is false.
* `genesis.language`: Sets the default language for system messages. Default value is 'en' for English.
* `extension.openAIKey`: This is where you need to input your OpenAI API Key.

To access these settings, go to `File > Preferences > Settings` and search for 'Genesis'.

## Conclusion

The Genesis VSCode extension lets you integrate OpenAI's powerful artificial intelligence right into your coding environment, making it easier to generate code and get answers to your coding questions. Enjoy a new way of programming with the help of AI!

## Contributions

Contributions, feature suggestions, and bug reports are welcome! Please open an issue on the [GitHub repository](https://github.com/giovannicocco/genesis/issues).

## License

The Genesis extension is licensed under the [MIT license](https://github.com/giovannicocco/genesis/blob/main/LICENSE).

Note: This software is licensed under the MIT License. If you use, modify, or distribute this software, please retain the original copyright notice and this permission notice.