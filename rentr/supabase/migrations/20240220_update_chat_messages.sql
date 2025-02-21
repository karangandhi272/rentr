-- Add new columns to chat_messages table
alter table chat_messages 
add column subject text,
add column raw_email jsonb,
add column attachments jsonb[];

-- Create index for faster email searches
create index idx_chat_messages_from_email on chat_messages(from_email);
