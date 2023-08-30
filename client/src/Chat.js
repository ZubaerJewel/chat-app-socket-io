
// import React, { useEffect, useState } from "react";
// import ScrollToBottom from "react-scroll-to-bottom";

// function Chat({ socket, username, room, notification, setNotification }) {
//   const [currentMessage, setCurrentMessage] = useState("");
//   const [messageList, setMessageList] = useState([]); // Declare setMessageList here

//   const sendMessage = async () => {
//     if (currentMessage !== "") {
//       const messageData = {
//         room: room,
//         author: username,
//         message: currentMessage,
//         time:
//           new Date(Date.now()).getHours() +
//           ":" +
//           new Date(Date.now()).getMinutes(),
//       };

//       await socket.emit("send_message", messageData);
//       setMessageList((list) => [...list, messageData]);
//       setCurrentMessage("");
//     }
//   };

//   useEffect(() => {
//     socket.on("receive_message", (data) => {
//       setMessageList((list) => [...list, data]);
      
//       if (data.author !== username) {
//         setNotification(true);
//       }
//     });
//   }, [socket, username]);

//   return (
//         <div className="chat-window">
//           <div className="chat-header">
//             <p>Live Chat</p>
//           </div>
//           <div className="chat-body">
//             <ScrollToBottom className="message-container">
//               {messageList.map((messageContent) => {
//                 return (
//                   <div
//                     className="message"
//                     id={username === messageContent.author ? "you" : "other"}
//                   >
//                     <div>
//                       <div className="message-content">
//                         <p>{messageContent.message}</p>
//                       </div>
//                       <div className="message-meta">
//                         <p id="time">{messageContent.time}</p>
//                         <p id="author">{messageContent.author}</p>
//                       </div>
//                     </div>
//                   </div>
//                 );
//               })}
//             </ScrollToBottom>
//           </div>
//           <div className="chat-footer">
//             <input
//               type="text"
//               value={currentMessage}
//               placeholder="Hey..."
//               onChange={(event) => {
//                 setCurrentMessage(event.target.value);
//               }}
//               onKeyPress={(event) => {
//                 event.key === "Enter" && sendMessage();
//               }}
//             />
//             <button onClick={sendMessage}>&#9658;</button>
//           </div>
//         </div>
//       );
// }

// export default Chat;
// Chat.js
import React, { useEffect, useState } from "react";
import ScrollToBottom from "react-scroll-to-bottom";

function Chat({ socket, username, room, notification, setNotification }) {
  const [currentMessage, setCurrentMessage] = useState("");
  const [messageList, setMessageList] = useState([]);
  const [conversation, setConversation] = useState([]); // New state for conversation history

  const sendMessage = async () => {
    if (currentMessage !== "") {
      const messageData = {
        room: room,
        author: username,
        message: currentMessage,
        time:
          new Date(Date.now()).getHours() +
          ":" +
          new Date(Date.now()).getMinutes(),
      };
     
      await socket.emit("send_message", messageData);
      setMessageList((list) => [...list, messageData]);
      setCurrentMessage("");
      socket.emit("get_conversation", room);
    }
  };

  const loadConversation = () => {
    socket.emit("get_conversation", room); // Request previous conversation
  };

  useEffect(() => {
    socket.on("receive_message", (data) => {
      setMessageList((list) => [...list, data]);

      if (data.author !== username) {
        setNotification(true);
      }
    });

    // Listen for previous_conversation event from server
    socket.on("previous_conversation", (data) => {
      setConversation(data);
    });

    // Clean up listeners on component unmount
    return () => {
      socket.off("receive_message");
      socket.off("previous_conversation");
    };
  }, [socket, username]);

  return (
    <div className="chat-window">
      <div className="chat-header">
        <p>Live Chat</p>
        {notification && <span>New Message!</span>}
      </div>
      <div className="chat-body">
        <ScrollToBottom className="message-container">
          {/* Render the conversation history */}
          {conversation.map((messageContent, index) => (
            <div
              className="message"
              id={username === messageContent.author ? "you" : "other"}
              key={index}
            >
              <div>
                <div className="message-content">
                  <p>{messageContent.message}</p>
                </div>
                <div className="message-meta">
                  <p id="time">{messageContent.time}</p>
                  <p id="author">{messageContent.author}</p>
                </div>
              </div>
            </div>
          ))}
        </ScrollToBottom>
      </div>
      <div className="chat-footer">
        <input
          type="text"
          value={currentMessage}
          placeholder="Hey..."
          onChange={(event) => {
            setCurrentMessage(event.target.value);
          }}
          onKeyPress={(event) => {
            event.key === "Enter" && sendMessage();
          }}
        />
        <button onClick={sendMessage}>&#9658;</button>
        {/* <button onClick={loadConversation}>Load Previous Conversation</button> */}
      </div>
    </div>
  );
}

export default Chat;
