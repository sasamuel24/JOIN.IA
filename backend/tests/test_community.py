"""Tests for community endpoints."""

import pytest
from fastapi.testclient import TestClient
from unittest.mock import Mock, patch
import uuid
from datetime import datetime

from app.models.user import User


def test_get_community_stats_success(client: TestClient, auth_headers: dict, mock_get_current_user, mock_db_session):
    """Test GET /community/stats returns expected structure."""
    # Mock the repository calls
    with patch('app.modules.community.repository.get_active_users_count', return_value=5), \
         patch('app.modules.community.repository.get_posts_placeholder_count', return_value=0), \
         patch('app.modules.community.repository.get_active_now_placeholder_count', return_value=0):
        
        response = client.get("/api/v1/community/stats", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify response structure
        assert "miembros" in data
        assert "posts" in data
        assert "activosAhora" in data
        
        # Verify data types
        assert isinstance(data["miembros"], int)
        assert isinstance(data["posts"], int) 
        assert isinstance(data["activosAhora"], int)
        
        # Verify expected values from mocks
        assert data["miembros"] == 5
        assert data["posts"] == 0
        assert data["activosAhora"] == 0


def test_get_community_stats_requires_auth(client: TestClient):
    """Test GET /community/stats requires authentication."""
    response = client.get("/api/v1/community/stats")
    assert response.status_code == 403  # or 401 depending on fastapi security setup


def test_get_community_members_success(client: TestClient, auth_headers: dict, mock_get_current_user, mock_db_session):
    """Test GET /community/members returns expected structure."""
    # Create mock users
    mock_user = Mock(spec=User)
    mock_user.id = uuid.uuid4()
    mock_user.full_name = "Mock User"
    mock_user.title = "Mock Role"
    mock_user.created_at = datetime.now()
    
    # Mock the repository call
    with patch('app.modules.community.repository.get_community_members_paginated', 
               return_value=([mock_user], 1)):
        
        response = client.get("/api/v1/community/members", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify response structure
        assert "members" in data
        assert "total" in data
        assert "page" in data
        assert "page_size" in data
        assert "total_pages" in data
        
        # Verify pagination metadata
        assert isinstance(data["total"], int)
        assert isinstance(data["page"], int)
        assert isinstance(data["page_size"], int)
        assert isinstance(data["total_pages"], int)
        assert data["page"] == 1  # default page
        assert data["page_size"] == 20  # default page_size
        
        # Should have the mocked member
        assert data["total"] == 1
        assert len(data["members"]) == 1
        
        # Verify member structure
        member = data["members"][0]
        assert "id" in member
        assert "name" in member
        assert "role" in member
        assert "avatar_url" in member
        assert "joined_at" in member


def test_get_community_members_with_search(client: TestClient, auth_headers: dict, mock_get_current_user, mock_db_session):
    """Test GET /community/members with search parameter."""
    # Create mock user matching search
    mock_user = Mock(spec=User)
    mock_user.id = uuid.uuid4()
    mock_user.full_name = "John Developer"
    mock_user.title = "Senior Developer"
    mock_user.created_at = datetime.now()
    
    # Mock the repository call
    with patch('app.modules.community.repository.get_community_members_paginated', 
               return_value=([mock_user], 1)):
        
        # Test search by name
        response = client.get(
            "/api/v1/community/members?search=John",
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Should find the user with "John" in name
        assert data["total"] == 1
        found_john = any("John" in member["name"] for member in data["members"])
        assert found_john


def test_get_community_members_pagination(client: TestClient, auth_headers: dict, mock_get_current_user, mock_db_session):
    """Test GET /community/members pagination works correctly."""
    # Create mock users for pagination test
    mock_users = []
    for i in range(2):  # Simulate first page of 2 users
        mock_user = Mock(spec=User)
        mock_user.id = uuid.uuid4()
        mock_user.full_name = f"User {i}"
        mock_user.title = f"Role {i}"
        mock_user.created_at = datetime.now()
        mock_users.append(mock_user)
    
    # Mock the repository call for pagination
    with patch('app.modules.community.repository.get_community_members_paginated', 
               return_value=(mock_users, 5)):  # 2 users returned, 5 total
        
        # Test pagination with page_size=2
        response = client.get(
            "/api/v1/community/members?page=1&page_size=2",
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["page"] == 1
        assert data["page_size"] == 2
        assert len(data["members"]) == 2
        assert data["total"] == 5
        assert data["total_pages"] == 3  # ceil(5/2) = 3


def test_get_community_members_requires_auth(client: TestClient):
    """Test GET /community/members requires authentication."""
    response = client.get("/api/v1/community/members")
    assert response.status_code == 403  # or 401 depending on fastapi security setup


def test_get_community_members_pagination_params_validation(client: TestClient, auth_headers: dict, mock_get_current_user, mock_db_session):
    """Test pagination parameter validation."""
    # Test invalid page number
    response = client.get(
        "/api/v1/community/members?page=0",
        headers=auth_headers
    )
    assert response.status_code == 422  # Validation error
    
    # Test invalid page size (too large)
    response = client.get(
        "/api/v1/community/members?page_size=150",
        headers=auth_headers
    )
    assert response.status_code == 422  # Validation error