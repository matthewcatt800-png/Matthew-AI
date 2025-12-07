import React from 'react';
import { Message, Role } from '../types';

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === Role.USER;

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-6`}>
      <div
        className={`
          max-w-[85%] md:max-w-[70%] px-5 py-3.5 rounded-2xl shadow-sm text-sm md:text-base leading-relaxed whitespace-pre-wrap
          ${
            isUser
              ? 'bg-primary text-white rounded-tr-sm'
              : 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm'
          }
          ${message.isError ? 'bg-red-50 border-red-200 text-red-600' : ''}
        `}
      >
        {/* 
          In a production app, we would use a Markdown renderer here like 'react-markdown'.
          For this simplified version, we use whitespace-pre-wrap to preserve formatting.
        */}
        {message.text}
      </div>
    </div>
  );
};

export default MessageBubble;
