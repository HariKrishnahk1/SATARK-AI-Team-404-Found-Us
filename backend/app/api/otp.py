from fastapi import APIRouter, HTTPException, status
from app.schemas.schemas import OTPSendRequest, OTPVerifyRequest
from app.services.otp_service import (
    create_and_store_otp,
    verify_stored_otp,
    send_gmail_otp,
    send_mobile_otp
)

router = APIRouter(prefix="/otp", tags=["OTP Security & Verification"])

@router.post("/send")
def send_otp(req: OTPSendRequest):
    """
    Generate and dispatch 6-digit OTP code via Gmail SMTP or Mobile SMS.
    """
    target = req.target.strip()
    if not target:
        raise HTTPException(status_code=400, detail="Target Email or Mobile number is required.")

    if req.type == "email":
        if "@" not in target or "." not in target:
            raise HTTPException(status_code=400, detail="Invalid Mail ID provided.")
        
        code, expires_at = create_and_store_otp(target)
        result = send_gmail_otp(target, code)
        return {
            "success": True,
            "target": target,
            "type": "email",
            "expires_in_seconds": 600,
            "method": result.get("method"),
            "message": result.get("message"),
            "demo_code": result.get("demo_code", code)
        }

    elif req.type == "mobile":
        digits = "".join(filter(str.isdigit, target))
        if len(digits) < 10:
            raise HTTPException(status_code=400, detail="Invalid 10-digit mobile number provided.")

        code, expires_at = create_and_store_otp(target)
        result = send_mobile_otp(target, code)
        return {
            "success": True,
            "target": target,
            "type": "mobile",
            "expires_in_seconds": 600,
            "method": result.get("method"),
            "message": result.get("message"),
            "demo_code": result.get("demo_code", code)
        }

    else:
        raise HTTPException(status_code=400, detail="Invalid OTP type specified. Must be 'email' or 'mobile'.")

@router.post("/verify")
def verify_otp(req: OTPVerifyRequest):
    """
    Verify submitted 6-digit OTP code for Email or Mobile.
    """
    target = req.target.strip()
    code = req.code.strip()

    if not target or not code:
        raise HTTPException(status_code=400, detail="Both target and OTP code are required.")

    is_valid, msg = verify_stored_otp(target, code)
    if not is_valid:
        raise HTTPException(status_code=400, detail=msg)

    return {
        "success": True,
        "verified": True,
        "target": target,
        "message": msg
    }
