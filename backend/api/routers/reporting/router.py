from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Session, select
from typing import List, Optional
from datetime import datetime, timedelta, date
import logging

from api.db import get_db
from api.dependencies import get_current_user
from api.models.user.model import User, UserRole
from .schemas import (
    SalesTimeSeries,
    CategorySalesReport,
    SellerPerformanceReport,
    TransactionStats,
    UserSalesSummary,
    UserItemsStatusCount,
    SellerSalesPerformance,
)
from .analytics import (
    get_sales_time_series,
    get_category_sales,
    get_seller_performance,
    get_transaction_statistics,
    get_user_sales_summary,
    get_user_items_by_status,
    get_seller_sales_chart_data,
)

# Create router with proper prefixes and tags
router = APIRouter(tags=["Reporting"], responses={404: {"description": "Not found"}})


# Helper function to parse date strings
def parse_date_param(date_str: Optional[str]) -> Optional[datetime]:
    """Parse date string into datetime object"""
    if not date_str:
        return None
    try:
        return datetime.strptime(date_str, "%Y-%m-%d")
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid date format. Use YYYY-MM-DD",
        )


# System-level reporting endpoints (admin only)
@router.get(
    "/system/sales/time-series",
    response_model=SalesTimeSeries,
    summary="Get system-wide sales time series data",
)
async def system_sales_time_series(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get time series data for all sales in the system.

    Only available to admin users.
    """
    # Check if user is admin
    if current_user.role != UserRole.admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required"
        )

    # Parse date parameters
    start = parse_date_param(start_date)
    end = parse_date_param(end_date)

    # Get time series data
    return get_sales_time_series(db, start, end)


@router.get(
    "/system/sales/categories",
    response_model=CategorySalesReport,
    summary="Get system-wide sales by category",
)
async def system_sales_by_category(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get breakdown of sales by category across the entire system.

    Only available to admin users.
    """
    # Check if user is admin
    if current_user.role != UserRole.admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required"
        )

    # Parse date parameters
    start = parse_date_param(start_date)
    end = parse_date_param(end_date)

    # Get category sales data
    return get_category_sales(db, start, end, limit)


@router.get(
    "/user/sales/performance",
    response_model=SellerPerformanceReport,
    summary="Get top seller performance metrics",
)
async def top_seller_performance(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get performance metrics for top sellers in the system.

    Only available to admin users.
    """
    # Check if user is admin
    """
    if current_user.role != UserRole.admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required"
        )
    """

    # Parse date parameters
    start = parse_date_param(start_date)
    end = parse_date_param(end_date)

    # Get seller performance data
    return get_seller_performance(db, start, end, limit)


@router.get(
    "/system/transactions/stats",
    response_model=TransactionStats,
    summary="Get system-wide transaction statistics",
)
async def system_transaction_statistics(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get statistics about all transactions in the system.

    Only available to admin users.
    """
    # Check if user is admin
    if current_user.role != UserRole.admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required"
        )

    # Parse date parameters
    start = parse_date_param(start_date)
    end = parse_date_param(end_date)

    # Get transaction statistics
    return get_transaction_statistics(db, None, start, end)


# User-level reporting endpoints (available to all authenticated users)
@router.get(
    "/user/sales/time-series",
    response_model=SalesTimeSeries,
    summary="Get user's sales time series data",
)
async def user_sales_time_series(
    is_seller: bool = Query(
        True,
        description="If true, show sales as seller, if false, show purchases as buyer",
    ),
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get time series data for the current user's sales or purchases.
    """
    # Parse date parameters
    start = parse_date_param(start_date)
    end = parse_date_param(end_date)

    # Get time series data for the user
    return get_sales_time_series(db, start, end, current_user.user_id, is_seller)


@router.get(
    "/user/transactions/stats",
    response_model=TransactionStats,
    summary="Get current user's transaction statistics",
)
async def user_transaction_statistics(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get statistics about the current user's transactions.
    """
    # Parse date parameters
    start = parse_date_param(start_date)
    end = parse_date_param(end_date)

    # Get transaction statistics for the user
    return get_transaction_statistics(db, current_user.user_id, start, end)


@router.get(
    "/user/summary",
    response_model=UserSalesSummary,
    summary="Get current user's sales summary",
)
async def user_sales_summary(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get a summary of the current user's sales and purchases.
    """
    # Parse date parameters
    start = parse_date_param(start_date)
    end = parse_date_param(end_date)

    # Get user sales summary
    return get_user_sales_summary(db, current_user.user_id, start, end)


@router.get(
    "/user/items/status",
    response_model=UserItemsStatusCount,
    summary="Get counts of current user's items by status"
)
async def user_items_by_status(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get counts of the current user's items grouped by their status (for_sale, sold, removed, draft).
    
    Returns a breakdown of how many items the user has in each status category.
    """
    # Get item status counts for the current user
    status_counts = get_user_items_by_status(db, current_user.user_id)
    
    if not status_counts:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    return status_counts


# Admin endpoint to view any user's summary
@router.get(
    "/user/{user_id}/summary",
    response_model=UserSalesSummary,
    summary="Get a specific user's sales summary (admin only)",
)
async def specific_user_sales_summary(
    user_id: int,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get a summary of a specific user's sales and purchases.

    Only available to admin users.
    """
    # Check if user is admin
    if current_user.role != UserRole.admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required"
        )

    # Check if requested user exists using SQLModel select
    user_statement = select(User).where(User.user_id == user_id)
    user = db.exec(user_statement).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    # Parse date parameters
    start = parse_date_param(start_date)
    end = parse_date_param(end_date)

    # Get user sales summary
    summary = get_user_sales_summary(db, user_id, start, end)
    if not summary:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    return summary


@router.get(
    "/user/seller/sales/chart",
    response_model=SellerSalesPerformance,
    summary="Get sales chart data for the current seller user"
)
async def seller_sales_chart(
    time_range: str = Query(
        "7_days",
        description="Time range for chart data (7_days, 30_days, 90_days, this_year)"
    ),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get daily sales data formatted for chart visualization for the currently logged-in seller.
    
    This endpoint returns data specifically designed for rendering a sales performance chart:
    - Daily sales amounts for the specified time period
    - Dates formatted appropriately for the selected time period
    - Sales statistics: total, average daily, and highest daily
    
    The time_range parameter can be:
    - 7_days: Last 7 days (dates formatted as day names, e.g., Mon, Tue)
    - 30_days: Last 30 days (dates formatted as day and month, e.g., 01 Jan)
    - 90_days: Last 90 days (dates formatted as day and month, e.g., 01 Jan)
    - this_year: Current year (dates formatted as month names, e.g., Jan, Feb)
    """
    # Check if time_range is valid
    if time_range not in ["7_days", "30_days", "90_days", "this_year"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid time range. Must be one of: 7_days, 30_days, 90_days, this_year"
        )
    
    # Get sales chart data for the current user
    chart_data = get_seller_sales_chart_data(db, current_user.user_id, time_range)
    
    if not chart_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return chart_data
