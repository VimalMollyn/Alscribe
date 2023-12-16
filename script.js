const textInput = document.getElementById('textInput');
const autocompleteDiv = document.getElementById('autocomplete');
textInput.focus();

textInput.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
        e.preventDefault();
        textInput.innerHTML += autocompleteDiv.innerText;
        autocompleteDiv.innerText = '';
        autocompleteDiv.style.display = 'none';

        // Move cursor to end of text
        const range = document.createRange();
        const selection = window.getSelection();
        range.setStart(textInput, textInput.childNodes.length);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);

    }
});

// load the text from local storage if it exists
var text = localStorage.getItem('text');
if (text) {
    textInput.innerHTML = text;
    console.log('Loaded from local storage');
    
    // Move cursor to end of text
    const range = document.createRange();
    const selection = window.getSelection();
    range.setStart(textInput, textInput.childNodes.length);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
}

// keep saving it to local storage everytime there is a change
textInput.addEventListener('input', function() {
    var text = textInput.innerHTML;
    console.log(`${text}`);
    localStorage.setItem('text', text);
});

// get the api key from a local file 
var apiKey = '';
fetch("api_key.txt")
  .then((res) => res.text())
  .then((text) => {
    console.log(text);
    // remove the newline character
    apiKey = text.trim();
    // remove the newline character
   })
  .catch((e) => console.error(e));

const apiUrl = 'https://api.openai.com/v1/chat/completions'; // Adjust the engine if needed

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${apiKey}`
};

// everytime the user stops typing, send a request to the server
var userIsTyping = false;

async function sendGPTRequest () {
    console.log('Done typing.');
    console.log('Sending to GPT-3...');
    const data = {
      // model: 'gpt-4-1106-preview',
      model: 'gpt-3.5-turbo-1106',
      messages: [
          {"role": "system", "content": "You are a writing assistant. Your task is to finish the sentence. You might need to add a space at the beginning."},
          {"role": "user", "content": textInput.innerText}
      ],
      temperature: 0.7,
      max_tokens: 10 // Adjust as needed
    };

    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify(data)
    };

    console.log(requestOptions);
    console.log(JSON.stringify(data));

    fetch(apiUrl, requestOptions)
      .then(response => response.json())
      .then(data => {
        let gpt_response = data.choices[0].message.content;
        console.log(gpt_response);
        autocompleteDiv.style.display = 'block';
        autocompleteDiv.innerHTML = gpt_response;

        // render the text in light gray and accept the text if the user presses tab 
        // document.getElementById('textInput').value += gpt_response;

        //
        // add the response to the text area and keep the cursor in the same place
        // var textarea = document.getElementById('textInput');
        // var val = textarea.value;
        // var start = textarea.selectionStart;
        // var end = textarea.selectionEnd;
        // textarea.value = val.substring(0, start) + gpt_response + val.substring(end);
        // textarea.selectionStart = textarea.selectionEnd = start + gpt_response.length;
        // textarea.focus();
      })
      .catch(error => {
        // Handle any errors here
        console.error('Error:', error);
      });
}

// everytime the user clicks a button, send a request to the server 
document.getElementById('sendtogpt').addEventListener('click', sendGPTRequest);

let typingTimer;
textInput.addEventListener('input', () => {
    console.log(`${autocompleteDiv.innerHTML}`);
    clearTimeout(typingTimer);
    typingTimer = setTimeout(() => {
        updateAutocompletePosition();
        // Call your backend to get GPT suggestions
        // Display suggestions in autocompleteDiv
    }, 10); // 500 ms delay after user stops typing
    gptTimer = setTimeout(() => {
        sendGPTRequest();
        // Display suggestions in autocompleteDiv
    }, 500); // 500 ms delay after user stops typing
});

function updateAutocompletePosition() {
    const range = window.getSelection().getRangeAt(0);
    const rect = range.getClientRects()[0];
    const scrollLeft = document.documentElement.scrollLeft || document.body.scrollLeft;
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    console.log(rect, range)
    if (rect) {
        autocompleteDiv.innerHTML = '';
        autocompleteDiv.style.display = 'block';
        autocompleteDiv.style.left = `${rect.left + scrollLeft}px`;
        autocompleteDiv.style.top = `${rect.top + scrollTop}px`;
    }
}

