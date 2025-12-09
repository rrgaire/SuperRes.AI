
import sys
import torch
import onnx
import onnxruntime as ort
import numpy as np
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from models.torch.image_enhancer.realesrgan import RRDBNet


def convert_realesrgan_to_onnx(
    pytorch_model_path: str,
    onnx_output_path: str,
    input_size: int = 512,
    scale: int = 4
):
    """
    Convert RealESRGAN PyTorch checkpoint to ONNX format.
    
    Args:
        pytorch_model_path: Path to the .pth checkpoint file
        onnx_output_path: Path where the .onnx file will be saved
        input_size: Input dimension for tracing (height and width)
        scale: Upscaling factor of the model (2 or 4)
    
    Returns:
        bool: True if conversion successful, False otherwise
    """
    
    pytorch_path = Path(pytorch_model_path)
    onnx_path = Path(onnx_output_path)
    
    if not pytorch_path.exists():
        print(f"Error: PyTorch model not found at {pytorch_path}")
        return False
    
    onnx_path.parent.mkdir(parents=True, exist_ok=True)
    
    print(f"Loading PyTorch model from: {pytorch_path}")
    
    # Initialize model architecture matching RealESRGAN x4plus
    model = RRDBNet(
        num_in_ch=3,
        num_out_ch=3,
        num_feat=64,
        num_block=23,
        num_grow_ch=32,
        scale=scale
    )
    
    # Load checkpoint weights
    checkpoint = torch.load(pytorch_path, map_location='cpu')
    
    # Handle different checkpoint formats
    # Training checkpoints typically use 'params_ema' or 'params' keys
    if 'params_ema' in checkpoint:
        print("Loading weights from 'params_ema' key")
        model.load_state_dict(checkpoint['params_ema'], strict=True)
    elif 'params' in checkpoint:
        print("Loading weights from 'params' key")
        model.load_state_dict(checkpoint['params'], strict=True)
    else:
        print("Loading weights directly from checkpoint")
        model.load_state_dict(checkpoint, strict=True)
    
    model.eval()
    print("Model loaded successfully")
    
    # Create dummy input tensor for ONNX tracing
    # Shape: [batch_size, channels, height, width]
    dummy_input = torch.randn(1, 3, input_size, input_size)
    
    print(f"Converting to ONNX format...")
    print(f"  Input shape: (1, 3, {input_size}, {input_size})")
    print(f"  Scale factor: {scale}x")
    print(f"  Expected output: (1, 3, {input_size * scale}, {input_size * scale})")
    
    # Export model to ONNX format
    torch.onnx.export(
        model,
        dummy_input,
        str(onnx_path),
        export_params=True,
        opset_version=17,
        do_constant_folding=True,
        input_names=['input'],
        output_names=['output'],
        dynamic_axes={
            'input': {0: 'batch', 2: 'height', 3: 'width'},
            'output': {0: 'batch', 2: 'height', 3: 'width'}
        }
    )
    
    print(f"ONNX model saved to: {onnx_path}")
    
    # Verify the converted model
    print("Verifying ONNX model...")
    
    try:
        # Check model structure is valid
        onnx_model = onnx.load(str(onnx_path))
        onnx.checker.check_model(onnx_model)
        print("  Model structure: Valid")
        
        # Test inference with ONNX Runtime
        session = ort.InferenceSession(
            str(onnx_path),
            providers=['CPUExecutionProvider']
        )
        
        # Run test inference
        test_input = np.random.randn(1, 3, input_size, input_size).astype(np.float32)
        outputs = session.run(None, {'input': test_input})
        
        actual_shape = outputs[0].shape
        expected_shape = (1, 3, input_size * scale, input_size * scale)
        
        print(f"  Test inference: Success")
        print(f"  Output shape: {actual_shape}")
        
        # Verify output dimensions match expected scale
        if actual_shape == expected_shape:
            print(f"  Scale verification: Passed")
        else:
            print(f"  Warning: Output shape {actual_shape} != expected {expected_shape}")
        
        print("\nConversion completed successfully")
        print(f"ONNX model ready at: {onnx_path.absolute()}")
        
        return True
        
    except Exception as e:
        print(f"\nVerification failed: {e}")
        return False


if __name__ == '__main__':
    import argparse
    
    parser = argparse.ArgumentParser(
        description='Convert RealESRGAN PyTorch model to ONNX format for production deployment'
    )
    parser.add_argument(
        '--input',
        required=True,
        help='Path to input PyTorch checkpoint (.pth file)'
    )
    parser.add_argument(
        '--output',
        required=True,
        help='Path to output ONNX model (.onnx file)'
    )
    parser.add_argument(
        '--size',
        type=int,
        default=512,
        help='Input size for model tracing (default: 512)'
    )
    parser.add_argument(
        '--scale',
        type=int,
        default=4,
        choices=[2, 4],
        help='Model upscaling factor (default: 4)'
    )
    
    args = parser.parse_args()
    
    success = convert_realesrgan_to_onnx(
        pytorch_model_path=args.input,
        onnx_output_path=args.output,
        input_size=args.size,
        scale=args.scale
    )
    
    sys.exit(0 if success else 1)