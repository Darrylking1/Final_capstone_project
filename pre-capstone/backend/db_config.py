import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, Column, Integer, String, LargeBinary, DateTime, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime, timedelta
from cryptography.fernet import Fernet
import base64
import hashlib

# Load environment variables
load_dotenv()

# Database connection string
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD", "password")
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_NAME = os.getenv("DB_NAME", "verification_db")

DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

# Create SQLAlchemy engine
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Encryption key management
def get_encryption_key():
    stored_key = os.getenv("ENCRYPTION_KEY")
    if not stored_key:
        # Generate a new key if none exists
        key = Fernet.generate_key()
        # In production, save this key securely
        print(f"Generated new encryption key: {key.decode()}")
        return key
    else:
        return stored_key.encode()

# Initialize encryption
encryption_key = get_encryption_key()
cipher_suite = Fernet(encryption_key)

# Encryption/decryption functions
def encrypt_data(data):
    if isinstance(data, str):
        data = data.encode()
    return cipher_suite.encrypt(data)

def decrypt_data(encrypted_data):
    return cipher_suite.decrypt(encrypted_data)

# Database models
class VerificationRecord(Base):
    __tablename__ = "verification_records"

    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(String(64), unique=True, index=True)
    first_name = Column(LargeBinary)  # Encrypted
    last_name = Column(LargeBinary)   # Encrypted
    id_number = Column(LargeBinary)   # Encrypted
    nationality = Column(LargeBinary) # Encrypted
    selfie_hash = Column(String(64))  # Hash of selfie image
    id_card_hash = Column(String(64)) # Hash of ID card image
    verification_result = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    expiry_time = Column(DateTime, default=lambda: datetime.utcnow() + timedelta(minutes=5))

# Create tables
def init_db():
    Base.metadata.create_all(bind=engine)

# Get database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Hash function for images
def hash_image(image_data):
    return hashlib.sha256(image_data).hexdigest()