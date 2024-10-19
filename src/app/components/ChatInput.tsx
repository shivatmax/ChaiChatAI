// import React, { useState } from 'react';
// import { Button } from './ui/button';
// import { Input } from './ui/input';

// interface ChatInputProps {
//   onSendMessage: (message: string) => void;
// }

// const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage }) => {
//   const [inputMessage, setInputMessage] = useState('');

//   const handleSendMessage = () => {
//     if (inputMessage.trim() !== '') {
//       onSendMessage(inputMessage);
//       setInputMessage('');
//     }
//   };

//   const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
//     if (e.key === 'Enter') {
//       handleSendMessage();
//     }
//   };

//   return (
//     <div className='p-4 bg-gray-100'>
//       <div className='flex items-center'>
//         <Input
//           type='text'
//           placeholder='Type your message...'
//           value={inputMessage}
//           onChange={(e) => setInputMessage(e.target.value)}
//           onKeyPress={handleKeyPress}
//           className='flex-grow mr-2'
//         />
//         <Button onClick={handleSendMessage}>Send</Button>
//       </div>
//     </div>
//   );
// };

// export default ChatInput;
