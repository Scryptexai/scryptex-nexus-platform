import asyncio
import csv
import json
from datetime import datetime, timedelta
from telethon import TelegramClient
from telethon.tl.functions.messages import GetHistoryRequest
from telethon.tl.types import PeerChannel, PeerUser, PeerChat
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
        
    async def find_group(self, group_name):
        """
        Find group by name
        
        Args:
            group_name (str): Name of the group to search for
            
        Returns:
            Entity: Telegram group entity if found, None otherwise
        """
        async for dialog in self.client.iter_dialogs():
            if dialog.name.lower() == group_name.lower():
                print(f"Found group: {dialog.name}")
                return dialog.entity
        
        print(f"Group '{group_name}' not found!")
        return None
    
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
        
        print(f"Fetching messages from {start_date.strftime('%Y-%m-%d')} to {end_date.strftime('%Y-%m-%d')}")
        
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
                
                for message in history.messages:
                    # Check if message is within our date range
                    if message.date < start_date:
                        print("Reached messages older than 6 months. Stopping...")
                        return messages_data
                    
                    # Extract message data
                    message_data = await self.extract_message_data(message)
                    messages_data.append(message_data)
                    
                    # Update offset for next batch
                    offset_id = message.id
                
                print(f"Fetched {len(messages_data)} messages so far...")
                
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
        if message.media:
            media_type = type(message.media).__name__
        
        return {
            'id': message.id,
            'date': message.date.strftime('%Y-%m-%d %H:%M:%S'),
            'sender': sender_info,
            'text': text,
            'media_type': media_type,
            'reply_to': message.reply_to.reply_to_msg_id if message.reply_to else None,
            'views': getattr(message, 'views', None),
            'forwards': getattr(message, 'forwards', None)
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
            fieldnames = ['id', 'date', 'sender', 'text', 'media_type', 'reply_to', 'views', 'forwards']
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
    
    async def scrape_group(self, group_name, output_format='both', months_back=6):
        """
        Main method to scrape group messages
        
        Args:
            group_name (str): Name of the group to scrape
            output_format (str): 'csv', 'json', or 'both'
            months_back (int): Number of months to go back
        """
        try:
            await self.connect()
            
            # Find the group
            group_entity = await self.find_group(group_name)
            if not group_entity:
                return
            
            # Get messages
            print("Starting to fetch messages...")
            messages = await self.get_group_messages(group_entity, months_back)
            
            if not messages:
                print("No messages found!")
                return
            
            # Create output filename based on group name and date
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
    API_ID = 'YOUR_API_ID'  # Get from https://my.telegram.org
    API_HASH = 'YOUR_API_HASH'  # Get from https://my.telegram.org
    PHONE_NUMBER = 'YOUR_PHONE_NUMBER'  # Format: +1234567890
    
    # Group to scrape
    GROUP_NAME = "airdrop list link"
    
    # Validate configuration
    if API_ID == 'YOUR_API_ID' or API_HASH == 'YOUR_API_HASH':
        print("Error: Please configure your API credentials!")
        print("1. Go to https://my.telegram.org")
        print("2. Create a new application")
        print("3. Replace API_ID and API_HASH in the script")
        return
    
    # Create scraper instance
    scraper = TelegramScraper(API_ID, API_HASH, PHONE_NUMBER)
    
    # Run scraper
    await scraper.scrape_group(
        group_name=GROUP_NAME,
        output_format='both',  # Save as both CSV and JSON
        months_back=6  # Last 6 months
    )

if __name__ == "__main__":
    # Install required packages first:
    # pip install telethon
    
    # Run the scraper
    asyncio.run(main())