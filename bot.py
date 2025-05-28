import asyncio
import csv
import json
import os
import re
from datetime import datetime, timedelta
from telethon import TelegramClient
from telethon.tl.functions.messages import GetHistoryRequest, ImportChatInviteRequest
from telethon.tl.functions.channels import JoinChannelRequest
from telethon.tl.types import PeerChannel, PeerUser, PeerChat
from telethon.errors import UserAlreadyParticipantError, InviteHashEmptyError, InviteHashExpiredError
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class TelegramScraper:
    def __init__(self):
        """
        Initialize Telegram scraper with environment variables
        """
        # Get credentials from environment variables
        self.api_id = os.getenv('TELEGRAM_API_ID')
        self.api_hash = os.getenv('TELEGRAM_API_HASH')
        self.phone_number = os.getenv('TELEGRAM_PHONE_NUMBER')
        
        # Validate credentials
        if not all([self.api_id, self.api_hash, self.phone_number]):
            raise ValueError("Missing required environment variables. Please set TELEGRAM_API_ID, TELEGRAM_API_HASH, and TELEGRAM_PHONE_NUMBER")
        
        # Convert API_ID to integer
        try:
            self.api_id = int(self.api_id)
        except ValueError:
            raise ValueError("TELEGRAM_API_ID must be a number")
        
        self.client = TelegramClient('session', self.api_id, self.api_hash)
        print(f"🔧 Initialized with phone: {self.phone_number}")
        
    async def connect(self):
        """Connect to Telegram and authenticate"""
        print("🔗 Connecting to Telegram...")
        await self.client.start(phone=self.phone_number)
        
        # Get current user info
        me = await self.client.get_me()
        print(f"✅ Connected as: {me.first_name} (@{me.username if me.username else 'no_username'})")
        
    def extract_invite_hash(self, invite_link):
        """
        Extract invite hash from Telegram invite link
        """
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
    
    async def get_all_dialogs(self):
        """
        Get all user dialogs for debugging
        """
        print("📋 Listing all available dialogs...")
        dialogs = []
        
        async for dialog in self.client.iter_dialogs():
            dialog_info = {
                'name': dialog.name,
                'id': dialog.id,
                'type': type(dialog.entity).__name__,
                'is_group': hasattr(dialog.entity, 'megagroup') and dialog.entity.megagroup,
                'is_channel': hasattr(dialog.entity, 'broadcast') and dialog.entity.broadcast,
                'is_chat': type(dialog.entity).__name__ == 'Chat'
            }
            dialogs.append(dialog_info)
            
        # Sort by name for better readability
        dialogs.sort(key=lambda x: x['name'].lower())
        
        print(f"📊 Total dialogs found: {len(dialogs)}")
        for i, dialog in enumerate(dialogs[:10]):  # Show first 10
            print(f"   {i+1}. {dialog['name']} ({dialog['type']}) - ID: {dialog['id']}")
        
        if len(dialogs) > 10:
            print(f"   ... and {len(dialogs) - 10} more dialogs")
            
        return dialogs
    
    async def join_group_by_link(self, invite_link):
        """
        Join group using invite link and return group entity
        """
        try:
            invite_hash = self.extract_invite_hash(invite_link)
            if not invite_hash:
                print("❌ Invalid invite link format!")
                return None
            
            print(f"🔑 Extracted invite hash: {invite_hash}")
            
            try:
                print("📥 Attempting to join group...")
                result = await self.client(ImportChatInviteRequest(invite_hash))
                
                if hasattr(result, 'chats') and result.chats:
                    chat = result.chats[0]
                    print(f"✅ Successfully joined group: {chat.title}")
                    print(f"   📊 Group ID: {chat.id}")
                    print(f"   👥 Members: {getattr(chat, 'participants_count', 'Unknown')}")
                    return chat
                else:
                    print("❌ No chat information returned from join request")
                    return None
                    
            except UserAlreadyParticipantError:
                print("ℹ️  Already a member of this group!")
                return await self.find_group_in_dialogs(invite_hash)
                
            except InviteHashEmptyError:
                print("❌ Invalid invite link!")
                return None
                
            except InviteHashExpiredError:
                print("❌ Invite link has expired!")
                return None
                
        except Exception as e:
            print(f"❌ Error joining group: {e}")
            import traceback
            traceback.print_exc()
            return None
    
    async def find_group_in_dialogs(self, invite_hash=None):
        """
        Find the target group in dialogs
        """
        print("🔍 Searching for target group in dialogs...")
        
        # Get all dialogs first
        dialogs = await self.get_all_dialogs()
        
        # Look for groups with "airdrop" and "list" in the name
        target_keywords = ['airdrop', 'list', 'link']
        possible_groups = []
        
        for dialog in dialogs:
            dialog_name_lower = dialog['name'].lower()
            keyword_matches = sum(1 for keyword in target_keywords if keyword in dialog_name_lower)
            
            if keyword_matches >= 2:  # At least 2 keywords match
                possible_groups.append((dialog, keyword_matches))
                
        # Sort by number of keyword matches
        possible_groups.sort(key=lambda x: x[1], reverse=True)
        
        if possible_groups:
            print(f"🎯 Found {len(possible_groups)} possible target groups:")
            for i, (dialog, matches) in enumerate(possible_groups):
                print(f"   {i+1}. {dialog['name']} (matches: {matches})")
            
            # Try to get the entity for the best match
            best_match = possible_groups[0][0]
            try:
                print(f"🎯 Trying to access: {best_match['name']}")
                entity = await self.client.get_entity(best_match['id'])
                print(f"✅ Successfully got entity for: {entity.title}")
                return entity
            except Exception as e:
                print(f"❌ Could not get entity: {e}")
                
        # If no matches found by keywords, let user choose manually
        print("❓ Could not automatically identify target group.")
        print("📋 All available groups:")
        
        groups_only = [d for d in dialogs if d['is_group'] or d['is_channel'] or d['is_chat']]
        for i, dialog in enumerate(groups_only[:20]):  # Show first 20 groups
            print(f"   {i+1}. {dialog['name']} ({dialog['type']})")
            
        return None
    
    async def get_group_messages(self, group_entity, months_back=6, limit=None):
        """
        Get messages from group for specified time period
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
        
        try:
            while True:
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
                await asyncio.sleep(1)
                
                # Check limit if specified
                if limit and len(messages_data) >= limit:
                    print(f"📏 Reached specified limit of {limit} messages.")
                    break
                    
        except Exception as e:
            print(f"❌ Error fetching messages: {e}")
            import traceback
            traceback.print_exc()
        
        print(f"🏁 Finished fetching messages.")
        print(f"   📊 Total messages collected: {len(messages_data)}")
        print(f"   📦 Total batches processed: {batch_count}")
        
        return messages_data
    
    async def extract_message_data(self, message):
        """
        Extract relevant data from a message
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
        """Save messages data to CSV file"""
        if not messages_data:
            print("❌ No messages to save!")
            return False
        
        try:
            abs_path = os.path.abspath(filename)
            print(f"💾 Saving CSV to: {abs_path}")
            
            with open(filename, 'w', newline='', encoding='utf-8') as csvfile:
                fieldnames = ['id', 'date', 'sender', 'text', 'media_type', 'media_info', 'reply_to', 'views', 'forwards', 'is_reply']
                writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
                
                writer.writeheader()
                for message in messages_data:
                    writer.writerow(message)
            
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
        """Save messages data to JSON file"""
        if not messages_data:
            print("❌ No messages to save!")
            return False
            
        try:
            abs_path = os.path.abspath(filename)
            print(f"💾 Saving JSON to: {abs_path}")
            
            with open(filename, 'w', encoding='utf-8') as jsonfile:
                json.dump(messages_data, jsonfile, ensure_ascii=False, indent=2)
            
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
        """
        try:
            print("🔗 Connecting to Telegram...")
            await self.connect()
            
            print("👥 Accessing group from invite link...")
            group_entity = await self.join_group_by_link(invite_link)
            
            if not group_entity:
                print("❌ Could not access the group from invite link!")
                print("🔍 Trying to find group in existing dialogs...")
                group_entity = await self.find_group_in_dialogs()
                
                if not group_entity:
                    print("❌ Could not find target group!")
                    return
            
            group_name = getattr(group_entity, 'title', 'telegram_group')
            print(f"✅ Successfully accessed group: '{group_name}'")
            
            # Test if we can actually read messages from this group
            print("🧪 Testing message access...")
            try:
                test_history = await self.client(GetHistoryRequest(
                    peer=group_entity,
                    offset_id=0,
                    offset_date=None,
                    add_offset=0,
                    limit=1,
                    max_id=0,
                    min_id=0,
                    hash=0
                ))
                
                if test_history.messages:
                    print(f"✅ Message access test successful! Found {len(test_history.messages)} test message(s)")
                else:
                    print("⚠️  No messages found in test request")
                    
            except Exception as e:
                print(f"❌ Cannot access messages from this group: {e}")
                return
            
            # Get messages
            print("📥 Starting to fetch messages...")
            messages = await self.get_group_messages(group_entity, months_back)
            
            print(f"📊 Total messages retrieved: {len(messages)}")
            
            if not messages:
                print("❌ No messages found in the specified time period!")
                return
            
            # Show sample of messages
            print("📋 Sample messages:")
            for i, msg in enumerate(messages[:3]):
                preview = msg['text'][:50] + "..." if len(msg['text']) > 50 else msg['text']
                print(f"   {i+1}. [{msg['date']}] {msg['sender']}: {preview}")
            
            # Create output filename
            safe_group_name = "".join(c for c in group_name if c.isalnum() or c in (' ', '-', '_')).rstrip()
            if not safe_group_name:
                safe_group_name = "telegram_group"
                
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            
            print(f"💾 Preparing to save files...")
            
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
            
        except Exception as e:
            print(f"❌ Error during scraping: {e}")
            import traceback
            traceback.print_exc()
        finally:
            print("🔌 Disconnecting from Telegram...")
            await self.client.disconnect()

def create_env_file():
    """
    Create a sample .env file if it doesn't exist
    """
    env_file = '.env'
    if not os.path.exists(env_file):
        print("📄 Creating sample .env file...")
        sample_env = """# Telegram API Credentials
# Get these from https://my.telegram.org

TELEGRAM_API_ID=your_api_id_here
TELEGRAM_API_HASH=your_api_hash_here
TELEGRAM_PHONE_NUMBER=+628123456789

# Example:
# TELEGRAM_API_ID=12345678
# TELEGRAM_API_HASH=abcd1234efgh5678ijkl9012mnop3456
# TELEGRAM_PHONE_NUMBER=+628123456789
"""
        
        with open(env_file, 'w') as f:
            f.write(sample_env)
        
        print(f"✅ Sample .env file created: {os.path.abspath(env_file)}")
        print("📝 Please edit the .env file with your actual credentials")
        return False
    
    return True

async def main():
    """
    Main function to run the scraper
    """
    print("🤖 === Telegram Group Scraper (Environment Variables) ===")
    print("This script will:")
    print("1. Read credentials from .env file")
    print("2. Join the group using the invite link")
    print("3. Extract messages from the last 6 months")
    print("4. Save data to CSV and JSON files")
    print("=" * 65)
    
    # Check if .env file exists, create sample if not
    if not create_env_file():
        print("\n❌ Please configure your .env file first!")
        return
    
    # Group invite link to scrape
    GROUP_INVITE_LINK = "https://t.me/+0hMKkIXF-wdmNjE1"
    
    try:
        # Create scraper instance (will load from .env automatically)
        scraper = TelegramScraper()
        
        print(f"⚙️  Configuration loaded from .env file")
        print(f"🔗 Group Link: {GROUP_INVITE_LINK}")
        print(f"📅 Time Range: Last 6 months")
        print(f"💾 Output: CSV and JSON files")
        print()
        
        # Run scraper
        await scraper.scrape_group_by_link(
            invite_link=GROUP_INVITE_LINK,
            output_format='both',
            months_back=6
        )
        
    except ValueError as e:
        print(f"❌ Configuration error: {e}")
        print("\n📝 Please check your .env file:")
        print("   - Make sure all variables are set")
        print("   - TELEGRAM_API_ID should be a number")
        print("   - TELEGRAM_API_HASH should be a string")
        print("   - TELEGRAM_PHONE_NUMBER should include country code")
        
    except Exception as e:
        print(f"❌ Fatal error: {e}")
        import traceback
        traceback.print_exc()
    
    print("\n🏁 Script execution completed.")

if __name__ == "__main__":
    # Install required packages first:
    # pip install telethon python-dotenv
    
    print("📋 Pre-flight checklist:")
    print("✅ Install dependencies: pip install telethon python-dotenv")
    print("✅ Get API credentials from https://my.telegram.org")
    print("✅ Configure .env file with your credentials")
    print("✅ Make sure you have internet connection")
    print()
    
    # Check if required packages are installed
    try:
        import telethon
        from dotenv import load_dotenv
        print("✅ All required packages are installed")
    except ImportError as e:
        print(f"❌ Missing package: {e}")
        print("Please run: pip install telethon python-dotenv")
        exit(1)
    
    # Run the scraper
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n⚠️  Script interrupted by user (Ctrl+C)")
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        import traceback
        traceback.print_exc()