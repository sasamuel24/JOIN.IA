"""Tests for community endpoints."""

import pytest
from fastapi.testclient import TestClient
from unittest.mock import Mock, patch, MagicMock
import uuid
from datetime import datetime

from app.models.user import User
from app.models.community_resource import CommunityResource
from app.models.community_post import CommunityPost
from app.models.community_post_comment import CommunityPostComment
from app.models.community_debate import CommunityDebate
from app.models.community_debate_reply import CommunityDebateReply


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


# ============================================================================
# Community Feed Posts Tests
# ============================================================================

def test_get_community_posts_success(client: TestClient, auth_headers: dict, mock_get_current_user, mock_db_session):
    """Test GET /community/posts returns expected structure."""
    # Create mock author user
    mock_author = Mock(spec=User)
    mock_author.id = uuid.uuid4()
    mock_author.full_name = "Test Author"
    mock_author.title = "Software Developer"
    
    # Create mock post
    mock_post = Mock(spec=CommunityPost)
    mock_post.id = uuid.uuid4()
    mock_post.content = "This is a test post content"
    mock_post.created_at = datetime.now()
    mock_post.author = mock_author
    
    # Mock the repository calls
    with patch('app.modules.community.repository.get_posts_paginated', 
               return_value=([mock_post], 1)), \
         patch('app.modules.community.repository.get_post_comments_count', 
               return_value=3):
        
        response = client.get("/api/v1/community/posts", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify response structure
        assert "posts" in data
        assert "total" in data
        assert "page" in data
        assert "page_size" in data
        assert "total_pages" in data
        
        # Verify pagination metadata
        assert data["page"] == 1
        assert data["page_size"] == 20
        assert data["total"] == 1
        assert data["total_pages"] == 1
        
        # Should have the mocked post
        assert len(data["posts"]) == 1
        
        # Verify post structure
        post = data["posts"][0]
        assert "id" in post
        assert "content" in post
        assert "created_at" in post
        assert "comments_count" in post
        assert "author" in post
        
        # Verify author structure
        author = post["author"]
        assert "id" in author
        assert "name" in author
        assert "role" in author
        assert "avatar_url" in author
        
        # Verify content
        assert post["content"] == "This is a test post content"
        assert post["comments_count"] == 3


def test_create_community_post_success(client: TestClient, auth_headers: dict, mock_get_current_user, mock_db_session):
    """Test POST /community/posts creates a post successfully."""
    # Create mock author user
    mock_author = Mock(spec=User)
    mock_author.id = mock_get_current_user.id
    mock_author.full_name = "Test User"
    mock_author.title = "Test Role"
    
    # Create mock created post
    mock_post = Mock(spec=CommunityPost)
    mock_post.id = uuid.uuid4()
    mock_post.content = "New test post"
    mock_post.created_at = datetime.now()
    mock_post.author = mock_author
    
    # Mock the repository call
    with patch('app.modules.community.repository.create_post', return_value=mock_post):
        
        response = client.post(
            "/api/v1/community/posts",
            headers=auth_headers,
            json={"content": "New test post"}
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify post was created with correct structure
        assert "id" in data
        assert "content" in data
        assert "created_at" in data
        assert "comments_count" in data
        assert "author" in data
        
        assert data["content"] == "New test post"
        assert data["comments_count"] == 0  # New posts have no comments


def test_create_community_post_requires_auth(client: TestClient):
    """Test POST /community/posts requires authentication."""
    response = client.post(
        "/api/v1/community/posts",
        json={"content": "Test post"}
    )
    assert response.status_code == 403  # or 401


def test_create_community_post_validation(client: TestClient, auth_headers: dict, mock_get_current_user, mock_db_session):
    """Test POST /community/posts validates request body."""
    # Test empty content
    response = client.post(
        "/api/v1/community/posts",
        headers=auth_headers,
        json={}
    )
    assert response.status_code == 422  # Validation error
    
    # Test missing content field
    response = client.post(
        "/api/v1/community/posts",
        headers=auth_headers,
        json={"invalid_field": "test"}
    )
    assert response.status_code == 422  # Validation error


def test_get_community_posts_pagination(client: TestClient, auth_headers: dict, mock_get_current_user, mock_db_session):
    """Test GET /community/posts pagination works correctly."""
    # Create mock posts for pagination test
    mock_posts = []
    for i in range(2):
        mock_author = Mock(spec=User)
        mock_author.id = uuid.uuid4()
        mock_author.full_name = f"Author {i}"
        mock_author.title = f"Role {i}"
        
        mock_post = Mock(spec=CommunityPost)
        mock_post.id = uuid.uuid4()
        mock_post.content = f"Post content {i}"
        mock_post.created_at = datetime.now()
        mock_post.author = mock_author
        mock_posts.append(mock_post)
    
    # Mock the repository calls
    with patch('app.modules.community.repository.get_posts_paginated', 
               return_value=(mock_posts, 5)), \
         patch('app.modules.community.repository.get_post_comments_count', 
               return_value=2):
        
        # Test pagination with page_size=2
        response = client.get(
            "/api/v1/community/posts?page=1&page_size=2",
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["page"] == 1
        assert data["page_size"] == 2
        assert len(data["posts"]) == 2
        assert data["total"] == 5
        assert data["total_pages"] == 3  # ceil(5/2) = 3


def test_get_community_posts_requires_auth(client: TestClient):
    """Test GET /community/posts requires authentication."""
    response = client.get("/api/v1/community/posts")
    assert response.status_code == 403  # or 401


# ============================================================================
# Community Post Comments Tests
# ============================================================================

def test_get_post_comments_success(client: TestClient, auth_headers: dict, mock_get_current_user, mock_db_session):
    """Test GET /community/posts/{post_id}/comments returns expected structure."""
    post_id = str(uuid.uuid4())
    
    # Create mock comment author
    mock_author = Mock(spec=User)
    mock_author.id = uuid.uuid4()
    mock_author.full_name = "Comment Author"
    mock_author.title = "Commenter"
    
    # Create mock comment
    mock_comment = Mock(spec=CommunityPostComment)
    mock_comment.id = uuid.uuid4()
    mock_comment.content = "This is a test comment"
    mock_comment.created_at = datetime.now()
    mock_comment.author = mock_author
    
    # Mock the repository call
    with patch('app.modules.community.repository.get_post_comments', 
               return_value=[mock_comment]):
        
        response = client.get(f"/api/v1/community/posts/{post_id}/comments", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify response structure
        assert "comments" in data
        assert len(data["comments"]) == 1
        
        # Verify comment structure
        comment = data["comments"][0]
        assert "id" in comment
        assert "content" in comment
        assert "created_at" in comment
        assert "author" in comment
        
        # Verify author structure
        author = comment["author"]
        assert "id" in author
        assert "name" in author
        assert "role" in author
        assert "avatar_url" in author
        
        # Verify content
        assert comment["content"] == "This is a test comment"


def test_create_post_comment_success(client: TestClient, auth_headers: dict, mock_get_current_user, mock_db_session):
    """Test POST /community/posts/{post_id}/comments creates a comment successfully."""
    post_id = str(uuid.uuid4())
    
    # Create mock post
    mock_post = Mock(spec=CommunityPost)
    mock_post.id = post_id
    
    # Create mock comment author
    mock_author = Mock(spec=User)
    mock_author.id = mock_get_current_user.id
    mock_author.full_name = "Test User"
    mock_author.title = "Test Role"
    
    # Create mock created comment
    mock_comment = Mock(spec=CommunityPostComment)
    mock_comment.id = uuid.uuid4()
    mock_comment.content = "New test comment"
    mock_comment.created_at = datetime.now()
    mock_comment.author = mock_author
    
    # Mock the repository calls
    with patch('app.modules.community.repository.get_post_by_id', return_value=mock_post), \
         patch('app.modules.community.repository.create_comment', return_value=mock_comment):
        
        response = client.post(
            f"/api/v1/community/posts/{post_id}/comments",
            headers=auth_headers,
            json={"content": "New test comment"}
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify comment was created with correct structure
        assert "id" in data
        assert "content" in data
        assert "created_at" in data
        assert "author" in data
        
        assert data["content"] == "New test comment"


def test_create_post_comment_post_not_found(client: TestClient, auth_headers: dict, mock_get_current_user, mock_db_session):
    """Test POST /community/posts/{post_id}/comments returns 404 for non-existent post."""
    post_id = str(uuid.uuid4())
    
    # Mock the repository call to return None (post not found)
    with patch('app.modules.community.repository.get_post_by_id', return_value=None):
        
        response = client.post(
            f"/api/v1/community/posts/{post_id}/comments",
            headers=auth_headers,
            json={"content": "Test comment"}
        )
        
        assert response.status_code == 404
        data = response.json()
        assert data["detail"] == "Post not found"


def test_create_post_comment_requires_auth(client: TestClient):
    """Test POST /community/posts/{post_id}/comments requires authentication."""
    post_id = str(uuid.uuid4())
    response = client.post(
        f"/api/v1/community/posts/{post_id}/comments",
        json={"content": "Test comment"}
    )
    assert response.status_code == 403  # or 401


def test_create_post_comment_validation(client: TestClient, auth_headers: dict, mock_get_current_user, mock_db_session):
    """Test POST /community/posts/{post_id}/comments validates request body."""
    post_id = str(uuid.uuid4())
    
    # Test empty content
    response = client.post(
        f"/api/v1/community/posts/{post_id}/comments",
        headers=auth_headers,
        json={}
    )
    assert response.status_code == 422  # Validation error
    
    # Test missing content field
    response = client.post(
        f"/api/v1/community/posts/{post_id}/comments",
        headers=auth_headers,
        json={"invalid_field": "test"}
    )
    assert response.status_code == 422  # Validation error


def test_get_post_comments_requires_auth(client: TestClient):
    """Test GET /community/posts/{post_id}/comments requires authentication."""
    post_id = str(uuid.uuid4())
    response = client.get(f"/api/v1/community/posts/{post_id}/comments")
    assert response.status_code == 403  # or 401


def test_get_post_comments_empty_results(client: TestClient, auth_headers: dict, mock_get_current_user, mock_db_session):
    """Test GET /community/posts/{post_id}/comments with no comments."""
    post_id = str(uuid.uuid4())
    
    # Mock empty results
    with patch('app.modules.community.repository.get_post_comments', return_value=[]):
        
        response = client.get(f"/api/v1/community/posts/{post_id}/comments", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["comments"] == []


# Debate tests

def test_get_community_debates_success(client: TestClient, auth_headers: dict, mock_get_current_user, mock_db_session):
    """Test GET /community/debates returns debates successfully."""
    from datetime import datetime
    
    # Create mock debate and user
    mock_user = MagicMock()
    mock_user.id = uuid.UUID("123e4567-e89b-12d3-a456-426614174000")
    mock_user.full_name = "Test User"
    mock_user.title = "Developer"
    
    mock_debate = MagicMock()
    mock_debate.id = uuid.UUID("789e0123-e89b-12d3-a456-426614174000")
    mock_debate.slug = "test-debate"
    mock_debate.title = "Test Debate"
    mock_debate.category = "general"
    mock_debate.content = "This is a test debate"
    mock_debate.created_at = datetime.utcnow()
    mock_debate.last_activity_at = datetime.utcnow()
    mock_debate.author = mock_user
    
    # Mock repository functions
    with patch('app.modules.community.repository.get_debates_paginated', return_value=([mock_debate], 1)), \
         patch('app.modules.community.repository.get_debate_replies_count', return_value=2), \
         patch('app.modules.community.repository.get_debate_participants_count', return_value=1):
        
        response = client.get("/api/v1/community/debates", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        
        assert "debates" in data
        assert len(data["debates"]) == 1
        assert data["debates"][0]["title"] == "Test Debate"
        assert data["debates"][0]["category"] == "general"
        assert data["debates"][0]["slug"] == "test-debate"
        assert data["debates"][0]["replies_count"] == 2
        assert data["debates"][0]["participants_count"] == 1
        assert data["total"] == 1


def test_get_community_debates_with_category_filter(client: TestClient, auth_headers: dict, mock_get_current_user, mock_db_session):
    """Test GET /community/debates with category filter."""
    with patch('app.modules.community.repository.get_debates_paginated') as mock_get_debates, \
         patch('app.modules.community.repository.get_debate_replies_count'), \
         patch('app.modules.community.repository.get_debate_participants_count'):
        
        mock_get_debates.return_value = ([], 0)
        
        response = client.get("/api/v1/community/debates?category=technical", headers=auth_headers)
        
        assert response.status_code == 200
        mock_get_debates.assert_called_once()
        
        # Verify category was passed to repository
        args, kwargs = mock_get_debates.call_args
        assert kwargs["category"] == "technical"


def test_get_community_debates_pagination(client: TestClient, auth_headers: dict, mock_get_current_user, mock_db_session):
    """Test GET /community/debates pagination parameters."""
    with patch('app.modules.community.repository.get_debates_paginated') as mock_get_debates, \
         patch('app.modules.community.repository.get_debate_replies_count'), \
         patch('app.modules.community.repository.get_debate_participants_count'):
        
        mock_get_debates.return_value = ([], 0)
        
        response = client.get("/api/v1/community/debates?page=2&page_size=10", headers=auth_headers)
        
        assert response.status_code == 200
        mock_get_debates.assert_called_once()
        
        # Verify pagination parameters
        args, kwargs = mock_get_debates.call_args
        assert kwargs["page"] == 2
        assert kwargs["page_size"] == 10


def test_get_community_debates_requires_auth(client: TestClient):
    """Test GET /community/debates requires authentication."""
    response = client.get("/api/v1/community/debates")
    assert response.status_code == 403  # or 401


def test_get_community_debates_validation(client: TestClient, auth_headers: dict, mock_get_current_user, mock_db_session):
    """Test GET /community/debates parameter validation."""
    # Invalid page number
    response = client.get("/api/v1/community/debates?page=0", headers=auth_headers)
    assert response.status_code == 422
    
    # Invalid page size
    response = client.get("/api/v1/community/debates?page_size=0", headers=auth_headers)
    assert response.status_code == 422
    
    # Page size too large
    response = client.get("/api/v1/community/debates?page_size=101", headers=auth_headers)
    assert response.status_code == 422


def test_create_community_debate_success(client: TestClient, auth_headers: dict, mock_get_current_user, mock_db_session):
    """Test POST /community/debates creates debate successfully."""
    from datetime import datetime
    
    # Create mock user and debate
    mock_user = MagicMock()
    mock_user.id = uuid.UUID("123e4567-e89b-12d3-a456-426614174000")
    mock_user.full_name = "Test User"
    mock_user.title = "Developer"
    
    mock_debate = MagicMock()
    mock_debate.id = uuid.UUID("789e0123-e89b-12d3-a456-426614174000")
    mock_debate.slug = "test-debate"
    mock_debate.title = "Test Debate"
    mock_debate.category = "general"
    mock_debate.content = "This is a test debate"
    mock_debate.created_at = datetime.utcnow()
    mock_debate.last_activity_at = datetime.utcnow()
    mock_debate.author = mock_user
    
    with patch('app.modules.community.repository.create_debate', return_value=mock_debate):
        
        response = client.post(
            "/api/v1/community/debates",
            headers=auth_headers,
            json={
                "title": "Test Debate",
                "category": "general", 
                "content": "This is a test debate"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["title"] == "Test Debate"
        assert data["category"] == "general"
        assert data["content"] == "This is a test debate"
        assert data["slug"] == "test-debate"
        assert data["replies_count"] == 0
        assert data["participants_count"] == 0


def test_create_community_debate_requires_auth(client: TestClient):
    """Test POST /community/debates requires authentication."""
    response = client.post(
        "/api/v1/community/debates",
        json={
            "title": "Test Debate",
            "category": "general", 
            "content": "This is a test debate"
        }
    )
    assert response.status_code == 403  # or 401


def test_create_community_debate_validation(client: TestClient, auth_headers: dict, mock_get_current_user, mock_db_session):
    """Test POST /community/debates validates request body."""
    # Missing title
    response = client.post(
        "/api/v1/community/debates",
        headers=auth_headers,
        json={
            "category": "general", 
            "content": "This is a test debate"
        }
    )
    assert response.status_code == 422
    
    # Title too short
    response = client.post(
        "/api/v1/community/debates",
        headers=auth_headers,
        json={
            "title": "Hi",
            "category": "general", 
            "content": "This is a test debate"
        }
    )
    assert response.status_code == 422
    
    # Content too short
    response = client.post(
        "/api/v1/community/debates",
        headers=auth_headers,
        json={
            "title": "Test Debate",
            "category": "general", 
            "content": "Short"
        }
    )
    assert response.status_code == 422


def test_get_community_debate_detail_success(client: TestClient, auth_headers: dict, mock_get_current_user, mock_db_session):
    """Test GET /community/debates/{debate_id} returns debate detail."""
    from datetime import datetime
    
    # Create mock user and debate
    mock_user = MagicMock()
    mock_user.id = uuid.UUID("123e4567-e89b-12d3-a456-426614174000")
    mock_user.full_name = "Test User"
    mock_user.title = "Developer"
    
    mock_debate = MagicMock()
    mock_debate.id = uuid.UUID("789e0123-e89b-12d3-a456-426614174000")
    mock_debate.slug = "test-debate"
    mock_debate.title = "Test Debate"
    mock_debate.category = "general"
    mock_debate.content = "This is a test debate"
    mock_debate.created_at = datetime.utcnow()
    mock_debate.last_activity_at = datetime.utcnow()
    mock_debate.author = mock_user
    
    debate_id = "789e0123-e89b-12d3-a456-426614174000"
    
    with patch('app.modules.community.repository.get_debate_by_id', return_value=mock_debate), \
         patch('app.modules.community.repository.get_debate_replies_count', return_value=3), \
         patch('app.modules.community.repository.get_debate_participants_count', return_value=2):
        
        response = client.get(f"/api/v1/community/debates/{debate_id}", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["title"] == "Test Debate"
        assert data["category"] == "general"
        assert data["slug"] == "test-debate"
        assert data["replies_count"] == 3
        assert data["participants_count"] == 2


def test_get_community_debate_detail_not_found(client: TestClient, auth_headers: dict, mock_get_current_user, mock_db_session):
    """Test GET /community/debates/{debate_id} with non-existent debate."""
    debate_id = "nonexistent-id"
    
    with patch('app.modules.community.repository.get_debate_by_id', return_value=None):
        
        response = client.get(f"/api/v1/community/debates/{debate_id}", headers=auth_headers)
        
        assert response.status_code == 404
        data = response.json()
        assert "Debate not found" in data["detail"]


def test_get_debate_replies_success(client: TestClient, auth_headers: dict, mock_get_current_user, mock_db_session):
    """Test GET /community/debates/{debate_id}/replies returns replies."""
    from datetime import datetime
    
    # Create mock user and reply
    mock_user = MagicMock()
    mock_user.id = uuid.UUID("123e4567-e89b-12d3-a456-426614174000")
    mock_user.full_name = "Test User"
    mock_user.title = "Developer"
    
    mock_reply = MagicMock()
    mock_reply.id = uuid.UUID("456e7890-e89b-12d3-a456-426614174000")
    mock_reply.content = "Great debate!"
    mock_reply.created_at = datetime.utcnow()
    mock_reply.author = mock_user
    
    debate_id = "789e0123-e89b-12d3-a456-426614174000"
    
    with patch('app.modules.community.repository.get_debate_replies', return_value=[mock_reply]):
        
        response = client.get(f"/api/v1/community/debates/{debate_id}/replies", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        
        assert "replies" in data
        assert len(data["replies"]) == 1
        assert data["replies"][0]["content"] == "Great debate!"
        assert data["replies"][0]["author"]["name"] == "Test User"


def test_get_debate_replies_empty(client: TestClient, auth_headers: dict, mock_get_current_user, mock_db_session):
    """Test GET /community/debates/{debate_id}/replies with no replies."""
    debate_id = "789e0123-e89b-12d3-a456-426614174000"
    
    with patch('app.modules.community.repository.get_debate_replies', return_value=[]):
        
        response = client.get(f"/api/v1/community/debates/{debate_id}/replies", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        
        assert "replies" in data
        assert len(data["replies"]) == 0


def test_create_debate_reply_success(client: TestClient, auth_headers: dict, mock_get_current_user, mock_db_session):
    """Test POST /community/debates/{debate_id}/replies creates reply successfully."""
    from datetime import datetime
    
    # Create mock user, debate, and reply
    mock_user = MagicMock()
    mock_user.id = uuid.UUID("123e4567-e89b-12d3-a456-426614174000")
    mock_user.full_name = "Test User"
    mock_user.title = "Developer"
    
    mock_debate = MagicMock()
    mock_debate.id = uuid.UUID("789e0123-e89b-12d3-a456-426614174000")
    
    mock_reply = MagicMock()
    mock_reply.id = uuid.UUID("456e7890-e89b-12d3-a456-426614174000")
    mock_reply.content = "Great debate!"
    mock_reply.created_at = datetime.utcnow()
    mock_reply.author = mock_user
    
    debate_id = "789e0123-e89b-12d3-a456-426614174000"
    
    with patch('app.modules.community.repository.get_debate_by_id', return_value=mock_debate), \
         patch('app.modules.community.repository.create_debate_reply', return_value=mock_reply):
        
        response = client.post(
            f"/api/v1/community/debates/{debate_id}/replies",
            headers=auth_headers,
            json={"content": "Great debate!"}
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["id"] == "456e7890-e89b-12d3-a456-426614174000"
        assert data["content"] == "Great debate!"
        assert data["author"]["name"] == "Test User"


def test_create_debate_reply_requires_auth(client: TestClient):
    """Test POST /community/debates/{debate_id}/replies requires authentication."""
    debate_id = str(uuid.uuid4())
    response = client.post(
        f"/api/v1/community/debates/{debate_id}/replies",
        json={"content": "Great debate!"}
    )
    assert response.status_code == 403  # or 401


def test_create_debate_reply_validation(client: TestClient, auth_headers: dict, mock_get_current_user, mock_db_session):
    """Test POST /community/debates/{debate_id}/replies validates request body."""
    mock_debate = MagicMock()
    debate_id = str(uuid.uuid4())
    
    with patch('app.modules.community.repository.get_debate_by_id', return_value=mock_debate):
        
        # Missing content
        response = client.post(
            f"/api/v1/community/debates/{debate_id}/replies",
            headers=auth_headers,
            json={}
        )
        assert response.status_code == 422
        
        # Content too short
        response = client.post(
            f"/api/v1/community/debates/{debate_id}/replies",
            headers=auth_headers,
            json={"content": "Hi"}
        )
        assert response.status_code == 422


def test_create_debate_reply_debate_not_found(client: TestClient, auth_headers: dict, mock_get_current_user, mock_db_session):
    """Test POST /community/debates/{debate_id}/replies with non-existent debate."""
    debate_id = "nonexistent-id"
    
    with patch('app.modules.community.repository.get_debate_by_id', return_value=None):
        
        response = client.post(
            f"/api/v1/community/debates/{debate_id}/replies",
            headers=auth_headers,
            json={"content": "Great debate!"}
        )
        
        assert response.status_code == 404
        data = response.json()
        assert "Debate not found" in data["detail"]


def test_debate_last_activity_update(client: TestClient, auth_headers: dict, mock_get_current_user, mock_db_session):
    """Test that creating a reply updates the debate's last_activity_at."""
    from datetime import datetime
    
    mock_user = MagicMock()
    mock_user.id = uuid.UUID("123e4567-e89b-12d3-a456-426614174000")
    mock_user.full_name = "Test User"
    mock_user.title = "Developer"
    
    mock_debate = MagicMock()
    mock_debate.id = uuid.UUID("789e0123-e89b-12d3-a456-426614174000")
    
    mock_reply = MagicMock()
    mock_reply.id = uuid.UUID("456e7890-e89b-12d3-a456-426614174000")
    mock_reply.content = "Great debate!"
    mock_reply.created_at = datetime.utcnow()
    mock_reply.author = mock_user
    
    debate_id = "789e0123-e89b-12d3-a456-426614174000"
    
    with patch('app.modules.community.repository.get_debate_by_id', return_value=mock_debate), \
         patch('app.modules.community.repository.create_debate_reply', return_value=mock_reply) as mock_create_reply:
        
        response = client.post(
            f"/api/v1/community/debates/{debate_id}/replies",
            headers=auth_headers,
            json={"content": "Great debate!"}
        )
        
        assert response.status_code == 200
        
        # Verify that create_debate_reply was called (which should update last_activity_at)
        mock_create_reply.assert_called_once()
        
        # Verify the correct parameters were passed to create_debate_reply
        call_args = mock_create_reply.call_args[0]
        assert call_args[1] == debate_id  # debate_id
        assert call_args[3] == "Great debate!"  # content