# backend/app/config.py

from pydantic_settings import BaseSettings
from pathlib import Path
import torch
from typing import Optional


class Settings(BaseSettings):
    APP_NAME: str = "RealESRGAN Super Resolution API"
    VERSION: str = "1.0.0"
    
    # Device configuration will be set after initialization
    DEVICE: Optional[str] = None
    
    # RealESRGAN ONNX settings
    REALESRGAN_PATH: str = "core/upsampler/weights/RealESRGAN_x4plus.pth"
    REALESRGAN_SCALE: int = 4
    REALESRGAN_TILE: int = 512
    REALESRGAN_TILE_PAD: int = 10
    REALESRGAN_PRE_PAD: int = 10
    
    # GFPGAN settings (PyTorch with MPS support)
    ENABLE_GFPGAN: bool = True
    GFPGAN_PATH: str = "core/face_enhancer/weights/GFPGANv1.3.pth"
    GFPGAN_DETECTION_MODEL: str = "core/face_enhancer/weights/Resnet50_Final.pth"
    GFPGAN_PARSING_MODEL: str = "core/face_enhancer/weights/parsing_parsenet.pth"
    
    # API settings
    MAX_UPLOAD_SIZE_MB: int = 10
    CORS_ORIGINS: list = ["http://localhost:5173", "http://localhost:3000"]
    LOG_LEVEL: str = "INFO"
    
    class Config:
        env_file = ".env"
    
    @staticmethod
    def get_device() -> str:
        """
        Determine optimal device for inference.
        Priority: MPS (Mac) > CUDA (NVIDIA) > CPU
        """
        if torch.backends.mps.is_available():
            return 'mps'
        elif torch.cuda.is_available():
            return 'cuda'
        else:
            return 'cpu'


# Initialize settings
settings = Settings()

# Set device after initialization
if settings.DEVICE is None:
    settings.DEVICE = Settings.get_device()