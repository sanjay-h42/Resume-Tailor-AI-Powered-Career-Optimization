from fastapi import APIRouter, Depends, BackgroundTasks, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
import json
from .. import models, schemas, database
from ..ai_service import process_resume_optimization

router = APIRouter(prefix="/api/optimize", tags=["Optimize"])

@router.post("/", response_model=schemas.OptimizeResponse)
async def submit_optimization(
    request: schemas.OptimizeRequest, 
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(database.get_db)
):
    # Enforce privacy by saving directly to local DB
    db_request = models.OptimizationRequest(
        user_id=request.user_id,
        resume_text=request.resume_text,
        job_description=request.job_description,
        status="processing"
    )
    db.add(db_request)
    await db.commit()
    await db.refresh(db_request)
    
    # Process asynchronously
    background_tasks.add_task(process_resume_optimization, db_request.id)
    
    return db_request

@router.get("/{request_id}", response_model=schemas.OptimizationResult)
async def get_optimization_status(request_id: int, db: AsyncSession = Depends(database.get_db)):
    result = await db.execute(select(models.OptimizationRequest).where(models.OptimizationRequest.id == request_id))
    db_request = result.scalars().first()
    
    if not db_request:
        raise HTTPException(status_code=404, detail="Request not found")
        
    return db_request
