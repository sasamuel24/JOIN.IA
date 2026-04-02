from __future__ import annotations

import uuid
from typing import BinaryIO

import boto3
from botocore.config import Config
from botocore.exceptions import ClientError
from fastapi import HTTPException

from app.core.config import settings

_BOTO_CONFIG = Config(
    connect_timeout=10,
    read_timeout=30,
    retries={"max_attempts": 1},
)


def _client():
    return boto3.client(
        "s3",
        region_name=settings.AWS_REGION,
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
        config=_BOTO_CONFIG,
    )


def upload_resource_thumbnail(file_bytes: bytes, content_type: str) -> str:
    """Upload resource thumbnail to S3 and return the public URL."""
    ext = content_type.split("/")[-1].replace("jpeg", "jpg")
    key = f"resources/{uuid.uuid4().hex}.{ext}"

    try:
        _client().put_object(
            Bucket=settings.AWS_S3_BUCKET_NAME,
            Key=key,
            Body=file_bytes,
            ContentType=content_type,
        )
    except ClientError as e:
        raise HTTPException(status_code=500, detail=f"S3 upload failed: {e}")

    return f"https://{settings.AWS_S3_BUCKET_NAME}.s3.{settings.AWS_REGION}.amazonaws.com/{key}"


def upload_avatar(file_bytes: bytes, content_type: str, user_id: str) -> str:
    """Upload avatar to S3 and return the public URL."""
    ext = content_type.split("/")[-1].replace("jpeg", "jpg")
    key = f"avatars/{user_id}/{uuid.uuid4().hex}.{ext}"

    try:
        _client().put_object(
            Bucket=settings.AWS_S3_BUCKET_NAME,
            Key=key,
            Body=file_bytes,
            ContentType=content_type,
        )
    except ClientError as e:
        raise HTTPException(status_code=500, detail=f"S3 upload failed: {e}")

    return f"https://{settings.AWS_S3_BUCKET_NAME}.s3.{settings.AWS_REGION}.amazonaws.com/{key}"
