import {fromEvent, map, tap, merge, shareReplay} from "rxjs";
import {serverMessages$, sendMessage} from "./connection";

const form = document.getElementById("form")!;
const userMessages$ = fromEvent<FormDataEvent>(form, 'submit').pipe(
    // First, prevent the default form submission behavior
    tap((e: Event) => {
      e.preventDefault();
      console.log('Form submission prevented.');
    }),
  
    // Extract the message from the input field
    map((e: Event) => {
        const messageInput: HTMLInputElement = ((e.currentTarget as HTMLFormElement).querySelector('input[name="message"]')!);
        const message = messageInput.value;
        messageInput.value = ""; /*Note: this is a side-effect!*/
        return message;
    }),
  
    // Add additional context to the message (time, action)
    map((message: string): Message => {
      return {
        data: message,
        action: 'sent',
        timestamp: new Date()
      };
    }),
    
    shareReplay(),

  );
  
userMessages$.subscribe(message => {
    sendMessage(message);
    console.log(message);
});

const messages$ = merge(userMessages$, serverMessages$);

messages$.subscribe((message:Message) => {
    console.log("message", message)
    const newMessage = document.createElement("li");
    newMessage.innerHTML = 
    `<div>
        <p class="message-text">${message.data}</p>
        <p class="message-date">${message.action} ${new Date(message.timestamp).toLocaleString()}</p>
    </div>`;
    newMessage.classList.add(message.action);
    document.getElementById("messages")!.appendChild(newMessage);
});







