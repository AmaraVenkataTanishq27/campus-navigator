from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import QRCheckpoint
from ..schemas import QRVerifyRequest, QRVerifyResponse

router = APIRouter(prefix="/api/v1/qr", tags=["QR"])

@router.post("/verify", response_model=QRVerifyResponse)
def verify_qr(req: QRVerifyRequest, db: Session = Depends(get_db)):
    code = req.qr_code.strip()
    checkpoint = db.query(QRCheckpoint).filter(QRCheckpoint.qr_code == code).first()
    if checkpoint:
        return QRVerifyResponse(
            success=True,
            checkpoint={
                "qr_code": checkpoint.qr_code,
                "name": checkpoint.name,
                "building_id": checkpoint.building_id,
                "floor_level": checkpoint.floor_level,
                "node_id": checkpoint.node_id,
                "coordinates": {"x": checkpoint.coord_x, "y": checkpoint.coord_y},
                "description": checkpoint.description,
                "status": checkpoint.status,
            },
        )
    return QRVerifyResponse(
        success=False,
        error=f"Unrecognized campus QR code: '{code}'.",
    )
