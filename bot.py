import asyncio
import csv
import json
import re
from datetime import datetime, timedelta
from telethon import TelegramClient
from telethon.tl.functions.messages import GetHistoryRequest, ImportChatInviteRequest
from telethon.tl.functions.channels import JoinChannelRequest
from telethon.tl.types import PeerChannel, PeerUser, PeerChat
from telethon.errors import UserAlreadyParticipantError, InviteHashEmptyError, InviteHashExpiredError
import os

class TelegramScraper:
    def __init__(self, api_id, api_hash, phone_number):
        """
        Initialize Telegram scraper
        
        Args:
            api_id (int): Your Telegram API ID
            api_hash (str): Your Telegram API Hash
            phone_number (str): Your phone number with country code
        """
        self.api_id = api_id
        self.api_hash = api_hash
        self.phone_number = phone_number
        self.client = TelegramClient('session', api_id, api_hash)
        
    async def connect(self):
        """Connect to Telegram and authenticate"""
        await self.client.start(phone=self.phone_number)
        print("Connected to Telegram successfully!")
        
    def extract_invite_hash(self, invite_link):
        """
        Extract invite hash from Telegram invite link
        
        Args:
            invite_link (str): Telegram invite link
            
        Returns:
            str: Invite hash or None if invalid
        """
        # Pattern untuk link invite Telegram
        patterns = [
            r't\.me/\+([A-Za-z0-9_-]+)',
            r't\.me/joinchat/([A-Za-z0-9_-]+)',
            r'telegram\.me/joinchat/([A-Za-z0-9_-]+)'
        ]
        
        for pattern in patterns:
            match = re.search(pattern, invite_link)
            if match:
                return match.group(1)
        
        return None
    
    async def join_group_by_link(self, invite_link):
        """
        Join group using invite link and return group entity
        
        Args:
            invite_link (str): Telegram invite link
            
        Returns:
            Entity: Telegram group entity if successful, None otherwise
        """
        try:
            invite_hash = self.extract_invite_hash(invite_link)
            if not invite_hash:
                print("Invalid invite link format!")
                return None
            
            print(f"Attempting to join group with hash: {invite_hash}")
            
            # Try to import chat invite
            try:
                result = await self.client(ImportChatInviteRequest(invite_hash))
                print("Successfully joined the group!")
                
                # Get the chat entity
                if hasattr(result, 'chats') and result.chats:
                    chat = result.chats[0]
                    print(f"Group name: {chat.title}")
                    print(f"Group ID: {chat.id}")
                    return chat
                    
            except UserAlreadyParticipantError:
                print("Already a member of this group!")
                # Try to find the group in dialogs
                return await self.find_group_by_hash(invite_hash)
                
            except InviteHashEmptyError:
                print("Invalid invite link!")
                return None
                
            except InviteHashExpiredError:
                print("Invite link has expired!")
                return None
                
        except Exception as e:
            print(f"Error joining group: {e}")
            return None
    
    async def find_group_by_hash(self, invite_hash):
        """
        Find group in dialogs (if already joined)
        
        Args:
            invite_hash (str): Invite hash
            
        Returns:
            Entity: Group entity if found
        """
        async for dialog in self.client.iter_dialogs():
            if dialog.entity.id:
                # Check if this might be the group we're looking for
                # Since we can't directly match hash, we'll return the most recently joined group
                if hasattr(dialog.entity, 'title'):
                    print(f"Found group: {dialog.entity.title}")
                    return dialog.entity
        return None
    
    async def get_group_entity_from_link(self, invite_link):
        """
        Get group entity from invite link (join if needed)
        
        Args:
            invite_link (str): Telegram invite link
            
        Returns:
            Entity: Group entity
        """
        print(f"Processing invite link: {invite_link}")
        
        # Extract hash from link
        invite_hash = self.extract_invite_hash(invite_link)
        if not invite_hash:
            print("Could not extract invite hash from link!")
            return None
        
        # Check if already in the group by looking through dialogs first
        print("Checking if already a member of any groups...")
        async for dialog in self.client.iter_dialogs():
            if hasattr(dialog.entity, 'title'):
                print(f"Found dialog: {dialog.entity.title}")
        
        # Try to join the group
        group_entity = await self.join_group_by_link(invite_link)
        return group_entity
    
    async def get_group_messages(self, group_entity, months_back=6, limit=None):
        """
        Get messages from group for specified time period
        
        Args:
            group_entity: Telegram group entity
            months_back (int): Number of months to go back
            limit (int): Max number of messages to retrieve (None for all)
            
        Returns:
            list: List of message data
        """
        # Calculate date range
        end_date = datetime.now()
        start_date = end_date - timedelta(days=months_back * 30)
        
        group_name = getattr(group_entity, 'title', 'Unknown Group')
        print(f"Fetching messages from '{group_name}'")
        print(f"Date range: {start_date.strftime('%Y-%m-%d')} to {end_date.strftime('%Y-%m-%d')}")
        
        messages_data = []
        offset_id = 0
        batch_size = 100
        
        while True:
            try:
                history = await self.client(GetHistoryRequest(
                    peer=group_entity,
                    offset_id=offset_id,
                    offset_date=None,
                    add_offset=0,
                    limit=batch_size,
                    max_id=0,
                    min_id=0,
                    hash=0
                ))
                
                if not history.messages:
                    break
                
                messages_in_batch = 0
                for message in history.messages:
                    # Check if message is within our date range
                    if message.date < start_date:
                        print(f"Reached messages older than {months_back} months. Stopping...")
                        return messages_data
                    
                    # Extract message data
                    message_data = await self.extract_message_data(message)
                    messages_data.append(message_data)
                    messages_in_batch += 1
                    
                    # Update offset for next batch
                    offset_id = message.id
                
                print(f"Fetched batch of {messages_in_batch} messages. Total: {len(messages_data)}")
                
                # Add delay to avoid rate limiting
                await asyncio.sleep(1)
                
                # Check limit if specified
                if limit and len(messages_data) >= limit:
                    break
                    
            except Exception as e:
                print(f"Error fetching messages: {e}")
                break
        
        return messages_data
    
    async def extract_message_data(self, message):
        """
        Extract relevant data from a message
        
        Args:
            message: Telegram message object
            
        Returns:
            dict: Extracted message data
        """
        # Get sender information
        sender_info = "Unknown"
        if message.sender_id:
            try:
                sender = await self.client.get_entity(message.sender_id)
                if hasattr(sender, 'username') and sender.username:
                    sender_info = f"@{sender.username}"
                elif hasattr(sender, 'first_name'):
                    sender_info = sender.first_name
                    if hasattr(sender, 'last_name') and sender.last_name:
                        sender_info += f" {sender.last_name}"
            except:
                sender_info = f"ID: {message.sender_id}"
        
        # Extract message text
        text = message.text if message.text else ""
        
        # Handle media messages
        media_type = None
        media_info = ""
        if message.media:
            media_type = type(message.media).__name__
            if hasattr(message.media, 'document') and hasattr(message.media.document, 'mime_type'):
                media_info = message.media.document.mime_type
        
        return {
            'id': message.id,
            'date': message.date.strftime('%Y-%m-%d %H:%M:%S'),
            'sender': sender_info,
            'text': text,
            'media_type': media_type,
            'media_info': media_info,
            'reply_to': message.reply_to.reply_to_msg_id if message.reply_to else None,
            'views': getattr(message, 'views', None),
            'forwards': getattr(message, 'forwards', None),
            'is_reply': bool(message.reply_to)
        }
    
    async def save_to_csv(self, messages_data, filename):
        """
        Save messages data to CSV file
        
        Args:
            messages_data (list): List of message dictionaries
            filename (str): Output filename
        """
        if not messages_data:
            print("No messages to save!")
            return
        
        with open(filename, 'w', newline='', encoding='utf-8') as csvfile:
            fieldnames = ['id', 'date', 'sender', 'text', 'media_type', 'media_info', 'reply_to', 'views', 'forwards', 'is_reply']
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            
            writer.writeheader()
            for message in messages_data:
                writer.writerow(message)
        
        print(f"Messages saved to {filename}")
    
    async def save_to_json(self, messages_data, filename):
        """
        Save messages data to JSON file
        
        Args:
            messages_data (list): List of message dictionaries
            filename (str): Output filename
        """
        with open(filename, 'w', encoding='utf-8') as jsonfile:
            json.dump(messages_data, jsonfile, ensure_ascii=False, indent=2)
        
        print(f"Messages saved to {filename}")
    
    async def scrape_group_by_link(self, invite_link, output_format='both', months_back=6):
        """
        Main method to scrape group messages using invite link
        
        Args:
            invite_link (str): Telegram invite link
            output_format (str): 'csv', 'json', or 'both'
            months_back (int): Number of months to go back
        """
        try:
            await self.connect()
            
            # Get group entity from invite link
            group_entity = await self.get_group_entity_from_link(invite_link)
            if not group_entity:
                print("Could not access the group!")
                return
            
            # Get messages
            print("Starting to fetch messages...")
            messages = await self.get_group_messages(group_entity, months_back)
            
            if not messages:
                print("No messages found!")
                return
            
            # Create output filename based on group info and date
            group_name = getattr(group_entity, 'title', 'telegram_group')
            safe_group_name = "".join(c for c in group_name if c.isalnum() or c in (' ', '-', '_')).rstrip()
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            
            # Save data
            if output_format in ['csv', 'both']:
                csv_filename = f"{safe_group_name}_{timestamp}.csv"
                await self.save_to_csv(messages, csv_filename)
            
            if output_format in ['json', 'both']:
                json_filename = f"{safe_group_name}_{timestamp}.json"
                await self.save_to_json(messages, json_filename)
            
            print(f"Successfully scraped {len(messages)} messages from '{group_name}'")
            
        except Exception as e:
            print(f"Error during scraping: {e}")
        finally:
            await self.client.disconnect()

async def main():
    """
    Main function to run the scraper
    """
    # CONFIGURATION - REPLACE WITH YOUR CREDENTIALS
    API_ID = 'YOUR_API_ID'  # Get from https://my.telegram.org (angka, bukan string)
    API_HASH = 'YOUR_API_HASH'  # Get from https://my.telegram.org
    PHONE_NUMBER = 'YOUR_PHONE_NUMBER'  # Format: +62812345678
    
    # Group invite link to scrape
    GROUP_INVITE_LINK = "https://t.me/+0hMKkIXF-wdmNjE1"
    
    # Validate configuration
    if API_ID == 'YOUR_API_ID' or API_HASH == 'YOUR_API_HASH':
        print("Error: Please configure your API credentials!")
        print("1. Go to https://my.telegram.org")
        print("2. Create a new application")
        print("3. Replace API_ID and API_HASH in the script")
        print("   - API_ID should be a number (without quotes)")
        print("   - API_HASH should be a string (with quotes)")
        return
    
    # Create scraper instance
    scraper = TelegramScraper(API_ID, API_HASH, PHONE_NUMBER)
    
    # Run scraper
    await scraper.scrape_group_by_link(
        invite_link=GROUP_INVITE_LINK,
        output_format='both',  # Save as both CSV and JSON
        months_back=6  # Last 6 months
    )

if __name__ == "__main__":
    # Install required packages first:
    # pip install telethon
    
    print("=== Telegram Group Scraper by Invite Link ===")
    print("This script will:")
    print("1. Join the group using the invite link (if not already joined)")
    print("2. Extract messages from the last 6 months")
    print("3. Save data to CSV and JSON files")
    print("=" * 50)
    
    # Run the scraper
    asyncio.run(main())