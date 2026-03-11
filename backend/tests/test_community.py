"""Tests for community endpoints."""

import pytest
from fastapi.testclient import TestClient
from unittest.mock import Mock, patch
import uuid
from datetime import datetime

from app.models.user import User
from app.models.community_resource import CommunityResource


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


# ============================================================================
# Community Resources Tests
# ============================================================================

def test_get_community_resources_success(client: TestClient, auth_headers: dict, mock_get_current_user, mock_db_session):
    """Test GET /community/resources returns expected structure."""
    # Create mock resources
    mock_resource = Mock(spec=CommunityResource)
    mock_resource.id = uuid.uuid4()
    mock_resource.title = "Test Guide"
    mock_resource.slug = "test-guide"
    mock_resource.description = "A test guide description"
    mock_resource.resource_type = "guide"
    mock_resource.category = "productivity"
    mock_resource.thumbnail_url = None
    mock_resource.resource_url = "https://example.com"
    mock_resource.author_name = "Test Author"
    mock_resource.is_featured = True
    mock_resource.published_at = datetime.now()
    
    # Mock the repository call
    with patch('app.modules.community.repository.get_community_resources_paginated', 
               return_value=([mock_resource], 1)):
        
        response = client.get("/api/v1/community/resources", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify response structure
        assert "resources" in data
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
        
        # Should have the mocked resource
        assert data["total"] == 1
        assert len(data["resources"]) == 1
        
        # Verify resource structure
        resource = data["resources"][0]
        assert "id" in resource
        assert "title" in resource
        assert "slug" in resource
        assert "description" in resource
        assert "type" in resource
        assert "category" in resource
        assert "thumbnail_url" in resource
        assert "resource_url" in resource
        assert "author_name" in resource
        assert "is_featured" in resource
        assert "published_at" in resource


def test_get_community_resources_with_search(client: TestClient, auth_headers: dict, mock_get_current_user, mock_db_session):
    """Test GET /community/resources with search parameter."""
    # Create mock resource matching search
    mock_resource = Mock(spec=CommunityResource)
    mock_resource.id = uuid.uuid4()
    mock_resource.title = "Productivity Guide"
    mock_resource.slug = "productivity-guide"
    mock_resource.description = "A comprehensive guide to productivity"
    mock_resource.resource_type = "guide"
    mock_resource.category = "productivity"
    mock_resource.thumbnail_url = None
    mock_resource.resource_url = None
    mock_resource.author_name = "Expert Author"
    mock_resource.is_featured = False
    mock_resource.published_at = datetime.now()
    
    # Mock the repository call
    with patch('app.modules.community.repository.get_community_resources_paginated', 
               return_value=([mock_resource], 1)):
        
        # Test search by title
        response = client.get(
            "/api/v1/community/resources?search=productivity",
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Should find the resource with "productivity" in title
        assert data["total"] == 1
        found_resource = any("productivity" in resource["title"].lower() for resource in data["resources"])
        assert found_resource


def test_get_community_resources_with_type_filter(client: TestClient, auth_headers: dict, mock_get_current_user, mock_db_session):
    """Test GET /community/resources with type filter."""
    # Create mock video resource
    mock_resource = Mock(spec=CommunityResource)
    mock_resource.id = uuid.uuid4()
    mock_resource.title = "Video Tutorial"
    mock_resource.slug = "video-tutorial"
    mock_resource.description = "A helpful video tutorial"
    mock_resource.resource_type = "video"
    mock_resource.category = "tutorial"
    mock_resource.thumbnail_url = None
    mock_resource.resource_url = "https://youtube.com/watch"
    mock_resource.author_name = "Video Creator"
    mock_resource.is_featured = False
    mock_resource.published_at = datetime.now()
    
    # Mock the repository call
    with patch('app.modules.community.repository.get_community_resources_paginated', 
               return_value=([mock_resource], 1)):
        
        # Test type filter
        response = client.get(
            "/api/v1/community/resources?type=video",
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Should find only video resources
        assert data["total"] == 1
        assert data["resources"][0]["type"] == "video"


def test_get_community_resources_with_category_filter(client: TestClient, auth_headers: dict, mock_get_current_user, mock_db_session):
    """Test GET /community/resources with category filter."""
    # Create mock resource with specific category
    mock_resource = Mock(spec=CommunityResource)
    mock_resource.id = uuid.uuid4()
    mock_resource.title = "Template Resource"
    mock_resource.slug = "template-resource"
    mock_resource.description = "A useful template"
    mock_resource.resource_type = "template"
    mock_resource.category = "automation"
    mock_resource.thumbnail_url = None
    mock_resource.resource_url = None
    mock_resource.author_name = "Template Author"
    mock_resource.is_featured = False
    mock_resource.published_at = datetime.now()
    
    # Mock the repository call
    with patch('app.modules.community.repository.get_community_resources_paginated', 
               return_value=([mock_resource], 1)):
        
        # Test category filter
        response = client.get(
            "/api/v1/community/resources?category=automation",
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Should find only resources in automation category
        assert data["total"] == 1
        assert data["resources"][0]["category"] == "automation"


def test_get_community_resources_pagination(client: TestClient, auth_headers: dict, mock_get_current_user, mock_db_session):
    """Test GET /community/resources pagination works correctly."""
    # Create mock resources for pagination test
    mock_resources = []
    for i in range(2):  # Simulate first page of 2 resources
        mock_resource = Mock(spec=CommunityResource)
        mock_resource.id = uuid.uuid4()
        mock_resource.title = f"Resource {i}"
        mock_resource.slug = f"resource-{i}"
        mock_resource.description = f"Description for resource {i}"
        mock_resource.resource_type = "guide"
        mock_resource.category = "test"
        mock_resource.thumbnail_url = None
        mock_resource.resource_url = None
        mock_resource.author_name = f"Author {i}"
        mock_resource.is_featured = False
        mock_resource.published_at = datetime.now()
        mock_resources.append(mock_resource)
    
    # Mock the repository call for pagination
    with patch('app.modules.community.repository.get_community_resources_paginated', 
               return_value=(mock_resources, 5)):  # 2 resources returned, 5 total
        
        # Test pagination with page_size=2
        response = client.get(
            "/api/v1/community/resources?page=1&page_size=2",
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["page"] == 1
        assert data["page_size"] == 2
        assert len(data["resources"]) == 2
        assert data["total"] == 5
        assert data["total_pages"] == 3  # ceil(5/2) = 3


def test_get_community_resources_requires_auth(client: TestClient):
    """Test GET /community/resources requires authentication."""
    response = client.get("/api/v1/community/resources")
    assert response.status_code == 403  # or 401 depending on fastapi security setup


def test_get_community_resources_pagination_params_validation(client: TestClient, auth_headers: dict, mock_get_current_user, mock_db_session):
    """Test resources pagination parameter validation."""
    # Test invalid page number
    response = client.get(
        "/api/v1/community/resources?page=0",
        headers=auth_headers
    )
    assert response.status_code == 422  # Validation error
    
    # Test invalid page size (too large)
    response = client.get(
        "/api/v1/community/resources?page_size=150",
        headers=auth_headers
    )
    assert response.status_code == 422  # Validation error


def test_get_community_resources_empty_results(client: TestClient, auth_headers: dict, mock_get_current_user, mock_db_session):
    """Test GET /community/resources with no published resources."""
    # Mock empty results
    with patch('app.modules.community.repository.get_community_resources_paginated', 
               return_value=([], 0)):
        
        response = client.get("/api/v1/community/resources", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["resources"] == []
        assert data["total"] == 0
        assert data["page"] == 1
        assert data["page_size"] == 20
        assert data["total_pages"] == 0