import * as vscode from 'vscode';
import axios from 'axios';

function limitInput(input: string, maxWords: number): string {
    let words = input.split(/\s+/g); // split on whitespace
    if (words.length > maxWords) {
        words = words.slice(0, maxWords);
        return words.join(' ');
    } else {
        return input;
    }
}

export function activate(context: vscode.ExtensionContext) {
    const outputChannel = vscode.window.createOutputChannel('ChatGPT');
    const explainPrefix = 'Can you explain this code:\n';
    const refactorPrefix = 'Can you refactor the following code to be more efficient:\n';

    type LanguageMessages = {
        [key in 'English' | 'Spanish' | 'French' | 'German' | 'Italian' | 'Portuguese']: {
            explain: string;
            refactor: string;
        };
    };

    const systemMessages: LanguageMessages = {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'English': {
            'explain': 'Can you explain this code:\n',
            'refactor': 'Can you refactor the following code to be more efficient:\n'
        },
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'Spanish': {
            'explain': '¿Puedes explicar este código:\n',
            'refactor': '¿Puedes refactorizar el siguiente código para que sea más eficiente:\n'
        },
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'French': {
            'explain': 'Pouvez-vous expliquer ce code:\n',
            'refactor': 'Pouvez-vous refactoriser le code suivant pour qu\'il soit plus efficace:\n'
        },
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'German': {
            'explain': 'Können Sie diesen Code erklären:\n',
            'refactor': 'Können Sie den folgenden Code effizienter gestalten:\n'
        },
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'Italian': {
            'explain': 'Puoi spiegare questo codice:\n',
            'refactor': 'Puoi rendere più efficiente il seguente codice:\n'
        },
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'Portuguese': {
            'explain': 'Você pode explicar este código:\n',
            'refactor': 'Você pode refatorar o seguinte código para ser mais eficiente:\n'
        }
    };

    context.subscriptions.push(vscode.commands.registerCommand('extension.chatgpt.ask', async () => {
        let model = vscode.workspace.getConfiguration().get('extension.model') as string;
    
        const alwaysAskModel = vscode.workspace.getConfiguration().get('extension.alwaysAskModel') as boolean;
        if (alwaysAskModel) {
            const models = ['gpt-3.5-turbo', 'gpt-4'];
            model = await vscode.window.showQuickPick(models, {
                placeHolder: 'Select a model',
            }) as string;
    
            if (!model) {
                return;
            }
        }
    
        const language = vscode.workspace.getConfiguration().get('extension.language') as keyof typeof systemMessages;
    
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            // Get the language ID of the current document
            const languageId = editor.document.languageId;
    
            // Get the question from the user
            const question = await vscode.window.showInputBox({ prompt: 'What do you want to ask GPT-3?' });
            if (question) {
                // Append the language ID and the prompt for code to the question
                const fullQuestion = `${question} (reply with code only) - ${languageId}`;
                let response = await chatWithGPT(fullQuestion, model);
    
                // Remove the first and last lines which are Markdown code block annotations
                const lines = response.split('\n');
                const code = lines.slice(1, lines.length - 1).join('\n');
    
                const position = editor.selection.active;  // This is a position at the end of the current line
                editor.edit(editBuilder => {
                    editBuilder.insert(position, '\n' + code);
                });
            }
        }
    }));
    
    context.subscriptions.push(vscode.commands.registerCommand('extension.chatgpt.activateAI', () => {
        vscode.commands.executeCommand('extension.chatgpt.ask');
    }));
    
    context.subscriptions.push(vscode.commands.registerCommand('extension.chatgpt.explainSelection', async () => {
        const alwaysAskModel = vscode.workspace.getConfiguration().get('extension.alwaysAskModel') as boolean;
        let model = vscode.workspace.getConfiguration().get('extension.model') as string;
    
        if (alwaysAskModel) {
            const models = ['gpt-3.5-turbo', 'gpt-4'];
            const selectedModel = await vscode.window.showQuickPick(models, {
                placeHolder: 'Select a model',
            });
    
            if (selectedModel) {
                model = selectedModel;
            } else {
                // The user did not select a model, cancel the operation.
                return;
            }
        }
    
        const language = vscode.workspace.getConfiguration().get('extension.language') as keyof LanguageMessages; // Get language from settings
    
        if (!model || !language) {
            // The user did not select a model, cancel the operation.
            return;
        }
    
        const editor = vscode.window.activeTextEditor;
    
        if (editor) {
            const document = editor.document;
            const selection = editor.selection;
            let selectedText = document.getText(selection);
    
            // limit the input
            selectedText = limitInput(selectedText, 750);
    
            const prefix = systemMessages[language].explain; // Get the correct prefix based on language
            let response = await chatWithGPT(prefix + selectedText, model);
    
            outputChannel.appendLine('***************');
            outputChannel.appendLine(response);
            outputChannel.appendLine('***************');
            outputChannel.show(true);
        }
    }));           
    
    context.subscriptions.push(vscode.commands.registerCommand('extension.chatgpt.refactorSelection', async () => {
        const alwaysAskModel = vscode.workspace.getConfiguration().get('extension.alwaysAskModel') as boolean;
        let model = vscode.workspace.getConfiguration().get('extension.model') as string;
    
        if (alwaysAskModel) {
            const models = ['gpt-3.5-turbo', 'gpt-4'];
            const selectedModel = await vscode.window.showQuickPick(models, {
                placeHolder: 'Select a model',
            });
    
            if (selectedModel) {
                model = selectedModel;
            } else {
                // The user did not select a model, cancel the operation.
                return;
            }
        }
    
        const language = vscode.workspace.getConfiguration().get('extension.language') as keyof LanguageMessages;
    
        if (!model || !language) {
            // The user did not select a model, cancel the operation.
            return;
        }
    
        const editor = vscode.window.activeTextEditor;
    
        if (editor) {
            const document = editor.document;
            const selection = editor.selection;
            let selectedText = document.getText(selection);
    
            // limit the input
            selectedText = limitInput(selectedText, 750);
    
            const prefix = systemMessages[language].refactor; // Get the correct prefix based on language
            let response = await chatWithGPT(prefix + selectedText, model);
    
            outputChannel.appendLine('***************');
            outputChannel.appendLine(response);
            outputChannel.appendLine('***************');
            outputChannel.show(true);
        }
    }));
    
    context.subscriptions.push(vscode.commands.registerCommand('extension.chatgpt.refactorFile', async () => {
        const alwaysAskModel = vscode.workspace.getConfiguration().get('extension.alwaysAskModel') as boolean;
        let model = vscode.workspace.getConfiguration().get('extension.model') as string;
    
        if (alwaysAskModel) {
            const models = ['gpt-3.5-turbo', 'gpt-4'];
            const selectedModel = await vscode.window.showQuickPick(models, {
                placeHolder: 'Select a model',
            });
    
            if (selectedModel) {
                model = selectedModel;
            } else {
                // The user did not select a model, cancel the operation.
                return;
            }
        }
    
        const language = vscode.workspace.getConfiguration().get('extension.language') as keyof LanguageMessages;
    
        if (!model || !language) {
            // The user did not select a model, cancel the operation.
            return;
        }
    
        const editor = vscode.window.activeTextEditor;
    
        if (editor) {
            const document = editor.document;
            let fileContent = document.getText();
    
            // limit the input
            fileContent = limitInput(fileContent, 750);
    
            const prefix = systemMessages[language].refactor; // Get the correct prefix based on language
            let response = await chatWithGPT(prefix + fileContent, model);
    
            outputChannel.appendLine('***************');
            outputChannel.appendLine(response);
            outputChannel.appendLine('***************');
            outputChannel.show(true);
        }
    }));    
    
}

async function chatWithGPT(message: string, model: string) {
    return vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: "Communicating with ChatGPT...",
        cancellable: false
    }, async (progress, token) => {
        progress.report({ increment: 0 });

        console.log('About to make a request to ChatGPT');
        const openAIKey = vscode.workspace.getConfiguration().get('extension.openAIKey'); // Get API Key from settings
        console.log('OpenAI API Key:', openAIKey); // Log API Key to check if it's undefined

        try {
            let response = await axios.post('https://api.openai.com/v1/chat/completions', {
                model: model,
                messages: [
                    { "role": "system", "content": "You are a helpful developer." },
                    { "role": "user", "content": message }
                ]
            }, {
                headers: {
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    'Content-Type': 'application/json',
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    'Authorization': `Bearer ${openAIKey}`
                }            
            });

            console.log('Received response from ChatGPT:', response.data);

            if (response.data.choices && response.data.choices[0]) {
                return response.data.choices[0].message.content.trim();
            } else {
                throw new Error('No choices in response from GPT-3');
            }
        } catch (error: any) {
            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                console.log(error.response.data);
                console.log(error.response.status);
                console.log(error.response.headers);
            } else if (error.request) {
                // The request was made but no response was received
                console.log(error.request);
            } else {
                // Something happened in setting up the request that triggered an Error
                console.log('Error', error.message);
            }
            console.log(error.config);
        }
    });
}
