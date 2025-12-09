# # backend/app/main.py

# from fastapi import FastAPI, File, UploadFile, HTTPException, Query
# from fastapi.responses import StreamingResponse
# from fastapi.middleware.cors import CORSMiddleware
# from contextlib import asynccontextmanager
# import cv2
# import numpy as np
# import io
# import time
# import logging
# from datetime import datetime
# from pathlib import Path

# from .config import settings

# from core.upsampler.realesrgan import RRDBNet
# from core.upsampler.image_enhancer import RealESRGANer
# from core.face_enhancer.face_enhancer import GFPGANer

# logging.basicConfig(
#     level=getattr(logging, settings.LOG_LEVEL),
#     format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
# )
# logger = logging.getLogger(__name__)

# upsampler = None
# face_enhancer = None

# @asynccontextmanager
# async def lifespan(app: FastAPI):
#     """
#     Lifecycle manager for FastAPI application.
#     Loads models on startup and cleans up on shutdown.
#     """
#     global upsampler, face_enhancer
    
#     model = RRDBNet(num_in_ch=3, num_out_ch=3, num_feat=64, num_block=23, num_grow_ch=32, scale=4)

#     logger.info("Starting application...")
#     logger.info(f"Device selected: {settings.DEVICE}")
#     try:
#         upsampler = RealESRGANer(
#             scale=settings.REALESRGAN_SCALE,
#             model_path=settings.REALESRGAN_PATH,
#             dni_weight=None,
#             model=model,
#             tile=settings.REALESRGAN_TILE,
#             tile_pad=settings.REALESRGAN_TILE_PAD,
#             pre_pad=settings.REALESRGAN_PRE_PAD,
#             half=False,
#             device=settings.DEVICE)
#         if upsampler:
#             logger.info("Upsampler initialized")
            
#     except Exception as e:
#         logger.warning(f"Upsampler initialization failed: {e}")

#     try:
#         face_enhancer = GFPGANer(
#             model_path=settings.GFPGAN_PATH,
#             det_model_path=settings.GFPGAN_DETECTION_MODEL,
#             parsenet_path=settings.GFPGAN_PARSING_MODEL,
#             upscale=settings.REALESRGAN_SCALE,
#             arch='clean',
#             channel_multiplier=2,
#             bg_upsampler=upsampler,
#             device=settings.DEVICE
#         )
        
#         if face_enhancer:
#             logger.info("Face enhancer initialized with background upsampler")
            
#     except Exception as e:
#         logger.warning(f"GFPGAN initialization failed: {e}")

#     yield

#     logger.info("Shutting down application")


# app = FastAPI(
#     title=settings.APP_NAME,
#     description="Real image super-resolution with RealESRGAN and GFPGAN",
#     version=settings.VERSION,
#     lifespan=lifespan
# )

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=settings.CORS_ORIGINS,
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )


# @app.get("/")
# async def root():
#     """Root endpoint with API information"""
#     return {
#         "name": settings.APP_NAME,
#         "version": settings.VERSION,
#         "status": "running",
#         "device": settings.DEVICE,
#         "documentation": "/docs"
#     }


# @app.get("/health")
# async def health_check():
#     """Health check endpoint for monitoring and load balancers"""
#     return {
#         "status": "healthy",
#         "timestamp": datetime.utcnow().isoformat(),
#         "models_loaded": upsampler is not None and face_enhancer is not None,
#         "device": settings.DEVICE
#     }


# @app.get("/models/info")
# async def models_info():
#     """
#     Get detailed information about loaded models and system configuration.
#     Useful for debugging and verification.
#     """
#     if upsampler is None or face_enhancer is None:
#         raise HTTPException(
#             status_code=503,
#             detail="Models not loaded. Server may still be initializing."
#         )
#     info = {
#         "device": settings.DEVICE,
#         "realesrgan": {
#             "model_name": "RRDBNet",
#             "scale": upsampler.scale,
#             "tile": upsampler.tile,
#             "tile_pad": upsampler.tile_pad,
#             "pre_pad": upsampler.pre_pad,
#             "model_path": settings.REALESRGAN_PATH,
#             "half_precision": upsampler.half
#         },
#         "gfpgan": {
#             "model_path": settings.GFPGAN_PATH,
#             "detection_model": settings.GFPGAN_DETECTION_MODEL,
#             "parsing_model": settings.GFPGAN_PARSING_MODEL,
#             "upscale": face_enhancer.upscale,
#             "arch": face_enhancer.arch,
#             "channel_multiplier": face_enhancer.channel_multiplier,
#         }
#     }
#     return info


# @app.post("/api/enhance")
# async def enhance_image(
#     file: UploadFile = File(..., description="Input image file"),
#     outscale: float = Query(
#         default=4.0,
#         ge=1.0,
#         le=8.0,
#         description="Output scaling factor"
#     ),
#     face_enhance: bool = Query(
#         default=False,
#         description="Enable GFPGAN face enhancement"
#     ),
#     only_center_face: bool = Query(
#         default=False,
#         description="Process only the center face (requires face_enhance=true)"
#     ),
#     weight: float = Query(
#         default=0.5,
#         ge=0.0,
#         le=1.0,
#         description="Face restoration weight (0=original, 1=fully restored)"
#     )
# ):
#     """
#     Enhance image using RealESRGAN and optionally GFPGAN for face enhancement.
    
#     The service supports:
#     - Various image formats (JPG, PNG, WebP, etc.)
#     - RGBA images with transparency
#     - Grayscale images
#     - 16-bit images
#     - Large images via automatic tiling
    
#     Parameters:
#     - file: Input image file
#     - outscale: Output scale factor (1.0-8.0)
#     - face_enhance: Enable face enhancement with GFPGAN
#     - only_center_face: Process only center face (useful for portraits)
#     - weight: Blend between original and restored face (0.0-1.0)
    
#     Returns:
#     - Enhanced image as PNG
#     - Metadata in response headers
#     """
    
#     if not file.content_type or not file.content_type.startswith('image/'):
#         raise HTTPException(
#             status_code=400,
#             detail="Uploaded file must be an image (JPEG, PNG, WebP, etc.)"
#         )
    
#     content = await file.read()
#     max_size_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
    
#     if len(content) > max_size_bytes:
#         raise HTTPException(
#             status_code=400,
#             detail=f"Image too large. Maximum size is {settings.MAX_UPLOAD_SIZE_MB}MB"
#         )
    
#     try:
#         logger.info(
#             f"Processing request: file={file.filename}, "
#             f"size={len(content)} bytes, scale={outscale}, "
#             f"face_enhance={face_enhance}"
#         )
        
#         # Decode image from bytes
#         nparr = np.frombuffer(content, np.uint8)
#         img = cv2.imdecode(nparr, cv2.IMREAD_UNCHANGED)
        
#         if img is None:
#             raise HTTPException(
#                 status_code=400,
#                 detail="Failed to decode image. File may be corrupted or unsupported format."
#             )
        
#         logger.info(f"Image decoded: shape={img.shape}, dtype={img.dtype}")
#         start_time = time.time()
#         # Process image
#         if face_enhance:
#             _, _, output = face_enhancer.enhance(img, has_aligned=False, only_center_face=only_center_face, paste_back=True, weight=weight)
#         else:
#             output, _ = upsampler.enhance(img, outscale=outscale)
    
#         # Encode result as PNG
#         encode_params = [cv2.IMWRITE_PNG_COMPRESSION, 3]
#         success, img_encoded = cv2.imencode('.png', output, encode_params)
        
#         if not success:
#             raise HTTPException(
#                 status_code=500,
#                 detail="Failed to encode output image"
#             )
        
#         result_bytes = img_encoded.tobytes()
        
#         logger.info(
#             f"Processing complete: output_size={len(result_bytes)} bytes, "
#         )
        
#         # Prepare filename
#         input_filename = Path(file.filename).stem
#         output_filename = f"{input_filename}_enhanced.png"
        
#         process_time = round(time.time() - start_time, 4)

#         headers = {
#             "Content-Disposition": f"attachment; filename={output_filename}",
#             "X-Model-RealESRGAN-Scale": str(outscale),
#             "X-Face-Enhance": str(face_enhance),
#             "X-Only-Center-Face": str(only_center_face),
#             "X-Face-Weight": str(weight),
#             "X-Processing-Time": str(process_time),
#             "X-Device": settings.DEVICE,
#             "X-Model-RealESRGAN-Path": settings.REALESRGAN_PATH,
#         }

#         if face_enhance:
#             headers.update({
#                 "X-Model-GFPGAN-Path": settings.GFPGAN_PATH,
#                 "X-Model-GFPGAN-Detection": settings.GFPGAN_DETECTION_MODEL,
#                 "X-Model-GFPGAN-Parsing": settings.GFPGAN_PARSING_MODEL,
#             })

#         return StreamingResponse(
#             io.BytesIO(result_bytes),
#             media_type="image/png",
#             headers=headers
#         )
        
#     except HTTPException:
#         raise
#     except Exception as e:
#         logger.error(f"Processing failed: {e}", exc_info=True)
#         raise HTTPException(
#             status_code=500,
#             detail=f"Image enhancement failed: {str(e)}"
#         )


# if __name__ == "__main__":
#     import uvicorn
    
#     uvicorn.run(
#         "app.main:app",
#         host="0.0.0.0",
#         port=8000,
#         reload=True,
#         log_level="info"
#     )


# backend/app/main.py

from fastapi import FastAPI, File, UploadFile, HTTPException, Query
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import cv2
import numpy as np
import io
import time
import logging
from datetime import datetime
from pathlib import Path

from .config import settings

from core.upsampler.realesrgan import RRDBNet
from core.upsampler.image_enhancer import RealESRGANer
from core.face_enhancer.face_enhancer import GFPGANer

logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

upsampler = None
face_enhancer = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifecycle manager for FastAPI application.
    Loads models on startup and cleans up on shutdown.
    """
    global upsampler, face_enhancer
    
    model = RRDBNet(num_in_ch=3, num_out_ch=3, num_feat=64, num_block=23, num_grow_ch=32, scale=4)

    logger.info("Starting application...")
    logger.info(f"Device selected: {settings.DEVICE}")
    try:
        upsampler = RealESRGANer(
            scale=settings.REALESRGAN_SCALE,
            model_path=settings.REALESRGAN_PATH,
            dni_weight=None,
            model=model,
            tile=settings.REALESRGAN_TILE,
            tile_pad=settings.REALESRGAN_TILE_PAD,
            pre_pad=settings.REALESRGAN_PRE_PAD,
            half=False,
            device=settings.DEVICE)
        if upsampler:
            logger.info("Upsampler initialized")
            
    except Exception as e:
        logger.warning(f"Upsampler initialization failed: {e}")

    try:
        face_enhancer = GFPGANer(
            model_path=settings.GFPGAN_PATH,
            det_model_path=settings.GFPGAN_DETECTION_MODEL,
            parsenet_path=settings.GFPGAN_PARSING_MODEL,
            upscale=settings.REALESRGAN_SCALE,
            arch='clean',
            channel_multiplier=2,
            bg_upsampler=upsampler,
            device=settings.DEVICE
        )
        
        if face_enhancer:
            logger.info("Face enhancer initialized with background upsampler")
            
    except Exception as e:
        logger.warning(f"GFPGAN initialization failed: {e}")

    yield

    logger.info("Shutting down application")


app = FastAPI(
    title=settings.APP_NAME,
    description="Real image super-resolution with RealESRGAN and GFPGAN",
    version=settings.VERSION,
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "name": settings.APP_NAME,
        "version": settings.VERSION,
        "status": "running",
        "device": settings.DEVICE,
        "documentation": "/docs"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring and load balancers"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "models_loaded": upsampler is not None and face_enhancer is not None,
        "device": settings.DEVICE
    }


@app.get("/models/info")
async def models_info():
    """
    Get detailed information about loaded models and system configuration.
    Useful for debugging and verification.
    """
    if upsampler is None or face_enhancer is None:
        raise HTTPException(
            status_code=503,
            detail="Models not loaded. Server may still be initializing."
        )
    info = {
        "device": settings.DEVICE,
        "realesrgan": {
            "model_name": "RRDBNet",
            "scale": upsampler.scale,
            "tile": upsampler.tile,
            "tile_pad": upsampler.tile_pad,
            "pre_pad": upsampler.pre_pad,
            "model_path": settings.REALESRGAN_PATH,
            "half_precision": upsampler.half
        },
        "gfpgan": {
            "model_path": settings.GFPGAN_PATH,
            "detection_model": settings.GFPGAN_DETECTION_MODEL,
            "parsing_model": settings.GFPGAN_PARSING_MODEL,
            "upscale": face_enhancer.upscale,
            "arch": face_enhancer.arch,
            "channel_multiplier": face_enhancer.channel_multiplier,
        }
    }
    return info


@app.post("/api/enhance")
async def enhance_image(
    file: UploadFile = File(..., description="Input image file"),
    outscale: float = Query(
        default=4.0,
        ge=1.0,
        le=8.0,
        description="Output scaling factor"
    ),
    face_enhance: bool = Query(
        default=False,
        description="Enable GFPGAN face enhancement"
    ),
    only_center_face: bool = Query(
        default=False,
        description="Process only the center face (requires face_enhance=true)"
    ),
    weight: float = Query(
        default=1.0,
        ge=0.0,
        le=1.0,
        description="Face restoration weight (0=original, 1=fully restored)"
    )
):
    """
    Enhance image using RealESRGAN and optionally GFPGAN for face enhancement.
    
    The service supports:
    - Various image formats (JPG, PNG, WebP, etc.)
    - RGBA images with transparency
    - Grayscale images
    - 16-bit images
    - Large images via automatic tiling
    
    Parameters:
    - file: Input image file
    - outscale: Output scale factor (1.0-8.0)
    - face_enhance: Enable face enhancement with GFPGAN
    - only_center_face: Process only center face (useful for portraits)
    - weight: Blend between original and restored face (0.0-1.0)
    
    Returns:
    - Enhanced image as PNG
    - Metadata in response headers
    """
    
    if not file.content_type or not file.content_type.startswith('image/'):
        raise HTTPException(
            status_code=400,
            detail="Uploaded file must be an image (JPEG, PNG, WebP, etc.)"
        )
    
    content = await file.read()
    max_size_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
    
    if len(content) > max_size_bytes:
        raise HTTPException(
            status_code=400,
            detail=f"Image too large. Maximum size is {settings.MAX_UPLOAD_SIZE_MB}MB"
        )
    
    try:
        logger.info(
            f"Processing request: file={file.filename}, "
            f"size={len(content)} bytes, scale={outscale}, "
            f"face_enhance={face_enhance}"
        )
        
        # Decode image from bytes
        nparr = np.frombuffer(content, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_UNCHANGED)
        
        if img is None:
            raise HTTPException(
                status_code=400,
                detail="Failed to decode image. File may be corrupted or unsupported format."
            )
        
        logger.info(f"Image decoded: shape={img.shape}, dtype={img.dtype}")
        start_time = time.time()
        
        # Process image with proper outscale handling
        if face_enhance:
            # Enhance with face restoration
            _, _, output = face_enhancer.enhance(
                img, 
                has_aligned=False, 
                only_center_face=only_center_face, 
                paste_back=True, 
                weight=weight,
                outscale=outscale
            )
            
            logger.info(f"Face enhancement applied with scale={outscale}")
        else:
            # Regular upscaling without face enhancement
            output, _ = upsampler.enhance(img, outscale=outscale)
            logger.info(f"Regular upscaling applied with scale={outscale}")
    
        # Encode result as PNG
        encode_params = [cv2.IMWRITE_PNG_COMPRESSION, 3]
        success, img_encoded = cv2.imencode('.png', output, encode_params)
        
        if not success:
            raise HTTPException(
                status_code=500,
                detail="Failed to encode output image"
            )
        
        result_bytes = img_encoded.tobytes()
        
        logger.info(
            f"Processing complete: output_size={len(result_bytes)} bytes, "
            f"output_shape={output.shape}"
        )
        
        # Prepare filename
        input_filename = Path(file.filename).stem
        output_filename = f"{input_filename}_enhanced.png"
        
        process_time = round(time.time() - start_time, 4)

        headers = {
            "Content-Disposition": f"attachment; filename={output_filename}",
            "X-Model-RealESRGAN-Scale": str(outscale),
            "X-Face-Enhance": str(face_enhance),
            "X-Only-Center-Face": str(only_center_face),
            "X-Face-Weight": str(weight),
            "X-Processing-Time": str(process_time),
            "X-Device": settings.DEVICE,
            "X-Model-RealESRGAN-Path": settings.REALESRGAN_PATH,
        }

        if face_enhance:
            headers.update({
                "X-Model-GFPGAN-Path": settings.GFPGAN_PATH,
                "X-Model-GFPGAN-Detection": settings.GFPGAN_DETECTION_MODEL,
                "X-Model-GFPGAN-Parsing": settings.GFPGAN_PARSING_MODEL,
            })

        return StreamingResponse(
            io.BytesIO(result_bytes),
            media_type="image/png",
            headers=headers
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Processing failed: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Image enhancement failed: {str(e)}"
        )


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )