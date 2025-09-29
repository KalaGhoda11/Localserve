from fastapi import FastAPI, APIRouter, HTTPException, UploadFile, File
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime
import base64


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI(title="Profile Plus API")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class StatusCheckCreate(BaseModel):
    client_name: str

# Profile Models
class UserProfile(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    # Basic Information
    first_name: str
    last_name: str
    email: EmailStr
    phone: Optional[str] = None
    bio: Optional[str] = None
    
    # Professional Information
    job_title: Optional[str] = None
    company: Optional[str] = None
    industry: Optional[str] = None
    years_of_experience: Optional[int] = None
    skills: List[str] = []
    
    # Social Links
    linkedin_url: Optional[str] = None
    twitter_url: Optional[str] = None
    github_url: Optional[str] = None
    website_url: Optional[str] = None
    
    # Profile Image (base64 encoded)
    profile_image: Optional[str] = None
    
    # Metadata
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class UserProfileCreate(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    phone: Optional[str] = None
    bio: Optional[str] = None
    job_title: Optional[str] = None
    company: Optional[str] = None
    industry: Optional[str] = None
    years_of_experience: Optional[int] = None
    skills: List[str] = []
    linkedin_url: Optional[str] = None
    twitter_url: Optional[str] = None
    github_url: Optional[str] = None
    website_url: Optional[str] = None
    profile_image: Optional[str] = None

class UserProfileUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    bio: Optional[str] = None
    job_title: Optional[str] = None
    company: Optional[str] = None
    industry: Optional[str] = None
    years_of_experience: Optional[int] = None
    skills: Optional[List[str]] = None
    linkedin_url: Optional[str] = None
    twitter_url: Optional[str] = None
    github_url: Optional[str] = None
    website_url: Optional[str] = None
    profile_image: Optional[str] = None

# Basic API Routes
@api_router.get("/")
async def root():
    return {"message": "Profile Plus API - Ready to manage your profiles!"}

@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow()}

# Status Check Routes (keeping existing functionality)
@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.dict()
    status_obj = StatusCheck(**status_dict)
    _ = await db.status_checks.insert_one(status_obj.dict())
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find().to_list(1000)
    return [StatusCheck(**status_check) for status_check in status_checks]

# Profile API Routes
@api_router.post("/profiles", response_model=UserProfile)
async def create_profile(profile: UserProfileCreate):
    """Create a new user profile"""
    try:
        # Check if email already exists
        existing_profile = await db.profiles.find_one({"email": profile.email})
        if existing_profile:
            raise HTTPException(status_code=400, detail="Profile with this email already exists")
        
        # Create new profile
        profile_dict = profile.dict()
        profile_obj = UserProfile(**profile_dict)
        
        # Insert into database
        await db.profiles.insert_one(profile_obj.dict())
        
        return profile_obj
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Failed to create profile: {str(e)}")

@api_router.get("/profiles", response_model=List[UserProfile])
async def get_all_profiles():
    """Get all user profiles"""
    try:
        profiles = await db.profiles.find().to_list(1000)
        return [UserProfile(**profile) for profile in profiles]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch profiles: {str(e)}")

@api_router.get("/profiles/{profile_id}", response_model=UserProfile)
async def get_profile(profile_id: str):
    """Get a specific user profile by ID"""
    try:
        profile = await db.profiles.find_one({"id": profile_id})
        if not profile:
            raise HTTPException(status_code=404, detail="Profile not found")
        
        return UserProfile(**profile)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch profile: {str(e)}")

@api_router.put("/profiles/{profile_id}", response_model=UserProfile)
async def update_profile(profile_id: str, profile_update: UserProfileUpdate):
    """Update a specific user profile"""
    try:
        # Check if profile exists
        existing_profile = await db.profiles.find_one({"id": profile_id})
        if not existing_profile:
            raise HTTPException(status_code=404, detail="Profile not found")
        
        # Update profile
        update_data = profile_update.dict(exclude_unset=True)
        if update_data:
            update_data["updated_at"] = datetime.utcnow()
            
            # Check email uniqueness if email is being updated
            if "email" in update_data:
                email_exists = await db.profiles.find_one({
                    "email": update_data["email"], 
                    "id": {"$ne": profile_id}
                })
                if email_exists:
                    raise HTTPException(status_code=400, detail="Email already exists")
            
            await db.profiles.update_one(
                {"id": profile_id},
                {"$set": update_data}
            )
        
        # Return updated profile
        updated_profile = await db.profiles.find_one({"id": profile_id})
        return UserProfile(**updated_profile)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update profile: {str(e)}")

@api_router.delete("/profiles/{profile_id}")
async def delete_profile(profile_id: str):
    """Delete a specific user profile"""
    try:
        # Check if profile exists
        existing_profile = await db.profiles.find_one({"id": profile_id})
        if not existing_profile:
            raise HTTPException(status_code=404, detail="Profile not found")
        
        # Delete profile
        await db.profiles.delete_one({"id": profile_id})
        
        return {"message": "Profile deleted successfully", "profile_id": profile_id}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete profile: {str(e)}")

@api_router.post("/profiles/{profile_id}/upload-image")
async def upload_profile_image(profile_id: str, file: UploadFile = File(...)):
    """Upload profile image and convert to base64"""
    try:
        # Validate file type
        if not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Check file size (limit to 5MB)
        contents = await file.read()
        if len(contents) > 5 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="File size must be less than 5MB")
        
        # Convert to base64
        base64_image = base64.b64encode(contents).decode('utf-8')
        image_data = f"data:{file.content_type};base64,{base64_image}"
        
        # Update profile
        result = await db.profiles.update_one(
            {"id": profile_id},
            {"$set": {"profile_image": image_data, "updated_at": datetime.utcnow()}}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Profile not found")
        
        return {"message": "Profile image uploaded successfully", "image_url": image_data}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload image: {str(e)}")

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
