"""Integration test fixtures with mocks for deterministic testing.

This module provides mock fixtures for PostgreSQL and OpenAI services,
allowing integration tests to run without live external dependencies.
"""

import json
from typing import Any
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from pg_mcp.config.settings import DatabaseConfig, OpenAIConfig, ValidationConfig
from pg_mcp.models.schema import ColumnInfo, DatabaseSchema, TableInfo


@pytest.fixture
def mock_db_pool():
    """Mock AsyncPG connection pool."""
    pool = AsyncMock()

    # Mock connection
    conn = AsyncMock()

    # Mock query results for schema introspection
    conn.fetch = AsyncMock(return_value=[
        {
            "table_schema": "public",
            "table_name": "users",
            "table_comment": "User accounts",
        },
        {
            "table_schema": "public",
            "table_name": "orders",
            "table_comment": "Customer orders",
        },
    ])

    # Mock pool methods
    pool.acquire = AsyncMock(return_value=conn)
    pool.__aenter__ = AsyncMock(return_value=conn)
    pool.__aexit__ = AsyncMock(return_value=None)
    pool.get_size = MagicMock(return_value=10)
    pool.get_idle_size = MagicMock(return_value=7)
    pool.get_min_size = MagicMock(return_value=5)
    pool.get_max_size = MagicMock(return_value=20)

    # Connection context manager
    conn.__aenter__ = AsyncMock(return_value=conn)
    conn.__aexit__ = AsyncMock(return_value=None)

    return pool


@pytest.fixture
def mock_db_connection(mock_db_pool):
    """Mock database connection from pool."""
    return mock_db_pool.acquire.return_value


@pytest.fixture
def test_database_schema():
    """Test database schema fixture."""
    return DatabaseSchema(
        database_name="test_db",
        version="16.0",
        tables=[
            TableInfo(
                schema_name="public",
                table_name="users",
                columns=[
                    ColumnInfo(
                        name="id",
                        data_type="integer",
                        is_nullable=False,
                        is_primary_key=True,
                    ),
                    ColumnInfo(
                        name="email",
                        data_type="varchar(255)",
                        is_nullable=False,
                        is_unique=True,
                    ),
                    ColumnInfo(
                        name="name",
                        data_type="varchar(100)",
                        is_nullable=False,
                    ),
                    ColumnInfo(
                        name="created_at",
                        data_type="timestamp",
                        is_nullable=False,
                        default_value="now()",
                    ),
                    ColumnInfo(
                        name="status",
                        data_type="varchar(20)",
                        is_nullable=False,
                        default_value="'active'",
                    ),
                ],
                comment="User accounts",
            ),
            TableInfo(
                schema_name="public",
                table_name="orders",
                columns=[
                    ColumnInfo(
                        name="id",
                        data_type="integer",
                        is_nullable=False,
                        is_primary_key=True,
                    ),
                    ColumnInfo(
                        name="user_id",
                        data_type="integer",
                        is_nullable=False,
                    ),
                    ColumnInfo(
                        name="total",
                        data_type="numeric(10,2)",
                        is_nullable=False,
                    ),
                    ColumnInfo(
                        name="status",
                        data_type="varchar(20)",
                        is_nullable=False,
                    ),
                    ColumnInfo(
                        name="created_at",
                        data_type="timestamp",
                        is_nullable=False,
                        default_value="now()",
                    ),
                ],
                comment="Customer orders",
            ),
        ],
    )


@pytest.fixture
def mock_openai_client():
    """Mock OpenAI client for SQL generation and validation."""
    client = AsyncMock()

    # Default SQL generation response
    sql_response = MagicMock()
    sql_choice = MagicMock()
    sql_message = MagicMock()
    sql_message.content = "SELECT COUNT(*) FROM users"
    sql_choice.message = sql_message
    sql_response.choices = [sql_choice]
    sql_response.usage = MagicMock(total_tokens=150)

    # Default validation response
    validation_response = MagicMock()
    validation_choice = MagicMock()
    validation_message = MagicMock()
    validation_message.content = json.dumps({
        "confidence": 90,
        "explanation": "Query correctly answers the question",
        "suggestion": None,
    })
    validation_choice.message = validation_message
    validation_response.choices = [validation_choice]

    # Configure mock to return different responses based on messages
    async def create_completion(**kwargs):
        messages = kwargs.get("messages", [])
        if any("validate" in str(msg).lower() for msg in messages):
            return validation_response
        return sql_response

    client.chat.completions.create = AsyncMock(side_effect=create_completion)

    return client


@pytest.fixture
def mock_query_results():
    """Mock query result data."""
    return {
        "columns": ["count"],
        "rows": [{"count": 42}],
        "row_count": 1,
        "execution_time_ms": 15.5,
    }


@pytest.fixture
def mock_schema_cache(test_database_schema):
    """Mock schema cache."""
    cache = AsyncMock()
    cache.get = AsyncMock(return_value=test_database_schema)
    cache.load = AsyncMock(return_value=test_database_schema)
    cache.get_cache_age = MagicMock(return_value=None)
    return cache


@pytest.fixture
async def mock_query_orchestrator():
    """Mock QueryOrchestrator for integration tests."""
    from pg_mcp.models.query import QueryResponse, QueryResult

    orchestrator = AsyncMock()

    # Default successful response
    orchestrator.execute_query = AsyncMock(
        return_value=QueryResponse(
            success=True,
            generated_sql="SELECT COUNT(*) FROM users",
            data=QueryResult(
                columns=["count"],
                rows=[{"count": 42}],
                row_count=1,
                execution_time_ms=15.5,
            ),
            confidence=90,
            tokens_used=150,
        )
    )

    return orchestrator


@pytest.fixture
def test_db_config():
    """Test database configuration."""
    return DatabaseConfig(
        host="localhost",
        port=5432,
        name="test_db",
        user="test_user",
        password="test_pass",
        min_pool_size=2,
        max_pool_size=5,
    )


@pytest.fixture
def test_openai_config():
    """Test OpenAI configuration."""
    return OpenAIConfig(
        api_key="sk-test-fake-key-12345",
        model="gpt-4o-mini",
        max_tokens=2000,
        temperature=0.0,
        timeout=30.0,
    )


@pytest.fixture
def test_validation_config():
    """Test validation configuration."""
    return ValidationConfig(
        enabled=True,
        confidence_threshold=70,
        max_question_length=10000,
        timeout_seconds=30.0,
        sample_rows=10,
    )


@pytest.fixture
def patch_db_pool_creation(mock_db_pool):
    """Patch database pool creation to return mock pool."""
    with patch("pg_mcp.db.pool.create_pool", new_callable=AsyncMock) as mock_create:
        mock_create.return_value = mock_db_pool
        yield mock_create


@pytest.fixture
def patch_openai_client(mock_openai_client):
    """Patch OpenAI client creation to return mock client."""
    with patch("pg_mcp.services.sql_generator.AsyncOpenAI") as mock_class:
        mock_class.return_value = mock_openai_client
        yield mock_openai_client


@pytest.fixture
async def integration_test_env(
    mock_db_pool,
    mock_openai_client,
    test_database_schema,
    patch_db_pool_creation,
    patch_openai_client,
):
    """Complete integration test environment with all mocks."""
    return {
        "db_pool": mock_db_pool,
        "openai_client": mock_openai_client,
        "schema": test_database_schema,
    }
