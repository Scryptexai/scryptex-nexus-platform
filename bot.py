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
    def create_sample_files(self):
        """
        Create sample output files to test file creation
        """
        print("🧪 Creating sample files to test file creation...")
        
        sample_data = [
            {
                'id': 12345,
                'date': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                'sender': '@testuser',
                'text': 'This is a test message',
                'media_type': None,
                'media_info': '',
                'reply_to': None,
                'views': 0,
                'forwards': 0,
                'is_reply': False
            }
        ]
        
        # Test CSV creation
        test_csv = "test_output.csv"
        try:
            with open(test_csv, 'w', newline='', encoding='utf-8') as csvfile:
                fieldnames = ['id', 'date', 'sender', 'text', 'media_type', 'media_info', 'reply_to', 'views', 'forwards', 'is_reply']
                writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
                writer.writeheader()
                for message in sample_data:
                    writer.writerow(message)
            print(f"✅ Test CSV created: {os.path.abspath(test_csv)}")
        except Exception as e:
            print(f"❌ Could not create test CSV: {e}")
        
        # Test JSON creation  
        test_json = "test_output.json"
        try:
            with open(test_json, 'w', encoding='utf-8') as jsonfile:
                json.dump(sample_data, jsonfile, ensure_ascii=False, indent=2)
            print(f"✅ Test JSON created: {os.path.abspath(test_json)}")
        except Exception as e:
            print(f"❌ Could not create test JSON: {e}")
        
        return True
    
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
        print(f"📥 Fetching messages from '{group_name}'")
        print(f"📅 Date range: {start_date.strftime('%Y-%m-%d')} to {end_date.strftime('%Y-%m-%d')}")
        
        messages_data = []
        offset_id = 0
        batch_size = 100
        batch_count = 0
        
        while True:
            try:
                batch_count += 1
                print(f"📦 Fetching batch #{batch_count}...")
                
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
                    print("📭 No more messages found.")
                    break
                
                messages_in_batch = 0
                oldest_date = None
                
                for message in history.messages:
                    # Track oldest message date in this batch
                    if oldest_date is None or message.date < oldest_date:
                        oldest_date = message.date
                    
                    # Check if message is within our date range
                    if message.date < start_date:
                        print(f"⏰ Reached messages older than {months_back} months.")
                        print(f"   Oldest message date: {oldest_date.strftime('%Y-%m-%d %H:%M:%S')}")
                        print(f"   Cutoff date: {start_date.strftime('%Y-%m-%d %H:%M:%S')}")
                        return messages_data
                    
                    # Extract message data
                    message_data = await self.extract_message_data(message)
                    messages_data.append(message_data)
                    messages_in_batch += 1
                    
                    # Update offset for next batch
                    offset_id = message.id
                
                print(f"   ✅ Processed {messages_in_batch} messages from batch #{batch_count}")
                print(f"   📊 Total messages so far: {len(messages_data)}")
                if oldest_date:
                    print(f"   📅 Oldest message in batch: {oldest_date.strftime('%Y-%m-%d %H:%M:%S')}")
                
                # Add delay to avoid rate limiting
                print("   ⏳ Waiting 1 second to avoid rate limiting...")
                await asyncio.sleep(1)
                
                # Check limit if specified
                if limit and len(messages_data) >= limit:
                    print(f"📏 Reached specified limit of {limit} messages.")
                    break
                    
            except Exception as e:
                print(f"❌ Error fetching batch #{batch_count}: {e}")
                import traceback
                traceback.print_exc()
                break
        
        print(f"🏁 Finished fetching messages.")
        print(f"   📊 Total messages collected: {len(messages_data)}")
        print(f"   📦 Total batches processed: {batch_count}")
        
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
            print("❌ No messages to save!")
            return False
        
        try:
            # Ensure directory exists
            os.makedirs(os.path.dirname(filename) if os.path.dirname(filename) else '.', exist_ok=True)
            
            # Get absolute path
            abs_path = os.path.abspath(filename)
            print(f"💾 Saving CSV to: {abs_path}")
            
            with open(filename, 'w', newline='', encoding='utf-8') as csvfile:
                fieldnames = ['id', 'date', 'sender', 'text', 'media_type', 'media_info', 'reply_to', 'views', 'forwards', 'is_reply']
                writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
                
                writer.writeheader()
                for message in messages_data:
                    writer.writerow(message)
            
            # Verify file was created
            if os.path.exists(filename):
                file_size = os.path.getsize(filename)
                print(f"✅ CSV file saved successfully!")
                print(f"   📁 Location: {abs_path}")
                print(f"   📊 Size: {file_size} bytes")
                print(f"   📝 Messages: {len(messages_data)}")
                return True
            else:
                print(f"❌ CSV file was not created!")
                return False
                
        except Exception as e:
            print(f"❌ Error saving CSV file: {e}")
            return False
    
    async def save_to_json(self, messages_data, filename):
        """
        Save messages data to JSON file
        
        Args:
            messages_data (list): List of message dictionaries
            filename (str): Output filename
        """
        if not messages_data:
            print("❌ No messages to save!")
            return False
            
        try:
            # Ensure directory exists
            os.makedirs(os.path.dirname(filename) if os.path.dirname(filename) else '.', exist_ok=True)
            
            # Get absolute path
            abs_path = os.path.abspath(filename)
            print(f"💾 Saving JSON to: {abs_path}")
            
            with open(filename, 'w', encoding='utf-8') as jsonfile:
                json.dump(messages_data, jsonfile, ensure_ascii=False, indent=2)
            
            # Verify file was created
            if os.path.exists(filename):
                file_size = os.path.getsize(filename)
                print(f"✅ JSON file saved successfully!")
                print(f"   📁 Location: {abs_path}")
                print(f"   📊 Size: {file_size} bytes")
                print(f"   📝 Messages: {len(messages_data)}")
                return True
            else:
                print(f"❌ JSON file was not created!")
                return False
                
        except Exception as e:
            print(f"❌ Error saving JSON file: {e}")
            return False
    
    async def scrape_group_by_link(self, invite_link, output_format='both', months_back=6):
        """
        Main method to scrape group messages using invite link
        
        Args:
            invite_link (str): Telegram invite link
            output_format (str): 'csv', 'json', or 'both'
            months_back (int): Number of months to go back
        """
        try:
            print("🔗 Connecting to Telegram...")
            await self.connect()
            
            print("👥 Accessing group from invite link...")
            # Get group entity from invite link
            group_entity = await self.get_group_entity_from_link(invite_link)
            if not group_entity:
                print("❌ Could not access the group!")
                return
            
            group_name = getattr(group_entity, 'title', 'telegram_group')
            print(f"✅ Successfully accessed group: '{group_name}'")
            
            # Get messages
            print("📥 Starting to fetch messages...")
            messages = await self.get_group_messages(group_entity, months_back)
            
            print(f"📊 Total messages found: {len(messages)}")
            
            if not messages:
                print("❌ No messages found in the specified time period!")
                print("   This could mean:")
                print("   - Group has no messages in the last 6 months")
                print("   - You don't have permission to read message history")
                print("   - Group is empty or very new")
                return
            
            # Show sample of messages
            print("📋 Sample messages:")
            for i, msg in enumerate(messages[:3]):
                print(f"   {i+1}. [{msg['date']}] {msg['sender']}: {msg['text'][:50]}...")
            
            # Create output filename based on group info and date
            safe_group_name = "".join(c for c in group_name if c.isalnum() or c in (' ', '-', '_')).rstrip()
            if not safe_group_name:
                safe_group_name = "telegram_group"
                
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            
            print(f"💾 Preparing to save files...")
            print(f"   📂 Base filename: {safe_group_name}_{timestamp}")
            print(f"   📍 Current directory: {os.path.abspath('.')}")
            
            # Save data
            files_saved = 0
            
            if output_format in ['csv', 'both']:
                csv_filename = f"{safe_group_name}_{timestamp}.csv"
                print(f"\n📄 Saving CSV file...")
                if await self.save_to_csv(messages, csv_filename):
                    files_saved += 1
            
            if output_format in ['json', 'both']:
                json_filename = f"{safe_group_name}_{timestamp}.json"
                print(f"\n📄 Saving JSON file...")
                if await self.save_to_json(messages, json_filename):
                    files_saved += 1
            
            print(f"\n🎉 Scraping completed!")
            print(f"   📊 Messages scraped: {len(messages)}")
            print(f"   💾 Files saved: {files_saved}")
            print(f"   📅 Date range: Last {months_back} months")
            
            if files_saved == 0:
                print("\n⚠️  No files were saved. Check the error messages above.")
            
        except Exception as e:
            print(f"❌ Error during scraping: {e}")
            import traceback
            print("Full error traceback:")
            traceback.print_exc()
        finally:
            print("🔌 Disconnecting from Telegram...")
            await self.client.disconnect()
    
    def create_sample_files(self):
        """
        Create sample output files to test file creation capability
        """
        print("🧪 Testing file creation capability...")
        
        sample_data = [
            {
                'id': 12345,
                'date': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                'sender': '@testuser',
                'text': 'This is a test message to verify file creation works',
                'media_type': None,
                'media_info': '',
                'reply_to': None,
                'views': 0,
                'forwards': 0,
                'is_reply': False
            }
        ]
        
        success_count = 0
        
        # Test CSV creation
        test_csv = "test_output.csv"
        try:
            with open(test_csv, 'w', newline='', encoding='utf-8') as csvfile:
                fieldnames = ['id', 'date', 'sender', 'text', 'media_type', 'media_info', 'reply_to', 'views', 'forwards', 'is_reply']
                writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
                writer.writeheader()
                for message in sample_data:
                    writer.writerow(message)
            
            if os.path.exists(test_csv):
                print(f"✅ Test CSV created successfully: {os.path.abspath(test_csv)}")
                success_count += 1
            else:
                print(f"❌ Test CSV file not found after creation")
                
        except Exception as e:
            print(f"❌ Could not create test CSV: {e}")
        
        # Test JSON creation  
        test_json = "test_output.json"
        try:
            with open(test_json, 'w', encoding='utf-8') as jsonfile:
                json.dump(sample_data, jsonfile, ensure_ascii=False, indent=2)
            
            if os.path.exists(test_json):
                print(f"✅ Test JSON created successfully: {os.path.abspath(test_json)}")
                success_count += 1
            else:
                print(f"❌ Test JSON file not found after creation")
                
        except Exception as e:
            print(f"❌ Could not create test JSON: {e}")
        
        if success_count == 2:
            print("✅ File creation test passed! The issue is likely with data retrieval.")
        elif success_count == 1:
            print("⚠️  Partial file creation success. Check permissions.")
        else:
            print("❌ File creation test failed. Check write permissions in current directory.")
        
        return success_count > 0

async def main():
    """
    Main function to run the scraper
    """
    print("🤖 === Telegram Group Scraper by Invite Link ===")
    print("This script will:")
    print("1. Join the group using the invite link (if not already joined)")
    print("2. Extract messages from the last 6 months")
    print("3. Save data to CSV and JSON files")
    print("=" * 60)
    
    # CONFIGURATION - REPLACE WITH YOUR CREDENTIALS
    API_ID = 'YOUR_API_ID'  # Get from https://my.telegram.org (angka, bukan string)
    API_HASH = 'YOUR_API_HASH'  # Get from https://my.telegram.org
    PHONE_NUMBER = 'YOUR_PHONE_NUMBER'  # Format: +62812345678
    
    # Group invite link to scrape
    GROUP_INVITE_LINK = "https://t.me/+0hMKkIXF-wdmNjE1"
    
    # Validate configuration
    if API_ID == 'YOUR_API_ID' or API_HASH == 'YOUR_API_HASH':
        print("❌ Error: Please configure your API credentials!")
        print("\nSteps to get API credentials:")
        print("1. Go to https://my.telegram.org")
        print("2. Create a new application")
        print("3. Replace API_ID and API_HASH in the script")
        print("   - API_ID should be a number (without quotes)")
        print("   - API_HASH should be a string (with quotes)")
        print("   - PHONE_NUMBER should include country code (+62...)")
        return
    
    print(f"⚙️  Configuration:")
    print(f"   📱 Phone: {PHONE_NUMBER}")
    print(f"   🔗 Group Link: {GROUP_INVITE_LINK}")
    print(f"   📅 Time Range: Last 6 months")
    print(f"   💾 Output: CSV and JSON files")
    print()
    
    # Create scraper instance
    try:
        scraper = TelegramScraper(API_ID, API_HASH, PHONE_NUMBER)
        
        # Test file creation capability first
        print("🧪 Testing file creation capability...")
        if not scraper.create_sample_files():
            print("❌ File creation test failed. Please check:")
            print("   - Write permissions in current directory")
            print("   - Available disk space")
            print("   - Antivirus software blocking file creation")
            return
        
        print("✅ File creation test passed. Proceeding with scraping...\n")
        
        # Run scraper
        await scraper.scrape_group_by_link(
            invite_link=GROUP_INVITE_LINK,
            output_format='both',  # Save as both CSV and JSON
            months_back=6  # Last 6 months
        )
        
    except Exception as e:
        print(f"❌ Fatal error: {e}")
        import traceback
        traceback.print_exc()
    
    print("\n🏁 Script execution completed.")
    print("If no files were saved, check the error messages above.")
    print("Files are saved in the same directory as this script.")

if __name__ == "__main__":
    # Install required packages first:
    # pip install telethon
    
    print("📋 Pre-flight checklist:")
    print("✅ Install telethon: pip install telethon")
    print("✅ Get API credentials from https://my.telegram.org")
    print("✅ Configure API_ID, API_HASH, and PHONE_NUMBER in script")
    print("✅ Make sure you have internet connection")
    print()
    
    # Run the scraper
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n⚠️  Script interrupted by user (Ctrl+C)")
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        import traceback
        traceback.print_exc()
    
    print("\nℹ️  If you need help:")
    print("- Make sure your API credentials are correct")
    print("- Check that you have permission to read the group")
    print("- Try running the script again")
    print("- Check if the invite link is still valid")