"""Test configuration and fixtures."""

import pytest
from fastapi.testclient import TestClient
from unittest.mock import Mock, patch
from jose import jwt

from app.core.config import settings
from app.main import app
from app.models.user import User
import uuid
from datetime import datetime


@pytest.fixture(scope="function")
def client():
    """Create a test client."""
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture
def sample_user():
    """Create a mock sample user for testing."""
    user = Mock(spec=User)
    user.id = uuid.uuid4()
    user.email = "test@example.com"
    user.full_name = "Test User"
    user.title = "Software Engineer"
    user.company = "Test Company"
    user.is_active = True
    user.provider = "local"
    user.created_at = datetime.now()
    return user


@pytest.fixture
def auth_headers(sample_user):
    """Create authentication headers for testing."""
    # Generate a proper JWT token for testing
    token_data = {"sub": str(sample_user.id)}
    token = jwt.encode(token_data, settings.SECRET_KEY, algorithm="HS256")
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def mock_get_current_user(sample_user):
    """Mock the get_current_user dependency."""
    from app.core.deps import get_current_user, get_db
    from app.main import app
    
    def override_get_current_user():
        return sample_user
        
    def override_get_db():
        return Mock()
    
    app.dependency_overrides[get_current_user] = override_get_current_user
    app.dependency_overrides[get_db] = override_get_db
    
    yield sample_user
    
    # Clean up overrides
    if get_current_user in app.dependency_overrides:
        del app.dependency_overrides[get_current_user]
    if get_db in app.dependency_overrides:
        del app.dependency_overrides[get_db]


@pytest.fixture  
def mock_db_session():
    """Mock database session."""
    return Mock()